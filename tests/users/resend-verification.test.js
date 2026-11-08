const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const h = require("../helpers/harness");
const f = require("../helpers/fixtures");
const { db, mail, post, defaultUser, config, expectResponse, runCases } = h;
const { pendingUser, readyForResend, lastToken, silenceErrors, COOLDOWN, BAD_EMAIL } = f;

const MSG = config.EMAIL_VERIFICATION_MESSAGES;
const ACCEPTED = { message: MSG.RESEND_ACCEPTED };

h.useServer();

describe("POST /users/resend-verification — reenvio do email de verificação", () => {
  describe("Quando o reenvio é permitido", () => {
    it("Deve responder 200 e enviar um novo email ao endereço da conta pendente", async () => {
      const { payload } = await readyForResend();

      const res = await post("/users/resend-verification", { email: payload.email });

      expectResponse(res, { status: 200, body: ACCEPTED });
      assert.deepEqual(mail.sent.map((m) => m.to), ["teste@exemplo.com"]);
    });

    it("Deve gerar um token novo, invalidar o anterior e manter só um token por usuário", async () => {
      const { payload, token: oldToken, row } = await readyForResend();

      await post("/users/resend-verification", { email: payload.email });
      const newToken = lastToken();

      assert.notEqual(newToken, oldToken);
      assert.equal(db.tokensOf(row.user_id).length, 1);
      expectResponse(await post("/users/verify-email", { token: oldToken }), {
        status: 400,
        body: { error: MSG.INVALID_TOKEN, code: "INVALID_TOKEN" },
      });
      expectResponse(await post("/users/verify-email", { token: newToken }), {
        status: 200,
        body: { message: MSG.VERIFIED },
      });
    });

    it("Deve ignorar espaços e maiúsculas no email informado", async () => {
      await readyForResend();

      const res = await post("/users/resend-verification", { email: "  TESTE@Exemplo.COM " });

      expectResponse(res, { status: 200, body: ACCEPTED });
      assert.deepEqual(mail.sent.map((m) => m.to), ["teste@exemplo.com"]);
    });

    it("Deve enviar o email mesmo se o usuário não tem nenhum token (ex.: o envio do cadastro falhou)", async (t) => {
      silenceErrors(t);
      mail.failWith = new Error("SMTP fora do ar");
      await h.register();
      mail.failWith = null;
      db.tokens().length = 0;

      const res = await post("/users/resend-verification", { email: defaultUser.email });

      expectResponse(res, { status: 200, body: ACCEPTED });
      assert.equal(mail.sent.length, 1);
    });
  });

  describe("Intervalo mínimo entre reenvios (cooldown)", () => {
    // Quantos segundos ja passaram desde o ultimo token -> deve enviar?
    for (const [secondsAgo, shouldSend] of [
      [0, false],
      [COOLDOWN - 1, false],
      [COOLDOWN, true],
      [COOLDOWN + 1, true],
    ]) {
      it(`Deve responder 200 e ${shouldSend ? "enviar" : "não enviar"} o email quando o último token foi gerado há ${secondsAgo}s`, async () => {
        const { payload, row } = await pendingUser();
        db.ageTokens(row.user_id, secondsAgo);
        mail.sent = [];

        const res = await post("/users/resend-verification", { email: payload.email });

        expectResponse(res, { status: 200, body: ACCEPTED });
        assert.equal(mail.sent.length, shouldSend ? 1 : 0);
      });
    }

    it("Deve manter válido o token anterior durante o cooldown", async () => {
      const { payload, token } = await pendingUser();

      await post("/users/resend-verification", { email: payload.email });

      expectResponse(await post("/users/verify-email", { token }), {
        status: 200,
        body: { message: MSG.VERIFIED },
      });
    });

    it("Deve reiniciar o cooldown depois de um reenvio bem-sucedido", async () => {
      const { payload } = await readyForResend();

      await post("/users/resend-verification", { email: payload.email });
      await post("/users/resend-verification", { email: payload.email });

      assert.equal(mail.sent.length, 1);
    });
  });

  describe("Para não revelar se a conta existe", () => {
    it("Deve dar a mesma resposta para conta pendente, verificada e inexistente", async () => {
      const pending = await readyForResend({ email: "pendente@exemplo.com" });
      const verified = await readyForResend({ email: "verificado@exemplo.com" });
      db.verifyUser(verified.payload.email);

      const emails = [pending.payload.email, verified.payload.email, "fantasma@exemplo.com"];
      const responses = [];
      for (const email of emails) {
        const res = await post("/users/resend-verification", { email });
        responses.push({ status: res.status, body: res.body });
      }

      assert.deepEqual(responses, emails.map(() => ({ status: 200, body: ACCEPTED })));
    });

    it("Deve enviar email apenas para a conta pendente", async () => {
      const pending = await readyForResend({ email: "pendente@exemplo.com" });
      const verified = await readyForResend({ email: "verificado@exemplo.com" });
      db.verifyUser(verified.payload.email);

      for (const email of [pending.payload.email, verified.payload.email, "fantasma@exemplo.com"]) {
        await post("/users/resend-verification", { email });
      }

      assert.deepEqual(mail.sent.map((m) => m.to), ["pendente@exemplo.com"]);
    });
  });

  describe("Quando o email informado é inválido", () => {
    runCases("/users/resend-verification", [
      { name: "Deve responder 400 quando o email não é enviado",         send: {},                              expect: { status: 400, body: BAD_EMAIL } },
      { name: "Deve responder 400 quando o email está vazio",           send: { email: "" },                   expect: { status: 400, body: BAD_EMAIL } },
      { name: "Deve responder 400 quando o email só tem espaços",  send: { email: "   " },                expect: { status: 400, body: BAD_EMAIL } },
      { name: "Deve responder 400 quando o email não tem formato de email",     send: { email: "isso-nao-e-email" },   expect: { status: 400, body: BAD_EMAIL } },
      { name: "Deve responder 400 quando o email é um número",        send: { email: 123 },                  expect: { status: 400, body: BAD_EMAIL } },
      { name: "Deve responder 400 quando o email é nulo",            send: { email: null },                 expect: { status: 400, body: BAD_EMAIL } },
      { name: "Deve responder 400 quando o email é um array",           send: { email: ["a@b.com"] },          expect: { status: 400, body: BAD_EMAIL } },
    ]);
  });

  describe("Quando o servidor de email falha", () => {
    it("Deve responder 502 SEND_FAILED quando o servidor de email está fora do ar", async (t) => {
      silenceErrors(t);
      const { payload } = await readyForResend();
      mail.failWith = new Error("SMTP fora do ar");

      const res = await post("/users/resend-verification", { email: payload.email });

      expectResponse(res, { status: 502, body: { error: MSG.SEND_FAILED } });
    });
  });

  it("Deve responder 400 quando a requisição não tem corpo", async (t) => {
    silenceErrors(t);
    expectResponse(await h.request("POST", "/users/resend-verification"), { status: 400 });
  });
});

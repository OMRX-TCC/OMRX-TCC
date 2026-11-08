const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");

const h = require("../helpers/harness");
const f = require("../helpers/fixtures");
const { db, post, config, expectResponse, runCases } = h;
const { credentials, pendingUser, lastToken, silenceErrors, COOLDOWN } = f;

const MSG = config.EMAIL_VERIFICATION_MESSAGES;
const INVALID_TOKEN = { error: MSG.INVALID_TOKEN, code: "INVALID_TOKEN" };
const EXPIRED_TOKEN = { error: MSG.EXPIRED_TOKEN, code: "EXPIRED_TOKEN" };

h.useServer();

describe("POST /users/verify-email — confirmação de email", () => {
  describe("Quando o token é válido", () => {
    it("Deve confirmar o email e apagar o token usado", async () => {
      const { token, row } = await pendingUser();

      const res = await post("/users/verify-email", { token });

      expectResponse(res, { status: 200, body: { message: MSG.VERIFIED } });
      assert.deepEqual(
        { verified: row.user_email_verified_at instanceof Date, tokensLeft: db.tokensOf(row.user_id).length },
        { verified: true, tokensLeft: 0 }
      );
    });

    it("Deve liberar o login, que antes da verificação respondia 403", async () => {
      const { token } = await pendingUser();

      const before = await post("/users/login", credentials);
      await post("/users/verify-email", { token });
      const after = await post("/users/login", credentials);

      assert.deepEqual([before.status, after.status], [403, 200]);
    });

    it("Deve verificar apenas o usuário dono do token", async () => {
      const a = await pendingUser({ email: "a@exemplo.com" });
      const b = await pendingUser({ email: "b@exemplo.com" });

      await post("/users/verify-email", { token: a.token });

      assert.deepEqual(
        { a: !!a.row.user_email_verified_at, b: !!b.row.user_email_verified_at },
        { a: true, b: false }
      );
    });
  });

  describe("Quando o token é inválido", () => {
    beforeEach(() => pendingUser());

    runCases("/users/verify-email", [
      { name: "Deve responder 400 INVALID_TOKEN quando o token não existe", send: { token: "a".repeat(64) }, expect: { status: 400, body: INVALID_TOKEN } },
      { name: "Deve responder 400 INVALID_TOKEN quando o token não é enviado",     send: {},                        expect: { status: 400, body: INVALID_TOKEN } },
      { name: "Deve responder 400 INVALID_TOKEN quando o token está vazio",       send: { token: "" },             expect: { status: 400, body: INVALID_TOKEN } },
      { name: "Deve responder 400 INVALID_TOKEN quando o token é um número",    send: { token: 12345 },          expect: { status: 400, body: INVALID_TOKEN } },
      { name: "Deve responder 400 INVALID_TOKEN quando o token é nulo",        send: { token: null },           expect: { status: 400, body: INVALID_TOKEN } },
      { name: "Deve responder 400 INVALID_TOKEN quando o token é um objeto",      send: { token: { $ne: "" } },    expect: { status: 400, body: INVALID_TOKEN } },
      { name: "Deve responder 400 INVALID_TOKEN quando o token é um array",       send: { token: ["abc"] },        expect: { status: 400, body: INVALID_TOKEN } },
    ]);

    it("Deve responder 400 INVALID_TOKEN quando é enviado o hash salvo no banco no lugar do token", async () => {
      const [{ token_hash }] = db.tokens();

      const res = await post("/users/verify-email", { token: token_hash });

      expectResponse(res, { status: 400, body: INVALID_TOKEN });
    });

    it("Deve responder 400 INVALID_TOKEN quando o token já foi usado", async () => {
      const { token } = await pendingUser({ email: "outro@exemplo.com" });
      await post("/users/verify-email", { token });

      expectResponse(await post("/users/verify-email", { token }), { status: 400, body: INVALID_TOKEN });
    });
  });

  describe("Quando o token está expirado", () => {
    it("Deve responder 400 EXPIRED_TOKEN e manter o email como não verificado", async () => {
      const { token, row } = await pendingUser();
      db.expireTokens(row.user_id);

      const res = await post("/users/verify-email", { token });

      expectResponse(res, { status: 400, body: EXPIRED_TOKEN });
      assert.equal(row.user_email_verified_at, null);
    });

    it("Deve permitir verificar com um novo link pedido em resend-verification", async () => {
      const { token, row, payload } = await pendingUser();
      db.expireTokens(row.user_id);
      await post("/users/verify-email", { token });
      db.ageTokens(row.user_id, COOLDOWN + 1);

      await post("/users/resend-verification", { email: payload.email });
      const res = await post("/users/verify-email", { token: lastToken() });

      expectResponse(res, { status: 200, body: { message: MSG.VERIFIED } });
    });
  });

  it("Deve responder 400 quando a requisição não tem corpo", async (t) => {
    silenceErrors(t);
    expectResponse(await h.request("POST", "/users/verify-email"), { status: 400 });
  });
});

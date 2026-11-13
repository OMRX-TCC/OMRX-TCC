const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");

const h = require("../helpers/harness");
const f = require("../helpers/fixtures");
const { post, defaultUser, config, expectResponse, runCases } = h;
const { credentials, verifiedAccount, silenceErrors } = f;

const MSG = config.EMAIL_VERIFICATION_MESSAGES;
const INVALID = { error: "Email ou senha inválidos" };
const MISSING = { error: "Os campos email e senha são obrigatórios." };

h.useServer();

describe("POST /users/login — autenticação", () => {
  describe("Quando as credenciais são válidas e o email está verificado", () => {
    beforeEach(verifiedAccount);

    it("Deve responder 200 com um JWT assinado contendo o id e o email do usuário", async () => {
      const res = await post("/users/login", credentials);
      const { id, email, exp, iat } = h.jwt.verify(res.body.token, process.env.jwt_secret);

      expectResponse(res, { status: 200, body: { token: res.body.token } });
      assert.deepEqual(
        { id, email, expiresInFuture: exp > iat },
        { id: 1, email: "teste@exemplo.com", expiresInFuture: true }
      );
    });

    it("Deve aceitar o email com maiúsculas/minúsculas diferentes do cadastro", async () => {
      const res = await post("/users/login", { ...credentials, email: "TESTE@EXEMPLO.COM" });

      expectResponse(res, { status: 200, body: { token: res.body.token } });
    });
  });

  describe("Quando as credenciais são inválidas ou incompletas", () => {
    beforeEach(verifiedAccount);

    runCases("/users/login", [
      { name: "Deve responder 401 quando a senha está incorreta",    send: { ...credentials, password: "senha-errada-1" }, expect: { status: 401, body: INVALID } },
      { name: "Deve responder 401 quando o email não está cadastrado",  send: { ...credentials, email: "x@exemplo.com" },     expect: { status: 401, body: INVALID } },
      { name: "Deve responder 401 quando o email não é enviado",          send: { password: "senha12345" },                     expect: { status: 401, body: MISSING } },
      { name: "Deve responder 401 quando a senha não é enviada",          send: { email: "teste@exemplo.com" },                 expect: { status: 401, body: MISSING } },
      { name: "Deve responder 401 quando o corpo da requisição está vazio",        send: {},                                             expect: { status: 401, body: MISSING } },
      { name: "Deve responder 401 quando o email está vazio",        send: { email: "", password: "senha12345" },          expect: { status: 401, body: MISSING } },
      { name: "Deve responder 401 quando a senha está vazia",        send: { email: "teste@exemplo.com", password: "" },   expect: { status: 401, body: MISSING } },
    ]);
  });

  describe("Quando o email ainda não foi verificado", () => {
    beforeEach(() => h.register());

    it("Deve responder 403 EMAIL_NOT_VERIFIED, sem token, quando a senha está correta", async () => {
      expectResponse(await post("/users/login", credentials), {
        status: 403,
        body: { error: MSG.NOT_VERIFIED, code: "EMAIL_NOT_VERIFIED" },
      });
    });

    it("Deve responder 401 genérico, sem revelar que a conta está pendente, quando a senha está errada", async () => {
      expectResponse(await post("/users/login", { ...credentials, password: "senha-errada-1" }), {
        status: 401,
        body: INVALID,
      });
    });
  });

  describe("Quando o corpo ou os tipos dos campos são inválidos", () => {
    it("Deve responder 401 quando password não é texto", async (t) => {
      silenceErrors(t);
      await verifiedAccount();

      const res = await post("/users/login", { email: defaultUser.email, password: 12345678 });

      expectResponse(res, { status: 401 });
    });
  });
});

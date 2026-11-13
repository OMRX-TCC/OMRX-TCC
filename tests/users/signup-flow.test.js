const { describe, it } = require("node:test");

const h = require("../helpers/harness");
const f = require("../helpers/fixtures");
const { post, defaultUser, config, expectResponse } = h;
const { credentials, lastToken } = f;

const MSG = config.EMAIL_VERIFICATION_MESSAGES;

h.useServer();

describe("Fluxo completo: cadastro → verificação de email → login", () => {
  it("Deve cadastrar, bloquear o login até verificar o email e liberar o login depois da verificação", async () => {
    const created = await post("/users", defaultUser);
    expectResponse(created, {
      status: 201,
      body: { id: 1, name: "Teste", email: "teste@exemplo.com", emailSent: true },
    });

    expectResponse(await post("/users/login", credentials), {
      status: 403,
      body: { error: MSG.NOT_VERIFIED, code: "EMAIL_NOT_VERIFIED" },
    });

    expectResponse(await post("/users/verify-email", { token: lastToken() }), {
      status: 200,
      body: { message: MSG.VERIFIED },
    });

    const login = await post("/users/login", credentials);
    expectResponse(login, { status: 200, body: { token: login.body.token } });
  });
});

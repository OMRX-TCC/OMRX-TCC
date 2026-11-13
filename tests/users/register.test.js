const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");

const h = require("../helpers/harness");
const f = require("../helpers/fixtures");
const { db, mail, post, defaultUser, config, expectResponse, runCases } = h;
const { user, without, pendingUser, silenceErrors, sha256, BAD_EMAIL } = f;

const EV = config.EMAIL_VERIFICATION;
const REQUIRED = { error: "Todos os campos são obrigatórios." };

h.useServer();

describe("POST /users — cadastro de usuário", () => {
  describe("Quando os dados são válidos", () => {
    it("Deve responder 201 com os dados públicos do usuário criado", async () => {
      const res = await post("/users", defaultUser);

      expectResponse(res, {
        status: 201,
        body: { id: 1, name: "Teste", email: "teste@exemplo.com", emailSent: true },
      });
    });

    it("Deve remover espaços do nome e salvar o email em minúsculas", async () => {
      const res = await post("/users", user({ name: "  Maria Silva  ", email: "Maria@Exemplo.COM" }));

      expectResponse(res, {
        status: 201,
        body: { id: 1, name: "Maria Silva", email: "maria@exemplo.com", emailSent: true },
      });
    });

    it("Deve aceitar uma senha com exatamente 8 caracteres", async () => {
      const res = await post("/users", user({ password: "12345678", repeatPassword: "12345678" }));

      expectResponse(res, { status: 201 });
    });

    it("Deve salvar a senha como hash bcrypt e deixar o email como não verificado", async () => {
      await post("/users", defaultUser);
      const row = db.findUser(defaultUser.email);

      assert.deepEqual(
        {
          hashDiffersFromPassword: row.senha_hash !== defaultUser.password,
          hashMatches: await bcrypt.compare(defaultUser.password, row.senha_hash),
          verifiedAt: row.user_email_verified_at,
        },
        { hashDiffersFromPassword: true, hashMatches: true, verifiedAt: null }
      );
    });
  });

  describe("Envio do email de verificação", () => {
    it("Deve enviar um email ao endereço cadastrado com o link da página de verificação", async () => {
      await post("/users", defaultUser);

      const [message] = mail.sent;
      const link = message.text.match(/https?:\/\/\S+/)[0];

      assert.equal(mail.sent.length, 1);
      assert.equal(message.to, "teste@exemplo.com");
      assert.ok(link.startsWith(`http://localhost:3000${EV.VERIFY_PAGE_PATH}?token=`), link);
    });

    it("Deve salvar apenas o hash do token, com a validade definida na configuração", async () => {
      const { token, row } = await pendingUser();
      const [stored] = db.tokensOf(row.user_id);

      assert.deepEqual(
        {
          count: db.tokensOf(row.user_id).length,
          storedValue: stored.token_hash,
          tokenLength: token.length,
          validForHours: Math.round((stored.expires_at - stored.created_at) / 3600000),
        },
        {
          count: 1,
          storedValue: sha256(token),
          tokenLength: EV.TOKEN_BYTES * 2,
          validForHours: EV.EXPIRES_IN_HOURS,
        }
      );
    });

    it("Deve criar o usuário e responder emailSent:false quando o envio do email falha", async (t) => {
      silenceErrors(t);
      mail.failWith = new Error("SMTP fora do ar");

      const res = await post("/users", defaultUser);

      expectResponse(res, {
        status: 201,
        body: { id: 1, name: "Teste", email: "teste@exemplo.com", emailSent: false },
      });
      assert.ok(db.findUser(defaultUser.email));
    });
  });

  describe("Quando o email já está cadastrado", () => {
    const CONFLICT = { error: "O Email já existe!" };

    it("Deve responder 409 sem criar outro usuário nem enviar novo email", async () => {
      await post("/users", defaultUser);
      mail.sent = [];

      const res = await post("/users", user({ name: "Outra Pessoa" }));

      expectResponse(res, { status: 409, body: CONFLICT });
      assert.deepEqual({ users: db.users().length, emails: mail.sent.length }, { users: 1, emails: 0 });
    });

    it("Deve responder 409 quando o email só difere por maiúsculas/minúsculas", async () => {
      await post("/users", defaultUser);

      expectResponse(await post("/users", user({ email: "TESTE@Exemplo.com" })), {
        status: 409,
        body: CONFLICT,
      });
    });
  });

  describe("Quando os dados são inválidos", () => {
    // Cada caso: o que enviar e o dicionario esperado de volta.
    runCases("/users", [
      { name: "Deve responder 400 quando o corpo da requisição está vazio",            send: {},                        expect: { status: 400, body: REQUIRED } },
      { name: "Deve responder 400 quando o campo name não é enviado",               send: without("name"),           expect: { status: 400, body: REQUIRED } },
      { name: "Deve responder 400 quando o campo email não é enviado",              send: without("email"),          expect: { status: 400, body: REQUIRED } },
      { name: "Deve responder 400 quando o campo password não é enviado",           send: without("password"),       expect: { status: 400, body: REQUIRED } },
      { name: "Deve responder 400 quando o campo repeatPassword não é enviado",     send: without("repeatPassword"), expect: { status: 400, body: REQUIRED } },
      { name: "Deve responder 400 quando o campo name está vazio",             send: user({ name: "" }),        expect: { status: 400, body: REQUIRED } },
      { name: "Deve responder 400 quando o campo email está vazio",            send: user({ email: "" }),       expect: { status: 400, body: REQUIRED } },
      { name: "Deve responder 400 quando o campo password está vazio",         send: user({ password: "" }),    expect: { status: 400, body: REQUIRED } },
      { name: "Deve responder 400 quando o campo repeatPassword está vazio",   send: user({ repeatPassword: "" }), expect: { status: 400, body: REQUIRED } },

      { name: "Deve responder 400 quando o email não tem @",            send: user({ email: "semarroba" }),         expect: { status: 400, body: BAD_EMAIL } },
      { name: "Deve responder 400 quando o email não tem domínio com ponto (a@exemplo)",      send: user({ email: "a@exemplo" }),         expect: { status: 400, body: BAD_EMAIL } },
      { name: "Deve responder 400 quando o email não tem nada antes do @",      send: user({ email: "@exemplo.com" }),      expect: { status: 400, body: BAD_EMAIL } },
      { name: "Deve responder 400 quando o email tem espaço no meio", send: user({ email: "a b@exemplo.com" }), expect: { status: 400, body: BAD_EMAIL } },
      { name: "Deve responder 400 quando o email tem espaços nas pontas (o validador não faz trim)",
        send: user({ email: " teste@exemplo.com " }),                               expect: { status: 400, body: BAD_EMAIL } },

      { name: "Deve responder 400 quando a senha tem menos de 8 caracteres",
        send: user({ password: "1234567", repeatPassword: "1234567" }),
        expect: { status: 400, body: { error: "A senha deve ter ao menos 8 caracteres." } } },
      { name: "Deve responder 400 quando a confirmação de senha é diferente da senha",
        send: user({ repeatPassword: "outra-senha-123" }),
        expect: { status: 400, body: { error: "As senhas digitadas devem ser as mesmas." } } },
    ]);

    it("Não deve criar usuário nem enviar email quando a validação falha", async () => {
      await post("/users", user({ email: "invalido" }));
      await post("/users", user({ password: "123" }));

      assert.deepEqual({ users: db.users().length, emails: mail.sent.length }, { users: 0, emails: 0 });
    });
  });

  describe("Quando o corpo ou os tipos dos campos são inválidos", () => {
    it("Deve responder 400 quando a requisição não tem corpo", async (t) => {
      silenceErrors(t);
      expectResponse(await h.request("POST", "/users"), { status: 400 });
    });

    it("Deve responder 400 quando name não é texto", async (t) => {
      silenceErrors(t);
      expectResponse(await post("/users", user({ name: 123 })), { status: 400 });
    });

    it("Deve responder 400 quando password não é texto", async (t) => {
      silenceErrors(t);
      const send = user({ password: 78901234, repeatPassword: 78901234 });
      expectResponse(await post("/users", send), { status: 400 });
    });
  });
});

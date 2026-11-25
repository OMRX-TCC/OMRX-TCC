const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");

const h = require("../helpers/harness");
const { request, db, loginToken, bearer, defaultUser, expectResponse } = h;

h.useServer();

const put = (body, headers) => request("PUT", "/change", { body, headers });

describe("PUT /change — atualizacao de dados do usuario", () => {
  it("Deve responder 401 sem token de autenticacao", async () => {
    expectResponse(await put({ name: "Novo Nome" }), {
      status: 401,
      body: { error: "Token não fornecido" },
    });
  });

  it("Deve responder 400 quando nenhum campo e enviado", async () => {
    const token = await loginToken();
    expectResponse(await put({}, bearer(token)), {
      status: 400,
      body: { error: "Informe ao menos um campo para atualizar." },
    });
  });

  it("Deve responder 400 quando o nome enviado e so espacos", async () => {
    const token = await loginToken();
    expectResponse(await put({ name: "   " }, bearer(token)), {
      status: 400,
      body: { error: "Nome inválido." },
    });
  });

  it("Deve responder 400 quando o email e invalido", async () => {
    const token = await loginToken();
    expectResponse(await put({ email: "invalido" }, bearer(token)), {
      status: 400,
      body: { error: "Email inválido." },
    });
  });

  it("Deve atualizar o nome com sucesso", async () => {
    const token = await loginToken();
    const res = await put({ name: "  Maria Silva  " }, bearer(token));

    assert.equal(res.status, 200);
    assert.equal(db.users()[0].user_name, "Maria Silva");
  });

  it("Deve atualizar o email com sucesso, normalizando para minusculas", async () => {
    const token = await loginToken();
    const res = await put({ email: "Novo@Exemplo.COM" }, bearer(token));

    assert.equal(res.status, 200);
    assert.equal(db.users()[0].user_email, "novo@exemplo.com");
  });

  it("Deve permitir reenviar o proprio email sem conflito", async () => {
    const token = await loginToken();
    const res = await put({ email: defaultUser.email }, bearer(token));

    assert.equal(res.status, 200);
  });

  it("Deve responder 409 quando o email ja pertence a outra conta", async () => {
    await h.register({ email: "outra@exemplo.com" });
    const token = await loginToken();

    expectResponse(await put({ email: "outra@exemplo.com" }, bearer(token)), {
      status: 409,
      body: { error: "Esse email já está em uso por outra conta." },
    });
  });

  it("Deve responder 400 quando so a nova senha e enviada, sem senha atual nem confirmacao", async () => {
    const token = await loginToken();
    expectResponse(await put({ newPassword: "novaSenha123" }, bearer(token)), {
      status: 400,
      body: {
        error: "Para alterar a senha, informe a senha atual, a nova senha e a confirmação da nova senha.",
      },
    });
  });

  it("Deve responder 400 quando a nova senha tem menos de 8 caracteres", async () => {
    const token = await loginToken();
    expectResponse(
      await put(
        {
          currentPassword: defaultUser.password,
          newPassword: "1234567",
          confirmNewPassword: "1234567",
        },
        bearer(token)
      ),
      { status: 400, body: { error: "A nova senha deve ter ao menos 8 caracteres." } }
    );
  });

  it("Deve responder 400 quando a confirmacao da nova senha nao confere", async () => {
    const token = await loginToken();
    expectResponse(
      await put(
        {
          currentPassword: defaultUser.password,
          newPassword: "novaSenha123",
          confirmNewPassword: "outraSenha456",
        },
        bearer(token)
      ),
      { status: 400, body: { error: "A confirmação da nova senha não confere." } }
    );
  });

  it("Deve responder 401 quando a senha atual esta incorreta", async () => {
    const token = await loginToken();
    expectResponse(
      await put(
        {
          currentPassword: "senhaErrada123",
          newPassword: "novaSenha123",
          confirmNewPassword: "novaSenha123",
        },
        bearer(token)
      ),
      { status: 401, body: { error: "Senha atual incorreta." } }
    );
  });

  it("Deve resetar a verificacao de email e enviar um novo email de confirmacao quando o email muda", async () => {
    const token = await loginToken();
    const res = await put({ email: "trocado@exemplo.com" }, bearer(token));

    assert.equal(res.status, 200);
    assert.equal(res.body.emailSent, true);
    assert.equal(db.users()[0].user_email_verified_at, null);

    const lastMail = h.mail.sent[h.mail.sent.length - 1];
    assert.equal(lastMail.to, "trocado@exemplo.com");
  });

  it("Deve invalidar o token atual quando o email muda", async () => {
    const token = await loginToken();
    await put({ email: "trocado@exemplo.com" }, bearer(token));

    expectResponse(await request("GET", "/account", { headers: bearer(token) }), {
      status: 401,
      body: { error: "Token inválido ou expirado" },
    });
  });

  it("Deve continuar invalidando o token antigo mesmo depois de confirmar o novo email", async () => {
    const token = await loginToken();
    await put({ email: "trocado@exemplo.com" }, bearer(token));
    await h.post("/users/verify-email", { token: h.extractToken(h.mail.sent.at(-1)) });

    const oldSession = await request("GET", "/account", { headers: bearer(token) });
    assert.equal(oldSession.status, 401);

    const login = await h.post("/users/login", {
      email: "trocado@exemplo.com",
      password: defaultUser.password,
    });
    const newSession = await request("GET", "/account", { headers: bearer(login.body.token) });

    assert.equal(newSession.status, 200);
    assert.equal(newSession.body.email, "trocado@exemplo.com");
  });

  it("Deve invalidar o token antigo quando o email volta ao original sem ser confirmado", async () => {
    const token = await loginToken();
    const newToken = (
      await h.post("/users/login", { email: defaultUser.email, password: defaultUser.password })
    ).body.token;

    await put({ email: "trocado@exemplo.com" }, bearer(newToken));
    db.verifyUser("trocado@exemplo.com");
    const login = await h.post("/users/login", {
      email: "trocado@exemplo.com",
      password: defaultUser.password,
    });
    await put({ email: defaultUser.email }, bearer(login.body.token));

    const res = await request("GET", "/account", { headers: bearer(token) });
    assert.equal(res.status, 401);
  });

  it("Nao deve invalidar o token quando so o nome muda", async () => {
    const token = await loginToken();
    await put({ name: "Outro Nome" }, bearer(token));

    const res = await request("GET", "/account", { headers: bearer(token) });
    assert.equal(res.status, 200);
  });

  it("Deve trocar a senha com sucesso quando os 3 campos sao validos", async () => {
    const token = await loginToken();

    const res = await put(
      {
        currentPassword: defaultUser.password,
        newPassword: "novaSenha123",
        confirmNewPassword: "novaSenha123",
      },
      bearer(token)
    );

    assert.equal(res.status, 200);

    const isNewHashValid = await bcrypt.compare("novaSenha123", db.users()[0].senha_hash);
    assert.equal(isNewHashValid, true);
  });

  it("Deve atualizar nome, email e senha ao mesmo tempo", async () => {
    const token = await loginToken();

    const res = await put(
      {
        name: "Novo Nome",
        email: "atualizado@exemplo.com",
        currentPassword: defaultUser.password,
        newPassword: "novaSenha123",
        confirmNewPassword: "novaSenha123",
      },
      bearer(token)
    );

    assert.equal(res.status, 200);
    assert.equal(db.users()[0].user_name, "Novo Nome");
    assert.equal(db.users()[0].user_email, "atualizado@exemplo.com");

    const isNewHashValid = await bcrypt.compare("novaSenha123", db.users()[0].senha_hash);
    assert.equal(isNewHashValid, true);
  });

  it("Nao deve alterar nada quando a validacao falha", async () => {
    const token = await loginToken();
    await put({ email: "invalido" }, bearer(token));

    assert.equal(db.users()[0].user_name, defaultUser.name);
    assert.equal(db.users()[0].user_email, defaultUser.email);
  });
});
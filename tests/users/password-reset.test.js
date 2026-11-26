const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const h = require("../helpers/harness");
const { request, db, loginToken, defaultUser, expectResponse } = h;

h.useServer();

const forgot = (body) => request("POST", "/forgot-password", { body });
const reset = (body) => request("POST", "/reset-password", { body });

function extractToken(mail) {
  const match = mail.text.match(/token=([a-f0-9]+)/);
  return match && match[1];
}

describe("POST /forgot-password — solicitacao de redefinicao de senha", () => {
  it("Deve responder 200 e enviar um email quando a conta existe", async () => {
    await loginToken();

    const res = await forgot({ email: defaultUser.email });

    expectResponse(res, {
      status: 200,
      body: {
        message:
          "Se houver uma conta cadastrada com esse e-mail, enviaremos um link para redefinir a senha.",
      },
    });

    const lastMail = h.mail.sent[h.mail.sent.length - 1];
    assert.equal(lastMail.to, defaultUser.email);
  });

  it("Deve responder 200 e nao revelar quando a conta nao existe", async () => {
    const before = h.mail.sent.length;

    const res = await forgot({ email: "naoexiste@exemplo.com" });

    expectResponse(res, {
      status: 200,
      body: {
        message:
          "Se houver uma conta cadastrada com esse e-mail, enviaremos um link para redefinir a senha.",
      },
    });

    assert.equal(h.mail.sent.length, before);
  });

  it("Deve ignorar espacos e maiusculas no email informado", async () => {
    await loginToken();

    const before = h.mail.sent.length;
    const res = await forgot({ email: `  ${defaultUser.email.toUpperCase()}  ` });

    assert.equal(res.status, 200);
    assert.equal(h.mail.sent.length, before + 1);
  });

  it("Deve responder 400 quando o email nao e enviado", async () => {
    expectResponse(await forgot({}), { status: 400, body: { error: "Informe o e-mail." } });
  });

  it("Deve responder 400 quando o email esta vazio", async () => {
    expectResponse(await forgot({ email: "" }), {
      status: 400,
      body: { error: "Informe o e-mail." },
    });
  });

  it("Deve responder 400 quando o email so tem espacos", async () => {
    expectResponse(await forgot({ email: "   " }), {
      status: 400,
      body: { error: "Informe o e-mail." },
    });
  });

  it("Deve responder 400 quando o email nao tem formato de email", async () => {
    expectResponse(await forgot({ email: "naoeemail" }), {
      status: 400,
      body: { error: "Formato de e-mail inválido." },
    });
  });
});

describe("POST /reset-password — redefinicao de senha", () => {
  it("Deve responder 400 quando o token nao e enviado", async () => {
    expectResponse(
      await reset({ newPassword: "novaSenha123", confirmNewPassword: "novaSenha123" }),
      { status: 400, body: { error: "Informe o token, a nova senha e a confirmação da nova senha." } }
    );
  });

  it("Deve responder 400 quando a nova senha nao e enviada", async () => {
    expectResponse(
      await reset({ token: "qualquercoisa", confirmNewPassword: "novaSenha123" }),
      { status: 400, body: { error: "Informe o token, a nova senha e a confirmação da nova senha." } }
    );
  });

  it("Deve responder 400 quando a confirmacao nao e enviada", async () => {
    expectResponse(
      await reset({ token: "qualquercoisa", newPassword: "novaSenha123" }),
      { status: 400, body: { error: "Informe o token, a nova senha e a confirmação da nova senha." } }
    );
  });

  it("Deve responder 400 quando a nova senha tem menos de 8 caracteres", async () => {
    expectResponse(
      await reset({ token: "qualquercoisa", newPassword: "1234567", confirmNewPassword: "1234567" }),
      { status: 400, body: { error: "A nova senha deve ter ao menos 8 caracteres." } }
    );
  });

  it("Deve responder 400 quando a confirmacao da nova senha nao confere", async () => {
    expectResponse(
      await reset({
        token: "qualquercoisa",
        newPassword: "novaSenha123",
        confirmNewPassword: "outraSenha123",
      }),
      { status: 400, body: { error: "A confirmação da nova senha não confere." } }
    );
  });

  it("Deve responder 400 INVALID_TOKEN quando o token nao existe", async () => {
    expectResponse(
      await reset({ token: "tokeninventado", newPassword: "novaSenha123", confirmNewPassword: "novaSenha123" }),
      {
        status: 400,
        body: { error: "Link de redefinição de senha inválido ou já utilizado.", code: "INVALID_TOKEN" },
      }
    );
  });

  it("Deve redefinir a senha e invalidar o token apos o uso", async () => {
    await loginToken();
    await forgot({ email: defaultUser.email });

    const lastMail = h.mail.sent[h.mail.sent.length - 1];
    const token = extractToken(lastMail);
    assert.ok(token);

    const res = await reset({ token, newPassword: "senhaNova123", confirmNewPassword: "senhaNova123" });

    expectResponse(res, {
      status: 200,
      body: { message: "Senha redefinida com sucesso! Você já pode entrar com a nova senha." },
    });

    const reuse = await reset({ token, newPassword: "outraSenha123", confirmNewPassword: "outraSenha123" });
    expectResponse(reuse, {
      status: 400,
      body: { error: "Link de redefinição de senha inválido ou já utilizado.", code: "INVALID_TOKEN" },
    });
  });

  it("Deve permitir login com a nova senha apos a redefinicao", async () => {
    await loginToken();
    await forgot({ email: defaultUser.email });

    const lastMail = h.mail.sent[h.mail.sent.length - 1];
    const token = extractToken(lastMail);

    await reset({ token, newPassword: "senhaNova123", confirmNewPassword: "senhaNova123" });

    const res = await request("POST", "/users/login", {
      body: { email: defaultUser.email, password: "senhaNova123" },
    });

    assert.equal(res.status, 200);
    assert.ok(res.body.token);
  });

  it("Deve responder 400 EXPIRED_TOKEN quando o token esta expirado", async () => {
    await loginToken();
    await forgot({ email: defaultUser.email });

    const lastMail = h.mail.sent[h.mail.sent.length - 1];
    const token = extractToken(lastMail);

    const user = db.findUser(defaultUser.email);
    db.expirePasswordResetTokens(user.user_id);

    expectResponse(
      await reset({ token, newPassword: "senhaNova123", confirmNewPassword: "senhaNova123" }),
      {
        status: 400,
        body: { error: "Este link de redefinição de senha expirou. Solicite um novo.", code: "EXPIRED_TOKEN" },
      }
    );
  });

  it("Deve gerar um novo token e invalidar o anterior ao solicitar novamente", async () => {
    await loginToken();
    await forgot({ email: defaultUser.email });
    const firstToken = extractToken(h.mail.sent[h.mail.sent.length - 1]);

    await forgot({ email: defaultUser.email });
    const secondToken = extractToken(h.mail.sent[h.mail.sent.length - 1]);

    assert.notEqual(firstToken, secondToken);

    const reuseFirst = await reset({
      token: firstToken,
      newPassword: "senhaNova123",
      confirmNewPassword: "senhaNova123",
    });
    expectResponse(reuseFirst, {
      status: 400,
      body: { error: "Link de redefinição de senha inválido ou já utilizado.", code: "INVALID_TOKEN" },
    });

    const useSecond = await reset({
      token: secondToken,
      newPassword: "senhaNova123",
      confirmNewPassword: "senhaNova123",
    });
    assert.equal(useSecond.status, 200);
  });
});
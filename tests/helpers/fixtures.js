// Atalhos e dados compartilhados entre os arquivos de teste dos dominios
// `users` e `email-verification`.

const crypto = require("node:crypto");
const h = require("./harness");

const { db, mail, defaultUser, config } = h;

const COOLDOWN = config.EMAIL_VERIFICATION.RESEND_COOLDOWN_SECONDS;

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const silenceErrors = (t) => t.mock.method(console, "error", () => {});

// defaultUser com alguns campos trocados / removidos.
const user = (changes = {}) => ({ ...defaultUser, ...changes });
const without = (field) => {
  const { [field]: _removed, ...rest } = defaultUser;
  return rest;
};

const credentials = { email: defaultUser.email, password: defaultUser.password };

// Cadastra e devolve { payload, token, row } (row = linha no banco falso).
async function pendingUser(overrides) {
  const { payload, token } = await h.register(overrides);
  return { payload, token, row: db.findUser(payload.email) };
}

// Mesmo que pendingUser, mas ja fora da janela de cooldown e com a caixa de saida limpa.
async function readyForResend(overrides) {
  const ctx = await pendingUser(overrides);
  db.ageTokens(ctx.row.user_id, COOLDOWN + 1);
  mail.sent = [];
  return ctx;
}

// Cadastra e marca o email como verificado.
async function verifiedAccount() {
  await h.register();
  db.verifyUser(defaultUser.email);
}

const lastToken = () => h.extractToken(mail.sent[mail.sent.length - 1]);

// Dicionarios de erro usados em mais de um endpoint.
const BAD_EMAIL = { error: "Email inválido." };

module.exports = {
  COOLDOWN,
  sha256,
  silenceErrors,
  user,
  without,
  credentials,
  pendingUser,
  readyForResend,
  verifiedAccount,
  lastToken,
  BAD_EMAIL,
};

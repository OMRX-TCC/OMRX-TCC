// Harness dos testes de integracao.
//
// Sobe o app Express real (rotas + middlewares + controllers + services + models)
// e substitui apenas as bordas externas:
//   - MySQL      -> banco em memoria (tests/helpers/fakeDb.js)
//   - SMTP       -> caixa de saida em memoria (`mail`)
//   - API IPQS   -> global.fetch simulado (`provider`)
//
// IMPORTANTE: este modulo precisa ser carregado ANTES de qualquer require do app.

const path = require("path");
const assert = require("node:assert/strict");
const { it, before, after, beforeEach } = require("node:test");
const jwt = require("jsonwebtoken");

const ROOT = path.join(__dirname, "..", "..");

process.env.jwt_secret = "segredo-de-teste";
process.env.jwt_expires_in = "1h";
process.env.IPQS_API_KEY = "chave-de-teste";
process.env.APP_URL = "http://localhost:3000";

const { createFakeDb } = require("./fakeDb");

const db = createFakeDb();
const mail = { sent: [], failWith: null };

function inject(relativePath, exports) {
  const file = require.resolve(path.join(ROOT, relativePath));
  require.cache[file] = { id: file, filename: file, loaded: true, exports };
}

inject("src/config/db.js", db.pool);
inject("src/providers/mailProvider.js", {
  async sendMail(message) {
    if (mail.failWith) throw mail.failWith;
    mail.sent.push(message);
    return {};
  },
});

// Evita esperas reais nos testes de retry/timeout.
const config = require(path.join(ROOT, "src/config/config.js"));
config.RETRY.INITIAL_DELAY_MS = 1;
config.URL_CHECK_PROVIDER.TIMEOUT_MS = 30;

// O cliente HTTP dos testes usa o fetch real; o app passa a usar o simulado.
const realFetch = global.fetch;
const provider = { calls: [], handler: null };

global.fetch = async (url, init) => {
  provider.calls.push({ url: String(url), init });
  if (!provider.handler) throw new Error(`fetch inesperado para ${url}`);
  return provider.handler(String(url), init);
};

const app = require(path.join(ROOT, "src/server.js"));

let server;
let baseUrl;

async function start() {
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
}

async function stop() {
  await new Promise((resolve) => server.close(resolve));
}

// Registra os hooks padrao: sobe o servidor uma vez e limpa o estado a cada teste.
// Chame no topo de cada arquivo de teste: `h.useServer();`
function useServer() {
  before(start);
  after(stop);
  beforeEach(reset);
}

function reset() {
  db.reset();
  mail.sent = [];
  mail.failWith = null;
  provider.calls = [];
  provider.handler = null;
}

// Envia uma requisicao. Sem `body`, nao envia corpo nem content-type.
// `rawBody` envia o texto como esta (para testar JSON malformado).
async function request(method, urlPath, { body, rawBody, headers = {} } = {}) {
  const init = { method, headers: { ...headers } };

  if (rawBody !== undefined) {
    init.headers["content-type"] = "application/json";
    init.body = rawBody;
  } else if (body !== undefined) {
    init.headers["content-type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  const res = await realFetch(baseUrl + urlPath, init);
  const text = await res.text();
  let json;

  try {
    json = JSON.parse(text);
  } catch {
    json = undefined;
  }

  return { status: res.status, body: json, text };
}

const post = (urlPath, body, headers) => request("POST", urlPath, { body, headers });

// --- fabricas de resposta do provedor de URLs ---
function reply(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

function replyInvalidJson(status) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      throw new SyntaxError("Unexpected token");
    },
  };
}

// Pendura ate o AbortController do app cancelar (simula timeout).
function hangUntilAborted(_url, { signal }) {
  return new Promise((_, reject) => {
    signal.addEventListener("abort", () => {
      reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
    });
  });
}

// --- helpers de usuario ---
const defaultUser = {
  name: "Teste",
  email: "teste@exemplo.com",
  password: "senha12345",
  repeatPassword: "senha12345",
};

function extractToken(message) {
  return message.text.match(/token=([0-9a-f]+)/)[1];
}

// Cadastra via API. Retorna a resposta e o token enviado por email.
async function register(overrides = {}) {
  const payload = { ...defaultUser, ...overrides };
  const res = await post("/users", payload);
  const last = mail.sent[mail.sent.length - 1];

  return { res, payload, token: last ? extractToken(last) : undefined };
}

// Cadastra, marca o email como verificado e faz login. Retorna o JWT.
async function loginToken(overrides = {}) {
  const { payload } = await register(overrides);
  db.verifyUser(payload.email);

  const res = await post("/users/login", {
    email: payload.email,
    password: payload.password,
  });

  return res.body.token;
}

const bearer = (token) => ({ authorization: `Bearer ${token}` });

// --- asserts em formato de dicionario ---

// Compara a resposta inteira com um dicionario:
//   expectResponse(res, { status: 400, body: { error: "..." } })
// Omitir `body` so confere o status.
function expectResponse(res, expected) {
  const actual = "body" in expected ? { status: res.status, body: res.body } : { status: res.status };
  assert.deepEqual(actual, expected);
}

// Gera um `it` por caso de uma tabela:
//   { name, send, expect: { status, body }, headers? }
// `path` e a rota; `send` e o corpo JSON enviado.
function runCases(path, cases) {
  for (const { name, send, headers, expect } of cases) {
    it(name, async () => {
      expectResponse(await post(path, send, headers), expect);
    });
  }
}

module.exports = {
  useServer,
  request,
  post,
  db,
  mail,
  provider,
  config,
  reply,
  replyInvalidJson,
  hangUntilAborted,
  defaultUser,
  extractToken,
  register,
  loginToken,
  bearer,
  expectResponse,
  runCases,
  jwt,
};

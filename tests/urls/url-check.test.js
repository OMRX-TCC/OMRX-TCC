const { describe, it } = require("node:test");

const h = require("../helpers/harness");
const { post, request, provider, reply, hangUntilAborted, loginToken, bearer, expectResponse } = h;

h.useServer();

function scanResult({ malicious = false, categories = [] } = {}) {
  return {
    verdicts: { overall: { malicious, categories, tags: [] } },
    page: { domain: "exemplo.com", url: "https://exemplo.com", country: "BR", ip: "1.2.3.4" },
    stats: { malicious: malicious ? 1 : 0, ipStats: [{ requests: 10 }], securePercentage: 90 },
    task: { time: "2026-01-01T00:00:00Z", success: true },
    meta: { processors: {} },
  };
}

describe("POST /urls/check — inicia verificação de URL", () => {
  it("Deve responder 401 sem token de autenticação", async () => {
    expectResponse(await post("/urls/check", { url: "https://exemplo.com" }), {
      status: 401,
      body: { error: "Token não fornecido" },
    });
  });

  it("Deve responder 400 quando o link não é enviado", async () => {
    const token = await loginToken();
    expectResponse(await post("/urls/check", {}, bearer(token)), {
      status: 400,
      body: { error: "O campo link é obrigatório." },
    });
  });

  it("Deve responder 400 quando o link é inválido", async () => {
    const token = await loginToken();
    expectResponse(await post("/urls/check", { url: "nao-e-url" }, bearer(token)), {
      status: 400,
      body: { error: "Esse link não é válido" },
    });
  });

  it("Deve responder 502 quando as credenciais do Cloudflare não estão configuradas", async () => {
    const token = await loginToken();
    const original = h.config.URL_CHECK_PROVIDER.accountId;
    h.config.URL_CHECK_PROVIDER.accountId = undefined;

    try {
      const res = await post("/urls/check", { url: "https://exemplo.com" }, bearer(token));
      expectResponse(res, {
        status: 502,
        body: { error: h.messages.URL_CHECK_MESSAGES.serviceUnavailable, code: "MISSING_ACCOUNT_ID" },
      });
    } finally {
      h.config.URL_CHECK_PROVIDER.accountId = original;
    }
  });

  it("Deve responder 202 com o scanId quando a Cloudflare aceita a submissão", async () => {
    const token = await loginToken();
    provider.handler = () => reply(200, { uuid: "scan-123" });

    const res = await post("/urls/check", { url: "https://exemplo.com" }, bearer(token));

    expectResponse(res, { status: 202, body: { scanId: "scan-123", status: "pending" } });
  });

  it("Deve responder 502 quando a Cloudflare retorna erro de API", async () => {
    const token = await loginToken();
    provider.handler = () => reply(500, { errors: [{ message: "falha interna" }] });

    const res = await post("/urls/check", { url: "https://exemplo.com" }, bearer(token));

    expectResponse(res, {
      status: 502,
      body: { error: h.messages.URL_CHECK_MESSAGES.apiError, code: "API_ERROR" },
    });
  });

  it("Deve responder 502 quando não é possível conectar à Cloudflare", async () => {
    const token = await loginToken();
    provider.handler = hangUntilAborted;

    const res = await post("/urls/check", { url: "https://exemplo.com" }, bearer(token));

    expectResponse(res, {
      status: 502,
      body: { error: h.messages.URL_CHECK_MESSAGES.networkError, code: "NETWORK_ERROR" },
    });
  });
});

describe("GET /urls/check/:scanId — resultado da verificação", () => {
  it("Deve responder 401 sem token de autenticação", async () => {
    expectResponse(await request("GET", "/urls/check/scan-123"), {
      status: 401,
      body: { error: "Token não fornecido" },
    });
  });

  it("Deve responder 200 status pending quando a Cloudflare ainda não terminou (404)", async () => {
    const token = await loginToken();
    provider.handler = () => reply(404, {});

    const res = await request("GET", "/urls/check/scan-123", { headers: bearer(token) });

    expectResponse(res, { status: 200, body: { status: "pending" } });
  });

  it("Deve responder 200 com o link seguro quando o resultado não é malicioso", async () => {
    const token = await loginToken();
    provider.handler = () => reply(200, scanResult({ malicious: false }));

    const res = await request("GET", "/urls/check/scan-123", { headers: bearer(token) });

    expectResponse(res, {
      status: 200,
      body: {
        status: "ready",
        safe: true,
        malicious: false,
        riskScore: 2,
        threat: { categories: [], tags: [], phishingType: [], maliciousRequestCount: 0 },
        domain: {
          name: "exemplo.com",
          categories: [],
          rank: null,
          country: "BR",
          ip: "1.2.3.4",
          asn: null,
          createdAt: null,
          ageDays: null,
        },
        page: { title: null, finalUrl: "https://exemplo.com", status: null, server: null },
        tls: { issuer: null, validDays: null, ageDays: null },
        stats: {
          totalLinks: null,
          uniqCountries: null,
          uniqASNs: null,
          totalRequests: 10,
          secureRequests: null,
          securePercentage: 90,
        },
        scan: { scannedAt: "2026-01-01T00:00:00Z", success: true },
        verification: "Confiável",
        message: "Nenhuma ameaça encontrada.",
      },
    });
  });

  it("Deve responder 200 com o link suspeito quando o resultado é malicioso", async () => {
    const token = await loginToken();
    provider.handler = () => reply(200, scanResult({ malicious: true, categories: ["phishing"] }));

    const res = await request("GET", "/urls/check/scan-123", { headers: bearer(token) });

    expectResponse(res, {
      status: 200,
      body: {
        status: "ready",
        safe: false,
        malicious: true,
        riskScore: 64,
        threat: { categories: ["phishing"], tags: [], phishingType: [], maliciousRequestCount: 1 },
        domain: {
          name: "exemplo.com",
          categories: [],
          rank: null,
          country: "BR",
          ip: "1.2.3.4",
          asn: null,
          createdAt: null,
          ageDays: null,
        },
        page: { title: null, finalUrl: "https://exemplo.com", status: null, server: null },
        tls: { issuer: null, validDays: null, ageDays: null },
        stats: {
          totalLinks: null,
          uniqCountries: null,
          uniqASNs: null,
          totalRequests: 10,
          secureRequests: null,
          securePercentage: 90,
        },
        scan: { scannedAt: "2026-01-01T00:00:00Z", success: true },
        verification: "Suspeito",
        message: "Possível risco: sinais de phishing.",
      },
    });
  });
});
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const h = require("../helpers/harness");
const { post, provider, reply, hangUntilAborted, loginToken, bearer, expectResponse, db } = h;

h.useServer();

function scanResult({ malicious = false, categories = [] } = {}) {
  return {
    verdicts: { overall: { malicious, categories, tags: [] } },
    page: { domain: "exemplo.com", url: "https://exemplo.com" },
    stats: { malicious: malicious ? 1 : 0, ipStats: [{ requests: 5 }], securePercentage: 100 },
    task: { time: "2026-01-01T00:00:00Z", success: true },
    meta: { processors: {} },
  };
}

describe("POST /verify — verificação completa (polling)", () => {
  it("Deve responder 401 sem token de autenticação", async () => {
    expectResponse(await post("/verify", { url: "https://exemplo.com" }), {
      status: 401,
      body: { error: "Token não fornecido" },
    });
  });

  it("Deve responder 400 quando o link é inválido", async () => {
    const token = await loginToken();
    expectResponse(await post("/verify", { url: "nao-e-url" }, bearer(token)), {
      status: 400,
      body: { error: "Esse link não é válido" },
    });
  });

  it("Deve responder 200 e salvar a verificação quando o link for seguro", async () => {
    const token = await loginToken();
    provider.handler = (url) => {
      if (url.includes("/result/")) return reply(200, scanResult({ malicious: false }));
      return reply(200, { uuid: "scan-1" });
    };

    const res = await post("/verify", { url: "https://exemplo.com" }, bearer(token));

    expectResponse(res, {
      status: 200,
      body: {
        status: "ready",
        safe: true,
        malicious: false,
        riskScore: 0,
        threat: { categories: [], tags: [], phishingType: [], maliciousRequestCount: 0 },
        domain: {
          name: "exemplo.com",
          categories: [],
          rank: null,
          country: null,
          ip: null,
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
          totalRequests: 5,
          secureRequests: null,
          securePercentage: 100,
        },
        scan: { scannedAt: "2026-01-01T00:00:00Z", success: true },
        url: "https://exemplo.com",
        verification: "Confiável",
        message: "Nenhuma ameaça encontrada.",
      },
    });

    assert.equal(db.verifications().length, 1);
    assert.equal(db.verifications()[0].status_id, 2);
    assert.equal(db.verifications()[0].threat_type_id, null);
  });

  it("Deve responder 200 e salvar a verificação quando o link for malicioso", async () => {
    const token = await loginToken();
    provider.handler = (url) => {
      if (url.includes("/result/")) return reply(200, scanResult({ malicious: true, categories: ["malware"] }));
      return reply(200, { uuid: "scan-2" });
    };

    const res = await post("/verify", { url: "https://exemplo.com" }, bearer(token));

    expectResponse(res, {
      status: 200,
      body: {
        status: "ready",
        safe: false,
        malicious: true,
        riskScore: 65,
        threat: { categories: ["malware"], tags: [], phishingType: [], maliciousRequestCount: 1 },
        domain: {
          name: "exemplo.com",
          categories: [],
          rank: null,
          country: null,
          ip: null,
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
          totalRequests: 5,
          secureRequests: null,
          securePercentage: 100,
        },
        scan: { scannedAt: "2026-01-01T00:00:00Z", success: true },
        url: "https://exemplo.com",
        verification: "Suspeito",
        message: "Possível risco: malware conhecido.",
      },
    });

    assert.equal(db.verifications().length, 1);
    assert.equal(db.verifications()[0].status_id, 3);
    assert.equal(db.verifications()[0].threat_type_id, 2);
  });

  it("Deve responder 502 quando a verificação não conclui dentro do limite de tentativas (timeout de polling)", async (t) => {
    t.mock.method(console, "error", () => {});
    const token = await loginToken();
    provider.handler = (url) => {
      if (url.includes("/result/")) return reply(404, {});
      return reply(200, { uuid: "scan-3" });
    };

    const res = await post("/verify", { url: "https://exemplo.com" }, bearer(token));

    expectResponse(res, {
      status: 502,
      body: { error: h.messages.URL_CHECK_MESSAGES.timeout, code: "TIMEOUT" },
    });
    assert.equal(db.verifications().length, 0);
  });

  it("Deve responder 502 quando a submissão inicial falha", async () => {
    const token = await loginToken();
    provider.handler = hangUntilAborted;

    const res = await post("/verify", { url: "https://exemplo.com" }, bearer(token));

    expectResponse(res, {
      status: 502,
      body: { error: h.messages.URL_CHECK_MESSAGES.networkError, code: "NETWORK_ERROR" },
    });
    assert.equal(db.verifications().length, 0);
  });
});
const BASE_URL = "https://www.ipqualityscore.com/api/json/url";
const TIMEOUT_MS = 5000;
const MAX_RETRIES = 2;

class WebRiskError extends Error {
  constructor(message, { status, code, cause } = {}) {
    super(message);
    this.name = "WebRiskError";
    this.status = status;
    this.code = code;
    if (cause) this.cause = cause;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function buildUrl(targetUrl, apiKey) {
  return `${BASE_URL}/${apiKey}/${encodeURIComponent(targetUrl)}`;
}

async function fetchOnce(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const body = await response.json().catch(() => ({}));

    if (!response.ok || body.success === false) {
      throw new WebRiskError(body.message || `Erro HTTP ${response.status}`, {
        status: response.status,
        code: "API_ERROR",
      });
    }

    return body;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new WebRiskError("Timeout ao chamar a Malicious URL Scanner API", {
        code: "TIMEOUT",
        cause: err,
      });
    }
    if (err instanceof WebRiskError) throw err;
    throw new WebRiskError("Falha de rede ao chamar a Malicious URL Scanner API", {
      code: "NETWORK_ERROR",
      cause: err,
    });
  } finally {
    clearTimeout(timer);
  }
}

function isRetryable(err) {
  return err.code === "TIMEOUT" || err.code === "NETWORK_ERROR" || err.status === 429 || err.status >= 500;
}

async function checkUrl(targetUrl) {
  const apiKey = process.env.IPQS_API_KEY;
  if (!apiKey) throw new WebRiskError("IPQS_API_KEY nao configurada", { code: "MISSING_API_KEY" });
  if (!targetUrl) throw new WebRiskError("Informe uma URL para verificar", { code: "INVALID_URL" });

  const url = buildUrl(targetUrl, apiKey);
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const body = await fetchOnce(url);
      return {
        safe: !body.unsafe,
        malware: body.malware,
        phishing: body.phishing,
        suspicious: body.suspicious,
        riskScore: body.risk_score,
      };
    } catch (err) {
      lastError = err;
      if (!isRetryable(err) || attempt === MAX_RETRIES) break;
      await sleep(500 * 2 ** attempt);
    }
  }

  throw lastError;
}

module.exports = { checkUrl, WebRiskError };
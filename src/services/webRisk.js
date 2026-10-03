const BASE_URL = "https://webrisk.googleapis.com/v1/uris:search";
const THREAT_TYPES = ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"];
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
  const params = new URLSearchParams();
  params.append("uri", targetUrl);
  THREAT_TYPES.forEach((type) => params.append("threatTypes", type));
  params.append("key", apiKey);
  return `${BASE_URL}?${params.toString()}`;
}

async function fetchOnce(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new WebRiskError(body?.error?.message || `Erro HTTP ${response.status}`, {
        status: response.status,
        code: body?.error?.status,
      });
    }

    return body;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new WebRiskError("Timeout ao chamar a Web Risk API", { code: "TIMEOUT", cause: err });
    }
    if (err instanceof WebRiskError) throw err;
    throw new WebRiskError("Falha de rede ao chamar a Web Risk API", {
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
  const apiKey = process.env.WEB_RISK_API_KEY;
  if (!apiKey) throw new WebRiskError("WEB_RISK_API_KEY não configurada", { code: "MISSING_API_KEY" });
  if (!targetUrl) throw new WebRiskError("Informe uma URL para verificar", { code: "INVALID_URL" });

  const url = buildUrl(targetUrl, apiKey);
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const body = await fetchOnce(url);
      const threats = body?.threat?.threatTypes || [];
      return { safe: threats.length === 0, threats };
    } catch (err) {
      lastError = err;
      if (!isRetryable(err) || attempt === MAX_RETRIES) break;
      await sleep(500 * 2 ** attempt);
    }
  }

  throw lastError;
}

module.exports = { checkUrl, WebRiskError };
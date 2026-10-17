const { URL_CHECK_PROVIDER } = require("../config/config");

class UrlScanError extends Error {
  constructor(message, { status, code, cause } = {}) {
    super(message);
    this.name = "UrlScanError";
    this.status = status;
    this.code = code;

    if (cause) {
      this.cause = cause;
    }
  }
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), URL_CHECK_PROVIDER.TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function submitScan(targetUrl, accountId, apiToken) {
  const apiUrl = `${URL_CHECK_PROVIDER.BASE_URL}/accounts/${accountId}/urlscanner/v2/scan`;

  let response;
  try {
    response = await fetchWithTimeout(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: targetUrl, visibility: "Public" }),
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new UrlScanError("Tempo limite ao enviar URL para escaneamento", {
        code: "TIMEOUT",
        cause: err,
      });
    }
    throw new UrlScanError("Falha de comunicacao com a API", {
      code: "NETWORK_ERROR",
      cause: err,
    });
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new UrlScanError(body?.errors?.[0]?.message || `Erro HTTP ${response.status}`, {
      status: response.status,
      code: "API_ERROR",
    });
  }

  return body.uuid;
}

async function getScanResult(uuid, accountId, apiToken) {
  const apiUrl = `${URL_CHECK_PROVIDER.BASE_URL}/accounts/${accountId}/urlscanner/v2/result/${uuid}`;

  let response;
  try {
    response = await fetchWithTimeout(apiUrl, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new UrlScanError("Tempo limite ao consultar resultado do scan", {
        code: "TIMEOUT",
        cause: err,
      });
    }
    throw new UrlScanError("Falha de comunicacao com a API", {
      code: "NETWORK_ERROR",
      cause: err,
    });
  }

  if (response.status === 404) {
    return { pending: true };
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new UrlScanError(body?.errors?.[0]?.message || `Erro HTTP ${response.status}`, {
      status: response.status,
      code: "API_ERROR",
    });
  }

  const body = await response.json();
  return { pending: false, result: body };
}

module.exports = {
  submitScan,
  getScanResult,
  UrlScanError,
};
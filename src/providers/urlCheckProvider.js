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

function buildApiUrl(path) {
  return `${URL_CHECK_PROVIDER.BASE_URL}${path}`;
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

async function requestCloudflare(url, options) {
  try {
    return await fetchWithTimeout(url, options);
  } catch (err) {
    throw new UrlScanError("Falha de comunicacao com a API", {
      code: "NETWORK_ERROR",
      cause: err,
    });
  }
}

async function throwIfError(response) {
  if (response.ok) {
    return;
  }

  const body = await response.json().catch(() => ({}));

  throw new UrlScanError(body?.errors?.[0]?.message || `Erro HTTP ${response.status}`, {
    status: response.status,
    code: "API_ERROR",
  });
}

function authHeaders(apiToken) {
  return { Authorization: `Bearer ${apiToken}` };
}

async function submitScan(targetUrl, accountId, apiToken) {
  const apiUrl = buildApiUrl(`/accounts/${accountId}/urlscanner/v2/scan`);

  const response = await requestCloudflare(apiUrl, {
    method: "POST",
    headers: {
      ...authHeaders(apiToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: targetUrl, visibility: "Public" }),
  });

  await throwIfError(response);

  const body = await response.json();
  return body.uuid;
}

async function getScanResult(uuid, accountId, apiToken) {
  const apiUrl = buildApiUrl(`/accounts/${accountId}/urlscanner/v2/result/${uuid}`);

  const response = await requestCloudflare(apiUrl, {
    headers: authHeaders(apiToken),
  });

  if (response.status === 404) {
    return { pending: true };
  }

  await throwIfError(response);

  const body = await response.json();
  return { pending: false, result: body };
}

module.exports = {
  submitScan,
  getScanResult,
  UrlScanError,
};
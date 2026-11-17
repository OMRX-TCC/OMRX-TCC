const { ERROR_CODES, URL_CHECK_PROVIDER } = require("../config");
const { URL_CHECK_MESSAGES } = require("../messages");
const { HTTP_STATUS, HttpError } = require("../utils/http");

const SCAN_NOT_READY_STATUS = 404;

function buildApiUrl(path) {
  return `${URL_CHECK_PROVIDER.baseUrl}/accounts/${URL_CHECK_PROVIDER.accountId}/urlscanner/v2${path}`;
}

async function requestCloudflare(path, { method = "GET", headers = {}, body } = {}) {
  try {
    return await fetch(buildApiUrl(path), {
      method,
      headers: { Authorization: `Bearer ${URL_CHECK_PROVIDER.apiToken}`, ...headers },
      body,
      signal: AbortSignal.timeout(URL_CHECK_PROVIDER.timeoutMs),
    });
  } catch (error) {
    throw new HttpError(URL_CHECK_MESSAGES.networkError, HTTP_STATUS.badGateway, { code: ERROR_CODES.networkError, cause: error });
  }
}

async function readErrorDetail(response) {
  const body = await response.json().catch(() => ({}));
  return body?.errors?.[0]?.message || `HTTP ${response.status}`;
}

async function throwIfFailed(response) {
  if (response.ok) return;

  const cause = new Error(await readErrorDetail(response));
  throw new HttpError(URL_CHECK_MESSAGES.apiError, HTTP_STATUS.badGateway, { code: ERROR_CODES.apiError, cause });
}

async function submitScan(url) {
  const response = await requestCloudflare("/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, visibility: "Public" }),
  });

  await throwIfFailed(response);

  const { uuid: scanId } = await response.json();
  return scanId;
}

async function getScanResult(scanId) {
  const response = await requestCloudflare(`/result/${encodeURIComponent(scanId)}`);
  if (response.status === SCAN_NOT_READY_STATUS) return { isReady: false };

  await throwIfFailed(response);

  return { isReady: true, cloudflareResult: await response.json() };
}

module.exports = { submitScan, getScanResult };

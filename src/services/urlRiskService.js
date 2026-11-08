const { submitScan, getScanResult, UrlScanError } = require("../providers/urlCheckProvider");
const { VerificationResult } = require("../entities/VerificationResult");

async function startCheck(targetUrl) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (typeof targetUrl !== "string" || !targetUrl.trim()) {
    throw new UrlScanError("Informe uma URL valida", { code: "INVALID_URL" });
  }

  const scanId = await submitScan(targetUrl.trim(), accountId, apiToken);
  return { scanId };
}

async function getCheckResult(scanId) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  const { pending, result } = await getScanResult(scanId, accountId, apiToken);

  if (pending) {
    return { status: "pending" };
  }

  return { status: "ready", ...new VerificationResult(result) };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkUrlAndWait(targetUrl) {
  const { URL_CHECK_PROVIDER } = require("../config/config");
  const { scanId } = await startCheck(targetUrl);

  for (let attempt = 0; attempt < URL_CHECK_PROVIDER.MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(URL_CHECK_PROVIDER.POLL_INTERVAL_MS);
    const resultado = await getCheckResult(scanId);
    if (resultado.status === "ready") {
      return resultado;
    }
  }

  throw new UrlScanError("O escaneamento demorou demais para concluir", { code: "TIMEOUT" });
}

module.exports = {
  startCheck,
  getCheckResult,
  checkUrlAndWait,
  UrlScanError,
};
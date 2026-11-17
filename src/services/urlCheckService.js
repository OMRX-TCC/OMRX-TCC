const { setTimeout: sleep } = require("node:timers/promises");
const { ERROR_CODES, URL_CHECK_PROVIDER } = require("../config");
const { calculateRiskScore, describeVerdict } = require("../entities/riskAnalysis");
const { createScanResult } = require("../entities/scanResult");
const { URL_CHECK_MESSAGES } = require("../messages");
const urlCheckProvider = require("../providers/urlCheckProvider");
const { HTTP_STATUS, HttpError } = require("../utils/http");

const CHECK_STATUS = {
  pending: "pending",
  ready: "ready",
};

function buildCompletedCheck(cloudflareResult) {
  const scanResult = createScanResult(cloudflareResult);

  return {
    status: CHECK_STATUS.ready,
    ...scanResult,
    riskScore: calculateRiskScore(scanResult),
    ...describeVerdict(scanResult),
  };
}

async function startCheck(url) {
  const scanId = await urlCheckProvider.submitScan(url.trim());
  return { scanId, status: CHECK_STATUS.pending };
}

async function getCheckResult(scanId) {
  const { isReady, cloudflareResult } = await urlCheckProvider.getScanResult(scanId);
  if (!isReady) return { status: CHECK_STATUS.pending };

  return buildCompletedCheck(cloudflareResult);
}

async function checkUrlAndWait(url) {
  const { scanId } = await startCheck(url);

  for (let attempt = 1; attempt <= URL_CHECK_PROVIDER.maxPollAttempts; attempt++) {
    await sleep(URL_CHECK_PROVIDER.pollIntervalMs);

    const checkResult = await getCheckResult(scanId);
    if (checkResult.status === CHECK_STATUS.ready) return checkResult;
  }

  throw new HttpError(URL_CHECK_MESSAGES.timeout, HTTP_STATUS.badGateway, { code: ERROR_CODES.timeout });
}

module.exports = { startCheck, getCheckResult, checkUrlAndWait };

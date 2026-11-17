const { classifyRiskLevel, identifyThreatType } = require("../entities/riskAnalysis");
const verificationModel = require("../models/verificationModel");
const urlCheckService = require("./urlCheckService");

async function verifyUrl({ url, userId }) {
  const checkResult = await urlCheckService.checkUrlAndWait(url);

  await verificationModel.create({
    url,
    riskLevel: classifyRiskLevel(checkResult),
    threatType: identifyThreatType(checkResult),
    userId,
  });

  return { ...checkResult, url };
}

async function getStats() {
  const { total, lastCreatedAt } = await verificationModel.getSummary();
  return { totalVerifications: total, lastUpdatedAt: lastCreatedAt };
}

module.exports = { verifyUrl, getStats };

const { THREAT_DESCRIPTIONS, VERDICT_MESSAGES } = require("../messages");

const RISK_LEVELS = {
  safe: "safe",
  suspicious: "suspicious",
  dangerous: "dangerous",
};

const THREAT_TYPES = {
  scam: "scam",
  malware: "malware",
  phishing: "phishing",
};

const MALICIOUS_VERDICT_WEIGHT = 60;
const MALICIOUS_REQUESTS_WEIGHT = 25;
const INSECURE_REQUESTS_WEIGHT = 15;
const MAX_RISK_SCORE = 100;
const DANGEROUS_RISK_SCORE = 70;

const toLowerCase = (text) => text.toLowerCase();

function getMaliciousRequestRatio({ threat, stats }) {
  return stats.totalRequests > 0 ? threat.maliciousRequestCount / stats.totalRequests : 0;
}

function getInsecureRequestRatio({ stats }) {
  return typeof stats.securePercentage === "number" ? (100 - stats.securePercentage) / 100 : 0;
}

function calculateRiskScore(scanResult) {
  const riskScore =
    (scanResult.malicious ? MALICIOUS_VERDICT_WEIGHT : 0) +
    getMaliciousRequestRatio(scanResult) * MALICIOUS_REQUESTS_WEIGHT +
    getInsecureRequestRatio(scanResult) * INSECURE_REQUESTS_WEIGHT;

  return Math.round(Math.min(riskScore, MAX_RISK_SCORE));
}

function describeThreats(categories) {
  const descriptions = categories
    .map(toLowerCase)
    .filter((category) => Object.hasOwn(THREAT_DESCRIPTIONS, category))
    .map((category) => THREAT_DESCRIPTIONS[category]);

  if (descriptions.length > 0) return descriptions.join(", ");
  if (categories.length > 0) return categories.join(", ");
  return VERDICT_MESSAGES.unspecifiedThreat;
}

function describeVerdict({ malicious, threat }) {
  if (!malicious) {
    return { verification: VERDICT_MESSAGES.safe, message: VERDICT_MESSAGES.noThreatsFound };
  }

  return {
    verification: VERDICT_MESSAGES.suspicious,
    message: VERDICT_MESSAGES.possibleRisk(describeThreats(threat.categories)),
  };
}

function classifyRiskLevel({ malicious, riskScore }) {
  if (!malicious) return RISK_LEVELS.safe;
  return riskScore >= DANGEROUS_RISK_SCORE ? RISK_LEVELS.dangerous : RISK_LEVELS.suspicious;
}

function identifyThreatType({ malicious, threat }) {
  if (!malicious) return null;

  const categories = threat.categories.map(toLowerCase);

  if (categories.includes(THREAT_TYPES.malware)) return THREAT_TYPES.malware;
  if (categories.includes(THREAT_TYPES.phishing)) return THREAT_TYPES.phishing;
  return THREAT_TYPES.scam;
}

module.exports = {
  RISK_LEVELS,
  THREAT_TYPES,
  calculateRiskScore,
  describeVerdict,
  classifyRiskLevel,
  identifyThreatType,
};

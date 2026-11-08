const { THREAT_MESSAGES } = require("../config/config");

function translateThreatTypes(categories) {
  const list = categories || [];

  const messages = list
    .map((c) => THREAT_MESSAGES[c.toLowerCase()])
    .filter(Boolean);

  if (messages.length > 0) {
    return messages.join(", ");
  }

  if (list.length > 0) {
    return list.join(", ");
  }

  return "Ameaça não especificada";
}

function toVerificationStatus(checkResult) {
  if (!checkResult || checkResult.status !== "ready") {
    return { status: "pending" };
  }

  if (!checkResult.malicious) {
    return {
      status: "ready",
      verification: "Confiável",
      message: "Nenhuma ameaça encontrada.",
    };
  }

  return {
    status: "ready",
    verification: "Suspeito",
    message: `Possível risco: ${translateThreatTypes(checkResult.threat?.categories)}.`,
  };
}

module.exports = { toVerificationStatus };
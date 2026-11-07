const urlRiskService = require("../services/urlRiskService");
const { toVerificationStatus } = require("../services/verificationStatus");
const { ERROR_MESSAGES } = require("../config/config");
const verificationModel = require("../models/verification");

const STATUS_IDS = { SEGURO: 2, SUSPEITO: 3, PERIGOSO: 4 };
const THREAT_TYPE_IDS = { SCAM: 1, MALWARE: 2, PHISHING: 3 };

function resolveStatusId(resultado) {
  if (!resultado.malicious) return STATUS_IDS.SEGURO;
  return resultado.riskScore >= 70 ? STATUS_IDS.PERIGOSO : STATUS_IDS.SUSPEITO;
}

function resolveThreatTypeId(resultado) {
  if (!resultado.malicious) return null;
  const categories = (resultado.threat?.categories || []).map((c) => c.toLowerCase());
  if (categories.includes("malware")) return THREAT_TYPE_IDS.MALWARE;
  if (categories.includes("phishing")) return THREAT_TYPE_IDS.PHISHING;
  return THREAT_TYPE_IDS.SCAM;
}

async function verify(req, res) {
  try {
    const resultado = await urlRiskService.checkUrlAndWait(req.body.url);
    const verification = toVerificationStatus(resultado);

    await verificationModel.create({
      url: req.body.url,
      statusId: resolveStatusId(resultado),
      threatTypeId: resolveThreatTypeId(resultado),
      userId: req.auth?.id ?? null,
    });

    return res.status(200).json({
      ...resultado,
      url: req.body.url,
      verification: verification.verification,
      message: verification.message,
    });
  } catch (err) {
    if (err instanceof urlRiskService.UrlScanError) {
      const mensagem = ERROR_MESSAGES[err.code] || "Nao foi possivel verificar esse link agora.";
      return res.status(err.status || 502).json({ error: mensagem, code: err.code });
    }
    return res.status(500).json({ error: "Erro inesperado ao verificar o link." });
  }
}

module.exports = { verify };
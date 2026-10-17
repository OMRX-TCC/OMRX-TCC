const urlRiskService = require("../services/urlRiskService");
const { ERROR_MESSAGES } = require("../config/config");

function handleError(res, err) {
  if (err instanceof urlRiskService.UrlScanError) {
    const mensagem = ERROR_MESSAGES[err.code] || "Nao foi possivel verificar esse link agora.";
    return res.status(err.status || 502).json({ error: mensagem, code: err.code });
  }
  return res.status(500).json({ error: "Erro inesperado ao verificar o link." });
}

async function start(req, res) {
  try {
    const { scanId } = await urlRiskService.startCheck(req.body.url);
    return res.status(202).json({ scanId, status: "pending" });
  } catch (err) {
    return handleError(res, err);
  }
}

async function result(req, res) {
  try {
    const resultado = await urlRiskService.getCheckResult(req.params.scanId);
    return res.status(200).json(resultado);
  } catch (err) {
    return handleError(res, err);
  }
}

module.exports = { start, result };
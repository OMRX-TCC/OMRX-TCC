const webRiskService = require("../services/webRisk");

const ERROR_MESSAGES = {
  MISSING_API_KEY: "Servico de verificacao indisponivel no momento. Tente novamente mais tarde.",
  INVALID_URL: "Informe um link valido para verificar.",
  TIMEOUT: "A verificacao demorou demais. Tente novamente.",
  NETWORK_ERROR: "Nao foi possivel conectar ao servico de verificacao. Tente novamente.",
  API_ERROR: "Nao foi possivel verificar esse link agora. Tente novamente mais tarde.",
};

async function check(req, res) {
  try {
    const resultado = await webRiskService.checkUrl(req.body.url);
    return res.status(200).json(resultado);
  } catch (err) {
    if (err instanceof webRiskService.WebRiskError) {
      const mensagem = ERROR_MESSAGES[err.code] || "Nao foi possivel verificar esse link agora.";
      return res.status(err.status || 502).json({ error: mensagem, code: err.code });
    }
    return res.status(500).json({ error: "Erro inesperado ao verificar o link." });
  }
}

module.exports = { check };
const verificationService = require("../services/verificationService");
const { HTTP_STATUS } = require("../utils/http");

async function verifyUrl(req, res) {
  const verification = await verificationService.verifyUrl({ url: req.body.url, userId: req.user.id });

  res.status(HTTP_STATUS.ok).json(verification);
}

async function getStats(_req, res) {
  const stats = await verificationService.getStats();

  res.status(HTTP_STATUS.ok).json(stats);
}

module.exports = { verifyUrl, getStats };

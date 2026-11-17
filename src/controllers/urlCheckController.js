const urlCheckService = require("../services/urlCheckService");
const { HTTP_STATUS } = require("../utils/http");

async function startCheck(req, res) {
  const check = await urlCheckService.startCheck(req.body.url);

  res.status(HTTP_STATUS.accepted).json(check);
}

async function getCheckResult(req, res) {
  const checkResult = await urlCheckService.getCheckResult(req.params.scanId);

  res.status(HTTP_STATUS.ok).json(checkResult);
}

module.exports = { startCheck, getCheckResult };

const { ERROR_MESSAGES } = require("../config/config");

function urlCheckCredentialsMiddleware(req, res, next) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId) {
    return res.status(502).json({
      error: ERROR_MESSAGES.MISSING_ACCOUNT_ID,
      code: "MISSING_ACCOUNT_ID",
    });
  }

  if (!apiToken) {
    return res.status(502).json({
      error: ERROR_MESSAGES.MISSING_API_KEY,
      code: "MISSING_API_KEY",
    });
  }

  next();
}

module.exports = { urlCheckCredentialsMiddleware };
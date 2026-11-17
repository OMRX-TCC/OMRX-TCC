const { ERROR_CODES, URL_CHECK_PROVIDER } = require("../config");
const { URL_CHECK_MESSAGES } = require("../messages");
const { HTTP_STATUS, HttpError } = require("../utils/http");

function throwServiceUnavailable(code) {
  throw new HttpError(URL_CHECK_MESSAGES.serviceUnavailable, HTTP_STATUS.badGateway, { code });
}

function requireUrlCheckCredentials(_req, _res, next) {
  if (!URL_CHECK_PROVIDER.accountId) throwServiceUnavailable(ERROR_CODES.missingAccountId);
  if (!URL_CHECK_PROVIDER.apiToken) throwServiceUnavailable(ERROR_CODES.missingApiKey);

  next();
}

module.exports = { requireUrlCheckCredentials };

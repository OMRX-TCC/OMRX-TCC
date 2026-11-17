const { AUTH_MESSAGES } = require("../messages");
const { HTTP_STATUS, HttpError } = require("../utils/http");
const { verifyAccessToken } = require("../utils/jwt");

function getBearerToken(authorizationHeader) {
  const [, token] = authorizationHeader.split(" ");
  return token;
}

function decodeAccessToken(token) {
  try {
    return verifyAccessToken(token);
  } catch {
    throw new HttpError(AUTH_MESSAGES.tokenInvalid, HTTP_STATUS.unauthorized);
  }
}

function authenticate(req, _res, next) {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) throw new HttpError(AUTH_MESSAGES.tokenMissing, HTTP_STATUS.unauthorized);

  req.user = decodeAccessToken(getBearerToken(authorizationHeader));
  next();
}

module.exports = { authenticate };

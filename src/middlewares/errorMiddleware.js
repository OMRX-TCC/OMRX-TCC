const { SERVER_MESSAGES } = require("../messages");
const { HTTP_STATUS, HttpError } = require("../utils/http");

function buildErrorBody(message, code) {
  return code ? { error: message, code } : { error: message };
}

function isClientRequestError(error) {
  return error.expose === true && Number.isInteger(error.status);
}

function handleError(error, _req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof HttpError) {
    return res.status(error.status).json(buildErrorBody(error.message, error.code));
  }

  if (isClientRequestError(error)) {
    return res.status(error.status).json(buildErrorBody(SERVER_MESSAGES.invalidRequest));
  }

  console.error(error);
  return res.status(HTTP_STATUS.internalServerError).json(buildErrorBody(SERVER_MESSAGES.internalError));
}

module.exports = { handleError };

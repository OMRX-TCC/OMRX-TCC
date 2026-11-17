const { HTTP_STATUS, HttpError } = require("../utils/http");

function validateBody(validator, { status = HTTP_STATUS.badRequest, code } = {}) {
  return function validateRequestBody(req, _res, next) {
    const errorMessage = validator.getFirstError(req.body ?? {});
    if (errorMessage) throw new HttpError(errorMessage, status, { code });

    next();
  };
}

module.exports = { validateBody };

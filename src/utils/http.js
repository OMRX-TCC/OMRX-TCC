const HTTP_STATUS = {
  ok: 200,
  created: 201,
  accepted: 202,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  conflict: 409,
  internalServerError: 500,
  badGateway: 502,
};

class HttpError extends Error {
  constructor(message, status, { code, cause } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }
}

module.exports = { HTTP_STATUS, HttpError };

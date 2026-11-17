const jwt = require("jsonwebtoken");
const { JWT } = require("../config");

function signAccessToken({ id, email }) {
  return jwt.sign({ id, email }, JWT.secret, { expiresIn: JWT.expiresIn });
}

function verifyAccessToken(token) {
  const { id, email } = jwt.verify(token, JWT.secret);
  return { id, email };
}

module.exports = { signAccessToken, verifyAccessToken };

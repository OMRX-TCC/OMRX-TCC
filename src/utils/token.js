const crypto = require("crypto");

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateToken(bytes) {
  const token = crypto.randomBytes(bytes).toString("hex");

  return { token, tokenHash: hashToken(token) };
}

module.exports = {
  generateToken,
  hashToken,
};

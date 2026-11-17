const crypto = require("node:crypto");

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateToken(byteLength) {
  const token = crypto.randomBytes(byteLength).toString("hex");
  return { token, tokenHash: hashToken(token) };
}

module.exports = { generateToken, hashToken };

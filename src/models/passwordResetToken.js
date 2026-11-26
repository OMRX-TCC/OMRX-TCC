const pool = require("../config/db");

async function create({ userId, tokenHash, expiresInHours }) {
  await pool.execute(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR))`,
    [userId, tokenHash, expiresInHours]
  );
}

async function findByHash(tokenHash) {
  const [rows] = await pool.execute(
    `SELECT user_id, expires_at < NOW() AS expired
     FROM password_reset_tokens
     WHERE token_hash = ?`,
    [tokenHash]
  );

  return rows[0];
}

async function deleteByUserId(userId) {
  await pool.execute("DELETE FROM password_reset_tokens WHERE user_id = ?", [userId]);
}

module.exports = {
  create,
  findByHash,
  deleteByUserId,
};
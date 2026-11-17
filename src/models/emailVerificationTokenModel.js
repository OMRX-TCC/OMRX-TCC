const database = require("./database");

async function create({ userId, tokenHash, expiresInHours }) {
  await database.execute(
    `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR))`,
    [userId, tokenHash, expiresInHours]
  );
}

async function findByTokenHash(tokenHash) {
  const [rows] = await database.execute(
    `SELECT user_id, expires_at < NOW() AS expired
     FROM email_verification_tokens
     WHERE token_hash = ?`,
    [tokenHash]
  );

  if (rows.length === 0) return null;

  return { userId: rows[0].user_id, isExpired: Boolean(rows[0].expired) };
}

async function getSecondsSinceLastCreated(userId) {
  const [rows] = await database.execute(
    `SELECT TIMESTAMPDIFF(SECOND, MAX(created_at), NOW()) AS seconds
     FROM email_verification_tokens
     WHERE user_id = ?`,
    [userId]
  );

  return rows[0].seconds;
}

async function deleteByUserId(userId) {
  await database.execute("DELETE FROM email_verification_tokens WHERE user_id = ?", [userId]);
}

module.exports = { create, findByTokenHash, getSecondsSinceLastCreated, deleteByUserId };

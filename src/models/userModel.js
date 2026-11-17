const database = require("./database");

function toUser(row) {
  return {
    id: row.user_id,
    name: row.user_name,
    email: row.user_email,
    passwordHash: row.senha_hash,
    emailVerifiedAt: row.user_email_verified_at,
  };
}

async function create({ name, email, passwordHash }) {
  const [result] = await database.execute(
    `INSERT INTO users (user_name, user_email, senha_hash)
     VALUES (?, ?, ?)`,
    [name, email, passwordHash]
  );

  return result.insertId;
}

async function findByEmail(email) {
  const [rows] = await database.execute(
    `SELECT user_id, user_name, user_email, senha_hash, user_email_verified_at
     FROM users
     WHERE user_email = ?`,
    [email]
  );

  return rows.length > 0 ? toUser(rows[0]) : null;
}

async function markEmailAsVerified(userId) {
  await database.execute("UPDATE users SET user_email_verified_at = NOW() WHERE user_id = ?", [userId]);
}

module.exports = { create, findByEmail, markEmailAsVerified };

const pool = require("../config/db")

async function create({name, email, passwordHash}) {
    const [result] = await pool.execute(
        "INSERT INTO users (user_name, user_email, senha_hash) VALUES (?, ?, ?)",
        [name, email, passwordHash]
    );

    return result.insertId;
}

async function findByEmail(email) {
    const [rows] = await pool.execute(
        "SELECT user_id FROM users WHERE user_email = ?",
        [email]
    );

    return rows[0];
}

async function findOneByEmail(email) {
    const [rows] = await pool.execute(
        "SELECT * FROM users where user_email = ?",
        [email]
    );

    return rows[0];
}

async function remove(id) {
    await pool.execute(
        "DELETE FROM users WHERE user_id = ?",
        [id]
    );
}

async function markEmailAsVerified(userId) {
    await pool.execute(
        "UPDATE users SET user_email_verified_at = NOW() WHERE user_id = ?",
        [userId]
    );
}

module.exports = { create, findByEmail, findOneByEmail, remove, markEmailAsVerified };
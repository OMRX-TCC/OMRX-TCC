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

async function findById(id) {
    const [rows] = await pool.execute(
        "SELECT * FROM users WHERE user_id = ?",
        [id]
    );

    return rows[0];
}

async function update(id, fields) {
    const sets = [];
    const values = [];

    if (fields.name !== undefined) {
        sets.push("user_name = ?");
        values.push(fields.name);
    }

    if (fields.email !== undefined) {
        sets.push("user_email = ?");
        values.push(fields.email);
    }

    if (fields.passwordHash !== undefined) {
        sets.push("senha_hash = ?");
        values.push(fields.passwordHash);
    }

    if (sets.length === 0) {
        return;
    }

    values.push(id);

    await pool.execute(
        `UPDATE users SET ${sets.join(", ")} WHERE user_id = ?`,
        values
    );
}

async function markEmailAsVerified(userId) {
    await pool.execute(
        "UPDATE users SET user_email_verified_at = NOW() WHERE user_id = ?",
        [userId]
    );
}

module.exports = { create, findByEmail, findOneByEmail, findById, update, markEmailAsVerified };
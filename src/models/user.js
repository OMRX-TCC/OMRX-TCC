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

module.exports = {create, findByEmail, findOneByEmail}
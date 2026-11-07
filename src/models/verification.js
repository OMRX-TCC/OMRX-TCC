const pool = require("../config/db");

async function create({ url, statusId, threatTypeId, userId }) {
  const [result] = await pool.execute(
    "INSERT INTO verifications (url, status_id, threat_type_id, user_id) VALUES (?, ?, ?, ?)",
    [url, statusId, threatTypeId, userId]
  );

  return result.insertId;
}

async function countAll() {
  const [rows] = await pool.execute(
    "SELECT COUNT(*) AS total, MAX(created_at) AS lastUpdatedAt FROM verifications"
  );

  return rows[0];
}

module.exports = { create, countAll };
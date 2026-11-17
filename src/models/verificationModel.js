const { RISK_LEVELS, THREAT_TYPES } = require("../entities/riskAnalysis");
const database = require("./database");

const STATUS_ID_BY_RISK_LEVEL = {
  [RISK_LEVELS.safe]: 2,
  [RISK_LEVELS.suspicious]: 3,
  [RISK_LEVELS.dangerous]: 4,
};

const THREAT_TYPE_ID_BY_THREAT_TYPE = {
  [THREAT_TYPES.scam]: 1,
  [THREAT_TYPES.malware]: 2,
  [THREAT_TYPES.phishing]: 3,
};

async function create({ url, riskLevel, threatType, userId }) {
  const [result] = await database.execute(
    `INSERT INTO verifications (url, status_id, threat_type_id, user_id)
     VALUES (?, ?, ?, ?)`,
    [url, STATUS_ID_BY_RISK_LEVEL[riskLevel], THREAT_TYPE_ID_BY_THREAT_TYPE[threatType] ?? null, userId]
  );

  return result.insertId;
}

async function getSummary() {
  const [rows] = await database.execute("SELECT COUNT(*) AS total, MAX(created_at) AS last_created_at FROM verifications");

  return { total: rows[0].total, lastCreatedAt: rows[0].last_created_at };
}

module.exports = { create, getSummary };

const verificationModel = require("../models/verification");

async function getStats(req, res) {
  try {
    const { total, lastUpdatedAt } = await verificationModel.countAll();

    return res.status(200).json({
      totalVerifications: total,
      lastUpdatedAt,
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar estatisticas." });
  }
}

module.exports = { getStats };
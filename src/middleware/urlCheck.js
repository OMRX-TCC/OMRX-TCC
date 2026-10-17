function validateUrl(req, res, next) {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({
      error: "O campo link é obrigatório."
    });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({
      error: "Esse link não é válido"
    });
  }

  next();
}

module.exports = { validateUrl };
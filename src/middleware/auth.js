const jwt = require("jsonwebtoken");

function auth(req, resp, next) {
    const header = req.headers.authorization;

    if (!header) {
        return resp.status(401).json({ error: "Token não fornecido"})
    }

    const token = header.split(" ")[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    }
    catch(error) {
        return resp.status(401).json({error: "Token inválido ou expirado"});
    }
}

module.exports = auth;
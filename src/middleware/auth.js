const jwt = require("jsonwebtoken");
const userModel = require("../models/user");
const { AUTH_MESSAGES } = require("../config/config");

function isSessionStale(user, authorization) {
    return user.user_email !== authorization.email || !user.user_email_verified_at;
}

async function auth(req, resp, next) {
    const header = req.headers.authorization;

    if (!header) {
        return resp.status(401).json({ error: AUTH_MESSAGES.MISSING_TOKEN });
    }

    const token = header.split(" ")[1];
    let authorization;

    try {
        authorization = jwt.verify(token, process.env.JWT_SECRET);
    }
    catch(error) {
        return resp.status(401).json({ error: AUTH_MESSAGES.INVALID_TOKEN });
    }

    const user = await userModel.findById(authorization.id);

    if (user && isSessionStale(user, authorization)) {
        return resp.status(401).json({ error: AUTH_MESSAGES.INVALID_TOKEN });
    }

    req.auth = authorization;
    next();
}

module.exports = { auth };
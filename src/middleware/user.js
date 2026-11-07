const UserModel = require("../models/user");
const bcrypt = require("bcryptjs");
const { EMAIL_VERIFICATION_MESSAGES } = require("../config/config");

async function validateRegister(req, resp, next) {
    const { name, email, password, repeatPassword } = req.body;

    if (!name || !email || !password || !repeatPassword) {
        return resp.status(400).json({ error: "Todos os campos são obrigatórios." })
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        return resp.status(400).json({ error: "Email inválido." });
    }

    if (password.length < 8) {
        return resp.status(400).json({ error: "A senha deve ter ao menos 8 caracteres." });
    }

    if (password != repeatPassword) {
        return resp.status(400).json({ error: "As senhas digitadas devem ser as mesmas." });
    }

    next();
}

async function validateLogin(req, resp, next) {
    const { email, password } = req.body;

    if (!email || !password) {
        return resp.status(401).json({ error: "Os campos email e senha são obrigatórios."});
    }

    const user = await UserModel.findOneByEmail(email);

    const isPasswordValid = user
        ? await bcrypt.compare(password, user.senha_hash)
        : false;

    if (!user || !isPasswordValid) {
        return resp.status(401).json({ error: "Email ou senha inválidos" });
    }

    if (!user.user_email_verified_at) {
        return resp.status(403).json({
            error: EMAIL_VERIFICATION_MESSAGES.NOT_VERIFIED,
            code: "EMAIL_NOT_VERIFIED",
        });
    }

    req.id = user.user_id;
    req.email = user.user_email;

    next();
}

function validateResendVerification(req, resp, next) {
    const { email } = req.body;

    if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email.trim())) {
        return resp.status(400).json({ error: "Email inválido." });
    }

    next();
}

module.exports = { validateRegister, validateLogin, validateResendVerification };
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel  = require("../models/user");

async function create(req, resp) {
    const name = req.body.name.trim();
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;

    if (await userModel.findByEmail(email)) {
        return resp.status(409).json({error: "O Email já existe!"})
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const id = await userModel.create({ name, email, passwordHash});

    return resp.status(201).json({ id, name, email })
}

async function login(req, resp) {
    const id = req.id;
    const email = req.email;

    const token = jwt.sign(
        { id, email },
        process.env.jwt_secret,
        { expiresIn: process.env.jwt_expires_in}
    );

    return resp.status(200).json({ token });
}

module.exports = { create, login }

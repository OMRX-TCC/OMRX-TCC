const bcrypt = require("bcryptjs");
const userModel  = require("../models/user")

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

module.exports = { create }

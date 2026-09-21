async function validateRegister(req, resp, next){
    const { name, email, password, repeatPassword } = req.body;

    if(!name  || !email  || !password  || !repeatPassword ) {
        return resp.status(400).json({ error: "Todos os campos são obrigatórios." })
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        return resp.status(400).json({ error: "Email inválido." });
    }

    if (password.length < 8) {
        return resp.status(400).json({ error: "A senha deve ter ao menos 8 caracteres." });
    }

    if (password != repeatPassword) {
        return resp.status(400).json({ error: "As senhas digitadas devem ser as mesmas."});
    }

    next();
}

module.exports = { validateRegister };
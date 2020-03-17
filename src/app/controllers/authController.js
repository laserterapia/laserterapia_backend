const express = require("express");
const User = require("../models/user");
const Authorized = require("../models/authorized");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authConfig = require("../../config/auth");
const crypto = require("crypto");
const mailer = require("../../modules/mailer");
const admin = require("../middlewares/admin");

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret);
}

router.post("/admin-register", admin("admin"), async(req, res) => {
    try {
        const { registeredEmail } = req.body;

        if (await Authorized.findOne({ email: registeredEmail })) {
            return res.status(409).send({ error: "Email já cadastrado" });
        }
        await Authorized.create({
            email: registeredEmail
        });
        res.send();
    } catch (error) {
        console.log(error);
        return res
            .status(400)
            .send({ error: "Você não está autorizado a cadastrar um email." });
    }
});

router.get("/authorized-emails", admin("admin"), async(req, res) => {
    try {
        const emails = await Authorized.find();
        return res.send({ emails });
    } catch (error) {
        console.log(error);
        return res
            .status(400)
            .send({ error: "Erro ao listar os emails cadastrados." });
    }
});

router.post("/register", async(req, res) => {
    try {
        const { email } = req.body;
        if (!(await Authorized.findOne({ email }))) {
            return res.send({
                error: "Você não está autorizado a se cadastrar no sistema."
            });
        }
        if (await User.findOne({ email })) {
            return res.send({ error: "Usuario ja existe" });
        }
        const cripted_password = bcrypt.hashSync(req.body.password);
        const user = await User.create(req.body);
        user.password = cripted_password;
        user.save();
        user.password = undefined;
        return res.send({ user, token: generateToken({ id: user.id }) });
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: "Falha no registro de usuários" });
    }
});

router.post("/authenticate", async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.send({ error: "Usuário não existe" });
        }

        if (!bcrypt.compareSync(password, user.password)) {
            return res.send({ error: "Senha inválida" });
        }
        user.password = undefined;
        return res.send({ user, token: generateToken({ id: user.id }) });
    } catch (error) {
        console.log(error);
        return res.status(400).send({ error: "Ocorreu um erro na autenticação" });
    }
});

router.post("/forgot-password", async(req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.send({ error: "Usuário não existe" });
        }

        const token = crypto.randomBytes(20).toString("hex");

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            $set: {
                passwordResetToken: token,
                passwordResetExpires: now
            }
        });

        mailer(email, token, res);
    } catch (error) {
        console.log(error);
        return res.status(400).send({ error: "Erro ao recuperar a senha" });
    }
});

router.post("/reset-password", async(req, res) => {
    const { email, token, password } = req.body;
    try {
        const user = await User.findOne({ email }).select(
            "+passwordResetToken passwordResetExpires"
        );

        if (!user) {
            return res.send({ error: "Usuário não existe" });
        }

        if (token !== user.passwordResetToken) {
            return res.send({ error: "Token inválido" });
        }

        const now = new Date();

        if (now > user.passwordResetExpires) {
            res.send({ error: "Token expirado. Gere um novo." });
        }

        user.password = password;

        await user.save();

        return res.send({ message: "Senha alterada com sucesso!" });
    } catch (err) {
        res.status(400).send({ error: "Não pode resetar a senha" });
    }
});

module.exports = app => app.use("/auth", router);
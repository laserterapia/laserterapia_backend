const express = require("express");
const User = require("../models/user");
const Authorized = require("../models/authorized");
const router = express.Router();
const authMiddleware = require('../middlewares/auth')
const jwt = require("jsonwebtoken");
const authConfig = require("../../config/auth");
const crypto = require("crypto");

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret);
}

router.use(authMiddleware)

router.post("/admin-register", async (req, res) => {
  try {
    const { email, password, registeredEmail } = req.body;
    if (email !== "admin" || password !== "admin") {
      return res
        .status(400)
        .send({ error: "Você não está autorizado a cadastrar um email." });
    }
    if (await Authorized.findOne({ email: registeredEmail })) {
      return res.status(409).send({ error: "Email já cadastrado" });
    }
    if (email === "admin" && password === "admin") {
      await Authorized.create({
        email: registeredEmail
      });
      res.send();
    } else {
      return res
        .status(400)
        .send({ error: "Você não está autorizado a cadastrar um email." });
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/authorized-emails", async (req, res) => {
  try {
    const { email } = req.body;
    if (email !== "admin") {
      res.status(403).send({
        error: "Você não está autorizado a ver os emails cadastrados"
      });
    }
    const emails = await Authorized.find();
    res.send({ emails });
  } catch (error) {
    console.log(error);
  }
});

router.post("/register", async (req, res) => {
  try {
    const { email } = req.body;
    if (!(await Authorized.findOne({ email }))) {
      return res
        .status(403)
        .send({ error: "Você não está autorizado a se cadastrar no sistema." });
    }
    if (await User.findOne({ email })) {
      return res.status(400).send({ error: "Usuario ja existe" });
    }
    const user = await User.create(req.body);
    user.password = undefined;
    return res.send({ user, token: generateToken({ id: user.id }) });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Falha no registro de usuários" });
  }
});

router.post("/authenticate", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === "admin" && password === "admin") {
      const admin = User.create({
        name: "admin",
        email: email,
        password: password
      });
      return res.send({ admin, token: generateToken({ id: admin.id }) });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).send({ error: "Usuário não existe" });
    }
    if (password !== user.password) {
      return res.status(400).send({ error: "Senha inválida" });
    }
    user.password = undefined;
    return res.send({ user, token: generateToken({ id: user.id }) });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Ocorreu um erro na autenticação" });
  }
});

router.get("/check_email", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).send({ error: "Email não cadastrado no sistema" });
    } else {
      res.send(200);
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Ocorreu um erro na checagem do email" });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).send({ error: "Usuário não existe" });
    }

    const token = crypto.randomBytes(20).toString("hex");

    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now,
        password: newPassword
      }
    });

    res.status(200).send();
  } catch (error) {
    res.status(400).send({ error: "Erro ao recuperar a senha" });
  }
});

module.exports = app => app.use("/auth", router);

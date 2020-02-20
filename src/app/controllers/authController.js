const express = require("express");
const User = require("../models/user");
const Authorized = require("../models/authorized");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authConfig = require("../../config/auth");
const crypto = require("crypto");
const mailer = require("../../modules/mailer");

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret);
}

router.post("/admin-register", async (req, res) => {
  try {
    const { email, password, registeredEmail } = req.body;
    if (await Authorized.find({ registeredEmail: registeredEmail })) {
      return res.status(400).send({ error: "Email já cadastrado" });
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
  // try {
  //   const searchedEmail = await Authorized.find({
  //     email: "agnaldo.junior111@gmail.com"
  //   });
  //   let authorizedEmail;
  //   let id = "";
  //   searchedEmail.map(e => {
  //     id = e._id;
  //     authorizedEmail = e;
  //   });
  //   authorizedEmail = authorizedEmail.toObject();
  //   const updated = await Authorized.findByIdAndUpdate(id, {
  //     ...authorizedEmail,
  //     teste: ["123", "456"],
  //     email: "agnaldo.junior222@gmail.com"
  //   });
  //   res.send({ updated });
  // } catch (e) {
  //   console.log(e);
  // }
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
    if (await User.findOne({ email })) {
      return res.status(400).send({ error: "Usuario ja existe" });
    }
    if(await !Authorized.find({email: email})){
      return res.status(403).send({error: "Você não está autorizado a se cadastrar no sistema."})
    }
    const user = await User.create(req.body);
    user.password = undefined;
    return res.send({ user, token: generateToken({ id: user.id }) });
  } catch (error) {
    res.status(400).send({ error: "Falha no registro de usuários" });
  }
});

router.post("/authenticate", async (req, res) => {
  const { email, password } = req.body;
  if (email === "admin" && password === "admin") {
    const admin = User.create({
      name: "admin",
      email: email,
      password: password
    });
    res.send({ token: generateToken({ id: admin.id }) });
  } else {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(400).send({ error: "Usuário não existe" });
    }
    if (!(await bcrypt.compare(password, user.password))) {
      res.status(400).send({ error: "Senha inválida" });
    }

    user.password = undefined;

    res.send({ user, token: generateToken({ id: user.id }) });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
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
        passwordResetExpires: now
      }
    });

    mailer.sendMail(
      {
        to: email,
        from: "agnaldo.junior@gmail.com",
        template: "forgotPassword",
        context: { token }
      },
      err => {
        if (err) {
          res.status(400).send({ error: "Não pode enviar a senha" });
        }
        res.send();
      }
    );
  } catch (error) {
    res.status(400).send({ error: "Erro ao recuperar a senha" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, token, password } = req.body;
  try {
    const user = await User.findOne({ email }).select(
      "+passwordResetToken passwordResetExpires"
    );

    if (!user) {
      res.status(400).send({ error: "Usuário não existe" });
    }

    if (token !== user.passwordResetToken) {
      res.status(400).send({ error: "Token inválido" });
    }

    const now = new Date();

    if (now > user.passwordResetExpires) {
      res.status(400).send({ error: "Token expirado. Gere um novo." });
    }

    user.password = password;

    await user.save();

    res.send();
  } catch (err) {
    res.status(400).send({ error: "Não pode resetar a senha" });
  }
});

module.exports = app => app.use("/auth", router);

const express = require('express')
const User = require('../models/user')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth')
const crypto = require('crypto')
const mailer = require('../../modules/mailer')

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret)
}

router.post('/register', async (req, res) => {
  try {
    const { email } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).send({ error: "Usuario ja existe" })
    }
    const user = await User.create(req.body);
    user.password = undefined;
    return res.send({ user, token: generateToken({ id: user.id }) })
  } catch (error) {
    res.status(400).send({ error: 'Falha no registro de usuários' })
  }
})

router.post('/authenticate', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    res.status(400).send({ error: "Usuário não existe" })
  }
  if (!await bcrypt.compare(password, user.password)) {
    res.status(400).send({ error: 'Senha inválida' })
  }

  user.password = undefined;

  res.send({ user, token: generateToken({ id: user.id }) });

})

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) {
      res.status(400).send({ error: "Usuário não existe" })
    }

    const token = crypto.randomBytes(20).toString('hex');

    const now = new Date()
    now.setHours(now.getHours() + 1)

    await User.findByIdAndUpdate(user.id, {
      '$set': {
        passwordResetToken: token,
        passwordResetExpires: now
      }
    })

    mailer.sendMail({
      to: email,
      from: 'agnaldo.junior@gmail.com',
      template: 'forgotPassword',
      context: { token }
    }, (err) => {
      if (err) {
        res.status(400).send({ error: "Não pode enviar a senha" })
      }
      res.send()
    })

  } catch (error) {
    res.status(400).send({ error: "Erro ao recuperar a senha" })
  }
})

router.post('/reset-password', async (req, res) => {
  const { email, token, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+passwordResetToken passwordResetExpires')

    if (!user) {
      res.status(400).send({ error: "Usuário não existe" })
    }

    if(token !== user.passwordResetToken){
      res.status(400).send({ error: "Token inválido" })
    }

    const now = new Date()

    if(now > user.passwordResetExpires){
      res.status(400).send({ error: "Token expirado. Gere um novo." })
    }

    user.password = password;

    await user.save();

    res.send()
  } catch (err) {
    res.status(400).send({ error: "Não pode resetar a senha" })
  }
})

module.exports = (app) => app.use('/auth', router)
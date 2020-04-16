const express = require('express')
const router = express.Router()
const authMiddleware = require("../middlewares/auth");
const User = require('../models/user')

router.use(authMiddleware);


router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.send({ users });
  } catch (error) {
    res.send({ error: "Erro ao listar os usuários." });
  }
})

module.exports = (app) => app.use('/user', router)
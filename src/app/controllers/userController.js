const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const User = require("../models/user");

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    let users = await User.find();
    const index = users.findIndex((element) => element.role === "admin");
    users.splice(index, 1);
    res.send({ users });
  } catch (error) {
    res.send({ error: error });
  }
});

module.exports = (app) => app.use("/user", router);

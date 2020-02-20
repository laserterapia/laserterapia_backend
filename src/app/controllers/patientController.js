const express = require("express");
const Application = require("../models/application");
const Patient = require("../models/patient");
const router = express.Router();

router.post("/register", async (req, res) => {
  try{
    const { name, age, id } = req.body;
    if (await Patient.findById(id)) {
      res.status(400).send({ error: "O paciente já existe." });
    }
    const patient = await Patient.create({name: name, age: age})
    res.send({patient})
  }catch(error){
    console.log(error)
    res.status(400).send({error: `Não foi possível cadastrar o paciente ${name}` })
  }
});

// router.post("/update", async (req, res) => {
//   try{
//     const { name, age } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) {
//       res.status(400).send({ error: "Usuário não existe" });
//     }
//     res.send({patient})
//   }catch(error){
//     console.log(error)
//     res.status(400).send({error: `Não foi possível cadastrar o paciente ${name}` })
//   }
// });

module.exports = app => app.use("/patient", router);

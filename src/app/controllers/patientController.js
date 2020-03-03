const express = require("express");
const Patient = require("../models/patient");
const Application = require("../models/application");
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, age, id } = req.body;
    if (await Patient.findById(id)) {
      res.status(400).send({ error: "O paciente já existe." });
    }
    const patient = await Patient.create({ name: name, age: age });
    res.send({ patient });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .send({ error: `Não foi possível cadastrar o paciente ${name}` });
  }
});

router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find();
    res.send({ patients });
  } catch (error) {
    res.status(400).send({ error: "Erro ao listar os pacientes." });
  }
});

router.post("/update", async (req, res) => {
  try {
    const { id, name, age } = req.body;
    const patient = await Patient.findByIdAndUpdate(id, {
      name: name,
      age: age
    });
    patient = patient.toObject();
    if (!patient) {
      res.status(400).send({ error: "Usuário não existe" });
    }
    res.send({ patient });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: `Não foi possível cadastrar o paciente` });
  }
});

router.post("/insert_application", async (req, res) => {
  try {
    const { patient_id } = req.body;
    const patient = await Patient.findById(patient_id);
    const application = await Application({ patient: patient });
    patient.applications.push(application);
    patient.save();
    res.send({patient})
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: `Não foi possível cadastrar a aplicação` });
  }
});

module.exports = app => app.use("/patient", router);

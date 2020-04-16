const express = require("express");
const Patient = require("../models/patient");
const Application = require("../models/application");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const admin = require('../middlewares/admin')

router.use(authMiddleware);

router.post("/register", admin(), async (req, res) => {
  try {
    const { name, age, cpf } = req.body;
    if (await Patient.findOne({cpf: cpf})) {
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

router.get("/", admin(), async (req, res) => {
  try {
    const patients = await Patient.find();
    res.send({ patients });
  } catch (error) {
    res.send({ error: "Erro ao listar os pacientes." });
  }
});

router.post("/update", admin(), async (req, res) => {
  try {
    const { id, name, age } = req.body;
    const patient = await Patient.findByIdAndUpdate(id, {
      name: name,
      age: age
    });
    patient = patient.toObject();
    if (!patient) {
      res.send({ error: "Usuário não existe" });
    }
    res.send({ patient });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: `Não foi possível cadastrar o paciente` });
  }
});

router.post("/insert_application", admin(), async (req, res) => {
  try {
    const { patient_id } = req.body;
    const patient = await Patient.findById(patient_id);
    const application = await Application.create({ patient: patient });
    patient.applications.push(application);
    patient.save();
    res.send({ patient });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: `Não foi possível cadastrar a aplicação` });
  }
});

router.get("/patient_applications", admin(), async (req, res) => {
  try {
    const { patient_id } = req.body;
    let applications = [];
    const patient = await Patient.findById(patient_id);
    await Promise.all(
      patient.applications.map(async e => {
        const application = await Application.findById(e);
        applications.push(application);
        applications.push(e);
      })
    );
    res.send({ applications });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .send({ error: `Não foi possível listar as aplicações do paciente` });
  }
});

router.post("/insert_images", admin(), async (req, res) => {
  try {
    const { application_id, photo } = req.body;
    const application = await Application.findById(application_id);
    application.images.push(photo);
    application.save();
    res.send({application})
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Erro ao adicionar uma imagem a aplicação." });
  }
});

module.exports = app => app.use("/patient", router);

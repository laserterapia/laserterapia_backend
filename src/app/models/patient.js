const mongoose = require("../../database");

const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: Number,
  cpf: String,
  profilePicture: String,
  createdAt: { type: Date, default: Date.now },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Application" }]
});

const Patient = mongoose.model("Patient", PatientSchema);

module.exports = Patient;

const mongoose = require("../../database");

const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: Number,
  profilePicture: { type: Buffer, contentType: String },
  createdAt: { type: Date, default: Date.now },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Application" }]
});

const Patient = mongoose.model("Patient", PatientSchema);

module.exports = Patient;

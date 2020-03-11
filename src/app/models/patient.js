const mongoose = require("../../database");

const PatientSchema = new mongoose.Schema({
  susCard: {type: String, required: true, unique: true },
  name: { type: String, required: true },
  sex: { type: String, enum: ["Masculino", "Feminino"], required: true },
  birthday: { type: String, required: true },
  momName: { type: String, required: true },
  dadName: { type: String },
  address: { type: String },
  uf: {
    type: String,
    enum: [
      "AC",
      "AL",
      "AM",
      "AP",
      "BA",
      "CE",
      "DF",
      "ES",
      "GO",
      "MA",
      "MG",
      "MS",
      "MT",
      "PA",
      "PB",
      "PE",
      "PI",
      "PR",
      "RJ",
      "RN",
      "RO",
      "RR",
      "RS",
      "SC",
      "SE",
      "SP",
      "TO"
    ]
  },
  city: { type: String },
  phone: { type: String, required: true },
  email: { type: String },
  ethnicity: {
    type: String,
    enum: ["Branco", "Preto", "Pardo", "Amarelo", "Indígena"]
  },
  bloodType: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  },
  medication: { type: String },
  alergies: [String],
  responsibleName: String, 
  weigth: Number,
  height: Number,
  pa: Number,
  tumor: {
    tumorType: String,
    tumorLocation: String
  },
  staging: String, 
  quimio: {
    doing: { type: String, enum: ["Sim", "Não"]},
    howLong: String
  },
  radio: {
    doing: { type: String, enum: ["Sim", "Não"]},
    howLong: String
  },
  age: Number,
  profilePicture: String,
  createdAt: { type: Date, default: Date.now },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Application" }]
});

const Patient = mongoose.model("Patient", PatientSchema);

module.exports = Patient;

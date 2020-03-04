const mongoose = require('../../database')

const ApplicationSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", unique: false },
  createdAt: { type: Date, default: Date.now },
  images: [String]
})

const Application = mongoose.model('Application', ApplicationSchema)

module.exports = Application;
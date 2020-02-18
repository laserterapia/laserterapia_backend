const mongoose = require('../../database')

const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  profilePicture: {type: Buffer, contentType: String},
  createdAt: { type: Date, default: Date.now }
})

UserSchema.pre('save', async function (next) {
  const hash = await bcrypt.hash(this.password, 10)
  this.password = hash;
  next();
});

const Patient = mongoose.model('Patient', PatientSchema)

module.exports = Patient;
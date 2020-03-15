const mongoose = require('../../database')

const AuthorizedSchema = new mongoose.Schema({
  email: {type: String, required: true, unique: true, select: true}
})

const Authorized = mongoose.model('Authorized', AuthorizedSchema)
module.exports = Authorized;
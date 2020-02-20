const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/noderest', { useNewUrlParser: true })
mongoose.Promise = global.Promise

module.exports = mongoose;
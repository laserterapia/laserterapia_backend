const path = require('path')
const nodemailer = require('nodemailer')
const { host, port, user, pass } = require('../config/mail.json')
const hbs = require('nodemailer-express-handlebars')

const transport = nodemailer.createTransport({
  host,
  port,
  auth: { user, pass }
});

transport.use('compile', hbs({
  viewEngine: { partialsDir: '/teste', defaultLayout: false },
  viewPath: path.resolve('./resources/mail/'),
  extName: '.html'
}))

module.exports = transport
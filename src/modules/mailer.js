const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const { host, port, user, pass } = require("../config/mail.json");

sendEmail = (email, token) => {
  nodemailer.createTestAccount((err, account) => {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host,
      port,
      auth: { user, pass }
    });

    mailOptions = {
      from: "laserterapia.noreply@gmail.com",
      to: email,
      subject: "Email de Verificação",
      text:
        "Clique no link de verificação para confirmar seu endereço de email \n \n " +
        "https://www.google.com.br/" +
        token
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return
      }
      console.log("Message sent: %s", info.messageId);
    });
  });
};

module.exports = sendEmail;

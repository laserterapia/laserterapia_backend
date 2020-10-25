const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const { host, port, user, pass } = require("../config/mail.json");

sendEmail = (email, token, crypted_email, res) => {
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
            text: "Clique no link de verificação para confirmar seu endereço de email \n \n " +
                "https://laserterapia.herokuapp.com/reset_password?t=" +
                token + "=&e=" + crypted_email
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.send({ error: "Erro ao enviar o e-mail" });
            }
            console.log("Message sent: %s", info.messageId);
            return res.status(200).send({ message: "Sucesso ao enviar o email" });
        });
    });
};

module.exports = sendEmail;
const nodemailer = require("nodemailer");
const { SMTP } = require("../config");

const SECURE_SMTP_PORT = 465;

let transporter;

function getTransporter() {
  transporter ??= nodemailer.createTransport({
    host: SMTP.host,
    port: SMTP.port,
    secure: SMTP.port === SECURE_SMTP_PORT,
    auth: { user: SMTP.user, pass: SMTP.password },
  });

  return transporter;
}

async function sendMail({ to, subject, text, html }) {
  return getTransporter().sendMail({ from: SMTP.sender, to, subject, text, html });
}

module.exports = { sendMail };

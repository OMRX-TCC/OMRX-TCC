const path = require("node:path");
const { loadHtmlTemplate, renderHtmlTemplate } = require("../utils/htmlTemplate");

const HTML_TEMPLATE = loadHtmlTemplate(path.join(__dirname, "verificationEmail.html"));
const SUBJECT = "Confirme seu e-mail no OMRX";

function buildPlainText({ name, verificationUrl, expiresInHours }) {
  return [
    `Olá, ${name}!`,
    "",
    "Para ativar sua conta no OMRX, confirme seu e-mail acessando o link abaixo:",
    verificationUrl,
    "",
    `O link expira em ${expiresInHours} horas.`,
    "Se você não criou uma conta no OMRX, ignore este e-mail.",
  ].join("\n");
}

function buildVerificationEmail({ name, verificationUrl, expiresInHours }) {
  const templateValues = { name, verificationUrl, expiresInHours };

  return {
    subject: SUBJECT,
    text: buildPlainText(templateValues),
    html: renderHtmlTemplate(HTML_TEMPLATE, templateValues),
  };
}

module.exports = { buildVerificationEmail };

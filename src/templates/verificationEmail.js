const fs = require("fs");
const path = require("path");

const HTML_TEMPLATE = fs.readFileSync(path.join(__dirname, "verificationEmail.html"), "utf8");

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

function renderTemplate(template, values) {
  return template.replace(/{{(\w+)}}/g, (_, key) => escapeHtml(values[key]));
}

function buildVerificationEmail({ name, verifyUrl, expiresInHours }) {
  const subject = "Confirme seu e-mail no OMRX";

  const text = [
    `Ola, ${name}!`,
    "",
    "Para ativar sua conta no OMRX, confirme seu e-mail acessando o link abaixo:",
    verifyUrl,
    "",
    `O link expira em ${expiresInHours} horas.`,
    "Se voce nao criou uma conta no OMRX, ignore este e-mail.",
  ].join("\n");

  const html = renderTemplate(HTML_TEMPLATE, { name, verifyUrl, expiresInHours });

  return { subject, text, html };
}

module.exports = {
  buildVerificationEmail,
};

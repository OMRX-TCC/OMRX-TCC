const fs = require("fs");
const path = require("path");

const HTML_TEMPLATE = fs.readFileSync(path.join(__dirname, "passwordResetEmail.html"), "utf8");

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

function buildPasswordResetEmail({ name, resetUrl, expiresInHours }) {
  const subject = "Redefinição de senha no OMRX";

  const text = [
    `Olá, ${name}!`,
    "",
    "Recebemos um pedido para redefinir a senha da sua conta no OMRX. Acesse o link abaixo para criar uma nova senha:",
    resetUrl,
    "",
    `O link expira em ${expiresInHours} hora(s).`,
    "Se você não pediu a redefinição, ignore este e-mail.",
  ].join("\n");

  const html = renderTemplate(HTML_TEMPLATE, { name, resetUrl, expiresInHours });

  return { subject, text, html };
}

module.exports = {
  buildPasswordResetEmail,
};
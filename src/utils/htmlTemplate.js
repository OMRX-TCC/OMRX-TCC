const fs = require("node:fs");

const PLACEHOLDER_PATTERN = /{{(\w+)}}/g;

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);
}

function loadHtmlTemplate(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function renderHtmlTemplate(template, values) {
  return template.replace(PLACEHOLDER_PATTERN, (_, key) => escapeHtml(values[key]));
}

module.exports = { loadHtmlTemplate, renderHtmlTemplate };

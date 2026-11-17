const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

function isValidEmail(email) {
  return EMAIL_PATTERN.test(email);
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

module.exports = { isValidEmail, normalizeEmail };

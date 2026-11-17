const { AUTH_MESSAGES, EMAIL_VERIFICATION_MESSAGES, USER_MESSAGES } = require("../messages");
const { isValidEmail } = require("../utils/email");
const { createValidator } = require("./createValidator");

const MIN_PASSWORD_LENGTH = 8;

const isText = (value) => typeof value === "string";

function getRequiredTextError(value) {
  if (!value) return USER_MESSAGES.requiredFields;
  if (!isText(value)) return USER_MESSAGES.fieldsMustBeText;
  return null;
}

function getCredentialError(value) {
  if (!value) return AUTH_MESSAGES.credentialsRequired;
  if (!isText(value)) return AUTH_MESSAGES.invalidCredentials;
  return null;
}

function getNameError({ name }) {
  return getRequiredTextError(name);
}

function getEmailError({ email }) {
  const requiredTextError = getRequiredTextError(email);
  if (requiredTextError) return requiredTextError;
  if (!isValidEmail(email)) return USER_MESSAGES.invalidEmail;
  return null;
}

function getNewPasswordError({ password }) {
  const requiredTextError = getRequiredTextError(password);
  if (requiredTextError) return requiredTextError;
  if (password.length < MIN_PASSWORD_LENGTH) return USER_MESSAGES.passwordTooShort(MIN_PASSWORD_LENGTH);
  return null;
}

function getPasswordConfirmationError({ password, repeatPassword }) {
  const requiredTextError = getRequiredTextError(repeatPassword);
  if (requiredTextError) return requiredTextError;
  if (repeatPassword !== password) return USER_MESSAGES.passwordsDoNotMatch;
  return null;
}

function getLoginEmailError({ email }) {
  return getCredentialError(email);
}

function getCurrentPasswordError({ password }) {
  return getCredentialError(password);
}

function getRecipientEmailError({ email }) {
  if (!isText(email) || !isValidEmail(email.trim())) return USER_MESSAGES.invalidEmail;
  return null;
}

function getVerificationTokenError({ token }) {
  if (!isText(token) || !token) return EMAIL_VERIFICATION_MESSAGES.invalidToken;
  return null;
}

const registerValidator = createValidator({
  name: getNameError,
  email: getEmailError,
  password: getNewPasswordError,
  repeatPassword: getPasswordConfirmationError,
});

const loginValidator = createValidator({
  email: getLoginEmailError,
  password: getCurrentPasswordError,
});

const verifyEmailValidator = createValidator({
  token: getVerificationTokenError,
});

const resendVerificationValidator = createValidator({
  email: getRecipientEmailError,
});

module.exports = {
  registerValidator,
  loginValidator,
  verifyEmailValidator,
  resendVerificationValidator,
};

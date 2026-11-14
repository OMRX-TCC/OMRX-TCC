import { createValidator } from "./createValidator.js";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const MIN_PASSWORD_LENGTH = 8;

const isBlank = (value) => value.trim() === "";

function getNameError({ name }) {
  if (isBlank(name)) return "Informe seu nome.";
  return null;
}

function getEmailError({ email }) {
  if (isBlank(email)) return "Informe seu e-mail.";
  if (!EMAIL_PATTERN.test(email.trim())) return "E-mail inválido.";
  return null;
}

function getNewPasswordError({ password }) {
  if (!password) return "Crie uma senha.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  return null;
}

function getPasswordConfirmationError({ password, repeatPassword }) {
  if (!repeatPassword) return "Confirme sua senha.";
  if (repeatPassword !== password) return "As senhas não coincidem.";
  return null;
}

function getCurrentPasswordError({ password }) {
  if (!password) return "Informe sua senha.";
  return null;
}

export const registerValidator = createValidator({
  name: getNameError,
  email: getEmailError,
  password: getNewPasswordError,
  repeatPassword: getPasswordConfirmationError,
});

export const loginValidator = createValidator({
  email: getEmailError,
  password: getCurrentPasswordError,
});

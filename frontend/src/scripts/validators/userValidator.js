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

function getDeletionPasswordError({ currentPassword }) {
  if (!currentPassword) return "Informe sua senha atual.";
  return null;
}

function getDeletionConfirmationError({ confirmDeletion }) {
  if (!confirmDeletion) return "Confirme que entende que seus dados serão apagados.";
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

export const deleteAccountValidator = createValidator({
  currentPassword: getDeletionPasswordError,
  confirmDeletion: getDeletionConfirmationError,
});

export const normalizeEmail = (email) => email.trim().toLowerCase();

const isChangingPassword = ({ newPassword, confirmNewPassword }) =>
  Boolean(newPassword || confirmNewPassword);

function getOptionalNewPasswordError({ newPassword, confirmNewPassword }) {
  if (!newPassword) return confirmNewPassword ? "Informe a nova senha." : null;
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return `A nova senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  return null;
}

function getNewPasswordConfirmationError({ newPassword, confirmNewPassword }) {
  if (!newPassword) return null;
  if (!confirmNewPassword) return "Confirme a nova senha.";
  if (confirmNewPassword !== newPassword) return "As senhas não coincidem.";
  return null;
}

function getRequiredNewPasswordError({ newPassword }) {
  if (!newPassword) return "Informe a nova senha.";
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return `A nova senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  return null;
}

export const forgotPasswordValidator = createValidator({
  email: getEmailError,
});

export const resetPasswordValidator = createValidator({
  newPassword: getRequiredNewPasswordError,
  confirmNewPassword: getNewPasswordConfirmationError,
});

export function createEditAccountValidator(getSavedEmail) {
  function getRequiredCurrentPasswordError(formValues) {
    if (formValues.currentPassword) return null;

    const isChangingEmail = normalizeEmail(formValues.email) !== getSavedEmail();
    if (isChangingEmail || isChangingPassword(formValues)) return "Informe sua senha atual.";

    return null;
  }

  return createValidator({
    name: getNameError,
    email: getEmailError,
    currentPassword: getRequiredCurrentPasswordError,
    newPassword: getOptionalNewPasswordError,
    confirmNewPassword: getNewPasswordConfirmationError,
  });
}

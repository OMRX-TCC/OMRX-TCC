import { ApiError } from "../api/httpClient.js";
import { createUser } from "../services/userService.js";
import {
  REGISTER_FIELDS,
  validateRegister,
  validateRegisterField,
} from "../validators/userValidator.js";
import {
  clearFormStatus,
  getFormValues,
  isFieldInvalid,
  setSubmitting,
  showFieldError,
  showFormStatus,
} from "../ui/form.js";

const MESSAGES = {
  submitting: "Criando conta...",
  success: "Conta criada com sucesso! Você já pode entrar.",
  unexpectedError: "Não foi possível criar sua conta. Tente novamente.",
};

const form = document.getElementById("cadastro-form");
const statusElement = document.getElementById("form-status");
const submitButton = form.querySelector('button[type="submit"]');

function readValues() {
  return getFormValues(form, REGISTER_FIELDS);
}

function revalidateField(field) {
  showFieldError(form, field, validateRegisterField(field, readValues()));
}

/** Exibe os erros de todos os campos e retorna o primeiro campo invalido. */
function validateAllFields() {
  const errors = validateRegister(readValues());

  REGISTER_FIELDS.forEach((field) => showFieldError(form, field, errors[field]));

  return REGISTER_FIELDS.find((field) => errors[field]);
}

function getErrorMessage(error) {
  return error instanceof ApiError ? error.message : MESSAGES.unexpectedError;
}

function handleInput(event) {
  const field = event.target.name;
  if (!REGISTER_FIELDS.includes(field)) return;

  // So revalida enquanto o usuario digita se o campo ja estiver com erro
  if (isFieldInvalid(event.target)) revalidateField(field);

  // A confirmacao depende da senha, entao acompanha as mudancas dela
  if (field === "password" && form.elements.repeatPassword.value) {
    revalidateField("repeatPassword");
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  clearFormStatus(statusElement);

  const firstInvalidField = validateAllFields();
  if (firstInvalidField) {
    form.elements[firstInvalidField].focus();
    return;
  }

  setSubmitting(submitButton, true, MESSAGES.submitting);

  try {
    await createUser(readValues());
    form.reset();
    showFormStatus(statusElement, MESSAGES.success, "success");
  } catch (error) {
    showFormStatus(statusElement, getErrorMessage(error), "error");
  } finally {
    setSubmitting(submitButton, false);
  }
}

form.addEventListener("input", handleInput);
form.addEventListener("submit", handleSubmit);

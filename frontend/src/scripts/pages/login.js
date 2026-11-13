import { ApiError } from "../api/httpClient.js";
import { AUTH_TOKEN_KEY, LOGIN_MESSAGES } from "../config.js";
import { PAGES } from "../routes.js";
import { loginUser } from "../services/userService.js";
import { LOGIN_FIELDS, validateLogin, validateLoginField } from "../validators/userValidator.js";
import {
  clearFormStatus,
  getFormValues,
  isFieldInvalid,
  setSubmitting,
  showFieldError,
  showFormStatus,
} from "../ui/form.js";

function getErrorMessage(error) {
  return error instanceof ApiError ? error.message : LOGIN_MESSAGES.unexpectedError;
}

function initLoginForm() {
  const form = document.getElementById("login-form");
  const statusElement = document.getElementById("form-status");
  const submitButton = form.querySelector('button[type="submit"]');

  const readValues = () => getFormValues(form, LOGIN_FIELDS);

  function validateAllFields() {
    const errors = validateLogin(readValues());

    LOGIN_FIELDS.forEach((field) => showFieldError(form, field, errors[field]));

    return LOGIN_FIELDS.find((field) => errors[field]);
  }

  function handleInput({ target }) {
    const field = target.name;
    if (!LOGIN_FIELDS.includes(field)) return;

    if (isFieldInvalid(target)) {
      showFieldError(form, field, validateLoginField(field, readValues()));
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

    setSubmitting(submitButton, true, LOGIN_MESSAGES.submitting);

    try {
      const { token } = await loginUser(readValues());
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      // Mantem o botao desabilitado: a pagina esta sendo trocada
      window.location.assign(PAGES.home);
    } catch (error) {
      showFormStatus(statusElement, getErrorMessage(error), "error");
      setSubmitting(submitButton, false);
    }
  }

  form.addEventListener("input", handleInput);
  form.addEventListener("submit", handleSubmit);
}

initLoginForm();

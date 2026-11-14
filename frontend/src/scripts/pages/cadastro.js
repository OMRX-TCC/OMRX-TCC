import { getErrorMessage } from "../api/httpClient.js";
import { REGISTER_MESSAGES } from "../config.js";
import { buildEmailSentUrl } from "../routes.js";
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

function initRegisterForm() {
  const form = document.getElementById("cadastro-form");
  const statusElement = document.getElementById("form-status");
  const submitButton = form.querySelector('button[type="submit"]');

  const readValues = () => getFormValues(form, REGISTER_FIELDS);

  function revalidateField(field) {
    showFieldError(form, field, validateRegisterField(field, readValues()));
  }

  function validateAllFields() {
    const errors = validateRegister(readValues());

    REGISTER_FIELDS.forEach((field) => showFieldError(form, field, errors[field]));

    return REGISTER_FIELDS.find((field) => errors[field]);
  }

  function handleInput({ target }) {
    const field = target.name;
    if (!REGISTER_FIELDS.includes(field)) return;

    if (isFieldInvalid(target)) revalidateField(field);

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

    setSubmitting(submitButton, true, REGISTER_MESSAGES.submitting);

    try {
      const { email } = await createUser(readValues());
      window.location.assign(buildEmailSentUrl(email));
    } catch (error) {
      showFormStatus(
        statusElement,
        getErrorMessage(error, REGISTER_MESSAGES.unexpectedError),
        "error"
      );
      setSubmitting(submitButton, false);
    }
  }

  form.addEventListener("input", handleInput);
  form.addEventListener("submit", handleSubmit);
}

initRegisterForm();

import { getErrorMessage } from "../api/httpClient.js";
import { restoreButton, showButtonLoading } from "./button.js";
import { clearStatus, showErrorStatus } from "./formStatus.js";

function isMarkedInvalid(input) {
  return input.getAttribute("aria-invalid") === "true";
}

export function initValidatedForm({
  form,
  validator,
  loadingLabel,
  fallbackErrorMessage,
  revalidateOnChange = {},
  onValidSubmit,
}) {
  const statusElement = form.querySelector(".form-status");
  const submitButton = form.querySelector('button[type="submit"]');

  function readFormValues() {
    return Object.fromEntries(
      validator.fieldNames.map((fieldName) => [fieldName, form.elements[fieldName].value])
    );
  }

  function showFieldError(fieldName, errorMessage) {
    const input = form.elements[fieldName];
    const errorElement = document.getElementById(`${input.id}-error`);

    errorElement.textContent = errorMessage ?? "";
    input.setAttribute("aria-invalid", String(Boolean(errorMessage)));
  }

  function revalidateField(fieldName) {
    showFieldError(fieldName, validator.getFieldError(fieldName, readFormValues()));
  }

  function validateAllFields() {
    const errors = validator.getAllErrors(readFormValues());

    validator.fieldNames.forEach((fieldName) => showFieldError(fieldName, errors[fieldName]));

    return errors;
  }

  function handleFieldInput({ target: input }) {
    const fieldName = input.name;
    if (!validator.fieldNames.includes(fieldName)) return;

    if (isMarkedInvalid(input)) revalidateField(fieldName);

    const dependentFieldName = revalidateOnChange[fieldName];
    if (dependentFieldName && form.elements[dependentFieldName].value) {
      revalidateField(dependentFieldName);
    }
  }

  async function handleFormSubmit(event) {
    event.preventDefault();
    clearStatus(statusElement);

    const errors = validateAllFields();
    const firstInvalidFieldName = validator.fieldNames.find((fieldName) => errors[fieldName]);

    if (firstInvalidFieldName) {
      form.elements[firstInvalidFieldName].focus();
      return;
    }

    showButtonLoading(submitButton, loadingLabel);

    try {
      await onValidSubmit(readFormValues());
    } catch (error) {
      showErrorStatus(statusElement, getErrorMessage(error, fallbackErrorMessage));
      restoreButton(submitButton);
    }
  }

  form.addEventListener("input", handleFieldInput);
  form.addEventListener("submit", handleFormSubmit);
}

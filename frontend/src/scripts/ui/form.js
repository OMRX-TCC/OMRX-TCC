const STATUS_CLASSES = {
  error: "form-status--error",
  success: "form-status--success",
};

export function getFormValues(form, fields) {
  return Object.fromEntries(fields.map((field) => [field, form.elements[field].value]));
}

export function isFieldInvalid(input) {
  return input.getAttribute("aria-invalid") === "true";
}

export function showFieldError(form, field, message) {
  const input = form.elements[field];
  const errorElement = document.getElementById(input.getAttribute("aria-describedby"));

  errorElement.textContent = message ?? "";
  input.setAttribute("aria-invalid", String(Boolean(message)));
}

export function showFormStatus(element, message, type) {
  element.textContent = message;

  Object.entries(STATUS_CLASSES).forEach(([statusType, className]) => {
    element.classList.toggle(className, statusType === type);
  });
}

export function clearFormStatus(element) {
  showFormStatus(element, "", null);
}

export function setSubmitting(button, isSubmitting, loadingText) {
  if (isSubmitting) {
    button.dataset.label = button.textContent;
    button.textContent = loadingText;
  } else {
    button.textContent = button.dataset.label ?? button.textContent;
  }

  button.disabled = isSubmitting;
}

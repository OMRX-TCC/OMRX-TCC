import { STATUS_CLASSES } from "../config.js";

export function getFormValues(form, fields) {
  return Object.fromEntries(fields.map((field) => [field, form.elements[field].value]));
}

export function isFieldInvalid(input) {
  return input.getAttribute("aria-invalid") === "true";
}

export function showFieldError(form, field, message) {
  const input = form.elements[field];
  const errorElement = document.getElementById(`${input.id}-error`);

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

export function startCooldown(button, seconds) {
  const label = button.dataset.label ?? button.textContent;
  let remaining = seconds;

  button.disabled = true;
  button.textContent = `${label} (${remaining}s)`;

  const timer = setInterval(() => {
    remaining -= 1;

    if (remaining <= 0) {
      clearInterval(timer);
      button.textContent = label;
      button.disabled = false;
      return;
    }

    button.textContent = `${label} (${remaining}s)`;
  }, 1000);
}

const STATUS_CLASS_BY_TYPE = {
  error: "form-status--error",
  success: "form-status--success",
};

function showStatus(statusElement, message, statusType) {
  statusElement.textContent = message;

  Object.entries(STATUS_CLASS_BY_TYPE).forEach(([type, className]) => {
    statusElement.classList.toggle(className, type === statusType);
  });
}

export function showErrorStatus(statusElement, message) {
  showStatus(statusElement, message, "error");
}

export function showSuccessStatus(statusElement, message) {
  showStatus(statusElement, message, "success");
}

export function clearStatus(statusElement) {
  showStatus(statusElement, "", null);
}

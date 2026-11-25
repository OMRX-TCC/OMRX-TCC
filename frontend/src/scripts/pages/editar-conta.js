import { ApiError, getErrorMessage } from "../api/httpClient.js";
import { UNAUTHORIZED_STATUS } from "../config.js";
import { ACCOUNT_MESSAGES, EDIT_ACCOUNT_MESSAGES } from "../messages.js";
import { buildEmailSentUrl, PAGES } from "../routes.js";
import { clearSession, getAccount, isLoggedIn, updateAccount } from "../services/userService.js";
import { showErrorStatus } from "../ui/formStatus.js";
import { initValidatedForm } from "../ui/validatedForm.js";
import { createEditAccountValidator, normalizeEmail } from "../validators/userValidator.js";

const PASSWORD_FIELD_NAMES = ["currentPassword", "newPassword", "confirmNewPassword"];

const form = document.getElementById("edit-account-form");
const formFields = document.getElementById("edit-account-fields");
const formStatus = document.getElementById("form-status");

let savedAccount = null;

function redirectToLogin() {
  window.location.replace(PAGES.login);
}

function isUnauthorized(error) {
  return error instanceof ApiError && error.status === UNAUTHORIZED_STATUS;
}

function fillForm({ name, email }) {
  form.elements.name.value = name;
  form.elements.email.value = email;
  PASSWORD_FIELD_NAMES.forEach((fieldName) => {
    form.elements[fieldName].value = "";
  });
}

function getAccountChanges({ name, email, currentPassword, newPassword, confirmNewPassword }) {
  const changes = {};
  const trimmedName = name.trim();
  const normalizedEmail = normalizeEmail(email);

  if (trimmedName !== savedAccount.name) changes.name = trimmedName;
  if (normalizedEmail !== savedAccount.email) changes.email = normalizedEmail;
  if (newPassword) Object.assign(changes, { newPassword, confirmNewPassword });

  if (changes.email || changes.newPassword) changes.currentPassword = currentPassword;

  return changes;
}

async function saveChanges(formValues) {
  if (!isLoggedIn()) {
    redirectToLogin();
    return;
  }

  const changes = getAccountChanges(formValues);

  if (Object.keys(changes).length === 0) {
    return { successMessage: EDIT_ACCOUNT_MESSAGES.noChanges };
  }

  await updateAccount(changes);

  if (changes.email) {
    clearSession();
    window.location.replace(buildEmailSentUrl(changes.email));
    return;
  }

  savedAccount = {
    name: changes.name ?? savedAccount.name,
    email: savedAccount.email,
  };
  fillForm(savedAccount);

  return { successMessage: EDIT_ACCOUNT_MESSAGES.saved };
}

async function initEditAccountPage() {
  if (!isLoggedIn()) {
    redirectToLogin();
    return;
  }

  initValidatedForm({
    form,
    validator: createEditAccountValidator(() => savedAccount.email),
    loadingLabel: EDIT_ACCOUNT_MESSAGES.submitting,
    fallbackErrorMessage: EDIT_ACCOUNT_MESSAGES.unexpectedError,
    revalidateOnChange: { newPassword: "confirmNewPassword" },
    onValidSubmit: saveChanges,
  });

  try {
    const { name, email } = await getAccount();
    savedAccount = { name, email };
    fillForm(savedAccount);
    formFields.disabled = false;
  } catch (error) {
    if (isUnauthorized(error)) {
      clearSession();
      redirectToLogin();
      return;
    }

    showErrorStatus(formStatus, getErrorMessage(error, ACCOUNT_MESSAGES.unexpectedError));
  } finally {
    form.removeAttribute("aria-busy");
  }
}

initEditAccountPage();

import { ApiError, getErrorMessage } from "../api/httpClient.js";
import { UNAUTHORIZED_STATUS } from "../config.js";
import { formatShortDate } from "../formatters/dateFormatter.js";
import { ACCOUNT_MESSAGES } from "../messages.js";
import { PAGES } from "../routes.js";
import { clearSession, getAccount, isLoggedIn } from "../services/userService.js";
import { showErrorStatus } from "../ui/formStatus.js";

const accountData = document.getElementById("account-data");
const accountStatus = document.getElementById("account-status");
const nameValue = document.getElementById("account-name");
const emailValue = document.getElementById("account-email");
const createdAtValue = document.getElementById("account-created-at");
const logoutButton = document.getElementById("logout-button");

function redirectToLogin() {
  window.location.replace(PAGES.login);
}

function logout() {
  logoutButton.disabled = true;
  clearSession();
  window.location.replace(PAGES.home);
}

function isUnauthorized(error) {
  return error instanceof ApiError && error.status === UNAUTHORIZED_STATUS;
}

function showAccount({ name, email, createdAt }) {
  nameValue.textContent = name;
  emailValue.textContent = email;
  createdAtValue.textContent = formatShortDate(createdAt);
}

async function initAccountPage() {
  if (!isLoggedIn()) {
    redirectToLogin();
    return;
  }

  logoutButton.addEventListener("click", logout);

  try {
    showAccount(await getAccount());
  } catch (error) {
    if (isUnauthorized(error)) {
      clearSession();
      redirectToLogin();
      return;
    }

    showErrorStatus(accountStatus, getErrorMessage(error, ACCOUNT_MESSAGES.unexpectedError));
  } finally {
    accountData.removeAttribute("aria-busy");
  }
}

initAccountPage();

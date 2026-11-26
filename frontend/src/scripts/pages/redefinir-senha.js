import { PASSWORD_RESET_TOKEN_ERROR_CODES } from "../config.js";
import { RESET_PASSWORD_MESSAGES } from "../messages.js";
import { PAGES, getTokenFromQueryString } from "../routes.js";
import { resetPassword } from "../services/userService.js";
import { initValidatedForm } from "../ui/validatedForm.js";
import { resetPasswordValidator } from "../validators/userValidator.js";

const resetCard = document.getElementById("reset-card");
const failedCard = document.getElementById("failed-card");
const failedMessage = document.getElementById("failed-message");

function showFailure(message) {
  failedMessage.textContent = message;
  resetCard.hidden = true;
  failedCard.hidden = false;
}

function initResetPasswordPage() {
  const token = getTokenFromQueryString(window.location.search);

  if (!token) {
    showFailure(RESET_PASSWORD_MESSAGES.invalidLink);
    return;
  }

  initValidatedForm({
    form: document.getElementById("reset-password-form"),
    validator: resetPasswordValidator,
    loadingLabel: RESET_PASSWORD_MESSAGES.submitting,
    fallbackErrorMessage: RESET_PASSWORD_MESSAGES.unexpectedError,
    revalidateOnChange: { newPassword: "confirmNewPassword" },
    async onValidSubmit(passwords) {
      try {
        await resetPassword({ token, ...passwords });
      } catch (error) {
        if (PASSWORD_RESET_TOKEN_ERROR_CODES.includes(error.code)) {
          showFailure(error.message);
          return;
        }
        throw error;
      }

      window.location.assign(PAGES.passwordUpdated);
    },
  });
}

initResetPasswordPage();

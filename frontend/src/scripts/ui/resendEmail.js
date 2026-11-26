import { getErrorMessage } from "../api/httpClient.js";
import { RESEND_COOLDOWN_SECONDS } from "../config.js";
import { RESEND_EMAIL_MESSAGES } from "../messages.js";
import { getEmailFromQueryString } from "../routes.js";
import { restoreButton, showButtonLoading, startButtonCooldown } from "./button.js";
import { clearStatus, showErrorStatus, showSuccessStatus } from "./formStatus.js";

export function initResendEmail(sendEmail) {
  const recipientEmailElement = document.getElementById("recipient-email");
  const resendPrompt = document.getElementById("resend-prompt");
  const resendButton = document.getElementById("resend-button");
  const resendStatus = document.getElementById("resend-status");

  async function resendEmailTo(email) {
    clearStatus(resendStatus);
    showButtonLoading(resendButton, RESEND_EMAIL_MESSAGES.resending);

    try {
      await sendEmail(email);
      showSuccessStatus(resendStatus, RESEND_EMAIL_MESSAGES.resent);
      startButtonCooldown(resendButton, RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      showErrorStatus(resendStatus, getErrorMessage(error, RESEND_EMAIL_MESSAGES.unexpectedError));
      restoreButton(resendButton);
    }
  }

  const email = getEmailFromQueryString(window.location.search);

  if (!email) {
    resendPrompt.hidden = true;
    return;
  }

  recipientEmailElement.textContent = email;
  startButtonCooldown(resendButton, RESEND_COOLDOWN_SECONDS);
  resendButton.addEventListener("click", () => resendEmailTo(email));
}

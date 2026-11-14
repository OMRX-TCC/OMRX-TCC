import { getErrorMessage } from "../api/httpClient.js";
import { RESEND_COOLDOWN_SECONDS } from "../config.js";
import { RESEND_EMAIL_MESSAGES } from "../messages.js";
import { getEmailFromQueryString } from "../routes.js";
import { resendVerificationEmail } from "../services/userService.js";
import { restoreButton, showButtonLoading, startButtonCooldown } from "../ui/button.js";
import { clearStatus, showErrorStatus, showSuccessStatus } from "../ui/formStatus.js";

const recipientEmailElement = document.getElementById("recipient-email");
const resendPrompt = document.getElementById("resend-prompt");
const resendButton = document.getElementById("resend-button");
const resendStatus = document.getElementById("resend-status");

async function resendEmailTo(email) {
  clearStatus(resendStatus);
  showButtonLoading(resendButton, RESEND_EMAIL_MESSAGES.resending);

  try {
    await resendVerificationEmail(email);
    showSuccessStatus(resendStatus, RESEND_EMAIL_MESSAGES.resent);
    startButtonCooldown(resendButton, RESEND_COOLDOWN_SECONDS);
  } catch (error) {
    showErrorStatus(resendStatus, getErrorMessage(error, RESEND_EMAIL_MESSAGES.unexpectedError));
    restoreButton(resendButton);
  }
}

function initEmailSentPage() {
  const email = getEmailFromQueryString(window.location.search);

  if (!email) {
    resendPrompt.hidden = true;
    return;
  }

  recipientEmailElement.textContent = email;
  startButtonCooldown(resendButton, RESEND_COOLDOWN_SECONDS);
  resendButton.addEventListener("click", () => resendEmailTo(email));
}

initEmailSentPage();

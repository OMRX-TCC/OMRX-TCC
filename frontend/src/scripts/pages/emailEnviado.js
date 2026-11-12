import { getErrorMessage } from "../api/httpClient.js";
import { EMAIL_SENT_MESSAGES, RESEND_COOLDOWN_SECONDS } from "../config.js";
import { readEmailFromQuery } from "../routes.js";
import { resendVerificationEmail } from "../services/userService.js";
import { clearFormStatus, setSubmitting, showFormStatus, startCooldown } from "../ui/form.js";

function initEmailSentPage() {
  const resendRow = document.getElementById("resend-row");
  const resendButton = document.getElementById("resend-button");
  const statusElement = document.getElementById("form-status");
  const email = readEmailFromQuery(window.location.search);

  // Sem e-mail na URL nao ha para quem reenviar
  if (!email) {
    resendRow.hidden = true;
    return;
  }

  document.getElementById("email-target").textContent = email;

  startCooldown(resendButton, RESEND_COOLDOWN_SECONDS);

  async function handleResend() {
    clearFormStatus(statusElement);

    setSubmitting(resendButton, true, EMAIL_SENT_MESSAGES.resending);

    try {
      await resendVerificationEmail(email);
      showFormStatus(statusElement, EMAIL_SENT_MESSAGES.resent, "success");
      startCooldown(resendButton, RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      const message = getErrorMessage(error, EMAIL_SENT_MESSAGES.unexpectedError);
      showFormStatus(statusElement, message, "error");
      setSubmitting(resendButton, false);
    }
  }

  resendButton.addEventListener("click", handleResend);
}

initEmailSentPage();

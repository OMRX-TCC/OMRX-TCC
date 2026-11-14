import { getErrorMessage } from "../api/httpClient.js";
import { VERIFY_EMAIL_MESSAGES } from "../messages.js";
import { getTokenFromQueryString } from "../routes.js";
import { verifyEmail } from "../services/userService.js";

const verifyingCard = document.getElementById("verifying-card");
const confirmedCard = document.getElementById("confirmed-card");
const failedCard = document.getElementById("failed-card");
const failedMessage = document.getElementById("failed-message");

function showCard(visibleCard) {
  [verifyingCard, confirmedCard, failedCard].forEach((card) => {
    card.hidden = card !== visibleCard;
  });
}

function showFailure(message) {
  failedMessage.textContent = message;
  showCard(failedCard);
}

async function initVerifyEmailPage() {
  const token = getTokenFromQueryString(window.location.search);

  if (!token) {
    showFailure(VERIFY_EMAIL_MESSAGES.invalidLink);
    return;
  }

  try {
    await verifyEmail(token);
    showCard(confirmedCard);
  } catch (error) {
    showFailure(getErrorMessage(error, VERIFY_EMAIL_MESSAGES.unexpectedError));
  }
}

initVerifyEmailPage();

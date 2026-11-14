function getOriginalLabel(button) {
  button.dataset.originalLabel ??= button.textContent.trim();
  return button.dataset.originalLabel;
}

export function showButtonLoading(button, loadingLabel) {
  getOriginalLabel(button);
  button.textContent = loadingLabel;
  button.disabled = true;
}

export function restoreButton(button) {
  button.textContent = getOriginalLabel(button);
  button.disabled = false;
}

export function startButtonCooldown(button, seconds) {
  const originalLabel = getOriginalLabel(button);
  let secondsLeft = seconds;

  const showSecondsLeft = () => {
    button.textContent = `${originalLabel} (${secondsLeft}s)`;
  };

  button.disabled = true;
  showSecondsLeft();

  const intervalId = setInterval(() => {
    secondsLeft -= 1;

    if (secondsLeft > 0) {
      showSecondsLeft();
      return;
    }

    clearInterval(intervalId);
    restoreButton(button);
  }, 1000);
}

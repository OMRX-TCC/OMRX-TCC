import { FORGOT_PASSWORD_MESSAGES } from "../messages.js";
import { buildPasswordResetSentUrl } from "../routes.js";
import { requestPasswordReset } from "../services/userService.js";
import { initValidatedForm } from "../ui/validatedForm.js";
import { forgotPasswordValidator } from "../validators/userValidator.js";

initValidatedForm({
  form: document.getElementById("forgot-password-form"),
  validator: forgotPasswordValidator,
  loadingLabel: FORGOT_PASSWORD_MESSAGES.submitting,
  fallbackErrorMessage: FORGOT_PASSWORD_MESSAGES.unexpectedError,
  async onValidSubmit({ email }) {
    await requestPasswordReset(email);
    window.location.assign(buildPasswordResetSentUrl(email.trim()));
  },
});

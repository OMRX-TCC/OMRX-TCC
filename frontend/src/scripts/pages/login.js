import { LOGIN_MESSAGES } from "../messages.js";
import { PAGES } from "../routes.js";
import { login } from "../services/userService.js";
import { initValidatedForm } from "../ui/validatedForm.js";
import { loginValidator } from "../validators/userValidator.js";

initValidatedForm({
  form: document.getElementById("login-form"),
  validator: loginValidator,
  loadingLabel: LOGIN_MESSAGES.submitting,
  fallbackErrorMessage: LOGIN_MESSAGES.unexpectedError,
  async onValidSubmit(credentials) {
    await login(credentials);
    window.location.assign(PAGES.home);
  },
});

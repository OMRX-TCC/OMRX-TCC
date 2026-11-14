import { REGISTER_MESSAGES } from "../messages.js";
import { buildEmailSentUrl } from "../routes.js";
import { createUser } from "../services/userService.js";
import { initValidatedForm } from "../ui/validatedForm.js";
import { registerValidator } from "../validators/userValidator.js";

initValidatedForm({
  form: document.getElementById("register-form"),
  validator: registerValidator,
  loadingLabel: REGISTER_MESSAGES.submitting,
  fallbackErrorMessage: REGISTER_MESSAGES.unexpectedError,
  revalidateOnChange: { password: "repeatPassword" },
  async onValidSubmit(newUser) {
    const { email } = await createUser(newUser);
    window.location.assign(buildEmailSentUrl(email));
  },
});

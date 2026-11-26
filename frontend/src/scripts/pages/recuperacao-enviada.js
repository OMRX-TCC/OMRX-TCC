import { requestPasswordReset } from "../services/userService.js";
import { initResendEmail } from "../ui/resendEmail.js";

initResendEmail(requestPasswordReset);

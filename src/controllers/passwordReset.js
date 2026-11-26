const passwordResetService = require("../services/passwordResetService");
const { PASSWORD_RESET_MESSAGES } = require("../config/config");

async function forgot(req, resp) {
  const email = req.body.email.trim().toLowerCase();

  try {
    await passwordResetService.requestPasswordReset(email);
  } catch {
    return resp.status(502).json({ error: PASSWORD_RESET_MESSAGES.SEND_FAILED });
  }

  return resp.status(200).json({ message: PASSWORD_RESET_MESSAGES.REQUEST_ACCEPTED });
}

async function reset(req, resp) {
  try {
    await passwordResetService.resetPassword(req.body.token, req.body.newPassword);
    return resp.status(200).json({ message: PASSWORD_RESET_MESSAGES.RESET_SUCCESS });
  } catch (error) {
    if (error instanceof passwordResetService.PasswordResetError) {
      return resp.status(400).json({
        error: PASSWORD_RESET_MESSAGES[error.code],
        code: error.code,
      });
    }
    throw error;
  }
}

module.exports = { forgot, reset };
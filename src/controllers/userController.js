const { EMAIL_VERIFICATION_MESSAGES } = require("../messages");
const emailVerificationService = require("../services/emailVerificationService");
const userService = require("../services/userService");
const { HTTP_STATUS } = require("../utils/http");

async function register(req, res) {
  const { name, email, password } = req.body;
  const user = await userService.register({ name, email, password });

  res.status(HTTP_STATUS.created).json(user);
}

async function login(req, res) {
  const { email, password } = req.body;
  const token = await userService.login({ email, password });

  res.status(HTTP_STATUS.ok).json({ token });
}

async function verifyEmail(req, res) {
  await emailVerificationService.verifyEmail(req.body.token);

  res.status(HTTP_STATUS.ok).json({ message: EMAIL_VERIFICATION_MESSAGES.verified });
}

async function resendVerificationEmail(req, res) {
  await emailVerificationService.resendVerificationEmail(req.body.email);

  res.status(HTTP_STATUS.ok).json({ message: EMAIL_VERIFICATION_MESSAGES.resendAccepted });
}

module.exports = { register, login, verifyEmail, resendVerificationEmail };

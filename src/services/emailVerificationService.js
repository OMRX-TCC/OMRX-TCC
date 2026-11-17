const { APP_URL, EMAIL_VERIFICATION, ERROR_CODES } = require("../config");
const { EMAIL_VERIFICATION_MESSAGES } = require("../messages");
const emailVerificationTokenModel = require("../models/emailVerificationTokenModel");
const userModel = require("../models/userModel");
const mailProvider = require("../providers/mailProvider");
const { buildVerificationEmail } = require("../templates/verificationEmail");
const { normalizeEmail } = require("../utils/email");
const { HTTP_STATUS, HttpError } = require("../utils/http");
const { generateToken, hashToken } = require("../utils/token");

function buildVerificationUrl(token) {
  return `${APP_URL}${EMAIL_VERIFICATION.pagePath}?token=${token}`;
}

async function replaceVerificationToken(userId) {
  const { token, tokenHash } = generateToken(EMAIL_VERIFICATION.tokenBytes);

  await emailVerificationTokenModel.deleteByUserId(userId);
  await emailVerificationTokenModel.create({ userId, tokenHash, expiresInHours: EMAIL_VERIFICATION.expiresInHours });

  return token;
}

async function isWithinResendCooldown(userId) {
  const secondsSinceLastToken = await emailVerificationTokenModel.getSecondsSinceLastCreated(userId);
  return secondsSinceLastToken !== null && secondsSinceLastToken < EMAIL_VERIFICATION.resendCooldownSeconds;
}

async function sendVerificationEmail({ id, name, email }) {
  const token = await replaceVerificationToken(id);

  const verificationEmail = buildVerificationEmail({
    name,
    verificationUrl: buildVerificationUrl(token),
    expiresInHours: EMAIL_VERIFICATION.expiresInHours,
  });

  await mailProvider.sendMail({ to: email, ...verificationEmail });
}

async function verifyEmail(token) {
  const storedToken = await emailVerificationTokenModel.findByTokenHash(hashToken(token));

  if (!storedToken) {
    throw new HttpError(EMAIL_VERIFICATION_MESSAGES.invalidToken, HTTP_STATUS.badRequest, { code: ERROR_CODES.invalidToken });
  }

  if (storedToken.isExpired) {
    throw new HttpError(EMAIL_VERIFICATION_MESSAGES.expiredToken, HTTP_STATUS.badRequest, { code: ERROR_CODES.expiredToken });
  }

  await userModel.markEmailAsVerified(storedToken.userId);
  await emailVerificationTokenModel.deleteByUserId(storedToken.userId);
}

async function resendVerificationEmail(email) {
  const user = await userModel.findByEmail(normalizeEmail(email));
  if (!user || user.emailVerifiedAt || (await isWithinResendCooldown(user.id))) return;

  try {
    await sendVerificationEmail(user);
  } catch (error) {
    console.error("Falha ao reenviar e-mail de verificação:", error.message);
    throw new HttpError(EMAIL_VERIFICATION_MESSAGES.sendFailed, HTTP_STATUS.badGateway, { cause: error });
  }
}

module.exports = { sendVerificationEmail, verifyEmail, resendVerificationEmail };

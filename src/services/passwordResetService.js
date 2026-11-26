const bcrypt = require("bcryptjs");
const { PASSWORD_RESET } = require("../config/config");
const userModel = require("../models/user");
const passwordResetModel = require("../models/passwordResetToken");
const { sendMail } = require("../providers/mailProvider");
const { buildPasswordResetEmail } = require("../templates/passwordResetEmail");
const { generateToken, hashToken } = require("../utils/token");

class PasswordResetError extends Error {
  constructor(code) {
    super(code);
    this.name = "PasswordResetError";
    this.code = code;
  }
}

function buildResetUrl(token) {
  const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;

  return `${appUrl}${PASSWORD_RESET.RESET_PAGE_PATH}?token=${token}`;
}

async function requestPasswordReset(email) {
  const user = await userModel.findOneByEmail(email);

  if (!user) {
    return;
  }

  const { token, tokenHash } = generateToken(PASSWORD_RESET.TOKEN_BYTES);

  await passwordResetModel.deleteByUserId(user.user_id);
  await passwordResetModel.create({
    userId: user.user_id,
    tokenHash,
    expiresInHours: PASSWORD_RESET.EXPIRES_IN_HOURS,
  });

  const message = buildPasswordResetEmail({
    name: user.user_name,
    resetUrl: buildResetUrl(token),
    expiresInHours: PASSWORD_RESET.EXPIRES_IN_HOURS,
  });

  await sendMail({ to: user.user_email, ...message });
}

async function resetPassword(token, newPassword) {
  if (typeof token !== "string" || !token) {
    throw new PasswordResetError("INVALID_TOKEN");
  }

  const storedResetToken = await passwordResetModel.findByHash(hashToken(token));

  if (!storedResetToken) {
    throw new PasswordResetError("INVALID_TOKEN");
  }

  if (storedResetToken.expired) {
    throw new PasswordResetError("EXPIRED_TOKEN");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await userModel.update(storedResetToken.user_id, { passwordHash }, false);
  await passwordResetModel.deleteByUserId(storedResetToken.user_id);
}

module.exports = {
  requestPasswordReset,
  resetPassword,
  PasswordResetError,
};
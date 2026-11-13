const { EMAIL_VERIFICATION } = require("../config/config");
const userModel = require("../models/user");
const tokenModel = require("../models/emailVerificationToken");
const { sendMail } = require("../providers/mailProvider");
const { buildVerificationEmail } = require("../templates/verificationEmail");
const { generateToken, hashToken } = require("../utils/token");

class EmailVerificationError extends Error {
  constructor(code) {
    super(code);
    this.name = "EmailVerificationError";
    this.code = code;
  }
}

function buildVerifyUrl(token) {
  const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;

  return `${appUrl}${EMAIL_VERIFICATION.VERIFY_PAGE_PATH}?token=${token}`;
}

async function sendVerificationEmail({ id, name, email }) {
  const { token, tokenHash } = generateToken(EMAIL_VERIFICATION.TOKEN_BYTES);

  await tokenModel.deleteByUserId(id);
  await tokenModel.create({
    userId: id,
    tokenHash,
    expiresInHours: EMAIL_VERIFICATION.EXPIRES_IN_HOURS,
  });

  const message = buildVerificationEmail({
    name,
    verifyUrl: buildVerifyUrl(token),
    expiresInHours: EMAIL_VERIFICATION.EXPIRES_IN_HOURS,
  });

  await sendMail({ to: email, ...message });
}

async function verifyEmail(token) {
  if (typeof token !== "string" || !token) {
    throw new EmailVerificationError("INVALID_TOKEN");
  }

  const record = await tokenModel.findByHash(hashToken(token));

  if (!record) {
    throw new EmailVerificationError("INVALID_TOKEN");
  }

  if (record.expired) {
    throw new EmailVerificationError("EXPIRED_TOKEN");
  }

  await userModel.markEmailAsVerified(record.user_id);
  await tokenModel.deleteByUserId(record.user_id);
}


async function resendVerificationEmail(email) {
  const user = await userModel.findOneByEmail(email);

  if (!user || user.user_email_verified_at) {
    return;
  }

  const secondsSinceLastToken = await tokenModel.getSecondsSinceLastToken(user.user_id);

  if (
    secondsSinceLastToken !== null &&
    secondsSinceLastToken < EMAIL_VERIFICATION.RESEND_COOLDOWN_SECONDS
  ) {
    return;
  }

  await sendVerificationEmail({
    id: user.user_id,
    name: user.user_name,
    email: user.user_email,
  });
}

module.exports = {
  sendVerificationEmail,
  verifyEmail,
  resendVerificationEmail,
  EmailVerificationError,
};

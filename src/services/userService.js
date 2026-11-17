const bcrypt = require("bcryptjs");
const { ERROR_CODES, PASSWORD_SALT_ROUNDS } = require("../config");
const { AUTH_MESSAGES, USER_MESSAGES } = require("../messages");
const userModel = require("../models/userModel");
const { normalizeEmail } = require("../utils/email");
const { HTTP_STATUS, HttpError } = require("../utils/http");
const { signAccessToken } = require("../utils/jwt");
const emailVerificationService = require("./emailVerificationService");

async function ensureEmailIsAvailable(email) {
  const existingUser = await userModel.findByEmail(email);
  if (existingUser) throw new HttpError(USER_MESSAGES.emailAlreadyRegistered, HTTP_STATUS.conflict);
}

async function trySendVerificationEmail(user) {
  try {
    await emailVerificationService.sendVerificationEmail(user);
    return true;
  } catch (error) {
    console.error("Falha ao enviar e-mail de verificação:", error.message);
    return false;
  }
}

async function findUserByCredentials({ email, password }) {
  const user = await userModel.findByEmail(normalizeEmail(email));
  const isPasswordCorrect = user !== null && (await bcrypt.compare(password, user.passwordHash));

  if (!isPasswordCorrect) throw new HttpError(AUTH_MESSAGES.invalidCredentials, HTTP_STATUS.unauthorized);

  return user;
}

async function register({ name, email, password }) {
  const newUser = { name: name.trim(), email: normalizeEmail(email) };

  await ensureEmailIsAvailable(newUser.email);

  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
  const id = await userModel.create({ ...newUser, passwordHash });
  const emailSent = await trySendVerificationEmail({ id, ...newUser });

  return { id, ...newUser, emailSent };
}

async function login({ email, password }) {
  const user = await findUserByCredentials({ email, password });

  if (!user.emailVerifiedAt) {
    throw new HttpError(AUTH_MESSAGES.emailNotVerified, HTTP_STATUS.forbidden, { code: ERROR_CODES.emailNotVerified });
  }

  return signAccessToken({ id: user.id, email: user.email });
}

module.exports = { register, login };

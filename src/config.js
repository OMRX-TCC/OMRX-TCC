const dotenv = require("dotenv");

dotenv.config({ quiet: true });

const PORT = Number(process.env.PORT) || 3000;

const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

const DATABASE = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  name: process.env.DB_NAME,
};

const JWT = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || "1d",
};

const SMTP = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  user: process.env.SMTP_USER,
  password: process.env.SMTP_PASS,
  sender: process.env.MAIL_FROM || process.env.SMTP_USER,
};

const URL_CHECK_PROVIDER = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  apiToken: process.env.CLOUDFLARE_API_TOKEN,
  baseUrl: "https://api.cloudflare.com/client/v4",
  timeoutMs: 5000,
  pollIntervalMs: 10000,
  maxPollAttempts: 6,
};

const PASSWORD_SALT_ROUNDS = 10;

const EMAIL_VERIFICATION = {
  tokenBytes: 32,
  expiresInHours: 24,
  resendCooldownSeconds: 60,
  pagePath: "/pages/verificar-email.html",
};

const ERROR_CODES = {
  emailNotVerified: "EMAIL_NOT_VERIFIED",
  invalidToken: "INVALID_TOKEN",
  expiredToken: "EXPIRED_TOKEN",
  missingAccountId: "MISSING_ACCOUNT_ID",
  missingApiKey: "MISSING_API_KEY",
  timeout: "TIMEOUT",
  networkError: "NETWORK_ERROR",
  apiError: "API_ERROR",
};

module.exports = {
  PORT,
  APP_URL,
  DATABASE,
  JWT,
  SMTP,
  URL_CHECK_PROVIDER,
  PASSWORD_SALT_ROUNDS,
  EMAIL_VERIFICATION,
  ERROR_CODES,
};

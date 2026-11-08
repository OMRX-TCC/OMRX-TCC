module.exports = {
  ERROR_MESSAGES: {
    MISSING_API_KEY: "Serviço de verificação indisponível no momento. Tente novamente mais tarde.",
    MISSING_ACCOUNT_ID: "Serviço de verificação indisponível no momento. Tente novamente mais tarde.",
    INVALID_URL: "Informe um link válido para verificar.",
    TIMEOUT: "A verificação demorou demais. Tente novamente.",
    NETWORK_ERROR: "Não foi possível conectar ao serviço de verificação. Tente novamente.",
    API_ERROR: "Não foi possível verificar esse link agora. Tente novamente mais tarde.",
  },
  THREAT_MESSAGES: {
    malware: "malware conhecido",
    phishing: "sinais de phishing",
  },
  STATUS_IDS: {
    SEGURO: 2,
    SUSPEITO: 3,
    PERIGOSO: 4,
  },
  THREAT_TYPE_IDS: {
    SCAM: 1,
    MALWARE: 2,
    PHISHING: 3,
  },
  RETRY: {
    MAX_RETRIES: 2,
    INITIAL_DELAY_MS: 500,
  },
  URL_CHECK_PROVIDER: {
    BASE_URL: "https://api.cloudflare.com/client/v4",
    TIMEOUT_MS: 5000,
    POLL_INTERVAL_MS: 10000,
    MAX_POLL_ATTEMPTS: 6,
  },
  EMAIL_VERIFICATION: {
    TOKEN_BYTES: 32,
    EXPIRES_IN_HOURS: 24,
    RESEND_COOLDOWN_SECONDS: 60,
    VERIFY_PAGE_PATH: "/pages/verificar-email.html",
  },
  EMAIL_VERIFICATION_MESSAGES: {
    INVALID_TOKEN: "Link de verificacao invalido ou ja utilizado.",
    EXPIRED_TOKEN: "Este link de verificacao expirou. Solicite um novo.",
    VERIFIED: "E-mail confirmado com sucesso! Voce ja pode entrar.",
    RESEND_ACCEPTED:
      "Se houver uma conta pendente de verificacao com esse e-mail, enviaremos um novo link.",
    SEND_FAILED: "Nao foi possivel enviar o e-mail de verificacao. Tente novamente mais tarde.",
    NOT_VERIFIED: "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.",
  },
};
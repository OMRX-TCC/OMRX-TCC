module.exports = {
  ERROR_MESSAGES: {
    MISSING_API_KEY: "Servico de verificacao indisponivel no momento. Tente novamente mais tarde.",
    INVALID_URL: "Informe um link valido para verificar.",
    TIMEOUT: "A verificacao demorou demais. Tente novamente.",
    NETWORK_ERROR: "Nao foi possivel conectar ao servico de verificacao. Tente novamente.",
    API_ERROR: "Nao foi possivel verificar esse link agora. Tente novamente mais tarde.",
  },
  RETRY: {
    MAX_RETRIES: 2,
    INITIAL_DELAY_MS: 500,
  },
  URL_CHECK_PROVIDER: {
    BASE_URL: "https://www.ipqualityscore.com/api/json/url",
    TIMEOUT_MS: 5000,
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
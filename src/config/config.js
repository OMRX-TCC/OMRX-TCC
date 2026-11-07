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
};
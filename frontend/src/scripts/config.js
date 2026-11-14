export const API_BASE_URL = "";

export const REGISTER_MESSAGES = {
  submitting: "Criando conta...",
  unexpectedError: "Não foi possível criar sua conta. Tente novamente.",
};

export const STATUS_CLASSES = {
  error: "form-status--error",
  success: "form-status--success",
};

export const EMAIL_SENT_MESSAGES = {
  resending: "Reenviando...",
  resent: "Enviamos um novo link para o seu e-mail.",
  unexpectedError: "Não foi possível reenviar o e-mail. Tente novamente.",
};

// Intervalo minimo entre reenvios. Espelha EMAIL_VERIFICATION.RESEND_COOLDOWN_SECONDS do backend
// (src/config/config.js): antes disso a API responde 200, mas nao envia o e-mail.
export const RESEND_COOLDOWN_SECONDS = 60;

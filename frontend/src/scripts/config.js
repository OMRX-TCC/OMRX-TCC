export const API_BASE_URL = "";

export const REGISTER_MESSAGES = {
  submitting: "Criando conta...",
  unexpectedError: "Não foi possível criar sua conta. Tente novamente.",
};

export const LOGIN_MESSAGES = {
  submitting: "Entrando...",
  unexpectedError: "Não foi possível entrar. Tente novamente.",
};

// Chave do localStorage onde fica o JWT retornado por POST /users/login
export const AUTH_TOKEN_KEY = "omrx:token";

export const STATUS_CLASSES = {
  error: "form-status--error",
  success: "form-status--success",
};

export const EMAIL_SENT_MESSAGES = {
  resending: "Reenviando...",
  resent: "Enviamos um novo link para o seu e-mail.",
  unexpectedError: "Não foi possível reenviar o e-mail. Tente novamente.",
};

export const RESEND_COOLDOWN_SECONDS = 60;

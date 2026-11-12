// Mapa das paginas do frontend. Os caminhos sao relativos a pages/ (onde ficam as telas).
// Paginas marcadas como "pendente" ainda nao foram criadas.
export const PAGES = {
  login: "./login.html", // pendente
  emailSent: "./email-enviado.html",
  // Destino do link enviado por e-mail (backend: EMAIL_VERIFICATION.VERIFY_PAGE_PATH).
  // Recebe ?token=... e confirma o cadastro via POST /users/verify-email.
  confirmEmail: "./verificar-email.html", // pendente
};

const EMAIL_PARAM = "email";

/**
 * Tela "verifique seu e-mail", exibida apos o cadastro.
 * Recebe o e-mail por query string para exibi-lo e permitir o reenvio.
 */
export function buildEmailSentUrl(email) {
  return `${PAGES.emailSent}?${new URLSearchParams({ [EMAIL_PARAM]: email })}`;
}

/** Le o e-mail da query string de `buildEmailSentUrl`. Retorna null se ausente. */
export function readEmailFromQuery(search) {
  return new URLSearchParams(search).get(EMAIL_PARAM)?.trim() || null;
}

// Mapa das paginas do frontend. Os caminhos sao relativos a pages/ (onde ficam as telas).
// Paginas marcadas como "pendente" ainda nao foram criadas.
export const PAGES = {
  home: "../index.html",
  login: "./login.html",
  verifyEmail: "./verificar-email.html", // pendente
};

/**
 * Tela "verifique seu e-mail", exibida apos o cadastro.
 * Recebe o e-mail por query string para poder oferecer o reenvio (POST /users/resend-verification).
 */
export function buildVerifyEmailUrl(email) {
  return `${PAGES.verifyEmail}?${new URLSearchParams({ email })}`;
}

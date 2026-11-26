export const PAGES = {
  home: "/index.html",
  howItWorks: "/pages/como-funciona.html",
  faq: "/pages/faq.html",
  developers: "/pages/desenvolvedores.html",
  securityTips: "/pages/dicas-de-seguranca.html",
  checkLink: "/pages/verificar-link.html",
  login: "/pages/login.html",
  register: "/pages/cadastro.html",
  emailSent: "/pages/email-enviado.html",
  confirmEmail: "/pages/verificar-email.html",
  forgotPassword: "/pages/esqueci-senha.html",
  passwordResetSent: "/pages/recuperacao-enviada.html",
  resetPassword: "/pages/redefinir-senha.html",
  passwordUpdated: "/pages/senha-atualizada.html",
  account: "/pages/minha-conta.html",
  editAccount: "/pages/editar-conta.html",
  deleteAccount: "/pages/excluir-conta.html",
  privacy: "/pages/privacidade.html",
  terms: "/pages/termos-de-uso.html",
  contact: "/pages/contato.html",
};

const EMAIL_QUERY_PARAM = "email";
const TOKEN_QUERY_PARAM = "token";
const LINK_QUERY_PARAM = "url";

function getQueryParam(queryString, paramName) {
  return new URLSearchParams(queryString).get(paramName)?.trim() || null;
}

export function buildEmailSentUrl(email) {
  const queryString = new URLSearchParams({ [EMAIL_QUERY_PARAM]: email });
  return `${PAGES.emailSent}?${queryString}`;
}

export function buildPasswordResetSentUrl(email) {
  const queryString = new URLSearchParams({ [EMAIL_QUERY_PARAM]: email });
  return `${PAGES.passwordResetSent}?${queryString}`;
}

export function buildCheckLinkUrl(link) {
  const queryString = new URLSearchParams({ [LINK_QUERY_PARAM]: link });
  return `${PAGES.checkLink}?${queryString}`;
}

export function getEmailFromQueryString(queryString) {
  return getQueryParam(queryString, EMAIL_QUERY_PARAM);
}

export function getTokenFromQueryString(queryString) {
  return getQueryParam(queryString, TOKEN_QUERY_PARAM);
}
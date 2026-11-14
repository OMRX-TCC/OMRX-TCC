export const PAGES = {
  home: "/index.html",
  howItWorks: "/pages/como-funciona.html",
  faq: "/pages/faq.html",
  developers: "/pages/desenvolvedores.html",
  securityTips: "/pages/dicas-de-seguranca.html",
  login: "/pages/login.html",
  register: "/pages/cadastro.html",
  emailSent: "/pages/email-enviado.html",
  confirmEmail: "/pages/verificar-email.html",
  account: "/pages/minha-conta.html",
  privacy: "/pages/privacidade.html",
  terms: "/pages/termos-de-uso.html",
  contact: "/pages/contato.html",
};

const EMAIL_QUERY_PARAM = "email";

export function buildEmailSentUrl(email) {
  const queryString = new URLSearchParams({ [EMAIL_QUERY_PARAM]: email });
  return `${PAGES.emailSent}?${queryString}`;
}

export function getEmailFromQueryString(queryString) {
  return new URLSearchParams(queryString).get(EMAIL_QUERY_PARAM)?.trim() || null;
}

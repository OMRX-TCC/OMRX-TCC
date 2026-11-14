export const PAGES = {
  home: "/index.html",
  howItWorks: "/pages/como-funciona.html",
  faq: "/pages/faq.html",
  developers: "/pages/desenvolvedores.html",
  login: "/pages/login.html",
  register: "/pages/cadastro.html",
  emailSent: "/pages/email-enviado.html",
  confirmEmail: "/pages/verificar-email.html",
  account: "/pages/minha-conta.html",
  privacy: "/pages/privacidade.html",
  terms: "/pages/termos-de-uso.html",
  contact: "/pages/contato.html",
};

const EMAIL_PARAM = "email";

export function buildEmailSentUrl(email) {
  return `${PAGES.emailSent}?${new URLSearchParams({ [EMAIL_PARAM]: email })}`;
}

export function readEmailFromQuery(search) {
  return new URLSearchParams(search).get(EMAIL_PARAM)?.trim() || null;
}

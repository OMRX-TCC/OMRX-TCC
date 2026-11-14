export const PAGES = {
  home: "/index.html",
  howItWorks: "/pages/como-funciona.html",
  faq: "/pages/faq.html",
  developers: "/pages/desenvolvedores.html",
  login: "/pages/login.html",
  register: "/pages/cadastro.html",
  verifyEmail: "/pages/verificar-email.html",
  account: "/pages/minha-conta.html",
  privacy: "/pages/privacidade.html",
  terms: "/pages/termos-de-uso.html",
  contact: "/pages/contato.html",
};

export function buildVerifyEmailUrl(email) {
  return `${PAGES.verifyEmail}?${new URLSearchParams({ email })}`;
}

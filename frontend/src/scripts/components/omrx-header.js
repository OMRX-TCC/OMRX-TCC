const NAV_LINKS = [
  { label: "Home", href: "/index.html" },
  { label: "Como funciona", href: "/pages/como-funciona.html" },
  { label: "FAQ", href: "/pages/faq.html" },
  { label: "Desenvolvedores", href: "/pages/desenvolvedores.html" },
];

// Deve ser o mesmo valor do breakpoint em header.css
const MOBILE_QUERY = "(max-width: 1024px)";

const AVATAR_ICON = `
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor"
       stroke-width="1.83" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="11" cy="7.5" r="3.5" />
    <path d="M4 18v-.5a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v.5" />
  </svg>`;

const MENU_ICON = `
  <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true">
    <rect y="0" width="22" height="2" rx="1" fill="currentColor" />
    <rect y="7" width="22" height="2" rx="1" fill="currentColor" />
    <rect y="14" width="22" height="2" rx="1" fill="currentColor" />
  </svg>`;

/**
 * Cabecalho padrao do OMRX.
 *
 * Uso:
 *   <omrx-header></omrx-header>          -> sem login (Entrar / Cadastrar)
 *   <omrx-header logged></omrx-header>   -> logado (avatar)
 */
class OmrxHeader extends HTMLElement {
  static get observedAttributes() {
    return ["logged"];
  }

  connectedCallback() {
    this.render();
    document.addEventListener("keydown", this.onKeydown);
    document.addEventListener("click", this.onOutsideClick);
    this.mediaQuery = window.matchMedia(MOBILE_QUERY);
    this.mediaQuery.addEventListener("change", this.onBreakpointChange);
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.onKeydown);
    document.removeEventListener("click", this.onOutsideClick);
    this.mediaQuery?.removeEventListener("change", this.onBreakpointChange);
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  onKeydown = (event) => {
    if (event.key === "Escape") this.setOpen(false);
  };

  onOutsideClick = (event) => {
    if (!this.contains(event.target)) this.setOpen(false);
  };

  // Ao voltar para o layout desktop o painel mobile precisa fechar
  onBreakpointChange = (event) => {
    if (!event.matches) this.setOpen(false);
  };

  setOpen(open) {
    const header = this.querySelector(".header");
    const toggle = this.querySelector(".header__menu-toggle");
    if (!header || !toggle) return;
    header.toggleAttribute("data-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }

  render() {
    const logged = this.hasAttribute("logged");
    const current = window.location.pathname;

    const links = NAV_LINKS.map(({ label, href }) => {
      const active = current === href || (href === "/index.html" && current === "/");
      return `<a class="header__link" href="${href}"${active ? ' aria-current="page"' : ""}>${label}</a>`;
    }).join("");

    const guestActions = `
      <div class="header__actions">
        <a class="header__button header__button--secondary" href="/pages/entrar.html">Entrar</a>
        <a class="header__button header__button--primary" href="/pages/cadastrar.html">Cadastrar</a>
      </div>`;

    const avatar = `
      <a class="header__avatar" href="/pages/minha-conta.html" aria-label="Minha conta">
        ${AVATAR_ICON}
      </a>`;

    this.innerHTML = `
      <header class="header ${logged ? "header--logged" : "header--guest"}">
        <a class="header__logo" href="/index.html" aria-label="OMRX - pagina inicial">
          <img class="header__logo-mark" src="/assets/images/logo-omrx.png" alt="" width="45" height="45" />
          <span class="header__logo-text">OMRX</span>
        </a>
        <div class="header__menu" id="header-menu">
          <nav class="header__nav" aria-label="Principal">${links}</nav>
          ${logged ? "" : guestActions}
        </div>
        <div class="header__end">
          ${logged ? avatar : ""}
          <button class="header__menu-toggle" type="button" aria-label="Abrir menu"
                  aria-expanded="false" aria-controls="header-menu">
            ${MENU_ICON}
          </button>
        </div>
      </header>`;

    this.querySelector(".header__menu-toggle").addEventListener("click", () => {
      this.setOpen(!this.querySelector(".header").hasAttribute("data-open"));
    });
  }
}

customElements.define("omrx-header", OmrxHeader);

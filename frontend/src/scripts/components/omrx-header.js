import { PAGES } from "../routes.js";
import { AVATAR_ICON, MENU_ICON } from "./icons.js";

const NAV_LINKS = [
  { label: "Início", href: PAGES.home },
  { label: "Como funciona", href: PAGES.howItWorks },
  { label: "FAQ", href: PAGES.faq },
  { label: "Desenvolvedores", href: PAGES.developers },
  { label: "Dicas de Segurança", href: PAGES.securityTips },
];

const MOBILE_MEDIA_QUERY = "(max-width: 1200px)";

const GUEST_ACTIONS_HTML = `
  <div class="header__actions">
    <a class="header__button header__button--secondary" href="${PAGES.login}">Entrar</a>
    <a class="header__button header__button--primary" href="${PAGES.register}">Cadastrar</a>
  </div>`;

const ACCOUNT_LINK_HTML = `
  <a class="header__avatar" href="${PAGES.account}" aria-label="Minha conta">
    ${AVATAR_ICON}
  </a>`;

function isCurrentPage(href) {
  const currentPath = window.location.pathname;
  return currentPath === href || (href === PAGES.home && currentPath === "/");
}

function renderNavLinks() {
  return NAV_LINKS.map(({ label, href }) => {
    const currentPageAttribute = isCurrentPage(href) ? ' aria-current="page"' : "";
    return `<a class="header__link" href="${href}"${currentPageAttribute}>${label}</a>`;
  }).join("");
}

/**
 * Cabecalho padrao do OMRX.
 *
 * Uso:
 *   <omrx-header></omrx-header>          -> sem login (Entrar / Cadastrar)
 *   <omrx-header logged></omrx-header>   -> logado (avatar)
 *   <omrx-header no-actions></omrx-header> -> sem botoes Entrar/Cadastrar
 *                                           (telas de login/cadastro, onde eles sao redundantes)
 */
class OmrxHeader extends HTMLElement {
  static get observedAttributes() {
    return ["logged", "no-actions"];
  }

  get isLoggedIn() {
    return this.hasAttribute("logged");
  }

  get showsGuestActions() {
    return !this.isLoggedIn && !this.hasAttribute("no-actions");
  }

  connectedCallback() {
    this.render();
    document.addEventListener("keydown", this.handleEscapeKey);
    document.addEventListener("click", this.handleOutsideClick);
    this.mobileMediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    this.mobileMediaQuery.addEventListener("change", this.handleViewportChange);
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.handleEscapeKey);
    document.removeEventListener("click", this.handleOutsideClick);
    this.mobileMediaQuery?.removeEventListener("change", this.handleViewportChange);
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  handleEscapeKey = (event) => {
    if (event.key === "Escape") this.setMenuOpen(false);
  };

  handleOutsideClick = (event) => {
    if (!this.contains(event.target)) this.setMenuOpen(false);
  };

  handleViewportChange = (event) => {
    const isMobileViewport = event.matches;
    if (!isMobileViewport) this.setMenuOpen(false);
  };

  toggleMenu = () => {
    const isMenuOpen = this.querySelector(".header").hasAttribute("data-open");
    this.setMenuOpen(!isMenuOpen);
  };

  setMenuOpen(isOpen) {
    const header = this.querySelector(".header");
    const menuToggle = this.querySelector(".header__menu-toggle");
    if (!header || !menuToggle) return;

    header.toggleAttribute("data-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  }

  render() {
    this.innerHTML = `
      <header class="header ${this.isLoggedIn ? "header--logged" : "header--guest"}">
        <a class="header__logo" href="${PAGES.home}" aria-label="OMRX - pagina inicial">
          <img class="header__logo-mark" src="/assets/images/logo-omrx.png" alt="" width="45" height="45" />
          <span class="header__logo-text">OMRX</span>
        </a>
        <div class="header__menu" id="header-menu">
          <nav class="header__nav" aria-label="Principal">${renderNavLinks()}</nav>
          ${this.showsGuestActions ? GUEST_ACTIONS_HTML : ""}
        </div>
        <div class="header__end">
          ${this.isLoggedIn ? ACCOUNT_LINK_HTML : ""}
          <button class="header__menu-toggle" type="button" aria-label="Abrir menu"
                  aria-expanded="false" aria-controls="header-menu">
            ${MENU_ICON}
          </button>
        </div>
      </header>`;

    this.querySelector(".header__menu-toggle").addEventListener("click", this.toggleMenu);
  }
}

customElements.define("omrx-header", OmrxHeader);

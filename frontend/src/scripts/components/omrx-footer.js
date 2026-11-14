import { PAGES } from "../routes.js";

const FOOTER_LINKS = [
  { label: "Privacidade", href: PAGES.privacy },
  { label: "Termos de uso", href: PAGES.terms },
  { label: "Contato", href: PAGES.contact },
];

function renderFooterLinks() {
  return FOOTER_LINKS.map(
    ({ label, href }) => `<a class="footer__link" href="${href}">${label}</a>`
  ).join("");
}

/**
 * Rodape padrao do OMRX.
 *
 * Uso: <omrx-footer></omrx-footer>
 */
class OmrxFooter extends HTMLElement {
  connectedCallback() {
    const currentYear = new Date().getFullYear();

    this.innerHTML = `
      <footer class="footer">
        <div class="footer__brand">
          <div class="footer__logo">
            <img class="footer__logo-mark" src="/assets/images/logo-omrx.png" alt="" width="28" height="28" />
            <span class="footer__logo-text">OMRX</span>
          </div>
          <p class="footer__slogan">sua segurança em primeiro lugar</p>
        </div>
        <p class="footer__copyright">© ${currentYear} OMRX. Todos os direitos reservados.</p>
        <nav class="footer__links" aria-label="Rodape">${renderFooterLinks()}</nav>
      </footer>`;
  }
}

customElements.define("omrx-footer", OmrxFooter);

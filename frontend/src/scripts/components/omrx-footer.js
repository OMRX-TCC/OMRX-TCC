import { PAGES } from "../routes.js";

/**
 * Rodape padrao do OMRX.
 *
 * Uso: <omrx-footer></omrx-footer>
 */
class OmrxFooter extends HTMLElement {
  connectedCallback() {
    const year = new Date().getFullYear();

    this.innerHTML = `
      <footer class="footer">
        <div class="footer__brand">
          <div class="footer__logo">
            <img class="footer__logo-mark" src="/assets/images/logo-omrx.png" alt="" width="28" height="28" />
            <span class="footer__logo-text">OMRX</span>
          </div>
          <p class="footer__slogan">sua segurança em primeiro lugar</p>
        </div>
        <p class="footer__copyright">© ${year} OMRX. Todos os direitos reservados.</p>
        <nav class="footer__links" aria-label="Rodape">
          <a class="footer__link" href="${PAGES.privacy}">Privacidade</a>
          <a class="footer__link" href="${PAGES.terms}">Termos de uso</a>
          <a class="footer__link" href="${PAGES.contact}">Contato</a>
        </nav>
      </footer>`;
  }
}

customElements.define("omrx-footer", OmrxFooter);

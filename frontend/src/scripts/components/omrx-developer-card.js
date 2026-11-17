class OmrxDeveloperCard extends HTMLElement {
  static observedAttributes = ["name", "role"];

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  render() {
    const card = document.createElement("article");
    card.className = "developer-card";

    const name = document.createElement("h2");
    name.className = "developer-card__name";
    name.textContent = this.getAttribute("name") ?? "";
    card.append(name);

    const role = this.getAttribute("role");
    if (role) {
      const roleText = document.createElement("p");
      roleText.className = "developer-card__role";
      roleText.textContent = role;
      card.append(roleText);
    }

    this.replaceChildren(card);
  }
}

if (!customElements.get("omrx-developer-card")) {
  customElements.define("omrx-developer-card", OmrxDeveloperCard);
}

import { resetOverrides } from "../state/overrides.js";
import { navigate } from "../router.js";

export function renderLayout(root) {
  root.innerHTML = `
    <header class="app-header">
      <a class="app-header__brand" href="/" data-link>Календарь бронирования</a>
      <nav class="app-header__nav">
        <a href="/" data-link><sl-button size="small" variant="text">Гость</sl-button></a>
        <a href="/admin/events" data-link><sl-button size="small" variant="text">Владелец</sl-button></a>
        <sl-button id="reset-demo" size="small" variant="text">
          <sl-icon slot="prefix" name="arrow-counterclockwise"></sl-icon>Сбросить демо-данные
        </sl-button>
      </nav>
    </header>
    <main id="page" class="app-main"></main>
  `;

  root.querySelector("#reset-demo").addEventListener("click", () => {
    resetOverrides();
    navigate(window.location.pathname);
  });
}

/* ============================================================
   main.js — boot, title screen wiring, global key handlers.
   ============================================================ */

(function () {
  // Set initial body class
  document.body.classList.add("act-boot");

  // -------------------- Title screen --------------------
  function refreshTitleButtons() {
    const has = Engine.hasSave();
    document.querySelector("#btn-continue").disabled = !has;
    document.querySelector("#btn-erase").disabled = !has;
  }
  refreshTitleButtons();

  document.querySelector("#btn-new").addEventListener("click", () => {
    Audio.unlock();
    Audio.sfxClick();
    if (Engine.hasSave() && !confirm("Hay una partida guardada. ¿Sobrescribirla?")) return;
    Engine.newGame();
  });

  document.querySelector("#btn-continue").addEventListener("click", () => {
    Audio.unlock();
    Audio.sfxClick();
    Engine.continueGame();
  });

  document.querySelector("#btn-erase").addEventListener("click", () => {
    if (!confirm("¿Borrar la partida guardada? Esto no se puede deshacer.")) return;
    Engine.eraseSave();
    refreshTitleButtons();
    UI.toast("Partida borrada.");
  });

  // -------------------- HUD buttons --------------------
  document.querySelector("#btn-inventory").addEventListener("click", () => {
    Audio.sfxClick();
    UI.openPanel("inventory-panel");
  });
  document.querySelector("#btn-diary").addEventListener("click", () => {
    Audio.sfxClick();
    UI.openPanel("diary-panel");
  });
  document.querySelector("#btn-menu").addEventListener("click", () => {
    Audio.sfxClick();
    UI.openPanel("menu-panel");
  });

  // Close buttons on panels
  document.querySelectorAll(".panel .close").forEach(btn => {
    btn.addEventListener("click", () => UI.closeAllPanels());
  });

  document.querySelector("#btn-save").addEventListener("click", () => {
    Engine.save();
    UI.toast("Partida guardada.");
    UI.closeAllPanels();
  });
  document.querySelector("#btn-quit").addEventListener("click", () => {
    Engine.save();
    Engine.quitToTitle();
    refreshTitleButtons();
  });

  document.querySelector("#btn-end-title").addEventListener("click", () => {
    Engine.quitToTitle();
    refreshTitleButtons();
  });

  // -------------------- Key handlers --------------------
  document.addEventListener("keydown", (ev) => {
    // Esc closes panels
    if (ev.key === "Escape") {
      UI.closeAllPanels();
      return;
    }
    // Only active during game screen
    const gameActive = document.querySelector("#game-screen").classList.contains("active");
    if (!gameActive) return;

    if (ev.key === " " || ev.key === "Enter") {
      ev.preventDefault();
      UI.skipTyping();
    }
    if (ev.key.toLowerCase() === "i") UI.openPanel("inventory-panel");
    if (ev.key.toLowerCase() === "d") UI.openPanel("diary-panel");
    if (ev.key.toLowerCase() === "m") UI.openPanel("menu-panel");
  });

  // Click on text-pane skips typing
  document.querySelector("#text-pane").addEventListener("click", () => {
    UI.skipTyping();
  });

  // Show title initially
  UI.showTitle();
})();

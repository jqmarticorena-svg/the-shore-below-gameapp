/* ============================================================
   engine.js — game state, scene runner, save/load.
   Depends on: Content (content.js), UI (ui.js), Audio (audio.js).
   ============================================================ */

const SAVE_KEY = "the-shore-below.save.v1";

const DEFAULT_STATE = () => ({
  scene: null,
  act: 0, // 0 prólogo, 1..5 actos
  resources: {
    health: 100,
    sanity: 65,      // Daniel ya empieza por debajo del máximo (diseño)
    food: 100,
    battery: 100,
  },
  hasFlashlight: false,
  flashlightOn: false,
  infected: false,
  infectionTicks: 0, // escenas transcurridas desde la infección
  heardLogs: [],     // ids de audio logs ya escuchados
  inventory: [],     // [{ id, name, desc, removable }]
  diary: [],         // [{ act, scene, text }]
  flags: {},
  visited: {},       // sceneId -> count
  ended: false,
  endingId: null,
});

// Síntomas que el diario va atribuyendo al cansancio o al hambre.
// Crecen en severidad. Con antídoto, el contador se ralentiza a la mitad.
const INFECTION_SYMPTOMS = [
  { tick: 2,  text: "Tengo frío otra vez. Es la humedad. Tiene que ser eso." },
  { tick: 4,  text: "Me late el oído derecho. No me había pasado nunca. Será el cansancio." },
  { tick: 6,  text: "La mano izquierda se me durmió un segundo cuando agarré algo. Calambre. Es calambre." },
  { tick: 8,  text: "Tengo sed, pero no de agua. No sé cómo decirlo de otra forma. Es estúpido." },
  { tick: 10, text: "Me miré la palma de la mano y la piel se ve más oscura. Es la luz fluorescente, que está fea." },
  { tick: 12, text: "Hay un momento entre cada respiración que se siente largo de más, como si el cuerpo se olvidara de pedir aire." },
  { tick: 14, text: "Me llamé «sujeto» mentalmente, sin querer, cuando estaba pensando en otra cosa. No me corregí. Eso es lo raro. No me corregí." },
];

const Engine = (() => {
  let state = DEFAULT_STATE();
  let decayTimer = null;
  const DECAY_INTERVAL_MS = 12000; // food drops every ~12s

  // -------------------- State accessors --------------------
  function getState() { return state; }
  function setState(s) { state = s; }

  function reset() {
    state = DEFAULT_STATE();
  }

  function hasSave() {
    try { return !!localStorage.getItem(SAVE_KEY); }
    catch (e) { return false; }
  }
  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      return true;
    } catch (e) { console.warn("save fail", e); return false; }
  }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      state = Object.assign(DEFAULT_STATE(), parsed);
      state.resources = Object.assign(DEFAULT_STATE().resources, parsed.resources || {});
      return true;
    } catch (e) { console.warn("load fail", e); return false; }
  }
  function eraseSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  }

  // -------------------- Resources --------------------
  function clamp(v) { return Math.max(0, Math.min(100, v)); }
  function adjust(name, delta) {
    state.resources[name] = clamp(state.resources[name] + delta);
    applySanityClass();
    UI.renderHUD(state);
    checkForcedEndings();
  }

  function startDecay() {
    stopDecay();
    decayTimer = setInterval(() => {
      // Food slowly drops
      adjust("food", -2);
      // Below threshold, food affects health and sanity
      if (state.resources.food < 25) {
        adjust("health", -1);
        adjust("sanity", -1);
      }
      // Flashlight battery drains when on
      if (state.flashlightOn && state.resources.battery > 0) {
        state.resources.battery = clamp(state.resources.battery - 3);
        if (state.resources.battery === 0) {
          state.flashlightOn = false;
          document.body.classList.remove("flashlight");
          UI.toast("La linterna se ha apagado.");
        }
        UI.renderHUD(state);
      }
      // Infection: slow sanity drag
      if (state.infected) {
        adjust("sanity", -1);
      }
    }, DECAY_INTERVAL_MS);
  }
  function stopDecay() {
    if (decayTimer) { clearInterval(decayTimer); decayTimer = null; }
  }

  // -------------------- Inventory --------------------
  function hasItem(id) { return state.inventory.some(it => it.id === id); }
  function addItem(item) {
    if (hasItem(item.id)) return { ok: false, reason: "duplicate" };
    if (state.inventory.length >= 5) return { ok: false, reason: "full" };
    state.inventory.push(item);
    UI.toast(`Tomaste: ${item.name}`);
    UI.renderInventory(state);
    return { ok: true };
  }
  function removeItem(id) {
    const i = state.inventory.findIndex(it => it.id === id);
    if (i === -1) return false;
    const it = state.inventory[i];
    if (it.removable === false) return false;
    state.inventory.splice(i, 1);
    UI.renderInventory(state);
    return true;
  }
  function useItem(id) {
    const it = state.inventory.find(x => x.id === id);
    if (!it || !it.use) return;
    it.use(state, Engine);
    UI.renderInventory(state);
    UI.renderHUD(state);
  }

  // -------------------- Diary --------------------
  function pushDiary(text) {
    state.diary.push({ act: state.act, scene: state.scene, text });
    UI.renderDiary(state);
  }

  function maybeInfectionDiary() {
    if (!state.infected) return;
    let trigger = state.infectionTicks;
    if (state.flags.antidoteTaken) trigger = Math.floor(trigger / 2);
    const e = INFECTION_SYMPTOMS.find(x => x.tick === trigger);
    if (!e) return;
    const key = `inf_${trigger}`;
    if (state.flags[key]) return;
    state.flags[key] = true;
    state.diary.push({ act: state.act, scene: state.scene, text: e.text });
    UI.renderDiary(state);
  }

  // -------------------- Flashlight --------------------
  function toggleFlashlight() {
    if (!state.hasFlashlight) {
      UI.toast("No tienes linterna.");
      return;
    }
    if (state.resources.battery <= 0) {
      UI.toast("La batería está agotada.");
      return;
    }
    state.flashlightOn = !state.flashlightOn;
    document.body.classList.toggle("flashlight", state.flashlightOn);
    UI.toast(state.flashlightOn ? "Linterna encendida." : "Linterna apagada.");
  }

  // -------------------- Sanity visual --------------------
  function applySanityClass() {
    const b = document.body;
    b.classList.remove("sanity-low", "sanity-mid", "sanity-critical");
    const s = state.resources.sanity;
    if (s < 20) b.classList.add("sanity-critical");
    else if (s < 40) b.classList.add("sanity-mid");
    else if (s < 60) b.classList.add("sanity-low");
  }

  // -------------------- Acts --------------------
  function setAct(n) {
    state.act = n;
    const cls = n === 0 ? "act-prologue" : `act-${n}`;
    const all = ["act-boot","act-prologue","act-1","act-2","act-3","act-4","act-5"];
    all.forEach(c => document.body.classList.remove(c));
    document.body.classList.add(cls);
    // Battery bar visible from Act 3 onward
    const bb = document.querySelector('.bar-battery');
    if (bb) bb.classList.toggle("hidden", n < 3);
  }

  // -------------------- Forced endings --------------------
  // Returns true when a forced transition was scheduled (caller should bail).
  function checkForcedEndings() {
    if (state.ended) return false;
    // Don't re-route if we're already on a terminal scene.
    if (state.scene === "death_health" || state.scene === "ending_bad_1") return false;
    if (state.resources.health <= 0) {
      goToScene("death_health");
      return true;
    }
    if (state.resources.sanity <= 0) {
      goToScene("ending_bad_1");
      return true;
    }
    return false;
  }

  // -------------------- Scene runner --------------------
  async function goToScene(id) {
    const scene = Content.scenes[id];
    if (!scene) {
      console.error("Missing scene:", id);
      UI.toast(`Falta escena: ${id}`);
      return;
    }

    // Fundido a negro cuando cambia el acto.
    const needsActChange = typeof scene.act === "number" && scene.act !== state.act;
    if (needsActChange) {
      document.body.classList.add("act-fade");
      // Esperar a que el overlay opacite completo antes de cambiar paleta.
      await new Promise(r => setTimeout(r, 720));
    }

    state.scene = id;
    state.visited[id] = (state.visited[id] || 0) + 1;

    if (needsActChange) {
      setAct(scene.act);
      // Doble rAF para garantizar que la nueva paleta pinte antes del fade-in.
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      document.body.classList.remove("act-fade");
    }

    if (typeof scene.onEnter === "function") {
      scene.onEnter(state, Engine);
    }

    // onEnter may have mutated resources directly; refresh derived state.
    applySanityClass();
    UI.renderHUD(state);
    if (checkForcedEndings()) return;

    // Infección: avanza un tick por escena y, en ciertos hitos, deja una entrada
    // en el diario que Daniel atribuye a cansancio, hambre o luz.
    if (state.infected) {
      state.infectionTicks = (state.infectionTicks || 0) + 1;
      maybeInfectionDiary();
    }

    UI.renderScene(scene, state, {
      onChoice: (choice) => {
        Audio.sfxClick();
        if (typeof choice.apply === "function") choice.apply(state, Engine);
        if (choice.diary) pushDiary(choice.diary);
        if (choice.goto) goToScene(choice.goto);
        else if (choice.ending) endGame(choice.ending);
      },
      onContinue: () => {
        Audio.sfxClick();
        const nx = typeof scene.next === "function" ? scene.next(state) : scene.next;
        if (nx) goToScene(nx);
      },
    });

    // Auto-save after every scene transition
    save();
  }

  function endGame(endingId) {
    state.ended = true;
    state.endingId = endingId;
    stopDecay();
    const ending = Content.endings[endingId];
    if (!ending) {
      UI.toast(`Falta final: ${endingId}`);
      return;
    }
    UI.showEnding(ending, state);
  }

  // -------------------- Start --------------------
  function newGame() {
    reset();
    eraseSave();
    setAct(0);
    applySanityClass();
    UI.showGame();
    UI.renderHUD(state);
    UI.renderInventory(state);
    UI.renderDiary(state);
    startDecay();
    goToScene(Content.startScene);
  }

  function continueGame() {
    if (!load()) {
      UI.toast("No hay partida guardada.");
      return;
    }
    setAct(state.act);
    applySanityClass();
    UI.showGame();
    UI.renderHUD(state);
    UI.renderInventory(state);
    UI.renderDiary(state);
    startDecay();
    if (state.ended && state.endingId) {
      const ending = Content.endings[state.endingId];
      if (ending) UI.showEnding(ending, state);
    } else {
      goToScene(state.scene || Content.startScene);
    }
  }

  function quitToTitle() {
    stopDecay();
    save();
    UI.showTitle();
  }

  return {
    getState, setState,
    newGame, continueGame, quitToTitle,
    save, load, hasSave, eraseSave,
    goToScene, endGame,
    adjust, addItem, removeItem, useItem, hasItem, pushDiary,
    toggleFlashlight, setAct,
    startDecay, stopDecay,
  };
})();

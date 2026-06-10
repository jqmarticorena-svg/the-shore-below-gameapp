/* ============================================================
   ui.js — DOM rendering, typewriter effect, panels.
   ============================================================ */

const UI = (() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const TYPE_MS = 22;        // ms per character
  const PUNCT_PAUSE = 220;   // extra pause after . ? !
  const COMMA_PAUSE = 90;    // after , ;

  let typeAbort = null;
  let typing = false;

  function showTitle() {
    $("#title-screen").classList.add("active");
    $("#game-screen").classList.remove("active");
    $("#end-screen").classList.remove("active");
    $("#hud").classList.add("hidden");
    closeAllPanels();
    $("#btn-continue").disabled = !Engine.hasSave();
    $("#btn-erase").disabled = !Engine.hasSave();
  }
  function showGame() {
    $("#title-screen").classList.remove("active");
    $("#end-screen").classList.remove("active");
    $("#game-screen").classList.add("active");
    $("#hud").classList.remove("hidden");
  }
  async function showEnding(ending, state) {
    // Fundir a negro antes de revelar la pantalla final.
    document.body.classList.add("act-fade");
    await new Promise(r => setTimeout(r, 720));
    $("#title-screen").classList.remove("active");
    $("#game-screen").classList.remove("active");
    $("#end-screen").classList.add("active");
    $("#hud").classList.add("hidden");
    closeAllPanels();
    $("#end-title").textContent = ending.title || "FIN";
    $("#end-text").innerHTML = (ending.text || "").replace(/\n/g, "<br><br>");
    // Apply optional ending palette class
    document.body.classList.remove("end-good","end-bad-1","end-bad-2","end-rare","end-neutral");
    if (ending.palette) document.body.classList.add(ending.palette);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    document.body.classList.remove("act-fade");
  }

  // -------------------- Typewriter --------------------
  function typeText(paragraphs, onDone) {
    const pane = $("#text-pane");
    pane.innerHTML = "";
    typing = true;
    let aborted = false;
    typeAbort = () => { aborted = true; };

    const doParagraphs = async () => {
      for (let pi = 0; pi < paragraphs.length; pi++) {
        const p = document.createElement("p");
        pane.appendChild(p);
        const raw = paragraphs[pi];
        // Allow simple inline markup: <em>...</em> and <span class="speaker">
        // We type char-by-char respecting tag boundaries.
        const tokens = tokenize(raw);
        for (const tok of tokens) {
          if (aborted) break;
          if (tok.type === "open") {
            const node = document.createElement(tok.tag);
            if (tok.cls) node.className = tok.cls;
            p.appendChild(node);
            tok._node = node;
          } else if (tok.type === "close") {
            // no-op, we follow the stack
          } else {
            // text — type into the deepest open span
            const target = lastOpenChild(p);
            for (const ch of tok.text) {
              if (aborted) break;
              const sanity = (typeof Engine !== "undefined") ? Engine.getState().resources.sanity : 100;
              const glitchProb =
                sanity < 10 ? 0.18 :
                sanity < 20 ? 0.08 :
                sanity < 35 ? 0.025 : 0;
              const isLetter = /[a-záéíóúñ]/i.test(ch);
              if (isLetter && glitchProb > 0 && Math.random() < glitchProb) {
                const span = document.createElement("span");
                span.className = sanity < 10 ? "glitch-char severe" : "glitch-char";
                span.appendChild(document.createTextNode(ch));
                target.appendChild(span);
              } else {
                target.appendChild(document.createTextNode(ch));
              }
              pane.scrollTop = pane.scrollHeight;
              await sleep(TYPE_MS);
              if (".!?".includes(ch)) await sleep(PUNCT_PAUSE);
              else if (",;:".includes(ch)) await sleep(COMMA_PAUSE);
            }
          }
        }
        if (aborted) {
          // skip: dump full content of remaining paragraphs immediately
          // Replace current p's content fully and append remaining as full text
          p.innerHTML = renderFull(raw);
          for (let pj = pi + 1; pj < paragraphs.length; pj++) {
            const pp = document.createElement("p");
            pp.innerHTML = renderFull(paragraphs[pj]);
            pane.appendChild(pp);
          }
          break;
        }
      }
      typing = false;
      typeAbort = null;
      if (typeof onDone === "function") onDone();
    };

    doParagraphs();
  }

  // Convert raw paragraph (with simple <em> / <span class="speaker">) to nodes via tokens
  function tokenize(raw) {
    const tokens = [];
    let i = 0;
    while (i < raw.length) {
      if (raw[i] === "<") {
        const end = raw.indexOf(">", i);
        if (end === -1) { tokens.push({ type: "text", text: raw.slice(i) }); break; }
        const tagStr = raw.slice(i + 1, end);
        if (tagStr.startsWith("/")) {
          tokens.push({ type: "close", tag: tagStr.slice(1) });
        } else {
          const m = tagStr.match(/^(\w+)(?:\s+class="([^"]+)")?/);
          if (m) tokens.push({ type: "open", tag: m[1], cls: m[2] || null });
        }
        i = end + 1;
      } else {
        const next = raw.indexOf("<", i);
        const slice = next === -1 ? raw.slice(i) : raw.slice(i, next);
        tokens.push({ type: "text", text: slice });
        i = next === -1 ? raw.length : next;
      }
    }
    return tokens;
  }
  function lastOpenChild(p) {
    let node = p;
    while (node.lastElementChild) node = node.lastElementChild;
    return node;
  }
  function renderFull(raw) {
    // Trust our own content; basic sanitization: only allow em/span tags
    return raw
      .replace(/<(?!\/?(em|span)(\s|>|\/))/g, "&lt;");
  }

  function skipTyping() {
    if (typing && typeAbort) typeAbort();
  }

  // -------------------- Scene render --------------------
  function renderScene(scene, state, handlers) {
    // Clear choices
    $("#choices").innerHTML = "";
    // Apply optional scene class for backgrounds
    if (scene.bgClass) {
      const bg = $("#scene-bg");
      bg.className = "";
      bg.classList.add(scene.bgClass);
    } else {
      const bg = $("#scene-bg");
      bg.className = "";
    }
    // Audio cues
    if (scene.audio) {
      if (scene.audio.stop) Audio.stopAll(scene.audio.fadeMs || 800);
      if (scene.audio.rain) Audio.playRain(scene.audio.rain);
      if (scene.audio.wind) Audio.playWind(scene.audio.wind);
      if (scene.audio.static) Audio.playStatic(scene.audio.static);
      if (scene.audio.tension) Audio.playTension(scene.audio.tension);
    }

    const text = typeof scene.text === "function" ? scene.text(state) : scene.text;
    const paragraphs = Array.isArray(text) ? text : [text];

    typeText(paragraphs, () => renderChoices(scene, state, handlers));
  }

  function renderChoices(scene, state, handlers) {
    const container = $("#choices");
    container.innerHTML = "";
    const choices = typeof scene.choices === "function" ? scene.choices(state) : scene.choices;

    if (!choices || choices.length === 0) {
      // No choices: show continue or end-of-scene
      const btn = document.createElement("button");
      btn.textContent = scene.next ? "Continuar →" : (scene.ending ? "…" : "Continuar →");
      btn.addEventListener("click", () => {
        if (scene.ending) { handlers.onChoice({ ending: scene.ending }); return; }
        handlers.onContinue();
      });
      container.appendChild(btn);
      return;
    }
    choices.forEach((ch) => {
      const visible = typeof ch.show === "function" ? ch.show(state) : true;
      if (!visible) return;
      const enabled = typeof ch.require === "function" ? ch.require(state) : true;
      const btn = document.createElement("button");
      btn.textContent = (enabled ? "" : "▢ ") + ch.text;
      if (!enabled) btn.classList.add("locked");
      btn.disabled = !enabled;
      btn.addEventListener("click", () => handlers.onChoice(ch));
      container.appendChild(btn);
    });
  }

  // -------------------- HUD --------------------
  function renderHUD(state) {
    const r = state.resources;
    setBar("health", r.health);
    setBar("sanity", r.sanity);
    setBar("food", r.food);
    setBar("battery", r.battery);
  }
  function setBar(name, value) {
    const fill = document.querySelector(`#bar-${name}`);
    if (!fill) return;
    fill.style.width = `${Math.max(0, Math.min(100, value))}%`;
    fill.classList.toggle("low", value < 25);
  }

  // -------------------- Inventory --------------------
  function renderInventory(state) {
    const list = $("#inventory-list");
    list.innerHTML = "";
    for (let i = 0; i < 5; i++) {
      const li = document.createElement("li");
      const it = state.inventory[i];
      if (!it) {
        li.classList.add("empty");
        li.textContent = "— vacío —";
      } else {
        const name = document.createElement("span");
        name.className = "item-name";
        name.textContent = it.name;
        li.appendChild(name);
        const desc = document.createElement("span");
        desc.className = "item-desc";
        desc.textContent = it.desc || "";
        li.appendChild(desc);
        if (it.use) {
          const useBtn = document.createElement("button");
          useBtn.className = "drop";
          useBtn.textContent = "Usar";
          useBtn.style.borderColor = "var(--fg-dim)";
          useBtn.style.color = "var(--fg)";
          useBtn.addEventListener("click", () => Engine.useItem(it.id));
          li.appendChild(useBtn);
        }
        if (it.removable !== false) {
          const dropBtn = document.createElement("button");
          dropBtn.className = "drop";
          dropBtn.textContent = "Descartar";
          dropBtn.addEventListener("click", () => {
            Engine.removeItem(it.id);
            toast(`Soltaste: ${it.name}`);
          });
          li.appendChild(dropBtn);
        }
      }
      list.appendChild(li);
    }
  }

  // -------------------- Diary --------------------
  function renderDiary(state) {
    const list = $("#diary-list");
    list.innerHTML = "";
    if (state.diary.length === 0) {
      const li = document.createElement("li");
      li.style.fontStyle = "italic";
      li.style.color = "var(--fg-dim)";
      li.textContent = "Sin entradas todavía.";
      list.appendChild(li);
      return;
    }
    state.diary.forEach((entry, idx) => {
      const li = document.createElement("li");
      const meta = document.createElement("span");
      meta.className = "meta";
      meta.textContent = entry.act === 0
        ? `Prólogo — entrada ${idx + 1}`
        : `Acto ${entry.act} — entrada ${idx + 1}`;
      li.appendChild(meta);
      li.appendChild(document.createTextNode(entry.text));
      list.appendChild(li);
    });
  }

  // -------------------- Panels --------------------
  function openPanel(id) {
    closeAllPanels();
    $(`#${id}`).classList.remove("hidden");
  }
  function closeAllPanels() {
    $$(".panel").forEach(p => p.classList.add("hidden"));
  }

  // -------------------- Toast --------------------
  let toastTimer = null;
  function toast(msg, ms = 2200) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.remove("hidden");
    requestAnimationFrame(() => t.classList.add("show"));
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.classList.add("hidden"), 350);
    }, ms);
  }

  return {
    showTitle, showGame, showEnding,
    renderScene, renderHUD, renderInventory, renderDiary,
    openPanel, closeAllPanels, toast,
    skipTyping,
  };

  // utilities scope
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
})();

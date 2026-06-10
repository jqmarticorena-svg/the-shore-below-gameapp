/* ============================================================
   audio.js — Web Audio API SFX generators.
   No external assets. Started on first user gesture.
   ============================================================ */

const Audio = (() => {
  let ctx = null;
  let masterGain = null;
  const layers = {}; // name -> { stop, gain }
  let enabled = true;
  let started = false;

  function ensureCtx() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.35;
    masterGain.connect(ctx.destination);
    return ctx;
  }

  // Call from first user gesture
  function unlock() {
    const c = ensureCtx();
    if (!c) return;
    if (c.state === "suspended") c.resume();
    started = true;
  }

  function noiseBuffer(seconds = 2) {
    const c = ensureCtx();
    const buf = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  function makeNoiseSource(loop = true) {
    const c = ensureCtx();
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(2);
    src.loop = loop;
    return src;
  }

  function fadeGain(gain, target, ms) {
    const c = ensureCtx();
    if (!c) return;
    const now = c.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(target, now + ms / 1000);
  }

  function stopLayer(name, fadeMs = 800) {
    const layer = layers[name];
    if (!layer) return;
    fadeGain(layer.gain, 0.0001, fadeMs);
    setTimeout(() => {
      try { layer.stop(); } catch (e) { /* already stopped */ }
      delete layers[name];
    }, fadeMs + 50);
  }

  function stopAll(fadeMs = 800) {
    Object.keys(layers).forEach(n => stopLayer(n, fadeMs));
  }

  // ---------- Loops ----------
  function playRain(targetVol = 0.5, fadeMs = 1500) {
    if (!enabled) return;
    const c = ensureCtx(); if (!c) return;
    stopLayer("rain", 200);
    const src = makeNoiseSource(true);
    const lp = c.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 1800;
    const hp = c.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 400;
    const gain = c.createGain();
    gain.gain.value = 0.0001;
    src.connect(hp).connect(lp).connect(gain).connect(masterGain);
    src.start();
    fadeGain(gain, targetVol, fadeMs);
    layers["rain"] = { stop: () => src.stop(), gain };
  }

  function playWind(targetVol = 0.4, fadeMs = 1500) {
    if (!enabled) return;
    const c = ensureCtx(); if (!c) return;
    stopLayer("wind", 200);
    const src = makeNoiseSource(true);
    const lp = c.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 600;
    const gain = c.createGain();
    gain.gain.value = 0.0001;
    // slow LFO on filter freq to simulate gusts
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.15;
    const lfoGain = c.createGain();
    lfoGain.gain.value = 300;
    lfo.connect(lfoGain).connect(lp.frequency);
    lfo.start();
    src.connect(lp).connect(gain).connect(masterGain);
    src.start();
    fadeGain(gain, targetVol, fadeMs);
    layers["wind"] = { stop: () => { src.stop(); lfo.stop(); }, gain };
  }

  function playStatic(targetVol = 0.3, fadeMs = 800) {
    if (!enabled) return;
    const c = ensureCtx(); if (!c) return;
    stopLayer("static", 200);
    const src = makeNoiseSource(true);
    const hp = c.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 1500;
    const gain = c.createGain();
    gain.gain.value = 0.0001;
    src.connect(hp).connect(gain).connect(masterGain);
    src.start();
    fadeGain(gain, targetVol, fadeMs);
    layers["static"] = { stop: () => src.stop(), gain };
  }

  function playTension(targetVol = 0.18, fadeMs = 1500) {
    if (!enabled) return;
    const c = ensureCtx(); if (!c) return;
    stopLayer("tension", 200);
    // a deep sub-bass drone for cave/tense scenes
    const osc1 = c.createOscillator();
    osc1.type = "sine";
    osc1.frequency.value = 55;
    const osc2 = c.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = 41;
    const gain = c.createGain();
    gain.gain.value = 0.0001;
    osc1.connect(gain); osc2.connect(gain);
    gain.connect(masterGain);
    osc1.start(); osc2.start();
    fadeGain(gain, targetVol, fadeMs);
    layers["tension"] = { stop: () => { osc1.stop(); osc2.stop(); }, gain };
  }

  // ---------- One-shots ----------
  function sfxStep() {
    if (!enabled) return;
    const c = ensureCtx(); if (!c) return;
    const src = makeNoiseSource(false);
    const lp = c.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 300;
    const gain = c.createGain();
    gain.gain.value = 0.0001;
    src.connect(lp).connect(gain).connect(masterGain);
    const now = c.currentTime;
    gain.gain.linearRampToValueAtTime(0.4, now + 0.01);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.18);
    src.start(now);
    src.stop(now + 0.2);
  }

  function sfxThud() {
    if (!enabled) return;
    const c = ensureCtx(); if (!c) return;
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 80;
    const gain = c.createGain();
    gain.gain.value = 0.0001;
    osc.connect(gain).connect(masterGain);
    const now = c.currentTime;
    gain.gain.linearRampToValueAtTime(0.6, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  function sfxClick() {
    if (!enabled) return;
    const c = ensureCtx(); if (!c) return;
    const osc = c.createOscillator();
    osc.type = "square";
    osc.frequency.value = 1400;
    const gain = c.createGain();
    gain.gain.value = 0.0001;
    osc.connect(gain).connect(masterGain);
    const now = c.currentTime;
    gain.gain.linearRampToValueAtTime(0.05, now + 0.005);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.04);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  function setEnabled(v) {
    enabled = !!v;
    if (!enabled) stopAll(200);
  }

  function isEnabled() { return enabled; }
  function isStarted() { return started; }

  return {
    unlock, setEnabled, isEnabled, isStarted,
    playRain, playWind, playStatic, playTension,
    stopLayer, stopAll,
    sfxStep, sfxThud, sfxClick,
  };
})();

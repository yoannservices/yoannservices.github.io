/* ═══════════════════════════════════════════════════════════
   SIMULATEUR TRAIN — SON (synthèse Web Audio)
   Moteur électrique ou diesel, roulement, joints de rail,
   compresseur, avertisseur, alarmes VACMA / RS / KVB.
   ═══════════════════════════════════════════════════════════ */
'use strict';

TS.Audio = (function () {
  let ctx, master, noiseBuf, eng = {}, roll, comp, alarm, ok = false;
  const A = {};
  let lastJoint = 0, muted = false;

  function init() {
    if (ctx) return;
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); let b = 0;
    for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b = 0.98 * b + 0.02 * w; d[i] = b * 6 + w * 0.15; }
    // roulement
    roll = loopNoise(); roll.f.type = 'lowpass'; roll.f.frequency.value = 300; roll.g.gain.value = 0;
    // compresseur
    comp = loopNoise(); comp.f.type = 'bandpass'; comp.f.frequency.value = 180; comp.f.Q.value = 2; comp.g.gain.value = 0;
    comp.lfo = ctx.createOscillator(); comp.lfo.frequency.value = 9; const lg = ctx.createGain(); lg.gain.value = 0.5; comp.lfo.connect(lg); lg.connect(comp.g.gain); comp.lfo.start();
    // moteur : deux oscillateurs filtrés
    eng.o1 = ctx.createOscillator(); eng.o2 = ctx.createOscillator(); eng.o1.type = 'sawtooth'; eng.o2.type = 'square';
    eng.f = ctx.createBiquadFilter(); eng.f.type = 'lowpass'; eng.f.frequency.value = 600;
    eng.g = ctx.createGain(); eng.g.gain.value = 0;
    eng.o1.connect(eng.f); eng.o2.connect(eng.f); eng.f.connect(eng.g); eng.g.connect(master);
    eng.o1.start(); eng.o2.start();
    eng.n = loopNoise(); eng.n.f.type = 'lowpass'; eng.n.f.frequency.value = 120; eng.n.g.gain.value = 0;
    // alarme continue (VACMA)
    alarm = ctx.createOscillator(); alarm.type = 'square'; alarm.frequency.value = 880;
    alarm.g = ctx.createGain(); alarm.g.gain.value = 0; const af = ctx.createBiquadFilter(); af.type = 'lowpass'; af.frequency.value = 2000;
    alarm.connect(af); af.connect(alarm.g); alarm.g.connect(master); alarm.start();
    ok = true;
  }
  function loopNoise() {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const f = ctx.createBiquadFilter(); const g = ctx.createGain();
    s.connect(f); f.connect(g); g.connect(master); s.start();
    return { s, f, g };
  }
  function tone(freq, dur, type, vol, when, glide) {
    if (!ok) return;
    const t = ctx.currentTime + (when || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (glide) o.frequency.linearRampToValueAtTime(glide, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || 0.2, t + 0.01); g.gain.setValueAtTime(vol || 0.2, t + dur - 0.03); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  function burst(dur, freq, vol, type, when) {
    if (!ok) return;
    const t = ctx.currentTime + (when || 0);
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.value = freq; f.Q.value = 1.2;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }

  A.resume = function () { init(); if (ctx && ctx.state === 'suspended') ctx.resume(); };
  A.toggleMute = function () { muted = !muted; if (master) master.gain.value = muted ? 0 : 0.55; return muted; };

  A.fx = function (n, arg) {
    if (!ok) return;
    switch (n) {
      case 'switch': burst(0.04, 2500, 0.25, 'highpass'); break;
      case 'key': burst(0.05, 3000, 0.25, 'highpass'); burst(0.06, 1500, 0.2, 'bandpass', 0.08); break;
      case 'notch': burst(0.03, 1800, 0.18, 'bandpass'); break;
      case 'dj': burst(0.12, 400, 0.6, 'lowpass'); tone(90, 0.15, 'square', 0.12); break;
      case 'park': burst(0.5, 900, 0.25, 'bandpass'); break;
      case 'refus': tone(220, 0.12, 'square', 0.08); tone(180, 0.15, 'square', 0.08, 0.13); break;
      case 'crank': for (let i = 0; i < 12; i++) burst(0.08, 120 + i * 8, 0.35, 'lowpass', i * 0.24); break;
      case 'horn': {
        const d = arg || 1.1;
        tone(311, d, 'sawtooth', 0.09); tone(370, d, 'sawtooth', 0.08); tone(466, d * 0.98, 'sawtooth', 0.05);
        break;
      }
      case 'whistle': for (let i = 0; i < 2; i++) { tone(2950, 0.32, 'sine', 0.12, i * 0.45); tone(3050, 0.32, 'sine', 0.06, i * 0.45); } break;
      case 'acq': tone(1200, 0.06, 'sine', 0.15); break;
      case 'bip': tone(1000, 0.08, 'square', 0.08); tone(1000, 0.08, 'square', 0.08, 0.14); break;
      case 'rs': tone(1400, 0.5, 'triangle', 0.18); tone(1050, 0.5, 'triangle', 0.12, 0.5); break;
      case 'fu': burst(2.2, 600, 0.6, 'highpass'); tone(700, 0.4, 'square', 0.1); tone(700, 0.4, 'square', 0.1, 0.6); break;
      case 'doorsopen': burst(0.6, 700, 0.2, 'bandpass'); tone(880, 0.1, 'sine', 0.1); break;
      case 'doorsclose': for (let i = 0; i < 5; i++) tone(1040, 0.12, 'sine', 0.12, i * 0.3); burst(0.5, 600, 0.25, 'bandpass', 1.5); break;
      case 'lock': burst(0.08, 400, 0.4, 'lowpass'); break;
      case 'chime': tone(659, 0.35, 'sine', 0.14); tone(523, 0.35, 'sine', 0.14, 0.38); tone(784, 0.6, 'sine', 0.14, 0.76); break;
      case 'joint': burst(0.05, 180 + Math.random() * 40, 0.25 * (arg || 1), 'lowpass'); burst(0.05, 200, 0.2 * (arg || 1), 'lowpass', 0.07); break;
      case 'whoosh': burst(2.5, 400, 0.6 * (arg || 1), 'lowpass'); break;
    }
  };

  // mise à jour continue
  A.update = function (dt, P, cfg, scale) {
    if (!ok) return;
    const t = ctx.currentTime;
    const v = P.v, vk = v * 3.6;
    const elec = cfg.loco.trac === 'elec';
    const load = Math.abs(P.manip) * (P.tracForce > 0 || P.ebForce > 0 ? 1 : 0.15);
    if (elec) {
      const on = P.dj ? 1 : 0;
      eng.o1.frequency.setTargetAtTime(60 + vk * 7, t, 0.1);
      eng.o2.frequency.setTargetAtTime(30 + vk * 3.6 + (P.aux ? 4 : 0), t, 0.1);
      eng.f.frequency.setTargetAtTime(400 + vk * 9, t, 0.1);
      eng.g.gain.setTargetAtTime(on * (0.012 + 0.05 * load + (P.aux ? 0.01 : 0)), t, 0.15);
      eng.n.g.gain.setTargetAtTime(on * P.aux * 0.04, t, 0.3);
    } else {
      const run = P.engine === 'run' ? 1 : P.engine === 'crank' ? 0.6 : 0;
      const rpm = P.rpm;
      eng.o1.frequency.setTargetAtTime(rpm / 60 * 3, t, 0.1);
      eng.o2.frequency.setTargetAtTime(rpm / 60 * 1.5, t, 0.1);
      eng.f.frequency.setTargetAtTime(180 + rpm * 0.25, t, 0.1);
      eng.g.gain.setTargetAtTime(run * (0.05 + 0.08 * Math.max(0, P.manip)), t, 0.15);
      eng.n.f.frequency.setTargetAtTime(80 + rpm * 0.1, t, 0.2);
      eng.n.g.gain.setTargetAtTime(run * (0.12 + 0.12 * Math.max(0, P.manip)), t, 0.2);
    }
    roll.g.gain.setTargetAtTime(Math.min(0.5, vk / 220) * 0.6, t, 0.2);
    roll.f.frequency.setTargetAtTime(150 + vk * 4, t, 0.2);
    comp.g.gain.setTargetAtTime(P.cpRun ? 0.25 : 0, t, 0.2);
    // alarme VACMA et survitesse
    const al = P.vacAlarm || P.vacTest === 2;
    alarm.frequency.value = P.overWarn && !al ? 1200 : 880;
    alarm.g.gain.setTargetAtTime(al ? (Math.sin(t * 12) > 0 ? 0.08 : 0) : P.overWarn ? (Math.sin(t * 8) > 0.5 ? 0.04 : 0) : 0, t, 0.01);
    // joints de rail (ligne classique)
    if (v > 1 && !TS.Sim.route().isLGV(P.s) && scale <= 2) {
      if (P.s - lastJoint > 36) { lastJoint = P.s - (P.s % 36); A.fx('joint', Math.min(1, vk / 80)); }
    } else lastJoint = P.s;
  };
  return A;
})();

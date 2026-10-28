/* Audio : tout est synthétisé avec la Web Audio API (aucun fichier). Moteur (dents de scie + sous-harmonique + filtre),
   turbo et décharge, bruit de roulage par surface (filtre de bruit), vent, pluie, claquements d'échappement, impacts. */
import { SURFACES } from '../surfaces/surfaces.js';
import { clamp } from '../core/util.js';

export class GameAudio {
  constructor() { this.ctx = null; this.vol = 0.7; this.on = false; this.cabin = false; }

  /* à appeler après un geste utilisateur (clic / touche) */
  init() {
    if (this.ctx) { this.ctx.resume?.(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const c = this.ctx = new AC();
    this.master = c.createGain(); this.master.gain.value = this.vol;
    this.lp = c.createBiquadFilter(); this.lp.type = 'lowpass'; this.lp.frequency.value = 18000; // cabine : sons étouffés
    this.master.connect(this.lp); this.lp.connect(c.destination);
    // bruit blanc partagé
    const n = c.sampleRate * 2, buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    this.noiseBuf = buf;
    // moteur
    const eg = this.eg = c.createGain(); eg.gain.value = 0;
    this.ef = c.createBiquadFilter(); this.ef.type = 'lowpass'; this.ef.Q.value = 1.2; this.ef.frequency.value = 800;
    this.o1 = c.createOscillator(); this.o1.type = 'sawtooth'; this.o2 = c.createOscillator(); this.o2.type = 'sawtooth'; this.o3 = c.createOscillator(); this.o3.type = 'square';
    this.g1 = c.createGain(); this.g2 = c.createGain(); this.g3 = c.createGain(); this.g1.gain.value = 0.5; this.g2.gain.value = 0.35; this.g3.gain.value = 0.12;
    this.o1.connect(this.g1); this.o2.connect(this.g2); this.o3.connect(this.g3); this.g1.connect(this.ef); this.g2.connect(this.ef); this.g3.connect(this.ef); this.ef.connect(eg); eg.connect(this.master);
    [this.o1, this.o2, this.o3].forEach((o) => o.start());
    // turbo
    this.to = c.createOscillator(); this.to.type = 'sine'; this.tg = c.createGain(); this.tg.gain.value = 0; this.to.connect(this.tg); this.tg.connect(this.master); this.to.start();
    // bruits filtrés : roulage, vent, pluie
    const mk = (type, f, q) => { const s = c.createBufferSource(); s.buffer = buf; s.loop = true; const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const g = c.createGain(); g.gain.value = 0; s.connect(fl); fl.connect(g); g.connect(this.master); s.start(); return { fl, g }; };
    this.roll = mk('bandpass', 600, 0.8); this.slide = mk('bandpass', 900, 1.5); this.wind = mk('lowpass', 900, 0.4); this.rain = mk('highpass', 3500, 0.5); this.rain.g.gain.value = 0;
    this.on = true; this.lastPop = 0;
  }
  setVolume(v) { this.vol = v; if (this.master) this.master.gain.value = v; }
  setCabin(b) { this.cabin = b; if (this.lp) this.lp.frequency.setTargetAtTime(b ? 4200 : 18000, this.ctx.currentTime, 0.05); }
  suspend() { this.ctx?.suspend?.(); } resume() { this.ctx?.resume?.(); }
  silence() { if (!this.on) return; const t = this.ctx.currentTime; this.eg.gain.setTargetAtTime(0, t, 0.05); this.tg.gain.setTargetAtTime(0, t, 0.05); this.roll.g.gain.setTargetAtTime(0, t, 0.05); this.slide.g.gain.setTargetAtTime(0, t, 0.05); this.wind.g.gain.setTargetAtTime(0, t, 0.05); this.rain.g.gain.setTargetAtTime(0, t, 0.05); }

  /* état continu : appelé à chaque image */
  update(ph, def, weather, dt) {
    if (!this.on) return; const c = this.ctx, t = c.currentTime, S = (v) => 0.04;
    const f0 = ph.rpm / 30; // 4 cylindres : fréquence d'allumage
    const thr = ph.throttle, load = clamp(thr, 0, 1), dead = ph.dead;
    this.o1.frequency.setTargetAtTime(f0, t, 0.03); this.o2.frequency.setTargetAtTime(f0 * 0.5 * 1.004, t, 0.03); this.o3.frequency.setTargetAtTime(f0 * 2, t, 0.03);
    this.ef.frequency.setTargetAtTime(350 + load * 1800 + ph.rpm * 0.35, t, 0.05);
    const dmgRough = ph.dmg.engine / 100;
    this.eg.gain.setTargetAtTime(dead ? 0.0 : 0.1 + load * 0.2 + ph.rpm / def.rpmMax * 0.08 + dmgRough * 0.04, t, 0.04);
    // turbo : sifflement proportionnel à la pression
    this.to.frequency.setTargetAtTime(1500 + ph.boost * 3200, t, 0.08); this.tg.gain.setTargetAtTime(def.turbo ? ph.boost * 0.035 : 0, t, 0.08);
    // claquements d'échappement à la décélération
    if (def.turbo && thr < 0.05 && ph.rpm > 4200 && !dead && t - this.lastPop > 0.12 && Math.random() < dt * 9) { this.lastPop = t; this.burst(0.07, 0.03, 700, 0.3); }
    // roulage : bruit selon la surface sous la voiture, plus fort en glissade
    const S0 = SURFACES[ph.surfMain], sp = ph.speed, slide = Math.max(...ph.slide);
    this.roll.fl.frequency.setTargetAtTime(S0.snd.f + sp * 8, t, 0.1); this.roll.g.gain.setTargetAtTime(ph.air ? 0 : clamp(sp / 40, 0, 1) * 0.18 * S0.snd.g, t, 0.1);
    this.slide.fl.frequency.setTargetAtTime(S0.snd.f * 0.8 + 400, t, 0.08); this.slide.g.gain.setTargetAtTime(ph.air ? 0 : slide * clamp(sp / 12, 0, 1) * 0.28 * (0.5 + S0.snd.g), t, 0.06);
    this.wind.fl.frequency.setTargetAtTime(500 + sp * 18, t, 0.1); this.wind.g.gain.setTargetAtTime(clamp((sp / 55) ** 2, 0, 1) * 0.3, t, 0.1);
    if (weather === 'pluie') this.rain.g.gain.setTargetAtTime(0.05, t, 0.4); else this.rain.g.gain.setTargetAtTime(0, t, 0.4);
  }

  /* sons ponctuels */
  burst(vol, dur, freq, q = 1, type = 'bandpass') {
    if (!this.on) return; const c = this.ctx, t = c.currentTime, s = c.createBufferSource(); s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  tone(freq, dur, vol = 0.15, type = 'sine', slide = 0) {
    if (!this.on) return; const c = this.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.05);
  }
  impact(sev) { const v = clamp(sev / 14, 0.1, 1); this.burst(0.5 * v, 0.35, 220, 0.6, 'lowpass'); this.tone(90, 0.25, 0.4 * v, 'sine', -50); if (sev > 6) this.burst(0.25 * v, 0.5, 2400, 0.8, 'bandpass'); }
  land(v) { this.burst(0.35 * clamp(v / 10, 0.2, 1), 0.3, 160, 0.6, 'lowpass'); this.tone(70, 0.2, 0.3, 'sine', -30); }
  shift() { this.burst(0.05, 0.05, 1200, 1); }
  puncture() { this.burst(0.5, 0.5, 3500, 0.7, 'highpass'); }
  splash() { this.burst(0.12, 0.25, 1500, 0.5); }
  beep(n) { this.tone(n === 0 ? 1320 : 880, n === 0 ? 0.55 : 0.18, 0.2, 'square'); }
  checkpoint() { this.tone(1046, 0.12, 0.18, 'triangle'); setTimeout(() => this.tone(1568, 0.18, 0.18, 'triangle'), 110); }
  finish() { [0, 120, 240, 420].forEach((d, i) => setTimeout(() => this.tone([784, 988, 1175, 1568][i], 0.3, 0.2, 'triangle'), d)); }
  penalty() { this.tone(220, 0.35, 0.22, 'sawtooth', -60); }
  click() { this.tone(660, 0.05, 0.08, 'square'); }
}

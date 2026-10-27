/**
 * Son entièrement synthétisé (Web Audio) : moteur, crissement de pneus, impacts, jingles et musique.
 * Aucun fichier audio. Le contexte démarre au premier appui sur une touche (règle des navigateurs).
 */
class Sound {
  constructor() {
    this.ctx = null;
    this.muted = (() => { try { return localStorage.getItem('driftzone.mute') === '1'; } catch { return false; } })();
    this.musicOn = true;
  }

  start() {
    if (this.ctx) { this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.8;
    this.master.connect(ctx.destination);

    // bruit blanc partagé
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.noise = buf;

    // moteur : deux oscillateurs légèrement désaccordés dans un passe-bas
    this.engineGain = ctx.createGain(); this.engineGain.gain.value = 0;
    this.engineFilter = ctx.createBiquadFilter(); this.engineFilter.type = 'lowpass'; this.engineFilter.frequency.value = 600;
    this.osc1 = ctx.createOscillator(); this.osc1.type = 'sawtooth';
    this.osc2 = ctx.createOscillator(); this.osc2.type = 'square';
    this.osc1.connect(this.engineFilter); this.osc2.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain); this.engineGain.connect(this.master);
    this.osc1.start(); this.osc2.start();

    // crissement : bruit filtré, volume selon le glissement
    this.squealGain = ctx.createGain(); this.squealGain.gain.value = 0;
    this.squealFilter = ctx.createBiquadFilter(); this.squealFilter.type = 'bandpass'; this.squealFilter.Q.value = 3;
    const sq = ctx.createBufferSource(); sq.buffer = this.noise; sq.loop = true;
    sq.connect(this.squealFilter); this.squealFilter.connect(this.squealGain); this.squealGain.connect(this.master);
    sq.start();

    this.musicGain = ctx.createGain(); this.musicGain.gain.value = 0.35;
    this.musicGain.connect(this.master);
    this.step = 0;
    this.nextTime = ctx.currentTime + 0.1;
    this.timer = setInterval(() => this.schedule(), 30);
  }

  /** Appelé à chaque image : voiture, gaz (0..1), intensité de glissement (0..1). */
  update(car, throttle, slip) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const ratio = Math.min(car.speed / 700, 1);
    const f = 55 + ratio * 150 + throttle * 25;
    this.osc1.frequency.setTargetAtTime(f, t, 0.05);
    this.osc2.frequency.setTargetAtTime(f * 1.005 + 0.5, t, 0.05);
    this.engineFilter.frequency.setTargetAtTime(350 + ratio * 900 + throttle * 500, t, 0.08);
    this.engineGain.gain.setTargetAtTime(0.02 + 0.02 * throttle + 0.012 * ratio, t, 0.06);
    this.squealFilter.frequency.setTargetAtTime(1100 + ratio * 900 + Math.abs(car.driftAngle) * 500, t, 0.05);
    this.squealGain.gain.setTargetAtTime(Math.min(slip * 0.45, 0.45), t, 0.05);
  }

  impact(speed, heavy = true) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime, k = Math.min(speed / 400, 1.2);
    const src = this.ctx.createBufferSource(); src.buffer = this.noise;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = heavy ? 500 : 1800;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.5 * k, t); g.gain.exponentialRampToValueAtTime(0.001, t + (heavy ? 0.3 : 0.12));
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t, Math.random()); src.stop(t + 0.35);
    if (heavy) this.tone(70, 0.25, 'sine', 0.5 * k, 40);
  }

  /** Jingles : 'near' (frôlé), 'bank' (points validés), 'lost' (choc). */
  cue(kind) {
    if (kind === 'near') this.tone(880, 0.12, 'triangle', 0.18);
    else if (kind === 'bank') { this.tone(660, 0.12, 'triangle', 0.18); setTimeout(() => this.tone(990, 0.18, 'triangle', 0.18), 90); }
  }

  tone(freq, dur, type = 'sine', vol = 0.2, endFreq) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  }

  // --- musique : 96 BPM, boucle de 16 pas (kick, hi-hat, basse en la mineur, arpège doux) ---
  schedule() {
    const ctx = this.ctx, spb = 60 / 96 / 4;
    while (this.nextTime < ctx.currentTime + 0.15) {
      if (this.musicOn) this.playStep(this.step % 16, this.nextTime);
      this.nextTime += spb;
      this.step++;
    }
  }

  playStep(s, t) {
    const ctx = this.ctx;
    const out = this.musicGain;
    const env = (g, vol, dur) => { g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); };
    if (s % 4 === 0) { // kick
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
      env(g, 0.9, 0.2); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.22);
    }
    if (s % 2 === 1) { // hi-hat
      const src = ctx.createBufferSource(); src.buffer = this.noise;
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000;
      const g = ctx.createGain(); env(g, 0.18, 0.05);
      src.connect(f); f.connect(g); g.connect(out); src.start(t, Math.random()); src.stop(t + 0.06);
    }
    const bar = Math.floor(this.step / 16) % 4;
    const root = [55, 55, 43.65, 49][bar]; // la, la, fa, sol
    if ([0, 3, 6, 10, 12].includes(s)) { // basse
      const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = root * (s === 10 ? 1.5 : 1);
      f.type = 'lowpass'; f.frequency.value = 400; env(g, 0.35, 0.25);
      o.connect(f); f.connect(g); g.connect(out); o.start(t); o.stop(t + 0.28);
    }
    if (s % 2 === 0) { // arpège
      const notes = [2, 2.4, 3, 3.6, 4, 3.6, 3, 2.4];
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = root * notes[(s / 2) % 8] * 2;
      env(g, 0.12, 0.3); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.32);
    }
  }

  setPaused(p) {
    if (!this.ctx) return;
    if (p) this.ctx.suspend(); else this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    try { localStorage.setItem('driftzone.mute', this.muted ? '1' : '0'); } catch { /* ignoré */ }
    if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : 0.8, this.ctx.currentTime, 0.05);
    return this.muted;
  }
}

/* Sons synthétisés (Web Audio) : moteur discret lié à la vitesse, bip d'avertissement, choc, réussite. Aucun fichier externe. */
export class GameAudio {
  constructor() { this.ctx = null; this.vol = 0.7; }

  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const ctx = this.ctx = new AC();
    this.master = ctx.createGain(); this.master.gain.value = this.vol; this.master.connect(ctx.destination);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.connect(this.master);
    this.eng = ctx.createGain(); this.eng.gain.value = 0; this.eng.connect(lp); this.lp = lp;
    this.o1 = ctx.createOscillator(); this.o1.type = 'sawtooth'; this.o2 = ctx.createOscillator(); this.o2.type = 'triangle';
    this.o1.connect(this.eng); this.o2.connect(this.eng); this.o1.start(); this.o2.start();
    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = this.noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  /* speed en m/s, throttle 0..1 ; alive : false en pause ou à l'écran de fin */
  engine(speed, throttle, alive) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime, rpm = 850 + Math.min(1, Math.abs(speed) / 11) * 2600 + throttle * 600, f = rpm / 60 * 2;
    this.o1.frequency.setTargetAtTime(f, t, 0.06); this.o2.frequency.setTargetAtTime(f * 0.5, t, 0.06);
    this.lp.frequency.setTargetAtTime(380 + rpm * 0.18, t, 0.08);
    this.eng.gain.setTargetAtTime(alive ? 0.05 + 0.05 * throttle : 0, t, 0.1);
  }
  setVolume(v) { this.vol = v; if (this.master) this.master.gain.value = v; }

  tone(f, dur, type = 'sine', g = 0.2, when = 0, slide = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + when, o = this.ctx.createOscillator(), a = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(f * slide, t + dur);
    a.gain.setValueAtTime(g, t); a.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(a); a.connect(this.master); o.start(t); o.stop(t + dur + 0.05);
  }
  warn() { this.tone(520, 0.14, 'square', 0.12); this.tone(520, 0.14, 'square', 0.12, 0.2); this.thud(0.3); }
  crash() { this.thud(1); this.tone(110, 0.5, 'sawtooth', 0.25, 0, 0.4); }
  success(stars) { const n = [0, 4, 7, 12, 16]; for (let i = 0; i < 2 + stars; i++) this.tone(523 * 2 ** (n[i] / 12), 0.35, 'triangle', 0.2, i * 0.13); }
  click() { this.tone(660, 0.06, 'triangle', 0.1); }
  thud(k) {
    if (!this.ctx) return;
    const s = this.ctx.createBufferSource(), g = this.ctx.createGain(), f = this.ctx.createBiquadFilter();
    s.buffer = this.noise; f.type = 'lowpass'; f.frequency.value = 260; g.gain.setValueAtTime(0.5 * k, this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
    s.connect(f); f.connect(g); g.connect(this.master); s.start();
  }
}

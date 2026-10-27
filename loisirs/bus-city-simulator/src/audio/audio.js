// Web Audio, aucun fichier. Le contexte démarre au premier appui (politique d'autoplay).
export class GameAudio {
  constructor() { this.ctx = null; }

  unlock() {
    if (this.ctx) { this.ctx.resume?.(); return; }
    const ctx = this.ctx = new AudioContext();
    const out = this.out = ctx.createGain(); out.gain.value = 0.7; out.connect(ctx.destination);
    const make = (type, f) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.start(); return o; };
    // moteur : dent de scie filtrée + sinus pour l'électrique
    this.engine = { o: make('sawtooth', 50), o2: make('square', 25), g: ctx.createGain(), f: ctx.createBiquadFilter() };
    this.engine.f.type = 'lowpass'; this.engine.f.frequency.value = 400; this.engine.g.gain.value = 0;
    this.engine.o.connect(this.engine.f); this.engine.o2.connect(this.engine.f); this.engine.f.connect(this.engine.g); this.engine.g.connect(out);
    this.ev = { o: make('sine', 200), g: ctx.createGain() }; this.ev.g.gain.value = 0; this.ev.o.connect(this.ev.g); this.ev.g.connect(out);
    // klaxon
    this.horn = ctx.createGain(); this.horn.gain.value = 0; this.horn.connect(out);
    for (const f of [400, 500]) make('sawtooth', f).connect(this.horn);
    // pluie : bruit blanc filtré
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; src.start();
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3000;
    this.rain = ctx.createGain(); this.rain.gain.value = 0;
    src.connect(bp); bp.connect(this.rain); this.rain.connect(out);
    this.noise = buf;
  }

  update({ speed, throttle, electric, rain, horn, paused }) {
    const c = this.ctx;
    if (!c) return;
    const t = c.currentTime, v = Math.abs(speed), k = paused ? 0 : 1;
    const rpm = 28 + v * 3.2 + throttle * 12;
    this.engine.o.frequency.setTargetAtTime(rpm, t, 0.08); this.engine.o2.frequency.setTargetAtTime(rpm / 2, t, 0.08);
    this.engine.f.frequency.setTargetAtTime(250 + throttle * 500 + v * 20, t, 0.1);
    this.engine.g.gain.setTargetAtTime(electric ? 0 : k * (0.07 + throttle * 0.07), t, 0.1);
    this.ev.o.frequency.setTargetAtTime(180 + v * 38, t, 0.1);
    this.ev.g.gain.setTargetAtTime(electric ? k * Math.min(0.05, 0.004 + v * 0.002) : 0, t, 0.1);
    this.horn.gain.setTargetAtTime(horn ? 0.08 : 0, t, 0.02);
    this.rain.gain.setTargetAtTime(k * rain * 0.12, t, 0.5);
  }

  beep(freq, dur = 0.1, type = 'sine', vol = 0.15) {
    const c = this.ctx;
    if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g); g.connect(this.out); o.start(); o.stop(c.currentTime + dur);
  }
  ticket() { this.beep(1200, 0.08); setTimeout(() => this.beep(1600, 0.12), 80); }
  doors() { this.beep(300, 0.25, 'square', 0.06); }
  tick() { this.beep(1800, 0.02, 'square', 0.04); }
  chime() { this.beep(880, 0.2); setTimeout(() => this.beep(1175, 0.3), 180); }
  thud() {
    const c = this.ctx;
    if (!c) return;
    const s = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
    s.buffer = this.noise; f.type = 'lowpass'; f.frequency.value = 400;
    g.gain.setValueAtTime(0.5, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.4);
    s.connect(f); f.connect(g); g.connect(this.out); s.start(); s.stop(c.currentTime + 0.4);
  }
}

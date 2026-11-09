// Web Audio, aucun fichier : moteur diesel (régime, charge), hydraulique des outils, bip de recul, raclement du godet, chute de pierres,
// concasseur (selon la distance), klaxon, pluie, impacts, tir de mine. Le contexte démarre au premier appui (politique d'autoplay).
export class GameAudio {
  constructor() { this.ctx = null; this.vol = 0.7; }
  unlock() {
    if (this.ctx) { this.ctx.resume?.(); return; }
    const ctx = this.ctx = new AudioContext();
    const out = this.out = ctx.createGain(); out.gain.value = this.vol; out.connect(ctx.destination);
    const make = (type, f) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.start(); return o; };
    const buf = this.noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const noiseSrc = (type, f, q = 1) => { const n = ctx.createBufferSource(); n.buffer = buf; n.loop = true; n.start(Math.random()); const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const g = ctx.createGain(); g.gain.value = 0; n.connect(fl); fl.connect(g); g.connect(out); return { g, f: fl }; };
    // moteur diesel : dent de scie + carré une octave plus bas, filtrés ; un LFO donne le ralenti irrégulier
    this.eng = { o: make('sawtooth', 40), o2: make('square', 20), g: ctx.createGain(), f: ctx.createBiquadFilter() };
    this.eng.f.type = 'lowpass'; this.eng.f.frequency.value = 380; this.eng.g.gain.value = 0;
    this.eng.o.connect(this.eng.f); this.eng.o2.connect(this.eng.f); this.eng.f.connect(this.eng.g); this.eng.g.connect(out);
    this.lfo = make('sine', 11); const lg = ctx.createGain(); lg.gain.value = 5; this.lfo.connect(lg); lg.connect(this.eng.o.frequency);
    this.horn = ctx.createGain(); this.horn.gain.value = 0; this.horn.connect(out); for (const f of [330, 415]) make('sawtooth', f).connect(this.horn);
    this.hyd = noiseSrc('bandpass', 700, 3); this.scrape = noiseSrc('bandpass', 420, 0.8); this.rain = noiseSrc('bandpass', 3000); this.crush = noiseSrc('lowpass', 260, 1.5);
    this.fall = noiseSrc('bandpass', 900, 0.6);
    this.bip = ctx.createGain(); this.bip.gain.value = 0; this.bip.connect(out); make('square', 1000).connect(this.bip);
    this.crushO = make('sawtooth', 52); const cg = ctx.createGain(); cg.gain.value = 0; this.crushO.connect(cg); cg.connect(out); this.crushG = cg;
  }
  update({ speed = 0, thr = 0, horn = false, paused = false, tool = 0, dig = 0, pour = 0, rain = 0, reversing = false, crusher = 0, running = true, kind = 'wheel' }) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime, k = paused ? 0 : 1, v = Math.abs(speed);
    const rpm = (running ? 26 + v * (kind === 'tracked' ? 6 : 2.8) + thr * 14 + tool * 5 : 0);
    this.eng.o.frequency.setTargetAtTime(Math.max(1, rpm), t, 0.1); this.eng.o2.frequency.setTargetAtTime(Math.max(1, rpm / 2), t, 0.1);
    this.eng.f.frequency.setTargetAtTime(240 + thr * 520 + v * 18, t, 0.1); this.eng.g.gain.setTargetAtTime(running ? k * (0.07 + thr * 0.08 + tool * 0.03) : 0, t, 0.12);
    this.horn.gain.setTargetAtTime(horn && k ? 0.07 : 0, t, 0.02);
    this.hyd.g.gain.setTargetAtTime(k * Math.min(1, tool) * 0.09, t, 0.06); this.hyd.f.frequency.setTargetAtTime(500 + tool * 500, t, 0.1);
    this.scrape.g.gain.setTargetAtTime(k * Math.min(1, dig * 40) * 0.22, t, 0.05);
    this.fall.g.gain.setTargetAtTime(k * Math.min(1, pour * 25) * 0.3, t, 0.04);
    this.rain.g.gain.setTargetAtTime(k * rain * 0.1, t, 0.5);
    this.bip.gain.setValueAtTime(k && reversing && running && Math.floor(t * 2) % 2 ? 0.035 : 0, t);
    this.crush.g.gain.setTargetAtTime(k * crusher * 0.5, t, 0.2); this.crushG.gain.setTargetAtTime(k * crusher * 0.04, t, 0.2);
    this.crushO.frequency.setValueAtTime(48 + Math.sin(t * 7) * 5, t);
  }
  beep(freq, dur = 0.1, type = 'sine', vol = 0.15) {
    const c = this.ctx; if (!c) return;
    const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g); g.connect(this.out); o.start(); o.stop(c.currentTime + dur);
  }
  chime() { this.beep(880, 0.2); setTimeout(() => this.beep(1175, 0.3), 180); }
  cash() { this.beep(1400, 0.08, 'triangle', 0.12); setTimeout(() => this.beep(1900, 0.18, 'triangle', 0.12), 90); }
  warn() { this.beep(520, 0.25, 'square', 0.06); setTimeout(() => this.beep(520, 0.25, 'square', 0.06), 320); }
  click() { this.beep(1200, 0.03, 'square', 0.05); }
  burst(dur, f, vol, from = 0.6) {
    const c = this.ctx; if (!c) return;
    const s = c.createBufferSource(), g = c.createGain(), fl = c.createBiquadFilter(); s.buffer = this.noise; fl.type = 'lowpass'; fl.frequency.value = f;
    g.gain.setValueAtTime(vol, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur); s.connect(fl); fl.connect(g); g.connect(this.out); s.start(c.currentTime, from); s.stop(c.currentTime + dur);
  }
  thud(power = 1) { this.burst(0.4, 380, Math.min(0.7, 0.2 * power)); }
  blast() { this.burst(2.2, 160, 1); this.beep(46, 1.2, 'sine', 0.5); }
  siren(n = 3) { for (let i = 0; i < n * 2; i++) setTimeout(() => this.beep(i % 2 ? 880 : 660, 0.3, 'square', 0.07), i * 360); }
  setVolume(v) { this.vol = v; if (this.out) this.out.gain.value = v; }
}

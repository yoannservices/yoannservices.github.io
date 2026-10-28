/* Audio 100 % Web Audio : vent, roulement selon la surface, roue libre, freins, réceptions, crashs, figures, musique générative. */
export class Sfx {
  constructor() { this.ctx = null; this.vol = 0.7; this.sp = 0; this.surf = 0; this.air = false; this.brake = 0; this.nextClick = 0; }
  start() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const c = this.ctx = new (window.AudioContext || window.webkitAudioContext)(); this.master = c.createGain(); this.master.gain.value = this.vol; this.master.connect(c.destination);
    const len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; this.noise = buf;
    const loop = (type, freq, q) => { const s = c.createBufferSource(); s.buffer = buf; s.loop = true; const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; const g = c.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(this.master); s.start(); return { f, g }; };
    this.wind = loop('bandpass', 600, 0.6); this.roll = loop('lowpass', 500, 0.7); this.squeal = loop('bandpass', 2600, 6); this.whoosh = loop('bandpass', 1100, 1.2);
    this.music = c.createGain(); this.music.gain.value = 0.18; this.music.connect(this.master); this._musicT = c.currentTime + 0.2; this._chord = 0;
  }
  setVolume(v) { this.vol = v; if (this.master) this.master.gain.value = v; }
  /* état continu : appelé à chaque image */
  update(dt, { speed, surf, grounded, braking, sliding, manual }) {
    if (!this.ctx) return; const c = this.ctx, t = c.currentTime, s = Math.min(1, speed / 20);
    this.wind.g.gain.setTargetAtTime(s * s * 0.35, t, 0.1); this.wind.f.frequency.setTargetAtTime(400 + s * 1800, t, 0.1);
    const rough = [0.18, 0.1, 0.3, 0.14, 0.05, 0.2][surf] ?? 0.15;
    this.roll.g.gain.setTargetAtTime(grounded ? rough * Math.min(1, speed / 8) : 0, t, 0.05); this.roll.f.frequency.setTargetAtTime(240 + speed * 55 + (surf === 1 ? 500 : 0), t, 0.1);
    this.squeal.g.gain.setTargetAtTime(grounded && (braking || sliding) && speed > 4 ? 0.06 * Math.min(1, speed / 12) : 0, t, 0.04); this.squeal.f.frequency.setTargetAtTime(2200 + speed * 60, t, 0.1);
    this.whoosh.g.gain.setTargetAtTime(!grounded ? s * 0.25 : 0, t, 0.15);
    // roue libre : clics réguliers quand on roule sans pédaler
    if (grounded && speed > 2 && t > this.nextClick) { this._tick(1900 + Math.random() * 400, 0.015, 0.05); this.nextClick = t + Math.max(0.02, 0.14 - speed * 0.006); }
    // musique : accord lent + arpège léger
    if (t > this._musicT - 0.1) this._musicStep();
  }
  _tick(f, dur, vol) { const c = this.ctx, o = c.createOscillator(), g = c.createGain(), t = c.currentTime; o.type = 'square'; o.frequency.value = f; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur); }
  _burst(dur, vol, freq, type = 'lowpass') { const c = this.ctx, s = c.createBufferSource(); s.buffer = this.noise; const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; const g = c.createGain(), t = c.currentTime; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(this.master); s.start(t, Math.random()); s.stop(t + dur); }
  _tone(f0, f1, dur, vol, type = 'sine', delay = 0) { const c = this.ctx, o = c.createOscillator(), g = c.createGain(), t = c.currentTime + delay; o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02); }
  takeoff() { if (this.ctx) this._burst(0.25, 0.18, 900, 'bandpass'); }
  land(q, impact) {
    if (!this.ctx) return; const v = Math.min(1, impact / 14);
    this._tone(110, 38, 0.28, 0.5 * (0.4 + v), 'sine'); this._burst(0.22, 0.25 * (0.4 + v), q === 'sketchy' ? 1800 : 700);
    if (q === 'perfect') { this._tone(880, 880, 0.18, 0.12, 'triangle', 0.05); this._tone(1320, 1320, 0.25, 0.1, 'triangle', 0.12); }
  }
  crash() { if (!this.ctx) return; this._burst(0.6, 0.6, 1400); this._tone(90, 30, 0.5, 0.7, 'sine'); this._tone(60, 25, 0.7, 0.4, 'sawtooth', 0.05); }
  trick(n = 1) { if (!this.ctx) return; this._tone(660, 660, 0.12, 0.14, 'triangle'); this._tone(990 + n * 60, 990 + n * 60, 0.18, 0.12, 'triangle', 0.08); }
  checkpoint() { if (!this.ctx) return; this._tone(520, 520, 0.14, 0.15, 'sine'); this._tone(780, 780, 0.22, 0.15, 'sine', 0.1); }
  finish() { if (!this.ctx) return; [523, 659, 784, 1046].forEach((f, i) => this._tone(f, f, 0.35, 0.18, 'triangle', i * 0.12)); }
  click() { if (this.ctx) this._tone(700, 500, 0.06, 0.1, 'square'); }
  _musicStep() {
    const c = this.ctx, prog = [[0, 4, 7], [-4, 0, 3], [-2, 2, 5], [-5, -1, 2]], root = 110, ch = prog[this._chord % prog.length], t0 = this._musicT;
    ch.forEach((n, i) => { const o = c.createOscillator(), g = c.createGain(), f = root * Math.pow(2, n / 12) * (i ? 2 : 1); o.type = 'sawtooth'; o.frequency.value = f; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.1, t0 + 1); g.gain.linearRampToValueAtTime(0.0001, t0 + 3.9); o.connect(lp); lp.connect(g); g.connect(this.music); o.start(t0); o.stop(t0 + 4); });
    for (let k = 0; k < 8; k++) { const n = ch[k % 3] + 24, o = c.createOscillator(), g = c.createGain(); o.type = 'triangle'; o.frequency.value = root * Math.pow(2, n / 12); const t = t0 + k * 0.5; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.05, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45); o.connect(g); g.connect(this.music); o.start(t); o.stop(t + 0.5); }
    this._chord++; this._musicT = t0 + 4;
  }
}

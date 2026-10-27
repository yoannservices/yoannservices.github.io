// Sons 100 % Web Audio : bruit filtré (vent, glisse, grondement) + impacts synthétisés
export class Audio {
  constructor() { this.ctx = null; this.t = { wind: 0, glide: 0, gf: 1500, rumble: 0 }; }
  init() {
    if (this.ctx) { this.ctx.state === 'suspended' && this.ctx.resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    const a = (this.ctx = new C());
    this.master = a.createGain(); this.master.gain.value = 0.55; this.master.connect(a.destination);
    const buf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.noise = buf;
    const loop = (type, freq, q) => {
      const s = a.createBufferSource(); s.buffer = buf; s.loop = true;
      const f = a.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = a.createGain(); g.gain.value = 0;
      s.connect(f); f.connect(g); g.connect(this.master); s.start();
      return { f, g };
    };
    this.wind = loop('bandpass', 500, 0.6); this.glide = loop('bandpass', 1500, 0.8); this.rumble = loop('lowpass', 120, 1);
  }
  burst(freq, dur, vol, type = 'lowpass', sweepTo) {
    const a = this.ctx; if (!a) return;
    const s = a.createBufferSource(); s.buffer = this.noise;
    const f = a.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, a.currentTime);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, a.currentTime + dur);
    const g = a.createGain(); g.gain.setValueAtTime(vol, a.currentTime); g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(); s.stop(a.currentTime + dur);
  }
  tone(freq, dur, vol, type = 'triangle', to) {
    const a = this.ctx; if (!a) return;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, a.currentTime);
    if (to) o.frequency.exponentialRampToValueAtTime(to, a.currentTime + dur);
    g.gain.setValueAtTime(vol, a.currentTime); g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    o.connect(g); g.connect(this.master); o.start(); o.stop(a.currentTime + dur);
  }
  thump(impact) { const v = Math.min(1, impact / 14); this.burst(900, 0.25, 0.25 + v * 0.5, 'lowpass', 120); this.tone(90, 0.2, v * 0.5, 'sine', 40); }
  crash() { this.burst(2500, 0.7, 1, 'lowpass', 100); this.tone(70, 0.5, 0.7, 'sine', 30); }
  jump(j) { this.burst(1200, 0.18, 0.2, 'bandpass', 3000); }
  whoosh(f = 1) { this.burst(400, 0.6, 0.35 * f, 'bandpass', 2500); }
  ding(n = 1) { const b = 520 * (1 + Math.min(n, 12) * 0.08); this.tone(b, 0.18, 0.18); setTimeout(() => this.tone(b * 1.5, 0.22, 0.14), 70); }
  ui() { this.tone(660, 0.07, 0.1, 'square'); }
  setGlide(speed, snow, grounded) {
    this.t.glide = grounded ? Math.min(1, speed / 28) * (snow === 2 ? 0.5 : snow === 1 ? 0.32 : 0.2) : 0;
    this.t.gf = 900 + speed * 70 + (snow === 2 ? 1500 : 0);
  }
  update(dt, p, weather, avalanche) {
    if (!this.ctx) return;
    const k = Math.min(1, dt * 6), now = this.ctx.currentTime;
    if (!(p.mode === 'ground' || p.mode === 'grind')) this.t.glide = 0;
    const alt = Math.min(1, Math.max(0, p.pos.y / 400));
    const wind = Math.min(1, p.speed / 60) * 0.5 + (weather.wind / 16) * 0.4 + alt * 0.08 + (p.mode === 'wing' ? 0.2 : 0);
    this.wind.g.gain.setTargetAtTime(wind * 0.6, now, 0.15);
    this.wind.f.frequency.setTargetAtTime(350 + p.speed * 28 + weather.wind * 30, now, 0.2);
    this.glide.g.gain.setTargetAtTime(this.t.glide, now, 0.1);
    this.glide.f.frequency.setTargetAtTime(this.t.gf, now, 0.1);
    this.rumble.g.gain.setTargetAtTime(avalanche.on ? 0.9 * Math.min(1, avalanche.trail.length / 8) : 0, now, 0.3);
    this.t.glide = 0;
  }
}

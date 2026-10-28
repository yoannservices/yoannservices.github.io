/* HUD : vitesse, score, combo, vies, objectifs, jauge de réception, annonces de figures, carte (M). */
import { fmt } from '../gameplay/Objectives.js';

const $ = (id) => document.getElementById(id);
const COL = (q) => (q > 0.66 ? '#35c759' : q > 0.35 ? '#ffd23f' : '#ff5d5d');

export class Hud {
  constructor() {
    this.el = { hud: $('hud'), mode: $('h-mode'), score: $('h-score'), time: $('h-time'), lives: $('h-lives'), obj: $('h-obj'), speed: $('h-speed'), line: $('h-line'), combo: $('h-combo'), names: $('h-names'), ctot: $('h-ctot'), cmult: $('h-cmult'), cbar: $('h-cbar'), pop: $('h-pop'), land: $('h-land'), landbar: $('h-landbar'), landtxt: $('h-landtxt'), hint: $('h-hint'), map: $('h-map'), toasts: $('toasts') };
    this.mapOn = false; this._objKey = '';
  }
  show(on) { this.el.hud.hidden = !on; }
  update(s) {
    const e = this.el;
    e.mode.textContent = s.free ? 'Mode libre' : `Run · ${s.diffName}`; e.score.textContent = s.free ? '—' : String(s.score).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    e.time.textContent = fmt(s.time); e.speed.textContent = Math.round(s.kmh);
    e.lives.textContent = s.free ? '' : '♥'.repeat(Math.max(0, s.lives)) + '♡'.repeat(Math.max(0, s.maxLives - s.lives));
    e.lives.style.color = s.lives <= 1 ? '#ff5d5d' : '#ff8a8a';
    e.line.textContent = s.risky ? '⚠ Ligne risquée' : '';
    const key = s.objectives.map((o) => o.done ? 1 : 0).join('') + s.free;
    if (key !== this._objKey) { this._objKey = key; e.obj.innerHTML = s.objectives.map((o) => `<div class="o ${o.done ? 'done' : ''}"><span>${o.done ? '✔' : '○'}</span>${o.label}</div>`).join(''); }
    const c = s.combo;
    if (!s.free && (c.n > 0 || c.pts > 0)) { e.combo.hidden = false; e.names.textContent = c.names.slice(-3).join(' · ') || 'Combo'; e.ctot.textContent = Math.round(c.pts * (1 + 0.5 * c.n)); e.cmult.textContent = 'x' + (1 + 0.5 * c.n).toFixed(1); e.cbar.style.width = Math.max(0, Math.min(100, c.t / 3.2 * 100)) + '%'; }
    else e.combo.hidden = true;
    if (s.gauge) { e.land.hidden = false; e.landbar.style.width = Math.round(s.gauge.quality * 100) + '%'; e.landbar.style.background = COL(s.gauge.quality); e.landtxt.textContent = s.gauge.quality > 0.66 ? 'Propre' : s.gauge.quality > 0.35 ? 'Limite' : 'Crash probable'; e.landtxt.style.color = COL(s.gauge.quality); }
    else e.land.hidden = true;
    e.hint.textContent = s.hint || '';
    if (this.mapOn) this.drawMap(s.track, s.bike);
  }
  pop(text, sub = '', color) {
    const d = document.createElement('span'); d.className = 't'; d.innerHTML = text + (sub ? `<small>${sub}</small>` : ''); if (color) d.style.color = color;
    this.el.pop.innerHTML = ''; this.el.pop.append(d);
  }
  toast(msg) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = msg; this.el.toasts.append(d); setTimeout(() => d.remove(), 3000); }

  toggleMap() { this.mapOn = !this.mapOn; this.el.map.hidden = !this.mapOn; }
  drawMap(track, bike) {
    if (!track) return; const cv = this.el.map, g = cv.getContext('2d'), W = cv.width;
    if (this._mapTrack !== track) {
      let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
      for (const l of track.lines) for (let i = 0; i < l.n; i++) { x0 = Math.min(x0, l.X[i]); x1 = Math.max(x1, l.X[i]); z0 = Math.min(z0, l.Z[i]); z1 = Math.max(z1, l.Z[i]); }
      const sc = (W - 40) / Math.max(x1 - x0, z1 - z0, 1); this._m = { x0, z0, sc, ox: 20 + (W - 40 - (x1 - x0) * sc) / 2, oz: 20 + (W - 40 - (z1 - z0) * sc) / 2 }; this._mapTrack = track;
    }
    const m = this._m, X = (x) => m.ox + (x - m.x0) * m.sc, Z = (z) => m.oz + (z - m.z0) * m.sc;
    g.clearRect(0, 0, W, W);
    for (const l of track.lines) { g.strokeStyle = l.risky ? '#ff5d5d' : '#d8dee8'; g.lineWidth = l.risky ? 2 : 3; g.beginPath(); for (let i = 0; i < l.n; i += 2) { const x = X(l.X[i]), z = Z(l.Z[i]); i ? g.lineTo(x, z) : g.moveTo(x, z); } g.stroke(); }
    g.fillStyle = '#35c759'; for (const c of track.checkpoints) { g.beginPath(); g.arc(X(c.x), Z(c.z), 3.5, 0, 7); g.fill(); }
    g.fillStyle = '#fff'; g.fillRect(X(track.finish.x) - 4, Z(track.finish.z) - 4, 8, 8);
    g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(X(bike.pos.x), Z(bike.pos.z), 5, 0, 7); g.fill();
  }
}

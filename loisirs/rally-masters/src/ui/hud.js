/* HUD : compteur et rapport, chrono, écart au meilleur temps, notes de pace en icônes, dégâts, position, carte. */
import { fmtTime, clamp } from '../core/util.js';
import { noteIcon } from '../rally/codriver.js';
import { WEATHERS } from '../surfaces/surfaces.js';

const $ = (id) => document.getElementById(id);
const hue = (v) => `hsl(${Math.round(120 * (1 - clamp(v, 0, 1)))} 75% 48%)`;

export class Hud {
  constructor() {
    this.root = $('hud'); this.el = {};
    for (const id of ['h-stage', 'h-time', 'h-delta', 'h-pen', 'h-notes', 'h-say', 'h-pos', 'h-weather', 'h-view', 'h-speed', 'h-unit', 'h-gear', 'h-rpm', 'h-turbo', 'h-turboW', 'i-lights', 'i-hand', 'h-progbar', 'h-map', 'h-count', 'h-msg', 'h-hint', 'd-health', 'toasts']) this.el[id] = $(id);
    this.dm = ['d-bf', 'd-br', 'd-en', 'd-st', 'd-bo', 'd-t0', 'd-t1', 'd-t2', 'd-t3'].reduce((o, k) => ((o[k] = $(k)), o), {});
    this.last = {}; this.sayT = 0; this.msgT = 0; this.mapPath = null; this.mapOn = false;
  }
  show(b) { this.root.hidden = !b; }
  /* ne réécrit le DOM que si la valeur change */
  set(id, v, prop = 'textContent') { if (this.last[id + prop] !== v) { this.last[id + prop] = v; this.el[id][prop] = v; } }
  setStage(label, weather, unit) { this.set('h-stage', label); this.set('h-weather', WEATHERS[weather].icon + ' ' + WEATHERS[weather].nom); this.set('h-unit', unit === 'mph' ? 'mph' : 'km/h'); }
  hint(t) { this.set('h-hint', t); }
  toast(t, cls = '') { const d = document.createElement('div'); d.className = 'toast ' + cls; d.textContent = t; this.el.toasts.append(d); setTimeout(() => d.remove(), 3200); }
  msg(t, ms = 2200) { this.el['h-msg'].textContent = t; this.el['h-msg'].classList.add('on'); this.msgT = ms / 1000; }
  say(t) { const e = this.el['h-say']; e.textContent = '🎙 ' + t; e.hidden = false; this.sayT = 3.2; }
  count(n) { const e = this.el['h-count']; e.textContent = n === 0 ? 'GO !' : String(n); e.className = n === 0 ? 'go on' : 'on'; setTimeout(() => e.classList.remove('on'), 800); }

  /* s : état de la course (voir main.js) */
  update(s, dt) {
    if (this.sayT > 0 && (this.sayT -= dt) <= 0) this.el['h-say'].hidden = true;
    if (this.msgT > 0 && (this.msgT -= dt) <= 0) this.el['h-msg'].classList.remove('on');
    this.set('h-time', fmtTime(s.time));
    if (s.delta == null) this.set('h-delta', ''); else { this.set('h-delta', (s.delta >= 0 ? '+' : '−') + Math.abs(s.delta).toFixed(2) + ' s'); this.el['h-delta'].className = 'delta ' + (s.delta <= 0 ? 'good' : 'bad'); }
    this.set('h-pen', s.pen > 0 ? `+${s.pen.toFixed(0)} s de pénalités` : '');
    this.set('h-pos', s.pos ? `P${s.pos}/${s.posTotal}` : 'P–');
    this.set('h-view', s.view);
    const spd = s.unit === 'mph' ? s.kmh * 0.621371 : s.kmh; this.set('h-speed', String(Math.round(spd)));
    this.set('h-gear', s.gear < 0 ? 'R' : s.gear === 0 ? 'N' : String(s.gear));
    this.el['h-rpm'].style.width = (clamp(s.rpm, 0, 1.02) * 100).toFixed(0) + '%'; this.el['h-rpm'].classList.toggle('red', s.rpm > 0.9);
    this.set('h-turboW', s.turbo ? 'on' : 'off', 'className'); this.el['h-turbo'].style.width = (clamp(s.boost, 0, 1) * 100).toFixed(0) + '%';
    this.el['i-lights'].classList.toggle('on', !!s.lights); this.el['i-hand'].classList.toggle('on', !!s.hand);
    this.el['h-progbar'].style.width = (clamp(s.progress, 0, 1) * 100).toFixed(1) + '%';
    // dégâts
    const d = s.dmg; this.dm['d-bf'].style.background = hue(d.bumpF / 100); this.dm['d-br'].style.background = hue(d.bumpR / 100);
    this.dm['d-en'].style.background = hue(d.engine / 100); this.dm['d-st'].style.background = hue(d.steer / 100); this.dm['d-bo'].style.background = hue(d.body / 100);
    for (let i = 0; i < 4; i++) this.dm['d-t' + i].style.background = d.tires[i] > 0 ? '#ef4444' : '#22c55e';
    this.set('d-health', Math.round(s.health * 100) + ' %');
    // notes de pace : 4 prochaines
    const sig = s.notes.map((x) => x.note.s0 + ':' + Math.round(x.dist / 10)).join('|');
    if (sig !== this.last.notes) {
      this.last.notes = sig;
      this.el['h-notes'].innerHTML = s.notes.map((x, i) => `<div class="np${i === 0 ? ' first' : ''}">${noteIcon(x.note)}<b>${x.dist < 1000 ? Math.round(x.dist / 10) * 10 : (x.dist / 1000).toFixed(1) + 'k'}</b></div>`).join('');
    }
  }

  /* carte : tracé complet normalisé, portion à venir en clair, position de la voiture */
  setMap(stage) {
    const c = this.el['h-map'], pad = 16; let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
    for (let i = 0; i < stage.N; i++) { x0 = Math.min(x0, stage.x[i]); x1 = Math.max(x1, stage.x[i]); z0 = Math.min(z0, stage.z[i]); z1 = Math.max(z1, stage.z[i]); }
    const sc = (c.width - pad * 2) / Math.max(x1 - x0, z1 - z0, 1);
    this.mapPath = { x0, z0, sc, pad, w: c.width, h: c.height, ox: (c.width - pad * 2 - (x1 - x0) * sc) / 2, oz: (c.height - pad * 2 - (z1 - z0) * sc) / 2, stage };
  }
  toggleMap() { this.mapOn = !this.mapOn; this.el['h-map'].hidden = !this.mapOn; }
  drawMap(idx, x, z, yaw) {
    if (!this.mapOn || !this.mapPath) return;
    const m = this.mapPath, c = this.el['h-map'], g = c.getContext('2d'), st = m.stage;
    const px = (X) => m.pad + m.ox + (X - m.x0) * m.sc, pz = (Z) => c.height - (m.pad + m.oz + (Z - m.z0) * m.sc);
    g.clearRect(0, 0, c.width, c.height); g.lineCap = 'round'; g.lineJoin = 'round';
    const line = (a, b, col, w) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); for (let i = a; i < b; i += 2) { const X = px(st.x[i]), Z = pz(st.z[i]); i === a ? g.moveTo(X, Z) : g.lineTo(X, Z); } g.stroke(); };
    line(0, st.N, 'rgba(255,255,255,.25)', 3); line(idx, st.N, 'rgba(34,197,94,.9)', 3);
    for (const i of st.cps) { g.fillStyle = '#3b82f6'; g.beginPath(); g.arc(px(st.x[i]), pz(st.z[i]), 3, 0, 7); g.fill(); }
    g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(px(x), pz(z), 5, 0, 7); g.fill();
    g.strokeStyle = '#ffd23f'; g.lineWidth = 2; g.beginPath(); g.moveTo(px(x), pz(z)); g.lineTo(px(x) + Math.sin(yaw) * 12, pz(z) - Math.cos(yaw) * 12); g.stroke();
  }
}

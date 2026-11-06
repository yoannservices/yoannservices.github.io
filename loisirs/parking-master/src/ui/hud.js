/* Interface en jeu : chrono, étoiles encore possibles, vitesse (rouge au-delà du seuil de choc), messages. */
import { CRASH_KMH } from '../gameplay/run.js';

const $ = (id) => document.getElementById(id);
export const fmt = (t) => { const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1); };

export class Hud {
  constructor() {
    this.root = $('hud'); this.time = $('h-time'); this.speed = $('h-speed'); this.stars = $('h-stars'); this.hint = $('h-hint');
    this.msg = $('h-msg'); this.lvl = $('h-lvl'); this.park = $('h-park'); this.bar = $('h-parkbar'); this.limit = $('h-limit'); this.flashEl = $('h-flash');
    this.msgT = 0; this.last = {};
  }
  show(level) {
    this.root.hidden = false;
    this.lvl.textContent = level.chapter + ' · ' + level.name;
    this.level = level;
    this.hint.textContent = 'Z / ↑ avancer · S / ↓ freiner puis reculer · Q D / ← → tourner · Espace frein à main · C caméra · R recommencer';
    this.hint.style.opacity = 1; this.hintT = 9;
    this.msg.textContent = ''; this.msg.className = '';
    this.flashEl.style.opacity = 0;
  }
  hide() { this.root.hidden = true; }
  toast(text, cls = '', secs = 2.2) { this.msg.textContent = text; this.msg.className = 'on ' + cls; this.msgT = secs; }
  flash() { this.flashEl.style.transition = 'none'; this.flashEl.style.opacity = 0.55; requestAnimationFrame(() => { this.flashEl.style.transition = 'opacity 1.2s'; this.flashEl.style.opacity = 0; }); }

  update(dt, s) {
    if (this.msgT > 0 && (this.msgT -= dt) <= 0) this.msg.className = '';
    if (this.hintT > 0 && (this.hintT -= dt) <= 0) this.hint.style.opacity = 0;
    const L = this.level, t = fmt(s.time), kmh = Math.round(s.kmh);
    if (t !== this.last.t) { this.time.textContent = t; this.last.t = t; }
    if (kmh !== this.last.k) {
      this.speed.textContent = kmh; this.last.k = kmh;
      this.speed.parentElement.className = 'spd' + (kmh >= CRASH_KMH ? ' red' : kmh >= CRASH_KMH - 3 ? ' amber' : '');
    }
    const st = s.stars;
    if (st !== this.last.s) { this.stars.innerHTML = [1, 2, 3].map((i) => `<i class="${i <= st ? 'on' : ''}">★</i>`).join(''); this.last.s = st; }
    const hint = st === 3 ? '3 étoiles avant ' + fmt(L.stars[0]) : st === 2 ? '2 étoiles avant ' + fmt(L.stars[1]) : '1 étoile';
    if (hint !== this.last.h) { $('h-starhint').textContent = hint; this.last.h = hint; }
    this.park.hidden = !(s.inside && s.state === 'driving');
    this.bar.style.width = (s.progress * 100).toFixed(0) + '%';
  }
}

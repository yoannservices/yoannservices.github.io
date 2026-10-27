import { DISC } from '../core/config.js';
import { data } from '../core/save.js';
import { heightAt, starts, pois, PARK } from '../world/heightmap.js';

const R = 3200, N = 300;

// Carte plein écran : relief ombré (calculé à l'ouverture), départs, défis, points d'intérêt
export class MapView {
  constructor(player, challenges, onTeleport) {
    this.p = player; this.ch = challenges; this.onTeleport = onTeleport; this.open = false;
    this.el = document.createElement('div'); this.el.id = 'map'; this.el.className = 'hidden';
    this.cv = document.createElement('canvas'); this.el.append(this.cv);
    this.tip = document.createElement('div'); this.tip.className = 'tip'; this.el.append(this.tip);
    document.getElementById('ui').append(this.el);
    this.ctx = this.cv.getContext('2d');
    this.items = [];
    this.cv.onclick = (e) => { const it = this.pick(e); if (it) { this.hide(); this.onTeleport(it); } };
    this.cv.onmousemove = (e) => { const it = this.pick(e); this.tip.textContent = it ? it.name + (it.kind ? ' · ' + it.kind : '') : ''; this.tip.style.cssText = it ? `left:${e.offsetX + 14}px;top:${e.offsetY + 14}px;opacity:1` : 'opacity:0'; };
  }
  raster() {
    const c = document.createElement('canvas'); c.width = c.height = N;
    const g = c.getContext('2d'), img = g.createImageData(N, N), s = (2 * R) / N, H = new Float32Array(N * N);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) H[j * N + i] = heightAt(-R + i * s, -R + j * s);
    for (let j = 1; j < N - 1; j++) for (let i = 1; i < N - 1; i++) {
      const h = H[j * N + i], sh = Math.max(-1, Math.min(1, (H[j * N + i - 1] - H[j * N + i + 1] + H[(j - 1) * N + i] - H[(j + 1) * N + i]) / 40));
      const t = Math.min(1, Math.max(0, (h - 30) / 360)), k = 0.55 + sh * 0.3;
      const o = (j * N + i) * 4;
      img.data[o] = (40 + 210 * t) * k; img.data[o + 1] = (55 + 195 * t) * k; img.data[o + 2] = (80 + 170 * t) * k; img.data[o + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    this.base = c;
  }
  show() {
    if (!this.base) this.raster();
    this.open = true; this.el.classList.remove('hidden'); this.draw();
  }
  hide() { this.open = false; this.el.classList.add('hidden'); }
  toggle() { this.open ? this.hide() : this.show(); }

  w2s(x, z) { const S = this.size; return [((x + R) / (2 * R)) * S, ((z + R) / (2 * R)) * S]; }
  pick(e) {
    let best = null, bd = 18;
    for (const it of this.items) { const d = Math.hypot(it.sx - e.offsetX, it.sy - e.offsetY); if (d < bd) { bd = d; best = it; } }
    return best;
  }
  draw() {
    const S = (this.size = Math.floor(Math.min(innerWidth, innerHeight) * 0.92)), g = this.ctx;
    this.cv.width = this.cv.height = S;
    g.imageSmoothingEnabled = true; g.drawImage(this.base, 0, 0, S, S);
    g.strokeStyle = 'rgba(255,255,255,0.15)'; g.strokeRect(0, 0, S, S);
    this.items = [];
    const mark = (x, z, col, shape, name, kind, tp) => {
      const [sx, sy] = this.w2s(x, z);
      g.fillStyle = col; g.strokeStyle = '#0f0f13'; g.lineWidth = 2; g.beginPath();
      if (shape === 'tri') { g.moveTo(sx, sy - 9); g.lineTo(sx + 8, sy + 6); g.lineTo(sx - 8, sy + 6); g.closePath(); }
      else if (shape === 'sq') g.rect(sx - 6, sy - 6, 12, 12); else g.arc(sx, sy, 6, 0, 7);
      g.fill(); g.stroke();
      this.items.push({ sx, sy, name, kind, ...tp });
    };
    for (const s of starts) mark(s.x, s.z, '#e2e8f0', 'tri', s.name, 'départ', { x: s.x, z: s.z, heading: s.heading });
    for (const d of this.ch.defs) mark(d.start.x, d.start.z, DISC[d.disc].col, 'sq', d.name, DISC[d.disc].label, { x: d.start.x + 6, z: d.start.z + 6, heading: 0, disc: d.disc, def: d });
    for (const o of pois) mark(o.x, o.z, data.pois.includes(o.id) ? '#facc15' : '#4b5563', 'c', data.pois.includes(o.id) ? o.name : '???', 'point d\'intérêt', { x: o.x, z: o.z, heading: 0 });
    const [px, pz] = this.w2s(this.p.pos.x, this.p.pos.z);
    g.save(); g.translate(px, pz); g.rotate(-this.p.heading + Math.PI); g.fillStyle = '#22c55e'; g.strokeStyle = '#fff'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, -11); g.lineTo(8, 9); g.lineTo(0, 4); g.lineTo(-8, 9); g.closePath(); g.fill(); g.stroke(); g.restore();
    g.fillStyle = '#e2e8f0'; g.font = '600 14px Inter, system-ui, sans-serif';
    g.fillText('N ↑   ▲ départs · ■ défis · ● points d\'intérêt   (clic = téléportation)', 14, S - 14);
  }
}

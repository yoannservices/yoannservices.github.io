// Itinéraire GPS : plus court chemin sur la grille de routes (Dijkstra), tracé au sol sur la voie de droite
// (ruban à chevrons animés), point de visée pour la flèche du HUD et annonce du prochain virage.
import * as THREE from 'three';

import { routePoints, nextTurn } from './path.js';
export { routePoints, nextTurn };

function chevrons() {
  const c = Object.assign(document.createElement('canvas'), { width: 64, height: 128 }), g = c.getContext('2d');
  g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(0, 0, 64, 128);
  g.strokeStyle = '#fff'; g.lineWidth = 12; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(8, 96); g.lineTo(32, 40); g.lineTo(56, 96); g.stroke();
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

export class Route {
  constructor(scene) {
    this.tex = chevrons();
    this.mat = new THREE.MeshBasicMaterial({ color: '#ff8a1a', map: this.tex, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 });
    this.mesh = new THREE.Mesh(new THREE.BufferGeometry(), this.mat); this.mesh.frustumCulled = false; this.mesh.renderOrder = 1; this.mesh.visible = false;
    this.mesh.userData.noLod = true; scene.add(this.mesh);
    this.pts = []; this.t = 0; this.key = '';
  }

  // origine (engin ou joueur), cible (ou null), couleur
  // siren : tracé plus près de la ligne médiane, là où les voitures rangées au trottoir laissent la place
  update(dt, from, target, color = '#ff8a1a', siren = false) {
    this.tex.offset.y -= dt * 1.2;
    if (!target) { this.active = false; this.mesh.visible = false; this.pts = []; return; }
    this.t -= dt;
    const key = `${Math.round(target.x)},${Math.round(target.z)}`;
    if (this.t <= 0 || key !== this.key || siren !== this.siren) {
      this.t = 0.5; this.key = key; this.siren = siren;
      this.pts = [{ x: from.x, z: from.z }, ...routePoints(from, target)];
      this.build(); this.mat.color.set(color);
    }
    this.active = Math.hypot(from.x - target.x, from.z - target.z) > 15; // trajet calculé (indépendant du mode de guidage)
    const gs = window.GameSettings?.guide;
    this.mesh.visible = this.active && gs !== 'haut' && gs !== 'none'; // tracé au sol : modes « sol » et « les deux »
  }

  // ruban de 1,4 m décalé sur la voie de droite (sauf premier et dernier segments, hors route)
  build() {
    const pts = this.pts, n = pts.length, pos = [], uv = [], idx = [], W = 0.7, OFF = this.siren ? 1.5 : 2.4;
    let u = 0;
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let dx = b.x - a.x, dz = b.z - a.z; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
      const rx = -dz, rz = dx, off = i === 0 || i >= n - 2 ? 0 : OFF;
      if (i) u += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z) / 3;
      const cx = pts[i].x + rx * off, cz = pts[i].z + rz * off;
      pos.push(cx - rx * W, 0.19, cz - rz * W, cx + rx * W, 0.19, cz + rz * W);   // au-dessus des trottoirs et des cours (0,16 m)
      uv.push(0, u, 1, u);
      if (i) { const k = i * 2; idx.push(k - 2, k, k - 1, k - 1, k, k + 1); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
    this.mesh.geometry.dispose(); this.mesh.geometry = g;
  }

  // point du trajet à `ahead` mètres devant l'origine (pour la flèche)
  lookPoint(from, ahead = 25) {
    const pts = this.pts;
    if (pts.length < 2) return null;
    let best = 1, bd = Infinity;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i].x - from.x, pts[i].z - from.z); if (d < bd) { bd = d; best = i; } }
    let left = ahead, p = { x: from.x, z: from.z };
    for (let i = best; i < pts.length; i++) {
      const q = pts[i], d = Math.hypot(q.x - p.x, q.z - p.z);
      if (d >= left) return { x: p.x + (q.x - p.x) * left / d, z: p.z + (q.z - p.z) * left / d };
      left -= d; p = q;
    }
    return pts[pts.length - 1];
  }
  turn() { return this.pts.length ? nextTurn(this.pts) : null; }
}

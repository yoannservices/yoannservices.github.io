/* Guidage : chevrons verts posés au sol le long de la route, et marquage peint de la place (vu seulement de près, jamais à travers un mur). */
import * as THREE from 'three';
import { curve, slab } from '../world/kit.js';

export class Guide {
  constructor(scene, route) {
    const c = curve(route), step = 3.2, n = Math.max(2, Math.floor(c.getLength() / step));
    this.pts = c.getSpacedPoints(n);
    this.n = this.pts.length; this.idx = 0;
    const s = new THREE.Shape();
    s.moveTo(-1.0, -0.5); s.lineTo(0, 0.25); s.lineTo(1.0, -0.5); s.lineTo(1.0, -0.95); s.lineTo(0, -0.2); s.lineTo(-1.0, -0.95); s.closePath();
    const geo = new THREE.ShapeGeometry(s).rotateX(-Math.PI / 2).translate(0, 0.07, 0);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: 0, polygonOffsetUnits: -30 });
    this.mesh = new THREE.InstancedMesh(geo, mat, this.n);
    this.mesh.frustumCulled = false; this.mesh.renderOrder = 20;   // après les rubans transparents (pistes de terre)
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < this.n; i++) {
      const a = this.pts[Math.max(0, i - 1)], b = this.pts[Math.min(this.n - 1, i + 1)];
      m.compose(this.pts[i], q.setFromEuler(e.set(0, Math.atan2(-(b.x - a.x), -(b.z - a.z)), 0)), one);
      this.mesh.setMatrixAt(i, m); this.mesh.setColorAt(i, new THREE.Color(0, 0, 0));
    }
    this.col = new THREE.Color();
    scene.add(this.mesh);
  }

  /* Chevrons de la voiture jusqu'à ~30 m devant ; les 3 derniers (près de la place) s'éteignent : la place se voit alors elle-même. */
  update(x, z, t) {
    let best = this.idx, bd = Infinity;
    const lo = Math.max(0, this.idx - 4), hi = Math.min(this.n - 1, this.idx + 14);
    for (let i = lo; i <= hi; i++) { const d = (this.pts[i].x - x) ** 2 + (this.pts[i].z - z) ** 2; if (d < bd) { bd = d; best = i; } }
    if (bd > 400) { for (let i = 0; i < this.n; i++) { const d = (this.pts[i].x - x) ** 2 + (this.pts[i].z - z) ** 2; if (d < bd) { bd = d; best = i; } } }
    this.idx = best;
    for (let i = 0; i < this.n; i++) {
      const j = i - best - 1;                                   // 0 = juste devant la voiture
      const inRange = j >= 0 && j < 10 && i < this.n - 2;
      const k = inRange ? (1 - (j / 10) ** 2) * (0.65 + 0.35 * Math.sin(t * 5.5 - i * 0.9)) : 0;
      this.mesh.setColorAt(i, this.col.setRGB(0.02 * k, 1.0 * k, 0.28 * k));
    }
    this.mesh.instanceColor.needsUpdate = true;
  }
  dispose() { this.mesh.removeFromParent(); this.mesh.geometry.dispose(); this.mesh.material.dispose(); }
}

/* Marquage de la place : traits blancs sur trois côtés (l'entrée reste ouverte) et remplissage vert qui s'allume quand la voiture est bien rangée. */
export class SpotMarks {
  constructor(scene, spot) {
    this.g = new THREE.Group(); this.g.position.set(spot.x, 0, spot.z); this.g.rotation.y = spot.yaw;
    const white = new THREE.MeshStandardMaterial({ color: 0xf1efe6, roughness: 0.75, polygonOffset: true, polygonOffsetFactor: 0, polygonOffsetUnits: -16 });
    const L = spot.len, W = spot.wid, t = 0.13;
    const line = (w, d, x, z) => { const m = new THREE.Mesh(slab(w, d, 0.075), white); m.position.set(x, 0, z); m.receiveShadow = true; this.g.add(m); };
    line(t, L, -W / 2, 0); line(t, L, W / 2, 0); line(W + t, t, 0, -L / 2);         // côtés et fond ; le fond est dans le sens du cap
    line(W + t, t, 0, L / 2);                                                       // entrée : trait fin pour bien lire la place
    this.fill = new THREE.Mesh(slab(W - 0.2, L - 0.2, 0.08), new THREE.MeshBasicMaterial({ color: 0x38e07a, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: 0, polygonOffsetUnits: -24 }));
    this.fill.renderOrder = 19; this.g.add(this.fill); scene.add(this.g);
  }
  /* inside : voiture dans la place ; progress : 0..1 de l'immobilisation */
  set(inside, progress) { this.fill.material.opacity += ((inside ? 0.22 + 0.3 * progress : 0) - this.fill.material.opacity) * 0.2; }
  dispose() { this.g.removeFromParent(); }
}

import * as THREE from 'three';
import { G, clamp, lerp } from '../core/config.js';
import { heightAt } from '../world/heightmap.js';
import { prog } from '../gameplay/progression.js';

const Y = new THREE.Vector3(0, 1, 0), X = new THREE.Vector3(1, 0, 0), Z = new THREE.Vector3(0, 0, 1);
const q0 = new THREE.Quaternion(), q1 = new THREE.Quaternion(), q2 = new THREE.Quaternion(), q3 = new THREE.Quaternion();

// Motifs générés par code (CanvasTexture) pour les tenues, planches, skis et combinaisons
function pattern(kind, c1, c2, w = 128, h = 128) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = c1; g.fillRect(0, 0, w, h);
  g.fillStyle = c2; g.strokeStyle = c2; g.lineWidth = 6;
  if (kind === 'stripes') for (let y = 8; y < h; y += 28) g.fillRect(0, y, w, 10);
  else if (kind === 'dots') for (let y = 12; y < h; y += 26) for (let x = 12 + ((y / 26) % 2) * 13; x < w; x += 26) { g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); }
  else if (kind === 'checks') for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) if (((x + y) / 32) % 2 === 0) g.fillRect(x, y, 32, 32);
  else if (kind === 'waves') for (let y = 10; y < h; y += 24) { g.beginPath(); for (let x = 0; x <= w; x += 4) g.lineTo(x, y + Math.sin(x / 10) * 6); g.stroke(); }
  else if (kind === 'camo') for (let i = 0; i < 26; i++) { g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 8 + Math.random() * 18, 5 + Math.random() * 10, Math.random() * 3, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
const mat = (color, extra = {}) => new THREE.MeshLambertMaterial({ color, ...extra });
const cyl = (r0, r1, h, m, seg = 8) => new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), m);

export class Character {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group(); scene.add(this.root);
    this.rig = new THREE.Group(); this.root.add(this.rig);           // pivot au bassin (pose couchée / stance)
    this.fig = new THREE.Group(); this.fig.position.y = -0.95; this.rig.add(this.fig); // coordonnées « pieds à l'origine »
    this.eq = new THREE.Group(); this.eq.position.y = -0.95; this.root.add(this.eq);
    this.m = { jacket: mat(0xef4444), pants: mat(0x1f2937), helmet: mat(0xe2e8f0), goggle: mat(0x38bdf8), skin: mat(0xe0b090), glove: mat(0x111827), dark: mat(0x1a1a24) };

    this.torso = new THREE.Group(); this.torso.position.y = 0.95; this.fig.add(this.torso);
    const chest = cyl(0.2, 0.22, 0.58, this.m.jacket, 10); chest.position.y = 0.29; this.torso.add(chest);
    this.head = new THREE.Group(); this.head.position.y = 0.66; this.torso.add(this.head);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), this.m.skin); skull.position.y = 0.14; this.head.add(skull);
    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.155, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.62), this.m.helmet); helm.position.y = 0.15; this.head.add(helm);
    const gog = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, 0.07), this.m.goggle); gog.position.set(0, 0.15, 0.12); this.head.add(gog);

    this.arms = [1, -1].map((s) => {
      const a = new THREE.Group(); a.position.set(0.27 * s, 0.52, 0); this.torso.add(a);
      const m = cyl(0.055, 0.05, 0.6, this.m.jacket); m.position.y = -0.3; a.add(m);
      const h = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), this.m.glove); h.position.y = -0.62; a.add(h);
      const pole = cyl(0.012, 0.012, 1.25, this.m.dark, 5); pole.position.set(0, -0.6, 0.05); pole.visible = false; a.add(pole);
      a.pole = pole;
      return a;
    });
    this.legs = [1, -1].map((s) => {
      const l = new THREE.Group(); l.position.set(0.12 * s, 0.95, 0); this.fig.add(l);
      const th = cyl(0.085, 0.07, 0.46, this.m.pants); th.position.y = -0.23; l.add(th);
      const knee = new THREE.Group(); knee.position.y = -0.46; l.add(knee);
      const sh = cyl(0.07, 0.06, 0.46, this.m.pants); sh.position.y = -0.23; knee.add(sh);
      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.09, 0.26), this.m.dark); boot.position.set(0, -0.47, 0.05); knee.add(boot);
      l.knee = knee;
      return l;
    });

    // équipement
    this.board = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 1.55), mat(0xffffff)); this.board.position.y = 0.04; this.eq.add(this.board);
    this.skis = new THREE.Group(); this.eq.add(this.skis);
    this.skiMeshes = [-1, 1].map((s) => { const k = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 1.6), mat(0xffffff)); k.position.set(0.16 * s, 0.04, 0.1); this.skis.add(k); return k; });
    this.wing = new THREE.Mesh(this.wingGeometry(), mat(0xf97316, { side: THREE.DoubleSide })); this.fig.add(this.wing);
    this.chute = new THREE.Group();
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(2.2, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xf97316, { side: THREE.DoubleSide }));
    canopy.scale.set(1, 0.55, 1); canopy.position.y = 3.4; this.chute.add(canopy);
    const lines = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([[1.6, 3.5, 0], [0, 0.9, 0], [-1.6, 3.5, 0], [0, 0.9, 0], [0, 3.5, 1.6], [0, 0.9, 0], [0, 3.5, -1.6], [0, 0.9, 0]].map((a) => new THREE.Vector3(...a))), new THREE.LineBasicMaterial({ color: 0xdddddd }));
    this.chute.add(lines); this.chute.visible = false; this.root.add(this.chute);
    this.chute.position.y = -0.2;

    this.show = { board: 1, ski: 0, wing: 0, chute: 0 };
    this.pose = { crouch: 0.3, lean: 0, prone: 0, stance: 0, armX: [0, 0], armZ: [0.3, 0.3], legZ: 0, torsoX: 0, boardLift: 0 };
    this.parts = [this.torso, this.head, this.legs[0], this.legs[1], this.board, this.skis].map((o) => ({ o, parent: o.parent, pos: o.position.clone(), quat: o.quaternion.clone(), scl: o.scale.clone(), v: new THREE.Vector3(), w: new THREE.Vector3() }));
    this.rag = false;
    this.applyLook();
  }

  wingGeometry() {
    const P = (x, y, z = 0) => [x, y, z], t = [];
    for (const s of [1, -1]) {
      const sh = P(0.26 * s, 1.45), wr = P(1.25 * s, 1.47), hip = P(0.16 * s, 0.95), an = P(0.5 * s, 0.05), cr = P(0, 0.55);
      t.push(sh, wr, hip, hip, wr, an, hip, an, cr);
    }
    t.push(P(0.5, 0.05), P(-0.5, 0.05), P(0, 0.55));
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(t.flat(), 3));
    g.computeVertexNormals();
    return g;
  }

  // Applique tenue et matériel équipés (couleurs + motifs)
  applyLook() {
    const o = prog.equipped('outfit'), m = this.m;
    m.jacket.color.set(o.jacket); m.jacket.map = o.pattern === 'none' ? null : pattern(o.pattern, o.jacket, '#ffffff55'); m.jacket.needsUpdate = true;
    m.pants.color.set(o.pants); m.helmet.color.set(o.helmet); m.goggle.color.set(o.goggle);
    const tex = (it, w, h) => { const t = pattern(it.deco, it.pal[0], it.pal[1], w, h); return t; };
    const b = prog.equipped('snowboard'), s = prog.equipped('ski'), w = prog.equipped('wingsuit');
    this.board.material.map = tex(b, 64, 256); this.board.material.needsUpdate = true;
    this.skiMeshes.forEach((k) => { k.material.map = tex(s, 32, 256); k.material.needsUpdate = true; });
    this.wing.material.color.set(w.pal[0]);
    this.chute.children[0].material.color.set(w.pal[1] === '#1a1a24' ? w.pal[0] : w.pal[1]);
  }

  // Ragdoll simplifié : les segments se détachent et rebondissent sur le terrain
  startRagdoll(vel) {
    this.rag = true;
    for (const p of this.parts) {
      this.scene.attach(p.o);
      p.v.copy(vel).multiplyScalar(0.8).add(new THREE.Vector3((Math.random() - 0.5) * 6, 2 + Math.random() * 3, (Math.random() - 0.5) * 6));
      p.w.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14);
    }
    this.chute.visible = false;
  }
  endRagdoll() {
    this.rag = false;
    for (const p of this.parts) { p.parent.add(p.o); p.o.position.copy(p.pos); p.o.quaternion.copy(p.quat); p.o.scale.copy(p.scl); }
  }
  get center() { return this.torso.getWorldPosition(new THREE.Vector3()); }

  updateRagdoll(dt) {
    for (const p of this.parts) {
      p.v.y -= G * dt;
      p.o.position.addScaledVector(p.v, dt);
      const gy = heightAt(p.o.position.x, p.o.position.z) + 0.12;
      if (p.o.position.y < gy) {
        p.o.position.y = gy;
        if (p.v.y < 0) p.v.y *= -0.3;
        p.v.x *= 0.88; p.v.z *= 0.88; p.w.multiplyScalar(0.85);
      }
      q1.setFromEuler(new THREE.Euler(p.w.x * dt, p.w.y * dt, p.w.z * dt));
      p.o.quaternion.premultiply(q1);
    }
    const t = performance.now() / 120;
    this.arms[0].rotation.set(Math.sin(t) * 1.2, 0, 1.2); this.arms[1].rotation.set(Math.cos(t * 1.3) * 1.2, 0, -1.2);
  }

  // p : état du joueur (pos, up, heading, spin, flip, mode, disc, grab, crouch, edge, wing…)
  update(dt, p) {
    if (this.rag) { this.updateRagdoll(dt); return; }
    const ground = p.mode === 'ground' || p.mode === 'grind', wing = p.mode === 'wing';
    // visibilité de l'équipement (transition animée : rangement / déploiement)
    const t = { board: p.disc === 'snowboard' ? 1 : 0, ski: p.disc === 'ski' ? 1 : 0, wing: wing ? 1 : 0, chute: p.mode === 'chute' ? 1 : 0 };
    for (const k in t) this.show[k] = lerp(this.show[k], t[k], Math.min(1, dt * 5));
    const sc = (o, f) => { o.visible = f > 0.02; o.scale.setScalar(Math.max(0.001, f)); };
    sc(this.board, this.show.board); sc(this.skis, this.show.ski);
    this.wing.visible = this.show.wing > 0.02; this.wing.scale.set(Math.max(0.001, this.show.wing), 1, 1);
    this.chute.visible = this.show.chute > 0.02; this.chute.scale.setScalar(Math.max(0.001, this.show.chute));
    this.arms.forEach((a) => (a.pole.visible = p.disc === 'ski' && !wing));

    // pose cible
    const T = { crouch: 0.3, lean: 0, prone: 0, stance: 0, armX: [0, 0], armZ: [0.3, 0.3], legZ: 0, torsoX: 0.1, boardLift: 0 };
    const edge = p.edge || 0;
    if (wing) { T.prone = 1; T.crouch = 0; T.armZ = [1.45, 1.45]; T.legZ = 0.2; T.torsoX = 0; T.boardLift = 0; }
    else if (p.mode === 'chute') { T.crouch = 0.1; T.armX = [-2.4, -2.4]; T.armZ = [0.3, 0.3]; }
    else {
      if (p.disc === 'snowboard') T.stance = Math.PI / 2 * 0.9;
      T.crouch = 0.3 + (p.crouch || 0) * 0.55 + Math.abs(edge) * 0.15 + (p.mode === 'air' ? 0.3 : 0) + (p.inp?.tuck && ground ? 0.25 : 0);
      T.lean = edge;
      T.armX = p.disc === 'ski' ? [-0.7, -0.7] : [-0.2, -0.2];
      T.armZ = p.disc === 'ski' ? [0.35, 0.35] : [0.8 - edge * 0.3, 0.8 + edge * 0.3];
      if (p.grab) {
        T.crouch = 0.95; T.boardLift = 0.3;
        T.armX = [p.grab === 2 ? -1.6 : -0.5, p.grab === 1 ? -1.6 : -0.5]; T.armZ = [0.3, 0.3];
      }
      if (p.mode === 'grind') { T.crouch = 0.55; T.armZ = [1.2, 1.2]; }
    }
    const k = Math.min(1, dt * 10), P = this.pose;
    for (const key of ['crouch', 'lean', 'prone', 'stance', 'legZ', 'torsoX', 'boardLift']) P[key] = lerp(P[key], T[key], k);
    for (let i = 0; i < 2; i++) { P.armX[i] = lerp(P.armX[i], T.armX[i], k); P.armZ[i] = lerp(P.armZ[i], T.armZ[i], k); }

    const c = clamp(P.crouch, 0, 1.1);
    this.torso.position.y = 0.95 - c * 0.24; this.torso.rotation.x = P.torsoX + c * 0.3;
    this.legs.forEach((l, i) => {
      l.position.y = 0.95 - c * 0.24;
      const s = i === 0 ? 1 : -1;
      l.rotation.set(-c * 0.8, 0, s * P.legZ); l.knee.rotation.x = c * 1.5;
    });
    this.arms.forEach((a, i) => a.rotation.set(P.armX[i], 0, P.armZ[i] * (i === 0 ? 1 : -1)));
    this.rig.rotation.set(P.prone * Math.PI / 2, P.stance, 0);
    this.fig.position.set(0, -0.95, 0);
    this.board.position.y = 0.04 + P.boardLift; this.skis.position.y = P.boardLift;
    this.eq.rotation.x = -P.boardLift * 0.4;

    // orientation globale : alignée sur la pente, cap, spin / flip en l'air, roulis (carre / virage)
    q0.setFromUnitVectors(Y, p.up);
    q1.setFromAxisAngle(Y, p.heading + p.spin);
    q2.setFromAxisAngle(X, wing ? -p.wing.pitch : p.flip);
    q3.setFromAxisAngle(Z, wing ? p.wing.roll * 0.9 : edge * 0.5);
    this.root.quaternion.copy(q0).multiply(q1).multiply(q2).multiply(q3);
    this.root.position.copy(p.pos).addScaledVector(p.up, 0.95);
  }
}

/* Modèle 3D procédural d'une voiture (aucun asset) : carrosserie par sections lofted (vitrage et peinture en couleurs de sommet),
   roues (pneus Lathe, jantes à branches, écrous, disques, étriers), feux, ailes, intérieur avec compteurs en CanvasTexture,
   pare-chocs déformables, bosses sur la carrosserie. Repère : avant +Z, gauche +X, origine au sol sous le centre de gravité. */
import * as THREE from 'three';
import { clamp, lerp, smooth } from '../core/util.js';
import { numberTexture } from '../surfaces/textures.js';

const SRGB = THREE.SRGBColorSpace;
const col = (hex) => new THREE.Color(hex);
const lin = (r, g, b) => new THREE.Color().setRGB(r, g, b, SRGB);

// proportions de la silhouette (fractions de la longueur, arrière 0 → avant 1)
const SHAPES = {
  hatch: { wr: 0.1, rr: 0.31, rf: 0.6, wf: 0.74, b: 0.45, taper: 0.8 },
  sedan: { wr: 0.21, rr: 0.38, rf: 0.6, wf: 0.7, b: 0.49, taper: 0.8 },
  coupe: { wr: 0.12, rr: 0.34, rf: 0.52, wf: 0.66, b: 0.43, taper: 0.76 },
  groupb: { wr: 0.2, rr: 0.4, rf: 0.57, wf: 0.7, b: 0.485, taper: 0.8 },
};
const Y0 = 0.24;

export class CarModel {
  constructor(def, opts = {}) {
    this.def = def; this.ghost = !!opts.ghost; const v = def.vis;
    this.root = new THREE.Group(); this.root.rotation.order = 'YXZ';
    this.a = def.L * (1 - def.wf); this.b = def.L * def.wf; this.zc = (this.a - this.b) / 2;
    this.body = new THREE.Group(); this.body.position.set(0, 0.45, this.zc); this.root.add(this.body);
    this.shell = new THREE.Group(); this.shell.position.y = -0.45; this.body.add(this.shell);
    this.paint = new THREE.MeshPhysicalMaterial({ vertexColors: true, metalness: 0.4, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08 });
    this.plain = new THREE.MeshPhysicalMaterial({ color: col(v.color), metalness: 0.4, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08 });
    this.black = new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.55, metalness: 0.2 });
    this.chrome = new THREE.MeshStandardMaterial({ color: 0xd8dbe0, roughness: 0.18, metalness: 1 });
    this.rubber = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.92 });
    this.head = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2cf, emissiveIntensity: 0.25, roughness: 0.2 });
    this.tail = new THREE.MeshStandardMaterial({ color: 0x6a0a0a, emissive: 0xff1010, emissiveIntensity: 0.35, roughness: 0.3 });
    this.markers = {};
    this._buildBody(); this._buildWheels(); this._buildDetails();
    if (this.ghost) { this._ghostify(); return; }
    this._buildInterior(); this._buildLights();
    this.dents = new Float32Array(this.geo.attributes.position.count * 3); this.dentTotal = 0;
    this.ang = [0, 0, 0, 0]; this.gaugeT = 0; this.view = 0;
  }

  /* ---------- carrosserie ---------- */
  _buildBody() {
    const d = this.def, v = d.vis, F = SHAPES[v.shape], Lb = v.L, W2 = v.W / 2, belt = v.belt;
    const keys = [[0, v.tail], [F.wr, v.trunk], [F.rr, v.roof], [F.rf, v.roof], [F.wf, v.hood], [0.9, v.hood * 0.985], [1, v.nose]];
    const topY = (f) => { for (let i = 0; i < keys.length - 1; i++) if (f <= keys[i + 1][0]) { const t = (f - keys[i][0]) / Math.max(1e-6, keys[i + 1][0] - keys[i][0]); return lerp(keys[i][1], keys[i + 1][1], smooth(0, 1, t)); } return keys[keys.length - 1][1]; };
    const widthK = (f) => 1 - 0.13 * smooth(0.86, 1, f) - 0.1 * smooth(0.1, 0, f);
    const cabin = (f) => smooth(F.wf + 0.01, F.rf, f) * smooth(F.wr - 0.01, F.rr, f) ;
    const bands = { s0: F.rr - 0.05, s1: F.rf + 0.07, b1: F.b - 0.022, b2: F.b + 0.022 };
    const paintC = lin(...hex2rgb(v.color)), glassC = lin(0.025, 0.03, 0.04);
    // couleur d'un point de la section (rangée) à l'abscisse f, avec décalage de côté pour les arêtes franches
    const colorOf = (ri, f, sd) => {
      const e = f + sd * 1e-5, half = ri > 8 ? 16 - ri : ri;
      const wind = e > F.rf && e < F.wf, rear = e > F.wr && e < F.rr;
      let glass = false;
      if (half === 4 || half === 5) glass = e > bands.s0 && e < bands.s1 && !(e > bands.b1 && e < bands.b2);
      else if (half >= 6 && half <= 8) glass = wind || rear;
      return glass ? glassC : paintC;
    };
    // stations : régulières + doublons sur les arêtes de couleur
    const bounds = [F.wr, F.rr, F.rf, F.wf, bands.s0, bands.s1, bands.b1, bands.b2];
    const st = [];
    for (let i = 0; i <= 30; i++) st.push([i / 30, 0]);
    for (const b of bounds) { st.push([b, -1]); st.push([b, 1]); }
    for (const f of [0.015, 0.045, 0.955, 0.985]) st.push([f, 0]);
    st.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
    const ringPts = (f) => {
      const w = W2 * widthK(f), yT = topY(f), ybz = Math.min(belt, yT - 0.07), cab = cabin(f);
      const wC = lerp(w * 0.955, w * F.taper, cab), yb0 = f < 0.05 || f > 0.95 ? Y0 + 0.07 : Y0;
      return [[0, yb0 + 0.02], [w * 0.82, yb0], [w * 0.995, yb0 + 0.14], [w, ybz], [w, ybz + 0.002],
        [lerp(w, wC, 0.55), ybz + 0.55 * (yT - ybz)], [wC, yT - 0.045], [wC * 0.55, yT + 0.008], [0, yT + 0.02]];
    };
    const pos = [], colr = [], idx = [], M = 17;
    st.forEach(([f, sd]) => {
      const z = (f - 0.5) * Lb, H = ringPts(f), ring = [];
      for (let k = 0; k < 9; k++) ring.push([H[k][0], H[k][1]]);
      for (let k = 7; k >= 0; k--) ring.push([-H[k][0], H[k][1]]);
      ring.forEach((p, ri) => { pos.push(p[0], p[1], z); const c = colorOf(ri, f, sd); colr.push(c.r, c.g, c.b); });
    });
    for (let s = 0; s < st.length - 1; s++) for (let r = 0; r < M - 1; r++) {
      const a = s * M + r, b = a + 1, c = (s + 1) * M + r, e = c + 1;
      idx.push(a, b, c, b, e, c);
    }
    // capots avant / arrière (sommets propres, normales franches)
    const cap = (s, front) => {
      const base = pos.length / 3, ring = []; let cx = 0, cy = 0;
      for (let r = 0; r < M; r++) { const o = (s * M + r) * 3; ring.push([pos[o], pos[o + 1], pos[o + 2]]); cx += pos[o]; cy += pos[o + 1]; }
      cx /= M; cy /= M; const z = ring[0][2];
      pos.push(cx, cy, z); colr.push(paintC.r, paintC.g, paintC.b);
      ring.forEach((p) => { pos.push(p[0], p[1], p[2]); colr.push(paintC.r, paintC.g, paintC.b); });
      for (let r = 0; r < M - 1; r++) front ? idx.push(base, base + 1 + r, base + 2 + r) : idx.push(base, base + 2 + r, base + 1 + r);
    };
    cap(st.length - 1, true); cap(0, false);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(colr, 3));
    geo.setIndex(idx); geo.computeVertexNormals();
    geo.userData.orig = Float32Array.from(pos);
    this.geo = geo; this.F = F; this.topY = topY; this.Lb = Lb; this.W2 = W2;
    this.mesh = new THREE.Mesh(geo, this.paint); this.mesh.castShadow = true; this.shell.add(this.mesh);
  }

  /* ---------- roues ---------- */
  _wheelParts() {
    const d = this.def, R = d.wheelR, Rr = R * 0.6, Wt = 0.2;
    // pneu : profil tourné autour de Y puis couché sur l'axe X
    const prof = [[Rr, -0.42], [R - 0.05, -0.5], [R - 0.012, -0.38], [R, -0.2], [R, 0.2], [R - 0.012, 0.38], [R - 0.05, 0.5], [Rr, 0.42]].map(([r, y]) => new THREE.Vector2(r, y * Wt));
    const tire = new THREE.Mesh(new THREE.LatheGeometry(prof, 28).rotateZ(Math.PI / 2), this.rubber); tire.castShadow = true;
    const disc = new THREE.CylinderGeometry(Rr * 0.97, Rr * 0.97, Wt * 0.72, 22).rotateZ(Math.PI / 2);
    const spokes = d.id === 'compacte' ? 5 : d.id === 'groupb' ? 8 : 6;
    const sp = [];
    for (let k = 0; k < spokes; k++) {
      const g = new THREE.BoxGeometry(0.035, Rr * 0.82, 0.05); g.translate(0, Rr * 0.45, 0); g.rotateX(k / spokes * Math.PI * 2); g.translate(Wt * 0.37, 0, 0); sp.push(g);
    }
    const nuts = [];
    for (let k = 0; k < 5; k++) { const g = new THREE.CylinderGeometry(0.014, 0.014, 0.03, 6).rotateZ(Math.PI / 2); g.translate(Wt * 0.41, Math.cos(k / 5 * 6.283) * Rr * 0.28, Math.sin(k / 5 * 6.283) * Rr * 0.28); nuts.push(g); }
    const lip = new THREE.TorusGeometry(Rr * 0.96, 0.012, 6, 22).rotateY(Math.PI / 2); lip.translate(Wt * 0.36, 0, 0);
    const rim = new THREE.Mesh(mergeG([disc.clone().scale(0.2, 1, 1).translate(Wt * 0.3, 0, 0), ...sp, ...nuts, lip]), this.chrome);
    const dark = new THREE.Mesh(new THREE.CylinderGeometry(Rr * 0.9, Rr * 0.9, Wt * 0.6, 22).rotateZ(Math.PI / 2), this.black);
    const brk = new THREE.Mesh(new THREE.CylinderGeometry(Rr * 0.86, Rr * 0.86, 0.02, 24).rotateZ(Math.PI / 2).translate(-0.02, 0, 0), new THREE.MeshStandardMaterial({ color: 0x8a8d93, roughness: 0.45, metalness: 0.9 }));
    return { tire, rim, dark, brk };
  }
  _buildWheels() {
    const d = this.def, v = d.vis, R = d.wheelR, x = this.W2 - 0.075;
    this.wheels = [];
    for (let i = 0; i < 4; i++) {
      const front = i < 2, left = i % 2 === 0, zAxle = front ? this.a : -this.b;
      const g = new THREE.Group(), piv = new THREE.Group(), spin = new THREE.Group(), P = this._wheelParts();
      spin.add(P.tire, P.rim, P.dark); piv.add(spin);
      const cal = new THREE.Mesh(new THREE.BoxGeometry(0.06, R * 0.5, R * 0.34), new THREE.MeshStandardMaterial({ color: front ? 0xd90429 : 0xd90429, roughness: 0.4 }));
      cal.position.set(-0.035, R * 0.12, R * 0.52); piv.add(cal, P.brk);
      if (!left) { piv.scale.x = -1; }                       // jante tournée vers l'extérieur
      g.position.set(left ? x : -x, R, zAxle); g.add(piv); this.root.add(g);
      this.wheels.push({ g, piv, spin, tire: P.tire, front, left });
    }
  }

  /* ---------- détails extérieurs ---------- */
  _buildDetails() {
    const d = this.def, v = d.vis, F = this.F, Lb = this.Lb, W2 = this.W2, S = this.shell, zf = Lb / 2, belt = v.belt, R = d.wheelR;
    const add = (geo, mat, x, y, z, parent = S) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };
    // ailes : arcs peints autour des roues + disque noir d'embrasure
    const arch = new THREE.MeshBasicMaterial({ color: 0x050506, side: THREE.DoubleSide });
    const wide = d.id === 'groupb' ? 0.07 : 0.045;
    for (const w of this.wheels) {
      const zl = (w.front ? this.a : -this.b) - this.zc, sx = w.left ? 1 : -1;
      const lip = new THREE.Mesh(new THREE.TorusGeometry(R + 0.07, wide, 8, 22, Math.PI).rotateY(Math.PI / 2), this.plain); lip.position.set(sx * (W2 - 0.012 + (wide - 0.045)), R, zl); lip.castShadow = true; S.add(lip);
      const ra = R + 0.05, y0 = Y0 + 0.04, th0 = Math.asin(clamp((y0 - R) / ra, -1, 1));
      const disc = new THREE.Mesh(new THREE.CircleGeometry(ra, 26, th0, Math.PI - 2 * th0), arch); disc.rotation.y = sx * Math.PI / 2; disc.position.set(sx * (W2 + 0.003), R, zl); S.add(disc);
    }
    // calandre / entrées d'air / feux
    add(new THREE.BoxGeometry(W2 * 1.1, 0.12, 0.06), this.black, 0, v.nose - 0.12, zf - 0.02);
    add(new THREE.BoxGeometry(W2 * 1.3, 0.07, 0.08), this.black, 0, Y0 + 0.16, zf - 0.02);
    for (const s of [-1, 1]) {
      add(new THREE.SphereGeometry(0.13, 14, 10).scale(1.2, 0.8, 0.5), this.head, s * W2 * 0.68, v.nose - 0.04, zf - 0.07);
      add(new THREE.BoxGeometry(0.28, 0.08, 0.05), this.tail, s * W2 * 0.68, v.tail - 0.14, -zf + 0.025);
      // rétroviseurs
      const zm = (F.wf - 0.5) * Lb - 0.05;
      add(new THREE.BoxGeometry(0.03, 0.03, 0.18), this.black, s * (W2 - 0.1), belt + 0.08, zm);
      add(new THREE.BoxGeometry(0.12, 0.1, 0.16), this.plain, s * (W2 + 0.04), belt + 0.1, zm - 0.04);
      // échappement
      add(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 10).rotateX(Math.PI / 2), this.chrome, s * W2 * 0.55, Y0 + 0.08, -zf - 0.02);
      // poignées
      add(new THREE.BoxGeometry(0.02, 0.025, 0.12), this.chrome, s * (W2 + 0.002), belt - 0.06, (F.b - 0.5) * Lb - 0.18);
    }
    add(new THREE.BoxGeometry(0.32, 0.1, 0.02), new THREE.MeshStandardMaterial({ color: 0xf2f2f0 }), 0, v.tail - 0.38, -zf - 0.003);
    // numéros de course (portières + capot)
    const nm = new THREE.MeshBasicMaterial({ map: numberTexture(v.number, v.accent), transparent: true });
    for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), nm); p.rotation.y = s * Math.PI / 2; p.position.set(s * (W2 + 0.004), belt - 0.26, (F.b - 0.5) * Lb + 0.03); S.add(p); }
    const hn = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), nm); hn.rotation.x = -Math.PI / 2; hn.position.set(0, this.topY(0.84) + 0.03, (0.84 - 0.5) * Lb); S.add(hn);
    // pare-chocs déformables
    this.bumpF = new THREE.Group(); this.bumpR = new THREE.Group();
    const bf = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, W2 * 1.7, 4, 8).rotateZ(Math.PI / 2), this.black), bfl = new THREE.Mesh(new THREE.BoxGeometry(W2 * 1.6, 0.05, 0.2), this.black);
    bf.position.set(0, Y0 + 0.17, 0); bfl.position.set(0, Y0 + 0.03, -0.05); this.bumpF.add(bf, bfl); this.bumpF.position.set(0, 0, zf + 0.03);
    const br = bf.clone(); br.position.set(0, Y0 + 0.22, 0); this.bumpR.add(br); this.bumpR.position.set(0, 0, -zf - 0.03);
    S.add(this.bumpF, this.bumpR);
    // projecteurs additionnels (rallye)
    if (d.id === 'quatre' || d.id === 'groupb') {
      const lamp = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff6dd, emissiveIntensity: 0.2 });
      this.lamps = [-0.52, -0.18, 0.18, 0.52].map((x) => add(new THREE.CylinderGeometry(0.075, 0.075, 0.07, 14).rotateX(Math.PI / 2), lamp, x, Y0 + 0.36, zf - 0.05));
    }
    // prise d'air de capot
    if (v.scoop === 1) { add(new THREE.BoxGeometry(0.5, 0.1, 0.55), this.black, 0, this.topY(0.84) + 0.045, (0.82 - 0.5) * Lb); }
    if (v.scoop === 2) { // prises d'air du moteur central
      for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.18, 0.1, 0.5), this.black, s * 0.52, this.topY(0.3) + 0.04, (0.28 - 0.5) * Lb);
      add(new THREE.BoxGeometry(0.4, 0.12, 0.35), this.black, 0, v.roof + 0.05, (F.rr + 0.04 - 0.5) * Lb);
    }
    // aileron
    if (v.wing) {
      const big = v.wing === 2, y = (big ? v.tail + 0.5 : v.tail + 0.3), z = -zf + (big ? 0.1 : 0.2);
      add(new THREE.BoxGeometry(W2 * (big ? 1.95 : 1.75), 0.04, big ? 0.48 : 0.34), this.plain, 0, y, z);
      if (big) add(new THREE.BoxGeometry(W2 * 1.9, 0.03, 0.22), this.plain, 0, y - 0.1, z - 0.18);
      for (const s of [-1, 1]) {
        add(new THREE.BoxGeometry(0.03, big ? 0.38 : 0.28, big ? 0.55 : 0.4), new THREE.MeshStandardMaterial({ color: col(v.accent), roughness: 0.4 }), s * W2 * (big ? 0.98 : 0.88), y, z);
        add(new THREE.BoxGeometry(0.05, y - v.tail + 0.06, 0.12), this.black, s * W2 * 0.4, (y + v.tail) / 2 - 0.04, z + 0.06);
      }
    }
    // bande de couleur d'accent sur le capot et le toit (bandeau fin)
    if (d.id !== 'compacte') {
      const ac = new THREE.MeshPhysicalMaterial({ color: col(v.accent), roughness: 0.35, clearcoat: 1 });
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.22, (1 - F.wf) * Lb * 0.92), ac); stripe.rotation.x = -Math.PI / 2; stripe.position.set(0, this.topY(0.86) + 0.036, ((1 + F.wf) / 2 - 0.5) * Lb - 0.02); S.add(stripe);
    }
  }

  /* ---------- intérieur ---------- */
  _buildInterior() {
    const d = this.def, v = d.vis, F = this.F, Lb = this.Lb, W2 = this.W2, belt = v.belt;
    const I = this.interior = new THREE.Group(); this.shell.add(I);
    const dk = new THREE.MeshStandardMaterial({ color: 0x1a1b1f, roughness: 0.85, side: THREE.DoubleSide }), tube = new THREE.MeshStandardMaterial({ color: 0x8a8d93, roughness: 0.4, metalness: 0.8 });
    const seatM = new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.9 }), acc = new THREE.MeshStandardMaterial({ color: col(v.accent), roughness: 0.6 });
    const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); I.add(m); return m; };
    const zWF = (F.wf - 0.5) * Lb, zRF = (F.rf - 0.5) * Lb, zRR = (F.rr - 0.5) * Lb, zWR = (F.wr - 0.5) * Lb;
    const eyeZ = zWF - 0.95, eyeY = belt + 0.3, dx = 0.36;
    // plancher, tableau de bord, ciel de toit, montants
    add(new THREE.PlaneGeometry(W2 * 1.7, zWF - zWR + 0.2).rotateX(-Math.PI / 2), dk, 0, Y0 + 0.12, (zWF + zWR) / 2);
    add(new THREE.BoxGeometry(W2 * 1.78, 0.13, 0.4), dk, 0, belt - 0.05, zWF - 0.2);
    add(new THREE.BoxGeometry(0.42, 0.1, 0.1), dk, dx, belt + 0.06, zWF - 0.4);
    add(new THREE.PlaneGeometry(W2 * 1.46, zRF - zRR + 0.1).rotateX(Math.PI / 2), dk, 0, v.roof - 0.012, (zRF + zRR) / 2);
    for (const s of [-1, 1]) {
      add(new THREE.BoxGeometry(0.07, belt - Y0 - 0.1, zWF - zWR + 0.15), dk, s * (W2 - 0.06), (belt + Y0) / 2 - 0.02, (zWF + zWR) / 2);          // contre-porte
      const ap = add(new THREE.CylinderGeometry(0.028, 0.028, 1, 8), dk, s * (W2 * 0.74), (belt + v.roof) / 2, (zWF + zRF) / 2);                          // montant A
      const dz = zRF - zWF, dy = v.roof - belt; ap.scale.y = Math.hypot(dz, dy); ap.rotation.x = Math.atan2(dz, dy);
      add(new THREE.BoxGeometry(0.06, v.roof - belt, 0.07), dk, s * (W2 - 0.08), (belt + v.roof) / 2, (F.b - 0.5) * Lb);                                // montant B
      // arceau : barre latérale et arrière
      add(new THREE.CylinderGeometry(0.02, 0.02, zRF - zRR + 0.5, 8).rotateX(Math.PI / 2), tube, s * (W2 - 0.12), v.roof - 0.1, (zRF + zRR) / 2);
      add(new THREE.CylinderGeometry(0.02, 0.02, v.roof - belt, 8), tube, s * (W2 - 0.12), (v.roof + belt) / 2 - 0.05, zRR - 0.15);
    }
    add(new THREE.CylinderGeometry(0.02, 0.02, W2 * 1.6, 8).rotateZ(Math.PI / 2), tube, 0, v.roof - 0.1, zRR - 0.15);
    add(new THREE.CylinderGeometry(0.02, 0.02, W2 * 1.6, 8).rotateZ(Math.PI / 2), tube, 0, belt + 0.1, zRR - 0.15);
    // sièges baquets
    for (const s of [-1, 1]) {
      const sx = s * dx;
      add(new THREE.BoxGeometry(0.46, 0.1, 0.5), seatM, sx, belt - 0.2, eyeZ - 0.22);
      const back = add(new THREE.BoxGeometry(0.46, 0.62, 0.1), seatM, sx, belt + 0.12, eyeZ - 0.5); back.rotation.x = -0.18;
      add(new THREE.BoxGeometry(0.28, 0.2, 0.09), acc, sx, belt + 0.5, eyeZ - 0.58);
    }
    // rétroviseur intérieur, levier, extincteur
    add(new THREE.BoxGeometry(0.28, 0.07, 0.04), dk, 0, v.roof - 0.17, zRF - 0.1);
    add(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 6), tube, 0, belt + 0.04, eyeZ - 0.15).rotation.x = -0.4;
    add(new THREE.CylinderGeometry(0.05, 0.05, 0.28, 10), new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.4 }), -0.34, belt - 0.1, eyeZ - 0.55);
    // volant : jante, branches, moyeu ; pivote avec la direction
    this.wheelPivot = new THREE.Group(); this.wheelPivot.position.set(dx, belt + 0.12, zWF - 0.52); this.wheelPivot.rotation.x = 0.42; I.add(this.wheelPivot);
    this.swGroup = new THREE.Group(); this.wheelPivot.add(this.swGroup);
    const sw = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.018, 8, 26), new THREE.MeshStandardMaterial({ color: 0x1a1a1d, roughness: 0.8 })); this.swGroup.add(sw);
    for (const a of [0, 2.1, 4.2]) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.17, 0.02), tube); sp.position.set(Math.sin(a) * 0.085, Math.cos(a) * 0.085, 0); sp.rotation.z = -a; this.swGroup.add(sp); }
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.02), acc); top.position.y = 0.17; this.swGroup.add(top);
    // combiné d'instruments : CanvasTexture redessinée à 20 Hz (compteur, compte-tours, rapport, voyants)
    this.cv = document.createElement('canvas'); this.cv.width = 384; this.cv.height = 160; this.gtx = new THREE.CanvasTexture(this.cv); this.gtx.colorSpace = SRGB;
    const gm = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.14), new THREE.MeshBasicMaterial({ map: this.gtx, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    gm.position.set(dx, belt + 0.14, zWF - 0.43); gm.rotation.order = 'YXZ'; gm.rotation.set(-0.65, Math.PI, 0); I.add(gm);
    this.drawGauges({ rpm: d.idle, kmh: 0, gear: 1, boost: 0, lights: false, dmg: { engine: 0 }, brake: 0 }, true);
    // points de vue
    const mk = (name, x, y, z) => { const o = new THREE.Object3D(); o.position.set(x, y, z); this.shell.add(o); this.markers[name] = o; };
    mk('eye', dx, eyeY, eyeZ); mk('hood', 0, this.topY(0.8) + 0.5, (F.wf + 0.04 - 0.5) * Lb); mk('bumper', 0, Y0 + 0.28, Lb / 2 + 0.1); mk('smoke', 0, v.hood + 0.05, Lb * 0.25);
    I.visible = true;
  }
  drawGauges(s, force) {
    const g = this.cv.getContext('2d'), d = this.def, W = 384, H = 160;
    g.fillStyle = '#07080b'; g.fillRect(0, 0, W, H);
    const arc = (cx, cy, r, a0, a1, lw, c) => { g.strokeStyle = c; g.lineWidth = lw; g.beginPath(); g.arc(cx, cy, r, a0, a1); g.stroke(); };
    // compte-tours (gauche) : 270° de 135° à 405°
    const rx = 96, ry = 82, rr = 62, a0 = Math.PI * 0.75, span = Math.PI * 1.5, f = clamp(s.rpm / d.rpmMax, 0, 1.05);
    arc(rx, ry, rr, a0, a0 + span, 9, '#1c1e25'); arc(rx, ry, rr, a0, a0 + span * Math.min(1, f), 9, f > 0.9 ? '#ff3b30' : '#29d17d');
    g.fillStyle = '#9aa3b2'; g.font = '600 11px Inter, sans-serif'; g.textAlign = 'center';
    for (let k = 0; k <= 8; k++) { const a = a0 + span * k / 8, x = rx + Math.cos(a) * (rr - 18), y = ry + Math.sin(a) * (rr - 18) + 4; g.fillText(String(k), x, y); }
    g.strokeStyle = '#ff9f1c'; g.lineWidth = 3; g.beginPath(); const na = a0 + span * Math.min(1, f); g.moveTo(rx, ry); g.lineTo(rx + Math.cos(na) * (rr - 6), ry + Math.sin(na) * (rr - 6)); g.stroke();
    g.fillStyle = '#e8ecf3'; g.font = '800 30px Inter, sans-serif'; g.fillText(s.gear < 0 ? 'R' : s.gear === 0 ? 'N' : String(s.gear), rx, ry + 36);
    // vitesse (droite) : valeur numérique + arc
    const sx = 290, sy = 82, sf = clamp(s.kmh / 220, 0, 1);
    arc(sx, sy, rr, a0, a0 + span, 9, '#1c1e25'); arc(sx, sy, rr, a0, a0 + span * sf, 9, '#3b82f6');
    g.fillStyle = '#fff'; g.font = '800 40px Inter, sans-serif'; g.fillText(String(Math.round(s.kmh)), sx, sy + 12); g.fillStyle = '#9aa3b2'; g.font = '600 12px Inter, sans-serif'; g.fillText('km/h', sx, sy + 30);
    // pression turbo + voyants
    if (d.turbo) { g.fillStyle = '#1c1e25'; g.fillRect(150, 140, 84, 8); g.fillStyle = '#ff9f1c'; g.fillRect(150, 140, 84 * clamp(s.boost, 0, 1), 8); g.fillStyle = '#9aa3b2'; g.font = '600 10px Inter'; g.fillText('TURBO', 192, 134); }
    const lamp = (x, c, on, t) => { g.fillStyle = on ? c : '#22252c'; g.beginPath(); g.arc(x, 20, 7, 0, 7); g.fill(); g.fillStyle = '#9aa3b2'; g.font = '700 8px Inter'; g.fillText(t, x, 40); };
    lamp(160, '#ff3b30', s.dmg.engine > 50, 'MOT'); lamp(192, '#38bdf8', s.lights, 'FEUX'); lamp(224, '#ff9f1c', s.brake > 0.2, 'FREIN');
    this.gtx.needsUpdate = true;
  }

  /* ---------- feux ---------- */
  _buildLights() {
    const v = this.def.vis, zf = this.Lb / 2;
    this.spots = [];
    for (const s of [-1, 1]) {
      const sp = new THREE.SpotLight(0xfff0d0, 0, 140, 0.5, 0.55, 1.2); sp.position.set(s * this.W2 * 0.6, v.nose - 0.05, zf - 0.1); sp.visible = false;
      const tg = new THREE.Object3D(); tg.position.set(s * this.W2 * 0.3, v.nose - 1.1, zf + 30); this.shell.add(sp, tg); sp.target = tg; this.spots.push(sp);
    }
    this.lightsOn = false;
  }
  setLights(on) {
    if (this.ghost || this.lightsOn === on) return; this.lightsOn = on;
    for (const s of this.spots) { s.visible = on; s.intensity = on ? 140 : 0; }
    this.head.emissiveIntensity = on ? 3 : 0.25; if (this.lamps) this.lamps.forEach((m) => (m.material.emissiveIntensity = on ? 2.5 : 0.2));
  }

  _ghostify() {
    this.root.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.32; o.material.depthWrite = false; o.castShadow = false; if (o.material.emissive) o.material.emissiveIntensity = 0; } });
    this.ang = [0, 0, 0, 0]; this.bumpF.visible = true;
  }

  /* ---------- dégâts visuels ---------- */
  dent(cx, cz, sev) {
    const orig = this.geo.userData.orig, p = this.geo.attributes.position, R = 0.85 + sev * 0.04, amt = Math.min(0.35, sev * 0.022);
    const bz = cz - this.zc, by = this.def.vis.belt - 0.15, bx = cx, cy = 0.62;
    let moved = false;
    for (let i = 0; i < p.count; i++) {
      const x = orig[i * 3] + this.dents[i * 3], y = orig[i * 3 + 1] + this.dents[i * 3 + 1], z = orig[i * 3 + 2] + this.dents[i * 3 + 2];
      const dx = x - bx, dy = y - by, dz = z - bz, dd = Math.hypot(dx, dy, dz);
      if (dd > R) continue;
      const k = (1 - dd / R) ** 2 * amt * (0.7 + Math.random() * 0.6), l = Math.hypot(x, y - cy, z - bz) || 1;
      this.dents[i * 3] -= (x / l) * k; this.dents[i * 3 + 1] -= ((y - cy) / l) * k * 0.6; this.dents[i * 3 + 2] -= ((z - bz) / l) * k * 0.4 + (cz > 0 ? 1 : -1) * k * 0.7 * (Math.abs(cz) > 1 ? 1 : 0);
      moved = true;
    }
    if (moved) this._applyDents();
  }
  _applyDents() {
    const o = this.geo.userData.orig, p = this.geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setXYZ(i, o[i * 3] + this.dents[i * 3], o[i * 3 + 1] + this.dents[i * 3 + 1], o[i * 3 + 2] + this.dents[i * 3 + 2]);
    p.needsUpdate = true; this.geo.computeVertexNormals();
  }
  /* réparation : atténue les bosses selon la carrosserie restante */
  repairBody(frac) { if (frac >= 0.999) return; for (let i = 0; i < this.dents.length; i++) this.dents[i] *= frac; this._applyDents(); }

  /* ---------- mise à jour par image ---------- */
  update(ph, dt) {
    const r = this.root, d = this.def;
    r.position.set(ph.x, ph.y, ph.z); r.rotation.set(ph.pitchG, ph.yaw, ph.rollG);
    this.body.position.y = 0.45 + ph.heave; this.body.rotation.set(ph.pitch, 0, ph.roll);
    const dm = ph.dmg, air = ph.air ? 0.07 : 0;
    this.wheels.forEach((w, i) => {
      const flat = dm.tires[i];
      w.g.position.y = d.wheelR * (1 - flat * 0.18) + air;
      w.tire.scale.set(1, 1 - flat * 0.2, 1 - flat * 0.2);
      if (!this.ghost) {
        const spinBoost = w.front ? ph.spinF : ph.spinR, lock = w.front ? ph.lockF : ph.lockR, rate = lock && Math.abs(ph.u) > 1 ? 0 : (ph.u / d.wheelR) * (1 + spinBoost * 2.2) + (spinBoost > 0.1 ? Math.sign(ph.gear) * 18 * spinBoost : 0);
        this.ang[i] += rate * dt; w.spin.rotation.x = this.ang[i];
      } else { this.ang[i] += (ph.u / d.wheelR) * dt; w.spin.rotation.x = this.ang[i]; }
      if (w.front) w.g.rotation.y = ph.steer + (w.left ? 1 : -1) * dm.steer * 0.0016;
    });
    if (this.ghost) return;
    // pare-chocs
    this.bumpF.visible = dm.bumpF < 99; this.bumpF.rotation.x = dm.bumpF * 0.004; this.bumpF.position.set(dm.bumpF * 0.0004 * dm.steerSign, -dm.bumpF * 0.0015, d.vis.L / 2 + 0.03 - dm.bumpF * 0.0014);
    this.bumpR.visible = dm.bumpR < 99; this.bumpR.rotation.x = -dm.bumpR * 0.004; this.bumpR.position.set(0, -dm.bumpR * 0.0015, -d.vis.L / 2 - 0.03 + dm.bumpR * 0.0014);
    // volant, combiné, feux stop
    this.swGroup.rotation.z = -ph.steer * 3.2;
    this.tail.emissiveIntensity = ph.brake > 0.15 || ph.hand ? 3.2 : this.lightsOn ? 1.1 : 0.35;
    this.gaugeT += dt;
    if (this.view === 3 && this.gaugeT > 0.05) {
      this.gaugeT = 0;
      this.drawGauges({ rpm: ph.rpm, kmh: ph.kmh, gear: ph.gear, boost: ph.boost, lights: this.lightsOn, dmg: dm, brake: ph.brake });
    }
  }
  /* vue : cache le volant etc. hors cabine inutile ; en cabine on masque le toit côté extérieur pour éviter le reflet */
  setView(v) { this.view = v; }
  dispose() { this.root.traverse((o) => { o.geometry?.dispose(); }); this.gtx?.dispose(); }
}

function mergeG(list) {
  // fusion minimale de géométries indexées / non indexées sans dépendance : conversion en non indexé puis concaténation
  const arr = list.map((g) => (g.index ? g.toNonIndexed() : g));
  let n = 0; arr.forEach((g) => (n += g.attributes.position.count));
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0;
  arr.forEach((g) => { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; });
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); return out;
}
function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }

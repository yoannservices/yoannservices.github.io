/* VTT en primitives : cadre en tubes, bras oscillant avec amortisseur, fourche télescopique, roues à rayons et crampons,
   disques, pédalier, chaîne, guidon avec compteur. Repère : avant = -Z, origine au milieu des axes, au niveau des axes. */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { clamp } from '../core/rng.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const Y = V(0, 1, 0);
const std = (c, r = 0.5, m = 0.4, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, ...o });

function tube(parent, a, b, r, mat, seg = 10) {
  const d = new THREE.Vector3().subVectors(b, a), len = d.length(), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
  m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(Y, d.normalize()); m.castShadow = true; parent.add(m); return m;
}
const mesh = (parent, geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };

/* roue : pneu à crampons, jante, rayons croisés, moyeu, disque (axe de rotation = X) */
function wheelGroup(R, mats, discSide) {
  const g = new THREE.Group();
  const tire = mesh(g, new THREE.TorusGeometry(R - 0.05, 0.05, 12, 40).rotateY(Math.PI / 2), mats.rubber);
  tire.scale.set(0.92, 1, 1);
  const knobs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.034, 0.026, 0.034), mats.rubber, 80), o = new THREE.Object3D();
  for (let i = 0; i < 40; i++) for (let s = 0; s < 2; s++) {
    const a = i / 40 * Math.PI * 2 + s * 0.08, r = R - 0.003;
    o.position.set((s ? 1 : -1) * 0.026, Math.sin(a) * r, Math.cos(a) * r); o.rotation.set(-a + Math.PI / 2, 0, (s ? 1 : -1) * 0.5); o.updateMatrix(); knobs.setMatrixAt(i * 2 + s, o.matrix);
  }
  g.add(knobs);
  mesh(g, new THREE.TorusGeometry(R - 0.082, 0.015, 8, 40).rotateY(Math.PI / 2), mats.rim).scale.set(2.2, 1, 1);
  const sp = [];
  for (let k = 0; k < 32; k++) {
    const len = R - 0.1, a = k / 32 * Math.PI * 2, side = k % 2 ? 1 : -1;
    const gg = new THREE.CylinderGeometry(0.0028, 0.0028, len, 3); gg.translate(0, 0.03 + len / 2, 0); gg.rotateX(a); gg.translate(side * 0.022, 0, 0); sp.push(gg);
  }
  mesh(g, mergeGeometries(sp), mats.spoke);
  mesh(g, new THREE.CylinderGeometry(0.03, 0.03, 0.11, 14).rotateZ(Math.PI / 2), mats.hub);
  mesh(g, new THREE.CylinderGeometry(0.098, 0.098, 0.004, 28).rotateZ(Math.PI / 2), mats.disc, discSide * 0.058, 0, 0);
  mesh(g, new THREE.CylinderGeometry(0.05, 0.05, 0.006, 6).rotateZ(Math.PI / 2), mats.disc, discSide * 0.058, 0, 0);
  return g;
}

export class BikeModel {
  /* bike : fiche de parts.js ; frame, wheel : choix de la boutique */
  constructor(bike, frame, wheel) {
    this.spec = bike; const { R, wb } = bike, root = this.root = new THREE.Group(); this.R = R;
    const M = this.mats = {
      paint: new THREE.MeshPhysicalMaterial({ color: frame.col, roughness: 0.32, metalness: 0.55, clearcoat: 1, clearcoatRoughness: 0.12 }),
      black: std(0x15161a, 0.45, 0.6), alu: std(0xa7adb5, 0.3, 0.9), gold: std(0xc9a227, 0.28, 0.9), rubber: std(0x0c0c0e, 0.95, 0.05), seat: std(0x1c1d21, 0.8, 0.1),
      rim: std(wheel.rim, 0.3, 0.8), hub: std(wheel.hub, 0.25, 0.9), spoke: std(0xb9bfc7, 0.3, 0.9), disc: std(0x8a909a, 0.3, 0.95), chain: std(0x2a2b2e, 0.4, 0.8), spring: std(0xd62828, 0.4, 0.6),
    };
    const ha = bike.geo.head * Math.PI / 180, d = V(0, -Math.sin(ha), -Math.cos(ha)).normalize(), u = d.clone().negate();
    const forkLen = 0.56, c0 = 0.25 * bike.travelF, axleF = V(0, 0, -wb / 2), crown = axleF.clone().addScaledVector(d, -(forkLen - c0));
    this.forkLen = forkLen;
    const BB = V(0, -0.01, 0.08), htB = crown.clone().addScaledVector(u, 0.02), htT = crown.clone().addScaledVector(u, 0.16), seatTop = V(0, 0.56, 0.3), ttBack = V(0, 0.55, 0.27);

    // cadre principal
    tube(root, htB, htT, 0.032, M.paint, 14);
    tube(root, ttBack, htT.clone().add(V(0, -0.015, 0.01)), 0.024, M.paint);
    tube(root, BB, htB.clone().add(V(0, 0.005, 0.01)), 0.032, M.paint, 12);
    tube(root, BB, seatTop, 0.0235, M.paint);
    mesh(root, new THREE.SphereGeometry(0.036, 12, 8), M.paint, BB.x, BB.y, BB.z);
    tube(root, seatTop, seatTop.clone().add(V(0, 0.2, 0.025)), 0.0155, M.alu);
    const saddle = mesh(root, new THREE.SphereGeometry(1, 14, 10), M.seat, 0, 0.77, 0.31); saddle.scale.set(0.065, 0.026, 0.13);
    const nose = mesh(root, new THREE.SphereGeometry(1, 10, 8), M.seat, 0, 0.775, 0.215); nose.scale.set(0.035, 0.022, 0.07);

    // bras oscillant (pivot P) : base arrière, haubans, bielle, cassette, chaîne, disque arrière
    const P = V(0, 0.06, 0.12), swing = this.swing = new THREE.Group(); swing.position.copy(P); root.add(swing);
    const rel = (v) => v.clone().sub(P), rearAxle = V(0, 0, wb / 2);
    for (const s of [-1, 1]) {
      tube(swing, rel(BB).add(V(s * 0.04, 0, 0)), rel(rearAxle).add(V(s * 0.065, 0, 0)), 0.0185, M.paint);
      tube(swing, rel(rearAxle).add(V(s * 0.06, 0, 0)), rel(V(0, 0.34, 0.24)).add(V(s * 0.04, 0, 0)), 0.013, M.paint);
    }
    this.link = rel(V(0, 0.33, 0.235));
    mesh(swing, new THREE.BoxGeometry(0.08, 0.04, 0.05), M.alu, this.link.x, this.link.y, this.link.z);
    this.rearWheel = wheelGroup(R, M, -1); this.rearWheel.position.copy(rel(rearAxle)); swing.add(this.rearWheel);
    mesh(swing, new THREE.CylinderGeometry(0.052, 0.04, 0.05, 12).rotateZ(Math.PI / 2), M.gold, 0.06, rel(rearAxle).y, rel(rearAxle).z);
    mesh(swing, new THREE.BoxGeometry(0.03, 0.12, 0.05), M.black, 0.075, rel(rearAxle).y - 0.06, rel(rearAxle).z + 0.02);
    mesh(swing, new THREE.BoxGeometry(0.04, 0.06, 0.03), M.black, -0.075, rel(rearAxle).y + 0.09, rel(rearAxle).z - 0.1);
    const cr = rel(BB), ca = rel(rearAxle), chainPath = new THREE.CurvePath();
    chainPath.add(new THREE.LineCurve3(V(0.07, cr.y + 0.085, cr.z), V(0.07, ca.y + 0.05, ca.z)));
    chainPath.add(new THREE.LineCurve3(V(0.07, ca.y + 0.05, ca.z), V(0.07, ca.y - 0.05, ca.z)));
    chainPath.add(new THREE.LineCurve3(V(0.07, ca.y - 0.05, ca.z), V(0.07, cr.y - 0.085, cr.z)));
    chainPath.add(new THREE.LineCurve3(V(0.07, cr.y - 0.085, cr.z), V(0.07, cr.y + 0.085, cr.z)));
    mesh(swing, new THREE.TubeGeometry(chainPath, 40, 0.005, 5, true), M.chain);

    // amortisseur arrière : corps + ressort étirés entre le cadre et la bielle
    const shock = this.shock = new THREE.Group(); root.add(shock);
    const body = mesh(shock, new THREE.CylinderGeometry(0.02, 0.02, 1, 10), M.black); const spring = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 49 }, (_, i) => { const t = i / 48, a = t * Math.PI * 14; return V(Math.cos(a) * 0.03, t - 0.5, Math.sin(a) * 0.03); })), 160, 0.0045, 5), M.spring);
    shock.add(spring); this.shockBody = body; this.shockSpring = spring; this.shockTop = V(0, 0.5, 0.2);

    // fourche + direction
    const steerPivot = this.steerPivot = new THREE.Group(); steerPivot.position.copy(crown); steerPivot.quaternion.setFromUnitVectors(Y, u); root.add(steerPivot);
    const steer = this.steer = new THREE.Group(); steerPivot.add(steer);
    mesh(steer, new THREE.BoxGeometry(0.14, 0.04, 0.05), M.black, 0, -0.01, 0);
    for (const s of [-1, 1]) tube(steer, V(s * 0.058, -0.01, 0), V(s * 0.058, -0.3, 0), 0.0185, M.gold);
    this.lowers = new THREE.Group(); steer.add(this.lowers);
    for (const s of [-1, 1]) tube(this.lowers, V(s * 0.058, 0.03, 0), V(s * 0.058, 0.32, 0), 0.0245, M.black);
    mesh(this.lowers, new THREE.BoxGeometry(0.15, 0.03, 0.04), M.black, 0, 0.3, -0.005);
    this.frontWheel = wheelGroup(R, M, 1); this.lowers.add(this.frontWheel);
    mesh(this.lowers, new THREE.BoxGeometry(0.025, 0.06, 0.04), M.black, 0.075, 0.1, -0.02);
    // guidon, potence, poignées, leviers, compteur
    const barG = this.barG = new THREE.Group(); barG.position.set(0, 0.21, 0); steer.add(barG);
    mesh(barG, new THREE.BoxGeometry(0.06, 0.05, 0.065), M.black, 0, 0, 0.0);
    mesh(barG, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-0.4, 0.03, 0.05), V(-0.25, 0.005, 0.005), V(0, 0, 0), V(0.25, 0.005, 0.005), V(0.4, 0.03, 0.05)]), 24, 0.0115, 8), M.black);
    for (const s of [-1, 1]) {
      const gp = V(s * 0.355, 0.028, 0.045); tube(barG, gp.clone().add(V(s * -0.03, 0, 0)), gp.clone().add(V(s * 0.1, 0.004, 0.012)), 0.0165, M.rubber);
      tube(barG, gp.clone().add(V(s * -0.04, -0.003, -0.01)), gp.clone().add(V(s * -0.12, -0.016, -0.075)), 0.0045, M.alu); // levier de frein
    }
    this.gripL = new THREE.Object3D(); this.gripL.position.set(-0.4, 0.04, 0.052); barG.add(this.gripL);
    this.gripR = new THREE.Object3D(); this.gripR.position.set(0.4, 0.04, 0.052); barG.add(this.gripR);
    this.compCanvas = Object.assign(document.createElement('canvas'), { width: 128, height: 64 }); this.compTex = new THREE.CanvasTexture(this.compCanvas); this.compTex.colorSpace = THREE.SRGBColorSpace;
    const comp = mesh(barG, new THREE.PlaneGeometry(0.075, 0.04), new THREE.MeshBasicMaterial({ map: this.compTex }), 0, 0.034, 0.012); comp.rotation.x = -1.0; comp.castShadow = false;
    mesh(barG, new THREE.BoxGeometry(0.08, 0.012, 0.05), M.black, 0, 0.026, 0.012).rotation.x = -1.0;
    this.drawComputer(0);

    // pédalier : manivelles, plateau, pédales plates (restent horizontales)
    const crank = this.crank = new THREE.Group(); crank.position.copy(BB); root.add(crank);
    mesh(crank, new THREE.BoxGeometry(0.02, 0.18, 0.026), M.alu, 0.075, -0.075, 0); mesh(crank, new THREE.BoxGeometry(0.02, 0.18, 0.026), M.alu, -0.075, 0.075, 0);
    mesh(crank, new THREE.CylinderGeometry(0.088, 0.088, 0.008, 28).rotateZ(Math.PI / 2), M.black, 0.062, 0, 0);
    this.pedalR = new THREE.Group(); this.pedalR.position.set(0.12, -0.165, 0); crank.add(this.pedalR);
    this.pedalL = new THREE.Group(); this.pedalL.position.set(-0.12, 0.165, 0); crank.add(this.pedalL);
    for (const p of [this.pedalR, this.pedalL]) { mesh(p, new THREE.BoxGeometry(0.03, 0.02, 0.105), M.alu); const m = new THREE.Object3D(); m.position.set(0, 0.012, 0); p.add(m); p.userData.anchor = m; }
    this.saddleMark = new THREE.Object3D(); this.saddleMark.position.set(0, 0.8, 0.3); root.add(this.saddleMark);
    this.sag = 0.25;
  }

  drawComputer(kmh) {
    const g = this.compCanvas.getContext('2d'); g.fillStyle = '#031014'; g.fillRect(0, 0, 128, 64);
    g.fillStyle = '#7fe8e8'; g.font = 'bold 40px monospace'; g.textAlign = 'center'; g.fillText(String(Math.round(kmh)), 64, 40);
    g.font = '14px monospace'; g.fillText('km/h', 64, 58); this.compTex.needsUpdate = true;
  }

  /* st : { steer (rad), barA (rad), susF, susR (0..1), spin (rad), crank (rad), kmh } */
  update(st) {
    const c = clamp(st.susF, 0, 1) * this.spec.travelF;
    this.steer.rotation.y = st.steer; this.barG.rotation.y = st.barA || 0;
    this.lowers.position.y = -(this.forkLen - c);
    this.frontWheel.rotation.x = -st.spin; this.rearWheel.rotation.x = -st.spin;
    this.swing.rotation.x = -clamp(st.susR, 0, 1) * 0.32 + 0.08;
    this.crank.rotation.x = st.crank; this.pedalR.rotation.x = -st.crank; this.pedalL.rotation.x = -st.crank;
    // amortisseur : du cadre à la bielle (déplacée par le bras)
    this.swing.updateMatrix(); const low = this.link.clone().applyMatrix4(this.swing.matrix), a = this.shockTop, dv = low.clone().sub(a), len = dv.length();
    this.shock.position.copy(a).addScaledVector(dv, 0.5); this.shock.quaternion.setFromUnitVectors(Y, dv.normalize());
    this.shockBody.scale.y = len * 0.4; this.shockBody.position.y = -len * 0.3; this.shockSpring.scale.y = len * 0.62; this.shockSpring.position.y = len * 0.19;
    if (st.kmh !== undefined && Math.round(st.kmh) !== this._lastKmh) { this._lastKmh = Math.round(st.kmh); this.drawComputer(st.kmh); }
  }
  /* position d'un point d'ancrage dans le repère du vélo */
  anchor(name, out) {
    const o = name === 'gripL' ? this.gripL : name === 'gripR' ? this.gripR : name === 'pedalL' ? this.pedalL.userData.anchor : name === 'pedalR' ? this.pedalR.userData.anchor : this.saddleMark;
    return out.setFromMatrixPosition(o.matrixWorld).applyMatrix4(this._inv);
  }
  /* frame : groupe parent commun au vélo et au pilote ; les ancrages sont donnés dans son repère */
  prepare(frame) { frame.updateMatrixWorld(true); this._inv = this._inv || new THREE.Matrix4(); this._inv.copy(frame.matrixWorld).invert(); }
}

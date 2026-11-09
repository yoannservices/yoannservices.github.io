// Modèles 3D procéduraux des 5 engins (pas de .glb libre de droits pour ce matériel). Chaque builder renvoie :
//  root, eye (poste de conduite), tip (arête du godet / lame), pour (point de déversement), bedLocal (repère de la benne),
//  pose(m, dt, t, night, view) : articule les outils, roues, chenilles, vérins, voyants.
import * as THREE from 'three';
import { mats, box, cyl, extrude, wheel, track, cabin, ram, anchor, lighting } from './kit.js';
import { EXC } from './Machine.js';

const lerp = (a, b, t) => a + (b - a) * t;
const PAINT = { loader: '#f2b705', excavator: '#e8761a', dumper: '#f2b705', dozer: '#f2b705', truck: '#2f6fb5' };

function heapMesh(color) {
  const g = new THREE.SphereGeometry(1, 14, 8); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const k = 1 + 0.12 * Math.sin(i * 12.9898) * Math.cos(i * 78.233); p.setXYZ(i, p.getX(i) * k, Math.max(0, p.getY(i)) * k, p.getZ(i) * k); }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true })); m.castShadow = true; m.visible = false; return m;
}
const heapColor = (g) => new THREE.Color().setHSL(0.09, 0.12 + 0.22 * g, 0.28 + 0.2 * g);

// ------------------------------------------------------------------------------------------------ chargeuse sur pneus
function loader(P) {
  const K = mats(P), root = new THREE.Group(), W = [];
  // châssis arrière + capot moteur + contrepoids
  extrude(root, [[-3.9, 0.8], [-3.9, 2.0], [-3.2, 2.5], [-1.1, 2.55], [-0.9, 1.7], [-0.9, 0.8]], 2.4, K.paint, 0, 0.06);
  box(root, 2.1, 0.5, 0.12, K.dark, 0, 1.7, -3.95);                           // grille arrière
  for (let i = 0; i < 6; i++) box(root, 1.7, 0.04, 0.04, K.black, 0, 1.45 + i * 0.1, -3.96);
  cyl(root, 0.13, 0.9, K.chrome, 0.7, 3.0, -2.2, 'y', 10); cyl(root, 0.17, 0.12, K.dark, 0.7, 3.5, -2.2, 'y', 10);   // échappement
  // châssis avant + tours de bras
  extrude(root, [[-0.9, 0.75], [-0.9, 1.7], [0.2, 1.8], [2.3, 1.5], [2.3, 0.75]], 2.15, K.paint, 0, 0.05);
  for (const s of [-1, 1]) box(root, 0.22, 1.4, 0.55, K.paint, s * 0.98, 2.1, 0.6);
  box(root, 2.5, 0.35, 0.45, K.dark, 0, 0.75, 2.45);                          // pare-chocs avant
  const cab = cabin(root, { w: 1.75, h: 1.95, d: 1.95, y: 1.82, z: -0.3, paint: P, wheelType: 'wheel' }); cab.g.position.x = 0;
  for (const [x, z] of [[-1.28, 1.7], [1.28, 1.7], [-1.28, -1.8], [1.28, -1.8]]) {
    const w = wheel(root, 0.98, 0.92, x, 0.98, z, x > 0, P); W.push({ ...w, front: z > 0 });
    extrude(root, [[-1.1, 0], [-0.9, 0.35], [0.9, 0.35], [1.1, 0]], 1.05, K.paint, x * 0.99, 0.03).position.y = 1.95;   // garde-boue
  }
  // bras de levage + godet
  const arm = new THREE.Group(); arm.position.set(0, 2.55, 0.6); root.add(arm);
  for (const s of [-1, 1]) extrude(arm, [[0, -0.2], [1.6, 0.05], [3.4, -0.2], [3.4, 0.2], [1.6, 0.5], [0, 0.22]], 0.26, K.paint, s * 0.98, 0.03);
  const cross = box(arm, 2.0, 0.25, 0.25, K.paint, 0, 0.1, 1.2);
  const bk = new THREE.Group(); bk.position.set(0, 0, 3.4); arm.add(bk);
  for (const s of [-1, 1]) extrude(bk, [[-0.15, 0.55], [0.4, 0.5], [0.9, -0.1], [1.6, -0.74], [1.65, -0.8], [0, -0.8]], 0.1, K.bucket, s * 1.45, 0.02);
  const fl = box(bk, 2.9, 0.1, 1.55, K.bucket, 0, -0.77, 0.82); fl.rotation.x = -0.05;
  box(bk, 2.9, 1.25, 0.1, K.bucket, 0, -0.1, -0.1);
  for (let i = -3; i <= 3; i++) { const t = box(bk, 0.2, 0.1, 0.34, K.steel, i * 0.4, -0.8, 1.68); t.rotation.x = 0.3; }
  const tip = anchor(bk, 0, -0.78, 1.65), pour = anchor(bk, 0, -0.3, 0.75);
  const heap = heapMesh('#6a6256'); heap.position.set(0, -0.55, 0.78); heap.scale.set(1.35, 0.8, 0.7); bk.add(heap);
  // vérins : levage (châssis -> bras) et cavage (bras -> godet)
  const a1 = anchor(root, 0.6, 1.1, 1.6), a2 = anchor(arm, 0.6, -0.1, 1.5), a3 = anchor(root, 0, 3.2, 0.5), a4 = anchor(bk, 0, 0.45, 0.1);
  const r1 = ram(root, a1, a2, 0.1), r2 = ram(root, a3, a4, 0.08), a1b = anchor(root, -0.6, 1.1, 1.6), a2b = anchor(arm, -0.6, -0.1, 1.5), r3 = ram(root, a1b, a2b, 0.1);
  const light = lighting(root, { front: [[-0.9, 1.45, 2.55], [0.9, 1.45, 2.55]], rear: [[-1.0, 1.9, -3.97], [1.0, 1.9, -3.97]], beacon: [0.7, 4.0, -0.3] }, P);
  const pose = (m, dt) => {
    const T = m.tool, th = lerp(0.46, -0.8, T.arm), om = lerp(0.95, -0.7, T.tilt);
    arm.rotation.x = th; bk.rotation.x = om - th;
    r1(); r2(); r3();
    for (const w of W) { w.spin.rotation.x += m.speed * dt / 0.98; if (w.front) w.g.rotation.y = m.steerA * 0.5; }
    const f = m.cargo.vol / (m.capacity(poseMods) || 1); heap.visible = f > 0.02; if (heap.visible) { heap.scale.set(1.3, 0.35 + 0.8 * f, 0.7); heap.material.color.copy(heapColor(m.cargo.g)); }
  };
  return { root, eye: cab.eye, cab, tip, pour, pose, light, spin: W, hide: [cab.roof, cross, ...r2.meshes] };   // rien devant les yeux en vue cabine
}

// ------------------------------------------------------------------------------------------------ pelle hydraulique
function excavator(P) {
  const K = mats(P), root = new THREE.Group();
  const tl = track(root, 4.6, 1.15, 0.95, 1.4, 0.58, P), tr = track(root, 4.6, 1.15, 0.95, -1.4, 0.58, P);
  box(root, 2.2, 0.55, 3.2, K.dark, 0, 0.75, 0);
  cyl(root, 0.9, 0.25, K.steel, 0, 1.15, 0, 'y', 24);
  const tur = new THREE.Group(); tur.position.y = 1.25; root.add(tur);
  extrude(tur, [[-2.6, 0], [-2.7, 1.3], [-2.2, 1.7], [-0.4, 1.35], [0, 0.9], [1.2, 0.8], [1.2, 0]], 3.0, K.paint, 0, 0.06);
  box(tur, 2.4, 0.5, 0.7, K.dark, 0, 1.0, -2.55);                           // contrepoids
  box(tur, 1.8, 0.45, 1.0, K.paint, 0, 1.58, -1.1); cyl(tur, 0.11, 0.8, K.chrome, -0.9, 1.9, -1.6, 'y', 10);
  const cab = cabin(tur, { w: 1.45, h: 1.8, d: 1.6, x: 0.95, y: 0.15, z: 0.55, paint: P, wheelType: 'stick' });
  box(tur, 0.5, 0.18, 1.0, K.dark, -0.85, 0.18, 0.7).visible = true;
  // flèche, balancier, godet
  const boom = new THREE.Group(); boom.position.set(0, 0.95, 1.0); tur.add(boom);
  extrude(boom, [[-0.3, -0.45], [-0.3, 0.45], [2.4, 0.95], [5.8, 0.18], [5.8, -0.2], [2.4, 0.38]], 0.55, K.paint, 0, 0.05);
  const stick = new THREE.Group(); stick.position.set(0, 0, 5.8); boom.add(stick);
  extrude(stick, [[-0.25, -0.25], [-0.25, 0.3], [1.3, 0.38], [2.9, 0.12], [2.9, -0.15], [1.3, -0.2]], 0.45, K.paint, 0, 0.04);
  const bk = new THREE.Group(); bk.position.set(0, 0, 2.9); stick.add(bk);
  for (const s of [-1, 1]) extrude(bk, [[-0.2, 0.2], [0.5, 0.45], [1.2, -0.1], [1.45, -0.55], [1.5, -0.62], [0.5, -0.7], [-0.1, -0.35]], 0.08, K.bucket, s * 0.55, 0.02);
  extrude(bk, [[0.5, 0.45], [1.0, 0.3], [1.35, -0.2], [1.5, -0.62], [0.5, -0.7]], 1.0, K.bucket, 0, 0.02).scale.set(1, 1, 1);
  for (let i = -2; i <= 2; i++) { const t = box(bk, 0.14, 0.34, 0.12, K.steel, i * 0.22, -0.64, 1.55); t.rotation.x = 0.7; }
  const tip = anchor(bk, 0, -0.66, 1.55), pour = anchor(bk, 0, -0.1, 0.8);
  const heap = heapMesh('#6a6256'); heap.position.set(0, -0.35, 0.7); bk.add(heap);
  const A = (p, x, y, z) => anchor(p, x, y, z);
  const r1 = ram(tur, A(tur, 0, 0.3, 0.35), A(boom, 0, 0.8, 1.5), 0.13), r2 = ram(boom, A(boom, 0, 0.95, 2.4), A(stick, 0, 0.4, 0.2), 0.11), r3 = ram(stick, A(stick, 0, 0.35, 1.9), A(bk, 0, 0.4, 0.15), 0.09);
  const light = lighting(tur, { front: [[-0.2, 1.2, 1.25], [0.2, 1.2, 1.25]], rear: [[-1.0, 1.0, -2.78], [1.0, 1.0, -2.78]], beacon: [-0.8, 2.0, -0.9] }, P);
  const pose = (m, dt) => {
    const T = m.tool; tur.rotation.y = T.swing;
    boom.rotation.x = -T.boom; stick.rotation.x = T.stick; bk.rotation.x = T.bucket;
    r1(); r2(); r3();
    const turn = m.steerA * m.s.turn * 0.9 * dt * 1.4;   // vitesse de chaque chenille : avance ± rotation
    pose.l = (pose.l ?? 0) + (m.speed * dt - turn) / tl.per; pose.r = (pose.r ?? 0) + (m.speed * dt + turn) / tl.per;
    tl.update(-pose.l); tr.update(-pose.r);
    const f = m.cargo.vol / (m.capacity(poseMods) || 1); heap.visible = f > 0.02; if (heap.visible) { heap.scale.set(0.55, 0.15 + 0.5 * f, 0.55); heap.material.color.copy(heapColor(m.cargo.g)); }
  };
  return { root, eye: cab.eye, cab, tip, pour, pose, light, hide: [cab.roof], turret: tur };
}

// ------------------------------------------------------------------------------------------------ benne (commune tombereau / camion)
function bed(parent, spec, K, x1, long, wide, hgt, z0) {
  const g = new THREE.Group(); g.position.set(0, spec === 'd' ? 2.65 : 1.75, z0); parent.add(g);
  box(g, wide, 0.16, long, K.paint, 0, 0, long / 2);
  for (const s of [-1, 1]) { extrude(g, [[0, 0], [long, 0.1], [long, hgt], [0.1, hgt * 0.85]], 0.16, K.paint, s * (wide / 2 - 0.05), 0.03); box(g, 0.2, 0.2, long, K.steel, s * (wide / 2), hgt, long / 2).position.y = hgt; }
  box(g, wide, hgt + 0.7, 0.16, K.paint, 0, hgt / 2 + 0.2, long);                  // paroi avant
  const vis = box(g, wide + 0.2, 0.1, 1.5, K.paint, 0, hgt + 0.55, long + 0.7); vis.rotation.x = 0.35;   // auvent
  const heap = heapMesh('#6a6256'); heap.position.set(0, 0.1, long / 2); g.add(heap);
  return { g, heap, long, wide, hgt };
}
function haul(id, P) {
  const K = mats(P), root = new THREE.Group(), W = [], dump = id === 'dumper';
  const S = dump ? { wb: [3.3, -3.0], R: 1.2, wd: 1.0, x: 1.75, bedL: 5.5, bedW: 3.5, bedH: 1.7, z0: -4.9, cabZ: 3.15 } : { wb: [3.7, 2.1, -2.7, -4.0], R: 0.55, wd: 0.42, x: 1.1, bedL: 5.7, bedW: 2.5, bedH: 1.2, z0: -5.0, cabZ: 3.5 };
  // châssis
  box(root, dump ? 2.6 : 1.1, dump ? 0.5 : 0.35, dump ? 9.2 : 9.0, K.dark, 0, 1.3, -0.5 - (dump ? 0 : 0.2));
  if (dump) {
    extrude(root, [[2.0, 1.2], [2.0, 2.5], [3.0, 3.0], [4.8, 2.5], [5.2, 1.3]], 2.8, K.paint, 0, 0.08);      // capot moteur
    box(root, 2.6, 0.6, 0.6, K.dark, 0, 1.0, 5.1); box(root, 2.2, 0.5, 0.12, K.black, 0, 1.9, 5.16);
    const cb = cabin(root, { w: 1.5, h: 1.9, d: 1.6, x: 1.1, y: 2.5, z: 2.9, paint: P, wheelType: 'wheel' }); root.userData.cab = cb;
  } else {
    extrude(root, [[2.3, 1.5], [2.3, 3.3], [3.0, 3.8], [4.3, 3.9], [4.8, 3.2], [4.8, 1.5]], 2.5, K.paint, 0, 0.08);   // cabine avancée
    box(root, 2.2, 0.3, 0.1, K.chrome, 0, 1.8, 4.86);
    const cb = cabin(root, { w: 2.1, h: 1.9, d: 1.8, x: 0, y: 1.95, z: 3.6, paint: P, wheelType: 'wheel' }); cb.g.visible = true; root.userData.cab = cb;
    for (const s of [-1, 1]) { cyl(root, 0.1, 2.2, K.chrome, s * 1.3, 2.7, 2.0, 'y', 8); box(root, 0.08, 0.5, 0.3, K.dark, s * 1.35, 2.3, 4.7); }
  }
  const cb = root.userData.cab;
  for (const z of S.wb) for (const s of [-1, 1]) {
    const w = wheel(root, S.R, S.wd, s * S.x, S.R, z, s > 0, P); W.push({ ...w, front: z > 1.5 });
    if (!dump && z < 0) { const w2 = wheel(root, S.R, S.wd, s * (S.x - 0.5), S.R, z, s > 0, P); W.push({ ...w2, front: false }); }
  }
  const bd = bed(root, dump ? 'd' : 't', K, S.x, S.bedL, S.bedW, S.bedH, S.z0);
  const tip = anchor(root, 0, 0.6, S.z0 - 0.05), pour = anchor(bd.g, 0, 0.8, 0.3);
  const front = dump ? [[-1.1, 1.7, 5.12], [1.1, 1.7, 5.12]] : [[-0.8, 1.8, 4.88], [0.8, 1.8, 4.88]];
  const light = lighting(root, { front, rear: [[-1.0, 1.5, -5.2], [1.0, 1.5, -5.2]], beacon: [dump ? 1.1 : 0, dump ? 4.5 : 4.2, dump ? 2.9 : 3.5] }, P);
  const a1 = anchor(root, 0, 1.4, -1.5), a2 = anchor(bd.g, 0, 0.1, 1.6), rm = ram(root, a1, a2, 0.14);
  const pose = (m, dt) => {
    bd.g.rotation.x = -m.tool.bed * 0.95; rm();
    for (const w of W) { w.spin.rotation.x += m.speed * dt / S.R; if (w.front) w.g.rotation.y = m.steerA * 0.7; }
    const f = m.cargo.vol / (m.capacity(poseMods) || 1); bd.heap.visible = f > 0.02;
    if (bd.heap.visible) { bd.heap.scale.set(bd.wide / 2 - 0.1, 0.2 + f * (bd.hgt * 0.9), bd.long / 2 - 0.1); bd.heap.material.color.copy(heapColor(m.cargo.g)); }
  };
  return { root, eye: cb.eye, cab: cb, tip, pour, pose, light, bed: bd.g, hide: [cb.roof] };
}

// ------------------------------------------------------------------------------------------------ bouteur
function dozer(P) {
  const K = mats(P), root = new THREE.Group();
  const tl = track(root, 3.9, 1.3, 0.85, 1.55, 0.68, P), tr = track(root, 3.9, 1.3, 0.85, -1.55, 0.68, P);
  extrude(root, [[-2.3, 0.9], [-2.3, 1.6], [-1.0, 1.7], [-0.4, 2.7], [0.9, 2.7], [1.0, 1.6], [2.0, 1.4], [2.0, 0.9]], 2.4, K.paint, 0, 0.08);
  box(root, 2.6, 0.7, 0.9, K.dark, 0, 1.05, 2.0);
  const cab = cabin(root, { w: 1.7, h: 1.85, d: 1.6, y: 1.65, z: -0.55, paint: P, wheelType: 'stick' });
  cyl(root, 0.12, 0.9, K.chrome, 0.6, 3.1, 1.2, 'y', 10);
  box(root, 2.4, 0.5, 0.6, K.dark, 0, 1.3, -2.55);
  for (const s of [-1.1, 0, 1.1]) { const t = box(root, 0.2, 0.9, 0.2, K.steel, s, 0.7, -2.9); t.rotation.x = -0.4; }   // dent de déroctage
  const blade = new THREE.Group(); blade.position.set(0, 0.55, 3.85); root.add(blade);
  extrude(blade, [[-0.15, -0.55], [-0.35, 0.2], [0.1, 0.78], [0.35, 0.78], [0.0, 0.1], [0.12, -0.55]], 3.9, K.paint, 0, 0.04);
  box(blade, 3.95, 0.16, 0.12, K.steel, 0, -0.52, 0.1);
  const arms = new THREE.Group(); arms.position.set(0, 1.1, 1.6); root.add(arms);
  for (const s of [-1, 1]) { const a = box(arms, 0.28, 0.3, 2.5, K.dark, s * 1.65, 0, 1.25); a.userData.arm = true; }
  const tip = anchor(blade, 0, -0.5, 0.1), pour = anchor(blade, 0, 0.2, 0.8);
  const light = lighting(root, { front: [[-0.8, 1.5, 2.5], [0.8, 1.5, 2.5]], rear: [[-1.0, 1.7, -2.32], [1.0, 1.7, -2.32]], beacon: [0.6, 3.0, -0.55] }, P);
  const pose = (m, dt) => {
    const b = m.tool.blade; blade.position.y = 0.55 + b * 1.1; blade.rotation.x = 0.05 - b * 0.08;
    arms.rotation.x = Math.atan2(blade.position.y - 1.1, 2.25) * -1;
    const turn = m.steerA * m.s.turn * 0.9 * dt * 1.55;
    pose.l = (pose.l ?? 0) + (m.speed * dt - turn) / tl.per; pose.r = (pose.r ?? 0) + (m.speed * dt + turn) / tl.per;
    tl.update(-pose.l); tr.update(-pose.r);
  };
  return { root, eye: cab.eye, cab, tip, pour, pose, light, hide: [cab.roof] };
}

export const poseMods = { bucket: 1, tank: 1 };
export function buildMachine(id, group) {
  const P = PAINT[id], mdl = id === 'loader' ? loader(P) : id === 'excavator' ? excavator(P) : id === 'dozer' ? dozer(P) : haul(id, P);
  mdl.root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  group.add(mdl.root);
  const dashT = { t: 0 };
  // mise à jour commune : position, assiette, outils, compteurs, feux. night : 0 jour, 1 nuit
  mdl.update = (m, dt, t, night, cabinView) => {
    mdl.root.position.set(m.x, m.y, m.z); mdl.root.rotation.set(m.pitch, m.h, m.roll, 'YXZ');
    if (m.s.type === 'tracked') mdl.root.rotation.order = 'YXZ';
    mdl.pose(m, dt);
    mdl.light(m.lights, m.beacon, t, m.speed < -0.3, false, night);
    for (const o of mdl.hide) o.visible = !cabinView;
    dashT.t += dt;
    if (dashT.t > 0.05 && mdl.cab) {
      dashT.t = 0;
      const kmh = String(Math.round(Math.abs(m.speed) * 3.6)), fuel = (m.fuel / (m.fuelMaxCached || m.s.fuel)).toFixed(2), rpm = (0.18 + 0.7 * m.thr + 0.1 * Math.min(1, m.toolSpeed)).toFixed(2);
      mdl.cab.draw([kmh, fuel, rpm, m.damage.toFixed(2), m.lights ? '1' : '0', m.beacon ? '1' : '0', m.running ? '#7ef0c8' : '#ff4a3a', m.running ? 'MOTEUR' : m.dead || (m.fuel <= 0 ? 'PANNE SÈCHE' : 'HORS SERVICE')]);
      if (mdl.cab.sw.userData.wheel) mdl.cab.sw.rotation.z = -m.steerA * 4;
    }
  };
  return mdl;
}

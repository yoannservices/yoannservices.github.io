/* Pièces de décor communes aux lieux : maisons à toit, murs et haies, étals, terrasses, caravanes, tentes, tas de bois, tracteur, congères,
   lampadaires, bornes, panneaux. Chaque pièce ajoute ses obstacles (rectangles orientés ou cercles) à `colliders`. */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { box, circle } from '../gameplay/collision.js';
import { mat, flat, scatter, scaleUV, rockGeos, bushGeos, bushMat, pole } from './kit.js';
import { T } from './textures.js';

const ni = (g) => (g.index ? g.toNonIndexed() : g);
const shade = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };

/* Boîte texturée par une façade : fenêtres alignées sur 3,2 m x 3,4 m (cf. T.facade). */
export function facadeGeo(w, h, d) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, floors = Math.max(1, Math.floor(h / 3.4)) / 6;
  for (let f = 0; f < 6; f++) {
    const span = f < 2 ? d : f < 4 ? 1 : w, cols = Math.max(1, Math.round(span / 3.2)) / 4;
    for (let i = f * 4; i < f * 4 + 4; i++) uv.setXY(i, uv.getX(i) * cols, uv.getY(i) * floors);
  }
  return g;
}
const roofMat = (kind) => ({ tile: mat(T.roofTile(), { rough: 0.8, bump: 1.5 }), slate: mat(T.roofSlate(), { rough: 0.7 }), tin: mat(T.roofTin(), { rough: 0.5, metal: 0.3 }), snow: mat(T.snow(), { rough: 0.9, color: 0xf0f4fa }) })[kind];

/* Maison / chalet / hangar : murs + toit à deux pans (ou toit plat). o : { x, z, w (long. du faîtage), d, h, yaw, wall, key, style, roof, rise, door } */
export function house(scene, colliders, o) {
  const { x, z, w, d, h, yaw = 0, wall = '#d8cdb4', key = 'h', style = {}, roof = 'tile', rise = Math.min(d * 0.32, 3.4) } = o;
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw;
  g.add(shade(new THREE.Mesh(facadeGeo(w, h, d).translate(0, h / 2, 0), mat(T.facade(wall, key, style), { bump: 0.5, rough: 0.85 }))));
  if (roof === 'flat') g.add(shade(new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.4, d + 0.3).translate(0, h + 0.2, 0), mat(T.concrete(), { color: 0x8a8a86 }))));
  else {
    const half = d / 2 + 0.55, slope = Math.hypot(half, rise), ang = Math.atan2(rise, half), rm = roofMat(roof);
    for (const s of [-1, 1]) {
      const p = shade(new THREE.Mesh(scaleUV(new THREE.BoxGeometry(w + 0.9, 0.18, slope), Math.max(1, (w + 1) / 4), Math.max(1, slope / 3)), rm));
      p.position.set(0, h + rise / 2 + 0.06, s * (half / 2 - 0.12)); p.rotation.x = s * ang; g.add(p);
    }
    const gb = new THREE.Shape(); gb.moveTo(-d / 2, 0); gb.lineTo(d / 2, 0); gb.lineTo(0, rise); gb.closePath();
    for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.ShapeGeometry(gb), flat(new THREE.Color(wall).multiplyScalar(0.9), { side: THREE.DoubleSide })); m.rotation.y = s * Math.PI / 2; m.position.set(s * (w / 2 + 0.01), h, 0); g.add(m); }
  }
  if (o.door) { const m = new THREE.Mesh(new THREE.PlaneGeometry(o.door === true ? 1.1 : o.door, 2.2), flat(0x4a3322)); m.position.set(0, 1.1, d / 2 + 0.03); g.add(m); }
  scene.add(g); colliders.push(box(x, z, w / 2, d / 2, -yaw));
  return g;
}

/* Mur ou haie le long d'une ligne brisée. kind : stone, brick, concrete, wood, hedge. */
export function wallRun(scene, colliders, pts, { h = 1.1, t = 0.45, kind = 'stone', color = 0xffffff } = {}) {
  const mats = { stone: mat(T.stone(), { bump: 2, color }), brick: mat(T.facade('#a4584a', 'brick', { stone: true }), { color }), concrete: mat(T.concrete(), { color: 0xa8a8a2 }), wood: mat(T.wood(), { color: 0xa88a64 }) };
  const geos = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], len = Math.hypot(x1 - x0, z1 - z0), yaw = Math.atan2(x1 - x0, z1 - z0), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    colliders.push(box(cx, cz, t / 2, len / 2, -yaw));
    if (kind === 'hedge') {
      const n = Math.max(1, Math.round(len / 1.4)), it = [];
      for (let k = 0; k <= n; k++) it.push({ x: x0 + (x1 - x0) * k / n, z: z0 + (z1 - z0) * k / n, s: h * 0.75, sy: h * 0.8, tint: 0xa8c488 });
      scatter(scene, bushGeos(), bushMat(), it, { seed: 71 + i, receive: true });
    } else geos.push(scaleUV(new THREE.BoxGeometry(t, h, len), Math.max(1, len / 2.6), Math.max(1, h / 1.4)).rotateY(yaw).translate(cx, h / 2, cz));
  }
  if (geos.length) { const m = shade(new THREE.Mesh(mergeGeometries(geos), mats[kind])); scene.add(m); }
}

/* Poteaux courts (bornes) le long de points [x, z]. */
export function bollards(scene, colliders, pts, { h = 0.8, color = 0x59606a } = {}) {
  scatter(scene, [pole(0.09, h)], flat(color, { metal: 0.4 }), pts.map(([x, z]) => ({ x, z, rot: 0 })), { seed: 72 });
  for (const [x, z] of pts) colliders.push(circle(x, z, 0.14));
}

const lampGeo = () => mergeGeometries([pole(0.09, 6.6), new THREE.BoxGeometry(1.6, 0.1, 0.1).translate(0.7, 6.55, 0), new THREE.BoxGeometry(0.7, 0.14, 0.3).translate(1.45, 6.5, 0)].map(ni));
/* items : [{ x, z, rot }] ; le bras du lampadaire pointe vers +x local */
export function lamps(scene, colliders, items) {
  scatter(scene, [lampGeo()], flat(0x2c3138, { metal: 0.5, rough: 0.5 }), items, { seed: 73 });
  for (const it of items) colliders.push(circle(it.x, it.z, 0.2));
}

const stripeCache = {};
function stripes(c1, c2) {
  const k = c1 + c2; if (stripeCache[k]) return stripeCache[k];
  const c = document.createElement('canvas'); c.width = 64; c.height = 8; const g = c.getContext('2d');
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? c2 : c1; g.fillRect(i * 8, 0, 8, 8); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return (stripeCache[k] = t);
}

/* Étal de marché 2,6 x 1,9 m : auvent rayé, table, cageots. */
export function stall(scene, colliders, { x, z, yaw = 0, c1 = '#c4452f', c2 = '#f1ead8' }) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw;
  const post = flat(0x8a8d92, { metal: 0.5 });
  for (const [px, pz] of [[-1.25, -0.85], [1.25, -0.85], [-1.25, 0.85], [1.25, 0.85]]) { const m = new THREE.Mesh(pole(0.04, 2.3), post); m.position.set(px, 0, pz); g.add(shade(m)); }
  const aw = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.05, 2.1), new THREE.MeshStandardMaterial({ map: stripes(c1, c2), roughness: 0.8 })); aw.position.y = 2.3; aw.rotation.x = 0.1; g.add(shade(aw));
  g.add(shade(new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.8, 0.9).translate(0, 0.4, 0.1), mat(T.wood(), { color: 0xb59a74 }))));
  const crates = [0xd5483a, 0xe4a739, 0x6bab4a, 0xe0d070];
  for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.22, 0.4), flat(crates[i])); m.position.set(-0.8 + i * 0.55, 0.91, 0.1); g.add(m); }
  scene.add(g); colliders.push(box(x, z, 1.3, 0.95, -yaw));
}

/* Table ronde de terrasse avec deux chaises. */
export function cafeSet(scene, colliders, { x, z, yaw = 0 }) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw;
  const wood = mat(T.wood(), { color: 0x6a4a34 });
  g.add(shade(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 16).translate(0, 0.76, 0), flat(0x2d3a45))));
  g.add(shade(new THREE.Mesh(pole(0.03, 0.76), flat(0x888d93, { metal: 0.6 }))));
  for (const s of [-1, 1]) { const c = new THREE.Group(); c.position.set(s * 0.62, 0, 0); c.rotation.y = s * Math.PI / 2; c.add(shade(new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.4).translate(0, 0.45, 0), wood)), shade(new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 0.04).translate(0, 0.72, -0.2), wood))); g.add(c); }
  scene.add(g); colliders.push(circle(x, z, 0.85));
}

/* Caravane blanche 2,3 x 5,2 m. */
export function caravan(scene, colliders, { x, z, yaw = 0, color = 0xf0f0ec, stripe = 0x2e6aa8 }) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw;
  const body = flat(color, { rough: 0.35 }), dark = flat(0x1d2830, { rough: 0.2 });
  g.add(shade(new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.9, 5.2).translate(0, 1.55, 0), body)));
  const top = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 5.2, 14, 1, false, -Math.PI / 2, Math.PI).rotateX(Math.PI / 2).scale(1, 0.35, 1).translate(0, 2.5, 0), body); g.add(shade(top));
  g.add(new THREE.Mesh(new THREE.BoxGeometry(2.32, 0.18, 5.22).translate(0, 1.2, 0), flat(stripe)));
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.7), dark); w.position.set(s * 1.16, 1.85, -0.5); w.rotation.y = s * Math.PI / 2; g.add(w); }
  for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.25, 14).rotateZ(Math.PI / 2), flat(0x1a1a1c)); m.position.set(s * 1.1, 0.34, -0.2); g.add(m); }
  g.add(shade(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.4).translate(0, 0.55, 3.2), flat(0x55595f, { metal: 0.6 }))));
  scene.add(g); colliders.push(box(x, z, 1.18, 2.65, -yaw));
}

/* Tente (toile à pans) 3 x 2,4 m. */
export function tent(scene, colliders, { x, z, yaw = 0, color = 0xd9812b }) {
  const m = shade(new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.5, 4, 1).rotateY(Math.PI / 4).scale(0.95, 1, 1.25).translate(0, 0.75, 0), new THREE.MeshStandardMaterial({ color, roughness: 0.85, side: THREE.DoubleSide, flatShading: true })));
  m.position.set(x, 0, z); m.rotation.y = yaw; scene.add(m); colliders.push(box(x, z, 1.15, 1.45, -yaw));
}

/* Tas de bois : grumes couchées le long de z, `rows` étages ; `len` m de long. */
export function logStack(scene, colliders, { x, z, yaw = 0, len = 4, cols = 6, rows = 4, r = 0.33 }) {
  const items = [], bark = mat(T.bark(), { rough: 1, bump: 3, color: 0xb0a090 }), geo = new THREE.CylinderGeometry(r, r * 1.05, len, 12).rotateX(Math.PI / 2);
  scaleUV(geo, 3, len / 3);
  const W = cols * r * 2;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols - (j % 2); i++) items.push({ x: (i - (cols - 1) / 2 + (j % 2) * 0.5) * r * 2, y: r + j * r * 1.75, z: 0, rot: 0 });
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw; scene.add(g);
  scatter(g, [geo], bark, items.map((it) => ({ ...it, tint: 0xffffff })), { seed: 74 });
  colliders.push(box(x, z, W / 2, len / 2, -yaw));
}

/* Tracteur : roues, capot, cabine. */
export function tractor(scene, colliders, { x, z, yaw = 0, color = 0x2f7a3a }) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw;
  const body = flat(color, { rough: 0.45 }), tire = flat(0x18181a, { rough: 0.95 }), glass = flat(0x1d2830, { rough: 0.15 });
  const wheel = (r, wd, px, py, pz) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, wd, 18).rotateZ(Math.PI / 2), tire); m.position.set(px, py, pz); g.add(shade(m)); const hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.5, r * 0.5, wd + 0.02, 12).rotateZ(Math.PI / 2), flat(0xd9c04a)); hub.position.set(px, py, pz); g.add(hub); };
  wheel(0.78, 0.55, 0.95, 0.78, -0.8); wheel(0.78, 0.55, -0.95, 0.78, -0.8); wheel(0.46, 0.3, 0.8, 0.46, 1.25); wheel(0.46, 0.3, -0.8, 0.46, 1.25);
  g.add(shade(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.9, 1.9).translate(0, 1.05, 0.95), body)));
  g.add(shade(new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.2, 1.8).translate(0, 0.95, -0.6), body)));
  g.add(shade(new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.25, 1.35).translate(0, 1.85, -0.75), glass)));
  g.add(shade(new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 1.5).translate(0, 2.5, -0.75), body)));
  g.add(shade(new THREE.Mesh(pole(0.05, 0.9).translate(0.3, 1.5, 1.3), flat(0x333333))));
  scene.add(g); colliders.push(box(x, z, 1.25, 2.1, -yaw));
}

/* Rangée de congères : le long d'une ligne brisée, `w` m de large. */
export function bankRun(scene, colliders, pts, { w = 1.6, h = 0.85 } = {}) {
  const items = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], len = Math.hypot(x1 - x0, z1 - z0), yaw = Math.atan2(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / (w * 0.7)));
    for (let k = 0; k <= n; k++) items.push({ x: x0 + (x1 - x0) * k / n + Math.sin(k * 7) * 0.12, z: z0 + (z1 - z0) * k / n, y: -0.1, s: w * 0.55, sy: h * 0.62, tint: 0xf3f7ff });
    colliders.push(box((x0 + x1) / 2, (z0 + z1) / 2, w * 0.4, len / 2, -yaw));
  }
  scatter(scene, rockGeos(2), mat(T.snow(), { rough: 0.9, color: 0xf2f6ff }), items, { seed: 75, shadow: false });
}

/* Panneau sur poteau avec texte. */
export function signBoard(scene, colliders, { x, z, yaw = 0, text = 'P', bg = '#1b4fa0', fg = '#ffffff', w = 0.6, h = 0.6, y = 2.1, font = 96 }) {
  const c = document.createElement('canvas'); c.width = 128 * Math.round(w / h || 1); c.height = 128; const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); g.fillStyle = fg; g.font = `700 ${font}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, c.width / 2, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const grp = new THREE.Group(); grp.position.set(x, 0, z); grp.rotation.y = yaw;
  grp.add(shade(new THREE.Mesh(pole(0.04, y + h / 2), flat(0x888d93, { metal: 0.6 }))));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: 0.5 })); face.position.set(0, y, 0.05); grp.add(face);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), flat(0x777c82)); back.position.set(0, y, 0.04); back.rotation.y = Math.PI; grp.add(back);
  scene.add(grp); colliders.push(circle(x, z, 0.1));
}

/* Ligne brisée décalée de `d` m (d > 0 : à gauche du sens de parcours, d < 0 : à droite) : pour border un chemin de murs. */
export function offsetPath(pts, d) {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], tx = b[0] - a[0], tz = b[1] - a[1], l = Math.hypot(tx, tz) || 1;
    return [p[0] + (tz / l) * d, p[1] - (tx / l) * d];
  });
}

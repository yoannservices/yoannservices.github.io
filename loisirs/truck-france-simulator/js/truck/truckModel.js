import * as THREE from 'three';
import { WHEELBASE } from './truckData.js';

/* Camion articulé : tracteur cab-over (cabine extrudée depuis un profil latéral, vitrage, calandre, rétros, réservoirs,
   châssis, essieux, garde-boue) et 5 remorques détaillées. Repère : avant = +Z, roues posées sur y = 0. */
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.2, ...o });
const phys = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.35, metalness: 0.45, clearcoat: 1, clearcoatRoughness: 0.12, ...o });
const TIRE = mat(0x131316, { roughness: 0.92, metalness: 0 });
const RIM = mat(0xb9c0cc, { roughness: 0.3, metalness: 0.9 });
const HUB = mat(0x5a5f68, { roughness: 0.4, metalness: 0.9 });
const GLASS = new THREE.MeshPhysicalMaterial({ color: 0x0a1622, roughness: 0.05, metalness: 0.5, clearcoat: 1, transparent: true, opacity: 0.3, depthWrite: false });
const DARK = mat(0x1b1c22, { roughness: 0.7 });
const BLACK = mat(0x0c0c0f, { roughness: 0.8 });
const CHROME = mat(0xd5dae0, { roughness: 0.15, metalness: 1 });
const STEEL = mat(0x8e949e, { roughness: 0.45, metalness: 0.85 });
const LIGHT = mat(0xfff3c4, { emissive: 0xfff3c4, emissiveIntensity: 0.6 });
const AMBER = mat(0xffa21a, { emissive: 0xff8a00, emissiveIntensity: 0.9 });
const RED = mat(0xff2222, { emissive: 0xff1111, emissiveIntensity: 0.8 });

const mesh = (g, m, parent, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
const box = (parent, w, h, d, m, x, y, z) => mesh(new THREE.BoxGeometry(w, h, d), m, parent, x, y, z);
const cyl = (parent, r, len, m, x, y, z, axis = 'z', seg = 16) => {
  const g = new THREE.CylinderGeometry(r, r, len, seg);
  if (axis === 'z') g.rotateX(Math.PI / 2); else if (axis === 'x') g.rotateZ(Math.PI / 2);
  return mesh(g, m, parent, x, y, z);
};

// profil latéral (z, y) extrudé sur la largeur : le x de la forme devient z du monde
function ext(pts, width, bev, m, parent, y0 = 0) {
  // le biseau agrandit la forme de bev : on la rétrécit d'autant pour garder l'encombrement exact
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0b = Math.min(...ys), y1 = Math.max(...ys);
  pts = pts.map(([x, y]) => [x0 + bev + (x - x0) * (x1 - x0 - 2 * bev) / (x1 - x0), y0b + bev + (y - y0b) * (y1 - y0b - 2 * bev) / (y1 - y0b)]);
  const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  const d = width - 2 * bev;
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 4, curveSegments: 8 });
  g.translate(0, 0, -d / 2); g.rotateY(-Math.PI / 2); g.computeVertexNormals();
  return mesh(g, m, parent, 0, y0, 0);
}

function canvasTex(w, h, draw, rx = 1, ry = 1) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 4;
  return t;
}
// panneaux ondulés (conteneur) : bandes verticales claires/sombres
const corrugated = (hex, rx) => canvasTex(128, 16, (g, w, h) => {
  g.fillStyle = hex; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 16) { const gr = g.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, 'rgba(255,255,255,.22)'); gr.addColorStop(.5, 'rgba(0,0,0,.28)'); gr.addColorStop(1, 'rgba(255,255,255,.22)'); g.fillStyle = gr; g.fillRect(x, 0, 16, h); }
}, rx, 1);
const planks = () => canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = '#a07a4a'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 16) { g.fillStyle = `hsl(32,38%,${38 + (y / 16 % 3) * 5}%)`; g.fillRect(0, y + 1, w, 14); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, y, w, 1); }
}, 1, 5);
const tape = () => canvasTex(64, 16, (g, w, h) => { for (let x = 0; x < w; x += 16) { g.fillStyle = x % 32 ? '#f4f4f4' : '#d4151b'; g.fillRect(x, 0, 16, h); } }, 60, 1);

// ---------- roues : pneu tourné, jante acier, écrous, moyeu ----------
const TIRE_G = new THREE.LatheGeometry([[0.3, -0.15], [0.46, -0.15], [0.5, -0.11], [0.51, -0.05], [0.51, 0.05], [0.5, 0.11], [0.46, 0.15], [0.3, 0.15]].map(([r, w]) => new THREE.Vector2(r, w)), 28).rotateZ(Math.PI / 2);
const RIM_G = new THREE.CylinderGeometry(0.3, 0.3, 0.27, 24).rotateZ(Math.PI / 2);
const FACE_G = new THREE.CylinderGeometry(0.27, 0.29, 0.03, 24).rotateZ(Math.PI / 2);
const HUBC_G = new THREE.CylinderGeometry(0.09, 0.1, 0.07, 16).rotateZ(Math.PI / 2);
const LUG_G = new THREE.CylinderGeometry(0.018, 0.018, 0.035, 6).rotateZ(Math.PI / 2);

function wheel(parent, x, z, spinners, steerers, steered = false) {
  const pivot = new THREE.Group(); pivot.position.set(x, 0.5, z);
  const spin = new THREE.Group(), out = x > 0 ? 1 : -1;
  mesh(TIRE_G, TIRE, spin); mesh(RIM_G, RIM, spin);
  mesh(FACE_G, RIM, spin, out * 0.14, 0, 0); mesh(HUBC_G, HUB, spin, out * 0.17, 0, 0);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; mesh(LUG_G, CHROME, spin, out * 0.165, Math.sin(a) * 0.17, Math.cos(a) * 0.17); }
  pivot.add(spin); parent.add(pivot); spinners.push(spin);
  if (steered) steerers.push(pivot);
}
// garde-boue en demi-cylindre au-dessus d'un groupe de roues + bavette
function fender(parent, x, z, len, w = 0.42) {
  const g = new THREE.CylinderGeometry(0.62, 0.62, w, 20, 1, true, -Math.PI / 2, Math.PI).rotateZ(Math.PI / 2);
  const f = mesh(g, DARK, parent, x, 0.5, z); f.material = DARK.clone(); f.material.side = THREE.DoubleSide;
  if (len > 0) box(parent, w, 0.04, len, DARK, x, 1.12, z - len / 2 + 0.3);
}
const flap = (parent, x, z) => box(parent, 0.5, 0.5, 0.025, BLACK, x, 0.35, z);

function buildTractor(cab, spinners, steerers, lights) {
  const g = new THREE.Group();
  const L = WHEELBASE, H = cab.cabH, zf = L + 1.06, cl = cab.sleeper ? 3.6 : 2.3, zr = zf - cl;
  const paint = phys(cab.color), shade = mat(0x17181d, { roughness: 0.5, metalness: 0.4 });

  // châssis : deux longerons, traverses, arbre de transmission, ponts, réservoirs d'air
  for (const s of [-1, 1]) box(g, 0.12, 0.26, L + 3.1, DARK, s * 0.55, 0.82, 1.55);
  for (const z of [-1.5, -0.4, 0.8, 2.2, 3.6, 4.7]) box(g, 1.2, 0.1, 0.12, DARK, 0, 0.78, z);
  cyl(g, 0.05, 3.4, STEEL, 0, 0.66, 1.1, 'z', 10);
  for (const z of [0, -1.3]) { const d = mesh(new THREE.SphereGeometry(0.3, 16, 12), STEEL, g, 0, 0.5, z); d.scale.set(1.4, 0.9, 0.9); cyl(g, 0.07, 1.9, STEEL, 0, 0.5, z, 'x', 10); }
  for (const s of [-1, 1]) cyl(g, 0.15, 0.7, STEEL, s * 0.35, 0.58, 2.5, 'x', 12);
  box(g, 2.0, 0.2, 0.14, DARK, 0, 0.56, 4.0); // essieu avant

  // cabine : coque extrudée (pare-brise incliné, toit, panneau arrière)
  const rear = cab.sleeper ? H : H * 0.9;
  ext([[zr, 0], [zf, 0], [zf + 0.03, H * 0.5], [zf - 0.12, H * 0.9], [zf - 0.45, H], [zr + 0.15, H], [zr, rear]], 2.5, 0.09, paint, g, 1.0);
  box(g, 2.52, 0.12, cl, shade, 0, 1.08, (zf + zr) / 2); // bas de caisse sombre
  // vitrage : pare-brise, vitres latérales, lunette
  box(g, 2.28, H * 0.4, 0.03, GLASS, 0, 1.0 + H * 0.72, zf - 0.05).rotation.x = -0.18;
  for (const s of [-1, 1]) {
    box(g, 0.03, H * 0.33, 1.15, GLASS, s * 1.26, 1.0 + H * 0.7, zf - 0.85);
    box(g, 0.03, 0.025, 0.05, DARK, s * 1.27, 1.0 + H * 0.52, zf - 1.35);
    box(g, 0.03, H * 0.6, 0.02, DARK, s * 1.265, 1.0 + H * 0.5, zf - 1.5);                 // joint de porte
    box(g, 0.05, 0.05, 0.22, CHROME, s * 1.28, 1.0 + H * 0.42, zf - 1.28);                  // poignée
    box(g, 0.32, 0.07, 0.34, shade, s * 1.33, 0.62, zf - 0.78);                            // marchepied
    box(g, 0.04, 0.5, 0.04, CHROME, s * 1.24, 1.0 + H * 0.2, zf + 0.02);                    // détail de calandre latéral
    if (cab.sleeper) box(g, 0.03, H * 0.22, 0.9, GLASS, s * 1.26, 1.0 + H * 0.72, zf - 2.6); // vitre de couchette
  }
  box(g, 2.3, 0.06, 0.35, shade, 0, 1.0 + H * 0.93, zf - 0.28);                             // pare-soleil
  for (const s of [-1, 1]) { // essuie-glaces
    const w = box(g, 0.02, 0.02, 0.62, BLACK, s * 0.55, 1.0 + H * 0.5, zf - 0.02); w.rotation.x = -0.18; w.rotation.z = s * 0.5;
  }
  // calandre, phares, pare-chocs, antibrouillards, logo
  box(g, 1.7, 0.7, 0.06, BLACK, 0, 1.0 + H * 0.2, zf + 0.04);
  for (let i = 0; i < 5; i++) box(g, 1.62, 0.025, 0.04, CHROME, 0, 1.0 + H * 0.2 - 0.26 + i * 0.13, zf + 0.075);
  mesh(new THREE.CircleGeometry(0.1, 20), CHROME, g, 0, 1.0 + H * 0.2 + 0.05, zf + 0.085);
  for (const s of [-1, 1]) {
    box(g, 0.5, 0.26, 0.06, BLACK, s * 0.98, 1.0 + H * 0.2, zf + 0.05);
    box(g, 0.4, 0.14, 0.05, LIGHT, s * 0.98, 1.0 + H * 0.2 + 0.04, zf + 0.09);
    box(g, 0.14, 0.1, 0.05, AMBER, s * 0.7, 1.0 + H * 0.2 - 0.05, zf + 0.09);
    box(g, 0.2, 0.12, 0.05, LIGHT, s * 0.95, 0.52, zf + 0.34);
  }
  box(g, 2.5, 0.42, 0.3, shade, 0, 0.6, zf + 0.22);                                        // pare-chocs
  box(g, 1.0, 0.1, 0.2, DARK, 0, 0.36, zf + 0.3);                                          // spoiler bas
  // rétroviseurs : bras + coque + miroir grand angle
  for (const s of [-1, 1]) {
    cyl(g, 0.018, 0.55, BLACK, s * 1.5, 1.0 + H * 0.72, zf - 0.45, 'x', 8);
    box(g, 0.1, 0.55, 0.26, BLACK, s * 1.74, 1.0 + H * 0.66, zf - 0.45);
    box(g, 0.02, 0.5, 0.22, GLASS, s * 1.69, 1.0 + H * 0.66, zf - 0.45);
    box(g, 0.1, 0.2, 0.18, BLACK, s * 1.36, 1.0 + H * 0.42, zf + 0.0);
  }
  // habitacle : plancher, tableau de bord, volant, sièges
  const cx = 1.0 + H * 0.45, inter = mat(0x2a2b31, { roughness: 0.85 }), seatM = mat(0x3a3b42, { roughness: 0.9 });
  box(g, 2.3, 0.06, cl - 0.2, inter, 0, 1.12, (zf + zr) / 2);
  box(g, 2.3, 0.45, 0.5, inter, 0, cx, zf - 0.38).rotation.x = -0.25;
  box(g, 0.5, 0.14, 0.04, mat(0x04070c, { emissive: 0x3f8cff, emissiveIntensity: 0.9 }), 0.55, cx + 0.2, zf - 0.66).rotation.x = -0.4;
  const wheelG = new THREE.Group(); wheelG.position.set(0.55, cx + 0.12, zf - 0.78); wheelG.rotation.x = -0.9; g.add(wheelG);
  mesh(new THREE.TorusGeometry(0.2, 0.025, 8, 24), BLACK, wheelG); cyl(wheelG, 0.05, 0.05, DARK, 0, 0, 0, 'z', 12);
  for (const s of [-0.55, 0.55]) {
    box(g, 0.5, 0.18, 0.55, seatM, s, 1.5, zf - 1.7);
    box(g, 0.5, 0.75, 0.14, seatM, s, 1.95, zf - 2.0).rotation.x = 0.15;
  }
  // toit : déflecteur ou carénage, rampe de feux, aération
  if (cab.cabH > 2.5) ext([[zf - 0.55, 0], [zr + 0.12, 0], [zr + 0.12, H * 0.28], [zf - 1.0, H * 0.2]], 2.3, 0.07, paint, g, 1.0 + H);
  else box(g, 1.0, 0.1, 0.6, shade, 0, 1.0 + H + 0.05, zf - 1.1);
  for (const s of [-0.8, -0.4, 0, 0.4, 0.8]) box(g, 0.14, 0.09, 0.08, AMBER, s, 1.0 + H + 0.05, zf - 0.12);
  if (cab.sleeper) for (const s of [-1, 1]) box(g, 0.07, H * 0.5, 0.05, CHROME, s * 1.3, 1.0 + H * 0.45, zr + 0.05);
  // carénages latéraux, échappements verticaux, réservoirs
  for (const s of [-1, 1]) {
    box(g, 0.06, 0.4, cab.sleeper ? 3.0 : 1.7, paint, s * 1.27, 0.86, zf - (cab.sleeper ? 1.7 : 1.1));
    cyl(g, 0.07, H * 0.9, CHROME, s * 1.2, 1.0 + H * 0.45, zr - 0.15, 'y', 12);
    cyl(g, 0.34, 1.4, STEEL, s * 1.18, 0.68, 1.55, 'z', 20);
    for (const z of [1.1, 2.0]) box(g, 0.74, 0.04, 0.06, DARK, s * 1.18, 0.68, z);
    mesh(new THREE.SphereGeometry(0.34, 14, 10), STEEL, g, s * 1.18, 0.68, 0.85);
  }
  // sellette et plaque d'attelage
  cyl(g, 0.55, 0.12, DARK, 0, 1.08, -0.3, 'y', 24);
  box(g, 0.5, 0.06, 0.8, STEEL, 0, 1.15, -0.3);
  cyl(g, 0.05, 0.4, CHROME, 0, 0.95, 1.9, 'y', 8);
  // roues, garde-boue et bavettes
  for (const s of [-1, 1]) {
    wheel(g, s * 1.05, L, spinners, steerers, true);
    for (const z of [0, -1.3]) { wheel(g, s * 0.95, z, spinners, steerers); wheel(g, s * 1.3, z, spinners, steerers); }
    fender(g, s * 1.12, -0.65, 0, 0.9); flap(g, s * 1.12, -1.95);
    fender(g, s * 1.05, L, 0, 0.5);
  }
  // phares réels
  const spot = new THREE.SpotLight(0xfff0cc, 0, 90, 0.5, 0.5, 1.2);
  spot.position.set(0, 1.4, L + 1); spot.target.position.set(0, 0.5, L + 40);
  g.add(spot, spot.target); lights.push(spot);
  return g;
}

function buildTrailer(tr, spinners) {
  const g = new THREE.Group(), len = tr.length, y0 = 1.2, mid = -len / 2, az = -tr.axleDist;
  // châssis : longerons, traverses, plateau de selle
  for (const s of [-1, 1]) box(g, 0.14, 0.32, len, STEEL, s * 0.9, 1.04, mid);
  for (let z = -0.5; z > -len; z -= 1.1) box(g, 1.9, 0.08, 0.1, DARK, 0, 1.0, z);
  box(g, 2.2, 0.08, 1.6, DARK, 0, 1.22, -0.8);
  cyl(g, 0.05, 0.3, CHROME, 0, 1.0, -0.3, 'y', 8);
  // béquilles
  for (const s of [-1, 1]) { box(g, 0.1, 0.8, 0.1, STEEL, s * 0.85, 0.7, -3.0); box(g, 0.3, 0.05, 0.3, DARK, s * 0.85, 0.28, -3.0); }
  box(g, 1.8, 0.06, 0.06, STEEL, 0, 0.9, -3.0);
  // bas de caisse latéral, bande rétro-réfléchissante, feux de gabarit
  const sideRail = (y) => { for (const s of [-1, 1]) box(g, 0.04, 0.12, len - 5.5, STEEL, s * 1.18, y, mid + 1.0); };
  sideRail(0.62); sideRail(0.8);
  const tp = mat(0xffffff, { map: tape() });
  for (const s of [-1, 1]) { box(g, 0.02, 0.1, len - 0.6, tp, s * 1.255, y0 + 0.12, mid); for (const z of [-1.5, mid, -len + 1.5]) box(g, 0.03, 0.05, 0.1, AMBER, s * 1.26, y0 + 0.3, z); }
  switch (tr.id) {
    case 'tarp': { // semi rideaux : bâche tendue, sangles, ridelles, cadre
      const bache = new THREE.MeshStandardMaterial({ color: 0x3d5a47, roughness: 0.95 });
      box(g, 2.5, 2.9, len - 0.5, bache, 0, y0 + 1.55, mid);
      for (let z = -0.6; z > -len + 0.4; z -= 0.85) for (const s of [-1, 1]) box(g, 0.03, 2.8, 0.1, mat(0x24362b, { roughness: 0.9 }), s * 1.26, y0 + 1.55, z);
      for (let z = -0.6; z > -len + 0.4; z -= 1.7) box(g, 2.52, 0.08, 0.1, STEEL, 0, y0 + 3.0, z);
      box(g, 2.5, 0.25, len - 0.45, STEEL, 0, y0 + 0.12, mid); box(g, 2.52, 0.06, len - 0.4, STEEL, 0, y0 + 2.97, mid);
      box(g, 2.52, 2.9, 0.06, STEEL, 0, y0 + 1.55, -0.3);
      break;
    }
    case 'reefer': { // caisse frigorifique : panneaux, groupe froid, portes à barres
      const white = phys(0xf1f5f9, { roughness: 0.45, metalness: 0.1 });
      box(g, 2.5, 2.9, len - 0.5, white, 0, y0 + 1.55, mid);
      for (let z = -1.0; z > -len + 0.5; z -= 1.6) for (const s of [-1, 1]) box(g, 0.025, 2.7, 0.03, mat(0xc4ccd6), s * 1.255, y0 + 1.55, z);
      box(g, 1.9, 1.0, 0.55, mat(0x94a3b8, { metalness: 0.5 }), 0, y0 + 2.45, -0.55);       // groupe frigorifique
      for (let i = 0; i < 6; i++) box(g, 1.5, 0.03, 0.04, BLACK, 0, y0 + 2.1 + i * 0.1, -0.26);
      cyl(g, 0.22, 0.06, DARK, 0.55, y0 + 2.75, -0.28, 'z', 20);
      for (const s of [-1, 1]) box(g, 0.08, 2.6, 0.05, CHROME, s * 0.7, y0 + 1.55, -len + 0.22); // barres de verrouillage
      box(g, 0.04, 2.7, 0.04, DARK, 0, y0 + 1.55, -len + 0.25);
      break;
    }
    case 'tanker': { // citerne inox : ventre elliptique, brides, trou d'homme, passerelle
      const inox = new THREE.MeshPhysicalMaterial({ color: 0xcfd6e0, metalness: 0.95, roughness: 0.22, clearcoat: 0.4 });
      const tl = len - 1.2, t = mesh(new THREE.CylinderGeometry(1.2, 1.2, tl, 32).rotateX(Math.PI / 2), inox, g, 0, y0 + 1.3, mid);
      for (const dz of [-1, 1]) { const c = mesh(new THREE.SphereGeometry(1.2, 28, 16), inox, g, 0, y0 + 1.3, mid + dz * tl / 2); c.scale.z = 0.35; }
      for (let z = -1.5; z > -len + 1; z -= 2.1) mesh(new THREE.TorusGeometry(1.205, 0.03, 8, 32), STEEL, g, 0, y0 + 1.3, z);
      box(g, 0.6, 0.04, len - 3, DARK, 0, y0 + 2.55, mid);                                  // passerelle
      for (const z of [-2.5, mid, -len + 2.5]) { cyl(g, 0.3, 0.14, STEEL, 0, y0 + 2.62, z, 'y', 20); cyl(g, 0.22, 0.04, CHROME, 0, y0 + 2.72, z, 'y', 16); }
      box(g, 2.0, 0.9, 0.5, STEEL, 0, y0 + 0.6, -len + 0.7);                                 // coffre de vannes
      for (const s of [-1, 1]) { cyl(g, 0.06, 0.5, CHROME, s * 0.5, y0 + 0.3, -len + 0.25, 'z', 10); box(g, 0.05, 1.6, 0.05, STEEL, s * 0.45, y0 + 1.1, -len + 0.15); }
      break;
    }
    case 'flatbed': { // plateau : planches, ridelles, ranchers, palettes sanglées
      mesh(new THREE.BoxGeometry(2.5, 0.12, len - 0.2), mat(0xffffff, { map: planks() }), g, 0, y0 + 0.14, mid);
      for (const s of [-1, 1]) { box(g, 0.05, 0.4, len - 0.2, STEEL, s * 1.25, y0 + 0.36, mid); for (let z = -1; z > -len; z -= 1.9) box(g, 0.07, 1.3, 0.07, STEEL, s * 1.25, y0 + 0.8, z); }
      box(g, 2.5, 1.6, 0.08, STEEL, 0, y0 + 0.95, -0.4);
      for (const [z, w] of [[-3, 1.4], [-6.5, 1.8], [-10, 1.2]]) {
        box(g, 2.0, w, 1.7, mat(0xc19a6b, { roughness: 0.85 }), 0, y0 + 0.2 + w / 2, z);
        for (const dz of [-0.5, 0.5]) box(g, 2.06, w + 0.04, 0.05, mat(0x15151a, { roughness: 0.6 }), 0, y0 + 0.2 + w / 2, z + dz);
        box(g, 2.1, 0.1, 1.76, mat(0x8a6a3f), 0, y0 + 0.16, z);
      }
      break;
    }
    case 'container': { // conteneur ISO : tôle ondulée, coins moulés, portes à barres, verrous
      const cm = corrugated('#ea580c', len * 4), cs = corrugated('#ea580c', 12);
      const ends = mat(0xe0560a, { roughness: 0.6, metalness: 0.3 });
      const faces = [cm, cm, ends, ends, cs, cs].map((m) => m.isMaterial ? m : new THREE.MeshStandardMaterial({ color: 0xffffff, map: m, roughness: 0.55, metalness: 0.35 }));
      mesh(new THREE.BoxGeometry(2.5, 2.6, len - 0.4), faces, g, 0, y0 + 1.45, mid);
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) box(g, 0.2, 0.2, 0.2, DARK, sx * 1.2, y0 + 1.45 + sy * 1.2, mid + sz * (len / 2 - 0.3));
      for (const s of [-1, 1]) { box(g, 0.06, 2.4, 0.04, CHROME, s * 0.55, y0 + 1.45, -len + 0.18); box(g, 0.03, 2.5, 0.03, DARK, s * 0.05, y0 + 1.45, -len + 0.2); }
      const logo = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.5), new THREE.MeshBasicMaterial({ map: canvasTex(256, 64, (c, w, h) => { c.fillStyle = 'rgba(0,0,0,0)'; c.clearRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = 'bold 40px Arial'; c.textAlign = 'center'; c.fillText('FRANCE CARGO', w / 2, 46); }), transparent: true }));
      for (const s of [-1, 1]) { const l = logo.clone(); l.position.set(s * 1.256, y0 + 1.7, mid); l.rotation.y = s * Math.PI / 2; g.add(l); }
      break;
    }
  }
  // essieux, garde-boue, bavettes, pare-chocs anti-encastrement, feux, plaque
  for (const s of [-1, 1]) {
    for (const dz of [0, -1.3, -2.6]) { wheel(g, s * 0.95, az + dz, spinners, []); wheel(g, s * 1.3, az + dz, spinners, []); }
    fender(g, s * 1.12, az - 1.3, 0, 0.9); fender(g, s * 1.12, az - 2.6, 0, 0.9);
    flap(g, s * 1.12, az - 3.35);
    box(g, 0.4, 0.28, 0.06, RED, s * 0.95, 1.15, -len - 0.02);
    box(g, 0.25, 0.14, 0.05, AMBER, s * 0.95, 1.4, -len - 0.02);
    box(g, 0.25, 0.14, 0.05, mat(0xffffff, { emissive: 0xaaaaaa, emissiveIntensity: 0.4 }), s * 0.95, 0.98, -len - 0.02);
  }
  for (const dz of [0, -1.3, -2.6]) { cyl(g, 0.08, 2.1, STEEL, 0, 0.5, az + dz, 'x', 10); box(g, 1.9, 0.14, 0.2, DARK, 0, 0.85, az + dz); }
  box(g, 2.4, 0.18, 0.12, DARK, 0, 0.62, -len - 0.04);                                       // pare-chocs arrière
  box(g, 0.5, 0.12, 0.02, mat(0xf4f4f4), 0, 0.95, -len - 0.04);                              // plaque
  if (tr.id === 'tanker') {
    import('../../../../assets/glb.js').then(async m => {
      const f = m.fitGLB(await m.loadGLB(new URL('../../../../assets/models/trailer.glb', import.meta.url).href), len);
      f.position.z = mid; g.visible = false; g.add(f);
    }).catch(e => console.warn('Remorque non chargée', tr.id, e));
  }
  if (tr.id === 'tarp') {
    import('../../../../assets/glb.js').then(async m => {
      const f = m.fitGLB(await m.loadGLB(new URL('../../../../assets/models/trailer (1).glb', import.meta.url).href), len);
      f.position.z = mid; g.visible = false; g.add(f);
    }).catch(e => console.warn('Remorque non chargée', tr.id, e));
  }
  return g;
}

/** Retourne { root, tractor, trailerG, update(phys), setLights(on), dispose() } */
export function buildTruck(cab, trailer) {
  const spinners = [], steerers = [], lights = [];
  const root = new THREE.Group();
  const tractor = buildTractor(cab, spinners, steerers, lights);
  tractor.rotation.order = 'YXZ';
  // vrai tracteur (Sketchfab « MAN TGX 2010 V8 » par DevPoly3D, CC-BY) à la place du tracteur procédural et de sa cabine (supprimés) ; la remorque reste procédurale faute de modèle réel
  import('../../../../assets/glb.js').then(async (m) => {
    const f = m.fitGLB(await m.loadGLB(new URL('../../../../assets/models/man-tgx.glb', import.meta.url).href), 6.8);
    f.position.z = 1.58; m.purge(tractor); tractor.add(f);
  }).catch((e) => console.warn('Tracteur non chargé', e));
  const trailerG = buildTrailer(trailer, spinners);
  root.add(tractor, trailerG);
  return {
    root, tractor, trailerG,
    update(p) {
      const hp = p.hitch;
      root.position.set(0, 0, 0);
      tractor.position.set(p.x, 0, p.z);
      tractor.rotation.set(-p.accel * 0.003, p.h, p.lat * 0.004);
      trailerG.position.set(hp.x, 0, hp.z);
      trailerG.rotation.y = p.th;
      for (const s of spinners) s.rotation.x = p.wheelAngle;
      for (const s of steerers) s.rotation.y = p.steer * 0.8;
    },
    setLights(on) { for (const l of lights) l.intensity = on ? 600 : 0; },
  };
}

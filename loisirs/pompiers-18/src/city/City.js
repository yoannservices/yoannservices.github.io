// Génération de la ville (reprise de bus-city-simulator) : sol, routes, marquages, maisons et immeubles instanciés, lampadaires, caserne, poteaux incendie.
import * as THREE from 'three';
import { G, P, ROAD, HALF, DIRS, rightOf, coord, inGrid, blockZone, nodes, nodeAt, CASERNE, HYDRANTS, MISSION_LOTS, IMMEUBLE_LOTS, HOSPITAL } from './grid.js';
import { Collision } from './Collision.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const canvas = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
const dummy = new THREE.Object3D();

const ARCH = {
  tower1: { w: 22, d: 22, h: 72, wall: '#7f8da0', glass: '#1d2c3d', roof: '#666', style: 'glass', mast: 1 },
  tower2: { w: 20, d: 20, h: 96, wall: '#5f7388', glass: '#14202e', roof: '#555', style: 'glass', mast: 1, crown: 1 },
  tower3: { w: 24, d: 24, h: 55, wall: '#9a9186', glass: '#1d2c3d', roof: '#666', style: 'stone', crown: 1 },
  office: { w: 32, d: 26, h: 44, wall: '#a8a496', glass: '#26384a', shop: 1, roof: '#777', style: 'stone' },
  block: { w: 34, d: 30, h: 30, wall: '#b9a48c', glass: '#2b3b4c', shop: 1, roof: '#7a6f66', style: 'brick', balcony: 1, tank: 1 },
  mid: { w: 28, d: 24, h: 21, wall: '#c4b7a2', glass: '#2b3b4c', shop: 1, roof: '#7a6f66', style: 'brick', balcony: 1 },
  house: { w: 12, d: 10, h: 7, wh: 5, fh: 2.5, win: [1.2, 1.3], wall: '#d8c6a9', glass: '#33475b', roof: '#8a4b3a', style: 'stucco', shutters: 1, gable: 'x' },
  house2: { w: 10, d: 12, h: 8, wh: 5.5, fh: 2.75, win: [1.2, 1.4], wall: '#c98f7a', glass: '#33475b', roof: '#5b6670', style: 'stucco', shutters: 1, gable: 'z' },
  shop: { w: 34, d: 28, h: 8, wall: '#d9d4c7', glass: '#3a5266', shop: 1, roof: '#777', style: 'stone' },
  mall: { w: 62, d: 46, h: 12, wall: '#c9ced6', glass: '#26384a', shop: 1, roof: '#888', style: 'stone' },
};
const AWN = ['#b3262e', '#2b5d8a', '#2f7a4a', '#c98a1a', '#6a3a7a'];
const SHUT = ['#3f6b4a', '#6b8fa8', '#8a4b3a', '#d8c690'];

// façade : albédo + masque émissif (fenêtres allumées la nuit). Matière du mur, cadres, appuis, bandeaux d'étage, corniche, socle,
// devanture à auvent (commerces) ou porte d'entrée, volets (maisons), garde-corps (immeubles), mur-rideau (tours).
function facade(wm, hm, a, rand, tune = {}) {
  const ppm = 10, cw = Math.ceil(wm * ppm), ch = Math.ceil(hm * ppm);
  const c1 = canvas(cw, ch), c2 = canvas(cw, ch), g = c1.getContext('2d'), e = c2.getContext('2d');
  const trim = a.trim ?? '#e7e3da', st = a.style ?? 'stone';
  g.fillStyle = a.wall; g.fillRect(0, 0, cw, ch);
  e.fillStyle = '#000'; e.fillRect(0, 0, cw, ch);
  if (st === 'brick') {
    g.fillStyle = 'rgba(0,0,0,0.11)';
    for (let y = 0, r = 0; y < ch; y += 4, r++) { g.fillRect(0, y, cw, 1); for (let x = (r % 2) * 6; x < cw; x += 12) g.fillRect(x, y, 1, 4); }
  } else if (st === 'stone') {
    g.fillStyle = 'rgba(0,0,0,0.07)';
    for (let y = 0; y < ch; y += 20) g.fillRect(0, y, cw, 1);
    for (let y = 0, r = 0; y < ch; y += 20, r++) for (let x = (r % 2) * 25; x < cw; x += 50) g.fillRect(x, y, 1, 20);
  }
  for (let i = 0; i < (cw * ch) / 50; i++) { g.fillStyle = rand() < 0.5 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'; g.fillRect(rand() * cw, rand() * ch, 3, 2); }
  const fh = a.fh ?? 3.5, [winW, winH] = a.win ?? [1.7, 1.9], floors = Math.max(1, Math.floor(hm / fh)), cols = Math.max(1, Math.floor(wm / (st === 'stucco' ? 3 : 3.2)));
  const lit = () => (rand() < 0.4 ? (rand() < 0.8 ? '#ffd98a' : '#bcd8ff') : null);
  const win = (x, y, w, h, on, shutters) => {
    if (shutters) { const sw = w * 0.42; g.fillStyle = shutters; g.fillRect(x - sw - 4, y - 3, sw, h + 6); g.fillRect(x + w + 4, y - 3, sw, h + 6); g.fillStyle = 'rgba(0,0,0,0.22)'; for (let k = 0; k < h; k += 4) { g.fillRect(x - sw - 4, y + k, sw, 1); g.fillRect(x + w + 4, y + k, sw, 1); } }
    g.fillStyle = trim; g.fillRect(x - 3, y - 3, w + 6, h + 6);
    const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#5b7a96'); gr.addColorStop(0.45, a.glass); gr.addColorStop(1, a.glass);
    g.fillStyle = gr; g.fillRect(x, y, w, h);
    g.fillStyle = 'rgba(255,255,255,0.10)'; g.beginPath(); g.moveTo(x, y + h); g.lineTo(x + w * 0.55, y); g.lineTo(x + w * 0.85, y); g.lineTo(x + w * 0.3, y + h); g.fill();
    g.fillStyle = trim; g.fillRect(x + w / 2 - 1, y, 2, h); g.fillRect(x, y + h * 0.4, w, 2);
    g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(x - 5, y + h + 3, w + 10, 3);
    if (on) { e.fillStyle = on; e.fillRect(x, y, w, h); e.fillStyle = '#000'; e.fillRect(x + w / 2 - 1, y, 2, h); e.fillRect(x, y + h * 0.4, w, 2); }
  };
  for (let f = 0; f < floors; f++) {
    const top = ch - (f + 1) * fh * ppm, y = top + ((fh - winH) / 2) * ppm;
    if (f > 0 || st !== 'glass') { g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(0, top, cw, 2); g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(0, top + 2, cw, 3); }
    if (st === 'glass') {   // mur-rideau : allège pleine + bandeau vitré à meneaux, vitres allumées au hasard
      const gy = top + fh * ppm * 0.18, gh = fh * ppm * 0.66, cell = 16;
      for (let x = 0; x < cw; x += cell) {
        const gr = g.createLinearGradient(0, gy, 0, gy + gh); gr.addColorStop(0, '#6a8aa6'); gr.addColorStop(0.5, a.glass); gr.addColorStop(1, '#0c1620');
        g.fillStyle = gr; g.fillRect(x + 1, gy, cell - 2, gh);
        const l = lit(); if (l) { e.fillStyle = l; e.fillRect(x + 1, gy, cell - 2, gh); }
      }
      g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, gy - 2, cw, 2);
      continue;
    }
    if (f === 0 && a.shop) {   // devanture vitrée à meneaux et auvent rayé
      const sy = ch - 2.6 * ppm - 0.3 * ppm, sh = 2.6 * ppm, awn = AWN[Math.floor(rand() * AWN.length)];
      g.fillStyle = '#26282b'; g.fillRect(cw * 0.04 - 3, sy - 3, cw * 0.92 + 6, sh + 6);
      const gr = g.createLinearGradient(0, sy, 0, sy + sh); gr.addColorStop(0, '#6a8aa6'); gr.addColorStop(1, a.glass); g.fillStyle = gr; g.fillRect(cw * 0.04, sy, cw * 0.92, sh);
      e.fillStyle = '#ffe2a0'; e.fillRect(cw * 0.04, sy, cw * 0.92, sh);
      g.fillStyle = '#26282b'; e.fillStyle = '#000';
      for (let x = cw * 0.04 + 25; x < cw * 0.96; x += 25) { g.fillRect(x, sy, 2, sh); e.fillRect(x, sy, 2, sh); }
      for (let x = cw * 0.04; x < cw * 0.96; x += 10) { g.fillStyle = Math.floor((x - cw * 0.04) / 10) % 2 ? awn : '#f1ede4'; g.fillRect(x, sy - 8, 10, 7); }
      continue;
    }
    for (let k = 0; k < cols; k++) {
      const x = (k + 0.5) * (cw / cols) - (winW * ppm) / 2;
      if (f === 0 && !tune.noDoor && cols % 2 === 1 && k === (cols - 1) / 2) {   // porte d'entrée
        const dw = 11, dx = cw / 2 - dw / 2, dy = ch - 22;
        g.fillStyle = trim; g.fillRect(dx - 4, dy - 4, dw + 8, 26); g.fillStyle = '#4a3426'; g.fillRect(dx, dy, dw, 22);
        g.fillStyle = 'rgba(255,255,255,0.14)'; g.fillRect(dx + 1, dy + 2, dw - 2, 7); g.fillStyle = '#d9b04a'; g.fillRect(dx + dw - 3, dy + 11, 2, 2);
        g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(dx - 6, dy - 7, dw + 12, 3);
        continue;
      }
      win(x, y, winW * ppm, winH * ppm, lit(), a.shutters ? SHUT[Math.floor(rand() * SHUT.length)] : null);
      if (a.balcony && f > 0) { g.fillStyle = '#2d2f33'; g.fillRect(x - 8, y + winH * ppm + 6, winW * ppm + 16, 3); g.fillStyle = 'rgba(30,30,34,0.85)'; for (let b = 0; b < winW * ppm + 16; b += 4) g.fillRect(x - 8 + b, y + winH * ppm - 6, 1, 12); g.fillRect(x - 8, y + winH * ppm - 6, winW * ppm + 16, 1); }
    }
  }
  g.fillStyle = trim; g.fillRect(0, 0, cw, 6); g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(0, 6, cw, 3);   // corniche
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, ch - 5, cw, 5);                                          // socle
  const mk = (c) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  return { map: mk(c1), emissive: mk(c2) };
}

// tuiles : rangées sombres décalées (toits des maisons)
function roofTexture(color) {
  const c = canvas(64, 64), g = c.getContext('2d');
  g.fillStyle = color; g.fillRect(0, 0, 64, 64);
  for (let y = 0, r = 0; y < 64; y += 8, r++) { g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(0, y, 64, 2); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(0, y + 2, 64, 1); g.fillStyle = 'rgba(0,0,0,0.18)'; for (let x = (r % 2) * 8; x < 64; x += 16) g.fillRect(x, y, 1, 8); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

// pièces d'un archétype (repère local : centre de l'emprise, y = 0 au milieu de la hauteur totale) : coque, bandeaux/garde-corps/équipements, toit
function archParts(a, rand) {
  const wh = a.wh ?? a.h, base = -a.h / 2, top = base + wh;
  const bx = (w, h, d, x, y, z) => new THREE.BoxGeometry(w, h, d).translate(x, y, z).toNonIndexed();
  const trim = [], roof = [];
  const shell = new THREE.BoxGeometry(a.w, wh, a.d).translate(0, base + wh / 2, 0);
  if (a.gable) {   // toit à deux pans (faîtage dans le sens de la plus grande dimension) + cheminée
    const along = a.gable === 'x', wx = a.w + 0.9, wz = a.d + 0.9, rh = a.h - wh, hx = wx / 2, hz = wz / 2;
    const P = along ? [[-hx, 0, -hz], [hx, 0, -hz], [hx, 0, hz], [-hx, 0, hz], [-hx, rh, 0], [hx, rh, 0]] : [[-hx, 0, -hz], [hx, 0, -hz], [hx, 0, hz], [-hx, 0, hz], [0, rh, -hz], [0, rh, hz]];
    const tri = along ? [[0, 1, 5], [0, 5, 4], [3, 4, 5], [3, 5, 2], [0, 4, 3], [1, 2, 5]] : [[0, 4, 5], [0, 5, 1], [3, 2, 5], [3, 5, 4], [0, 3, 4], [1, 5, 2]];
    const pos = [], uv = [];
    for (const t of tri) for (const i of t) { const p = P[i]; pos.push(p[0], p[1] + top, p[2]); uv.push(p[0] / 2.2, (p[1] + Math.abs(along ? p[2] : p[0])) / 1.4); }
    const gb = new THREE.BufferGeometry(); gb.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gb.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); gb.computeVertexNormals();
    roof.push(gb);
    trim.push(bx(1.1, 2.4, 1.1, along ? a.w * 0.22 : 0, top + 1.6, along ? 0 : a.d * 0.2), bx(1.4, 0.15, 1.4, along ? a.w * 0.22 : 0, top + 2.85, along ? 0 : a.d * 0.2));
    trim.push(bx(a.w + 0.2, 0.25, a.d + 0.2, 0, base + 0.12, 0));   // soubassement
  } else {   // toit-terrasse : acrotère, dalle, équipements (blocs de ventilation, cabine d'escalier, citerne, mât)
    const t = 0.35, ph = 0.9;
    trim.push(bx(a.w, ph, t, 0, top + ph / 2, a.d / 2 - t / 2), bx(a.w, ph, t, 0, top + ph / 2, -a.d / 2 + t / 2), bx(t, ph, a.d - 2 * t, a.w / 2 - t / 2, top + ph / 2, 0), bx(t, ph, a.d - 2 * t, -a.w / 2 + t / 2, top + ph / 2, 0));
    roof.push(bx(a.w - 2 * t, 0.12, a.d - 2 * t, 0, top + 0.06, 0));
    const n = Math.min(6, 2 + Math.floor((a.w * a.d) / 220)), mw = a.w / 2 - 3, md = a.d / 2 - 3;
    for (let i = 0; i < n; i++) roof.push(bx(1.6 + rand() * 1.4, 1 + rand() * 0.6, 1.4 + rand(), (rand() * 2 - 1) * mw, top + 0.65, (rand() * 2 - 1) * md));
    trim.push(bx(Math.min(4, a.w * 0.2), 2.6, Math.min(4, a.d * 0.2), -a.w * 0.22, top + 1.4, a.d * 0.18));   // cabine d'escalier / machinerie d'ascenseur
    if (a.tank) roof.push(new THREE.CylinderGeometry(1.6, 1.6, 2.4, 14).translate(a.w * 0.2, top + 1.3, -a.d * 0.2).toNonIndexed());
    if (a.crown) trim.push(bx(a.w * 0.62, Math.max(3, a.h * 0.06), a.d * 0.62, 0, top + 0.45 + Math.max(3, a.h * 0.06) / 2, 0));
    if (a.mast) trim.push(new THREE.CylinderGeometry(0.1, 0.18, 16, 6).translate(a.w * 0.15, top + (a.crown ? 5 : 1) + 8, a.d * 0.15).toNonIndexed());
    if (a.style === 'glass') trim.push(bx(a.w + 0.3, 0.5, a.d + 0.3, 0, base + 0.25, 0));
  }
  const un = (arr) => (arr.length ? mergeGeometries(arr) : null);
  return { shell, trim: un(trim), roof: un(roof) };
}

function noiseTexture(size, base, spread, line) {
  const c = canvas(size, size), g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, size, size);
  for (let i = 0; i < size * size / 12; i++) {
    const v = (Math.random() - 0.5) * spread | 0;
    g.fillStyle = `rgba(${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${Math.abs(v) / 255})`;
    g.fillRect(Math.random() * size, Math.random() * size, 2, 2);
  }
  if (line) { g.strokeStyle = line; g.lineWidth = 2; g.strokeRect(0, 0, size, size); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export class City {
  constructor(scene, renderer) {
    this.scene = scene; this.renderer = renderer;
    this.col = new Collision();
    this.rand = rng(7);
    this.nightMats = [];     // matériaux émissifs pilotés par la nuit
    this.wetMats = [];       // matériaux dont la rugosité baisse sous la pluie
    this.build();
  }

  // 0 = jour, 1 = nuit
  setNight(n) {
    for (const m of this.nightMats) m.emissiveIntensity = m.userData.max * n;
  }
  setWet(w) {
    for (const m of this.wetMats) m.roughness = m.userData.dry - w * 0.55;
  }

  instanced(geo, material, matrices, colors, cast = false) {
    const mesh = new THREE.InstancedMesh(geo, material, Math.max(1, matrices.length));
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    if (colors) colors.forEach((c, i) => mesh.setColorAt(i, c));
    mesh.count = matrices.length;
    mesh.castShadow = cast; mesh.receiveShadow = true; mesh.frustumCulled = false;
    this.scene.add(mesh);
    return mesh;
  }
  M(x, y, z, ry = 0, sx = 1, sy = 1, sz = 1) {
    dummy.position.set(x, y, z); dummy.rotation.set(0, ry, 0); dummy.scale.set(sx, sy, sz); dummy.updateMatrix();
    return dummy.matrix.clone();
  }

  build() {
    const { scene, rand } = this;
    const span = (G - 1) * P;
    const flat = (w, l) => new THREE.PlaneGeometry(w, l).rotateX(-Math.PI / 2);

    // sol herbe
    const grassT = noiseTexture(128, '#3f6b3a', 60); grassT.repeat.set(500, 500);
    grassT.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), new THREE.MeshStandardMaterial({ map: grassT, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02; ground.receiveShadow = true;
    scene.add(ground);

    // routes
    const asphaltT = noiseTexture(128, '#43484f', 50);
    asphaltT.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const road = new THREE.MeshStandardMaterial({ map: asphaltT, roughness: 0.95 });
    road.userData.dry = 0.95; this.wetMats.push(road);
    this.asphalt = road;
    const len = span + ROAD + 40;
    // rues nord-sud : même hauteur que les rues est-ouest mais tirées devant aux carrefours (plus de scintillement entre les deux couches)
    const roadNS = road.clone(); roadNS.polygonOffset = true; roadNS.polygonOffsetFactor = -1; roadNS.polygonOffsetUnits = -1;
    roadNS.userData.dry = 0.95; this.wetMats.push(roadNS);
    for (let k = 0; k < G; k++) {
      const m1 = new THREE.Mesh(new THREE.BoxGeometry(len, 0.04, ROAD), road); m1.position.set(0, 0.0, coord(k));
      const m2 = new THREE.Mesh(new THREE.BoxGeometry(ROAD, 0.04, len), roadNS); m2.position.set(coord(k), 0.0, 0);
      m1.receiveShadow = m2.receiveShadow = true; scene.add(m1, m2);
    }
    // trottoirs : un pavé par îlot
    const side = new THREE.MeshStandardMaterial({ map: noiseTexture(64, '#9a9a96', 40, '#7a7a76'), roughness: 0.9 });
    side.map.repeat.set(30, 30);
    const blocks = [];
    for (let bi = 0; bi < G - 1; bi++) for (let bj = 0; bj < G - 1; bj++) blocks.push(this.M((bi - 4) * P, 0.075, (bj - 4) * P, 0, P - ROAD, 0.15, P - ROAD));
    this.instanced(new THREE.BoxGeometry(1, 1, 1), side, blocks);

    this.markings();
    this.lots();
    this.treesAndLamps();
    this.caserne();
    this.hospital();
    this.hydrants();
  }

  markings() {
    const white = new THREE.MeshBasicMaterial({ color: '#e8e8e8', polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });   // marquages devant la chaussée
    const flat = (w, l) => new THREE.PlaneGeometry(w, l).rotateX(-Math.PI / 2);
    const dashes = [], stripes = [], lines = [], signs = [], poles = [];
    const Y = 0.035;
    for (const n of nodes) {
      DIRS.forEach((d, k) => {
        if (!inGrid(n.i + d.x, n.j + d.z)) return;
        const ry = k % 2 === 0 ? Math.PI / 2 : 0, r = rightOf(d);
        // ligne axiale pointillée de l'arête (une fois par arête : seulement k=0,1)
        if (k < 2) for (let s = 14; s < P - 14; s += 7) dashes.push(this.M(n.x + d.x * (s + 1.5), Y, n.z + d.z * (s + 1.5), ry));
        if (n.type === 'round') return;
        // ligne de stop sur la voie entrante (cap -d) : côté droit de -d = -r
        lines.push(this.M(n.x + d.x * 11.5 - r.x * LANE_C, Y, n.z + d.z * 11.5 - r.z * LANE_C, ry));
        if (n.type === 'signal') for (let o = -5.5; o <= 5.5; o += 1) stripes.push(this.M(n.x + d.x * 9 + r.x * o, Y, n.z + d.z * 9 + r.z * o, ry));
        else if (axisMinor(n, k)) {
          signs.push(this.M(n.x + d.x * 9 - r.x * 6.8, 2.4, n.z + d.z * 9 - r.z * 6.8, Math.atan2(d.x, d.z)));
          poles.push(this.M(n.x + d.x * 9 - r.x * 6.8, 1.2, n.z + d.z * 9 - r.z * 6.8));
        }
      });
    }
    this.instanced(flat(0.18, 3), white, dashes);
    this.instanced(flat(0.5, 3), white, stripes);
    this.instanced(flat(5.8, 0.4), white, lines);
    // panneaux STOP
    const sc = canvas(64, 64), g = sc.getContext('2d');
    g.fillStyle = '#c4161c'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#fff'; g.lineWidth = 4; g.strokeRect(3, 3, 58, 58);
    g.fillStyle = '#fff'; g.font = 'bold 20px sans-serif'; g.textAlign = 'center'; g.fillText('STOP', 32, 40);
    const st = new THREE.CanvasTexture(sc); st.colorSpace = THREE.SRGBColorSpace;
    this.instanced(new THREE.BoxGeometry(0.8, 0.8, 0.05), new THREE.MeshBasicMaterial({ map: st }), signs);
    this.instanced(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6), new THREE.MeshStandardMaterial({ color: '#888' }), poles);

    // îlots centraux des ronds-points
    const isl = [], islTrees = [];
    for (const n of nodes) if (n.type === 'round') {
      isl.push(this.M(n.x, 0.12, n.z, 0, 4.2, 0.24, 4.2));
      this.col.addCircle(n.x, n.z, 4.2, 'island');
      islTrees.push([n.x, n.z]);
    }
    this.instanced(new THREE.CylinderGeometry(1, 1, 1, 24), new THREE.MeshStandardMaterial({ color: '#4d7f3f' }), isl);
    this.islandTrees = islTrees;
  }

  lots() {
    const { rand } = this;
    const place = {};                      // archétype -> [matrices]
    const add = (id, x, z) => {
      const a = ARCH[id];
      (place[id] ??= []).push(this.M(x, a.h / 2 + 0.15, z));
      this.col.addBox(x - a.w / 2, x + a.w / 2, z - a.d / 2, z + a.d / 2, 'building');
    };
    const grassLots = [], parkLots = [], parkTrees = [];
    this.parkTrees = parkTrees;
    const pick = (a) => a[Math.floor(rand() * a.length)];
    for (let bi = 0; bi < G - 1; bi++) for (let bj = 0; bj < G - 1; bj++) {
      const cx = (bi - 4) * P, cz = (bj - 4) * P, zone = blockZone(bi, bj);
      if (zone === 'centre') {
        for (const ox of [-20, 20]) for (const oz of [-20, 20]) {
          const id = bi === 4 && bj === 4 ? pick(['tower1', 'tower2', 'tower2', 'tower3']) : pick(['tower1', 'tower3', 'office', 'block', 'mid', 'tower2']);
          add(id, cx + ox, cz + oz);
        }
      } else if (bi === HOSPITAL.bi && bj === HOSPITAL.bj) {
        parkLots.push(this.M(cx, 0.18, cz, 0, 80, 1, 80));
      } else if (zone === 'peripherie') {
        const mission = [...MISSION_LOTS, ...IMMEUBLE_LOTS].some((l) => l.bi === bi && l.bj === bj);
        if (rand() < 0.15 && !mission) {   // pas de pelouse sur l'îlot d'une maison visitable : elle recouvrait son rez-de-chaussée
          grassLots.push(this.M(cx, 0.18, cz, 0, 80, 1, 80));
          for (let t = 0; t < 14; t++) parkTrees.push([cx + (rand() - 0.5) * 70, cz + (rand() - 0.5) * 70]);
        } else for (const ox of [-26, 0, 26]) for (const oz of [-26, 0, 26]) if (rand() < 0.85 && !(ox === 0 && oz === 26 && mission)) add(rand() < 0.5 ? 'house' : 'house2', cx + ox + (rand() - 0.5) * 4, cz + oz + (rand() - 0.5) * 4);
      } else if (zone === 'commerce') {
        parkLots.push(this.M(cx, 0.18, cz, 0, 80, 1, 80));
        if (rand() < 0.5) add('mall', cx, cz - 14);
        else { add('shop', cx - 20, cz - 22); add('shop', cx + 20, cz - 22); }
      }
    }
    // pelouses et parkings 3 cm au-dessus du trottoir (0,15 m), tirés devant : ils scintillaient à 1 cm
    const lotMat = (color) => new THREE.MeshStandardMaterial({ color, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    this.instanced(flat1(), lotMat('#4a8a3d'), grassLots);
    this.instanced(flat1(), lotMat('#35383d'), parkLots);

    for (const [id, mats] of Object.entries(place)) {
      const a = ARCH[id], wh = a.wh ?? a.h, fd = facade(a.d, wh, a, rand), fw = a.w === a.d ? fd : facade(a.w, wh, a, rand);
      const wallMat = (f) => {
        const m = new THREE.MeshStandardMaterial({ map: f.map, emissiveMap: f.emissive, emissive: '#ffffff', emissiveIntensity: 0, roughness: 0.8 });
        m.userData.max = 1.1; this.nightMats.push(m); return m;
      };
      const mD = wallMat(fd), mW = wallMat(fw), roof = new THREE.MeshStandardMaterial({ color: a.roof, roughness: 0.9 });
      const tileMat = a.gable ? new THREE.MeshStandardMaterial({ map: roofTexture(a.roof), roughness: 0.85, side: THREE.DoubleSide }) : roof;
      const trimMat = new THREE.MeshStandardMaterial({ color: a.gable ? '#e9e4d8' : new THREE.Color(a.roof).offsetHSL(0, 0, 0.12), roughness: 0.75 });
      const p = archParts(a, rand), put = (geo, mat) => {
        if (!geo) return;
        const mesh = new THREE.InstancedMesh(geo, mat, mats.length);
        mats.forEach((m, i) => mesh.setMatrixAt(i, m));
        mesh.castShadow = mesh.receiveShadow = true; mesh.frustumCulled = false; this.scene.add(mesh);
      };
      put(p.shell, [mD, mD, roof, roof, mW, mW]); put(p.trim, trimMat); put(p.roof, tileMat);
    }
  }

  treesAndLamps() {
    const { rand } = this;
    const nearStop = () => false;
    const nearNode = (x, z, r) => nodes.some((n) => Math.abs(n.x - x) < r && Math.abs(n.z - z) < r);
    const trees = [];
    const half = (P - ROAD) / 2;
    for (let bi = 0; bi < G - 1; bi++) for (let bj = 0; bj < G - 1; bj++) {
      const cx = (bi - 4) * P, cz = (bj - 4) * P, zone = blockZone(bi, bj), step = zone === 'centre' ? 18 : 12;
      for (let s = -half + 8; s <= half - 8; s += step) {
        for (const [x, z] of [[cx + s, cz - half + 1.8], [cx + s, cz + half - 1.8], [cx - half + 1.8, cz + s], [cx + half - 1.8, cz + s]]) {
          if (nearNode(x, z, 15) || nearStop(x, z, 6)) continue;
          trees.push([x, z]);
        }
      }
    }
    trees.length = 0; // arbres retirés (demande de Yoann)
    const trunkM = [], leafM = [], leafC = [];
    for (const [x, z] of trees) {
      const sc = 0.8 + rand() * 0.6;
      trunkM.push(this.M(x, 1 * sc, z, 0, sc, sc, sc));
      leafM.push(this.M(x, 3.3 * sc, z, rand() * 3, sc, sc, sc));
      leafC.push(new THREE.Color().setHSL(0.27 + rand() * 0.08, 0.5, 0.25 + rand() * 0.1));
      this.col.addCircle(x, z, 0.5, 'tree');
    }
    if (trunkM.length) {
      this.instanced(new THREE.CylinderGeometry(0.15, 0.22, 2, 6), new THREE.MeshStandardMaterial({ color: '#5a3c25' }), trunkM);
      this.instanced(new THREE.IcosahedronGeometry(1.6, 0), new THREE.MeshStandardMaterial({ color: '#ffffff', flatShading: true }), leafM, leafC);
    }

    // lampadaires : 4 par arête, deux côtés
    const poles = [], heads = [];
    for (const n of nodes) for (let k = 0; k < 2; k++) {
      const d = DIRS[k];
      if (!inGrid(n.i + d.x, n.j + d.z)) continue;
      const r = rightOf(d);
      for (const s of [22, 38, 62, 78]) for (const sd of [-1, 1]) {
        const x = n.x + d.x * s + r.x * sd * 6.8, z = n.z + d.z * s + r.z * sd * 6.8;
        poles.push(this.M(x, 3.25, z)); heads.push(this.M(x - r.x * sd * 0.9, 6.5, z - r.z * sd * 0.9, k % 2 === 0 ? 0 : Math.PI / 2));
        this.col.addCircle(x, z, 0.25, 'lamp');
      }
    }
    this.instanced(new THREE.CylinderGeometry(0.07, 0.1, 6.5, 6), new THREE.MeshStandardMaterial({ color: '#555' }), poles);
    const lampMat = new THREE.MeshStandardMaterial({ color: '#fff3c0', emissive: '#ffd27a', emissiveIntensity: 0 });
    lampMat.userData.max = 3; this.nightMats.push(lampMat);
    this.instanced(new THREE.BoxGeometry(1.8, 0.14, 0.35), lampMat, heads);
  }

  // Caserne : remise à 3 portes sectionnelles rouges (relevées) face à la rue sud, bâtiment de vie à façade crépie, tour de séchage rayée,
  // mât de drapeau, antenne radio avec feu bleu, marquage jaune devant les baies, lampes allumées la nuit.
  caserne() {
    const { x, z } = CASERNE, rand = this.rand, std = (o) => new THREE.MeshStandardMaterial(o);
    const red = std({ color: '#b3121b', roughness: 0.5, metalness: 0.2 }), roofM = std({ color: '#5b5f66', roughness: 0.9 }), white = std({ color: '#efeae0', roughness: 0.7 }), dark = std({ color: '#2a2d31', roughness: 0.6 });
    const A = { wall: '#d9d2c3', glass: '#2b3b4c', trim: '#f4f1ea', style: 'plain', fh: 3.6, win: [1.5, 1.9] };
    const wallMat = (f) => { const m = std({ map: f.map, emissiveMap: f.emissive, emissive: '#ffffff', emissiveIntensity: 0, roughness: 0.85 }); m.userData.max = 1.1; this.nightMats.push(m); return m; };
    const box = (w, h, d, m, px, py, pz) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(px, py, pz); o.castShadow = o.receiveShadow = true; this.scene.add(o); return o; };
    const noDoor = { noDoor: true };
    // remise : mur du fond (±z), murs latéraux (±x)
    const fBack = wallMat(facade(36, 9, A, rand, noDoor)), fSide = wallMat(facade(16, 9, A, rand, noDoor));
    box(36, 9, 1, [fSide, fSide, roofM, roofM, fBack, fBack], x, 4.5, z - 14);
    for (const sx of [-1, 1]) box(1, 9, 16, [fSide, fSide, roofM, roofM, fSide, fSide], x + sx * 18, 4.5, z - 6);
    box(37, 0.6, 17, roofM, x, 9.3, z - 6);
    // rives rouges, lanterneaux et équipements de toit
    for (const [w, d, px, pz] of [[37.4, 0.4, 0, 2.3], [37.4, 0.4, 0, -14.3], [0.4, 17, 18.7, -6], [0.4, 17, -18.7, -6]]) box(w, 0.7, d, red, x + px, 9.75, z + pz);
    for (const o of [-9, 9]) { box(7, 1.3, 3, white, x + o, 10.25, z - 6); box(6.4, 0.5, 2.4, dark, x + o, 10.95, z - 6); }
    box(1.8, 1.4, 1.6, white, x, 10.1, z - 10);
    const mast = box(0.16, 9, 0.16, white, x - 14, 14.3, z - 11); mast.castShadow = false;
    const beacon = std({ color: '#2a6bff', emissive: '#2a6bff', emissiveIntensity: 0.4 }); beacon.userData.max = 3; this.nightMats.push(beacon);
    const bl = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), beacon); bl.position.set(x - 14, 19.1, z - 11); this.scene.add(bl);
    // façade avant : piliers, portes sectionnelles relevées (lames + hublots), numéros, lampes
    const dc = canvas(256, 64), dg = dc.getContext('2d');
    dg.fillStyle = '#b3121b'; dg.fillRect(0, 0, 256, 64);
    for (let y = 0; y < 64; y += 8) { dg.fillStyle = 'rgba(0,0,0,0.3)'; dg.fillRect(0, y, 256, 2); dg.fillStyle = 'rgba(255,255,255,0.1)'; dg.fillRect(0, y + 2, 256, 1); }
    for (let k = 0; k < 4; k++) { dg.fillStyle = '#10171f'; dg.fillRect(20 + k * 58, 22, 40, 14); dg.fillStyle = 'rgba(160,200,230,0.35)'; dg.fillRect(20 + k * 58, 22, 40, 5); }
    const doorT = new THREE.CanvasTexture(dc); doorT.colorSpace = THREE.SRGBColorSpace;
    const doorM = std({ map: doorT, roughness: 0.45, metalness: 0.25 });
    const lampM = std({ color: '#fff3c0', emissive: '#ffd27a', emissiveIntensity: 0 }); lampM.userData.max = 3; this.nightMats.push(lampM);
    for (const o of [-12, 0, 12]) {
      box(0.8, 9, 1, white, x + o - 6, 4.5, z + 2); box(10.4, 1.4, 0.3, doorM, x + o, 8.2, z + 2);
      box(10.4, 0.2, 0.7, white, x + o, 7.4, z + 2.1);
      box(0.7, 0.18, 0.4, lampM, x + o, 7.2, z + 2.55);
      const nc = canvas(64, 64), ng = nc.getContext('2d'); ng.fillStyle = '#fff'; ng.fillRect(0, 0, 64, 64); ng.fillStyle = '#b3121b'; ng.font = 'bold 54px sans-serif'; ng.textAlign = 'center'; ng.fillText(String((o + 12) / 12 + 1), 32, 50);
      const nt = new THREE.CanvasTexture(nc); nt.colorSpace = THREE.SRGBColorSpace;
      const num = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), std({ map: nt })); num.position.set(x + o, 9.3, z + 2.52); this.scene.add(num);
    }
    box(0.8, 9, 1, white, x + 18, 4.5, z + 2);
    this.col.addBox(x - 18.5, x + 18.5, z - 14.5, z - 13.5, 'building');
    this.col.addBox(x - 18.5, x - 17.5, z - 14, z + 2.5, 'building'); this.col.addBox(x + 17.5, x + 18.5, z - 14, z + 2.5, 'building');
    // marquage jaune à chevrons devant chaque baie
    const hc = canvas(128, 64), hg = hc.getContext('2d'); hg.fillStyle = 'rgba(0,0,0,0)'; hg.clearRect(0, 0, 128, 64);
    hg.fillStyle = '#f2c400'; for (let k = -64; k < 192; k += 22) { hg.beginPath(); hg.moveTo(k, 64); hg.lineTo(k + 12, 64); hg.lineTo(k + 44, 0); hg.lineTo(k + 32, 0); hg.fill(); }
    const ht = new THREE.CanvasTexture(hc); ht.colorSpace = THREE.SRGBColorSpace;
    for (const o of [-12, 0, 12]) { const hp = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.2).rotateX(-Math.PI / 2), std({ map: ht, transparent: true, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })); hp.position.set(x + o, 0.2, z + 4.4); hp.receiveShadow = true; this.scene.add(hp); }
    // bâtiment de vie : façade crépie à 3 niveaux, auvent d'entrée, perron, toit-terrasse
    const fl = wallMat(facade(22, 11, A, rand)), fs = wallMat(facade(14, 11, A, rand, noDoor));
    box(22, 11, 14, [fs, fs, roofM, roofM, fl, fl], x - 6, 5.5, z - 30); this.col.addBox(x - 17, x + 5, z - 37, z - 23, 'building');
    for (const [w, d, px, pz] of [[22.4, 0.4, -6, -22.9], [22.4, 0.4, -6, -37.1], [0.4, 14, 5.1, -30], [0.4, 14, -17.1, -30]]) box(w, 0.8, d, white, x + px, 11.4, z + pz);
    box(2.2, 1.2, 1.8, white, x - 10, 11.6, z - 30); box(3, 1, 2, white, x - 1, 11.5, z - 33);
    box(5.4, 0.25, 2.6, red, x - 6, 3.2, z - 21.8); for (const o of [-2.4, 2.4]) box(0.15, 3.1, 0.15, white, x - 6 + o, 1.55, z - 20.7);
    box(5.4, 0.3, 2.2, std({ color: '#9a9a96', roughness: 0.9 }), x - 6, 0.15, z - 21.9);
    box(1.9, 2.3, 0.12, std({ color: '#3a2a20', roughness: 0.6 }), x - 6, 1.45, z - 22.95); box(1.3, 1.4, 0.04, std({ color: '#5b7a96', roughness: 0.2, metalness: 0.3 }), x - 6, 1.85, z - 23.02);
    box(0.5, 0.18, 0.3, lampM, x - 6, 3.0, z - 22.8);
    // tour de séchage des tuyaux : fentes verticales, bandes rouges, lanterne
    const tc = canvas(64, 256), tg = tc.getContext('2d');
    tg.fillStyle = '#d9d2c3'; tg.fillRect(0, 0, 64, 256);
    for (let y = 8; y < 220; y += 24) { tg.fillStyle = '#26303a'; tg.fillRect(26, y, 12, 16); tg.fillStyle = 'rgba(255,255,255,0.15)'; tg.fillRect(26, y, 12, 3); }
    tg.fillStyle = '#b3121b'; tg.fillRect(0, 226, 64, 10); tg.fillRect(0, 0, 64, 10); tg.fillStyle = 'rgba(0,0,0,0.25)'; tg.fillRect(0, 246, 64, 10);
    const tt = new THREE.CanvasTexture(tc); tt.colorSpace = THREE.SRGBColorSpace;
    const tm = std({ map: tt, roughness: 0.85 });
    box(5, 22, 5, [tm, tm, roofM, roofM, tm, tm], x + 14, 11, z - 30); this.col.addBox(x + 11.5, x + 16.5, z - 32.5, z - 27.5, 'building');
    box(5.6, 0.5, 5.6, red, x + 14, 22.25, z - 30); box(3.4, 1.6, 3.4, dark, x + 14, 23.3, z - 30); box(3.8, 0.3, 3.8, red, x + 14, 24.25, z - 30);
    // mât de drapeau tricolore
    const fc = canvas(96, 64), fg = fc.getContext('2d'); fg.fillStyle = '#1f3d9a'; fg.fillRect(0, 0, 32, 64); fg.fillStyle = '#fff'; fg.fillRect(32, 0, 32, 64); fg.fillStyle = '#d4202a'; fg.fillRect(64, 0, 32, 64);
    const ft = new THREE.CanvasTexture(fc); ft.colorSpace = THREE.SRGBColorSpace;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 10, 8), std({ color: '#cfd3d6', metalness: 0.6, roughness: 0.35 })); pole.position.set(x + 22, 5, z + 8); pole.castShadow = true; this.scene.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 1.8), std({ map: ft, side: THREE.DoubleSide, roughness: 0.9 })); flag.position.set(x + 23.4, 9, z + 8); this.scene.add(flag);
    this.col.addCircle(x + 22, z + 8, 0.2, 'post');
    // enseigne
    const c = canvas(1024, 128), g = c.getContext('2d');
    g.fillStyle = '#b3121b'; g.fillRect(0, 0, 1024, 128); g.fillStyle = '#fff'; g.font = 'bold 72px sans-serif'; g.textAlign = 'center';
    g.fillText('SAPEURS-POMPIERS', 512, 92);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Mesh(new THREE.PlaneGeometry(24, 3), new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: '#fff', emissiveIntensity: 0.3 }));
    s.position.set(x, 10.6, z + 2.6); this.scene.add(s);
    // sol de la remise et de la cour
    const lot = new THREE.Mesh(new THREE.PlaneGeometry(80, 80).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#3a3d42', roughness: 0.95 }));
    lot.position.set(x, 0.18, z); lot.receiveShadow = true; this.scene.add(lot);
  }

  // Hôpital : bloc blanc à façade vitrée sur 5 niveaux, entrée sous auvent, enseigne URGENCES, héliport et équipements sur le toit.
  hospital() {
    const { x, z } = HOSPITAL, std = (o) => new THREE.MeshStandardMaterial(o), rand = this.rand;
    const white = std({ color: '#eef1f4', roughness: 0.6 }), roofM = std({ color: '#8a8f96', roughness: 0.9 });
    const A = { wall: '#e9edf1', glass: '#3b5a74', trim: '#ffffff', style: 'stone', fh: 4.4, win: [2.4, 2.0] };
    const wallMat = (f) => { const m = std({ map: f.map, emissiveMap: f.emissive, emissiveIntensity: 0, emissive: '#ffffff', roughness: 0.6 }); m.userData.max = 1.1; this.nightMats.push(m); return m; };
    const box = (w, h, d, m, px, py, pz) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(px, py, pz); o.castShadow = o.receiveShadow = true; this.scene.add(o); return o; };
    const ff = wallMat(facade(56, 22, A, rand)), fs = wallMat(facade(30, 22, A, rand, { noDoor: true }));
    box(56, 22, 30, [fs, fs, roofM, roofM, ff, ff], x, 11, z - 8); this.col.addBox(x - 28, x + 28, z - 23, z + 7, 'building');
    for (const [w, d, px, pz] of [[56, 0.4, 0, 6.8], [56, 0.4, 0, -22.8], [0.4, 30, 27.8, -8], [0.4, 30, -27.8, -8]]) box(w, 0.9, d, white, x + px, 22.45, z + pz);
    for (const [w, h, d, px, pz] of [[3.4, 2, 2.6, 14, -14], [2.4, 1.6, 2.4, 18, -2], [4.5, 3, 4, 6, -16], [2, 1.5, 2, -4, -2]]) box(w, h, d, white, x + px, 22 + h / 2, z + pz);
    const hc = canvas(128, 128), hg = hc.getContext('2d'); hg.fillStyle = '#3a3f46'; hg.beginPath(); hg.arc(64, 64, 62, 0, 7); hg.fill(); hg.strokeStyle = '#f2c400'; hg.lineWidth = 5; hg.beginPath(); hg.arc(64, 64, 55, 0, 7); hg.stroke();
    hg.fillStyle = '#fff'; hg.font = 'bold 76px sans-serif'; hg.textAlign = 'center'; hg.fillText('H', 64, 90);
    const ht = new THREE.CanvasTexture(hc); ht.colorSpace = THREE.SRGBColorSpace;
    const hp = new THREE.Mesh(new THREE.PlaneGeometry(14, 14).rotateX(-Math.PI / 2), std({ map: ht, transparent: true, roughness: 0.9 })); hp.position.set(x - 14, 22.07, z - 10); this.scene.add(hp);
    box(16, 0.4, 9, white, x, 4.2, z + 11.5); for (const o of [-7.5, 7.5]) { box(0.4, 4.2, 0.4, white, x + o, 2.1, z + 15.6); this.col.addCircle(x + o, z + 15.6, 0.3, 'post'); }
    const c = canvas(1024, 160), g = c.getContext('2d');
    g.fillStyle = '#c4161c'; g.fillRect(0, 0, 1024, 160); g.fillStyle = '#fff'; g.font = 'bold 92px sans-serif'; g.textAlign = 'center'; g.fillText('URGENCES', 600, 115);
    g.fillRect(70, 40, 120, 40); g.fillRect(110, 0, 40, 160);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.2), new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: '#fff', emissiveIntensity: 0.5 }));
    s.position.set(x, 5.6, z + 16.05); this.scene.add(s);
  }

  // Poteaux incendie rouges (norme française) : fût, chapeau, deux sorties.
  hydrants() {
    const m = [], caps = [];
    for (const h of HYDRANTS) { m.push(this.M(h.x, 0.5, h.z)); caps.push(this.M(h.x, 1.05, h.z)); this.col.addCircle(h.x, h.z, 0.3, 'hydrant'); }
    const red = new THREE.MeshStandardMaterial({ color: '#c8161d', roughness: 0.45, metalness: 0.3 });
    this.instanced(new THREE.CylinderGeometry(0.17, 0.2, 1, 10), red, m, null, true);
    this.instanced(new THREE.SphereGeometry(0.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), red, caps);
  }
}

const LANE_C = 3;
const axisMinor = (n, k) => (k % 2 === 0 ? 'x' : 'z') !== n.major;
const flat1 = () => new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);

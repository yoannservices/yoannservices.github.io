// Maison R+1 visitable : 6 pièces par niveau (grille 3 x 2), portes qui s'ouvrent, escalier, fenêtres qui éclatent à la chaleur,
// flammes, couche de fumée qui descend du plafond. La logique du feu est dans FireSim (graphe de pièces).
// Repère local : façade et porte d'entrée vers +z (la rue), origine au centre de l'emprise, au sol.
import * as THREE from 'three';
import { Collision } from '../city/Collision.js';
import { FireSim } from './FireSim.js';
import { tex, worldUV } from './textures.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { get } from '../settings.js';
import { STAIR, LANES, stairY } from './stairs.js';

export const W = 14, D = 10, H = 3, T = 0.2;
const XC = [-W / 2, -W / 6, W / 6, W / 2];       // limites des colonnes
const ZR = [-D / 2, 0, D / 2];                   // limites des rangées (0 = fond, 1 = façade)
export { STAIR };   // escalier dans la pièce du fond au centre : volées en lacets (voir stairs.js)
const NAMES = [
  ['Cuisine', 'Escalier', 'Salle à manger', 'Salon', 'Entrée', 'Bureau'],
  ['Chambre 2', 'Palier', 'Salle de bain', 'Chambre 1', 'Chambre 3', 'Chambre d\'enfant'],
];
const FUEL = [[110, 25, 90, 120, 40, 80], [100, 25, 30, 100, 90, 95]];
const FURN = [   // meubles [largeur, hauteur, profondeur, couleur] par pièce
  [[3.2, 0.9, 0.7, '#c9c2b5'], null, [1.8, 0.75, 1, '#7a5537'], [2.2, 0.8, 0.9, '#5d6b7d'], null, [1.4, 0.75, 0.7, '#6f4f33']],
  [[1.6, 0.5, 2, '#8a7fa8'], null, [1.6, 0.55, 0.75, '#e8eef2'], [1.6, 0.5, 2, '#a86f6f'], [1.4, 0.5, 2, '#6f8fa8'], [0.9, 0.45, 1.8, '#d8b84a']],
];
export const roomIndex = (floor, row, col) => floor * 6 + row * 3 + col;

let flameTex = null;
function flameTexture() {
  if (flameTex) return flameTex;
  const c = Object.assign(document.createElement('canvas'), { width: 64, height: 64 }), g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 36, 2, 32, 36, 30);
  gr.addColorStop(0, 'rgba(255,250,210,1)'); gr.addColorStop(0.3, 'rgba(255,170,40,0.9)'); gr.addColorStop(0.7, 'rgba(220,60,10,0.35)'); gr.addColorStop(1, 'rgba(120,20,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  flameTex = new THREE.CanvasTexture(c); flameTex.colorSpace = THREE.SRGBColorSpace;
  return flameTex;
}

export class Building {
  // upper : étages d'appartements au-dessus du R+1 (immeuble), reliés par l'escalier en lacets (stairs.js) et accessibles par l'EPA
  constructor(scene, lot, cityCol, upper = 0) {
    this.upper = upper; this.floors = 2 + upper;
    this.scene = scene; this.lot = lot; this.ox = lot.x; this.oz = lot.z;
    this.root = new THREE.Group(); this.root.position.set(lot.x, 0, lot.z); scene.add(this.root);
    this.cols = Array.from({ length: 2 + upper }, () => new Collision(4));
    this.doors = []; this.windows = []; this.rooms = []; this.furniture = [];
    const tl = get('textures');
    this.mat = {
      wall: new THREE.MeshStandardMaterial({ color: '#ece6da', map: tex('paint', tl), roughness: 0.9 }),
      out: new THREE.MeshStandardMaterial({ color: ['#e2d2b4', '#d9a48e', '#d8d2c2', '#c4ced6'][lot.k % 4], map: tex('plaster', tl), roughness: 0.95 }),
      floor: new THREE.MeshStandardMaterial({ color: tl ? '#ffffff' : '#8c6a48', map: tex('parquet', tl), roughness: 0.7 }),
      tiles: new THREE.MeshStandardMaterial({ color: tl ? '#ffffff' : '#d8d8d2', map: tex('tiles', tl), roughness: 0.35 }),
      slab: new THREE.MeshStandardMaterial({ color: '#e8e4dc', roughness: 0.95 }),
      lamp: new THREE.MeshStandardMaterial({ color: '#fff8e0', emissive: '#ffe9b0', emissiveIntensity: 0.8 }),
      roof: new THREE.MeshStandardMaterial({ color: tl ? '#ffffff' : '#8a4b3a', map: tex('roof', tl), roughness: 0.85, side: THREE.DoubleSide }),
      door: new THREE.MeshStandardMaterial({ color: '#6b4a2e', roughness: 0.7 }),
      front: new THREE.MeshStandardMaterial({ color: '#2f4f6b', roughness: 0.5 }),
    };
    this.build(cityCol);
    this.sim = null;
  }

  // --- construction ---------------------------------------------------------------------------
  box(w, h, d, mat, x, y, z, parent = this.root) {
    const m = new THREE.Mesh(worldUV(new THREE.BoxGeometry(w, h, d), w, h, d), mat);
    m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m;
  }
  solid(floor, x0, x1, z0, z1) { this.cols[floor].addBox(this.ox + x0, this.ox + x1, this.oz + z0, this.oz + z1, 'wall'); }

  // mur aligné sur x ou z, avec des baies { c: centre, w: largeur, door: bool }
  wall(floor, axis, fixed, a0, a1, gaps = [], mat = this.mat.wall, cityCol = null) {
    const y0 = floor * H, pieces = [];
    let cur = a0;
    for (const g of gaps.sort((p, q) => p.c - q.c)) { pieces.push([cur, g.c - g.w / 2]); cur = g.c + g.w / 2; }
    pieces.push([cur, a1]);
    const put = (s0, s1, yb, yt, collide) => {
      if (s1 - s0 < 0.01) return;
      const len = s1 - s0, mid = (s0 + s1) / 2, h = yt - yb;
      if (axis === 'x') { this.box(len, h, T, mat, mid, yb + h / 2, fixed); if (collide) { this.solid(floor, s0, s1, fixed - T / 2, fixed + T / 2); cityCol?.addBox(this.ox + s0, this.ox + s1, this.oz + fixed - T / 2, this.oz + fixed + T / 2, 'building'); } }
      else { this.box(T, h, len, mat, fixed, yb + h / 2, mid); if (collide) { this.solid(floor, fixed - T / 2, fixed + T / 2, s0, s1); cityCol?.addBox(this.ox + fixed - T / 2, this.ox + fixed + T / 2, this.oz + s0, this.oz + s1, 'building'); } }
    };
    for (const [s0, s1] of pieces) put(s0, s1, y0, y0 + H, true);
    for (const g of gaps) put(g.c - g.w / 2, g.c + g.w / 2, y0 + 2.1, y0 + H, false);     // linteau
  }

  door(floor, axis, fixed, c, link, exterior = false) {
    const w = exterior ? 1.1 : 0.9, y0 = floor * H;
    const hinge = new THREE.Group();
    if (axis === 'x') hinge.position.set(c - w / 2, y0, fixed); else hinge.position.set(fixed, y0, c - w / 2);
    this.root.add(hinge);
    const panel = this.box(w, 2.08, 0.06, exterior ? this.mat.front : this.mat.door, w / 2, 1.04, 0, hinge);
    if (axis === 'z') { hinge.rotation.y = -Math.PI / 2; }
    const bx = axis === 'x' ? { minx: c - w / 2, maxx: c + w / 2, minz: fixed - 0.08, maxz: fixed + 0.08 } : { minx: fixed - 0.08, maxx: fixed + 0.08, minz: c - w / 2, maxz: c + w / 2 };
    const box = { t: 0, minx: this.ox + bx.minx, maxx: this.ox + bx.maxx, minz: this.oz + bx.minz, maxz: this.oz + bx.maxz, tag: 'door', s: 0 };
    const d = { floor, axis, x: this.ox + (axis === 'x' ? c : fixed), z: this.oz + (axis === 'x' ? fixed : c), hinge, panel, box, link, open: true, exterior, base: hinge.rotation.y };
    this.doors.push(d);
    return { c, w, door: true };
  }

  build(cityCol) {
    const { mat } = this, links = [];
    // pièces
    for (let f = 0; f < 2; f++) for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
      const id = roomIndex(f, r, c);
      this.rooms[id] = { id, floor: f, row: r, col: c, name: NAMES[f][r * 3 + c], fuel: FUEL[f][r * 3 + c], x0: XC[c], x1: XC[c + 1], z0: ZR[r], z1: ZR[r + 1], cx: (XC[c] + XC[c + 1]) / 2, cz: (ZR[r] + ZR[r + 1]) / 2 };
    }
    const UP = ['Cuisine', 'Palier', 'Salle de bain', 'Séjour', 'Chambre', 'Chambre d\'enfant'];
    for (let f = 2; f < this.floors; f++) for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
      const id = roomIndex(f, r, c);
      this.rooms[id] = { id, floor: f, row: r, col: c, name: `${UP[r * 3 + c]} (${f}e)`, fuel: r === 0 && c === 1 ? 20 : 100, x0: XC[c], x1: XC[c + 1], z0: ZR[r], z1: ZR[r + 1], cx: (XC[c] + XC[c + 1]) / 2, cz: (ZR[r] + ZR[r + 1]) / 2, upper: true };
    }
    const link = (a, b, kind, open = true) => { links.push({ a, b, kind, open }); return links.length - 1; };
    for (let f = 0; f < 2; f++) {
      const y0 = f * H;
      // murs intérieurs : x = ±W/6 (portes à z = -1,5 au fond et 2,5 en façade), z = 0 (porte au centre)
      for (const ci of [1, 2]) {
        const x = XC[ci];
        const gb = this.door(f, 'z', x, -1.5, link(roomIndex(f, 0, ci - 1), roomIndex(f, 0, ci), 'door'));
        const gf = this.door(f, 'z', x, 2.5, link(roomIndex(f, 1, ci - 1), roomIndex(f, 1, ci), 'door'));
        this.wall(f, 'z', x, ZR[0] + T / 2, ZR[2] - T / 2, [gb, gf]);
      }
      const gm = this.door(f, 'x', 0, 0, link(roomIndex(f, 0, 1), roomIndex(f, 1, 1), 'door'));
      this.wall(f, 'x', 0, XC[0] + T / 2, XC[1] - T / 2); this.wall(f, 'x', 0, XC[1] + T / 2, XC[2] - T / 2, [gm]); this.wall(f, 'x', 0, XC[2] + T / 2, XC[3] - T / 2);
      // murs extérieurs (porte d'entrée au rez-de-chaussée)
      const ext = f === 0 ? [this.door(0, 'x', D / 2, 0, link(roomIndex(0, 1, 1), -1, 'exit'), true)] : [];
      if (f === 0) { this.box(2.2, 0.24, 1.2, mat.slab, 0, 0.12, D / 2 + 0.7); this.box(1.5, 0.1, 0.12, mat.frame ??= new THREE.MeshStandardMaterial({ color: '#f2f2ee', roughness: 0.6 }), 0, 2.16, D / 2 + T / 2 + 0.06); for (const sx of [-0.6, 0.6]) this.box(0.1, 2.2, 0.12, mat.frame, sx, 1.1, D / 2 + T / 2 + 0.06); }
      this.wall(f, 'x', D / 2, -W / 2, W / 2, ext, mat.out, f === 0 ? cityCol : null);
      this.wall(f, 'x', -D / 2, -W / 2, W / 2, [], mat.out, f === 0 ? cityCol : null);
      this.wall(f, 'z', -W / 2, -D / 2, D / 2, [], mat.out, f === 0 ? cityCol : null);
      this.wall(f, 'z', W / 2, -D / 2, D / 2, [], mat.out, f === 0 ? cityCol : null);
      // fenêtres : une par pièce sur chaque façade extérieure (lien « window » fermé tant que la vitre tient)
      this.windowsFor(f, link);
      // sol
      const TILE = ['Cuisine', 'Salle de bain', 'Entrée'];
      for (const rm of this.rooms.filter((q) => q.floor === f)) {
        const w = rm.x1 - rm.x0, d = rm.z1 - rm.z0, g = new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), uv = g.attributes.uv;
        for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 2, uv.getY(i) * d / 2);
        const fl = new THREE.Mesh(g, TILE.includes(rm.name) ? mat.tiles : mat.floor);
        fl.position.set(rm.cx, f ? f * H + 0.02 : 0.17, rm.cz); fl.receiveShadow = true; this.root.add(fl);   // rez-de-chaussée au-dessus du trottoir (0,15 m), sinon le trottoir recouvre le parquet
        if (f === 1 && rm.col === 1 && rm.row === 0) fl.visible = false;    // palier : la trémie de l'escalier reste ouverte (dalle découpée dessous)
        const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.08, 16), mat.lamp); lamp.position.set(rm.cx, f * H + H - 0.3, rm.cz); this.root.add(lamp);
      }
      if (f === 1) {   // dalle de l'étage percée au-dessus de l'escalier
        const s = STAIR, th = 0.25;
        const slab = (x0, x1, z0, z1) => this.box(x1 - x0, th, z1 - z0, mat.slab, (x0 + x1) / 2, H - th / 2 - 0.01, (z0 + z1) / 2);
        slab(-W / 2, W / 2, s.z1, D / 2); slab(-W / 2, W / 2, -D / 2, s.z0); slab(-W / 2, s.x0, s.z0, s.z1); slab(s.x1, W / 2, s.z0, s.z1);
      }
    }
    // escalier en lacets : une volée par étage (voie A vers +x, voie B vers -x), garde-corps des trémies, volées fermées côté pièce
    const steps = 14, run = (STAIR.x1 - STAIR.x0) / steps, sh = H / steps;
    const rail = (j, x0, x1, z0, z1) => { this.box(x1 - x0, 1, z1 - z0, mat.door, (x0 + x1) / 2, j * H + 0.5, (z0 + z1) / 2); this.solid(j, x0, x1, z0, z1); };
    for (let k = 0; k < this.floors - 1; k++) {
      const L = LANES[k % 2], odd = k % 2, zc = (L.z0 + L.z1) / 2;
      for (let i = 0; i < steps; i++) this.box(run + 0.02, (i + 1) * sh, L.z1 - L.z0, mat.door, odd ? L.x1 - (i + 0.5) * run : L.x0 + (i + 0.5) * run, k * H + ((i + 1) * sh) / 2, zc);
      if (k > 0) {   // volée posée sur l'étage k : fermée sur les côtés et en haut, ouverte à la base
        if (odd) { this.solid(k, L.x0, L.x1, L.z0 - 0.05, L.z0 + 0.05); this.solid(k, L.x0, L.x1, L.z1 - 0.05, L.z1 + 0.05); this.solid(k, L.x0 - 0.1, L.x0, L.z0, L.z1); }
        else { this.solid(k, L.x0, L.x1, L.z1 - 0.05, L.z1 + 0.05); this.solid(k, L.x1, L.x1 + 0.1, L.z0, L.z1); }
      }
    }
    for (let j = 1; j < this.floors; j++) {   // trémie de la volée j-1 : garde-corps sauf du côté de l'arrivée
      const L = LANES[(j - 1) % 2];
      if ((j - 1) % 2) { rail(j, L.x0 + 0.2, L.x1 + 0.05, L.z0 - 0.05, L.z0 + 0.05); rail(j, L.x0 + 0.2, L.x1 + 0.05, L.z1 - 0.05, L.z1 + 0.05); rail(j, L.x1, L.x1 + 0.1, L.z0, L.z1); }
      else { rail(j, L.x0 - 0.05, L.x1 - 0.2, L.z1 - 0.05, L.z1 + 0.05); rail(j, L.x0 - 0.1, L.x0, L.z0, L.z1); }
    }
    this.solid(0, STAIR.x0 + 0.5, STAIR.x1, STAIR.z1 - 0.05, STAIR.z1 + 0.05); this.solid(0, STAIR.x1, STAIR.x1 + 0.1, STAIR.z0, STAIR.z1);
    for (let f = 2; f < this.floors; f++) {
      for (const [a, b] of [[[0, 0], [0, 1]], [[0, 1], [0, 2]], [[1, 0], [1, 1]], [[1, 1], [1, 2]], [[0, 1], [1, 1]]]) link(roomIndex(f, ...a), roomIndex(f, ...b), 'door', true);
      link(roomIndex(f - 1, 0, 1), roomIndex(f, 0, 1), 'stair', true);
      this.wall(f, 'x', D / 2, -W / 2, W / 2, [], mat.out); this.wall(f, 'x', -D / 2, -W / 2, W / 2, [], mat.out);
      this.wall(f, 'z', -W / 2, -D / 2, D / 2, [], mat.out); this.wall(f, 'z', W / 2, -D / 2, D / 2, [], mat.out);
      { const L = LANES[(f - 1) % 2], hx = (W - 0.3) / 2, hz = (D - 0.3) / 2, sl = (x0, x1, z0, z1) => this.box(x1 - x0, 0.25, z1 - z0, mat.slab, (x0 + x1) / 2, f * H - 0.12, (z0 + z1) / 2);   // dalle percée au-dessus de la volée f-1
        sl(-hx, hx, L.z1, hz); sl(-hx, hx, -hz, L.z0); sl(-hx, L.x0, L.z0, L.z1); sl(L.x1, hx, L.z0, L.z1); }
      this.windowsFor(f, link);
      // balcon filant en façade (les victimes y attendent la grande échelle)
      this.box(W - 1, 0.16, 1.3, mat.slab, 0, f * H + 0.08, D / 2 + 0.75);
      this.box(W - 1, 0.9, 0.06, mat.frame ??= new THREE.MeshStandardMaterial({ color: '#f2f2ee', roughness: 0.6 }), 0, f * H + 0.6, D / 2 + 1.38);
    }
    const top = this.floors * H;
    if (this.upper) {   // toit-terrasse avec acrotère
      this.box(W, 0.3, D, mat.slab, 0, top + 0.15, 0);
      for (const [w, d, x, z] of [[W, 0.2, 0, D / 2], [W, 0.2, 0, -D / 2], [0.2, D, W / 2, 0], [0.2, D, -W / 2, 0]]) this.box(w, 0.8, d, mat.out, x, top + 0.55, z);
    }
    // plafond de l'étage + toit à deux pans
    this.box(W, 0.2, D, mat.wall, 0, top + 0.1, 0);
    const roofG = new THREE.BufferGeometry(), rh = 2.6, rw = W / 2 + 0.4, rd = D / 2 + 0.4, y = top + 0.2;
    const v = [-rw, y, -rd, rw, y, -rd, rw, y + rh, 0, -rw, y, -rd, rw, y + rh, 0, -rw, y + rh, 0, -rw, y, rd, -rw, y + rh, 0, rw, y + rh, 0, -rw, y, rd, rw, y + rh, 0, rw, y, rd,
      -rw, y, -rd, -rw, y + rh, 0, -rw, y, rd, rw, y, -rd, rw, y, rd, rw, y + rh, 0];
    roofG.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); roofG.computeVertexNormals();
    const ruv = []; for (let i = 0; i < v.length; i += 3) ruv.push(v[i] / 2.2, (v[i + 1] - y + Math.abs(v[i + 2])) / 1.4);
    roofG.setAttribute('uv', new THREE.Float32BufferAttribute(ruv, 2));
    const roof = new THREE.Mesh(roofG, mat.roof); roof.castShadow = true; if (!this.upper) this.root.add(roof);
    // meubles (combustible visible : noircit en brûlant)
    for (const rm of this.rooms) {
      const f = FURN[rm.floor]?.[rm.row * 3 + rm.col];
      if (!f) continue;
      const [w, h, d, col] = f, m = new THREE.MeshStandardMaterial({ color: col, roughness: 0.8 });
      const fx = rm.cx + (rm.col === 0 ? -0.6 : rm.col === 2 ? 0.6 : 0.8), fz = rm.row === 0 ? rm.z0 + d / 2 + 0.4 : rm.z1 - d / 2 - 0.5;
      this.box(w, h, d, m, fx, (rm.floor ? rm.floor * H : 0.17) + h / 2, fz);   // posé sur le parquet du rez-de-chaussée (0,17 m)
      this.solid(rm.floor, fx - w / 2, fx + w / 2, fz - d / 2, fz + d / 2);
      this.furniture.push({ room: rm.id, mat: m, base: new THREE.Color(col) });
    }
    this.links = links;
    // flammes et couche de fumée par pièce
    const fm = new THREE.SpriteMaterial({ map: flameTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
    for (const rm of this.rooms) {
      rm.flames = [];
      for (let k = 0; k < [3, 6, 9][get('effects')]; k++) {
        const sp = new THREE.Sprite(fm); sp.visible = false; this.root.add(sp);
        rm.flames.push({ sp, ox: (Math.random() - 0.5) * (rm.x1 - rm.x0 - 1.2), oz: (Math.random() - 0.5) * (rm.z1 - rm.z0 - 1.2), ph: Math.random() * 6 });
      }
      const sm = new THREE.MeshBasicMaterial({ color: '#1c1b1a', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
      rm.smokeMesh = new THREE.Mesh(new THREE.BoxGeometry(rm.x1 - rm.x0 - 0.22, 1, rm.z1 - rm.z0 - 0.22), sm);
      rm.smokeMesh.visible = false; rm.smokeMesh.renderOrder = 2; this.root.add(rm.smokeMesh);
    }
    this.closeAllDoors(false);
    this.buildNav();
    this.mergeStatic();
  }

  // fusionne les pièces fixes (murs, dalles, escalier, menuiseries, volets, sols, lampes, toit, meubles) par matériau :
  // ~10 appels de dessin par maison au lieu d'une centaine. Restent à part : vitres, portes, flammes, fumée.
  mergeStatic() {
    const keep = new Set([...this.windows.map((w) => w.mesh), ...this.rooms.map((r) => r.smokeMesh)]), byMat = new Map();
    for (const o of [...this.root.children]) {
      if (!o.isMesh || keep.has(o) || o.children.length) continue;
      this.root.remove(o);
      if (!o.visible) continue;
      o.updateMatrix();
      const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()).applyMatrix4(o.matrix);
      for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
      if (!byMat.has(o.material)) byMat.set(o.material, []);
      byMat.get(o.material).push(g);
    }
    for (const [mat, geos] of byMat) {
      const m = new THREE.Mesh(mergeGeometries(geos), mat); m.castShadow = m.receiveShadow = true; this.root.add(m);
      for (const g of geos) g.dispose();
    }
  }

  windowsFor(f, link) {
    const y0 = f * H;
    for (const rm of this.rooms.filter((q) => q.floor === f)) {
      if (rm.col === 1 && rm.row === 0) continue;          // cage d'escalier
      const zFace = rm.row === 1 ? D / 2 + T / 2 + 0.02 : -D / 2 - T / 2 - 0.02, xs = rm.col === 1 && rm.row === 1 && f === 0 ? [-1.6, 1.6] : [rm.cx];
      const wl = link(rm.id, -1, 'window', false);
      for (const wx of xs) this.addWindow(rm, wl, wx, y0 + 1.5, zFace, 0);
      if (rm.col !== 1) this.addWindow(rm, wl, rm.col === 0 ? -W / 2 - T / 2 - 0.02 : W / 2 + T / 2 + 0.02, y0 + 1.5, rm.cz, Math.PI / 2);
    }
  }

  addWindow(rm, linkIdx, x, y, z, ry) {
    const glass = new THREE.MeshStandardMaterial({ color: '#2a3c4d', emissive: '#ff6a10', emissiveIntensity: 0, roughness: 0.15, metalness: 0.3 });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.2), glass); m.position.set(x, y, z); m.rotation.y = ry;
    if (ry === 0 && z < 0) m.rotation.y = Math.PI; else if (ry !== 0 && x > 0) m.rotation.y = Math.PI / 2; else if (ry !== 0) m.rotation.y = -Math.PI / 2;
    this.root.add(m);
    const frame = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 1.35), new THREE.MeshStandardMaterial({ color: '#f2f2ee' }));
    frame.position.copy(m.position); frame.rotation.y = m.rotation.y; frame.translateZ(-0.01); this.root.add(frame);   // cadre, vitre et croisillons espacés de 1 cm : plus de scintillement de loin
    // croisillons, appui et volets ouverts
    const bar = this.mat.frame ??= new THREE.MeshStandardMaterial({ color: '#f2f2ee', roughness: 0.6 });
    for (const [w, h] of [[0.06, 1.2], [1.3, 0.06]]) { const c = new THREE.Mesh(new THREE.PlaneGeometry(w, h), bar); c.position.copy(m.position); c.rotation.y = m.rotation.y; c.translateZ(0.02); this.root.add(c); }   // le bâti reste quand la vitre éclate
    const sill = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.06, 0.18), bar); sill.position.copy(m.position); sill.rotation.y = m.rotation.y; sill.translateY(-0.66); sill.translateZ(0.06); this.root.add(sill);
    if (get('textures')) {
      const sh = this.mat.shutter ??= new THREE.MeshStandardMaterial({ color: ['#3f6b4a', '#6b8fa8', '#8a4b3a', '#d8c690'][this.lot.k % 4], roughness: 0.7 });
      for (const sx of [-1.05, 1.05]) { const v = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.32, 0.04), sh); v.position.copy(m.position); v.rotation.y = m.rotation.y; v.translateX(sx); v.translateZ(0.02); this.root.add(v); }
    }
    const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); flame.visible = false; this.root.add(flame);
    const out = m.position.clone().add(new THREE.Vector3(0, 0, 0.35).applyEuler(m.rotation));
    this.windows.push({ room: rm.id, link: linkIdx, mesh: m, glass, flame, out });
  }

  // --- portes -----------------------------------------------------------------------------------
  setDoor(d, open) {
    d.open = open;
    d.hinge.rotation.y = d.base + (open ? (d.exterior ? -1.7 : 1.7) : 0);
    const dyn = this.cols[d.floor].dynamic, i = dyn.indexOf(d.box);
    if (open && i >= 0) dyn.splice(i, 1); else if (!open && i < 0) dyn.push(d.box);
    if (this.sim) this.sim.links[d.link].open = open;
  }
  closeAllDoors(random, rand = Math.random) { for (const d of this.doors) this.setDoor(d, d.exterior ? false : random ? rand() < 0.45 : false); }
  nearestDoor(x, z, floor, max = 1.6) {
    let best = null, bd = max;
    for (const d of this.doors) { if (d.floor !== floor) continue; const dd = Math.hypot(d.x - x, d.z - z); if (dd < bd) { bd = dd; best = d; } }
    return best;
  }

  // --- géométrie utile au joueur ---------------------------------------------------------------
  local(x, z) { return { x: x - this.ox, z: z - this.oz }; }
  inside(x, z) { const l = this.local(x, z); return Math.abs(l.x) < W / 2 && Math.abs(l.z) < D / 2; }
  near(x, z, m = 6) { const l = this.local(x, z); return Math.abs(l.x) < W / 2 + m && Math.abs(l.z) < D / 2 + m; }
  roomAt(x, z, floor) {
    const l = this.local(x, z);
    if (Math.abs(l.x) >= W / 2 || Math.abs(l.z) >= D / 2) return -1;
    const c = l.x < XC[1] ? 0 : l.x < XC[2] ? 1 : 2, r = l.z < 0 ? 0 : 1;
    return roomIndex(floor, r, c);
  }
  // hauteur du sol sous le joueur (escalier compris) ; y = hauteur actuelle des pieds
  groundY(x, z, y) {
    const l = this.local(x, z), h = stairY(l.x, l.z, y, this.floors - 1, H);
    if (h !== null) return h;
    return this.inside(x, z) ? H * Math.min(this.floors - 1, Math.max(0, Math.round(y / H))) : 0;
  }
  // point d'arrivée d'une lance (pas de 0,35 m jusqu'au premier mur ou porte fermée) ; renvoie { room, x, z, d, wallRoom }
  spray(x, z, dx, dz, floor, range) {
    const col = this.cols[floor];
    let px = x, pz = z, d = 0, hit = false;
    for (; d < range; d += 0.35) {
      const nx = x + dx * d, nz = z + dz * d;
      if (col.resolve(nx, nz, 0.05).hit) { hit = true; break; }
      px = nx; pz = nz;
    }
    const room = this.roomAt(px, pz, floor);
    // jet arrêté par une façade : il entre par une fenêtre éclatée de la pièce derrière (attaque depuis l'extérieur, moins efficace)
    let wallRoom = -1;
    if (hit && room < 0) {
      const r2 = this.roomAt(px + dx * 0.8, pz + dz * 0.8, floor);
      if (r2 >= 0 && this.windows.some((w) => w.room === r2 && this.sim?.links[w.link].open)) wallRoom = r2;
    }
    return { room, x: px, z: pz, d, wallRoom };
  }

  openWindow(w) { if (this.sim) this.sim.links[w.link].open = true; w.broken = true; w.glass.color.set('#0b0705'); w.glass.roughness = 1; }

  // --- déplacements des équipiers : graphe pièces / portes / escalier ---------------------------
  buildNav() {
    const N = [], adj = [], add = (x, z, floor, extra = {}) => { N.push({ x: this.ox + x, z: this.oz + z, floor, ...extra }); adj.push([]); return N.length - 1; };
    const link = (a, b) => { const d = Math.hypot(N[a].x - N[b].x, N[a].z - N[b].z) + Math.abs(N[a].floor - N[b].floor) * 3; adj[a].push([b, d]); adj[b].push([a, d]); };
    // nœud d'une pièce = son centre, sauf la cage d'escalier aux étages (le centre y est sur une volée) : on la prend côté palier
    const roomNode = this.rooms.map((r) => add(r.cx, r.floor && r.col === 1 && r.row === 0 ? -1 : r.cz, r.floor, { room: r.id }));
    const outside = add(0, D / 2 + 1.6, 0, { outside: true });
    for (const d of this.doors) {
      const n = add(d.x - this.ox, d.z - this.oz, d.floor, { door: d }), l = this.links[d.link];
      link(n, roomNode[l.a]); link(n, l.b < 0 ? outside : roomNode[l.b]);
    }
    const phys = new Set(this.doors.map((d) => d.link));   // étages d'appartements : pièces ouvertes les unes sur les autres
    this.links.forEach((l, i) => { if (l.kind === 'door' && !phys.has(i) && l.b >= 0) link(roomNode[l.a], roomNode[l.b]); });
    for (let k = 0; k < this.floors - 1; k++) {   // une volée : accès à la base (par le côté libre), pied, haut, sortie vers le palier de l'étage k+1
      const L = LANES[k % 2], sx = k % 2 ? -1 : 1, zc = (L.z0 + L.z1) / 2, xb = k % 2 ? L.x1 : L.x0, xt = k % 2 ? L.x0 : L.x1;
      const base = add(xb - sx * 0.45, zc, k), top = add(xt + sx * 0.4, zc, k + 1), exit = add(xt + sx * 0.4, -1.6, k + 1);
      if (k) { const side = add(xb - sx * 0.45, -1.6, k); link(roomNode[roomIndex(k, 0, 1)], side); link(side, base); } else link(roomNode[roomIndex(0, 0, 1)], base);
      link(base, top); link(top, exit); link(exit, roomNode[roomIndex(k + 1, 0, 1)]);
    }
    this.nav = { N, adj, roomNode, outside };
  }
  // chemin (liste de points { x, z, floor, door }) d'un point vers une pièce (id) ou l'extérieur (-1)
  path(from, toRoom) {
    const { N, adj, roomNode, outside } = this.nav;
    const r0 = this.roomAt(from.x, from.z, from.floor ?? 0), a = r0 < 0 ? outside : roomNode[r0], b = toRoom < 0 ? outside : roomNode[toRoom];
    const dist = N.map(() => Infinity), prev = N.map(() => -1), done = new Set(); dist[a] = 0;
    while (true) {
      let u = -1, best = Infinity;
      for (let i = 0; i < N.length; i++) if (!done.has(i) && dist[i] < best) { best = dist[i]; u = i; }
      if (u < 0 || u === b) break;
      done.add(u);
      for (const [v, w] of adj[u]) if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; prev[v] = u; }
    }
    const out = [];
    for (let u = b; u >= 0; u = prev[u]) out.unshift(N[u]);
    return out;
  }
  // emplacement libre d'une victime dans une pièce
  // victime sur le balcon d'une pièce en façade (immeuble)
  balconySpot(id) { const r = this.rooms[id]; return { x: this.ox + r.cx, z: this.oz + D / 2 + 0.85, floor: r.floor, y: r.floor * H + 0.16 }; }
  victimSpot(id) { const r = this.rooms[id]; return { x: this.ox + r.cx + (r.col === 1 ? -0.7 : 0), z: this.oz + r.cz + (r.row === 1 ? -0.6 : 0.4), floor: r.floor, y: r.floor * H }; }

  // --- feu --------------------------------------------------------------------------------------
  startFire(rand = Math.random) {
    this.sim = new FireSim(this.rooms.map((r) => ({ name: r.name, floor: r.floor, fuel: r.fuel })), this.links.map((l) => ({ ...l })));
    this.closeAllDoors(true, rand);
    for (const w of this.windows) { w.broken = false; w.glass.color.set('#2a3c4d'); w.glass.roughness = 0.15; }
    for (const f of this.furniture) f.mat.color.copy(f.base);
    const pool = this.rooms.filter((r) => (r.col !== 1 || r.row === 1) && (!this.upper || (rand() < 0.8 ? r.upper : !r.upper)));
    const start = pool[Math.floor(rand() * pool.length)];
    this.sim.ignite(start.id);
    return start;
  }

  update(dt, time) {
    const sim = this.sim;
    if (!sim) return;
    for (const w of this.windows) {
      const r = sim.rooms[w.room], l = sim.links[w.link];
      if (!l.open && r.T > 450) this.openWindow(w);
      const fl = w.flame, on = w.broken && r.fire > 0.25;
      fl.visible = on;
      if (on) { const h = (0.8 + r.fire * 1.6) * (0.85 + 0.2 * Math.sin(time * 8 + w.room)); fl.scale.set(h * 0.8, h * 1.5, 1); fl.position.copy(w.out); fl.position.y += h * 0.45; }
      w.glass.emissiveIntensity = Math.min(2.5, r.fire * 2.5 + Math.max(0, r.T - 150) / 400);
    }
    for (const rm of this.rooms) {
      const s = sim.rooms[rm.id], y0 = rm.floor * H;
      rm.flames.forEach((f, k) => {
        const on = s.fire > (k / rm.flames.length) * 0.9;
        f.sp.visible = on;
        if (!on) return;
        const h = (0.6 + s.fire * 1.6) * (0.8 + 0.25 * Math.sin(time * 9 + f.ph));
        f.sp.scale.set(h * 0.9, h * 1.4, 1);
        f.sp.position.set(rm.cx + f.ox, y0 + h * 0.55, rm.cz + f.oz);
      });
      const sm = rm.smokeMesh, thick = Math.min(H - 0.3, s.smoke * (H - 0.2));
      sm.visible = s.smoke > 0.03;
      if (sm.visible) { sm.scale.y = Math.max(0.05, thick); sm.position.set(rm.cx, y0 + H - 0.05 - thick / 2, rm.cz); sm.material.opacity = Math.min(0.85, 0.25 + s.smoke * 0.6); }
    }
    for (const f of this.furniture) { const s = sim.rooms[f.room]; f.mat.color.copy(f.base).lerp(new THREE.Color('#151311'), 1 - s.fuel / s.fuel0); }
  }

  // fumée vue d'un point (0..1), plus faible accroupi : la couche chaude reste en hauteur
  smokeAt(x, z, floor, eyeY) {
    const id = this.roomAt(x, z, floor);
    if (id < 0 || !this.sim) return 0;
    const s = this.sim.rooms[id].smoke, layerBottom = floor * H + H - s * (H - 0.2);
    return eyeY > layerBottom ? s : s * 0.25;
  }
}

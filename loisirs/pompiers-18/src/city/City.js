// Génération de la ville (reprise de bus-city-simulator) : sol, routes, marquages, maisons et immeubles instanciés, lampadaires, caserne, poteaux incendie.
import * as THREE from 'three';
import { G, P, ROAD, HALF, DIRS, rightOf, coord, inGrid, blockZone, nodes, nodeAt, CASERNE, HYDRANTS, MISSION_LOTS, IMMEUBLE_LOTS, HOSPITAL } from './grid.js';
import { Collision } from './Collision.js';

const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const canvas = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
const dummy = new THREE.Object3D();

const ARCH = {
  tower1: { w: 22, d: 22, h: 72, wall: '#7f8da0', glass: '#1d2c3d', roof: '#666' },
  tower2: { w: 20, d: 20, h: 96, wall: '#5f7388', glass: '#14202e', roof: '#555' },
  tower3: { w: 24, d: 24, h: 55, wall: '#9a9186', glass: '#1d2c3d', roof: '#666' },
  office: { w: 32, d: 26, h: 44, wall: '#a8a496', glass: '#26384a', shop: 1, roof: '#777' },
  block: { w: 34, d: 30, h: 30, wall: '#b9a48c', glass: '#2b3b4c', shop: 1, roof: '#7a6f66' },
  mid: { w: 28, d: 24, h: 21, wall: '#c4b7a2', glass: '#2b3b4c', shop: 1, roof: '#7a6f66' },
  house: { w: 12, d: 10, h: 7, wall: '#d8c6a9', glass: '#33475b', roof: '#8a4b3a' },
  house2: { w: 10, d: 12, h: 8, wall: '#c98f7a', glass: '#33475b', roof: '#5b6670' },
  shop: { w: 34, d: 28, h: 8, wall: '#d9d4c7', glass: '#3a5266', shop: 1, roof: '#777' },
  mall: { w: 62, d: 46, h: 12, wall: '#c9ced6', glass: '#26384a', shop: 1, roof: '#888' },
};

// façade : albédo + masque émissif (fenêtres allumées la nuit)
function facade(wm, hm, a, rand) {
  const ppm = 8, cw = Math.ceil(wm * ppm), ch = Math.ceil(hm * ppm);
  const c1 = canvas(cw, ch), c2 = canvas(cw, ch), g = c1.getContext('2d'), e = c2.getContext('2d');
  g.fillStyle = a.wall; g.fillRect(0, 0, cw, ch);
  e.fillStyle = '#000'; e.fillRect(0, 0, cw, ch);
  const floorH = 3.5, winW = 1.7, winH = 1.9, floors = Math.max(1, Math.floor(hm / floorH)), cols = Math.max(1, Math.floor(wm / 3.2));
  for (let f = 0; f < floors; f++) {
    const y = ch - (f + 1) * floorH * ppm + ((floorH - winH) / 2) * ppm;
    if (f === 0 && a.shop) {
      g.fillStyle = a.glass; g.fillRect(cw * 0.04, y - 6, cw * 0.92, winH * ppm + 8);
      e.fillStyle = '#ffe9b0'; e.fillRect(cw * 0.04, y - 6, cw * 0.92, winH * ppm + 8);
      continue;
    }
    for (let k = 0; k < cols; k++) {
      const x = (k + 0.5) * (cw / cols) - (winW * ppm) / 2;
      g.fillStyle = a.glass; g.fillRect(x, y, winW * ppm, winH * ppm);
      if (rand() < 0.4) { e.fillStyle = rand() < 0.8 ? '#ffd98a' : '#bcd8ff'; e.fillRect(x, y, winW * ppm, winH * ppm); }
    }
  }
  const mk = (c) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  return { map: mk(c1), emissive: mk(c2) };
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
    for (let k = 0; k < G; k++) {
      const m1 = new THREE.Mesh(new THREE.BoxGeometry(len, 0.04, ROAD), road); m1.position.set(0, 0.0, coord(k));
      const m2 = new THREE.Mesh(new THREE.BoxGeometry(ROAD, 0.04, len), road); m2.position.set(coord(k), 0.002, 0);
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
    const white = new THREE.MeshBasicMaterial({ color: '#e8e8e8' });
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
        parkLots.push(this.M(cx, 0.16, cz, 0, 80, 1, 80));
      } else if (zone === 'peripherie') {
        if (rand() < 0.15) {
          grassLots.push(this.M(cx, 0.16, cz, 0, 80, 1, 80));
          for (let t = 0; t < 14; t++) parkTrees.push([cx + (rand() - 0.5) * 70, cz + (rand() - 0.5) * 70]);
        } else for (const ox of [-26, 0, 26]) for (const oz of [-26, 0, 26]) if (rand() < 0.85 && !(ox === 0 && oz === 26 && [...MISSION_LOTS, ...IMMEUBLE_LOTS].some((l) => l.bi === bi && l.bj === bj))) add(rand() < 0.5 ? 'house' : 'house2', cx + ox + (rand() - 0.5) * 4, cz + oz + (rand() - 0.5) * 4);
      } else if (zone === 'commerce') {
        parkLots.push(this.M(cx, 0.16, cz, 0, 80, 1, 80));
        if (rand() < 0.5) add('mall', cx, cz - 14);
        else { add('shop', cx - 20, cz - 22); add('shop', cx + 20, cz - 22); }
      }
    }
    this.instanced(flat1(), new THREE.MeshStandardMaterial({ color: '#4a8a3d', roughness: 1 }), grassLots);
    this.instanced(flat1(), new THREE.MeshStandardMaterial({ color: '#35383d', roughness: 0.95 }), parkLots);

    for (const [id, mats] of Object.entries(place)) {
      const a = ARCH[id], fd = facade(a.d, a.h, a, rand), fw = a.w === a.d ? fd : facade(a.w, a.h, a, rand);
      const wallMat = (f) => {
        const m = new THREE.MeshStandardMaterial({ map: f.map, emissiveMap: f.emissive, emissive: '#ffffff', emissiveIntensity: 0, roughness: 0.8 });
        m.userData.max = 1.1; this.nightMats.push(m); return m;
      };
      const mD = wallMat(fd), mW = wallMat(fw), roof = new THREE.MeshStandardMaterial({ color: a.roof, roughness: 0.9 });
      const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(a.w, a.h, a.d), [mD, mD, roof, roof, mW, mW], mats.length);
      mats.forEach((m, i) => mesh.setMatrixAt(i, m));
      mesh.castShadow = mesh.receiveShadow = true; mesh.frustumCulled = false;
      this.scene.add(mesh);
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

  // Caserne : remise à 3 portes rouges face à la rue sud, bâtiment de vie, enseigne et tour de séchage des tuyaux.
  caserne() {
    const { x, z } = CASERNE, wall = new THREE.MeshStandardMaterial({ color: '#d9d2c3', roughness: 0.85 });
    const red = new THREE.MeshStandardMaterial({ color: '#b3121b', roughness: 0.5, metalness: 0.2 });
    const roof = new THREE.MeshStandardMaterial({ color: '#5b5f66', roughness: 0.9 });
    const box = (w, h, d, m, px, py, pz) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(px, py, pz); o.castShadow = o.receiveShadow = true; this.scene.add(o); return o; };
    // remise (ouverte au sud : les portes sont relevées)
    box(36, 9, 1, wall, x, 4.5, z - 14); box(1, 9, 16, wall, x - 18, 4.5, z - 6); box(1, 9, 16, wall, x + 18, 4.5, z - 6);
    box(37, 0.6, 17, roof, x, 9.3, z - 6);
    for (const o of [-12, 0, 12]) { box(0.8, 9, 1, wall, x + o - 6, 4.5, z + 2); box(10.4, 1.4, 0.3, red, x + o, 8.2, z + 2); }
    box(0.8, 9, 1, wall, x + 18, 4.5, z + 2);
    this.col.addBox(x - 18.5, x + 18.5, z - 14.5, z - 13.5, 'building');
    this.col.addBox(x - 18.5, x - 17.5, z - 14, z + 2.5, 'building'); this.col.addBox(x + 17.5, x + 18.5, z - 14, z + 2.5, 'building');
    // bâtiment de vie et tour de séchage
    box(22, 11, 14, wall, x - 6, 5.5, z - 30); this.col.addBox(x - 17, x + 5, z - 37, z - 23, 'building');
    box(5, 22, 5, wall, x + 14, 11, z - 30); this.col.addBox(x + 11.5, x + 16.5, z - 32.5, z - 27.5, 'building');
    // enseigne
    const c = canvas(1024, 128), g = c.getContext('2d');
    g.fillStyle = '#b3121b'; g.fillRect(0, 0, 1024, 128); g.fillStyle = '#fff'; g.font = 'bold 72px sans-serif'; g.textAlign = 'center';
    g.fillText('SAPEURS-POMPIERS', 512, 92);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Mesh(new THREE.PlaneGeometry(24, 3), new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: '#fff', emissiveIntensity: 0.3 }));
    s.position.set(x, 10.6, z + 2.6); this.scene.add(s);
    // sol de la remise et de la cour
    const lot = new THREE.Mesh(new THREE.PlaneGeometry(80, 80).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#3a3d42', roughness: 0.95 }));
    lot.position.set(x, 0.16, z); lot.receiveShadow = true; this.scene.add(lot);
  }

  // Hôpital : bloc blanc, enseigne URGENCES, auvent de dépose côté rue sud.
  hospital() {
    const { x, z } = HOSPITAL, white = new THREE.MeshStandardMaterial({ color: '#eef1f4', roughness: 0.6 }), glass = new THREE.MeshStandardMaterial({ color: '#3b5a74', roughness: 0.15, metalness: 0.4 });
    const box = (w, h, d, m, px, py, pz) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(px, py, pz); o.castShadow = o.receiveShadow = true; this.scene.add(o); return o; };
    box(56, 22, 30, white, x, 11, z - 8); this.col.addBox(x - 28, x + 28, z - 23, z + 7, 'building');
    for (let f = 0; f < 5; f++) box(52, 1.6, 0.2, glass, x, 3 + f * 4, z + 7.05);
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

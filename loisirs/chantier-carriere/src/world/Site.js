// Décor fixe de la carrière : installation de concassage (trémie, concasseur, convoyeur), pont-bascule, station-service, atelier,
// bureau, container, cabine de tir, poteaux d'éclairage, barrières, panneaux. Renvoie aussi les obstacles de collision.
import * as THREE from 'three';
import { boxCollider, circleCollider } from '../collision.js';
import { mats, box, cyl, extrude } from '../machines/kit.js';
import { PLANT } from './Plant.js';

export const ZONES = {
  fuel: { x: -40, z: 42, r: 9 }, workshop: { x: -20, z: 44, r: 10 }, weigh: { x: -70, z: 18, hx: 2.8, hz: 8.5 }, kiosk: { x: -26, z: 10, r: 11 },
  bay: { x: -70, z: -28 },
};
export const BLAST_SITES = [{ x0: 24.5, cz: -22, halfW: 15, floor: 0, depth: 4 }, { x0: 24.5, cz: 22, halfW: 15, floor: 0, depth: 4 }, { x0: 52.5, cz: -22, halfW: 15, floor: 5, depth: 4 }, { x0: 52.5, cz: 22, halfW: 15, floor: 5, depth: 4 }];

function sign(parent, text, w, h, x, y, z, ry, bg = '#12301f', fg = '#f2f2f2') {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = Math.round(256 * h / w); const c = cv.getContext('2d');
  c.fillStyle = bg; c.fillRect(0, 0, cv.width, cv.height); c.strokeStyle = fg; c.lineWidth = 6; c.strokeRect(6, 6, cv.width - 12, cv.height - 12);
  c.fillStyle = fg; c.font = 'bold 34px Inter,Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
  text.split('\n').forEach((l, i, a) => c.fillText(l, cv.width / 2, cv.height / 2 + (i - (a.length - 1) / 2) * 38));
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex })); m.position.set(x, y, z); m.rotation.y = ry; parent.add(m);
  return m;
}

export class Site {
  constructor(scene, terrain) {
    this.scene = scene; this.t = terrain; this.colliders = []; this.lamps = []; this.belt = null;
    const K = mats('#f2b705'), G = new THREE.Group(); scene.add(G); this.group = G;
    const concrete = new THREE.MeshStandardMaterial({ color: '#8b8b86', roughness: 0.95 }), metal = new THREE.MeshStandardMaterial({ color: '#59666e', roughness: 0.5, metalness: 0.6 });
    const blue = new THREE.MeshStandardMaterial({ color: '#2d5f94', roughness: 0.6, metalness: 0.3 }), white = new THREE.MeshStandardMaterial({ color: '#e7e9ea', roughness: 0.7 });
    const red = new THREE.MeshStandardMaterial({ color: '#b3231c', roughness: 0.6 }), warn = new THREE.MeshStandardMaterial({ color: '#e8b800', roughness: 0.6 });
    const add = (c) => this.colliders.push(c);

    // --- trémie (ouverte à l'est) : sol incliné, trois murs de béton ---
    const h = PLANT.hopper, hx = (h.x0 + h.x1) / 2, hz = (h.z0 + h.z1) / 2, hw = h.x1 - h.x0, hd = h.z1 - h.z0;
    box(G, hw + 1.4, 0.5, hd + 1.4, concrete, hx, 0.25, hz);
    for (const s of [-1, 1]) { box(G, hw + 1.4, 2.4, 0.6, concrete, hx, 1.2, hz + s * (hd / 2 + 0.3)); add(boxCollider(hx, hz + s * (hd / 2 + 0.3), (hw + 1.4) / 2, 0.3)); }
    box(G, 0.6, 3.4, hd + 1.2, concrete, h.x0 - 0.3, 1.7, hz); add(boxCollider(h.x0 - 0.3, hz, 0.3, (hd + 1.2) / 2));
    const chute = box(G, hw * 0.9, 0.2, hd - 0.4, metal, hx + 0.4, 0.9, hz); chute.rotation.z = -0.35;
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) box(G, 0.12, 0.7, 0.1, warn, h.x1 + 0.1, 2.6, hz + s * (1 + i * 0.7)).visible = false;
    // --- concasseur à mâchoires + criblage ---
    const cx = h.x0 - 5.4;
    box(G, 6, 3.6, 7, blue, cx, 2.4, hz); box(G, 5.4, 0.5, 6.4, metal, cx, 4.45, hz);
    for (const s of [-1, 1]) cyl(G, 1.1, 0.5, metal, cx + 0.8, 3.0, hz + s * 3.55, 'z', 20);   // volants
    cyl(G, 0.4, 3, metal, cx - 1.8, 5.9, hz + 2, 'y', 10);
    box(G, 3.2, 1.8, 3.6, white, cx + 4.2, 1.5, hz + 4.5); box(G, 3.4, 0.2, 3.8, metal, cx + 4.2, 2.5, hz + 4.5);   // groupe électrogène / local technique
    add(boxCollider(cx, hz, 3.0, 3.5)); add(boxCollider(cx + 4.2, hz + 4.5, 1.7, 1.9));
    sign(G, 'CONCASSEUR\nENTRÉE DANGER', 3, 1.2, cx + 3.01, 3.4, hz - 3.6, Math.PI / 2 * 0, '#7a1410');
    // --- convoyeur incliné jusqu'au tas de gravier ---
    const bx0 = cx - 0.5, bz0 = hz - 3.6, by0 = 3.2, ex = PLANT.stock.x, ez = PLANT.stock.z, ey = 9.2;
    const len = Math.hypot(ex - bx0, ez - bz0, ey - by0), belt = new THREE.Group(); belt.position.set(bx0, by0, bz0); G.add(belt);
    belt.lookAt(new THREE.Vector3(ex, ey, ez)); belt.updateMatrixWorld(true);
    const beltCv = document.createElement('canvas'); beltCv.width = 32; beltCv.height = 64; const bc = beltCv.getContext('2d'); bc.fillStyle = '#1b1b1b'; bc.fillRect(0, 0, 32, 64); bc.fillStyle = '#34312b'; bc.fillRect(0, 0, 32, 8);
    const beltTex = new THREE.CanvasTexture(beltCv); beltTex.wrapS = beltTex.wrapT = THREE.RepeatWrapping; beltTex.repeat.set(1, len / 1.2);
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, len), new THREE.MeshStandardMaterial({ map: beltTex, roughness: 0.95 })); top.position.z = len / 2; top.castShadow = true; belt.add(top);
    for (const s of [-1, 1]) box(belt, 0.1, 0.4, len, metal, s * 0.6, 0.15, len / 2);
    for (let i = 1; i < 6; i++) { const f = i / 6, px = bx0 + (ex - bx0) * f, pz = bz0 + (ez - bz0) * f, py = by0 + (ey - by0) * f; box(G, 0.3, py, 0.3, metal, px, py / 2, pz); add(circleCollider(px, pz, 0.5)); }
    cyl(G, 0.5, 0.3, metal, ex, ey - 0.2, ez, 'x', 12);
    this.belt = beltTex;
    // --- pont-bascule sur la route ---
    const w = ZONES.weigh; box(G, w.hx * 2, 0.25, w.hz * 2, metal, w.x, 0.1, w.z); box(G, 5.4, 0.1, 0.4, warn, w.x, 0.26, w.z - w.hz).visible = false;
    const cab = new THREE.Group(); cab.position.set(w.x + 6.5, 0, w.z); G.add(cab);
    box(cab, 3, 2.6, 2.4, white, 0, 1.3, 0); box(cab, 3.4, 0.2, 2.8, blue, 0, 2.7, 0); box(cab, 2.6, 0.9, 0.05, new THREE.MeshStandardMaterial({ color: '#7eb6c9', roughness: 0.1, transparent: true, opacity: 0.6 }), 0, 1.6, -1.2);
    add(boxCollider(w.x + 6.5, w.z, 1.6, 1.3)); sign(G, 'PONT-BASCULE\nPESÉE DES CAMIONS', 5, 1.4, w.x + 6.5, 3.8, w.z, -Math.PI / 2, '#12301f');
    // --- station-service ---
    const f = ZONES.fuel; box(G, 14, 0.15, 7, concrete, f.x, 0.08, f.z);
    for (const s of [-1, 1]) { box(G, 0.4, 5, 0.4, metal, f.x + s * 6, 2.5, f.z - 2.8); box(G, 0.4, 5, 0.4, metal, f.x + s * 6, 2.5, f.z + 2.8); add(circleCollider(f.x + s * 6, f.z - 2.8, 0.5)); add(circleCollider(f.x + s * 6, f.z + 2.8, 0.5)); }
    box(G, 15, 0.5, 8, red, f.x, 5.2, f.z); box(G, 15, 0.12, 8.2, white, f.x, 5.5, f.z);
    for (const s of [-1, 1]) { box(G, 0.8, 1.8, 0.7, red, f.x + s * 2.6, 0.95, f.z); box(G, 0.55, 0.5, 0.06, new THREE.MeshStandardMaterial({ color: '#0a2a18', emissive: '#37e38a', emissiveIntensity: 0.6 }), f.x + s * 2.6, 1.5, f.z + 0.37); add(boxCollider(f.x + s * 2.6, f.z, 0.45, 0.4)); }
    cyl(G, 1.6, 4.5, white, f.x, 1.6, f.z - 8, 'x', 20); sign(G, 'GAZOLE\n1,25 €/L', 3, 1.2, f.x, 5.9, f.z + 4.2, 0, '#7a1410'); add(boxCollider(f.x, f.z - 8, 2.4, 1.7));
    // --- atelier de réparation ---
    const wk = ZONES.workshop, wx = wk.x, wz = wk.z + 12;
    box(G, 20, 7, 0.5, metal, wx, 3.5, wz + 6); box(G, 0.5, 7, 12, metal, wx - 10, 3.5, wz); box(G, 0.5, 7, 12, metal, wx + 10, 3.5, wz); box(G, 21, 0.5, 13, new THREE.MeshStandardMaterial({ color: '#3d4a52', roughness: 0.6, metalness: 0.5 }), wx, 7.2, wz);
    box(G, 19, 0.15, 12, concrete, wx, 0.08, wz); add(boxCollider(wx, wz + 6, 10, 0.3)); add(boxCollider(wx - 10, wz, 0.3, 6)); add(boxCollider(wx + 10, wz, 0.3, 6));
    sign(G, 'ATELIER\nRÉPARATIONS', 6, 1.8, wx, 8.4, wz - 6.3, 0, '#12301f');
    for (const s of [-1, 1]) { box(G, 0.5, 4, 0.5, warn, wx + s * 3, 2, wz - 5); }
    // --- bureau (algeco) + container ---
    for (const [x, z, m, ry] of [[-58, 56, white, 0], [-52, 56, white, 0], [-60, 36, blue, Math.PI / 2], [-60, 31, blue, Math.PI / 2]]) {
      const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; G.add(c); box(c, 6, 2.7, 2.5, m, 0, 1.45, 0); box(c, 6.2, 0.15, 2.7, metal, 0, 2.85, 0);
      for (let i = -1; i <= 1; i += 2) box(c, 1, 0.9, 0.06, new THREE.MeshStandardMaterial({ color: '#7eb6c9', roughness: 0.1 }), i * 1.6, 1.7, 1.27);
      add(boxCollider(x, z, ry ? 1.3 : 3.1, ry ? 3.1 : 1.3));
    }
    sign(G, 'CARRIÈRE DU VAL\nBienvenue', 5, 1.6, -76.5, 3.6, 66, 0, '#12301f');
    // --- cabine de tir de mine ---
    const k = ZONES.kiosk; box(G, 2.4, 2.4, 2.4, warn, k.x, 1.2, k.z); box(G, 2.6, 0.15, 2.6, new THREE.MeshStandardMaterial({ color: '#333' }), k.x, 2.45, k.z);
    sign(G, 'TIR DE MINE\nSORTEZ DE LA ZONE', 2.2, 0.9, k.x, 1.5, k.z - 1.22, Math.PI, '#7a1410'); add(boxCollider(k.x, k.z, 1.3, 1.3));
    cyl(G, 0.12, 4, metal, k.x + 1.6, 2, k.z, 'y', 8); const bm = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8), new THREE.MeshStandardMaterial({ color: '#ff8a00', emissive: '#ff6a00', emissiveIntensity: 0.4 })); bm.position.set(k.x + 1.6, 4.1, k.z); G.add(bm);
    // --- poteaux d'éclairage + barrières de chantier ---
    for (const [x, z] of [[-48, 22], [-30, 22], [-10, 22], [8, 14], [8, -34], [-44, -14], [-66, 4], [-66, -40], [-30, 50], [-50, 12]]) {
      cyl(G, 0.12, 9, metal, x, 4.5, z, 'y', 8); box(G, 1.4, 0.2, 0.5, metal, x, 9.1, z);
      if (this.lamps.length % 4 === 0) { const l = new THREE.PointLight('#ffe8b0', 0, 45, 1.4); l.position.set(x, 8.8, z); G.add(l); this.lamps.push(l); }
      const hd = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.4), new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#ffe8b0', emissiveIntensity: 0 })); hd.position.set(x, 8.95, z); G.add(hd); this.lamps.push(hd);
      add(circleCollider(x, z, 0.5));
    }
    const post = new THREE.MeshStandardMaterial({ color: '#d9d9d6', roughness: 0.7 });
    for (let z = -30; z <= 30; z += 4) { box(G, 0.15, 1.0, 0.15, post, 21.5, this.t.height(21.5, z) + 0.5, z); box(G, 0.1, 0.3, 3.9, z % 8 === 0 ? red : post, 21.5, this.t.height(21.5, z) + 0.9, z + 2); }   // barrière au pied du front
    for (const [x, z, ry] of [[22, -5, Math.PI / 2], [22, 5, Math.PI / 2]]) sign(G, 'DANGER\nFRONT DE TAILLE', 3.6, 1.3, x, 1.7, z, ry, '#e8b800', '#1a1a1a');
    sign(G, 'LIMITE 20 km/h', 1.6, 1.6, -64, 2.4, 40, Math.PI / 2, '#ffffff', '#c00');
    // --- poste de repère : cônes de chantier le long de la rampe ---
    const cone = new THREE.MeshStandardMaterial({ color: '#ff6a1a', roughness: 0.6 });
    for (let i = 0; i < 10; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.7, 10), cone); c.position.set(14 + i * 6, this.t.height(14 + i * 6, -50) + 0.35, -50); G.add(c); }
    G.traverse((o) => { if (o.isMesh) { o.castShadow = o.castShadow || o.geometry.type !== 'PlaneGeometry'; o.receiveShadow = true; } });
  }
  setNight(n) { for (const l of this.lamps) { if (l.isLight) l.intensity = n > 0.35 ? 60 : 0; else l.material.emissiveIntensity = n > 0.35 ? 2 : 0; } }
  update(dt, running) { if (this.belt && running) this.belt.offset.y -= dt * 0.9; }
}

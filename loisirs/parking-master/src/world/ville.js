/* Lieu 1 : rue du centre-ville. Chaussée le long de z, bandes de stationnement en bataille à l'est, stationnement en long à l'ouest,
   façades d'immeubles texturées, vitrines, lampadaires, arbres d'alignement, passages piétons, skyline lointaine. */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { rng } from '../core/util.js';
import { box, circle } from '../gameplay/collision.js';
import { makeScene, addGround, pave, pad, paint, boundary, pole } from './common.js';
import { mat, flat, scatter, oakGeos, oakMats, parkedCars } from './kit.js';
import { T } from './textures.js';
import { makeNpcs } from './npc.js';

const PALETTE = [['#cdb89d', 'a'], ['#b8c1c9', 'b'], ['#dccfb2', 'c'], ['#a9695d', 'd'], ['#c3c7bb', 'e'], ['#8f9aa5', 'f']];
const COLORS = [0xb7bcc2, 0x1f242a, 0xc1272d, 0x2d4f8a, 0xf1f1ee, 0x3f6b4e, 0xd9a441, 0x6b4a8a];

function buildingGeo(w, h, d) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
  const floors = Math.max(2, Math.floor(h / 3.4)) / 6;
  for (let f = 0; f < 6; f++) {
    const span = f < 2 ? d : f < 4 ? 1 : w, cols = Math.max(1, Math.round(span / 3.2)) / 4;
    for (let i = f * 4; i < f * 4 + 4; i++) uv.setXY(i, uv.getX(i) * cols, uv.getY(i) * floors);
  }
  return g;
}

/* Rue du centre-ville. o : { bays: false pour une rue sans rangée de places en bataille, eastCars: [{ type, z, color }] voitures garées en long côté est, npc: { cars, peds } } */
export async function build({ renderer }, o = {}) {
  const bays = o.bays !== false, colliders = [], rand = rng(11);
  const { scene, sky } = makeScene(renderer, { elevation: 54, azimuth: 205, turbidity: 3.2, rayleigh: 1.2, exposure: 0.5, fog: 0xcad7e3, density: 0.0024, sunI: 3.4 });
  addGround(scene, { map: T.concrete(), tile: 6, color: 0xb5b1a8 });

  // chaussée, trottoirs, bandes de stationnement
  const sidewalk = T.sidewalk(), asphalt = T.asphalt();
  pad(scene, 5.5, 15, -96, 96, sidewalk, { tile: 6, y: 0.03, order: 1 });
  pad(scene, -15, -5.5, -96, 96, sidewalk, { tile: 6, y: 0.03, order: 1 });
  pave(scene, [[0, -96], [0, 96]], 11, asphalt, { uvLen: 11, y: 0.04, order: 2 });
  if (bays) pad(scene, 5.4, 10.8, -16.2, 22.2, asphalt, { tile: 11, y: 0.045, order: 3 });
  // bordures
  const curbGeo = (x, z0, z1) => new THREE.BoxGeometry(0.22, 0.16, z1 - z0).translate(x, 0.08, (z0 + z1) / 2);
  const curb = new THREE.Mesh(mergeGeometries(bays ? [curbGeo(-5.6, -96, 96), curbGeo(5.6, -96, -16.2), curbGeo(5.6, 22.2, 96), curbGeo(10.9, -16.2, 22.2)] : [curbGeo(-5.6, -96, 96), curbGeo(5.6, -96, 96)]), flat(0xa7a7a2, { rough: 0.95 }));
  curb.receiveShadow = true; curb.castShadow = true; scene.add(curb);

  // marquages : axe en pointillés, rives, passages piétons, bataille
  const dash = document.createElement('canvas'); dash.width = 16; dash.height = 64;
  { const g = dash.getContext('2d'); g.fillStyle = '#f0f0e8'; g.fillRect(0, 0, 16, 28); }
  const dashT = new THREE.CanvasTexture(dash); dashT.wrapS = dashT.wrapT = THREE.RepeatWrapping; dashT.colorSpace = THREE.SRGBColorSpace;
  pave(scene, [[0, -96], [0, 96]], 0.14, dashT, { uvLen: 6, y: 0.05, order: 5, alpha: true });
  const paintRects = [{ x: -3.3, z: 0, w: 0.12, d: 192 }, { x: 3.3, z: 0, w: 0.12, d: 192 }];
  for (const zc of [-34, 38]) for (let i = 0; i < 9; i++) paintRects.push({ x: -4.2 + i * 1.05, z: zc, w: 0.55, d: 3.2 });
  if (bays) for (let k = -4; k <= 5; k++) paintRects.push({ x: 8.1, z: 6 + 3.3 * (k - 0.5), w: 5.2, d: 0.11 });   // séparations des places de la rangée est
  paint(scene, paintRects);

  // places de la rangée est : 0 = la place cible, les autres sont occupées ou libres
  const cars = [], types = ['hatchback', 'sedan', 'coupe', 'wagon', 'sport', 'compact', 'offroad'];
  for (let k = -4; k <= 4 && bays; k++) {
    if (k === 0) continue;
    if ((k === -3 || k === 3) && rand() < 0.9) continue;       // deux places vides pour respirer
    cars.push({ type: types[Math.floor(rand() * types.length)], x: 8.1 + (rand() - 0.5) * 0.3, z: 6 + 3.3 * k + (rand() - 0.5) * 0.35, yaw: Math.PI / 2 + (rand() - 0.5) * 0.05, color: COLORS[Math.floor(rand() * COLORS.length)] });
  }
  // stationnement en long, côté ouest (voitures tournées dans le sens de circulation de leur file)
  for (let z = -86; z < 80; z += 6.4 + rand() * 5) cars.push({ type: types[Math.floor(rand() * types.length)], x: -4.35, z, yaw: (rand() - 0.5) * 0.04, color: COLORS[Math.floor(rand() * COLORS.length)] });
  for (const e of o.eastCars || []) cars.push({ type: e.type, x: 4.4, z: e.z, yaw: Math.PI, color: e.color ?? COLORS[Math.floor(rand() * COLORS.length)] });
  colliders.push(...await parkedCars(scene, cars));

  // immeubles
  const groups = PALETTE.map(() => []), roofs = [], shops = [], awnings = [];
  for (const side of [-1, 1]) {
    for (let z = -96; z < 96;) {
      const w = Math.min(96 - z, 14 + Math.floor(rand() * 5) * 2), d = 16 + Math.floor(rand() * 3) * 2, h = 3.4 * (4 + Math.floor(rand() * 6));
      const xc = side * (15 + d / 2), zc = z + w / 2, pi = Math.floor(rand() * PALETTE.length);
      groups[pi].push(buildingGeo(w, h, d).translate(xc, h / 2, zc));
      roofs.push(new THREE.BoxGeometry(w + 0.2, 0.5, d + 0.2).translate(xc, h + 0.25, zc));
      const sg = new THREE.PlaneGeometry(w - 1, 3.7); sg.rotateY(side > 0 ? -Math.PI / 2 : Math.PI / 2); sg.translate(side * 14.93, 1.85, zc);
      const u = sg.attributes.uv; for (let i = 0; i < u.count; i++) u.setX(i, u.getX(i) * (w - 1) / 16);
      shops.push(sg);
      awnings.push(new THREE.BoxGeometry(1.1, 0.12, w - 1).translate(side * 14.4, 3.7, zc));
      colliders.push(box(xc, zc, d / 2, w / 2, 0));
      z += w;
    }
  }
  PALETTE.forEach(([color, key], i) => { if (groups[i].length) { const m = new THREE.Mesh(mergeGeometries(groups[i]), mat(T.facade(color, key), { bump: 0.4, rough: 0.8 })); m.castShadow = true; m.receiveShadow = true; scene.add(m); } });
  const roof = new THREE.Mesh(mergeGeometries(roofs), mat(T.concrete(), { color: 0x8a8a86 })); roof.castShadow = true; scene.add(roof);
  scene.add(new THREE.Mesh(mergeGeometries(shops), new THREE.MeshStandardMaterial({ map: T.storefront(), roughness: 0.35, metalness: 0.1 })));
  const aw = new THREE.Mesh(mergeGeometries(awnings), flat(0x9b3a34)); aw.castShadow = true; scene.add(aw);
  // bâtiments qui ferment la rue aux deux bouts
  for (const z of [-103, 103]) { const m = new THREE.Mesh(buildingGeo(60, 30, 14).translate(0, 15, z), mat(T.facade('#b8c1c9', 'b'), { bump: 0.4 })); scene.add(m); colliders.push(box(0, z, 30, 7, 0)); }
  boundary(colliders, -15, 15, -96, 96);

  // skyline lointaine (décor, sans collision)
  const sk = [], r2 = rng(5);
  for (let i = 0; i < 46; i++) {
    const a = r2() * Math.PI * 2, rr = 120 + r2() * 120, w = 14 + r2() * 20, h = 30 + r2() * 70;
    if (Math.abs(Math.sin(a) * rr) < 40 && Math.abs(Math.cos(a) * rr) < 120) continue;
    sk.push(buildingGeo(w, h, w).translate(Math.cos(a) * rr, h / 2, Math.sin(a) * rr));
  }
  scene.add(new THREE.Mesh(mergeGeometries(sk), mat(T.facade('#9aa3ad', 'sky'), { bump: 0.2 })));

  // lampadaires, arbres d'alignement, bancs, bornes
  const lamp = mergeGeometries([pole(0.09, 6.6), new THREE.BoxGeometry(1.6, 0.1, 0.1).translate(0.7, 6.55, 0), new THREE.BoxGeometry(0.7, 0.14, 0.3).translate(1.45, 6.5, 0)].map((g) => g.index ? g.toNonIndexed() : g));
  const lampItems = [], treeItems = [], bench = [];
  for (let z = -90; z <= 90; z += 20) {
    lampItems.push({ x: -6.6, z, rot: 0 }, { x: 12.0, z: z + 6, rot: Math.PI }); colliders.push(circle(-6.6, z, 0.22), circle(12.0, z + 6, 0.22));
    treeItems.push({ x: -7.8, z: z + 9, s: 0.62 + rand() * 0.15 }, { x: 13.4, z: z + 12, s: 0.62 + rand() * 0.15 });
    colliders.push(circle(-7.8, z + 9, 0.35), circle(13.4, z + 12, 0.35));
  }
  scatter(scene, [lamp], flat(0x2c3138, { metal: 0.5, rough: 0.5 }), lampItems, { seed: 2 });
  scatter(scene, oakGeos(2), oakMats(), treeItems, { seed: 3 });
  for (let z = -70; z <= 70; z += 35) { bench.push({ x: -9.5, z, rot: Math.PI / 2 }); colliders.push(box(-9.5, z, 0.35, 0.9, 0)); }
  scatter(scene, [new THREE.BoxGeometry(0.6, 0.5, 1.8).translate(0, 0.45, 0)], mat(T.wood(), { color: 0x9a7b55 }), bench, { seed: 4 });
  const bol = []; for (let z = -92; z < 92; z += 3.6) if (!bays || z < -17 || z > 23) bol.push({ x: 5.9, z, rot: 0 });
  scatter(scene, [pole(0.09, 0.8)], flat(0x555a60, { metal: 0.4 }), bol, { seed: 6 });
  // panneaux « P » bleus
  for (const z of bays ? [-17.5, 23.5] : []) {
    const sg = new THREE.Group(); const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    g.fillStyle = '#1b4fa0'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#fff'; g.font = '700 96px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('P', 64, 70);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const post = new THREE.Mesh(pole(0.04, 2.4), flat(0x888d93, { metal: 0.6 })), face = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), new THREE.MeshStandardMaterial({ map: t, roughness: 0.5 }));
    face.position.set(-0.05, 2.1, 0); face.rotation.y = -Math.PI / 2; sg.add(post, face); sg.position.set(11.4, 0, z); scene.add(sg); colliders.push(circle(11.4, z, 0.1));
  }
  const update = await makeNpcs(scene, colliders, o.npc || {});
  return { scene, sky, colliders, update };
}

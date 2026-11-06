/* Ville 3 : parking de supermarché. Allées, rangées de places dos à dos, voitures qui cherchent une place, piétons, chariots, haies. */
import * as THREE from 'three';
import { begin, pave, pad, boundary } from '../common.js';
import { house, lamps, wallRun, signBoard } from '../parts.js';
import { mat, flat, scatter, oakGeos, oakMats } from '../kit.js';
import { T } from '../textures.js';

export async function build({ renderer, level }) {
  const ctx = begin(renderer, {
    seed: 33, bounds: [-40, 40, -31, 36], ground: { map: T.concrete(), tile: 6, color: 0xaaa79f },
    sky: { elevation: 48, azimuth: 215, turbidity: 3.5, rayleigh: 1.3, exposure: 0.5, fog: 0xcfdae5, density: 0.0022, sunI: 3.4 },
  });
  const { scene, colliders } = ctx;
  pad(scene, -40, 40, -29, 36, T.asphalt(), { tile: 10, y: 0.03, order: 1 });
  pad(scene, -40, 40, -31, -29, T.sidewalk(), { tile: 6, y: 0.04, order: 2 });

  // magasin : grand volume à toit plat, enseigne, baie vitrée
  house(scene, colliders, { x: 0, z: -38, w: 64, d: 14, h: 8, wall: '#d9d6cf', key: 'store', roof: 'flat', style: {} });
  const c = document.createElement('canvas'); c.width = 1024; c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#c4312b'; g.fillRect(0, 0, 1024, 128); g.fillStyle = '#fff'; g.font = '800 84px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SUPERMARCHÉ', 512, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(16, 2), new THREE.MeshStandardMaterial({ map: t, roughness: 0.5 })); sign.position.set(0, 6.4, -30.94); scene.add(sign);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.2), new THREE.MeshStandardMaterial({ color: 0x24394a, roughness: 0.1, metalness: 0.4 })); glass.position.set(0, 1.7, -30.95); scene.add(glass);

  // rangées de places (nez dans la place) séparées par trois allées ; la place cible est dans la rangée R3
  const sp = level.spot;
  const rows = [[-23.5, Math.PI], [-12.1, 0], [-7.1, Math.PI], [4.3, 0], [9.3, Math.PI]];
  for (const [z, yaw] of rows) ctx.bays({ x: 0, z, yaw, count: 23, pitch: 2.6, depth: 5, avoid: [[sp.x, sp.z]], fill: 0.9 });

  // éclairage, haies, arbres, chariots, panneau
  const L = []; for (let x = -32.5; x <= 32.5; x += 13) if (Math.abs(x - sp.x) > 8) L.push({ x: x + 1.3, z: -9.6, rot: 0 });
  lamps(scene, colliders, L);
  wallRun(scene, colliders, [[-40, 35.5], [30.5, 35.5]], { kind: 'hedge', h: 1.2 });
  wallRun(scene, colliders, [[40, 35.5], [40, -29]], { kind: 'hedge', h: 1.2 });
  wallRun(scene, colliders, [[-40, 35.5], [-40, -29]], { kind: 'hedge', h: 1.2 });
  const trees = []; for (let x = -36; x <= 36; x += 9) trees.push({ x, z: 33.4, s: 0.7 + ctx.rand() * 0.2 });
  scatter(scene, oakGeos(2), oakMats(), trees, { seed: 5 });
  for (const tr of trees) colliders.push({ k: 'circle', x: tr.x, z: tr.z, r: 0.35 });
  signBoard(scene, colliders, { x: 28.8, z: 30, yaw: Math.PI / 2, text: 'Parking', w: 1.4, h: 0.5, font: 56, bg: '#1b4fa0' });
  const cartGeo = new THREE.BoxGeometry(0.62, 0.9, 1.0).translate(0, 0.55, 0), carts = [[-20, -2.2], [-5, 14], [22, 14.6], [-27, -19], [14, -19.4]];
  scatter(scene, [cartGeo], flat(0x9aa3ad, { metal: 0.6, rough: 0.5 }), carts.map(([x, z]) => ({ x, z, rot: ctx.rand() * 3 })), { seed: 6 });
  for (const [x, z] of carts) colliders.push({ k: 'circle', x, z, r: 0.5 });

  return ctx.finish({
    cars: [
      { type: 'hatchback', closed: true, path: [[-30, -17.8], [30, -17.8], [32.5, -15.3], [32.5, 12.5], [30, 15], [-30, 15], [-32.5, 12.5], [-32.5, -15.3]], speed: 3.2, start: 0.1, color: 0xd9a441 },
      { type: 'sedan', closed: true, path: [[-30, -17.8], [30, -17.8], [32.5, -15.3], [32.5, 12.5], [30, 15], [-30, 15], [-32.5, 12.5], [-32.5, -15.3]], speed: 3.0, start: 0.6, color: 0x3f6b4e },
    ],
    peds: [
      { path: [[-26, -20], [-6, -20]], speed: 1.1, start: 0.3 }, { path: [[8, -19.5], [28, -19.5]], speed: 1.0, start: 0.7 },
      { path: [[-30, 13.5], [-8, 13.5]], speed: 1.2, start: 0.1 }, { path: [[-34, -3], [-20, -3]], speed: 1.1, start: 0.5 },
      { path: [[-15, -29.8], [18, -29.8]], speed: 1.3, start: 0.4 },
    ],
  });
}

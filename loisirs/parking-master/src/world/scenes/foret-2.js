/* Forêt 2 : le camping. Boucle de terre autour d'un feu de camp, emplacements avec caravanes, tentes et camping-cars entre les pins, campeurs, voiture qui fait le tour. */
import * as THREE from 'three';
import { begin, pave, pad } from '../common.js';
import { landscape } from '../landscape.js';
import { caravan, tent, logStack } from '../parts.js';
import { mat, flat, scatter, rockGeos, rockMat, scaleUV } from '../kit.js';
import { box, circle } from '../../gameplay/collision.js';
import { T } from '../textures.js';

const ring = (r, n = 18) => { const p = []; for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2; p.push([Math.sin(a) * r, Math.cos(a) * r]); } return p; };

export async function build({ renderer, level }) {
  const ctx = begin(renderer, { seed: 72, bounds: [-40, 40, -40, 62], sky: { elevation: 36, azimuth: 150, turbidity: 6, rayleigh: 1.7, mie: 0.009, exposure: 0.5, fog: 0xaebfb6, density: 0.0095, sun: 0xfff0cf, sunI: 2.8, hemi: [0xcfe6d6, 0x4a4a2c, 0.85] } });
  const { scene, colliders, rand } = ctx, sp = level.spot;
  const entry = [[0, 90], [0, 24], [0, 17]], r1 = ring(16.5), r2 = ring(27, 24);
  landscape(ctx, { kind: 'forest', seed: 31, shapes: [{ path: entry, w: 3 }, { path: r1, w: 6 }, { path: r2, w: 5 }, { rect: [-8, 8, -8, 8] }], collide: [-40, 40, -40, 64], cz: 10 });
  pave(scene, entry, 5.2, T.dirtRoad(), { uvLen: 8, y: 0.035, order: 2, alpha: true });
  pave(scene, r1, 6.0, T.dirtRoad(), { uvLen: 8, y: 0.036, order: 2, alpha: true });
  pad(scene, -12, 12, -12, 12, T.dirt(), { tile: 5, y: 0.04, order: 3, color: 0xb59e80 });
  // feu de camp : pierres, braises, flamme, bancs en troncs
  const stones = []; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; stones.push({ x: Math.sin(a) * 0.9, z: Math.cos(a) * 0.9, s: 0.22 + rand() * 0.08, y: 0 }); }
  scatter(scene, rockGeos(2), rockMat(0xb8b0a4), stones, { seed: 8 });
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.2, 8).translate(0, 0.6, 0), new THREE.MeshBasicMaterial({ color: 0xff8a2a, toneMapped: false })); scene.add(flame);
  const light = new THREE.PointLight(0xff9a40, 6, 12, 2); light.position.set(0, 1, 0); scene.add(light);
  colliders.push(circle(0, 0, 1.3));
  for (const a of [0.6, 2.1, 3.7, 5.1]) logStack(scene, colliders, { x: Math.sin(a) * 3.4, z: Math.cos(a) * 3.4, yaw: a, len: 2.2, cols: 1, rows: 1, r: 0.3 });
  // emplacements autour de la deuxième boucle ; la place cible est à l'est, entre une caravane et un pin
  const place = (a, rr) => [Math.sin(a) * rr, Math.cos(a) * rr];
  for (const [a, kind] of [[2.35, 'car'], [2.9, 'tent'], [3.5, 'car'], [4.1, 'tent'], [4.75, 'car'], [5.35, 'tent'], [5.9, 'car'], [0.55, 'tent'], [1.0, 'car']]) {
    const [x, z] = place(a, 29.5);
    if (kind === 'car') caravan(scene, colliders, { x, z, yaw: a + Math.PI, color: [0xf0f0ec, 0xe8e2cf][Math.round(rand())], stripe: [0x2e6aa8, 0xb83a2a, 0x2f7a3a][Math.floor(rand() * 3)] });
    else tent(scene, colliders, { x, z, yaw: a, color: [0xd9812b, 0x2f7a9a, 0x9a3a4a, 0x6b8a3a][Math.floor(rand() * 4)] });
  }
  ctx.car('minivan', ...place(2.0, 29.5), 2.0 + Math.PI, 0xf4f4f0);
  caravan(scene, colliders, { x: sp.x, z: sp.z + sp.wid / 2 + 0.55 + 1.2, yaw: Math.PI / 2, color: 0xf0f0ec, stripe: 0xb83a2a });
  colliders.push(circle(sp.x, sp.z - sp.wid / 2 - 0.6, 0.55));
  const table = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.75, 0.8).translate(0, 0.38, 0), mat(T.wood(), { color: 0x9b7a55 })); table.position.set(sp.x + 1.2, 0, sp.z - sp.wid / 2 - 3.0); table.castShadow = true; scene.add(table); colliders.push(box(sp.x + 1.2, sp.z - sp.wid / 2 - 3.0, 1.0, 0.5, 0));
  const lp = ring(14.2); lp.pop();
  return ctx.finish({
    cars: [{ type: 'sedan', closed: true, path: lp.reverse(), speed: 2.4, start: 0.3, color: 0x3f6b4e }],
    peds: [{ path: [[-6, -4], [6, -4]], speed: 0.9, start: 0.3 }, { path: [[-3, 7], [4, 6]], speed: 1.0, start: 0.7 }, { path: [[22, -9], [22, -22]], speed: 1.0, start: 0.5 }, { path: [[-22, 8], [-22, 20]], speed: 0.9, start: 0.2 }],
  });
}

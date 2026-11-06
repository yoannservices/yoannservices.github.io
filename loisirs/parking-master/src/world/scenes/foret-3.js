/* Forêt 3 : la scierie. Cour de terre battue, grosses piles de grumes qui forment des couloirs, hangar à scie, chariots élévateurs, ouvriers, pick-up qui fait le tour. */
import * as THREE from 'three';
import { begin, pave, pad } from '../common.js';
import { landscape } from '../landscape.js';
import { house, logStack, tractor } from '../parts.js';
import { mat, flat, scatter, scaleUV } from '../kit.js';
import { box, circle } from '../../gameplay/collision.js';
import { T } from '../textures.js';

export async function build({ renderer, level }) {
  const ctx = begin(renderer, { seed: 73, bounds: [-30, 30, -34, 62], sky: { elevation: 38, azimuth: 140, turbidity: 5.8, rayleigh: 1.6, mie: 0.008, exposure: 0.5, fog: 0xb4c1b6, density: 0.0085, sun: 0xfff0cf, sunI: 2.9, hemi: [0xcfe6d6, 0x4a4a2c, 0.85] } });
  const { scene, colliders, rand } = ctx, sp = level.spot;
  const road = [[-4, 90], [-6, 44], [-6, 26]];
  landscape(ctx, { kind: 'forest', seed: 32, shapes: [{ rect: [-26, 26, -32, 24] }, { path: road, w: 3 }], collide: [-30, 30, -34, 64], cz: 10 });
  pave(scene, road, 5.4, T.dirtRoad(), { uvLen: 8, y: 0.035, order: 2, alpha: true });
  pad(scene, -25, 25, -22, 24, T.dirt(), { tile: 5, y: 0.04, order: 3, color: 0xb09878 });
  // hangar de la scie au nord
  house(scene, colliders, { x: 0, z: -29, w: 34, d: 12, h: 6.4, yaw: 0, wall: '#a98a64', key: 'saw', style: { logs: true }, roof: 'tin', rise: 2.4, door: 5 });
  // la place : couloir de 3,4 m entre deux piles de grumes, planches empilées au fond
  const w = 2.3;
  logStack(scene, colliders, { x: sp.x - sp.wid / 2 - 0.15 - w, z: sp.z, yaw: 0, len: 7.4, cols: 7, rows: 5 });
  logStack(scene, colliders, { x: sp.x + sp.wid / 2 + 0.15 + w, z: sp.z, yaw: 0, len: 7.4, cols: 7, rows: 5 });
  const boards = new THREE.Mesh(scaleUV(new THREE.BoxGeometry(sp.wid + 0.2, 2.2, 1.4).translate(0, 1.1, 0), 3, 1), mat(T.plank(), { color: 0xd9c9a0 })); boards.position.set(sp.x, 0, sp.z - sp.len / 2 - 0.9); boards.castShadow = true; scene.add(boards);
  colliders.push(box(sp.x, sp.z - sp.len / 2 - 0.9, (sp.wid + 0.2) / 2, 0.7, 0));
  // autres piles, chariots élévateurs, tas de sciure
  for (const [x, z, yaw, len] of [[-16, -12, Math.PI / 2, 8], [-18, -4, Math.PI / 2, 6], [18, -3, Math.PI / 2, 6], [-6, -14, Math.PI / 2, 5], [21, -16, Math.PI / 2, 7]]) logStack(scene, colliders, { x, z, yaw, len, cols: 5, rows: 4 });
  tractor(scene, colliders, { x: -3, z: -18, yaw: 0.5, color: 0xe0b020 }); tractor(scene, colliders, { x: -12, z: 0.5, yaw: 1.2, color: 0xe0b020 });
  const chips = [[-22, 10], [22, 0]]; const heap = new THREE.ConeGeometry(2.2, 1.6, 12).translate(0, 0.8, 0);
  scatter(scene, [heap], mat(T.dirt(), { color: 0xd9b27a, rough: 1 }), chips.map(([x, z]) => ({ x, z, rot: 0 })), { seed: 9 }); for (const [x, z] of chips) colliders.push(circle(x, z, 2.0));
  const loop = [[-21, 19], [21, 19], [23, 16], [23, 10], [21, 8], [-21, 8], [-23, 10], [-23, 16]];
  return ctx.finish({
    cars: [{ type: 'pickup', closed: true, path: loop, speed: 2.8, start: 0.35, color: 0xf0f0ec }],
    peds: [{ path: [[-18, -10], [-18, 12]], speed: 1.0, start: 0.2, tint: 0xf2c230 }, { path: [[12, 12], [12, 2]], speed: 0.9, start: 0.6, tint: 0xf2c230 }, { path: [[-12, -22], [12, -22]], speed: 1.1, start: 0.4, tint: 0xf2c230 }, { path: [[0, 20], [10, 20]], speed: 1.0, start: 0.1 }],
  });
}

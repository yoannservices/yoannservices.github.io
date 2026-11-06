/* Forêt 4 : le chalet. Allée de gravier en lacets entre les pins, chalet en rondins, mur de pierre, tas de bois ; la place est contre la façade, entre un tas de bois et un pick-up. */
import * as THREE from 'three';
import { begin, pave, pad } from '../common.js';
import { landscape } from '../landscape.js';
import { house, wallRun, logStack, signBoard, bollards } from '../parts.js';
import { mat, flat, scatter, bushGeos, bushMat } from '../kit.js';
import { circle } from '../../gameplay/collision.js';
import { T } from '../textures.js';

export async function build({ renderer, level }) {
  const ctx = begin(renderer, { seed: 74, bounds: [-26, 26, -22, 62], sky: { elevation: 33, azimuth: 160, turbidity: 6, rayleigh: 1.7, mie: 0.009, exposure: 0.5, fog: 0xaebfb6, density: 0.01, sun: 0xfff0cf, sunI: 2.8, hemi: [0xcfe6d6, 0x4a4a2c, 0.85] } });
  const { scene, colliders, rand } = ctx, sp = level.spot;
  const drive = [[16, 90], [16, 52], [16, 44], [12, 30], [6, 20], [1, 10], [-4, 2], [-6, -3]];
  landscape(ctx, { kind: 'forest', seed: 33, shapes: [{ path: drive, w: 3 }, { rect: [-14, 8, -10, 6] }], collide: [-26, 26, -22, 64], cz: 12 });
  pave(scene, drive, 4.6, T.gravel(), { uvLen: 6, y: 0.036, order: 2, color: 0xcfc6b2 });
  pad(scene, -13, 8, -10, 6, T.gravel(), { tile: 6, y: 0.04, order: 3, color: 0xcfc6b2 });
  // chalet en rondins, appentis, mur de pierre autour du jardin
  house(scene, colliders, { x: -6, z: -14.5, w: 13, d: 9, h: 3.8, yaw: 0, wall: '#8a5a34', key: 'chal', style: { logs: true, shutters: '#2f5f3a' }, roof: 'tile', rise: 3.4, door: 1.2 });
  house(scene, colliders, { x: 6.5, z: -13.2, w: 7, d: 3.6, h: 2.6, yaw: 0, wall: '#7a5230', key: 'shed', style: { logs: true }, roof: 'tin', rise: 0.9 });
  wallRun(scene, colliders, [[-14, -9], [-14, 0], [-14, 6]], { kind: 'stone', h: 1.0, t: 0.45 });
  wallRun(scene, colliders, [[11, -9], [11, 6]], { kind: 'stone', h: 1.0, t: 0.45 });
  // la place : entre un tas de bois (à gauche) et un pick-up garé (à droite), nez vers la façade
  logStack(scene, colliders, { x: sp.x - sp.wid / 2 - 0.3 - 1.3, z: sp.z, yaw: 0, len: 3.8, cols: 4, rows: 3 });
  ctx.car('pickup', sp.x + sp.wid / 2 + 0.3 + 1.04, sp.z, Math.PI, 0x8a3a2a);
  logStack(scene, colliders, { x: 6.5, z: -10.6, yaw: Math.PI / 2, len: 3.6, cols: 3, rows: 3 });
  // jardinières, panneau, bornes, buissons
  const tubs = [[-1.2, -3], [0.8, -9.2], [-11.8, -4]]; scatter(scene, [new THREE.CylinderGeometry(0.42, 0.34, 0.6, 12).translate(0, 0.3, 0)], mat(T.wood(), { color: 0x8a6240 }), tubs.map(([x, z]) => ({ x, z, rot: 0 })), { seed: 3 });
  for (const [x, z] of tubs) colliders.push(circle(x, z, 0.45));
  signBoard(scene, colliders, { x: 9.5, z: 3.5, yaw: -Math.PI / 2, text: 'Chalet', w: 1.1, h: 0.4, y: 1.6, font: 56, bg: '#4a3220' });
  bollards(scene, colliders, [[-12.6, 6.6], [-9, 6.8], [9.4, 6.6]]);
  const bush = []; for (let i = 0; i < 14; i++) bush.push({ x: -13 + rand() * 24, z: -8 + rand() * 4 - 6.5, s: 0.7 + rand() * 0.5, tint: 0xa8c488 }); scatter(scene, bushGeos(), bushMat(), bush.filter((b) => b.z < -12 || b.x < -12), { seed: 4 });
  return ctx.finish({ peds: [{ path: [[-11, -6.5], [-11, 3]], speed: 0.9, start: 0.3 }, { path: [[-1, -7.3], [4, -7.3]], speed: 0.7, start: 0.6 }] });
}

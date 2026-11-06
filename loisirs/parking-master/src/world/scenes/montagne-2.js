/* Montagne 2 : la station de ski. Parking enneigé, rangées de places séparées par des congères, chalets, gare du télésiège, skieurs, voitures qui cherchent une place. */
import * as THREE from 'three';
import { begin, pave, pad } from '../common.js';
import { landscape } from '../landscape.js';
import { house, lamps, bankRun, signBoard } from '../parts.js';
import { mat, flat, scatter, scaleUV } from '../kit.js';
import { box, circle } from '../../gameplay/collision.js';
import { pole } from '../kit.js';
import { T } from '../textures.js';

export async function build({ renderer, level }) {
  const ctx = begin(renderer, { seed: 82, bounds: [-33, 33, -31, 76], sky: { elevation: 34, azimuth: 175, turbidity: 2.2, rayleigh: 1.0, mie: 0.003, mieG: 0.85, exposure: 0.55, fog: 0xcfe0f0, density: 0.0014, sun: 0xfff6e8, sunI: 3.5, hemi: [0xcfe4ff, 0x77777c, 0.95], envI: 0.7 } });
  const { scene, colliders, rand } = ctx, sp = level.spot;
  const road = [[24, 100], [24, 50], [24, 24]];
  landscape(ctx, { kind: 'alpine', snow: 0.95, seed: 41, shapes: [{ rect: [-32, 32, -30, 24] }, { path: road, w: 3 }], collide: [-33, 33, -31, 78], cz: 20 });
  const snowPad = T.snow();
  pad(scene, -31, 31, -29, 26, snowPad, { tile: 8, y: 0.03, order: 1, color: 0xe9eef7 });
  pave(scene, road, 5.6, snowPad, { uvLen: 8, y: 0.032, order: 1, color: 0xdfe6f2 });
  // rangées de places (nez dans la place) : R1 contre les congères du fond, R2/R3 dos à dos, R3 contient la place
  for (const [z, yaw] of [[-12, Math.PI], [-1, 0], [4, Math.PI]]) ctx.bays({ x: 0, z, yaw, count: 22, pitch: 2.7, depth: 5, avoid: [[sp.x, sp.z]], fill: 0.9, paintLines: false, types: ['suv', 'wagon', 'sedan', 'hatchback', 'minivan', 'offroad', 'sport'] });
  bankRun(scene, colliders, [[-30, -15.4], [30, -15.4]], { w: 2.2, h: 1.1 });
  bankRun(scene, colliders, [[-30, 14.8], [18, 14.8]], { w: 1.8, h: 0.9 });
  bankRun(scene, colliders, [[-30, -15], [-30, 15]], { w: 2.0, h: 1.0 });
  // chalets, gare du télésiège, mobilier
  for (const [x, w] of [[-16, 14], [-1, 12], [12, 14]]) house(scene, colliders, { x, z: -23, w, d: 8, h: 6.4, yaw: 0, wall: '#8a5a34', key: 'chal2', style: { logs: true, shutters: '#a33a2a' }, roof: 'snow', rise: 2.8, door: 1.2 });
  house(scene, colliders, { x: -24, z: -22, w: 12, d: 9, h: 8, yaw: Math.PI / 2, wall: '#6a6f76', key: 'lift', style: { stone: true }, roof: 'snow', rise: 1.8 });
  const pyl = new THREE.Mesh(pole(0.45, 15), flat(0x7a8088, { metal: 0.5 })); pyl.position.set(-24, 0, -40); pyl.castShadow = true; scene.add(pyl);
  lamps(scene, colliders, [{ x: -22, z: 1.5, rot: 0 }, { x: 0, z: 1.5, rot: 0 }, { x: 22, z: 1.5, rot: Math.PI }].filter((l) => Math.abs(l.x - sp.x) > 5));
  signBoard(scene, colliders, { x: 28.8, z: 28, yaw: Math.PI / 2, text: 'Parking P1', w: 1.5, h: 0.5, font: 52, bg: '#1b4fa0' });
  const racks = [[-8, -17.5], [4, -17.5], [16, -17.5]]; scatter(scene, [new THREE.BoxGeometry(2.2, 1.0, 0.5).translate(0, 0.5, 0)], flat(0x3a4048, { metal: 0.4 }), racks.map(([x, z]) => ({ x, z, rot: 0 })), { seed: 3 }); for (const [x, z] of racks) colliders.push(box(x, z, 1.1, 0.3, 0));
  const loop = [[26, -8.4], [-26, -8.4], [-28, -6], [-28, 9], [-26, 11.3], [26, 11.3], [28, 9], [28, -6]];
  return ctx.finish({
    cars: [{ type: 'sedan', closed: true, path: loop, speed: 2.7, start: 0.2, color: 0x2a2f36 }, { type: 'suv', closed: true, path: loop, speed: 2.5, start: 0.7, color: 0xb8352a }],
    peds: [{ path: [[-26, -18], [26, -18]], speed: 1.1, start: 0.3, tint: 0xe03a3a }, { path: [[-27, -12], [-27, 12]], speed: 1.0, start: 0.6, tint: 0x2f6aa8 }, { path: [[20, -12], [20, -5]], speed: 1.0, start: 0.5, tint: 0xf2c230 }, { path: [[-14, 16.5], [14, 16.5]], speed: 1.2, start: 0.2, tint: 0x3f8a4f }, { path: [[5, -17], [-6, -17]], speed: 0.9, start: 0.4, tint: 0xd9a066 }],
  });
}

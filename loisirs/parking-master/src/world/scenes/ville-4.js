/* Ville 4 : parking souterrain. Plafond bas, piliers, rangées dos à dos, voiture qui tourne dans les allées, piétons ; la place est serrée par un pilier. */
import { begin } from '../common.js';
import { garageShell } from '../garage.js';
import { signBoard } from '../parts.js';

export async function build({ renderer, level }) {
  const ctx = begin(renderer, { seed: 44, indoor: { ceiling: 2.7 } });
  const sp = level.spot, XS = [-24.7, -16.9, -9.1, -1.3, 6.5, 14.3, 22.1];
  const pillars = []; for (const x of XS) pillars.push([x, 0], [x, 11.3], [x, -11.3]);
  garageShell(ctx, { x0: -28, x1: 28, z0: -17, z1: 17, h: 2.7, pillars, lightRows: [-8, 0, 8], exits: [{ x: -27.7, z: 8, yaw: Math.PI / 2 }, { x: 27.7, z: -8, yaw: -Math.PI / 2 }] });
  // quatre rangées de places : nord (nez vers le mur), deux dos à dos au milieu, sud
  for (const [z, yaw] of [[-13.5, Math.PI], [-2.5, 0], [2.5, Math.PI], [13.5, 0]]) ctx.bays({ x: 0, z, yaw, count: 21, pitch: 2.6, depth: 5, avoid: [[sp.x, sp.z]], fill: 0.92 });
  signBoard(ctx.scene, ctx.colliders, { x: 26.6, z: 12, yaw: -Math.PI / 2, text: 'B-1', w: 0.9, h: 0.5, y: 1.6, font: 70, bg: '#2a2f36' });
  const loop = [[-24, -6.6], [24, -6.6], [25.5, -4], [25.5, 4], [24, 6.6], [-24, 6.6], [-25.5, 4], [-25.5, -4]];
  return ctx.finish({
    cars: [{ type: 'hatchback', closed: true, path: loop, speed: 2.6, start: 0.35, color: 0xd9a441 }, { type: 'sport', closed: true, path: loop, speed: 2.4, start: 0.85, color: 0xc1272d }],
    peds: [{ path: [[-20, -5.45], [-4, -5.45]], speed: 1.0, start: 0.2 }, { path: [[27.2, -8], [27.2, 9]], speed: 1.1, start: 0.6 }],
  });
}

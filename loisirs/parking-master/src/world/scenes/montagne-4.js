/* Montagne 4 : le village alpin. Ruelle enneigée de 5,4 m entre des chalets à balcons, fontaine, tas de bois ; la place est une niche entre deux chalets. */
import * as THREE from 'three';
import { begin, pave } from '../common.js';
import { landscape } from '../landscape.js';
import { house, lamps, logStack, bankRun, wallRun } from '../parts.js';
import { mat, flat, scatter, scaleUV } from '../kit.js';
import { box, circle } from '../../gameplay/collision.js';
import { T } from '../textures.js';

export async function build({ renderer, level }) {
  const ctx = begin(renderer, { seed: 84, bounds: [-16, 16, -22, 60], sky: { elevation: 32, azimuth: 160, turbidity: 2.3, rayleigh: 1.0, mie: 0.003, mieG: 0.85, exposure: 0.55, fog: 0xcfe0f0, density: 0.0016, sun: 0xfff6e8, sunI: 3.4, hemi: [0xcfe4ff, 0x77777c, 0.95], envI: 0.7 } });
  const { scene, colliders, rand } = ctx, sp = level.spot, snow = T.snow();
  const lane = [[0, 120], [0, 50], [0, -18]];
  landscape(ctx, { kind: 'alpine', snow: 0.95, seed: 43, shapes: [{ path: lane, w: 5 }, { rect: [-12, 12, -22, 22] }], collide: [-16, 16, -22, 62], cz: 20 });
  pave(scene, lane, 5.4, snow, { uvLen: 8, y: 0.035, order: 2, color: 0xe3e9f4 });
  // chalets de chaque côté (faîtage le long de la rue), sauf à la niche de la place (côté est) ; un chalet ferme le bout de la rue
  const chalet = (x, z, w, yaw, h = 6.8) => house(scene, colliders, { x, z, w, d: 9, h, yaw, wall: ['#8a5a34', '#7a4e2a', '#9a6a3c'][Math.abs(z | 0) % 3], key: 'chal4' + (Math.abs(z | 0) % 3), style: { logs: true, shutters: ['#a33a2a', '#2f5f3a', '#2f4f7a'][Math.abs(z | 0) % 3] }, roof: 'snow', rise: 2.9, door: 1.1 });
  for (const [zs, zn] of [[-18, -6], [-6, 8], [8, 22], [22, 34], [34, 46], [46, 60]]) chalet(-7.4, (zs + zn) / 2, zn - zs, Math.PI / 2);
  const nz0 = sp.z - sp.wid / 2 - 0.35, nz1 = sp.z + sp.wid / 2 + 0.35;
  for (const [zs, zn] of [[-18, nz0], [nz1, 22], [22, 34], [34, 46], [46, 60]].filter(([a, b]) => b - a > 3)) chalet(7.4, (zs + zn) / 2, zn - zs, -Math.PI / 2, 7.4);
  chalet(0, -22.5, 14, 0);
  // fond de la niche : mur de pierre ; tas de bois et auge à côté
  wallRun(scene, colliders, [[sp.x + sp.len / 2 + 0.35, nz0 - 0.2], [sp.x + sp.len / 2 + 0.35, nz1 + 0.2]], { kind: 'stone', h: 1.4, t: 0.5 });
  logStack(scene, colliders, { x: sp.x + sp.len / 2 + 1.4, z: nz1 + 0.2, yaw: 0, len: 1.8, cols: 3, rows: 3 });
  // lampadaires, congères
  lamps(scene, colliders, [{ x: -2.9, z: 36, rot: 0 }, { x: 2.9, z: 10, rot: Math.PI }, { x: -2.9, z: -6, rot: 0 }]);
  bankRun(scene, colliders, [[-3.0, 54], [-3.0, 44]], { w: 1.2, h: 0.7 });
  return ctx.finish({ peds: [{ path: [[1.9, 38], [1.9, 14]], speed: 0.9, start: 0.3, tint: 0xe03a3a }, { path: [[-1.9, 30], [-1.9, 8]], speed: 1.0, start: 0.6, tint: 0x2f6aa8 }, { path: [[1.9, 2], [1.9, -14]], speed: 0.8, start: 0.5, tint: 0xf2c230 }] });
}

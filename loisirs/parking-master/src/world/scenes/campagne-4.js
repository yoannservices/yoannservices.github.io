/* Campagne 4 : le chemin creux. Chemin de 4,7 m entre deux murs de pierre ; la place est une niche taillée dans le mur de droite (2,75 m de large). */
import * as THREE from 'three';
import { begin, pave } from '../common.js';
import { curve } from '../kit.js';
import { landscape } from '../landscape.js';
import { house, wallRun, offsetPath, logStack } from '../parts.js';
import { mat, scatter, oakGeos, oakMats } from '../kit.js';
import { T } from '../textures.js';

export async function build({ renderer, level }) {
  const ctx = begin(renderer, { seed: 64, bounds: [-24, 24, -14, 64], sky: { elevation: 38, azimuth: 140, turbidity: 4.6, rayleigh: 1.5, exposure: 0.5, fog: 0xd9ddcf, density: 0.0034, sun: 0xffe8c4, sunI: 3.3 } });
  const { scene, colliders, rand } = ctx, sp = level.spot;
  const lane = [[-3, 70], [-3, 40], [0, 28], [0, 6], [0, -8]];
  const smooth = curve(lane).getSpacedPoints(48).map((p) => [p.x, p.z]);   // les murs suivent la courbe du chemin, pas la ligne brisée
  landscape(ctx, { kind: 'farm', seed: 24, shapes: [{ path: lane, w: 5 }, { rect: [-3, 9, 1.5, 8] }], collide: [-24, 24, -14, 66], cz: 20 });
  pave(scene, lane, 4.7, T.dirtRoad(), { uvLen: 7, y: 0.035, order: 2, alpha: true });
  // murs de pierre de part et d'autre (interrompus par la niche), niche à trois murs
  wallRun(scene, colliders, offsetPath(smooth.filter((p) => p[1] > 5.9), 2.35), { h: 1.3, t: 0.45, kind: 'stone' });
  wallRun(scene, colliders, offsetPath(smooth.filter((p) => p[1] <= 5.9), 2.35), { h: 1.3, t: 0.45, kind: 'stone' });
  wallRun(scene, colliders, offsetPath(smooth.filter((p) => p[1] > 6.3), -2.35), { h: 1.3, t: 0.45, kind: 'stone' });
  wallRun(scene, colliders, offsetPath(smooth.filter((p) => p[1] < 2.8), -2.35), { h: 1.3, t: 0.45, kind: 'stone' });
  wallRun(scene, colliders, [[2.35, 6.15], [7.9, 6.15], [7.9, 2.95], [2.35, 2.95]], { h: 1.3, t: 0.45, kind: 'stone' });
  // haies derrière les murs, arbres, ferme au bout du chemin
  const hedge = []; for (let z = 64; z > -8; z -= 2.6) { const x = z > 40 ? -3 : z > 28 ? -3 + (40 - z) / 4 : 0; hedge.push({ x: x - 3.3, z, s: 1.2 + rand() * 0.4, sy: 1.5, tint: 0xa8c488 }, ...(Math.abs(z - 4.5) > 4 ? [{ x: x + 3.3, z, s: 1.2 + rand() * 0.4, sy: 1.5, tint: 0xa8c488 }] : [])); }
  const trees = []; for (let z = 62; z > -6; z -= 8.5) { const x = z > 40 ? -3 : z > 28 ? -3 + (40 - z) / 4 : 0; trees.push({ x: x - 4.4 - rand(), z, s: 1.1 + rand() * 0.3 }); if (Math.abs(z - 4.5) > 5) trees.push({ x: x + 4.4 + rand(), z: z + 3, s: 1.1 + rand() * 0.3 }); }
  scatter(scene, oakGeos(3), oakMats(), trees, { seed: 4 });
  house(scene, colliders, { x: 0, z: -13, w: 18, d: 9, h: 6.6, yaw: 0, wall: '#d6c8a8', key: 'cc', style: { stone: true, shutters: '#4a6b4a' }, roof: 'tile', door: 1.2 });
  logStack(scene, colliders, { x: -1.4, z: -6.3, yaw: Math.PI / 2, len: 2.2, cols: 2, rows: 2 });
  return ctx.finish({ peds: [{ path: [[-1.0, -5.2], [1.0, -5.2]], speed: 0.6, start: 0.4 }] });
}

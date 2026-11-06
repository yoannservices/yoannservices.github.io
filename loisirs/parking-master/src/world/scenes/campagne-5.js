/* Campagne 5 : le vide-grenier. Un pré rempli de voitures garées en épi (45°), étals, visiteurs qui flânent, deux voitures qui font le tour du champ. */
import * as THREE from 'three';
import { begin, pave } from '../common.js';
import { landscape } from '../landscape.js';
import { stall, wallRun, tent, lamps } from '../parts.js';
import { mat, scatter, oakGeos, oakMats } from '../kit.js';
import { T } from '../textures.js';

export async function build({ renderer, level }) {
  const ctx = begin(renderer, { seed: 65, bounds: [-41, 41, -30, 80], sky: { elevation: 44, azimuth: 165, turbidity: 3.8, rayleigh: 1.4, exposure: 0.52, fog: 0xd6dccf, density: 0.0028, sun: 0xfff0d2, sunI: 3.5 } });
  const { scene, colliders, rand } = ctx, sp = level.spot;
  const lane = [[-30, 85], [-30, 34]];
  landscape(ctx, { kind: 'farm', seed: 25, shapes: [{ rect: [-42, 42, -32, 34] }, { path: lane, w: 5 }], collide: [-44, 44, -32, 86], cz: 10 });
  pave(scene, lane, 5.5, T.dirtRoad(), { uvLen: 8, y: 0.035, order: 2, alpha: true });
  // rangées en épi : même cap pour toutes ; le trait du bord de chaque place est une ligne d'herbe foulée (aucune peinture)
  const YAW = Math.PI - 0.7;
  for (const z of [-19, -8, 3, 14]) ctx.bays({ x: 0, z, yaw: YAW, count: 14, pitch: 3.4, depth: 5.2, avoid: [[sp.x, sp.z]], fill: 0.88, paintLines: false, lineYaw: 0 });
  // étals et tentes au nord, haies autour du pré (ouverture au sud-ouest)
  for (let i = 0; i < 7; i++) stall(scene, colliders, { x: -24 + i * 8, z: -26.5, c1: ['#c4452f', '#2f6aa8', '#3f8a4f', '#d49a3a'][i % 4] });
  for (const [x, z, c] of [[30, 20, 0xd9812b], [34, 25, 0x2f7a9a], [27, 26, 0x9a3a4a]]) tent(scene, colliders, { x, z, color: c, yaw: rand() * 3 });
  wallRun(scene, colliders, [[-41, 33], [-41, -30], [41, -30], [41, 33], [-27.5, 33]], { kind: 'hedge', h: 1.5 });
  wallRun(scene, colliders, [[-41, 33], [-32.5, 33]], { kind: 'hedge', h: 1.5 });
  const trees = [[-38, -5], [-38, 15], [38, 0], [38, 18], [0, -29], [-20, -29], [20, -29]].map(([x, z]) => ({ x, z, s: 1.0 }));
  scatter(scene, oakGeos(3), oakMats(), trees, { seed: 4 }); for (const t of trees) colliders.push({ k: 'circle', x: t.x, z: t.z, r: 0.45 });
  const loop = [[-34, -23], [34, -23], [37, -20], [37, 28], [34, 31], [-26, 31], [-36, 28], [-37, -20]];
  return ctx.finish({
    cars: [{ type: 'wagon', closed: true, path: loop, speed: 3.0, start: 0.15, color: 0xc7c7c0 }, { type: 'hatchback', closed: true, path: loop, speed: 2.8, start: 0.6, color: 0xb8352a }],
    peds: [{ path: [[-30, 6], [-8, 6]], speed: 1.0, start: 0.2 }, { path: [[4, -13.5], [30, -13.5]], speed: 1.1, start: 0.6 }, { path: [[-26, -24], [26, -24]], speed: 1.2, start: 0.3 }, { path: [[-34, 9], [-34, -14]], speed: 0.9, start: 0.5 }, { path: [[26, 8.5], [26, -2]], speed: 1.0, start: 0.1 }, { path: [[-12, 8.8], [14, 8.8]], speed: 1.1, start: 0.7 }],
  });
}

/* Ville 5 : la cour du vieux quartier. Ruelle pavée de 4,8 m entre des maisons, porche de 3,6 m, cour intérieure aux places serrées. */
import * as THREE from 'three';
import { begin, pad } from '../common.js';
import { house, lamps, signBoard } from '../parts.js';
import { mat, flat, scatter, oakGeos, oakMats, pole } from '../kit.js';
import { T } from '../textures.js';

const WALLS = ['#d9c9a8', '#c9b79c', '#e0d2b4', '#b9a58a', '#d6c4a0'];
export async function build({ renderer, level }) {
  const ctx = begin(renderer, {
    seed: 55, bounds: [-15, 29.5, -15, 50], ground: { map: T.cobble(), tile: 5, color: 0xb9b2a6 },
    sky: { elevation: 56, azimuth: 190, turbidity: 3.4, rayleigh: 1.2, exposure: 0.5, fog: 0xd2dce5, density: 0.0028, sunI: 3.3 },
  });
  const { scene, colliders, rand } = ctx, sp = level.spot;
  pad(scene, -2.8, 2.8, -13, 52, T.cobble(), { tile: 4, y: 0.04, order: 1, color: 0xcfc7b8 });
  pad(scene, 2.8, 24.4, -10.2, 9, T.cobble(), { tile: 4, y: 0.04, order: 1, color: 0xcfc7b8 });
  // maisons de la ruelle (faîtage le long de z) ; côté est : porche entre z = -1,8 et 1,8
  let k = 0;
  const row = (xc, zs, depth) => { for (let i = 0; i < zs.length - 1; i++) { const w = zs[i + 1] - zs[i]; house(scene, colliders, { x: xc, z: (zs[i] + zs[i + 1]) / 2, w, d: depth, h: 6.8 + (k % 3) * 3.4, yaw: Math.PI / 2, wall: WALLS[k % 5], key: 'vq' + (k % 5), style: { shutters: ['#3d5a80', '#7a3b2e', '#4a6b4a'][k % 3] }, roof: k % 2 ? 'tile' : 'slate', door: 1.1 }); k++; } };
  row(-8.4, [-14, -2, 10, 22, 34, 46, 54], 11);
  row(6.3, [1.8, 13, 25, 37, 50], 7); row(6.3, [-14, -1.8], 7);
  // porche : une masse de bâtiment au-dessus du passage
  const arch = new THREE.Mesh(new THREE.BoxGeometry(7, 7.2, 3.6).translate(6.3, 3.3 + 3.6, 0), mat(T.facade('#c9b79c', 'vq1', { shutters: '#3d5a80' }), { bump: 0.5 })); arch.castShadow = true; scene.add(arch);
  const under = new THREE.Mesh(new THREE.BoxGeometry(7, 0.2, 3.6).translate(6.3, 3.25, 0), flat(0x3a3530)); scene.add(under);
  // cour : maisons au nord, au sud et à l'est
  house(scene, colliders, { x: 17, z: -14.1, w: 16, d: 8, h: 10.2, yaw: 0, wall: '#e0d2b4', key: 'vq2', style: { shutters: '#7a3b2e' }, roof: 'tile', door: 1.1 });
  house(scene, colliders, { x: 17, z: 13.1, w: 16, d: 8, h: 6.8, yaw: Math.PI, wall: '#d6c4a0', key: 'vq4', style: { shutters: '#4a6b4a' }, roof: 'slate', door: 1.1 });
  house(scene, colliders, { x: 28.6, z: -0.5, w: 18, d: 8, h: 10.2, yaw: Math.PI / 2, wall: '#b9a58a', key: 'vq3', style: { shutters: '#3d5a80' }, roof: 'tile', door: 1.1 });
  // places le long du mur nord de la cour (nez vers le mur) ; la place cible est entre deux voitures
  ctx.bays({ x: 18, z: -7.5, yaw: Math.PI, count: 5, pitch: 2.6, depth: 5, avoid: [[sp.x, sp.z]], fill: 1, types: ['hatchback', 'sport', 'compact', 'wagon'], gap: 0.2 });
  // poubelles, pots, lanternes, arbre de la cour
  const bins = [[22.8, 6.8], [12, -9.4], [23.6, -9.4]];
  scatter(scene, [new THREE.BoxGeometry(0.7, 1.1, 0.7).translate(0, 0.55, 0)], flat(0x3e5f46), bins.map(([x, z]) => ({ x, z, rot: rand() * 3 })), { seed: 3 });
  for (const [x, z] of bins) colliders.push({ k: 'circle', x, z, r: 0.5 });
  const pots = [[-2.62, 30], [2.62, 24], [-2.62, 14], [2.62, 40], [10.8, 7.4]];
  scatter(scene, [new THREE.CylinderGeometry(0.24, 0.19, 0.6, 12).translate(0, 0.3, 0)], flat(0x9a5a3a), pots.map(([x, z]) => ({ x, z, rot: 0 })), { seed: 4 });
  for (const [x, z] of pots) colliders.push({ k: 'circle', x, z, r: 0.26 });
  lamps(scene, colliders, [{ x: -2.7, z: 40, rot: 0 }, { x: 2.7, z: 18, rot: Math.PI }, { x: -2.7, z: 9, rot: 0 }]);
  scatter(scene, oakGeos(2), oakMats(), [{ x: 21.5, z: 3.5, s: 0.75 }], { seed: 5 }); colliders.push({ k: 'circle', x: 21.5, z: 3.5, r: 0.45 });
  signBoard(scene, colliders, { x: 2.5, z: 9, yaw: -Math.PI / 2, text: 'Impasse', w: 1.0, h: 0.35, y: 2.4, font: 44, bg: '#fff', fg: '#222' });
  return ctx.finish({ peds: [{ path: [[11, 6.2], [22, 6.2]], speed: 1.1, start: 0.4 }, { path: [[24, -6], [24, 6]], speed: 0.9, start: 0.7 }, { path: [[10.5, 4], [10.5, -3]], speed: 1.0, start: 0.2 }] });
}

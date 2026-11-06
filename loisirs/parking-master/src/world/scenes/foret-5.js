/* Forêt 5 : le pont de bois. Un ruisseau, un pont à voie unique avec garde-corps, puis l'aire de départ des sentiers : places serrées entre pins, rochers et voitures. */
import * as THREE from 'three';
import { begin, pave, pad } from '../common.js';
import { landscape } from '../landscape.js';
import { house, signBoard, wallRun } from '../parts.js';
import { mat, flat, scatter, rockGeos, rockMat, scaleUV } from '../kit.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { box, circle } from '../../gameplay/collision.js';
import { T } from '../textures.js';

export async function build({ renderer, level }) {
  const ctx = begin(renderer, { seed: 75, bounds: [-30, 30, -32, 58], sky: { elevation: 40, azimuth: 150, turbidity: 5.5, rayleigh: 1.6, mie: 0.008, exposure: 0.52, fog: 0xb2c3ba, density: 0.0085, sun: 0xfff0cf, sunI: 3.0, hemi: [0xcfe6d6, 0x4a4a2c, 0.85] } });
  const { scene, colliders, rand } = ctx, sp = level.spot;
  const road = [[0, 90], [0, 30], [0, 8], [0, -6]];
  landscape(ctx, { kind: 'forest', seed: 34, shapes: [{ path: road, w: 3 }, { rect: [-13, 13, -26, -6] }, { rect: [-3, 3, -5, 5] }], channel: { z: 0, w: 5, depth: 1.5 }, collide: [-30, 30, -32, 60], cz: 0 });
  pave(scene, [[0, 90], [0, 30], [0, 3.4]], 5.0, T.dirtRoad(), { uvLen: 8, y: 0.035, order: 2, alpha: true });
  pave(scene, [[0, -3.4], [0, -7]], 5.0, T.dirtRoad(), { uvLen: 8, y: 0.035, order: 2, alpha: true });
  pad(scene, -13, 13, -27, -6, T.gravel(), { tile: 6, y: 0.04, order: 3, color: 0xcdc3ad });
  // ruisseau (eau en contrebas), pont de planches avec garde-corps
  const water = new THREE.Mesh(new THREE.PlaneGeometry(130, 5.2).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: T.water(), roughness: 0.08, metalness: 0.3, transparent: true, opacity: 0.9 })); water.position.set(0, -0.62, 0); scene.add(water);
  const deck = new THREE.Mesh(scaleUV(new THREE.BoxGeometry(3.9, 0.22, 7.2).translate(0, -0.05, 0), 1, 3), mat(T.plank(), { rough: 0.9 })); deck.receiveShadow = true; scene.add(deck);
  const rails = []; for (const s of [-1, 1]) { rails.push(new THREE.BoxGeometry(0.12, 0.14, 7.2).translate(s * 1.88, 0.95, 0), new THREE.BoxGeometry(0.12, 0.14, 7.2).translate(s * 1.88, 0.5, 0)); for (let z = -3.4; z <= 3.4; z += 1.7) rails.push(new THREE.BoxGeometry(0.16, 1.1, 0.16).translate(s * 1.88, 0.55, z)); colliders.push(box(s * 1.98, 0, 0.12, 3.7, 0)); }
  const rm = new THREE.Mesh(mergeGeometries(rails), mat(T.wood(), { color: 0x8a6a48 })); rm.castShadow = true; scene.add(rm);
  // berges : rochers et murs invisibles de part et d'autre du pont
  wallRun(scene, colliders, [[-60, 3.6], [-2.1, 3.6]], { kind: 'hedge', h: 0.9 }); wallRun(scene, colliders, [[2.1, 3.6], [60, 3.6]], { kind: 'hedge', h: 0.9 });
  wallRun(scene, colliders, [[-60, -3.6], [-2.1, -3.6]], { kind: 'hedge', h: 0.9 }); wallRun(scene, colliders, [[2.1, -3.6], [60, -3.6]], { kind: 'hedge', h: 0.9 });
  const rocks = []; for (let i = 0; i < 18; i++) { const x = (rand() - 0.5) * 100; if (Math.abs(x) < 3.5) continue; rocks.push({ x, z: (rand() < 0.5 ? -1 : 1) * (2.7 + rand() * 0.8), y: -0.4, s: 0.5 + rand() * 0.6, sy: 0.5 }); }
  scatter(scene, rockGeos(3), rockMat(0xa8b09c), rocks, { seed: 5 });
  // aire de départ des sentiers : place entre une voiture, un rocher et un pin
  const off = sp.wid / 2 + 0.55;
  ctx.car('compact', sp.x - off - 0.85, sp.z, Math.PI, 0xc1272d); ctx.car('wagon', -8.2, -20, Math.PI, 0xe8e8e2); ctx.car('hatchback', -4, -12.5, Math.PI + 0.1, 0x2d4f8a);
  const boulder = [{ x: sp.x + off + 1.25, z: sp.z, y: -0.3, s: 1.5, sy: 1.2 }];
  scatter(scene, rockGeos(2), rockMat(0xa8b09c), boulder, { seed: 6 }); colliders.push(circle(sp.x + off + 1.25, sp.z, 1.35));
  signBoard(scene, colliders, { x: -3.2, z: -7.5, yaw: 0.3, text: 'Sentiers', w: 1.3, h: 0.45, y: 1.9, font: 56, bg: '#3a2a1a' });
  const t = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.75, 0.8).translate(0, 0.38, 0), mat(T.wood(), { color: 0x9b7a55 })); t.position.set(9.5, 0, -23.5); t.castShadow = true; scene.add(t); colliders.push(box(9.5, -23.5, 1.0, 0.5, 0));
  return ctx.finish({ peds: [{ path: [[0.5, -12], [0.5, 12]], speed: 0.9, start: 0.55 }, { path: [[-11, -14], [-4, -23]], speed: 1.0, start: 0.2 }, { path: [[5, -9], [11, -9]], speed: 1.0, start: 0.5 }] });
}

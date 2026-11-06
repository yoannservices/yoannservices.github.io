/* Campagne 3 : le hangar à tracteurs. Grand hangar ouvert sur l'avant (porte de 6,4 m), tracteurs, caisses, bottes de paille, fûts : la place est au fond. */
import * as THREE from 'three';
import { begin, pad, pave } from '../common.js';
import { landscape } from '../landscape.js';
import { wallRun, tractor } from '../parts.js';
import { mat, flat, scatter, scaleUV } from '../kit.js';
import { box, circle } from '../../gameplay/collision.js';
import { T } from '../textures.js';

export async function build({ renderer, level }) {
  const ctx = begin(renderer, { seed: 63, bounds: [-30, 30, -31, 60], sky: { elevation: 40, azimuth: 150, turbidity: 4.4, rayleigh: 1.5, exposure: 0.5, fog: 0xd8dccd, density: 0.003, sun: 0xffe9c8, sunI: 3.4 } });
  const { scene, colliders, rand } = ctx, sp = level.spot;
  const road = [[2, 90], [0, 40], [0, 20]];
  landscape(ctx, { kind: 'farm', seed: 23, shapes: [{ rect: [-14, 14, -30, 10] }, { path: road, w: 5 }], collide: [-28, 28, -30, 62], cz: 10 });
  pave(scene, road, 5.2, T.dirtRoad(), { uvLen: 8, y: 0.035, order: 2, alpha: true });
  pad(scene, -19, 19, -8, 24, T.gravel(), { tile: 6, y: 0.04, order: 3, color: 0xd8cdb8 });
  pad(scene, -12, 12, -28, -6, T.concrete(), { tile: 4, y: 0.05, order: 4, color: 0xb9b4a8 });
  // hangar : murs en planches, porte à l'avant, toit en tôle à deux pans
  const HH = 6.5, planks = mat(T.planks(), { rough: 0.9, bump: 2 });
  wallRun(scene, colliders, [[-12, -6], [-12, -28], [12, -28], [12, -6]], { kind: 'wood', h: HH, t: 0.4, color: 0xd9b0a0 });
  wallRun(scene, colliders, [[-12, -6], [-3.2, -6]], { kind: 'wood', h: HH, t: 0.4, color: 0xd9b0a0 });
  wallRun(scene, colliders, [[3.2, -6], [12, -6]], { kind: 'wood', h: HH, t: 0.4, color: 0xd9b0a0 });
  const half = 12.9, rise = 3.6, slope = Math.hypot(half, rise), ang = Math.atan2(rise, half), tin = mat(T.roofTin(), { rough: 0.5, metal: 0.3 });
  for (const s of [-1, 1]) { const p = new THREE.Mesh(scaleUV(new THREE.BoxGeometry(slope, 0.16, 23), 6, 3), tin); p.position.set(s * (half / 2 - 0.1), HH + rise / 2, -17); p.rotation.z = -s * ang; p.castShadow = true; scene.add(p); }
  const gb = new THREE.Shape(); gb.moveTo(-12.4, 0); gb.lineTo(12.4, 0); gb.lineTo(0, rise); gb.closePath();
  for (const z of [-6, -28]) { const g = new THREE.Mesh(new THREE.ShapeGeometry(gb), planks); g.position.set(0, HH, z + (z > -10 ? 0.05 : -0.05)); if (z < -10) g.rotation.y = Math.PI; scene.add(g); }
  // intérieur : tracteurs, caisses, paille, fûts, établi
  tractor(scene, colliders, { x: sp.x - sp.wid / 2 - 1.3, z: sp.z, yaw: Math.PI, color: 0x2f7a3a });
  tractor(scene, colliders, { x: -6.5, z: -12.5, yaw: 2.6, color: 0xb83a2a });
  const crate = new THREE.BoxGeometry(1.5, 1.1, 1.3).translate(0, 0.55, 0), cr = [];
  for (let i = 0; i < 4; i++) { cr.push({ x: sp.x + sp.wid / 2 + 0.95, z: sp.z - 2.4 + i * 1.6, rot: (rand() - 0.5) * 0.1, y: 0 }); if (i % 2) cr.push({ x: sp.x + sp.wid / 2 + 0.95, z: sp.z - 2.4 + i * 1.6, y: 1.1, rot: 0.05 }); }
  scatter(scene, [crate], mat(T.wood(), { color: 0xb59a74 }), cr, { seed: 5 }); colliders.push(box(sp.x + sp.wid / 2 + 0.95, sp.z, 0.8, 3.4, 0));
  const bale = new THREE.CylinderGeometry(0.9, 0.9, 1.3, 18).rotateZ(Math.PI / 2); scaleUV(bale, 2, 1);
  const bales = []; for (let j = 0; j < 7; j++) for (let k = 0; k < 2; k++) if (k === 0 || j % 2) bales.push({ x: -10.6, y: 0.9 + k * 1.7, z: -9 - j * 2.5, rot: Math.PI / 2 + (rand() - 0.5) * 0.1 });
  scatter(scene, [bale], mat(T.straw(), { rough: 1 }), bales, { seed: 6 }); colliders.push(box(-10.3, -17.5, 1.2, 9.6, 0));
  const barrel = new THREE.CylinderGeometry(0.32, 0.32, 0.9, 14).translate(0, 0.45, 0), br = [[-7.5, -26.5], [-6.7, -26.9], [-7.2, -25.6], [-1, -26.8], [-0.2, -26.5]];
  scatter(scene, [barrel], flat(0x2f5f8a, { metal: 0.5, rough: 0.5 }), br.map(([x, z]) => ({ x, z, rot: 0 })), { seed: 7 }); for (const [x, z] of br) colliders.push(circle(x, z, 0.4));
  const bench = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.95, 0.9).translate(0, 0.48, 0), mat(T.wood(), { color: 0x8a6a48 })); bench.position.set(2.5, 0, -27.3); bench.castShadow = true; scene.add(bench); colliders.push(box(2.5, -27.3, 2.1, 0.5, 0));
  return ctx.finish({ peds: [{ path: [[-10, -9], [-2, -9]], speed: 0.9, start: 0.3 }, { path: [[-14, 12], [14, 12]], speed: 1.1, start: 0.5 }] });
}

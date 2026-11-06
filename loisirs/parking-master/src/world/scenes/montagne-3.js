/* Montagne 3 : l'aire du col. Un élargissement le long du précipice, des camping-cars garés en long entre le garde-corps et la route, touristes, circulation en face. */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { begin, pave, pad, paint } from '../common.js';
import { landscape } from '../landscape.js';
import { bankRun, signBoard, lamps } from '../parts.js';
import { mat, flat, scatter, rockGeos, rockMat, pole } from '../kit.js';
import { box, circle } from '../../gameplay/collision.js';
import { T } from '../textures.js';

function guardrail(scene, colliders, pts) {
  const posts = [], beams = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], len = Math.hypot(x1 - x0, z1 - z0), yaw = Math.atan2(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / 2));
    for (let k = 0; k <= n; k++) posts.push({ x: x0 + (x1 - x0) * k / n, z: z0 + (z1 - z0) * k / n, rot: 0 });
    beams.push(new THREE.BoxGeometry(0.1, 0.32, len).translate(0, 0.62, 0).rotateY(yaw).translate((x0 + x1) / 2, 0, (z0 + z1) / 2));
    colliders.push(box((x0 + x1) / 2, (z0 + z1) / 2, 0.2, len / 2, -yaw));
  }
  scatter(scene, [new THREE.CylinderGeometry(0.05, 0.05, 0.85, 8).translate(0, 0.42, 0)], flat(0x7d8288, { metal: 0.6 }), posts, { seed: 61 });
  const m = new THREE.Mesh(mergeGeometries(beams), mat(T.metal(), { rough: 0.45, metal: 0.7, color: 0xd5dade })); m.castShadow = true; scene.add(m);
}

export async function build({ renderer, level }) {
  const ctx = begin(renderer, { seed: 83, bounds: [-30, 30, -30, 76], sky: { elevation: 40, azimuth: 170, turbidity: 2.4, rayleigh: 1.05, mie: 0.003, mieG: 0.85, exposure: 0.55, fog: 0xcfe0f0, density: 0.0011, sun: 0xfff6e8, sunI: 3.6, hemi: [0xcfe4ff, 0x77777c, 0.95], envI: 0.7 } });
  const { scene, colliders, rand } = ctx, sp = level.spot;
  const road = [[0, 100], [0, 40], [0, -34]];
  landscape(ctx, { kind: 'alpine', seed: 42, cliffX: 18.4, shapes: [{ path: road, w: 3 }, { rect: [3, 17.4, -26, 14] }], collide: [-30, 30, -30, 78], cz: 20 });
  pave(scene, road, 6.4, T.asphalt(), { uvLen: 10, y: 0.035, order: 2 });
  pad(scene, 3.2, 17.4, -26, 14, T.asphalt(), { tile: 10, y: 0.036, order: 3, color: 0xd6d6dc });
  const dash = document.createElement('canvas'); dash.width = 16; dash.height = 64; { const g = dash.getContext('2d'); g.fillStyle = '#e8c21f'; g.fillRect(0, 0, 16, 36); }
  const dt = new THREE.CanvasTexture(dash); dt.wrapS = dt.wrapT = THREE.RepeatWrapping; dt.colorSpace = THREE.SRGBColorSpace;
  pave(scene, road, 0.14, dt, { uvLen: 7, y: 0.05, order: 5, alpha: true });
  guardrail(scene, colliders, [[17.8, -26], [17.8, 14]]);
  guardrail(scene, colliders, [[17.8, 14], [17.8, 30], [14.8, 44]]);
  // camping-cars garés en long le long du garde-corps, de part et d'autre de la place
  const lenTarget = 4.61, front = sp.z - sp.len / 2 - 0.55 - lenTarget / 2, rear = sp.z + sp.len / 2 + 0.55 + lenTarget / 2;
  ctx.car('minivan', sp.x, front, Math.PI, 0xf4f4f0); ctx.car('minivan', sp.x, rear, Math.PI, 0xe9e1c8);
  ctx.car('wagon', sp.x, front - 6.2, Math.PI, 0x2f5f8f); ctx.car('suv', sp.x, rear + 6.4, Math.PI, 0x3a3f46); ctx.car('minivan', sp.x, front - 12.4, Math.PI, 0xf4f4f0);
  // rochers, congères, panneau, lampadaire
  const rocks = []; for (let i = 0; i < 16; i++) { rocks.push({ x: -8 - rand() * 12, z: -22 + rand() * 60, y: -0.3, s: 1.2 + rand() * 2.4, sy: 1.1 }); } scatter(scene, rockGeos(4), rockMat(0xbab3a8), rocks, { seed: 7 });
  for (const r of rocks) colliders.push(circle(r.x, r.z, r.s * 0.85));
  bankRun(scene, colliders, [[-3.8, -26], [-3.8, 14]], { w: 1.4, h: 0.8 });
  signBoard(scene, colliders, { x: 4.8, z: 15.5, yaw: 0.2, text: 'Aire du col · 2 150 m', w: 1.9, h: 0.55, y: 1.8, font: 40, bg: '#3a2a1a' });
  lamps(scene, colliders, [{ x: 16.6, z: -18, rot: Math.PI }, { x: 16.6, z: 8, rot: Math.PI }]);
  return ctx.finish({
    cars: [{ type: 'minivan', path: [[-1.7, -34], [-1.7, 90]], speed: 6.0, start: 0.25, color: 0xd9a441 }, { type: 'hatchback', path: [[-1.7, -34], [-1.7, 90]], speed: 5.0, start: 0.7, color: 0xb8352a }],
    peds: [{ path: [[15.3, -22], [15.3, 10]], speed: 0.9, start: 0.3, tint: 0xe03a3a }, { path: [[15.8, 8], [15.8, -4]], speed: 0.8, start: 0.5, tint: 0x2f6aa8 }, { path: [[12.5, -24], [5.5, -24]], speed: 1.0, start: 0.2, tint: 0xf2c230 }],
  });
}

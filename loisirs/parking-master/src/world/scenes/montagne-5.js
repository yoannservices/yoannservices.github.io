/* Montagne 5 : le garage de la gare du téléphérique, creusé dans la roche. Plafond bas, parois de roche, piliers, sorties lumineuses, skieurs, voiture qui sort ; la place est la plus serrée. */
import * as THREE from 'three';
import { begin } from '../common.js';
import { garageShell } from '../garage.js';
import { signBoard } from '../parts.js';
import { mat, flat, scatter, scaleUV } from '../kit.js';
import { box, circle } from '../../gameplay/collision.js';
import { T } from '../textures.js';

export async function build({ renderer, level }) {
  const ctx = begin(renderer, { seed: 85, indoor: { ceiling: 2.9, sun: 1.0, light: 1.8 } });
  const { scene, colliders } = ctx, sp = level.spot;
  const XS = [-16.9, -9.1, -1.3, 6.5, 11.7 + 0.0, 14.3, 22.1].filter((x) => x < 21);
  const pillars = []; for (const x of [-16.9, -9.1, -1.3, 6.5, 14.3]) pillars.push([x, 3.3], [x, -3.3]);
  pillars.push([sp.x + sp.wid / 2 + 0.31, sp.z - 2.45]);
  garageShell(ctx, { x0: -22, x1: 22, z0: -12, z1: 12, h: 2.9, wall: 'rock', pillars, lightRows: [-1.5, 1.5], exits: [{ x: 21.7, z: -8, yaw: -Math.PI / 2 }] });
  // ouverture sur la neige : plan lumineux dans la paroi ouest
  const day = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 2.6), new THREE.MeshBasicMaterial({ color: 0xe8f1ff, toneMapped: false })); day.position.set(-21.7, 1.4, 0); day.rotation.y = Math.PI / 2; scene.add(day);
  // deux rangées de places le long des parois, nez dans la place ; stockage derrière
  for (const [z, yaw] of [[-5.75, Math.PI], [5.75, 0]]) ctx.bays({ x: 0, z, yaw, count: 15, pitch: 2.6, depth: 5, avoid: [[sp.x, sp.z]], fill: 0.94, paintLines: true, types: ['minivan', 'suv', 'wagon', 'sedan', 'offroad', 'sport'] });
  const crates = [[-18, -10.5], [-13, -10.7], [-2, -10.6], [9, -10.6], [17, -10.5], [-18, 10.6], [-8, 10.7], [4, 10.6], [18, 10.5]];
  scatter(scene, [new THREE.BoxGeometry(1.6, 1.0, 1.0).translate(0, 0.5, 0)], mat(T.wood(), { color: 0xa88a64 }), crates.map(([x, z]) => ({ x, z, rot: 0 })), { seed: 3 }); for (const [x, z] of crates) colliders.push(box(x, z, 0.8, 0.5, 0));
  signBoard(scene, colliders, { x: -19.5, z: 7.5, yaw: Math.PI / 2, text: 'Téléphérique', w: 1.6, h: 0.45, y: 1.9, font: 50, bg: '#a33a2a' });
  return ctx.finish({
    cars: [{ type: 'sport', path: [[20, -1.5], [-20, -1.5]], speed: 2.8, start: 0.2, color: 0xc1272d }],
    peds: [{ path: [[-18, 8], [-18, -8]], speed: 1.0, start: 0.3, tint: 0xe03a3a }, { path: [[19.5, -9], [19.5, 9]], speed: 1.0, start: 0.6, tint: 0x2f6aa8 }, { path: [[-12, -9.2], [-4, -9.2]], speed: 0.9, start: 0.5, tint: 0xf2c230 }],
  });
}

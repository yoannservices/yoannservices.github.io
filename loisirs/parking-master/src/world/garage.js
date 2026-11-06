/* Coque d'un parking couvert (souterrain ou creusé dans la roche) : dalle, plafond bas avec poutres, tuyaux et néons, murs, piliers à bandes
   jaunes et noires, panneaux de sortie. Le sol est plat ; le plafond n'est jamais dessiné d'ombre (la lumière « du dessus » traverse). */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { box } from '../gameplay/collision.js';
import { mat, flat, scaleUV } from './kit.js';
import { T } from './textures.js';

const stripeTex = (() => {
  let t; return () => t || (t = (() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 64; const g = c.getContext('2d');
    g.fillStyle = '#d5d7da'; g.fillRect(0, 0, 64, 64);
    g.fillStyle = '#e8b81c'; g.fillRect(0, 36, 64, 22); g.fillStyle = '#1b1b1d';
    for (let i = -2; i < 6; i++) { g.beginPath(); g.moveTo(i * 16, 58); g.lineTo(i * 16 + 8, 58); g.lineTo(i * 16 + 24, 36); g.lineTo(i * 16 + 16, 36); g.fill(); }
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; return tex;
  })());
})();

/* o : { x0, x1, z0, z1, h (hauteur sous plafond), pillars: [[x, z], ...], lightRows: [z, ...], exits: [{ x, z, yaw }], wall: 'concrete'|'rock' } */
export function garageShell(ctx, o) {
  const { scene, colliders } = ctx, { x0, x1, z0, z1, h = 2.7, pillars = [], lightRows = [], exits = [] } = o, W = x1 - x0, D = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const floor = new THREE.Mesh(scaleUV(new THREE.PlaneGeometry(W, D).rotateX(-Math.PI / 2), W / 6, D / 6), mat(T.garageFloor(), { rough: 0.55, bump: 1.5 }));
  floor.position.set(cx, 0.02, cz); floor.receiveShadow = true; scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.BoxGeometry(W + 2, 0.5, D + 2).translate(0, h + 0.25, 0), mat(T.concrete(), { color: 0x9aa0a6 })); ceil.position.set(cx, 0, cz); scene.add(ceil);
  const wallMat = o.wall === 'rock' ? mat(T.rock(), { bump: 3, color: 0xcfc7ba }) : mat(T.garageWall(), { bump: 1, color: 0xdfe3e8 });
  const wall = (x, z, w, d) => { const g = scaleUV(new THREE.BoxGeometry(w, h, d).translate(x, h / 2, z), Math.max(w, d) / 3, 1); return g; };
  const walls = [wall(cx, z0 - 0.25, W + 1, 0.5), wall(cx, z1 + 0.25, W + 1, 0.5), wall(x0 - 0.25, cz, 0.5, D), wall(x1 + 0.25, cz, 0.5, D)];
  const wm = new THREE.Mesh(mergeGeometries(walls), wallMat); wm.receiveShadow = true; scene.add(wm);
  colliders.push(box(cx, z0 - 0.5, W / 2 + 1, 0.5, 0), box(cx, z1 + 0.5, W / 2 + 1, 0.5, 0), box(x0 - 0.5, cz, 0.5, D / 2, 0), box(x1 + 0.5, cz, 0.5, D / 2, 0));
  // poutres transversales et tuyaux
  const beams = [], pipes = [];
  for (let x = x0 + 3.9; x < x1; x += 7.8) beams.push(new THREE.BoxGeometry(0.5, 0.45, D).translate(x, h - 0.22, cz));
  for (const dz of [-0.35, 0.35]) pipes.push(new THREE.CylinderGeometry(0.09, 0.09, W, 10).rotateZ(Math.PI / 2).translate(cx, h - 0.2, z0 + 1.2 + dz));
  scene.add(new THREE.Mesh(mergeGeometries(beams), mat(T.concrete(), { color: 0x5d6166 })));
  scene.add(new THREE.Mesh(mergeGeometries(pipes), flat(0x9aa3ad, { metal: 0.6, rough: 0.4 })));
  // néons (matière émissive)
  const strips = [];
  for (const z of lightRows) for (let x = x0 + 3; x < x1; x += 5.2) strips.push(new THREE.BoxGeometry(1.5, 0.06, 0.22).translate(x, h - 0.05, z));
  if (strips.length) scene.add(new THREE.Mesh(mergeGeometries(strips), new THREE.MeshBasicMaterial({ color: 0xf2f7ff, toneMapped: false })));
  // piliers
  if (pillars.length) {
    const pg = pillars.map(([x, z]) => scaleUV(new THREE.BoxGeometry(0.6, h, 0.6).translate(x, h / 2, z), 1, 1));
    const pm = new THREE.Mesh(mergeGeometries(pg), new THREE.MeshStandardMaterial({ map: stripeTex(), roughness: 0.8 })); pm.castShadow = pm.receiveShadow = true; scene.add(pm);
    for (const [x, z] of pillars) colliders.push(box(x, z, 0.3, 0.3, 0));
  }
  // sorties : panneau vert lumineux
  for (const e of exits) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 96; const g = c.getContext('2d');
    g.fillStyle = '#12a150'; g.fillRect(0, 0, 256, 96); g.fillStyle = '#fff'; g.font = '700 54px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SORTIE', 128, 52);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.45), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); m.position.set(e.x, h - 0.45, e.z); m.rotation.y = e.yaw; scene.add(m);
  }
}

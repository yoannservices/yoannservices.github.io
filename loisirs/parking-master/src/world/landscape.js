/* Paysage commun aux lieux de nature : relief plat autour des zones jouables puis collines (ferme, forêt) ou montagnes (alpin), arbres,
   buissons, rochers et touffes qui évitent les chemins et les zones. kind : 'farm' | 'forest' | 'alpine'.
   o.shapes : zones jouables [{ rect: [x0, x1, z0, z1] } | { path: [[x, z], ...] }] ; o.collide : zone où les arbres deviennent des obstacles. */
import * as THREE from 'three';
import { fbm, ridged, smooth, rng } from '../core/util.js';
import { circle } from '../gameplay/collision.js';
import { distToPath } from './common.js';
import { scatter, terrain, oakGeos, oakMats, pineGeos, pineMats, bushGeos, bushMat, tuftGeo, tuftMat, rockGeos, rockMat } from './kit.js';
import { T } from './textures.js';

const KINDS = {
  farm: { map: () => T.grass(), tile: 7, amp: 36, from: 100, to: 300, trees: 'oak', n: 300, tufts: 2000, rocks: 18 },
  forest: { map: () => T.grass(), tile: 6, amp: 38, from: 80, to: 230, trees: 'mix', n: 1300, tufts: 3400, rocks: 34, bushes: 160 },
  alpine: { map: () => T.rock(), tile: 14, amp: 560, from: 160, to: 720, trees: 'pine', n: 380, tufts: 900, rocks: 40 },
};

export function landscape(ctx, o) {
  const K = KINDS[o.kind], { scene, colliders } = ctx, rand = rng(o.seed || 7), shapes = o.shapes || [];
  const dShape = (x, z) => {
    let d = Infinity;
    for (const s of shapes) {
      if (s.rect) { const [x0, x1, z0, z1] = s.rect; d = Math.min(d, Math.hypot(Math.max(x0 - x, 0, x - x1), Math.max(z0 - z, 0, z - z1))); }
      else d = Math.min(d, distToPath(x, z, s.path) - (s.w || 3));
    }
    return d;
  };
  const channel = o.channel;   // { z, w, depth } : ruisseau le long de x
  const height = (x, z) => {
    const r = Math.hypot(x, z * 0.9), k = smooth(K.from, K.to, r), flatK = 1 - smooth(8, 36, Math.max(0, dShape(x, z)));
    let m;
    if (o.kind === 'alpine') m = K.amp * Math.pow(ridged(x * 0.0017 + 3, z * 0.0017 - 1, 5, 21), 2.1) * k + 70 * fbm(x * 0.009, z * 0.009, 4, 22) * k;
    else m = k * (K.amp * fbm(x * 0.0065 + 2, z * 0.0065, 4, 12) + 11 * fbm(x * 0.03, z * 0.03, 3, 13));
    let h = m * (1 - flatK) * (o.kind === 'alpine' ? 1 : 1) + 0.25 * (fbm(x * 0.06, z * 0.06, 2, 14) - 0.5) * (1 - k);
    if (o.cliffX != null) h -= 135 * smooth(o.cliffX + 0.8, o.cliffX + 38, x) * (1 - smooth(o.cliffX + 45, o.cliffX + 190, x));   // précipice à l'est de cliffX
    if (channel) h -= channel.depth * (1 - smooth(channel.w * 0.5, channel.w * 0.5 + 1.0, Math.abs(z - channel.z)));
    return h;
  };
  const tint = (c, x, z, h, slope) => {
    if (o.kind === 'alpine') {
      const rockK = Math.min(1, Math.max(0, (slope - 0.18) * 3.5)), snowK = Math.max(o.snow ?? 0, smooth(260, 340, h + 40 * fbm(x * 0.02, z * 0.02, 3, 26))) * (1 - rockK * 0.8), low = (1 - smooth(10, 120, h)) * (o.snow ? 0 : 1);
      c.setRGB(1.0, 0.96, 0.9).multiplyScalar(0.75 + 0.35 * rockK);
      c.lerp(new THREE.Color(0.6, 0.8, 0.38), low * (1 - rockK) * 0.95);
      c.lerp(new THREE.Color(2.0, 2.05, 2.15), snowK);
    } else if (o.kind === 'forest') {
      const p = fbm(x * 0.03 + 1, z * 0.03, 3, 15), moss = fbm(x * 0.09, z * 0.09, 2, 16);
      c.setRGB(0.42 + 0.35 * p + 0.12 * moss, 0.5 + 0.25 * p + 0.1 * moss - 0.05 * slope, 0.3 + 0.12 * p).multiplyScalar(0.8 - Math.min(0.2, h * 0.003));
    } else {
      const f = fbm(x * 0.012 + 9, z * 0.012, 3, 5), g = fbm(x * 0.05, z * 0.05, 2, 6);
      c.setRGB(0.78 + 0.5 * f - 0.15 * slope + 0.1 * g, 0.85 + 0.3 * f + 0.1 * g, 0.62 + 0.15 * f - 0.1 * slope).multiplyScalar(1.0 - Math.min(0.25, h * 0.004));
    }
  };
  scene.add(terrain({ size: o.kind === 'alpine' ? 2300 : 1400, seg: o.kind === 'alpine' ? 280 : 200, map: K.map(), tile: K.tile, height, tint }));

  const free = (x, z, m) => dShape(x, z) > m;
  const col = o.collide || [-85, 85, -60, 100], inCol = (x, z) => x > col[0] && x < col[1] && z > col[2] && z < col[3];
  const pines = [], oaks = [];
  const near = (x, z, d) => dShape(x, z) < d;
  for (let i = 0; i < K.n; i++) {
    const a = rand() * Math.PI * 2, d = 6 + Math.sqrt(rand()) * (o.kind === 'alpine' ? 330 : 220), x = Math.cos(a) * d, z = Math.sin(a) * d * 0.95 + (o.cz ?? 20);
    const tight = rand() < 0.18, m = o.kind === 'forest' ? (tight ? 3.7 : 4.6) : 5.5;
    if (!free(x, z, d < 110 ? m : 3)) continue;
    const y = height(x, z); if (o.kind === 'alpine' && (y > 210 || y < -4)) continue;
    const s = 0.8 + rand() * 0.8, t = { x, z, y, s };
    const pine = K.trees === 'pine' || (K.trees === 'mix' && rand() < 0.62);
    (pine ? pines : oaks).push(t);
    if (inCol(x, z)) colliders.push(circle(x, z, 0.3 * s + 0.1));
  }
  if (pines.length) scatter(scene, pineGeos(3), pineMats(), pines, { seed: 51 });
  if (oaks.length) scatter(scene, oakGeos(3), oakMats(), oaks, { seed: 52 });
  const tufts = [], bushes = [], rocks = [];
  for (let i = 0; i < K.tufts; i++) { const x = (rand() - 0.5) * 230, z = (rand() - 0.5) * 230 + 20; if (free(x, z, 2.6)) { const y = height(x, z); if (y < 60 && !(o.snow)) tufts.push({ x, z, y, s: 0.7 + rand() * 0.9, tint: o.kind === 'forest' && rand() < 0.5 ? 0xc9e0a8 : 0xffffff }); } }
  for (let i = 0; i < (K.bushes || 0); i++) { const x = (rand() - 0.5) * 200, z = (rand() - 0.5) * 200 + 20; if (free(x, z, 4.2)) { const s = 0.7 + rand() * 0.9; bushes.push({ x, z, y: height(x, z), s, tint: 0xa8c488 }); if (inCol(x, z)) colliders.push(circle(x, z, 0.8 * s)); } }
  for (let i = 0; i < K.rocks; i++) { const x = (rand() - 0.5) * 190, z = (rand() - 0.5) * 190 + 20; if (free(x, z, 4)) { const s = 0.5 + rand() * 1.2; rocks.push({ x, z, y: height(x, z) - 0.1, s, sy: s * 0.75 }); if (inCol(x, z)) colliders.push(circle(x, z, s * 0.9)); } }
  if (tufts.length) scatter(scene, [tuftGeo()], tuftMat(), tufts, { shadow: false, seed: 53 });
  if (bushes.length) scatter(scene, bushGeos(), bushMat(), bushes, { seed: 54, receive: true });
  if (rocks.length) scatter(scene, rockGeos(4), rockMat(o.kind === 'forest' ? 0x9fae92 : 0xd2c8b4), rocks, { seed: 55 });
  return { height, free, near };
}

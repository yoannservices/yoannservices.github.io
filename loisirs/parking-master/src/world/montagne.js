/* Lieu 4 : le belvédère. Route de montagne en lacets, parking en surplomb avec garde-corps au bord du précipice, falaise rocheuse à l'ouest,
   grands sommets enneigés au loin, sapins épars, rochers et congères au bord de la route. */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { rng, fbm, ridged, smooth, lerp } from '../core/util.js';
import { box, circle } from '../gameplay/collision.js';
import { makeScene, pave, pad, paint, boundary, distToPath } from './common.js';
import { mat, flat, scatter, terrain, pineGeos, pineMats, rockGeos, rockMat, tuftGeo, tuftMat, parkedCars } from './kit.js';
import { T } from './textures.js';

const LOT = { x0: -18, x1: 22.5, z0: -26, z1: 16 };

/* Glissière de sécurité : poteaux, lisse métallique ondulée, obstacle le long de chaque tronçon. */
function guardrail(scene, colliders, pts) {
  const metal = mat(T.metal(), { rough: 0.45, metal: 0.7, color: 0xd5dade, nobump: false }), posts = [], beams = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], len = Math.hypot(x1 - x0, z1 - z0), yaw = Math.atan2(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / 2));
    for (let k = 0; k <= n; k++) posts.push({ x: x0 + (x1 - x0) * k / n, z: z0 + (z1 - z0) * k / n, rot: 0 });
    beams.push(new THREE.BoxGeometry(0.1, 0.32, len).translate(0, 0.62, 0).rotateY(yaw).translate((x0 + x1) / 2, 0, (z0 + z1) / 2));
    colliders.push(box((x0 + x1) / 2, (z0 + z1) / 2, 0.2, len / 2, -yaw));
  }
  scatter(scene, [new THREE.CylinderGeometry(0.05, 0.05, 0.85, 8).translate(0, 0.42, 0)], flat(0x7d8288, { metal: 0.6 }), posts, { seed: 61 });
  const m = new THREE.Mesh(mergeGeometries(beams), metal); m.castShadow = true; scene.add(m);
}

export async function build({ renderer, level }) {
  const colliders = [], rand = rng(61);
  const { scene, sky } = makeScene(renderer, { elevation: 38, azimuth: 172, turbidity: 2.4, rayleigh: 1.05, mie: 0.003, mieG: 0.85, exposure: 0.55, fog: 0xcfe0f0, density: 0.0011, sun: 0xfff6e8, sunI: 3.6, hemi: [0xcfe4ff, 0x77777c, 0.95], envI: 0.7 });

  const route = level.route, road = [[-12, 104], ...route.slice(0, 10)], roadPts = road;
  const lotDist = (x, z) => { const dx = Math.max(LOT.x0 - x, 0, x - LOT.x1), dz = Math.max(LOT.z0 - z, 0, z - LOT.z1); return Math.hypot(dx, dz); };
  const height = (x, z) => {
    const r = Math.hypot(x, z);
    const peaks = 640 * Math.pow(ridged(x * 0.0017 + 3, z * 0.0017 - 1, 5, 21), 2.1) + 70 * fbm(x * 0.009, z * 0.009, 4, 22) + 18 * fbm(x * 0.04, z * 0.04, 3, 23);
    const cliff = -135 * smooth(23.5, 62, x) * (1 - smooth(70, 210, x));                    // précipice à l'est
    const wall = 55 * smooth(-18, -48, x) * smooth(-60, -10, z) * (0.6 + 0.8 * fbm(x * 0.05, z * 0.05, 3, 24)); // paroi rocheuse à l'ouest
    const m = peaks * smooth(160, 720, r) + cliff + wall;
    const dr = Math.min(distToPath(x, z, roadPts), lotDist(x, z));
    const flatK = x > LOT.x1 - 0.5 && lotDist(x, z) < 20 ? 1 - smooth(0.3, 4, lotDist(x, z)) : 1 - smooth(8, 38, dr);
    return lerp(m, 0.15 * (fbm(x * 0.07, z * 0.07, 2, 25) - 0.5), flatK);
  };
  scene.add(terrain({
    size: 2300, seg: 300, map: T.rock(), tile: 14, height,
    tint: (c, x, z, h, slope) => {
      const rockK = Math.min(1, Math.max(0, (slope - 0.18) * 3.5)), snowK = smooth(260, 340, h + 40 * fbm(x * 0.02, z * 0.02, 3, 26)) * (1 - rockK * 0.85), low = 1 - smooth(10, 120, h);
      c.setRGB(1.0, 0.96, 0.9).multiplyScalar(0.75 + 0.35 * rockK);                         // roche grise-brune
      c.lerp(new THREE.Color(0.6, 0.8, 0.38), low * (1 - rockK) * 0.95);                  // herbes alpines en bas
      c.lerp(new THREE.Color(2.0, 2.05, 2.15), snowK);                                    // neige (valeur > 1 : la texture de roche est sombre)
    },
  }));

  // route, parking, marquages
  pave(scene, road, 6.2, T.asphalt(), { uvLen: 10, y: 0.035, order: 2, step: 1.6 });
  pad(scene, LOT.x0, LOT.x1, LOT.z0, LOT.z1, T.asphalt(), { tile: 10, y: 0.036, order: 3, color: 0xd6d6dc });
  pave(scene, road, 0.14, (() => { const c = document.createElement('canvas'); c.width = 16; c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#e8c21f'; g.fillRect(0, 0, 16, 36); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t; })(), { uvLen: 7, y: 0.05, order: 5, alpha: true, step: 1.6 });
  const sp = level.spot;
  paint(scene, [{ x: LOT.x1 - 0.9, z: (LOT.z0 + LOT.z1) / 2, w: 0.12, d: LOT.z1 - LOT.z0 - 2 }], { y: 0.058 });   // ligne blanche le long du garde-corps

  // glissières : bord de parking côté précipice et virages de la route
  guardrail(scene, colliders, [[LOT.x1 + 0.4, LOT.z0 + 1], [LOT.x1 + 0.4, LOT.z1 - 1]]);
  guardrail(scene, colliders, [[14.4, 51], [21.2, 43], [21.0, 35], [19.8, 27], [13, 20]]);

  // véhicules garés : de part et d'autre de la place + quelques autres sur le parking
  const off = sp.wid / 2 + 0.55;
  colliders.push(...await parkedCars(scene, [
    { type: 'minivan', x: sp.x, z: sp.z + off + 1.05, yaw: Math.PI / 2, color: 0xe9e9e4 },
    { type: 'wagon', x: sp.x, z: sp.z - off - 1.0, yaw: Math.PI / 2, color: 0x2f5f8f },
    { type: 'coupe', x: -6, z: -17, yaw: 0.5, color: 0xb8352a },
    { type: 'sedan', x: -12, z: 4, yaw: -0.3, color: 0x2a2f36 },
  ]));

  // rochers : paroi à l'ouest du parking, blocs au bord de la route, congères
  const rocks = [], free = (x, z, m) => distToPath(x, z, roadPts) > m && !(x > LOT.x0 - 1 && x < LOT.x1 + 2 && z > LOT.z0 - 1 && z < LOT.z1 + 1);
  for (let i = 0; i < 26; i++) { const x = LOT.x0 - 2 - rand() * 7, z = LOT.z0 + 3 + rand() * 38, s = 1.8 + rand() * 2.6; rocks.push({ x, z, y: -0.4, s, sy: s * 1.1 }); colliders.push(circle(x, z, s * 0.85)); }
  for (let i = 0; i < 70; i++) { const x = (rand() - 0.5) * 120, z = (rand() - 0.5) * 220 + 30; if (free(x, z, 5) && x < 20) { const s = 0.5 + rand() * 1.6; rocks.push({ x, z, y: height(x, z) - 0.1, s, sy: s * 0.8 }); if (Math.abs(x) < 60 && z > -40 && z < 105) colliders.push(circle(x, z, s * 0.85)); } }
  for (let i = 0; i < 40; i++) { const t = rand(), x = lerp(-45, -22, rand()), z = -50 + t * 80, s = 6 + rand() * 12; rocks.push({ x: x - 22, z, y: height(x - 22, z) - 3, s, sy: s * 1.2 }); }
  scatter(scene, rockGeos(4), rockMat(0xbab3a8), rocks, { seed: 62 });
  const drifts = [];
  for (let i = 0; i < 30; i++) { const p = road[Math.floor(rand() * road.length)]; const x = p[0] + (rand() < 0.5 ? -1 : 1) * (3.8 + rand() * 1.5), z = p[1] + (rand() - 0.5) * 10, s = 0.5 + rand() * 0.9; if (x < 18) drifts.push({ x, z, y: 0.0, s, sy: s * 0.22, tint: 0xf4f8ff }); }
  scatter(scene, rockGeos(2), mat(T.snow(), { rough: 0.9, color: 0xf2f6ff }), drifts, { seed: 63, shadow: false });

  // sapins épars et touffes d'herbe alpine
  const pines = [];
  for (let i = 0; i < 520; i++) {
    const a = rand() * Math.PI * 2, d = 18 + Math.sqrt(rand()) * 340, x = Math.cos(a) * d, z = Math.sin(a) * d + 20;
    if (!free(x, z, 6.5) || x > 20 && x < 100) continue;
    const y = height(x, z); if (y > 210 || y < -4) continue;
    const s = 0.9 + rand() * 0.9; pines.push({ x, z, y, s });
    if (Math.abs(x) < 60 && z > -40 && z < 105) colliders.push(circle(x, z, 0.3 * s + 0.1));
  }
  scatter(scene, pineGeos(3), pineMats(), pines, { seed: 64 });
  const tufts = [];
  for (let i = 0; i < 1600; i++) { const x = (rand() - 0.5) * 200, z = (rand() - 0.5) * 220 + 20; if (free(x, z, 3.4) && x < 20) { const y = height(x, z); if (y < 60) tufts.push({ x, z, y, s: 0.6 + rand() * 0.8, tint: 0xd8e0b0 }); } }
  scatter(scene, [tuftGeo()], tuftMat(), tufts, { shadow: false, seed: 65 });

  boundary(colliders, -42, 31, -34, 106);
  return { scene, sky, colliders };
}

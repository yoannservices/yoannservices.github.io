/* Segment de terrain (maillage 1,6 m coloré par sommet) et structures en bois : passerelles, rails, portiques, drapeaux. */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { fbm, clamp, smooth } from '../core/rng.js';
import { SURF } from '../core/config.js';
import { K } from './Features.js';
import { groundTex, plankTex, bannerTex, checkerTex } from './textures.js';

export const CHUNK = 40, CELL = 1.6;
let groundMat = null;
const gMat = () => groundMat || (groundMat = new THREE.MeshStandardMaterial({ vertexColors: true, map: groundTex(), roughness: 1, metalness: 0 }));

/* générateur : cède la main régulièrement pour que le chargement d'un segment se répartisse sur plusieurs images */
export function* buildTerrainChunk(track, biome, cx, cz) {
  const nv = CHUNK / CELL + 1 | 0, x0 = cx * CHUNK, z0 = cz * CHUNK, pos = new Float32Array(nv * nv * 3), uv = new Float32Array(nv * nv * 2), colr = new Float32Array(nv * nv * 3);
  for (let j = 0; j < nv; j++) {
    for (let i = 0; i < nv; i++) {
      const x = x0 + i * CELL, z = z0 + j * CELL, k = j * nv + i;
      pos[k * 3] = x; pos[k * 3 + 1] = track.height(x, z); pos[k * 3 + 2] = z; uv[k * 2] = x / 5; uv[k * 2 + 1] = z / 5;
    }
    if (j % 5 === 4) yield;
  }
  const idx = new Uint32Array((nv - 1) * (nv - 1) * 6);
  let t = 0;
  for (let j = 0; j < nv - 1; j++) for (let i = 0; i < nv - 1; i++) { const a = j * nv + i, b = a + 1, c = a + nv, d = c + 1; idx[t++] = a; idx[t++] = c; idx[t++] = b; idx[t++] = b; idx[t++] = c; idx[t++] = d; }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(new THREE.BufferAttribute(idx, 1));
  g.computeVertexNormals();
  const nrm = g.attributes.normal.array, tr = biome.trail, [ga, gb] = biome.ground, rock = biome.rock, volcano = track.biomeId === 'volcano';
  for (let j = 0; j < nv; j++) { if (j % 5 === 4) yield; for (let i = 0; i < nv; i++) {
    const k = j * nv + i, x = pos[k * 3], z = pos[k * 3 + 2], q = track.query(x, z);
    const mixG = clamp(0.5 + fbm(x * 0.04, z * 0.04, 2, track.ns) * 0.8, 0, 1);
    let r = ga[0] + (gb[0] - ga[0]) * mixG, gg = ga[1] + (gb[1] - ga[1]) * mixG, b = ga[2] + (gb[2] - ga[2]) * mixG;
    const rk = smooth(0.82, 0.6, nrm[k * 3 + 1]);
    r += (rock[0] - r) * rk; gg += (rock[1] - gg) * rk; b += (rock[2] - b) * rk;
    if (q) {
      const ad = Math.abs(q.dlat), w = 1 - smooth(q.hw * 0.85, q.hw * 1.35, ad), n = 0.92 + 0.16 * fbm(x * 0.9, z * 0.9, 2, 3);
      let tr0 = tr[0], tr1 = tr[1], tr2 = tr[2];
      if (q.surf === SURF.rock) { tr0 = rock[0] * 1.1; tr1 = rock[1] * 1.1; tr2 = rock[2] * 1.1; }
      if (q.risky) { tr0 *= 0.9; tr1 *= 0.85; tr2 *= 0.8; }
      r += (tr0 * n - r) * w; gg += (tr1 * n - gg) * w; b += (tr2 * n - b) * w;
    }
    if (volcano) { const lv = smooth(0.62, 0.72, fbm(x * 0.07, z * 0.07, 3, 9) * 0.5 + 0.5); r += (1 - r) * lv * 0.9; gg += (0.35 - gg) * lv; b += (0.05 - b) * lv; }
    colr[k * 3] = r; colr[k * 3 + 1] = gg; colr[k * 3 + 2] = b;
  } }
  g.setAttribute('color', new THREE.BufferAttribute(colr, 3));
  const m = new THREE.Mesh(g, gMat()); m.receiveShadow = true; m.frustumCulled = true;
  return m;
}

/* ───────── structures ───────── */
const box = (w, h, d, x, y, z, ry, hex) => { const g = new THREE.BoxGeometry(w, h, d); g.rotateY(ry); g.translate(x, y, z); const c = new THREE.Color(hex), a = new Float32Array(g.attributes.position.count * 3); for (let i = 0; i < a.length; i += 3) { a[i] = c.r; a[i + 1] = c.g; a[i + 2] = c.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; };
const bucket = (list) => (list.length ? mergeGeometries(list.map((g) => (g.index ? g.toNonIndexed() : g))) : null);

export function buildStructures(track, biome) {
  const group = new THREE.Group(), planks = [], wood = [], steel = [], posts = [], flags = [];
  const plank = new THREE.MeshStandardMaterial({ map: plankTex(), roughness: 0.9 });
  for (const l of track.lines) {
    for (let i = 0; i < l.n - 1; i++) {
      const kind = l.KIND[i]; if (kind !== K.BRIDGE && kind !== K.RAIL) continue;
      const th = l.TH[i], mx = (l.X[i] + l.X[i + 1]) / 2, mz = (l.Z[i] + l.Z[i + 1]) / 2, my = (l.Y[i] + l.Y[i + 1]) / 2, ry = -th, rx = Math.cos(th), rz = Math.sin(th);
      if (kind === K.BRIDGE) {
        const g = new THREE.BoxGeometry(l.HW[i] * 2.1, 0.14, 2.1); const p = g.attributes.uv; for (let u = 0; u < p.count; u++) p.setXY(u, p.getX(u) * 2, p.getY(u)); g.rotateY(ry); g.translate(mx, my - 0.08, mz); planks.push(g);
        for (const s of [-1, 1]) { wood.push(box(0.12, 1, 2, mx + rx * s * (l.HW[i] + 0.05), my + 0.5, mz + rz * s * (l.HW[i] + 0.05), ry, '#6b4a2b')); }
        if (i % 2 === 0) for (const s of [-1, 1]) wood.push(box(0.16, 1.1, 0.16, mx + rx * s * (l.HW[i] + 0.05), my + 0.5, mz + rz * s * (l.HW[i] + 0.05), ry, '#5a3d22'), box(0.4, 3, 0.4, mx + rx * s * (l.HW[i] + 0.1), my - 1.6, mz + rz * s * (l.HW[i] + 0.1), ry, '#4a321c'));
      } else {
        steel.push(box(0.34, 0.1, 2.1, mx, my + 0.46, mz, ry, '#9aa3ad'));
        if (i % 2 === 0) steel.push(box(0.14, 0.45, 0.14, mx, my + 0.22, mz, ry, '#6b7480'));
      }
    }
  }
  // balises : un poteau coloré tous les 36 m sur le bord, rouge sur les lignes risquées
  const main = track.lines[0], dcol = track.diff.col;
  for (const l of track.lines) for (let i = 4; i < l.n - 4; i += l.risky ? 8 : 18) posts.push(box(0.14, 1.5, 0.14, l.X[i] + Math.cos(l.TH[i]) * (l.HW[i] + 0.8), l.Y[i] + 0.75, l.Z[i] + Math.sin(l.TH[i]) * (l.HW[i] + 0.8), 0, l.risky ? '#ff3b30' : dcol));
  // drapeaux de points de contrôle
  for (const c of track.checkpoints) { const th = main.TH[c.i], x = c.x + Math.cos(th) * 3, z = c.z + Math.sin(th) * 3; flags.push(box(0.1, 3.2, 0.1, x, c.y + 1.6, z, 0, '#d8d8d8'), box(1.3, 0.8, 0.05, x + 0.7, c.y + 2.7, z, -th, '#2dd36f')); }
  const mk = (list, mat) => { const geo = bucket(list); if (!geo) return; const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; group.add(m); };
  mk(planks, plank);
  const vc = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 }), metal = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.8 });
  mk(wood, vc); mk(steel, metal); mk(posts, vc); mk(flags, vc);
  // portiques de départ et d'arrivée
  const gate = (p, text, th, tint) => {
    const g = new THREE.Group(), hw = main.HW[p.i] + 1.2;
    for (const s of [-1, 1]) { const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5, 0.3), vc.clone()); post.material.color.set('#2a2d33'); post.material.vertexColors = false; post.position.set(s * hw, 2.5, 0); g.add(post); }
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, 1.2), new THREE.MeshBasicMaterial({ map: bannerTex(text, tint, '#fff'), side: THREE.DoubleSide })); banner.position.set(0, 4.6, 0); g.add(banner);
    g.position.set(p.x, p.y, p.z); g.rotation.y = -th; return g;
  };
  group.add(gate(track.start, 'DÉPART', main.TH[track.start.i], '#16181c'));
  const fin = gate(track.finish, 'ARRIVÉE', main.TH[track.finish.i], '#111'); group.add(fin);
  const line = new THREE.Mesh(new THREE.PlaneGeometry(main.HW[track.finish.i] * 2.2, 1.4), new THREE.MeshBasicMaterial({ map: checkerTex(), transparent: true, opacity: 0.9 }));
  line.rotation.x = -Math.PI / 2; line.position.set(track.finish.x, track.finish.y + 0.05, track.finish.z); line.rotation.z = main.TH[track.finish.i]; group.add(line);
  // panneaux « ligne risquée » à chaque bifurcation
  for (const f of track.forks) {
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.1), new THREE.MeshBasicMaterial({ map: bannerTex('⚠ RISQUE', '#b3141b', '#fff'), side: THREE.DoubleSide }));
    const th = main.TH[Math.round(f.sa / 2)], off = f.side * 5;
    sign.position.set(f.x + Math.cos(th) * off, f.y + 2.2, f.z + Math.sin(th) * off); sign.rotation.y = -th; group.add(sign);
    const pole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 0.12), new THREE.MeshStandardMaterial({ color: 0x333333 })); pole.position.set(sign.position.x, f.y + 1.2, sign.position.z); group.add(pole);
  }
  return group;
}

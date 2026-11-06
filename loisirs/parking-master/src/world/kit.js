/* Briques communes des décors : matériaux, rubans (routes), relief, ciel et lumière, arbres, rochers, herbes, voitures garées. */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { loadGLB, bakeParts } from '../../../../assets/glb.js';
import { rng, noise2, fbm, clamp } from '../core/util.js';
import { box, circle } from '../gameplay/collision.js';
import { T } from './textures.js';

export const mat = (map, o = {}) => new THREE.MeshStandardMaterial({ map, bumpMap: o.nobump ? null : map, bumpScale: o.bump ?? 1.2, roughness: o.rough ?? 0.92, metalness: o.metal ?? 0, color: o.color ?? 0xffffff, vertexColors: !!o.vc, ...(o.side != null && { side: o.side }), transparent: !!o.alpha, polygonOffset: !!o.offset, polygonOffsetFactor: 0, polygonOffsetUnits: -(o.offset || 0) * 2 });
const flat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? 0.85, metalness: o.metal ?? 0, ...(o.side != null && { side: o.side }) });
export { flat };
export const pole = (r, h) => new THREE.CylinderGeometry(r, r * 1.15, h, 8).translate(0, h / 2, 0);

/* ---------- rubans : routes, pistes, parkings au sol ---------- */
export function curve(pts) {
  return new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], 0, p[1])), false, 'centripetal');
}
export function ribbon(pts, width, { step = 2, uvLen = 8, y = 0.02 } = {}) {
  const c = curve(pts), n = Math.max(2, Math.ceil(c.getLength() / step)), sp = c.getSpacedPoints(n);
  const pos = [], uv = [], idx = [];
  let len = 0;
  for (let i = 0; i <= n; i++) {
    const a = sp[Math.max(0, i - 1)], b = sp[Math.min(n, i + 1)], tx = b.x - a.x, tz = b.z - a.z, l = Math.hypot(tx, tz) || 1;
    const nx = -tz / l, nz = tx / l, p = sp[i];
    if (i) len += p.distanceTo(sp[i - 1]);
    pos.push(p.x + nx * width / 2, y, p.z + nz * width / 2, p.x - nx * width / 2, y, p.z - nz * width / 2);
    uv.push(0, len / uvLen, 1, len / uvLen);
    if (i < n) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  // la face visible doit regarder vers le haut : on inverse l'ordre si le premier triangle regarde vers le bas
  const a = new THREE.Vector3(pos[0], pos[1], pos[2]), b = new THREE.Vector3(pos[6], pos[7], pos[8]), d = new THREE.Vector3(pos[3], pos[4], pos[5]);
  if (new THREE.Vector3().crossVectors(b.sub(a), d.sub(a)).y < 0) { const i = g.index.array; for (let k = 0; k < i.length; k += 3) { const t = i[k + 1]; i[k + 1] = i[k + 2]; i[k + 2] = t; } }
  g.computeVertexNormals();
  return g;
}
/* Plan horizontal (rectangle) posé au sol, orienté `yaw`. */
export function slab(w, d, y = 0.02) { return new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2).translate(0, y, 0); }

/* Répète la texture d'une géométrie (boîte, plan, cylindre) : u fois en largeur, v fois en hauteur. */
export function scaleUV(g, u, v) { const a = g.attributes.uv; for (let i = 0; i < a.count; i++) a.setXY(i, a.getX(i) * u, a.getY(i) * v); return g; }

/* ---------- relief ---------- */
export function terrain({ size, seg, height, tint, map, tile = 8 }) {
  const g = new THREE.PlaneGeometry(size, size, seg, seg);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, height(p.getX(i), p.getZ(i)));
  g.computeVertexNormals();
  const nrm = g.attributes.normal, col = new Float32Array(p.count * 3), c = new THREE.Color(), uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    tint(c, p.getX(i), p.getZ(i), p.getY(i), 1 - nrm.getY(i));
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    uv.setXY(i, uv.getX(i) * size / tile, uv.getY(i) * size / tile);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map, vertexColors: true, roughness: 1, bumpMap: map, bumpScale: 1 }));
  m.receiveShadow = true;
  return m;
}

/* ---------- ciel, soleil, brume ---------- */
export function makeSky(scene, renderer, cfg) {
  const c = { elevation: 40, azimuth: 160, turbidity: 4, rayleigh: 1.4, mie: 0.004, mieG: 0.8, exposure: 0.55, fog: 0xbcd0e0, density: 0.0035, sun: 0xfff1d6, sunI: 3.2, hemi: [0xbfd8ff, 0x57503f, 0.85], envI: 0.55, ...cfg };
  const setup = (s) => {
    const u = s.material.uniforms;
    u.turbidity.value = c.turbidity; u.rayleigh.value = c.rayleigh; u.mieCoefficient.value = c.mie; u.mieDirectionalG.value = c.mieG;
    u.sunPosition.value.setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - c.elevation), THREE.MathUtils.degToRad(c.azimuth));
    s.scale.setScalar(10000);
  };
  const sky = new Sky(); setup(sky); scene.add(sky);
  const envScene = new THREE.Scene(), envSky = new Sky(); setup(envSky); envScene.add(envSky);
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(envScene).texture; scene.environmentIntensity = c.envI;
  pm.dispose();
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = c.exposure;
  scene.fog = new THREE.FogExp2(c.fog, c.density);
  scene.add(new THREE.HemisphereLight(c.hemi[0], c.hemi[1], c.hemi[2]));
  const dir = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - c.elevation), THREE.MathUtils.degToRad(c.azimuth));
  const sun = new THREE.DirectionalLight(c.sun, c.sunI);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 1, far: 260 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.05;
  scene.add(sun, sun.target);
  return { sun, dir, follow(x, z) { sun.target.position.set(x, 0, z); sun.position.set(x + dir.x * 120, dir.y * 120, z + dir.z * 120); sun.target.updateMatrixWorld(); } };
}

/* ---------- instanciation ---------- */
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color();
/* items : [{ x, y?, z, rot?, s?, sy?, tint? }] ; geos : une ou plusieurs variantes réparties au hasard ; mats : matériau ou tableau (groupes) */
export function scatter(parent, geos, mats, items, { shadow = true, receive = false, seed = 1 } = {}) {
  const r = rng(seed), list = Array.isArray(geos) ? geos : [geos], per = list.map(() => []);
  for (const it of items) per[Math.floor(r() * list.length)].push(it);
  const out = [];
  list.forEach((geo, k) => {
    const arr = per[k]; if (!arr.length) return;
    const im = new THREE.InstancedMesh(geo, mats, arr.length);
    arr.forEach((it, i) => {
      _e.set(it.rx || 0, it.rot ?? r() * Math.PI * 2, it.rz || 0); _q.setFromEuler(_e);
      const s = it.s ?? 1; _s.set(it.sx ?? s, it.sy ?? s, it.sz ?? s);
      _m.compose(_p.set(it.x, it.y || 0, it.z), _q, _s); im.setMatrixAt(i, _m);
      if (it.tint != null) im.setColorAt(i, _c.set(it.tint)); else im.setColorAt(i, _c.setScalar(0.88 + r() * 0.24));
    });
    im.castShadow = shadow; im.receiveShadow = receive; im.computeBoundingSphere();
    parent.add(im); out.push(im);
  });
  return out;
}

/* ---------- arbres ---------- */
function displace(geo, amp, freq, seed) {
  const p = geo.attributes.position, n = geo.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), d = (fbm(x * freq + seed, y * freq + z * freq * 0.7, 3, seed | 0) - 0.5) * 2 * amp;
    p.setXYZ(i, x + n.getX(i) * d, y + n.getY(i) * d, z + n.getZ(i) * d);
  }
  geo.computeVertexNormals();
  return geo;
}
function paintGeo(geo, fn) {
  const p = geo.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) { fn(c, p.getX(i), p.getY(i), p.getZ(i)); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return geo;
}
const white = (g) => paintGeo(g, (c) => c.set(0xffffff));
const clean = (g) => { for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv', 'color'].includes(k)) g.deleteAttribute(k); return g.index ? g.toNonIndexed() : g; };

export function oakGeos(count = 3) {
  const out = [];
  for (let v = 0; v < count; v++) {
    const r = rng(100 + v), H = 3 + r() * 1.2;
    const trunk = new THREE.CylinderGeometry(0.26, 0.5, H, 9, 4).translate(0, H / 2, 0);
    displace(trunk, 0.05, 2, v); white(trunk);
    const parts = [clean(trunk)];
    for (let b = 0; b < 3; b++) { // grosses branches
      const br = new THREE.CylinderGeometry(0.09, 0.18, 2.6, 6).translate(0, 1.3, 0).rotateZ((r() - 0.5) * 1.2).rotateY(r() * 6.28).translate(0, H * 0.75, 0);
      parts.push(clean(white(br)));
    }
    const blobs = [];
    const n = 7 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const rad = 1.7 + r() * 1.1, a = r() * 6.28, d = i ? 1.2 + r() * 1.5 : 0, y = H + 1.3 + r() * 2.4;
      const g = new THREE.IcosahedronGeometry(rad, 2).scale(1, 0.82, 1).translate(Math.cos(a) * d, y, Math.sin(a) * d);
      displace(g, 0.32, 0.9, v * 10 + i);
      paintGeo(g, (c, x, yy) => { const k = clamp((yy - H) / 6, 0, 1); c.setRGB(0.55 + 0.5 * k, 0.65 + 0.5 * k, 0.45 + 0.35 * k).multiplyScalar(0.8 + r() * 0.35); });
      blobs.push(clean(g));
    }
    out.push(mergeGeometries([mergeGeometries(parts), mergeGeometries(blobs)], true));
  }
  return out;
}
export function pineGeos(count = 3) {
  const out = [];
  for (let v = 0; v < count; v++) {
    const r = rng(200 + v), H = 8 + r() * 3;
    const trunk = clean(white(displace(new THREE.CylinderGeometry(0.14, 0.34, H, 7, 4).translate(0, H / 2, 0), 0.04, 2, v)));
    const cones = [], layers = 6 + Math.floor(r() * 2);
    for (let i = 0; i < layers; i++) {
      const t = i / (layers - 1), rad = 2.6 * (1 - t * 0.82) + 0.2, h = 2.5 - t * 0.7, y = 1.8 + t * (H - 3.2);
      const g = new THREE.ConeGeometry(rad, h, 10, 3, true).translate(0, y + h / 2, 0);
      displace(g, 0.22, 1.3, v * 20 + i);
      paintGeo(g, (c, x, yy, z) => { const e = clamp(Math.hypot(x, z) / rad, 0, 1); c.setRGB(0.5 + 0.35 * (1 - e), 0.62 + 0.3 * (1 - e), 0.5 + 0.2 * (1 - e)).multiplyScalar(0.75 + r() * 0.3); });
      cones.push(clean(g));
    }
    out.push(mergeGeometries([trunk, mergeGeometries(cones)], true));
  }
  return out;
}
export const oakMats = () => [mat(T.bark(), { vc: true, rough: 1, bump: 2 }), new THREE.MeshStandardMaterial({ map: T.leaves(), vertexColors: true, roughness: 0.85, side: THREE.DoubleSide, bumpMap: T.leaves(), bumpScale: 1.5 })];
export const pineMats = () => [mat(T.bark(), { vc: true, rough: 1, bump: 2 }), new THREE.MeshStandardMaterial({ map: T.needles(), vertexColors: true, roughness: 0.9, side: THREE.DoubleSide, bumpMap: T.needles(), bumpScale: 1.5 })];

/* ---------- rochers, touffes d'herbe, buissons ---------- */
export function rockGeos(count = 4) {
  const out = [];
  for (let v = 0; v < count; v++) {
    const g = new THREE.IcosahedronGeometry(1, 3);
    displace(g, 0.34, 1.4, 300 + v * 5);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, Math.max(p.getY(i), -0.45) * 0.8); // base aplatie
    g.computeVertexNormals();
    out.push(g);
  }
  return out;
}
export const rockMat = (color = 0xffffff) => mat(T.rock(), { rough: 0.95, bump: 3, color });

export function tuftGeo() {
  const q = (a) => new THREE.PlaneGeometry(1.2, 0.9).translate(0, 0.45, 0).rotateY(a);
  return mergeGeometries([q(0), q(Math.PI / 2), q(Math.PI / 4), q(-Math.PI / 4)].map(clean));
}
export const tuftMat = () => new THREE.MeshStandardMaterial({ map: T.tuft(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 1 });

export function bushGeos() {
  return [0, 1].map((v) => {
    const g = new THREE.IcosahedronGeometry(1, 2).scale(1, 0.75, 1).translate(0, 0.7, 0);
    displace(g, 0.25, 1.6, 400 + v);
    return paintGeo(g, (c, x, y) => c.setRGB(0.5 + 0.3 * y, 0.62 + 0.3 * y, 0.38 + 0.15 * y));
  });
}
export const bushMat = () => new THREE.MeshStandardMaterial({ map: T.leaves(), vertexColors: true, roughness: 0.9, bumpMap: T.leaves(), bumpScale: 1.5 });

/* ---------- voitures garées : instances de la même collection de modèles que la voiture du joueur ---------- */
export const CARS = {
  compact: { file: 'car-compact', yaw: 0 }, coupe: { file: 'car-coupe', yaw: 0 }, hatchback: { file: 'car-hatchback', yaw: 0 },
  minivan: { file: 'car-minivan', yaw: 0 }, offroad: { file: 'car-offroad', yaw: 0 }, pickup: { file: 'car-pickup', yaw: 0 },
  sedan: { file: 'car-sedan', yaw: 0 }, sport: { file: 'car-sport', yaw: 0 }, suv: { file: 'car-suv', yaw: 0 }, wagon: { file: 'car-wagon', yaw: 0 },
};
export const carUrl = (type) => new URL(`../../../../assets/models/npc/${CARS[type].file}.glb`, import.meta.url).href;

const kits = {};
export async function carKit(type) {
  if (!kits[type]) kits[type] = loadGLB(carUrl(type)).then((scene) => {
    const k = bakeParts(scene, 1);
    if (k.size.x > k.size.z) { for (const p of k.parts) p.geo.rotateY(Math.PI / 2); [k.size.x, k.size.z] = [k.size.z, k.size.x]; }
    if (CARS[type].yaw) for (const p of k.parts) p.geo.rotateY(CARS[type].yaw);
    return k;
  }).catch((e) => { delete kits[type]; throw e; });   // un échec réseau ne doit pas rester en cache
  return kits[type];
}

/* list : [{ type, x, z, yaw, color? }] -> instances (une par pièce et par type), renvoie les obstacles (rectangles) */
export async function parkedCars(parent, list) {
  const colliders = [], byType = {};
  for (const it of list) (byType[it.type] = byType[it.type] || []).push(it);
  for (const type of Object.keys(byType)) {
    const kit = await carKit(type), arr = byType[type];
    for (const part of kit.parts) {
      const body = /body/i.test(part.mat.name || '');
      const im = new THREE.InstancedMesh(part.geo, part.mat, arr.length);
      arr.forEach((it, i) => {
        _q.setFromEuler(_e.set(0, it.yaw, 0)); _m.compose(_p.set(it.x, 0, it.z), _q, _s.set(1, 1, 1)); im.setMatrixAt(i, _m);
        im.setColorAt(i, body && it.color != null ? _c.set(it.color) : _c.set(0xffffff));
      });
      im.castShadow = true; im.receiveShadow = true; im.computeBoundingSphere(); parent.add(im);
    }
    for (const it of arr) colliders.push(box(it.x, it.z, kit.size.x * 0.49, kit.size.z * 0.49, -it.yaw));
  }
  return colliders;
}
export const carSize = async (type) => (await carKit(type)).size;

export { box, circle, noise2, fbm, clamp };

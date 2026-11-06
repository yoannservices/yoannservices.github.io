/* Outils partagés par les quatre lieux : scène et ciel, sol, marquages, distance à un chemin, semis d'arbres, murs invisibles. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { box } from '../gameplay/collision.js';
import { makeSky, mat, ribbon, slab, flat, parkedCars, carSize, pole } from './kit.js';
import { makeNpcs } from './npc.js';
import { rng } from '../core/util.js';
import { T } from './textures.js';

export function makeScene(renderer, skyCfg) {
  const scene = new THREE.Scene();
  const sky = makeSky(scene, renderer, skyCfg);
  scene.background = null;
  return { scene, sky };
}

export function addGround(scene, { size = 2400, map, tile = 10, color = 0xffffff, y = -0.03 }) {
  const g = new THREE.PlaneGeometry(size, size).rotateX(-Math.PI / 2);
  const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * size / tile, uv.getY(i) * size / tile);
  const m = new THREE.Mesh(g, mat(map, { color, rough: 1 })); m.position.y = y; m.receiveShadow = true; scene.add(m);
  return m;
}

/* Ruban texturé posé au sol (route, piste, parking). `order` : surélévation pour éviter le scintillement entre rubans qui se croisent. */
export function pave(scene, pts, width, map, { uvLen = 10, y = 0.02, step = 2, order = 1, alpha = false, color = 0xffffff } = {}) {
  const m = new THREE.Mesh(ribbon(pts, width, { uvLen, y, step }), mat(map, { offset: order, color, side: THREE.DoubleSide, alpha, rough: 0.95 }));
  m.receiveShadow = true; scene.add(m);
  return m;
}
/* Plan rectangulaire horizontal (x0..x1, z0..z1) texturé. */
export function pad(scene, x0, x1, z0, z1, map, { tile = 8, y = 0.02, order = 1, color = 0xffffff } = {}) {
  const w = x1 - x0, d = z1 - z0, g = slab(w, d, y);
  const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / tile, uv.getY(i) * d / tile);
  const m = new THREE.Mesh(g, mat(map, { offset: order, color, rough: 0.95 })); m.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); m.receiveShadow = true; scene.add(m);
  return m;
}
/* Peinture blanche : liste de rectangles { x, z, w, d, yaw? } fusionnés en un seul objet. */
export function paint(scene, rects, { color = 0xf1efe6, y = 0.05, order = 4 } = {}) {
  const geos = rects.map((r) => { const g = slab(r.w, r.d, y); g.rotateY(r.yaw || 0); g.translate(r.x, 0, r.z); return g; });
  const merged = geos.length ? mergeFlat(geos) : null;
  if (!merged) return;
  const m = new THREE.Mesh(merged, new THREE.MeshStandardMaterial({ color, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: 0, polygonOffsetUnits: -order * 2 }));
  m.receiveShadow = true; scene.add(m);
}
function mergeFlat(geos) {
  const pos = [], nor = [], idx = [];
  geos.forEach((g) => { const o = pos.length / 3, p = g.attributes.position, n = g.attributes.normal; for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); } for (const i of g.index.array) idx.push(i + o); });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setIndex(idx);
  return g;
}

/* Distance d'un point à une ligne brisée (x, z). */
export function distToPath(x, z, pts) {
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2));
    best = Math.min(best, Math.hypot(x - (ax + t * dx), z - (az + t * dz)));
  }
  return best;
}

/* Anneau de murs invisibles autour du terrain de jeu [x0..x1] x [z0..z1] (la voiture ne peut pas en sortir). */
export function boundary(colliders, x0, x1, z0, z1, t = 6) {
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, hx = (x1 - x0) / 2, hz = (z1 - z0) / 2;
  colliders.push(box(cx, z0 - t, hx + t * 2, t), box(cx, z1 + t, hx + t * 2, t), box(x0 - t, cz, t, hz + t * 2), box(x1 + t, cz, t, hz + t * 2));
}

/* Poteau cylindrique simple (lampadaire, panneau, borne) : géométrie réutilisable. */
export { flat, mat, T, pole };

const PAL = [0xb7bcc2, 0x1f242a, 0xc1272d, 0x2d4f8a, 0xf1f1ee, 0x3f6b4e, 0xd9a441, 0x6b4a8a, 0x8b8f96, 0x7a2a2a];

/* Squelette d'un décor : scène, ciel (ou éclairage intérieur), obstacles, voitures garées, peinture au sol, PNJ.
   o : { sky, ground: { map, tile, color }, bounds: [x0, x1, z0, z1], indoor, seed }.
   Le décor appelle ctx.bays(...), pave(ctx.scene, ...) etc., puis `return ctx.finish({ cars: [...], peds: [...] })`. */
export function begin(renderer, o) {
  const colliders = [], rand = rng(o.seed || 1);
  let scene, sky;
  if (o.indoor) {
    scene = new THREE.Scene(); scene.background = new THREE.Color(0x24272c); scene.fog = new THREE.FogExp2(0x24272c, 0.01);
    scene.add(new THREE.HemisphereLight(0xeef3fb, 0x6a6d76, o.indoor.light ?? 2.2));
    const pm = new THREE.PMREMGenerator(renderer);   // salle neutre : reflets et éclairage doux sur les carrosseries
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 1.0; pm.dispose();
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.85;
    const lamp = new THREE.DirectionalLight(0xffffff, o.indoor.sun ?? 1.1);   // lumière « des néons » : sert surtout aux ombres sous les voitures
    lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048);
    Object.assign(lamp.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 40 }); lamp.shadow.bias = -0.0005; lamp.shadow.normalBias = 0.04;
    scene.add(lamp, lamp.target);
    sky = { follow(x, z) { lamp.target.position.set(x, 0, z); lamp.position.set(x + 4, 20, z + 3); lamp.target.updateMatrixWorld(); } };
  } else ({ scene, sky } = makeScene(renderer, o.sky));
  if (o.ground) addGround(scene, o.ground);
  const ctx = { scene, sky, colliders, rand, cars: [], rects: [], indoor: o.indoor, maxY: o.indoor ? o.indoor.ceiling - 0.25 : undefined };
  if (o.bounds) boundary(colliders, ...o.bounds);

  /* Rangée de places : `count` places côté à côté (pas `pitch`), profondeur `depth`, nez de la voiture vers `yaw`.
     skip : indices sans voiture ; fill : part de places occupées ; types : modèles possibles. Le trait de séparation est peint. */
  ctx.bays = ({ x, z, yaw, count, pitch = 2.6, depth = 5, skip = [], fill = 0.85, types = ['hatchback', 'sedan', 'wagon', 'sport', 'compact', 'suv', 'minivan'], paintLines = true, gap = 0.0, avoid = [], lineYaw = yaw }) => {
    const f = [Math.sin(yaw), Math.cos(yaw)], l = [Math.cos(lineYaw), -Math.sin(lineYaw)];   // lineYaw : orientation de la rangée (places en épi : la rangée n'est pas perpendiculaire au nez)
    for (let i = 0; i < count; i++) {
      const off = (i - (count - 1) / 2) * pitch, cx = x + l[0] * off, cz = z + l[1] * off;
      if (skip.includes(i) || avoid.some(([ax, az]) => Math.hypot(ax - cx, az - cz) < pitch * 0.6) || rand() > fill) continue;
      const type = types[Math.floor(rand() * types.length)], jy = (rand() - 0.5) * 0.06, jl = (rand() - 0.5) * 0.18;
      ctx.cars.push({ type, x: cx + l[0] * jl - f[0] * gap, z: cz + l[1] * jl - f[1] * gap, yaw: yaw + jy, color: PAL[Math.floor(rand() * PAL.length)] });
    }
    if (paintLines) for (let i = 0; i <= count; i++) { const off = (i - count / 2) * pitch; ctx.rects.push({ x: x + l[0] * off, z: z + l[1] * off, w: 0.1, d: depth, yaw }); }
  };
  /* Voiture garée placée à la main. */
  ctx.car = (type, x, z, yaw, color) => ctx.cars.push({ type, x, z, yaw, color: color ?? PAL[Math.floor(rand() * PAL.length)] });

  ctx.finish = async ({ cars = [], peds = [] } = {}) => {
    colliders.push(...await parkedCars(scene, ctx.cars));
    if (ctx.rects.length) paint(scene, ctx.rects, { y: 0.09 });
    const update = await makeNpcs(scene, colliders, { cars, peds });
    return { scene, sky, colliders, update, maxY: ctx.maxY };
  };
  return ctx;
}
export { PAL };

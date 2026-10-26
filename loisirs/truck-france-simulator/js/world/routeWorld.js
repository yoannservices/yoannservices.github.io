import * as THREE from 'three';
import { byId } from '../map/graph.js';

export const WORLD_SCALE = 20; // 1 m de jeu = 20 m réels : un trajet de 800 km se joue sur 40 km
export const HALF = 5;         // demi-largeur de chaussée (2 voies de 5 m avec bas-côtés)
const DS = 5;                  // pas d'échantillonnage de l'axe (m)
const EXT = 250;               // prolongement droit avant le départ et après l'arrivée
const STATION_EVERY = 2500;    // ≈ 50 km réels

const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95, ...o });

/** Projette les villes du trajet en mètres de jeu (x est, z sud). */
function project(path) {
  const a = byId[path[0]], k = Math.cos((a.lat * Math.PI) / 180);
  return path.filter((id, i) => id !== path[i - 1]).map((id) => {
    const c = byId[id];
    return new THREE.Vector3(((c.lon - a.lon) * k * 111320) / WORLD_SCALE, 0, (-(c.lat - a.lat) * 110574) / WORLD_SCALE);
  });
}

/** Construit la route 3D le long du trajet : axe lissé, chaussée, arbres, stations-service. */
export function buildRouteWorld(route) {
  const pts = project(route.path);
  const d0 = pts[1].clone().sub(pts[0]).normalize(), d1 = pts.at(-1).clone().sub(pts.at(-2)).normalize();
  pts.unshift(pts[0].clone().addScaledVector(d0, -EXT));
  pts.push(pts.at(-1).clone().addScaledVector(d1, EXT));

  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  let chord = 0;
  for (let i = 1; i < pts.length; i++) chord += pts[i].distanceTo(pts[i - 1]);
  curve.arcLengthDivisions = Math.ceil(chord / 2);
  const P = curve.getSpacedPoints(Math.floor(chord / DS));
  const n = P.length, ds = curve.getLength() / (n - 1), length = curve.getLength();
  const T = P.map((p, i) => { const q = P[Math.min(i + 1, n - 1)], r = P[Math.max(i - 1, 0)]; return new THREE.Vector2(q.x - r.x, q.z - r.z).normalize(); });
  const left = (i) => new THREE.Vector2(T[i].y, -T[i].x); // gauche du sens de marche

  const group = new THREE.Group();

  // rubans de chaussée / marquages
  const ribbon = (from, to, width, y, color, step = 1, o = {}) => {
    const pos = [], idx = [];
    for (let i = 0; i < n; i += step) {
      const l = left(i), c = (from + to) / 2;
      for (const off of [c + width / 2, c - width / 2]) pos.push(P[i].x + l.x * off, y, P[i].z + l.y * off);
    }
    const m = new THREE.Mesh(new THREE.BufferGeometry(), mat(color, o));
    m.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const cnt = pos.length / 6;
    for (let k = 0; k < cnt - 1; k++) { const a = k * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    m.geometry.setIndex(idx);
    m.geometry.computeVertexNormals();
    m.material.side = THREE.DoubleSide;
    m.receiveShadow = true;
    group.add(m);
    return m;
  };
  ribbon(0, 0, HALF * 2, 0.03, 0x2b2d33);
  for (const side of [1, -1]) ribbon(side * (HALF - 0.4), side * (HALF - 0.4), 0.25, 0.05, 0xe5e7eb);
  // tirets du milieu : un quad sur deux (deux rubans courts consécutifs, 5 m sur 5 m)
  const dashPos = [], dashIdx = [];
  for (let i = 0; i < n - 1; i += 2) {
    const l = left(i), l2 = left(i + 1), b = dashPos.length / 3;
    dashPos.push(P[i].x + l.x * 0.15, 0.05, P[i].z + l.y * 0.15, P[i].x - l.x * 0.15, 0.05, P[i].z - l.y * 0.15,
      P[i + 1].x + l2.x * 0.15, 0.05, P[i + 1].z + l2.y * 0.15, P[i + 1].x - l2.x * 0.15, 0.05, P[i + 1].z - l2.y * 0.15);
    dashIdx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
  }
  const dash = new THREE.Mesh(new THREE.BufferGeometry(), mat(0xe5e7eb, { side: THREE.DoubleSide }));
  dash.geometry.setAttribute('position', new THREE.Float32BufferAttribute(dashPos, 3));
  dash.geometry.setIndex(dashIdx);
  group.add(dash);

  // pose sur l'axe à l'abscisse s, décalée latéralement de off (+ = gauche)
  const at = (s, off = 0) => {
    const i = Math.min(n - 1, Math.max(0, Math.round(s / ds))), l = left(i);
    return { x: P[i].x + l.x * off, z: P[i].z + l.y * off, h: Math.atan2(T[i].x, T[i].y), i };
  };

  // stations-service : plateforme à droite de la route + auvent + totem
  const stations = [];
  for (let s = 1500; s < length - EXT - 400; s += STATION_EVERY) {
    const p = at(s, -(HALF + 11));
    stations.push({ s, x: p.x, z: p.z });
    const g = new THREE.Group();
    g.position.set(p.x, 0, p.z);
    g.rotation.y = p.h;
    const add = (w, h, d, m, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; g.add(b); return b; };
    add(22, 0.06, 40, mat(0x3a3c44), 0, 0.04, 0);
    add(14, 0.4, 9, mat(0xeab308), 0, 5.5, 0);
    for (const [x, z] of [[-6, -3.5], [6, -3.5], [-6, 3.5], [6, 3.5]]) add(0.4, 5.5, 0.4, mat(0xcbd5e1), x, 2.75, z);
    for (const x of [-3, 3]) add(0.8, 1.4, 1.6, mat(0xef4444), x, 0.7, 0);
    add(8, 3.5, 5, mat(0xe2e8f0), -4, 1.75, 15);
    add(0.5, 9, 0.5, mat(0xcbd5e1), 8, 4.5, -18);
    add(3, 2, 0.4, mat(0xeab308, { emissive: 0xeab308, emissiveIntensity: 0.6 }), 8, 9.5, -18);
    group.add(g);
  }

  // arbres : un tous les 30 m de chaque côté
  const trees = [];
  for (let i = 0; i < n; i += 6) for (const side of [-1, 1]) {
    const s = i * ds;
    if (stations.some((st) => Math.abs(st.s - s) < 30)) continue;
    trees.push(at(s, side * (HALF + 5 + Math.random() * 40)));
  }
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.3, 0.4, 3, 6), mat(0x5b3a1e), trees.length);
  const crowns = new THREE.InstancedMesh(new THREE.ConeGeometry(2.4, 7, 7), mat(0x2f7a3c), trees.length);
  trunks.castShadow = crowns.castShadow = true;
  const o = new THREE.Object3D();
  trees.forEach((t, i) => {
    const sc = 0.8 + Math.random() * 0.7;
    o.scale.setScalar(sc);
    o.position.set(t.x, 1.5 * sc, t.z); o.updateMatrix(); trunks.setMatrixAt(i, o.matrix);
    o.position.set(t.x, 6 * sc, t.z); o.updateMatrix(); crowns.setMatrixAt(i, o.matrix);
  });
  group.add(trunks, crowns);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), mat(0x3f6b3a, { roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);

  let hint = 0;
  /** Position du camion par rapport à la route : s (abscisse), d (écart latéral, + gauche), off (hors chaussée). */
  const query = (x, z) => {
    const near = (a, b) => { let best = a, bd = Infinity; for (let i = a; i <= b; i++) { const d = (P[i].x - x) ** 2 + (P[i].z - z) ** 2; if (d < bd) { bd = d; best = i; } } return [best, bd]; };
    let [i, bd] = near(Math.max(0, hint - 40), Math.min(n - 1, hint + 40));
    if (bd > 100 * 100) [i, bd] = near(0, n - 1); // téléportation (reset) : recherche globale
    hint = i;
    const dx = x - P[i].x, dz = z - P[i].z, l = left(i);
    const s = i * ds + dx * T[i].x + dz * T[i].y, d = dx * l.x + dz * l.y;
    const onPad = stations.some((st) => Math.abs(st.s - s) < 20 && d < -HALF && d > -(HALF + 22));
    return { s, d, off: Math.abs(d) > HALF + 0.5 && !onPad };
  };

  return {
    group, length, ds, stations, at, query,
    startS: EXT + 10, endS: length - EXT,
    update(focus) { ground.position.set(Math.round(focus.x / 100) * 100, -0.02, Math.round(focus.z / 100) * 100); },
  };
}

import * as THREE from 'three';
import { WHEELBASE } from './truckData.js';

const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.2, ...o });
const TIRE = mat(0x15151b, { roughness: 0.9 });
const RIM = mat(0x9aa3b2, { metalness: 0.7 });
const GLASS = mat(0x0b1520, { roughness: 0.1, metalness: 0.8 });
const DARK = mat(0x23232e);
const LIGHT = mat(0xfff3c4, { emissive: 0xfff3c4, emissiveIntensity: 0.2 });
const WG = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16).rotateZ(Math.PI / 2);
const RG = new THREE.CylinderGeometry(0.28, 0.28, 0.32, 10).rotateZ(Math.PI / 2);

function box(parent, w, h, d, m, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  mesh.position.set(x, y, z);
  mesh.castShadow = mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function wheel(parent, x, z, spinners, steerers, steered = false) {
  const pivot = new THREE.Group();
  pivot.position.set(x, 0.5, z);
  const inner = new THREE.Group();
  const t = new THREE.Mesh(WG, TIRE); t.castShadow = true;
  inner.add(t, new THREE.Mesh(RG, RIM));
  pivot.add(inner);
  parent.add(pivot);
  spinners.push(inner);
  if (steered) steerers.push(pivot);
}

function buildTractor(cab, spinners, steerers, lights) {
  const g = new THREE.Group();
  const L = WHEELBASE, H = cab.cabH, paint = mat(cab.color, { metalness: 0.4, roughness: 0.4 });
  box(g, 2.2, 0.35, L + 3.1, DARK, 0, 0.8, 1.55);                       // châssis
  box(g, 2.5, H, 2.3, paint, 0, 1.0 + H / 2, L - 0.1);                    // cabine
  box(g, 2.3, H * 0.38, 0.05, GLASS, 0, 1.0 + H * 0.68, L + 1.06);        // pare-brise
  for (const s of [-1, 1]) box(g, 0.05, H * 0.34, 1.2, GLASS, s * 1.26, 1.0 + H * 0.68, L - 0.3);
  box(g, 1.8, 0.6, 0.06, DARK, 0, 1.5, L + 1.06);                         // calandre
  for (const s of [-1, 1]) {
    box(g, 0.35, 0.22, 0.06, LIGHT, s * 0.9, 1.35, L + 1.07);
    box(g, 0.25, 0.5, 0.7, mat(0xaab2c0, { metalness: 0.8 }), s * 1.2, 0.75, 1.6); // réservoirs
  }
  if (cab.sleeper) box(g, 2.5, H, 1.3, paint, 0, 1.0 + H / 2, L - 1.9);   // couchette
  else if (cab.cabH > 2.5) box(g, 2.3, 0.7, 1.4, paint, 0, 1.0 + H + 0.35, L - 0.5).rotation.x = 0.35; // déflecteur
  const fw = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 16), DARK);
  fw.position.set(0, 1.05, -0.3); g.add(fw);                              // sellette
  for (const s of [-1, 1]) {
    wheel(g, s * 1.05, L, spinners, steerers, true);
    for (const z of [0, -1.3]) { wheel(g, s * 0.95, z, spinners, steerers); wheel(g, s * 1.3, z, spinners, steerers); }
  }
  // phares réels
  const spot = new THREE.SpotLight(0xfff0cc, 0, 90, 0.5, 0.5, 1.2);
  spot.position.set(0, 1.4, L + 1);
  spot.target.position.set(0, 0.5, L + 40);
  g.add(spot, spot.target);
  lights.push(spot);
  return g;
}

function buildTrailer(tr, spinners) {
  const g = new THREE.Group(), len = tr.length, y0 = 1.2;
  box(g, 2.4, 0.3, len, DARK, 0, 1.05, -len / 2);
  const mid = -len / 2;
  switch (tr.id) {
    case 'tarp':
      box(g, 2.5, 2.9, len - 0.4, mat(0x3d5a47, { roughness: 0.9 }), 0, y0 + 1.5, mid);
      break;
    case 'reefer':
      box(g, 2.5, 2.9, len - 0.4, mat(0xf1f5f9), 0, y0 + 1.5, mid);
      box(g, 2.2, 1.0, 0.6, mat(0x94a3b8), 0, y0 + 2.6, -0.5);
      break;
    case 'tanker': {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, len - 1, 24).rotateX(Math.PI / 2), mat(0xc8d0dc, { metalness: 0.85, roughness: 0.3 }));
      t.position.set(0, y0 + 1.25, mid); t.castShadow = true; g.add(t);
      break;
    }
    case 'flatbed':
      box(g, 2.5, 0.2, len - 0.2, mat(0x9a7b4f), 0, y0 + 0.1, mid);
      for (const [z, w] of [[-3, 1.4], [-6.5, 1.8], [-10, 1.2]]) box(g, 2, w, 1.8, mat(0xc19a6b), 0, y0 + 0.2 + w / 2, z);
      break;
    case 'container':
      box(g, 2.5, 2.6, len - 0.4, mat(0xea580c, { roughness: 0.7 }), 0, y0 + 1.45, mid);
      break;
  }
  const az = -tr.axleDist;
  for (const s of [-1, 1]) for (const dz of [0, -1.3, -2.6]) { wheel(g, s * 0.95, az + dz, spinners, []); wheel(g, s * 1.3, az + dz, spinners, []); }
  for (const s of [-1, 1]) box(g, 0.3, 0.2, 0.06, mat(0xff2222, { emissive: 0xff2222, emissiveIntensity: 0.6 }), s * 1.0, 1.1, -len - 0.01);
  return g;
}

/** Retourne { root, tractor, trailerG, update(phys), setLights(on), dispose() } */
export function buildTruck(cab, trailer) {
  const spinners = [], steerers = [], lights = [];
  const root = new THREE.Group();
  const tractor = buildTractor(cab, spinners, steerers, lights);
  tractor.rotation.order = 'YXZ';
  const trailerG = buildTrailer(trailer, spinners);
  root.add(tractor, trailerG);
  return {
    root, tractor, trailerG,
    update(p) {
      const hp = p.hitch;
      root.position.set(0, 0, 0);
      tractor.position.set(p.x, 0, p.z);
      tractor.rotation.set(-p.accel * 0.003, p.h, p.lat * 0.004);
      trailerG.position.set(hp.x, 0, hp.z);
      trailerG.rotation.y = p.th;
      for (const s of spinners) s.rotation.x = p.wheelAngle;
      for (const s of steerers) s.rotation.y = p.steer * 0.8;
    },
    setLights(on) { for (const l of lights) l.intensity = on ? 600 : 0; },
  };
}

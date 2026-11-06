/* Voiture du joueur : modèle .glb du pack « Generic passenger car pack » (assets/models/npc), roues animées (rotation et braquage),
   dimensions mesurées sur le modèle (empattement, essieu arrière) pour la physique. */
import * as THREE from 'three';
import { loadGLB, fitGLB, rigWheels, poseWheel } from '../../../../assets/glb.js';
import { CARS, carUrl } from '../world/kit.js';
import { clamp } from '../core/util.js';

export async function loadCar(type) {
  const scene = await loadGLB(carUrl(type));
  const nat = new THREE.Box3().setFromObject(scene).getSize(new THREE.Vector3());
  const out = fitGLB(scene, Math.max(nat.x, nat.z), CARS[type].yaw);
  out.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  const wheels = rigWheels(out);
  const body = new THREE.Box3().setFromObject(out).getSize(new THREE.Vector3());
  const zs = (front) => { const w = wheels.filter((k) => k.front === front); return w.reduce((s, k) => s + k.c.z, 0) / Math.max(1, w.length); };
  const zf = zs(true), zr = zs(false);
  const radius = wheels.length ? new THREE.Box3().setFromObject(wheels[0].spin).getSize(new THREE.Vector3()).y / 2 : 0.32;
  const dim = { length: body.z, width: body.x, wheelbase: Math.max(1.6, zf - zr), rearBehind: -zr, radius, name: type };

  const root = new THREE.Group(), tilt = new THREE.Group();
  tilt.add(out); root.add(tilt);
  let spin = 0;
  return {
    root, dim,
    /* Met la voiture à la position de la physique : cap, roues, tangage et roulis de la caisse. */
    update(ph, dt) {
      root.position.set(ph.x, 0, ph.z); root.rotation.y = ph.yaw;
      spin += ph.v * dt / radius;
      for (const w of wheels) poseWheel(w, spin, ph.steer);
      tilt.rotation.x += (clamp(-ph.acc * 0.0045, -0.035, 0.035) - tilt.rotation.x) * Math.min(1, 8 * dt);
      tilt.rotation.z += (clamp(ph.v * ph.yawRate * 0.0028, -0.035, 0.035) - tilt.rotation.z) * Math.min(1, 8 * dt);
    },
    dispose() { root.traverse((o) => { if (o.isMesh) o.geometry.dispose(); }); },
  };
}

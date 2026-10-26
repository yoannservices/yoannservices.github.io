import * as THREE from 'three';
import { HALF } from '../world/routeWorld.js';

const LANE = HALF / 2;       // axe d'une voie
const SAME_SPEED = 20;        // m/s (72 km/h) dans le sens du camion
const ONCOMING_SPEED = 22;
const BODY = new THREE.BoxGeometry(1.8, 0.8, 4.4), CAB = new THREE.BoxGeometry(1.6, 0.6, 2.2);
const COLORS = [0xef4444, 0x3b82f6, 0xe5e7eb, 0x111827, 0xeab308, 0x22c55e, 0x94a3b8];

/** Voitures IA : suivent l'axe de la route, freinent derrière un obstacle, sont recyclées autour du camion. */
export class Traffic {
  constructor(scene, world, count = 14) {
    this.world = world;
    this.cars = Array.from({ length: count }, (_, i) => {
      const g = new THREE.Group(), body = new THREE.MeshStandardMaterial({ color: COLORS[i % COLORS.length], roughness: 0.4 });
      const a = new THREE.Mesh(BODY, body), b = new THREE.Mesh(CAB, new THREE.MeshStandardMaterial({ color: 0x0b1520 }));
      a.position.y = 0.7; b.position.set(0, 1.35, -0.2);
      a.castShadow = true;
      g.add(a, b);
      scene.add(g);
      return { g, dir: i % 3 === 0 ? -1 : 1, s: 0, v: 0, cool: 0 }; // 1 voiture sur 3 en sens inverse
    });
    this.group = this.cars.map((c) => c.g);
    this.respawnAll(this.world.startS);
  }

  dispose(scene) { this.group.forEach((g) => scene.remove(g)); }

  respawnAll(truckS) {
    let front = truckS + 120;
    for (const c of this.cars) {
      c.s = c.dir === 1 ? (front += 100 + Math.random() * 150) : truckS + 300 + Math.random() * 800;
      c.v = c.dir === 1 ? SAME_SPEED : ONCOMING_SPEED;
    }
  }

  /**
   * truck : {s, v, tail (abscisse arrière de la remorque), pts: [[x,z],…] points de contact}.
   * Retourne l'intensité (m/s) de la collision la plus forte ce pas, 0 sinon.
   */
  update(dt, truck) {
    let hit = 0, front = truck.s;
    for (const c of this.cars) front = Math.max(front, c.dir === 1 ? c.s : 0);
    for (const c of this.cars) {
      c.cool -= dt;
      let target = c.dir === 1 ? SAME_SPEED : ONCOMING_SPEED;
      if (c.dir === 1) { // freine derrière le camion
        const gap = truck.tail - c.s;
        if (gap > 0 && gap < 45) target = Math.max(0, Math.min(target, truck.v, (gap - 8) * 0.8));
      }
      c.v += Math.max(-8 * dt, Math.min(3 * dt, target - c.v));
      c.s += c.dir * c.v * dt;

      if (Math.abs(c.s - truck.s) > 1100 || c.s < 20 || c.s > this.world.length - 20) { // recyclage devant le camion
        c.s = c.dir === 1 ? (front = Math.max(front, truck.s + 500) + 100 + Math.random() * 150) : truck.s + 700 + Math.random() * 300;
        c.v = c.dir === 1 ? SAME_SPEED : ONCOMING_SPEED;
      }
      const p = this.world.at(c.s, c.dir === 1 ? -LANE : LANE);
      c.g.position.set(p.x, 0, p.z);
      c.g.rotation.y = p.h + (c.dir === 1 ? 0 : Math.PI);

      if (c.cool <= 0 && Math.abs(c.s - truck.s) < 40) {
        for (const [x, z] of truck.pts) {
          if (Math.hypot(x - p.x, z - p.z) < 2.4) {
            const th = truck.h, dvx = Math.sin(th) * truck.v - Math.sin(p.h) * c.dir * c.v, dvz = Math.cos(th) * truck.v - Math.cos(p.h) * c.dir * c.v;
            hit = Math.max(hit, Math.hypot(dvx, dvz));
            c.cool = 2;
            c.v = 0;
            break;
          }
        }
      }
    }
    return hit;
  }
}

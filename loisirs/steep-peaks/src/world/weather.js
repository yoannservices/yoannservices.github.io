import * as THREE from 'three';
import { lerp } from '../core/config.js';

export const WEATHER = {
  clear: { label: 'Grand soleil', icon: '☀️', fogNear: 200, fogFar: 780, dim: 0, precip: 0, wind: 2, risk: 0.25 },
  snow: { label: 'Neige', icon: '🌨️', fogNear: 40, fogFar: 480, dim: 0.45, precip: 0.55, wind: 5, risk: 0.8 },
  fog: { label: 'Brouillard', icon: '🌫️', fogNear: 5, fogFar: 140, dim: 0.55, precip: 0, wind: 1, risk: 0.4 },
  blizzard: { label: 'Blizzard', icon: '🌬️', fogNear: 0, fogFar: 90, dim: 0.85, precip: 1, wind: 16, risk: 1.4 },
};
const KEYS = Object.keys(WEATHER), N = 3200, BOX = 45;

export class Weather {
  constructor(scene) {
    this.state = 'clear';
    this.cur = { ...WEATHER.clear };
    this.timer = 150 + Math.random() * 150;
    this.rel = new Float32Array(N * 3);
    for (let i = 0; i < N * 3; i++) this.rel[i] = (Math.random() * 2 - 1) * BOX;
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    this.pts = new THREE.Points(this.geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.22, transparent: true, opacity: 0.85, depthWrite: false }));
    this.pts.frustumCulled = false;
    scene.add(this.pts);
  }
  get info() { return WEATHER[this.state]; }
  set(k) { this.state = k; }
  cycle() { this.state = KEYS[(KEYS.indexOf(this.state) + 1) % KEYS.length]; this.timer = 200; }

  update(dt, cam) {
    this.timer -= dt;
    if (this.timer <= 0) { // transitions aléatoires, soleil plus fréquent
      const r = Math.random();
      this.state = r < 0.4 ? 'clear' : r < 0.65 ? 'snow' : r < 0.85 ? 'fog' : 'blizzard';
      this.timer = 120 + Math.random() * 200;
    }
    const t = WEATHER[this.state], k = Math.min(1, dt * 0.45);
    for (const p of ['fogNear', 'fogFar', 'dim', 'precip', 'wind', 'risk']) this.cur[p] = lerp(this.cur[p], t[p], k);
    const c = this.cur, n = Math.floor(N * c.precip), pos = this.geo.attributes.position.array;
    const fall = 3 + 5 * c.precip, wx = c.wind * 0.5;
    for (let i = 0; i < n; i++) {
      const o = i * 3;
      let x = this.rel[o] + wx * dt, y = this.rel[o + 1] - fall * dt, z = this.rel[o + 2] + wx * 0.3 * dt;
      if (y < -BOX) y += 2 * BOX; if (x > BOX) x -= 2 * BOX; if (z > BOX) z -= 2 * BOX;
      this.rel[o] = x; this.rel[o + 1] = y; this.rel[o + 2] = z;
      pos[o] = cam.position.x + x; pos[o + 1] = cam.position.y + y; pos[o + 2] = cam.position.z + z;
    }
    this.geo.setDrawRange(0, n);
    this.geo.attributes.position.needsUpdate = true;
    this.pts.material.size = 0.18 + 0.12 * c.precip;
  }
}

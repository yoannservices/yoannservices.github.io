/* Chargement et déchargement des segments de terrain autour du pilote. La construction est découpée en tranches :
   chaque image n'y consacre que quelques millisecondes, pour éviter les saccades pendant la descente. */
import * as THREE from 'three';
import { buildTerrainChunk, CHUNK } from './Terrain.js';
import { buildVegetation } from './Vegetation.js';

export class Chunks {
  constructor(scene, track) {
    this.scene = scene; this.track = track; this.map = new Map(); this.group = new THREE.Group(); scene.add(this.group);
    this.R = 170; this.jobs = []; this.pending = new Set();
  }
  _job(cx, cz, key) {
    const self = this;
    function* run() {
      const g = new THREE.Group(), t = yield* buildTerrainChunk(self.track, self.track.biome, cx, cz); g.add(t);
      const veg = yield* buildVegetation(self.track, self.track.biome, cx, cz); veg.forEach((m) => g.add(m));
      self.group.add(g); self.map.set(key, { g, t, veg });
    }
    return { key, it: run() };
  }
  /* budgetMs : temps maximum de construction par appel (Infinity au chargement initial) */
  update(px, pz, budgetMs = 3) {
    const r = this.R, c0x = Math.floor((px - r) / CHUNK), c1x = Math.floor((px + r) / CHUNK), c0z = Math.floor((pz - r) / CHUNK), c1z = Math.floor((pz + r) / CHUNK);
    for (let cx = c0x; cx <= c1x; cx++) for (let cz = c0z; cz <= c1z; cz++) {
      const k = cx + ',' + cz; if (this.map.has(k) || this.pending.has(k) || !this.track.chunkSet.has(k)) continue;
      const d = Math.hypot((cx + 0.5) * CHUNK - px, (cz + 0.5) * CHUNK - pz); if (d < r) { const j = this._job(cx, cz, k); j.d = d; this.jobs.push(j); this.pending.add(k); }
    }
    this.jobs.sort((a, b) => a.d - b.d);
    const t0 = performance.now();
    while (this.jobs.length && (budgetMs === Infinity || performance.now() - t0 < budgetMs)) {
      const j = this.jobs[0]; if (j.it.next().done) { this.jobs.shift(); this.pending.delete(j.key); }
    }
    for (const [k, c] of this.map) {
      const [cx, cz] = k.split(',').map(Number);
      if (Math.hypot((cx + 0.5) * CHUNK - px, (cz + 0.5) * CHUNK - pz) > r + 70) { this.group.remove(c.g); c.t.geometry.dispose(); c.veg.forEach((m) => m.dispose()); this.map.delete(k); }
    }
    return this.jobs.length;
  }
  dispose() { for (const c of this.map.values()) { c.t.geometry.dispose(); c.veg.forEach((m) => m.dispose()); } this.scene.remove(this.group); this.map.clear(); this.jobs.length = 0; this.pending.clear(); }
}

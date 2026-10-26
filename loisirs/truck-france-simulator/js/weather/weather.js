import * as THREE from 'three';

// mu : adhérence ; fog : facteur de visibilité ; light : lumière ; rain : intensité de pluie ; grey : ciel couvert
const TYPES = {
  clear: { label: 'Soleil', mu: 1, fog: 1, light: 1, rain: 0, grey: 0 },
  rain:  { label: 'Pluie', mu: 0.65, fog: 0.55, light: 0.55, rain: 1, grey: 0.7 },
  fog:   { label: 'Brouillard', mu: 0.9, fog: 0.16, light: 0.7, rain: 0, grey: 0.9 },
};
const IDS = Object.keys(TYPES);

export class Weather {
  constructor(scene) {
    this.type = 'clear';
    this.cur = { ...TYPES.clear };
    this.next = 0;
    const N = 2500;
    this.drops = new Float32Array(N * 3);
    for (let i = 0; i < N * 3; i += 3) this.drops.set([(Math.random() - 0.5) * 80, Math.random() * 35, (Math.random() - 0.5) * 80], i);
    const g = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(this.drops, 3));
    this.points = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xb8c4d6, size: 1.6, sizeAttenuation: false, transparent: true, fog: false }));
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  get label() { return TYPES[this.type].label; }
  set(type) { this.type = type; }
  cycle() { this.set(IDS[(IDS.indexOf(this.type) + 1) % IDS.length]); }

  /** hours : heure simulée ; camera : suit la pluie. */
  update(dt, hours, camera) {
    if (hours > this.next) { // nouvelle météo toutes les 1 à 3 h simulées
      if (this.next) this.set(Math.random() < 0.5 ? 'clear' : Math.random() < 0.6 ? 'rain' : 'fog');
      this.next = hours + 1 + Math.random() * 2;
    }
    const t = TYPES[this.type], k = Math.min(1, dt * 0.3);
    for (const key in t) if (key !== 'label') this.cur[key] += (t[key] - this.cur[key]) * k;
    const p = this.drops;
    for (let i = 1; i < p.length; i += 3) { p[i] -= 28 * dt; if (p[i] < 0) p[i] += 35; }
    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.position.set(camera.position.x, camera.position.y - 5, camera.position.z);
    this.points.visible = this.cur.rain > 0.02;
    this.points.material.opacity = 0.6 * this.cur.rain;
    return this.cur;
  }
}

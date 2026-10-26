import * as THREE from 'three';

const NIGHT = new THREE.Color(0x05060d), DUSK = new THREE.Color(0xf29a62), DAY = new THREE.Color(0x7fb7e6);
const OVERCAST = new THREE.Color(0x9aa3ad);
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Ciel, soleil, ombres, étoiles : cycle jour/nuit piloté par l'heure simulée. */
export class Environment {
  constructor(scene) {
    this.scene = scene;
    scene.fog = new THREE.Fog(DAY, 80, 700);
    this.hemi = new THREE.HemisphereLight(0xdbe9ff, 0x6b7f5a, 1.0);
    this.sun = new THREE.DirectionalLight(0xfff1d6, 2.5);
    this.sun.castShadow = true;
    const s = this.sun.shadow;
    s.mapSize.set(2048, 2048);
    Object.assign(s.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 400 });
    s.bias = -0.0004;
    scene.add(this.hemi, this.sun, this.sun.target);

    const pts = new Float32Array(900 * 3);
    for (let i = 0; i < 900; i++) {
      const u = Math.random() * 2 * Math.PI, v = Math.acos(Math.random() * 0.9 + 0.1);
      pts.set([Math.cos(u) * Math.sin(v) * 900, Math.cos(v) * 900, Math.sin(u) * Math.sin(v) * 900], i * 3);
    }
    const g = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pts, 3));
    this.stars = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, transparent: true, fog: false }));
    scene.add(this.stars);
    this.night = 0;
  }

  /** hours : 0-24 ; focus : position à suivre pour les ombres. */
  update(hours, focus, w = { fog: 1, light: 1, grey: 0 }) {
    const fogFactor = w.fog;
    const a = ((hours - 6) / 12) * Math.PI; // 0 = lever, PI = coucher
    const elev = Math.sin(a);
    const day = sstep(-0.12, 0.3, elev);
    const dusk = 1 - Math.abs(sstep(-0.2, 0.1, elev) * 2 - 1);
    const sky = NIGHT.clone().lerp(DAY, day).lerp(DUSK, dusk * 0.5 * (1 - day * 0.4));
    sky.lerp(OVERCAST.clone().multiplyScalar(0.15 + 0.85 * day), w.grey * 0.85); // temps couvert
    this.scene.background = sky;
    this.scene.fog.color.copy(sky);
    this.scene.fog.far = (700 * (0.35 + 0.65 * day) + 150) * fogFactor;
    this.scene.fog.near = 80 * fogFactor;
    this.sun.position.set(focus.x + Math.cos(a) * 150, Math.max(elev, 0.05) * 150 + 10, focus.z + 60);
    this.sun.target.position.set(focus.x, 0, focus.z);
    this.sun.intensity = (0.1 + day * 2.4) * w.light;
    this.hemi.intensity = (0.3 + day * 1.35) * w.light;
    this.stars.material.opacity = 1 - day;
    this.stars.position.set(focus.x, 0, focus.z);
    this.night = 1 - day;
    return this.night > 0.5;
  }
}

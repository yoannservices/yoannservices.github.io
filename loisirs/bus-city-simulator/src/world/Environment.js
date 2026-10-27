// Cycle jour/nuit (1 s réelle = 1 min de jeu), météo (clair / pluie / brouillard), pluie en particules.
import * as THREE from 'three';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (x) => x * x * (3 - 2 * x);
const C = { day: new THREE.Color('#9cc7ea'), dusk: new THREE.Color('#f08a4b'), night: new THREE.Color('#070b1a'), rain: new THREE.Color('#68737e'), fog: new THREE.Color('#b8c0c6') };
export const WEATHER_LABEL = { clear: 'Dégagé', rain: 'Pluie', fog: 'Brouillard' };

export class Environment {
  constructor(scene, city, hours = 8) {
    this.scene = scene; this.city = city;
    this.hours = hours; this.weather = 'clear'; this.timer = 120;
    this.rain = 0; this.fog = 0; this.grip = 1; this.night = 0; this.elev = 1;
    this.hemi = new THREE.HemisphereLight('#dbeaff', '#4a4a4a', 1.1);
    this.sun = new THREE.DirectionalLight('#fff4e0', 2.2);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    Object.assign(this.sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 260 });
    this.sun.shadow.bias = -0.0004;
    scene.add(this.hemi, this.sun, this.sun.target);
    scene.background = new THREE.Color(); scene.fog = new THREE.Fog('#9cc7ea', 150, 900);

    const N = 1800, pos = new Float32Array(N * 6);
    this.drops = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { this.drops[i * 3] = (Math.random() - 0.5) * 60; this.drops[i * 3 + 1] = Math.random() * 25; this.drops[i * 3 + 2] = (Math.random() - 0.5) * 60; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.rainMesh = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#cfe3f5', transparent: true, opacity: 0 }));
    this.rainMesh.frustumCulled = false; this.rainMesh.visible = false;
    scene.add(this.rainMesh);
    this.sky = new THREE.Color();
  }

  get clock() { const h = Math.floor(this.hours) % 24, m = Math.floor((this.hours % 1) * 60); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; }
  setWeather(w) { this.weather = w; }

  update(dt, focus, camPos) {
    this.hours = (this.hours + dt / 60) % 24;
    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = 90 + Math.random() * 120;
      const r = Math.random(), next = r < 0.5 ? 'clear' : r < 0.8 ? 'rain' : 'fog';
      this.weather = next;
    }
    const tr = this.weather === 'rain' ? 1 : 0, tf = this.weather === 'fog' ? 1 : 0, k = Math.min(1, dt / 12);
    this.rain += (tr - this.rain) * k; this.fog += (tf - this.fog) * k;
    this.grip = 1 - 0.3 * this.rain;

    const a = ((this.hours - 6) / 12) * Math.PI, elev = Math.sin(a);
    this.elev = elev;
    this.night = 1 - clamp((elev + 0.1) / 0.3, 0, 1);
    const dayF = clamp(elev * 2 + 0.2, 0.08, 1);
    this.sky.copy(C.night).lerp(C.dusk, smooth(clamp((elev + 0.15) / 0.2, 0, 1))).lerp(C.day, clamp((elev - 0.1) / 0.3, 0, 1));
    const gray = this.rain * 0.7, fogK = this.fog * 0.85;
    this.sky.lerp(C.rain.clone().multiplyScalar(dayF), gray).lerp(C.fog.clone().multiplyScalar(dayF), fogK);
    this.scene.background.copy(this.sky);
    this.scene.fog.color.copy(this.sky);
    this.scene.fog.near = 150 - 90 * this.rain - 142 * this.fog;
    this.scene.fog.far = 900 - 400 * this.rain - 770 * this.fog;
    this.hemi.intensity = 0.28 + 0.85 * clamp(elev + 0.1, 0, 1) * (1 - 0.35 * this.rain);
    this.hemi.color.set(this.night > 0.5 ? '#6f86b8' : '#dbeaff');
    this.sun.intensity = (Math.max(0, elev) * 2.2 + 0.12) * (1 - 0.65 * this.rain - 0.4 * this.fog);
    this.sun.color.set(elev < 0.2 ? '#ffb070' : '#fff4e0');
    this.sun.position.set(focus.x + Math.cos(a) * 80, 20 + Math.max(0.12, elev) * 90, focus.z + 40);
    this.sun.target.position.set(focus.x, 0, focus.z);
    this.city.setNight(this.night);
    this.city.setWet(this.rain);

    this.rainMesh.visible = this.rain > 0.02;
    if (this.rainMesh.visible) {
      this.rainMesh.material.opacity = 0.45 * this.rain;
      this.rainMesh.position.copy(camPos);
      const p = this.rainMesh.geometry.attributes.position.array, d = this.drops;
      for (let i = 0; i < d.length / 3; i++) {
        d[i * 3 + 1] -= 28 * dt; if (d[i * 3 + 1] < 0) d[i * 3 + 1] += 25;
        const x = d[i * 3], y = d[i * 3 + 1], z = d[i * 3 + 2];
        p[i * 6] = x; p[i * 6 + 1] = y; p[i * 6 + 2] = z; p[i * 6 + 3] = x - 0.05; p[i * 6 + 4] = y + 0.6; p[i * 6 + 5] = z;
      }
      this.rainMesh.geometry.attributes.position.needsUpdate = true;
    }
  }
}

// Ciel en dégradé, cycle jour/nuit (1 s réelle = 1 min de jeu), météo (dégagé / pluie / brouillard), pluie en particules.
import * as THREE from 'three';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (x) => x * x * (3 - 2 * x);
const C = { day: new THREE.Color('#8fc0ea'), dusk: new THREE.Color('#f08a4b'), night: new THREE.Color('#070b1a'), rain: new THREE.Color('#68737e'), fog: new THREE.Color('#b8c0c6') };
export const WEATHER_LABEL = { clear: 'Dégagé', rain: 'Pluie', fog: 'Brouillard' };

export class Environment {
  constructor(scene, hours = 8) {
    this.scene = scene; this.hours = hours; this.weather = 'clear'; this.timer = 150; this.auto = true;
    this.rain = 0; this.fog = 0; this.grip = 1; this.night = 0; this.elev = 1;
    this.hemi = new THREE.HemisphereLight('#dbeaff', '#5a5040', 1.1);
    this.sun = new THREE.DirectionalLight('#fff4e0', 2.2); this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    Object.assign(this.sun.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 1, far: 320 });
    this.sun.shadow.bias = -0.0004; this.sun.shadow.normalBias = 0.05;
    scene.add(this.hemi, this.sun, this.sun.target);
    scene.background = new THREE.Color(); scene.fog = new THREE.Fog('#9cc7ea', 150, 700);
    const N = 1500, pos = new Float32Array(N * 6); this.drops = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { this.drops[i * 3] = (Math.random() - 0.5) * 60; this.drops[i * 3 + 1] = Math.random() * 25; this.drops[i * 3 + 2] = (Math.random() - 0.5) * 60; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.rainMesh = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#cfe3f5', transparent: true, opacity: 0 }));
    this.rainMesh.frustumCulled = false; this.rainMesh.visible = false; this.rainMesh.userData.noLod = true; scene.add(this.rainMesh);
    this.sky = new THREE.Color();
    this.dome = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: new THREE.Color('#3d78c9') }, bottom: { value: new THREE.Color('#9cc7ea') } },
      vertexShader: 'varying vec3 v; void main(){ v = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying vec3 v; void main(){ float h = clamp(v.y * 1.6, 0.0, 1.0); gl_FragColor = vec4(mix(bottom, top, pow(h, 0.7)), 1.0); }',
    }));
    this.dome.renderOrder = -10; this.dome.frustumCulled = false; this.dome.userData.noLod = true; scene.add(this.dome);
  }
  get clock() { const h = Math.floor(this.hours) % 24, m = Math.floor((this.hours % 1) * 60); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; }
  setWeather(w) { this.weather = w; this.auto = false; }
  setHour(h) { this.hours = h; }

  update(dt, focus, camPos, speed = 1) {
    this.hours = (this.hours + dt / 60 * speed) % 24;
    this.timer -= dt;
    if (this.auto && this.timer <= 0) { this.timer = 120 + Math.random() * 180; const r = Math.random(); this.weather = r < 0.6 ? 'clear' : r < 0.85 ? 'rain' : 'fog'; }
    const tr = this.weather === 'rain' ? 1 : 0, tf = this.weather === 'fog' ? 1 : 0, k = Math.min(1, dt / 12);
    this.rain += (tr - this.rain) * k; this.fog += (tf - this.fog) * k; this.grip = 1 - 0.25 * this.rain;
    const a = ((this.hours - 6) / 12) * Math.PI, elev = Math.sin(a); this.elev = elev;
    this.night = 1 - clamp((elev + 0.1) / 0.3, 0, 1);
    const dayF = clamp(elev * 2 + 0.2, 0.08, 1);
    this.sky.copy(C.night).lerp(C.dusk, smooth(clamp((elev + 0.15) / 0.2, 0, 1))).lerp(C.day, clamp((elev - 0.1) / 0.3, 0, 1));
    this.sky.lerp(C.rain.clone().multiplyScalar(dayF), this.rain * 0.7).lerp(C.fog.clone().multiplyScalar(dayF), this.fog * 0.85);
    this.scene.background.copy(this.sky); this.scene.fog.color.copy(this.sky);
    this.scene.fog.near = 150 - 90 * this.rain - 130 * this.fog; this.scene.fog.far = 700 - 330 * this.rain - 600 * this.fog;
    this.hemi.intensity = 0.3 + 0.85 * clamp(elev + 0.1, 0, 1) * (1 - 0.35 * this.rain);
    this.hemi.color.set(this.night > 0.5 ? '#6f86b8' : '#dbeaff');
    this.sun.intensity = (Math.max(0, elev) * 2.4 + 0.12) * (1 - 0.65 * this.rain - 0.4 * this.fog); this.sun.color.set(elev < 0.2 ? '#ffb070' : '#fff4e0');
    this.sun.position.set(focus.x + Math.cos(a) * 90, 25 + Math.max(0.12, elev) * 100, focus.z + 40); this.sun.target.position.set(focus.x, 0, focus.z);
    this.dome.position.copy(camPos);
    this.dome.material.uniforms.bottom.value.copy(this.sky);
    this.dome.material.uniforms.top.value.copy(this.sky).multiplyScalar(0.55).lerp(new THREE.Color('#2f6cc0'), 0.35 * (1 - this.night) * (1 - this.rain));
    this.rainMesh.visible = this.rain > 0.02;
    if (this.rainMesh.visible) {
      this.rainMesh.material.opacity = 0.45 * this.rain; this.rainMesh.position.copy(camPos);
      const p = this.rainMesh.geometry.attributes.position.array, d = this.drops;
      for (let i = 0; i < d.length / 3; i++) {
        d[i * 3 + 1] -= 28 * dt; if (d[i * 3 + 1] < -6) d[i * 3 + 1] += 25;
        const x = d[i * 3], y = d[i * 3 + 1], z = d[i * 3 + 2];
        p[i * 6] = x; p[i * 6 + 1] = y; p[i * 6 + 2] = z; p[i * 6 + 3] = x - 0.05; p[i * 6 + 4] = y + 0.6; p[i * 6 + 5] = z;
      }
      this.rainMesh.geometry.attributes.position.needsUpdate = true;
    }
  }
}

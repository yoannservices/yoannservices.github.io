/* Atmosphère : ciel dégradé + soleil / lune, étoiles, relief lointain, brouillard, pluie et neige en particules,
   cycle jour / crépuscule / nuit. L'effet sur l'adhérence est calculé dans surfaces.js (gripOf) à partir du même type de météo. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { WEATHERS } from '../surfaces/surfaces.js';
import { mulberry32, lerp } from '../core/util.js';

const C = (h) => new THREE.Color(h);
const TOD = {
  jour: { top: 0x3f7fd6, hor: 0xbcd7f2, sun: 0xfff1db, sunI: 3.4, el: 48, hemiS: 0x9bbbe6, hemiG: 0x55503f, hemiI: 1.15, exp: 1.0, amb: 0 },
  crepuscule: { top: 0x37508f, hor: 0xf4a06b, sun: 0xff9a52, sunI: 2.6, el: 7, hemiS: 0xf0a27a, hemiG: 0x3a2f3a, hemiI: 0.8, exp: 0.95, amb: 0 },
  nuit: { top: 0x02050e, hor: 0x0b1428, sun: 0x8fa8ff, sunI: 0.45, el: 38, hemiS: 0x1b2a55, hemiG: 0x080a12, hemiI: 0.42, exp: 1.3, amb: 0.1 },
};
const WCOL = { pluie: 0x59626d, brouillard: 0xaab2b9, neige: 0xc6ccd4 };
const WSUN = { soleil: 1, pluie: 0.42, brouillard: 0.5, neige: 0.55 };

export class Atmosphere {
  constructor(scene, renderer, opt) {
    this.scene = scene; this.renderer = renderer; this.weather = opt.weather; this.tod = opt.tod; this.env = opt.env;
    const T = TOD[opt.tod], w = opt.weather;
    this.night = opt.tod === 'nuit';
    const grey = w === 'soleil' ? 0 : w === 'brouillard' ? 0.85 : w === 'neige' ? 0.7 : 0.75;
    const top = C(T.top).lerp(C(WCOL[w] || T.top), grey), hor = C(T.hor).lerp(C(WCOL[w] || T.hor), grey);
    if (this.night) { top.multiplyScalar(0.9); hor.multiplyScalar(w === 'soleil' ? 1 : 0.7); }
    else if (opt.tod === 'crepuscule') { hor.lerp(C(0xf4a06b), 0.4 * (1 - grey)); }
    this.top = top; this.hor = hor;
    scene.background = hor.clone();
    this.fogBase = WEATHERS[w].fog * (opt.tod === 'nuit' ? 1.15 : 1);
    scene.fog = new THREE.FogExp2(hor.clone(), this.fogBase);
    renderer.toneMappingExposure = T.exp;
    // reflets : environnement procédural (aucune image), atténué selon l'heure
    if (!Atmosphere.pm) { const g = new THREE.PMREMGenerator(renderer); Atmosphere.pm = g.fromScene(new RoomEnvironment(), 0.04).texture; g.dispose(); }
    scene.environment = Atmosphere.pm; scene.environmentIntensity = opt.tod === 'nuit' ? 0.1 : opt.tod === 'crepuscule' ? 0.45 : opt.weather === 'soleil' ? 0.75 : 0.5;

    this.sun = new THREE.DirectionalLight(T.sun, T.sunI * WSUN[w]);
    const el = T.el * Math.PI / 180, az = 0.9;
    this.sunDir = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)).normalize();
    this.sun.castShadow = opt.quality > 0.5; const sh = this.sun.shadow;
    sh.mapSize.set(opt.quality > 0.9 ? 2048 : 1024, opt.quality > 0.9 ? 2048 : 1024);
    Object.assign(sh.camera, { left: -42, right: 42, top: 42, bottom: -42, near: 1, far: 220 }); sh.bias = -0.0004; sh.normalBias = 0.05;
    scene.add(this.sun, this.sun.target);
    this.hemi = new THREE.HemisphereLight(T.hemiS, T.hemiG, T.hemiI * (w === 'soleil' ? 1 : 0.9)); scene.add(this.hemi);
    if (T.amb) scene.add(new THREE.AmbientLight(0x2a3a66, T.amb));

    this._sky(T); this._ridge(); if (this.night) this._stars();
    this.rain = null; this.snow = null;
    if (w === 'pluie') this._rain(opt.quality); if (w === 'neige' || (opt.env === 'neige' && w !== 'soleil')) this._snow(opt.quality, w === 'neige' ? 1 : 0.35);
    this.autoLights = this.night || opt.tod === 'crepuscule' || w === 'brouillard' || w === 'pluie';
  }

  _sky(T) {
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: this.top }, hor: { value: this.hor }, sunDir: { value: this.sunDir }, sunCol: { value: C(T.sun) }, sunK: { value: this.night ? 0.25 : this.weather === 'soleil' ? 1 : 0.18 }, moon: { value: this.night ? 1 : 0 } },
      vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `varying vec3 vD; uniform vec3 top, hor, sunDir, sunCol; uniform float sunK, moon;
        void main(){ float h = clamp(vD.y, 0.0, 1.0); vec3 c = mix(hor, top, pow(h, 0.55));
          float s = max(dot(normalize(vD), sunDir), 0.0);
          c += sunCol * (pow(s, 900.0) * 6.0 + pow(s, 40.0) * 0.35 + pow(s, 6.0) * 0.12) * sunK;
          if (moon > 0.5) c += vec3(0.8,0.85,1.0) * smoothstep(0.9993, 0.9996, s) * 1.5;
          gl_FragColor = vec4(c, 1.0); }`,
    });
    this.dome = new THREE.Mesh(new THREE.SphereGeometry(3000, 32, 16), mat); this.dome.renderOrder = -10; this.dome.frustumCulled = false; this.scene.add(this.dome);
  }
  _ridge() {
    // relief lointain : couronne de pics en silhouette teintée par la brume
    const rnd = mulberry32(5), k = { temperate: [40, 160, 0.38], cold: [90, 380, 0.5], alpine: [180, 620, 0.55], med: [50, 190, 0.42] }[this.env === 'foret' ? 'temperate' : this.env === 'neige' ? 'cold' : this.env === 'asphalte' ? 'alpine' : 'med'];
    const parts = [], N = 46;
    for (let i = 0; i < N; i++) {
      const a = i / N * Math.PI * 2, r = 1900 + rnd() * 300, h = k[0] + rnd() * (k[1] - k[0]), g = new THREE.ConeGeometry(120 + rnd() * 220, h, 6, 1, true);
      g.translate(Math.sin(a) * r, h / 2 - 25, Math.cos(a) * r); parts.push(g);
    }
    let n = 0; parts.forEach((g) => (n += g.attributes.position.count));
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), idx = []; let off = 0;
    const tint = this.hor.clone().lerp(C(this.env === 'neige' ? 0xe6edf5 : 0x2c3a44), k[2]), snowy = this.env === 'neige' || this.env === 'asphalte';
    parts.forEach((g) => {
      pos.set(g.attributes.position.array, off * 3);
      for (let i = 0; i < g.attributes.position.count; i++) { const y = g.attributes.position.getY(i), c = (snowy && y > 140) ? tint.clone().lerp(C(0xffffff), 0.5) : tint; col.set([c.r, c.g, c.b], (off + i) * 3); }
      g.index.array.forEach((v) => idx.push(v + off)); off += g.attributes.position.count;
    });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.setIndex(idx);
    this.ridge = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, fog: false, side: THREE.DoubleSide, depthWrite: false })); this.ridge.renderOrder = -9; this.ridge.frustumCulled = false; this.scene.add(this.ridge);
    this.ridge.material.color.setScalar(this.night ? 0.12 : 1);
  }
  _stars() {
    const rnd = mulberry32(11), n = 900, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const u = rnd(), v = rnd() * 0.97 + 0.03, a = u * 6.283, r = Math.sqrt(1 - v * v); p.set([Math.cos(a) * r * 2800, v * 2800, Math.sin(a) * r * 2800], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    this.stars = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 5, sizeAttenuation: false, fog: false, depthWrite: false, transparent: true, opacity: this.weather === 'soleil' ? 0.9 : 0.15 }));
    this.stars.frustumCulled = false; this.stars.renderOrder = -8; this.scene.add(this.stars);
  }
  _rain(q) {
    const n = Math.round(1400 * Math.max(0.4, q)), p = new Float32Array(n * 6), rnd = mulberry32(2);
    for (let i = 0; i < n; i++) { const x = (rnd() - 0.5) * 50, y = rnd() * 28, z = (rnd() - 0.5) * 50; p.set([x, y, z, x, y - 0.9, z], i * 6); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    this.rain = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xcfdbe8, transparent: true, opacity: 0.38, fog: false, depthWrite: false })); this.rain.frustumCulled = false; this.scene.add(this.rain);
  }
  _snow(q, amount) {
    const n = Math.round(1800 * amount * Math.max(0.4, q)), p = new Float32Array(n * 3), rnd = mulberry32(4);
    for (let i = 0; i < n; i++) p.set([(rnd() - 0.5) * 50, rnd() * 24, (rnd() - 0.5) * 50], i * 3);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    this.snow = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.09, transparent: true, opacity: 0.9, depthWrite: false })); this.snow.frustumCulled = false; this.scene.add(this.snow);
  }

  /* suit la caméra et la voiture : ombre, ciel, précipitations */
  update(dt, camera, car, t) {
    const cp = camera.position;
    this.dome.position.copy(cp); this.ridge.position.set(cp.x, 0, cp.z); this.stars?.position.copy(cp);
    this.ridge.position.y = car.y - 40;
    this.sun.target.position.set(car.x, car.y, car.z);
    this.sun.position.set(car.x + this.sunDir.x * 90, car.y + this.sunDir.y * 90, car.z + this.sunDir.z * 90);
    this.sun.target.updateMatrixWorld();
    const vx = car.vx || 0, vz = car.vz || 0;
    if (this.rain) {
      const a = this.rain.geometry.attributes.position, p = a.array, fall = 26 * dt;
      for (let i = 0; i < p.length; i += 6) {
        p[i + 1] -= fall; p[i + 4] -= fall; p[i] -= vx * dt * 0.3; p[i + 3] -= vx * dt * 0.3; p[i + 2] -= vz * dt * 0.3; p[i + 5] -= vz * dt * 0.3;
        if (p[i + 1] < -4) { const y = 24 + Math.random() * 4; p[i + 1] = y; p[i + 4] = y - 0.9; }
        if (p[i] < -25) { p[i] += 50; p[i + 3] += 50; } else if (p[i] > 25) { p[i] -= 50; p[i + 3] -= 50; }
        if (p[i + 2] < -25) { p[i + 2] += 50; p[i + 5] += 50; } else if (p[i + 2] > 25) { p[i + 2] -= 50; p[i + 5] -= 50; }
      }
      a.needsUpdate = true; this.rain.position.set(cp.x, cp.y - 6, cp.z);
    }
    if (this.snow) {
      const a = this.snow.geometry.attributes.position, p = a.array;
      for (let i = 0; i < p.length; i += 3) {
        p[i + 1] -= 1.7 * dt; p[i] += Math.sin(t * 0.8 + i) * 0.4 * dt - vx * dt * 0.3; p[i + 2] += Math.cos(t * 0.6 + i) * 0.4 * dt - vz * dt * 0.3;
        if (p[i + 1] < -4) p[i + 1] = 22;
        if (p[i] < -25) p[i] += 50; else if (p[i] > 25) p[i] -= 50;
        if (p[i + 2] < -25) p[i + 2] += 50; else if (p[i + 2] > 25) p[i + 2] -= 50;
      }
      a.needsUpdate = true; this.snow.position.set(cp.x, cp.y - 6, cp.z);
    }
  }
  dispose() {
    for (const o of [this.sun, this.sun.target, this.hemi, this.dome, this.ridge, this.stars, this.rain, this.snow]) if (o) { this.scene.remove(o); o.geometry?.dispose(); o.material?.dispose?.(); }
    this.scene.fog = null; this.scene.children.filter((o) => o.isAmbientLight).forEach((o) => this.scene.remove(o));
  }
}

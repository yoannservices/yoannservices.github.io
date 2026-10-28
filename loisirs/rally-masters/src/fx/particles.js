/* Particules : poussière, boue, éclaboussures, neige projetée, fumée, étincelles. Un seul THREE.Points (3500 places),
   physique sur CPU, rendu par ShaderMaterial (disque doux, taille croissante, fondu). */
import * as THREE from 'three';

const MAX = 3500;
const KINDS = {
  dust: { life: [0.9, 1.8], grow: 2.6, drag: 1.6, grav: -0.15, size: 0.9, alpha: 0.55 },
  mud: { life: [0.5, 0.9], grow: 0.2, drag: 0.1, grav: 9, size: 0.22, alpha: 0.95 },
  splash: { life: [0.5, 1.1], grow: 0.8, drag: 0.6, grav: 7, size: 0.35, alpha: 0.6 },
  snow: { life: [0.8, 1.6], grow: 2.2, drag: 1.8, grav: -0.1, size: 0.8, alpha: 0.7 },
  smoke: { life: [1.0, 2.2], grow: 2.4, drag: 0.8, grav: -1.4, size: 0.5, alpha: 0.5 },
  spark: { life: [0.2, 0.45], grow: 0, drag: 0.1, grav: 10, size: 0.1, alpha: 1 },
};

export class Particles {
  constructor(scene) {
    this.n = 0; this.head = 0;
    this.pos = new Float32Array(MAX * 3); this.vel = new Float32Array(MAX * 3); this.col = new Float32Array(MAX * 3);
    this.age = new Float32Array(MAX).fill(99); this.life = new Float32Array(MAX).fill(1); this.size0 = new Float32Array(MAX); this.alpha0 = new Float32Array(MAX);
    this.kind = new Uint8Array(MAX); this.sizeA = new Float32Array(MAX); this.alphaA = new Float32Array(MAX);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    g.setAttribute('size', new THREE.BufferAttribute(this.sizeA, 1)); g.setAttribute('alpha', new THREE.BufferAttribute(this.alphaA, 1));
    this.mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, fog: false,
      uniforms: { scale: { value: 600 }, fogCol: { value: new THREE.Color(0xaaaaaa) }, fogD: { value: 0.001 } },
      vertexShader: `attribute float size; attribute float alpha; attribute vec3 color; varying vec3 vC; varying float vA; varying float vFog; uniform float scale; uniform float fogD;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; gl_PointSize = size * scale / max(0.5, -mv.z);
          vC = color; vA = alpha; float d = -mv.z; vFog = 1.0 - exp(-fogD * fogD * d * d); }`,
      fragmentShader: `varying vec3 vC; varying float vA; varying float vFog; uniform vec3 fogCol;
        void main(){ vec2 p = gl_PointCoord - 0.5; float r = length(p) * 2.0; float a = smoothstep(1.0, 0.25, r) * vA; if (a < 0.01) discard; gl_FragColor = vec4(mix(vC, fogCol, vFog), a); }`,
    });
    this.points = new THREE.Points(g, this.mat); this.points.frustumCulled = false; this.points.renderOrder = 5; scene.add(this.points);
  }
  setFog(color, density) { this.mat.uniforms.fogCol.value.copy(color); this.mat.uniforms.fogD.value = density; }
  /* émet n particules d'un type depuis (x,y,z) avec vitesse de base (vx,vy,vz) et dispersion */
  emit(kind, n, x, y, z, vx, vy, vz, rgb, spread = 1, sizeK = 1) {
    const K = KINDS[kind], id = Object.keys(KINDS).indexOf(kind);
    for (let q = 0; q < n; q++) {
      const i = this.head; this.head = (this.head + 1) % MAX;
      this.pos[i * 3] = x + (Math.random() - 0.5) * 0.4; this.pos[i * 3 + 1] = y + Math.random() * 0.15; this.pos[i * 3 + 2] = z + (Math.random() - 0.5) * 0.4;
      this.vel[i * 3] = vx + (Math.random() - 0.5) * 2 * spread; this.vel[i * 3 + 1] = vy + Math.random() * spread; this.vel[i * 3 + 2] = vz + (Math.random() - 0.5) * 2 * spread;
      const t = 0.85 + Math.random() * 0.3; this.col[i * 3] = Math.min(1, rgb[0] * t); this.col[i * 3 + 1] = Math.min(1, rgb[1] * t); this.col[i * 3 + 2] = Math.min(1, rgb[2] * t);
      this.age[i] = 0; this.life[i] = K.life[0] + Math.random() * (K.life[1] - K.life[0]); this.size0[i] = K.size * sizeK * (0.7 + Math.random() * 0.6); this.alpha0[i] = K.alpha; this.kind[i] = id;
    }
  }
  update(dt) {
    const keys = Object.keys(KINDS);
    for (let i = 0; i < MAX; i++) {
      if (this.age[i] >= this.life[i]) { this.alphaA[i] = 0; this.sizeA[i] = 0; continue; }
      const K = KINDS[keys[this.kind[i]]]; this.age[i] += dt; const t = this.age[i] / this.life[i];
      const dr = Math.exp(-K.drag * dt);
      this.vel[i * 3] *= dr; this.vel[i * 3 + 2] *= dr; this.vel[i * 3 + 1] = this.vel[i * 3 + 1] * dr - K.grav * dt;
      this.pos[i * 3] += this.vel[i * 3] * dt; this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt; this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      this.sizeA[i] = this.size0[i] * (1 + K.grow * t); this.alphaA[i] = this.alpha0[i] * (1 - t) * (t < 0.08 ? t / 0.08 : 1);
    }
    const g = this.points.geometry;
    for (const a of ['position', 'color', 'size', 'alpha']) g.attributes[a].needsUpdate = true;
  }
  setResolution(h, fov) { this.mat.uniforms.scale.value = h / (2 * Math.tan(fov * Math.PI / 360)); }
  clear() { this.age.fill(99); this.alphaA.fill(0); this.sizeA.fill(0); }
  dispose() { this.points.parent?.remove(this.points); this.points.geometry.dispose(); this.mat.dispose(); }
}

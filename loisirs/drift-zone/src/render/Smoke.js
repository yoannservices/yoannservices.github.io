
/** Fumée des pneus : un seul Points, tampon de particules à taille fixe. */
class Smoke {
  constructor(scene, cfg = VIEW.smoke) {
    this.cfg = cfg;
    const n = cfg.max;
    this.n = n;
    this.next = 0;
    this.acc = 0;
    this.life = new Float32Array(n);
    this.age = new Float32Array(n).fill(1);
    this.vel = new Float32Array(n * 3);
    this.pos = new THREE.BufferAttribute(new Float32Array(n * 3), 3);
    this.t = new THREE.BufferAttribute(new Float32Array(n).fill(1), 1);
    this.pos.setUsage(THREE.DynamicDrawUsage);
    this.t.setUsage(THREE.DynamicDrawUsage);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', this.pos);
    geo.setAttribute('aT', this.t);
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uScale: { value: 600 }, uSize: { value: cfg.size } },
      vertexShader: `
        attribute float aT; varying float vT; uniform float uScale; uniform float uSize;
        void main() {
          vT = aT;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = uSize * (0.5 + aT * 1.5) * uScale / -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying float vT;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5 || vT >= 1.0) discard;
          gl_FragColor = vec4(1.0, 1.0, 1.0, (1.0 - vT) * 0.55 * smoothstep(0.5, 0.05, d));
        }`,
    });
    this.points = new THREE.Points(geo, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 2;
    scene.add(this.points);
  }

  /** Échelle de point (px par unité à distance 1) : dépend de la hauteur du canvas et du champ de vision. */
  setViewport(h, fovDeg) {
    this.material.uniforms.uScale.value = h / (2 * Math.tan((fovDeg * Math.PI) / 360));
  }

  spawn(x, y, speed = 20) {
    const i = this.next++ % this.n;
    this.life[i] = this.cfg.life * (0.7 + Math.random() * 0.6);
    this.age[i] = 0;
    this.pos.setXYZ(i, x, 6 + Math.random() * 4, y);
    const a = Math.random() * Math.PI * 2;
    this.vel.set([Math.cos(a) * speed, 12 + Math.random() * 14, Math.sin(a) * speed], i * 3);
  }

  /** wheels : [{x, y}], intensity 0..1 */
  emit(wheels, intensity, dt) {
    if (intensity < 0.05) { this.acc = 0; return; }
    this.acc += this.cfg.rate * intensity * dt;
    while (this.acc >= 1) { this.acc -= 1; wheels.forEach((w) => this.spawn(w.x, w.y)); }
  }

  burst(x, y, count = 10) {
    for (let i = 0; i < count; i++) this.spawn(x, y, 70);
  }

  update(dt) {
    const p = this.pos.array;
    for (let i = 0; i < this.n; i++) {
      if (this.age[i] >= 1) continue;
      this.age[i] += dt / this.life[i];
      p[i * 3] += this.vel[i * 3] * dt;
      p[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      p[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      this.t.array[i] = Math.min(this.age[i], 1);
    }
    this.pos.needsUpdate = this.t.needsUpdate = true;
  }
}

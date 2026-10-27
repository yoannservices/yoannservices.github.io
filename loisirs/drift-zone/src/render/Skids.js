
const FLOOR = new THREE.Color(VIEW.colors.floor);
const DARK = new THREE.Color(VIEW.colors.skid);
const tmp = new THREE.Color();

/**
 * Traces de pneus : un tampon circulaire de quads dans un seul mesh. Les plus anciennes sont recyclées.
 * Opaques et sans écriture de profondeur : pas de taches aux jonctions, coût constant par image.
 */
class Skids {
  constructor(scene, cfg = VIEW.skids) {
    this.cfg = cfg;
    const n = cfg.max;
    this.pos = new THREE.BufferAttribute(new Float32Array(n * 12), 3);
    this.col = new THREE.BufferAttribute(new Float32Array(n * 12), 3);
    this.pos.setUsage(THREE.DynamicDrawUsage);
    this.col.setUsage(THREE.DynamicDrawUsage);
    const index = new Uint32Array(n * 6);
    for (let i = 0; i < n; i++) index.set([i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3], i * 6);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', this.pos);
    geo.setAttribute('color', this.col);
    geo.setIndex(new THREE.BufferAttribute(index, 1));
    this.mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, depthWrite: false, side: THREE.DoubleSide }));
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 1;
    scene.add(this.mesh);
    this.count = 0;
    this.prev = [null, null];
    this.wheels = [];
    this.intensity = 0;
    this.clear();
  }

  clear() {
    this.pos.array.fill(0);
    this.col.array.fill(0);
    this.pos.needsUpdate = this.col.needsUpdate = true;
    this.count = 0;
    this.prev = [null, null];
  }

  /** À appeler une fois par image avec l'état de la voiture. */
  update(car) {
    const c = this.cfg;
    let k = Math.min(Math.max((Math.abs(car.lateralSpeed) - c.slipMin) / (c.slipMax - c.slipMin), 0), 1);
    if (car.handbrake && car.speed > 80) k = Math.max(k, 0.5);
    if (car.speed < 25) k = 0;
    this.intensity = k;

    const cos = Math.cos(car.angle), sin = Math.sin(car.angle);
    const back = -car.cfg.length * 0.32, side = car.cfg.width * 0.42;
    this.wheels = [-side, side].map((s) => ({ x: car.x + cos * back - sin * s, y: car.y + sin * back + cos * s }));
    this.wheels.forEach((w, i) => {
      if (k < 0.05) this.prev[i] = null;
      else {
        if (this.prev[i]) this.segment(this.prev[i], w, k);
        this.prev[i] = w;
      }
    });
  }

  segment(a, b, k) {
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
    if (len < 0.5) return;
    const hw = this.cfg.width / 2, px = (-dy / len) * hw, py = (dx / len) * hw;
    const i = this.count % this.cfg.max;
    const p = this.pos.array, c = this.col.array, o = i * 12;
    p.set([a.x + px, 0.4, a.y + py, a.x - px, 0.4, a.y - py, b.x - px, 0.4, b.y - py, b.x + px, 0.4, b.y + py], o);
    tmp.copy(FLOOR).lerp(DARK, 0.35 + 0.65 * k);
    for (let v = 0; v < 4; v++) { c[o + v * 3] = tmp.r; c[o + v * 3 + 1] = tmp.g; c[o + v * 3 + 2] = tmp.b; }
    this.pos.needsUpdate = this.col.needsUpdate = true;
    this.count++;
  }
}

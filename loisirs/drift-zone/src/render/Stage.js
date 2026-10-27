
const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 20);
const dummy = new THREE.Object3D();

/** Scène 3D : lumière, plateforme, marquages au sol, obstacles. Le plan de jeu (x, y) devient (x, z). */
class Stage {
  constructor(canvasParent, size) {
    this.size = size;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    canvasParent.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(VIEW.colors.sky);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xd9cfba, 0.75));
    const sun = new THREE.DirectionalLight(0xffffff, 0.3);
    sun.position.set(-600, 1200, 500);
    this.scene.add(sun);

    this.camera = new THREE.PerspectiveCamera(VIEW.camera.fov, 1, 10, 6000);
    this.movers = [];
    this.buildGround();
    addEventListener('resize', () => this.resize());
    this.resize();
  }

  resize() {
    const w = innerWidth, h = innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.onResize?.(w, h);
  }

  buildGround() {
    const s = this.size, thick = 80;
    const mat = new THREE.MeshLambertMaterial({ color: VIEW.colors.floor });
    const slab = new THREE.Mesh(BOX, mat);
    slab.scale.set(s, thick, s);
    slab.position.set(s / 2, -thick / 2, s / 2);
    this.scene.add(slab);
  }

  /** Marquages peints : { kind: 'ring' | 'square', x, y, r | size, w?, angle?, color }. */
  addDecals(decals) {
    const red = new THREE.MeshBasicMaterial({ color: VIEW.colors.red });
    decals.forEach((d) => {
      let m;
      if (d.kind === 'ring') m = new THREE.Mesh(new THREE.RingGeometry(d.r - d.w, d.r, 48), red);
      else {
        const shape = new THREE.Shape();
        shape.moveTo(-1, -1); shape.lineTo(1, -1); shape.lineTo(1, 1); shape.lineTo(-1, 1); shape.closePath();
        const k = 1 - 24 / (d.size / 2);
        const hole = new THREE.Path();
        hole.moveTo(-k, -k); hole.lineTo(-k, k); hole.lineTo(k, k); hole.lineTo(k, -k); hole.closePath();
        shape.holes.push(hole);
        m = new THREE.Mesh(new THREE.ShapeGeometry(shape), red);
        m.scale.set(d.size / 2, d.size / 2, 1);
      }
      m.rotation.x = -Math.PI / 2;
      m.position.set(d.x, 0.2, d.y);
      if (d.kind === 'square') m.rotation.z = -(d.angle ?? 0);
      this.scene.add(m);
    });
  }

  /** Un InstancedMesh par type d'obstacle. */
  addObstacles(obstacles) {
    const groups = new Map();
    obstacles.forEach((o) => groups.set(o.type, [...(groups.get(o.type) ?? []), o]));
    groups.forEach((list) => {
      const first = list[0];
      const mesh = new THREE.InstancedMesh(first.shape === 'circle' ? CYL : BOX, new THREE.MeshLambertMaterial({ color: first.color }), list.length);
      mesh.frustumCulled = false;
      list.forEach((o, i) => { o.mesh = mesh; o.index = i; this.place(o); });
      this.scene.add(mesh);
      if (first.movable) this.movers.push(...list);
    });
  }

  place(o) {
    dummy.position.set(o.x, o.height / 2, o.y);
    dummy.rotation.set(0, -o.angle, 0);
    if (o.shape === 'circle') dummy.scale.set(o.r, o.height, o.r);
    else dummy.scale.set(o.w, o.height, o.h);
    dummy.updateMatrix();
    o.mesh.setMatrixAt(o.index, dummy.matrix);
  }

  /** Met à jour les obstacles déplaçables. */
  syncObstacles() {
    const touched = new Set();
    for (const o of this.movers) {
      this.place(o);
      touched.add(o.mesh);
    }
    touched.forEach((m) => { m.instanceMatrix.needsUpdate = true; });
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

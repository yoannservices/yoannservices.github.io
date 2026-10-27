
const box = (w, h, d, color) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color }));

/** Voiture low-poly. Avant = +x local. */
class CarMesh {
  constructor(car) {
    const { length: L, width: W } = car.cfg;
    this.group = new THREE.Group();
    this.body = new THREE.Group(); // pivote autour de l'axe avant pour pencher en virage
    this.group.add(this.body);

    const chassis = box(L, 9, W, 0x2c3140); chassis.position.y = 8;
    const cabin = box(L * 0.45, 8, W * 0.8, 0xf5f2ec); cabin.position.set(-L * 0.08, 16, 0);
    const glass = box(L * 0.12, 6, W * 0.7, 0x7fe8e8); glass.position.set(L * 0.17, 16, 0);
    const stripe = box(L * 0.9, 0.5, 4, 0xe8363b); stripe.position.set(0, 12.8, 0);
    const spoiler = box(5, 3, W * 0.95, 0xe8363b); spoiler.position.set(-L * 0.46, 17, 0);
    this.body.add(chassis, cabin, glass, stripe, spoiler);

    const wheel = new THREE.CylinderGeometry(5.5, 5.5, 5, 12);
    const black = new THREE.MeshLambertMaterial({ color: 0x15171c });
    [[0.3, -1], [0.3, 1], [-0.3, -1], [-0.3, 1]].forEach(([fx, side]) => {
      const m = new THREE.Mesh(wheel, black);
      m.rotation.x = Math.PI / 2;
      m.position.set(L * fx, 5.5, side * (W / 2 + 1));
      this.group.add(m);
    });
  }

  update(car) {
    this.group.position.set(car.x, 0, car.y);
    this.group.rotation.y = -car.angle;
    this.body.rotation.x = THREE.MathUtils.clamp(car.lateralSpeed * 0.0003, -0.12, 0.12);
  }
}

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.15, ...o });
const PAINT = std(0xf5f2ec, { roughness: 0.3, metalness: 0.25 }), NAVY = std(0x2c3140, { roughness: 0.4, metalness: 0.3 });
const RED = std(0xe8363b, { roughness: 0.4 }), GLASS = std(0x7fe8e8, { roughness: 0.08, metalness: 0.6, emissive: 0x0b3a3a });
const BLACK = std(0x15171c, { roughness: 0.8 }), CHROME = std(0xcfd6dc, { roughness: 0.2, metalness: 1 });
const HEAD = std(0xfff4d0, { emissive: 0xffe9a0, emissiveIntensity: 0.9 }), TAIL = std(0xff2a40, { emissive: 0xff1030, emissiveIntensity: 0.9 });

/** Profil vu de dessus (x = longueur, y = largeur) extrudé en hauteur, biseauté. L'encombrement reste exact. */
function ext(pts, h, bev, mat, y0) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), x1 = Math.max(...xs), y1 = Math.max(...ys);
  const s = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x * (x1 - bev) / x1, y * (y1 - bev) / y1)));
  const g = new THREE.ExtrudeGeometry(s, { depth: h - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 3, curveSegments: 6 });
  g.rotateX(-Math.PI / 2); g.translate(0, y0 + bev, 0);
  const m = new THREE.Mesh(g, mat); return m;
}
const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; };

/** Voiture de sport vue de dessus : coque effilée, vitrage, capot à prises d'air, bandes, feux, aileron, jantes. Avant = +x local. */
class CarMesh {
  constructor(car) {
    const { length: L, width: W } = car.cfg, k = L / 46, hw = W / 2;
    this.group = new THREE.Group();
    this.body = new THREE.Group(); // pivote autour de l'axe avant pour pencher en virage
    this.group.add(this.body);
    const b = this.body;

    const P = (a) => a.map(([x, y]) => [x * k, y * hw / 11]);
    b.add(ext(P([[23, -6], [21, -9.5], [14, -11], [-14, -11], [-21, -10], [-23, -7], [-23, 7], [-21, 10], [-14, 11], [14, 11], [21, 9.5], [23, 6]]), 8 * k, 1.6, PAINT, 3));
    b.add(ext(P([[23, -6], [21, -9.5], [14, -11], [-14, -11], [-14, 11], [14, 11], [21, 9.5], [23, 6]]).map(([x, y]) => [x * 0.97, y * 0.97]), 2.2 * k, 0.8, NAVY, 3)); // bas de caisse sombre
    b.add(ext(P([[7, -8.6], [3, -9.6], [-9, -9.6], [-14, -8], [-14, 8], [-9, 9.6], [3, 9.6], [7, 8.6]]), 6 * k, 1.8, GLASS, 10));       // habitacle vitré
    b.add(ext(P([[3, -6.5], [-1, -7.4], [-8, -7.4], [-11, -6], [-11, 6], [-8, 7.4], [-1, 7.4], [3, 6.5]]), 2 * k, 0.8, PAINT, 14.6 * k)); // toit
    b.add(ext(P([[21, -7.5], [14, -9.5], [8, -9.5], [8, 9.5], [14, 9.5], [21, 7.5]]), 2.2 * k, 0.9, PAINT, 10.5)); // capot bombé
    for (const s of [-1, 1]) {
      b.add(box(9 * k, 0.5, 2.2, BLACK, 15 * k, 12.7, s * 4.2 * hw / 11));              // prises d'air du capot
      b.add(box(36 * k, 0.4, 1.6, RED, -1 * k, 12.75, s * 1.8 * hw / 11).translateY(0)); // bandes de course
      b.add(box(9 * k, 1.1, 4, PAINT, 13.8 * k, 9.5, s * (hw + 0.4)));                   // ailes élargies
      const mir = box(2.6, 1.6, 1.6, NAVY, 6 * k, 13.4, s * (hw - 0.3)); b.add(mir);      // rétroviseurs
    }
    b.add(box(33 * k, 0.4, 1.6, RED, -7 * k, 17.3, 0));                                  // bande de toit
    b.add(box(1.2, 2, 20 * hw / 11, HEAD, 23 * k, 7, 0).translateX(0));                 // bandeau de feux avant
    for (const s of [-1, 1]) {
      b.add(box(1.8, 2.6, 5, HEAD, 22.4 * k, 8, s * 6.8 * hw / 11));                     // projecteurs
      b.add(box(1.4, 2.2, 4.5, TAIL, -23 * k, 8.4, s * 7 * hw / 11));                    // feux arrière
      b.add(box(1.6, 1.6, 3, CHROME, -23.5 * k, 5, s * 5));                              // sorties d'échappement
    }
    b.add(box(1.4, 3, 20 * hw / 11, BLACK, -23.6 * k, 6, 0).translateX(0));
    b.add(box(3, 0.9, W * 1.02, NAVY, -22 * k, 18.2, 0));                                // aileron
    for (const s of [-1, 1]) { b.add(box(0.8, 5.4, 0.8, BLACK, -21 * k, 15.4, s * 6)); b.add(box(5, 2.2, 0.5, RED, -22 * k, 18, s * W * 0.51)); }
    b.add(box(4, 1.3, W * 0.98, BLACK, 24.5 * k, 3.2, 0));                               // lame avant

    // roues : pneu, jante chromée à 5 rayons, frein
    const tire = new THREE.CylinderGeometry(5.5, 5.5, 5, 18), rim = new THREE.CylinderGeometry(3.6, 3.6, 5.2, 18), spoke = new THREE.BoxGeometry(5.8, 5.4, 0.8);
    [[0.3, -1], [0.3, 1], [-0.3, -1], [-0.3, 1]].forEach(([fx, side]) => {
      const w = new THREE.Group();
      w.add(new THREE.Mesh(tire, BLACK), new THREE.Mesh(rim, CHROME));
      for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(spoke, CHROME); s.rotation.y = i * Math.PI / 5; w.add(s); }
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 5.6, 10), RED); w.add(cap);
      w.rotation.x = Math.PI / 2;
      w.position.set(L * fx, 5.5, side * (W / 2 + 1));
      this.group.add(w);
    });
  }

  update(car) {
    this.group.position.set(car.x, 0, car.y);
    this.group.rotation.y = -car.angle;
    this.body.rotation.x = THREE.MathUtils.clamp(car.lateralSpeed * 0.0003, -0.12, 0.12);
  }
}

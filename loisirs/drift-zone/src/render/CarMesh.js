/** Voiture : vraie Ferrari 458 (exemples three.js, par vicent091036 ; licence à vérifier), chargée par assets/glb.js. Avant = +x local. */
class CarMesh {
  constructor(car) {
    const { length: L } = car.cfg;
    this.group = new THREE.Group();
    this.body = new THREE.Group(); // pivote autour de l'axe avant pour pencher en virage
    this.group.add(this.body);
    import(new URL('../../assets/glb.js', location.href).href).then((m) => m.loadGLB(new URL('../../assets/models/ferrari.glb', location.href).href)).then((g) => {
      g.rotation.y = -Math.PI / 2; g.scale.setScalar(L / 4.52); // le modèle regarde vers -Z, l'avant est ici +x
      g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      this.body.add(g);
    }).catch((e) => console.warn('Ferrari non chargée', e));
  }

  update(car) {
    this.group.position.set(car.x, 0, car.y);
    this.group.rotation.y = -car.angle;
    this.body.rotation.x = THREE.MathUtils.clamp(car.lateralSpeed * 0.0003, -0.12, 0.12);
  }
}

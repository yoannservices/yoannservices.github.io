'use strict';
/* ===== Tesla Roadster : vraie voiture (Sketchfab « Tesla Roadster » par Mona x Supercars, CC-BY, voir assets/models/CREDITS.md) =====
   Repère : avant = -Z, droite = +X, haut = +Y, roues posées sur y = 0. Longueur ~4,3 m.
   Ce fichier ne garde que la structure dont main.js a besoin : groupes, repères de roues, propulseurs (panaches) et caméra cabine. */
window.buildRoadster = function (THREE) {
  const V3 = THREE.Vector3;
  const root = new THREE.Group();     // positionné par la physique
  const body = new THREE.Group();     // roulis / tangage visuels
  root.add(body);

  // matériaux d'effets seulement : lueur des tuyères et panaches (les feux et la peinture sont ceux du vrai modèle)
  const M = {
    nozzleGlow: new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x66ccff, emissiveIntensity: 0.2 }),
    plume: new THREE.MeshBasicMaterial({ color: 0x8fdcff, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
    head: { emissiveIntensity: 0 }, tail: { emissiveIntensity: 0 },
  };

  // ---------- Propulseurs SpaceX : panaches et points d'émission des particules ----------
  const plumes = { rear: [], bottom: [] }, nozzles = [], bottomNozzles = [];
  const plume = (geo, x, y, z, rx) => { const p = new THREE.Mesh(geo, M.plume.clone()); p.rotation.x = rx; p.position.set(x, y, z); body.add(p); return p; };
  for (const sx of [-0.26, 0.26]) {
    plumes.rear.push(plume(new THREE.ConeGeometry(0.1, 1.6, 16, 1, true), sx, 0.42, 3.0, Math.PI / 2));
    nozzles.push(new V3(sx, 0.42, 2.25));
  }
  for (const [sx, sz] of [[-0.55, -1.0], [0.55, -1.0], [-0.55, 0.95], [0.55, 0.95]]) {
    plumes.bottom.push(plume(new THREE.ConeGeometry(0.11, 1.4, 16, 1, true), sx, -0.58, sz, Math.PI));
    bottomNozzles.push(new V3(sx, 0.05, sz));
  }

  // ---------- Repères de roues (le vrai modèle a des roues fixes) : main.js les déplace sans effet visible ----------
  const wheels = [[0.86, -1.32, .36, true], [-0.86, -1.32, .36, true], [0.87, 1.3, .37, false], [-0.87, 1.3, .37, false]].map(([x, z, r, front]) => {
    const mount = new THREE.Group(), steer = new THREE.Group(), spin = new THREE.Group();
    mount.position.set(x, r, z); mount.add(steer); steer.add(spin); root.add(mount);
    return { mount, steer, spin, r, front, baseY: r, x, z };
  });

  // ---------- Lumières ----------
  const headLights = [];
  for (const sx of [-0.62, 0.62]) {
    const sl = new THREE.SpotLight(0xf2f6ff, 0, 160, 0.5, 0.55, 1.4);
    sl.position.set(sx, 0.55, -2.0);
    sl.target.position.set(sx * 1.6, 0, -30);
    root.add(sl); root.add(sl.target);
    headLights.push(sl);
  }

  // caméra cabine : à la place du conducteur dans l'habitacle du vrai modèle
  const cockpitCam = new V3(-0.365, 1.0, -0.07);
  const yoke = new THREE.Group();

  return { root, body, wheels, plumes, nozzles, bottomNozzles, headLights, materials: M, setPaint() {}, cockpitCam, yoke, setScreen() {} };
};

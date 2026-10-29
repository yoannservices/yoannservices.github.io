'use strict';
/* Cibles mobiles de la zone de suivi : voitures en donut, en huit et sur circuit.
   Chaque voiture suit une trajectoire ; l'angle de dérive dépend de l'accélération latérale
   (contre-braquage des roues avant, fumée des pneus arrière, collider dynamique). */

const Targets = (() => {
  const V3 = THREE.Vector3;
  const scene = World.scene;

  class Path {
    constructor(fn, n = 1600) {
      this.pts = []; this.cum = [0]; this.n = n;
      for (let i = 0; i <= n; i++) this.pts.push(fn(i / n));
      for (let i = 1; i <= n; i++) this.cum[i] = this.cum[i - 1] + this.pts[i].distanceTo(this.pts[i - 1]);
      this.len = this.cum[n];
    }
    at(s, pos, tan) {
      const L = this.len; s = ((s % L) + L) % L;
      let lo = 0, hi = this.n;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (this.cum[m] <= s) lo = m; else hi = m; }
      const f = (s - this.cum[lo]) / Math.max(1e-6, this.cum[hi] - this.cum[lo]);
      if (pos) pos.lerpVectors(this.pts[lo], this.pts[hi], f);
      if (tan) tan.subVectors(this.pts[hi], this.pts[lo]).normalize();
    }
    curv(s, d = 1.5) {
      this.at(s - d, null, _t1); this.at(s + d, null, _t2);
      return (_t1.z * _t2.x - _t1.x * _t2.z) / (2 * d); // composante y de t1 × t2 : > 0 = virage à gauche
    }
  }
  const _t1 = new V3(), _t2 = new V3();

  // ── Voiture : coque vide, la vraie Ferrari 458 est ajoutée plus bas (avant = -Z) ──
  function carModel() {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body); scene.add(g);
    return { g, body, wheels: [], steer: [] };
  }

  // ── Traces de pneus (décals) ──
  function skidDecal(cx, cz, w, h, draw) {
    const tex = World.canvasTex(1024, (g, s) => { g.clearRect(0, 0, s, s); draw(g, s, (x, z) => [((x - cx) / w + 0.5) * s, ((z - cz) / h + 0.5) * s]); }, false);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 }));
    m.rotation.x = -Math.PI / 2; m.position.set(cx, 0.03, cz); m.receiveShadow = true;
    scene.add(m);
  }
  function strokePath(g, path, map, offsets, alpha, width) {
    const p = new V3(), t = new V3();
    for (const off of offsets) {
      g.strokeStyle = `rgba(12,12,12,${alpha})`; g.lineWidth = width;
      g.beginPath();
      for (let i = 0; i <= 300; i++) {
        path.at(path.len * i / 300, p, t);
        const [x, y] = map(p.x - t.z * off, p.z + t.x * off);
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
    }
  }

  // ── Trajectoires ──
  const donutC = new V3(110, 0, 70), R = 9;
  const pDonut = new Path(u => new V3(donutC.x + Math.cos(u * Math.PI * 2) * R, 0, donutC.z - Math.sin(u * Math.PI * 2) * R));
  const eightC = new V3(155, 0, 70), A = 17;
  const pEight = new Path(u => { const t = u * Math.PI * 2; return new V3(eightC.x + A * Math.cos(t), 0, eightC.z + A * Math.sin(t) * Math.cos(t)); });
  const pTrack = new Path(u => World.trackCurve.getPointAt(u % 1).clone().setY(0), 2400);

  skidDecal(donutC.x, donutC.z, 30, 30, (g, s, map) => {
    for (let i = 0; i < 14; i++) strokePath(g, pDonut, map, [World.rnd() * 3.6 - 2.4], 0.1 + World.rnd() * 0.08, 6 + World.rnd() * 6);
  });
  skidDecal(eightC.x, eightC.z, 42, 42, (g, s, map) => {
    for (let i = 0; i < 10; i++) strokePath(g, pEight, map, [World.rnd() * 3 - 1.5], 0.08 + World.rnd() * 0.06, 5 + World.rnd() * 5);
  });

  const cars = [];
  function makeCar(name, path, color, accent, o) {
    const m = carModel(color, accent);
    const car = Object.assign({
      name, path, color, ...m, s: o.s0 || 0, v: o.v, drift: 0, heading: 0, yawRate: 0, spin: 0, pos: new V3(), tan: new V3(), center: new V3(),
      col: World.addDynamicBox(new V3(0.95, 0.72, 2.2)), smokeAcc: 0,
    }, o);
    car.col.w = new V3(); car.col.pivot = car.pos;
    cars.push(car);
    return car;
  }
  makeCar('Donut', pDonut, 0xd4261c, 0xf2f2f2, { v: 10.5, mode: 'donut' });
  makeCar('Huit', pEight, 0xf4f4f4, 0x1e6fe0, { v: 12.5, mode: 'eight', grip: 6 });
  makeCar('Circuit', pTrack, 0xf2c21b, 0x111111, { v: 20, vmax: 32, mode: 'track', grip: 11, s0: 40 });

  // vraie Ferrari 458 (exemples three.js, par vicent091036 ; licence à vérifier)
  import(new URL('../../assets/glb.js', location.href).href).then(m => m.loadGLB(new URL('../../assets/models/ferrari.glb', location.href).href)).then(src => {
    for (const c of cars) {
      const m = src.clone(true), body = new THREE.Group(), wheels = [], steer = [];
      m.traverse(o => { if (o.isMesh) { o.castShadow = true; if (o.material.name === 'Body_Color') { o.material = o.material.clone(); o.material.color.set(c.color); } } });
      for (const [n, front] of [['wheel_fl', 1], ['wheel_fr', 1], ['wheel_rl', 0], ['wheel_rr', 0]]) {
        const w = m.getObjectByName(n), piv = new THREE.Group(), spin = new THREE.Group();
        piv.position.copy(w.position); w.position.set(0, 0, 0); spin.add(w); piv.add(spin); c.g.add(piv);
        wheels.push(spin); if (front) steer.push(piv);
      }
      body.add(m); c.g.add(body); c.body = body; c.wheels = wheels; c.steer = steer;
    }
  }).catch(e => console.warn('Ferrari non chargée', e));

  const _p = new V3(), _q = new THREE.Quaternion(), _wl = new V3(), UPY = new V3(0, 1, 0);
  const wrap = a => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };

  function update(dt, t) {
    for (const c of cars) {
      // vitesse : le circuit freine avant les virages
      if (c.mode === 'track') {
        let vt = c.vmax;
        for (let d = 0; d <= 45; d += 5) {
          const k = Math.abs(c.path.curv(c.s + d, 3));
          vt = Math.min(vt, Math.sqrt(c.grip * 1.25 / Math.max(k, 1e-4)) + d * 0.35);
        }
        const a = vt > c.v ? 5.5 : -9;
        c.v = Math.max(6, c.v + Math.max(-9 * dt, Math.min(5.5 * dt, (vt - c.v))) * (a > 0 ? 1 : 1));
      } else if (c.mode === 'eight') {
        c.v = 12.5 + Math.sin(t * 0.4) * 1.2;
      }
      c.s += c.v * dt;
      c.path.at(c.s, c.pos, c.tan);
      const k = c.path.curv(c.s);
      // dérive
      let target;
      if (c.mode === 'donut') target = Math.sign(k || 1) * 0.85 + Math.sin(t * 1.3) * 0.06;
      else {
        const lat = c.v * c.v * Math.abs(k);
        target = Math.sign(k) * Math.min(0.75, Math.max(0, (lat - c.grip * 0.55) / c.grip) * 0.9);
      }
      c.drift += (target - c.drift) * Math.min(1, dt * (c.mode === 'eight' ? 2.2 : 3));
      const h = Math.atan2(-c.tan.x, -c.tan.z) + c.drift;
      c.yawRate = wrap(h - c.heading) / Math.max(dt, 1e-4);
      c.heading = h;
      c.g.position.copy(c.pos);
      c.g.rotation.y = h;
      const lat = c.v * c.v * k;
      c.body.rotation.z = Math.max(-0.06, Math.min(0.06, -lat * 0.004));
      c.body.rotation.x = 0;
      c.spin += c.v / 0.34 * dt * (Math.abs(c.drift) > 0.3 ? 1.6 : 1);
      c.wheels.forEach(w => { w.rotation.x = -c.spin; });
      c.steer.forEach(s => { s.rotation.y = Math.max(-0.65, Math.min(0.65, -c.drift * 0.95 + k * 2.6)); });
      c.center.copy(c.pos).y += 0.75;
      // collider dynamique
      _q.setFromAxisAngle(UPY, h);
      const col = c.col;
      col.c.copy(c.center);
      col.ax.set(1, 0, 0).applyQuaternion(_q); col.ay.set(0, 1, 0); col.az.set(0, 0, 1).applyQuaternion(_q);
      col.v.copy(c.tan).multiplyScalar(c.v);
      col.w.set(0, c.yawRate, 0);
      // fumée des pneus arrière
      const ad = Math.abs(c.drift);
      if (ad > 0.22 && typeof Particles !== 'undefined') {
        c.smokeAcc += dt * (ad - 0.15) * c.v * 3.2;
        while (c.smokeAcc > 1) {
          c.smokeAcc -= 1;
          for (const sx of [-0.86, 0.86]) {
            _wl.set(sx, 0.15, 1.35).applyQuaternion(_q).add(c.pos);
            Particles.emit(_wl, (Math.random() - 0.5) * 1.5 - c.tan.x * c.v * 0.12, 0.4 + Math.random() * 0.6, (Math.random() - 0.5) * 1.5 - c.tan.z * c.v * 0.12,
              0.6, 4.5 + Math.random() * 2.5, 2.2 + Math.random() * 1.4, 0.88, 0.88, 0.9, 0.42);
          }
        }
      }
    }
  }

  update(0, 0);
  return { cars, update };
})();

// Modèles procéduraux. Repère : origine = essieu arrière (médian pour l'articulé), +z = avant, +x = côté gauche (conducteur), -x = côté portes.
import * as THREE from 'three';

const canvas = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
const tex = (c) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.1, ...extra });
const R = 0.5, CL = 0.35, DOOR_W = 1.3;

// Flanc. Pour la face -x, u=0 est l'arrière : les portes (positions u depuis l'avant) sont donc miroitées.
function sideTexture(st, segLen, doors, mirror) {
  const dbl = st.kind === 'double', h = dbl ? 384 : 256;
  const c = canvas(1024, h), g = c.getContext('2d');
  g.fillStyle = st.color; g.fillRect(0, 0, 1024, h);
  g.fillStyle = '#f2f2f2'; g.fillRect(0, h - 51, 1024, 14);
  const dw = (DOOR_W / segLen) * 1024, xs = doors.map((u) => (mirror ? (1 - u) * 1024 - dw : u * 1024));
  const rows = dbl ? [[205, 95], [40, 100]] : [[38, 92]];
  const n = Math.round(segLen / 1.6), w = 1024 / n;
  g.fillStyle = '#15222f';
  for (const [y, hh] of rows) for (let i = 0; i < n; i++) {
    const x0 = i * w + 5, x1 = (i + 1) * w - 5;
    if (y > 150 && xs.some((x) => x1 > x - 6 && x0 < x + dw + 6)) continue;
    g.fillRect(x0, y, x1 - x0, hh);
  }
  g.fillStyle = '#1b2d3f';
  for (const x of xs) g.fillRect(x, dbl ? 190 : 30, dw, dbl ? 160 : 175);
  return tex(c);
}

function endTexture(st, front) {
  const c = canvas(512, 256), g = c.getContext('2d');
  g.fillStyle = st.color; g.fillRect(0, 0, 512, 256);
  g.fillStyle = '#15222f';
  if (front) {
    g.fillRect(20, 40, 472, st.kind === 'double' ? 70 : 150);
    if (st.kind === 'double') g.fillRect(20, 150, 472, 70);
    g.fillStyle = '#0a0a0a'; g.fillRect(150, 12, 212, 22);
    g.fillStyle = '#ffb000'; g.font = 'bold 18px monospace'; g.textAlign = 'center'; g.fillText('BUS CITY', 256, 30);
  } else g.fillRect(60, 50, 392, 100);
  g.fillStyle = '#f2f2f2'; g.fillRect(0, 225, 512, 14);
  return tex(c);
}

const texMat = (map) => new THREE.MeshStandardMaterial({ map, roughness: 0.6 });
const dark = mat('#1d232b');

// corps d'une unité entre zRear et zFront ; renvoie les battants de porte
function addUnit(parent, st, zRear, zFront, o) {
  const len = zFront - zRear, W = st.width, H = st.height;
  const body = new THREE.Mesh(new THREE.BoxGeometry(W, H - CL, len), [
    texMat(sideTexture(st, len, [], false)), texMat(sideTexture(st, len, o.doors, true)),
    mat('#d8dde2'), mat('#222'),
    o.front ? texMat(endTexture(st, true)) : dark, o.rear ? texMat(endTexture(st, false)) : dark,
  ]);
  body.position.set(0, (H + CL) / 2, (zFront + zRear) / 2);
  body.castShadow = true;
  parent.add(body);
  const leaves = [], leafMat = mat('#2a3c50', { roughness: 0.3 });
  for (const u of o.doors) {
    const zc = zFront - (u + DOOR_W / len / 2) * len, half = DOOR_W / 2;
    for (const dir of [1, -1]) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.05, st.kind === 'double' ? 1.9 : 2.3, half), leafMat);
      m.position.set(-W / 2 - 0.03, st.kind === 'double' ? 1.4 : 1.55, zc + (dir * half) / 2);
      parent.add(m);
      leaves.push({ m, z0: m.position.z, dir, travel: half });
    }
  }
  return { len, leaves, doorZ: o.doors.map((u) => zFront - (u + DOOR_W / len / 2) * len) };
}

const rows = (z0, z1, step) => { const a = []; for (let z = z0; z > z1; z -= step) a.push(z); return a; };

// sol, plafond, sièges et passagers (instanciés) d'une unité
function addInterior(parent, st, zRear, zFront, cabin) {
  const W = st.width, H = st.height, len = zFront - zRear, dbl = st.kind === 'double';
  const floors = dbl ? [0.6, 2.6] : [0.6], ceils = dbl ? [2.4, H - 0.15] : [H - 0.15];
  const plane = (y, color) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.1, len - 0.1), mat(color, { side: THREE.DoubleSide }));
    p.rotation.x = -Math.PI / 2; p.position.set(0, y, (zFront + zRear) / 2); parent.add(p);
  };
  floors.forEach((y) => plane(y, '#3b3f45')); ceils.forEach((y) => plane(y, '#cfd3d8'));

  const seats = [], stand = [];
  const zTop = zFront - (cabin ? 3.0 : 1.0), zBot = zRear + 1.8;
  for (const y of floors) {
    for (const z of rows(zTop, zBot, 0.9)) for (const x of [-1.0, -0.55, 0.55, 1.0]) seats.push([x, y, z]);
    for (const z of rows(zTop, zBot, 0.6)) for (const x of [-0.2, 0.2]) stand.push([x, y, z]);
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  const seatMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 0.5, 0.45), mat('#2b3a55'), seats.length);
  seats.forEach(([x, y, z], i) => seatMesh.setMatrixAt(i, m4.makeTranslation(x, y + 0.25, z)));
  const slots = seats.map((s) => ({ s, seated: true })).concat(stand.map((s) => ({ s, seated: false })));
  const body = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.22, 1, 8), mat('#fff'), slots.length);
  const head = new THREE.InstancedMesh(new THREE.SphereGeometry(0.14, 8, 6), mat('#e0b896'), slots.length);
  const pal = ['#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#d35400', '#34495e', '#16a085', '#7f8c8d'];
  slots.forEach(({ s: [x, y, z], seated }, i) => {
    const bh = seated ? 0.75 : 1.3, by = seated ? y + 0.875 : y + 0.65;
    body.setMatrixAt(i, m4.compose(v.set(x, by, z), q, sc.set(1, bh, 1)));
    head.setMatrixAt(i, m4.compose(v.set(x, by + bh / 2 + 0.16, z), q, sc.set(1, 1, 1)));
    body.setColorAt(i, new THREE.Color(pal[(i * 7 + 3) % pal.length]));
  });
  body.count = head.count = 0;
  body.frustumCulled = head.frustumCulled = seatMesh.frustumCulled = false;
  parent.add(seatMesh, body, head);
  return { slotCount: slots.length, setCount: (n) => { body.count = head.count = Math.min(n, slots.length); } };
}

export function createBusModel(st) {
  const W = st.width, H = st.height, A = st.artic;
  const zFront = st.wheelbase + st.frontOverhang;
  const root = new THREE.Group(), tilt = new THREE.Group();
  root.add(tilt);

  const wheels = [], leaves = [], interiors = [], bellows = [];
  const tireGeo = new THREE.CylinderGeometry(R, R, 0.3, 20), hubGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.32, 12);
  const tireMat = mat('#151515'), hubMat = mat('#9aa0a6', { metalness: 0.5 });
  const addWheels = (parent, z, front) => {
    for (const sx of [-1, 1]) {
      const pivot = new THREE.Group(), spin = new THREE.Group();
      pivot.position.set(sx * (W / 2 - 0.12), R, z);
      const tire = new THREE.Mesh(tireGeo, tireMat), hub = new THREE.Mesh(hubGeo, hubMat);
      tire.rotation.z = hub.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      spin.add(tire, hub); pivot.add(spin); parent.add(pivot);
      wheels.push({ pivot, spin, front });
    }
  };

  // feux
  const headMat = new THREE.MeshStandardMaterial({ color: '#fff6d8', emissive: '#fff6d8', emissiveIntensity: 0.15 });
  const brakeMat = new THREE.MeshStandardMaterial({ color: '#661111', emissive: '#ff1111', emissiveIntensity: 0.1 });
  const ind = { left: [], right: [] };
  const lamp = (parent, m, x, y, z, w = 0.35, h = 0.18) => {
    const l = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), m); l.position.set(x, y, z); parent.add(l);
  };
  const addCorners = (parent, z, front) => {
    for (const sx of [-1, 1]) {
      if (front) lamp(parent, headMat, sx * (W / 2 - 0.4), 0.8, z + 0.03); else lamp(parent, brakeMat, sx * (W / 2 - 0.3), 0.9, z - 0.03, 0.3, 0.3);
      const m = new THREE.MeshStandardMaterial({ color: '#b36b00', emissive: '#ff9900', emissiveIntensity: 0 });
      (sx > 0 ? ind.left : ind.right).push(m);   // +x = gauche
      lamp(parent, m, sx * (W / 2 - 0.1), 1.1, z + (front ? 0.03 : -0.03), 0.16, 0.16);
    }
  };

  let rear = null, bellowsInfo = null, rampPivot = null, eyeInt;
  const eye = new THREE.Object3D();   // caméra : l'ancre est retournée car Three regarde vers -z
  eye.rotation.y = Math.PI;
  eyeInt = new THREE.Object3D(); eyeInt.rotation.y = Math.PI;

  let front;
  if (!A) {
    const zRear = zFront - st.length, hood = st.kind === 'mini' ? 1.1 : 0;
    front = addUnit(tilt, st, zRear, zFront - hood, { doors: st.doors === 1 ? [0.12] : [0.07, 0.67], front: !hood, rear: true });
    if (hood) {
      const h = new THREE.Mesh(new THREE.BoxGeometry(W, 0.9, hood), mat(st.color));
      h.position.set(0, CL + 0.45, zFront - hood / 2); h.castShadow = true; tilt.add(h);
    }
    if (st.electric) {
      const bat = new THREE.Mesh(new THREE.BoxGeometry(W - 0.6, 0.35, st.length - 3), mat('#2c3a46'));
      bat.position.set(0, H + 0.17, (zFront + zRear) / 2); tilt.add(bat);
    }
    addWheels(tilt, zFront - st.frontOverhang, true); addWheels(tilt, 0, false);
    addCorners(tilt, zFront, true); addCorners(tilt, zRear, false);
    interiors.push(addInterior(tilt, st, zRear, zFront - hood, true));
    eyeInt.position.set(0, 2.0, zRear + 0.8); tilt.add(eyeInt);
    leaves.push(...front.leaves);
  } else {
    const fr = zFront - A.frontLen;                        // face arrière de l'unité avant
    front = addUnit(tilt, st, fr, zFront, { doors: [0.08, 0.6], front: true, rear: false });
    leaves.push(...front.leaves);
    addWheels(tilt, st.wheelbase, true); addWheels(tilt, 0, false);
    addCorners(tilt, zFront, true);
    interiors.push(addInterior(tilt, st, fr, zFront, true));
    // unité arrière articulée autour de la rotule
    rear = new THREE.Group(); rear.position.z = A.hingeZ; tilt.add(rear);
    const rz1 = -0.3, rz0 = -0.3 - A.rearLen;
    const ru = addUnit(rear, st, rz0, rz1, { doors: [0.45], front: false, rear: true });
    leaves.push(...ru.leaves);
    addWheels(rear, -A.axleDist, false);
    addCorners(rear, rz0, false);
    interiors.push(addInterior(rear, st, rz0, rz1, false));
    eyeInt.position.set(0, 2.0, rz0 + 0.8); rear.add(eyeInt);
    // soufflet : tranches plissées entre la face arrière avant (z=fr) et la face avant arrière
    const N = 7, bm = [mat('#1c2128'), mat('#2d343d')];
    for (let i = 0; i < N; i++) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(W - 0.15, H - CL - 0.3, 0.16), bm[i % 2]);
      s.castShadow = true; tilt.add(s); bellows.push(s);
    }
    bellowsInfo = { fz: fr, N, y: (H + CL) / 2 };
    const turn = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.08, 16), mat('#444'));
    turn.position.set(0, 0.7, A.hingeZ); tilt.add(turn);
  }

  // rampe PMR devant la première porte
  rampPivot = new THREE.Group();
  rampPivot.position.set(-W / 2 - 0.03, 0.62, front.doorZ[0]);
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, DOOR_W * 0.8).translate(-0.6, 0, 0), mat('#e8c200'));
  rampPivot.add(ramp); rampPivot.visible = false; tilt.add(rampPivot);

  // poste de conduite (côté gauche = +x)
  const dash = new THREE.Mesh(new THREE.BoxGeometry(W - 0.2, 0.55, 0.6), mat('#1c1f24'));
  dash.position.set(0, 1.55, zFront - 0.4);
  const wheelPivot = new THREE.Group();
  wheelPivot.position.set(0.7, 1.75, zFront - 1.0); wheelPivot.rotation.x = -1.0;
  const steeringWheel = new THREE.Group();
  steeringWheel.add(new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 8, 24), mat('#111')));
  steeringWheel.add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.03), mat('#111')));
  wheelPivot.add(steeringWheel);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), mat('#2b3a55'));
  seat.position.set(0.7, 1.0, zFront - 2.0);
  tilt.add(dash, wheelPivot, seat);
  eye.position.set(0.7, 2.05, zFront - 1.7); tilt.add(eye);

  const spot = new THREE.SpotLight('#fff3d0', 0, 80, 0.5, 0.5, 1);
  spot.position.set(0, 1, zFront); spot.target.position.set(0, 0, zFront + 20);
  tilt.add(spot, spot.target);

  const model = {
    root, eye, eyeInt, length: st.length, spinAngle: 0, slotCount: interiors.reduce((a, b) => a + b.slotCount, 0),
    setLights(on) { headMat.emissiveIntensity = on ? 2.5 : 0.15; spot.intensity = on ? 600 : 0; },
    setDoors(f) { for (const l of leaves) l.m.position.z = l.z0 + l.dir * f * l.travel; },
    setRamp(f) { rampPivot.visible = f > 0.02; rampPivot.rotation.z = 0.45 * f; rampPivot.scale.x = Math.max(f, 0.01); },
    setPassengers(n) {
      const total = model.slotCount;
      let left = Math.min(n, total);
      interiors.forEach((it, i) => {
        const k = i === interiors.length - 1 ? left : Math.round((Math.min(n, total) * it.slotCount) / total);
        it.setCount(k); left -= k;
      });
    },
    update(p, dt, c) {
      root.position.set(p.x, 0, p.z);
      root.rotation.y = p.heading;
      tilt.rotation.set(p.pitch, 0, p.roll);
      model.spinAngle += (p.speed * dt) / R;
      for (const w of wheels) {
        w.spin.rotation.x = model.spinAngle;
        if (w.front) w.pivot.rotation.y = p.steer;
      }
      steeringWheel.rotation.z = -p.steer * 7;
      if (rear) {
        rear.rotation.y = p.artic;
        const d = p.artic, A2 = st.artic;
        const rx = -0.3 * Math.sin(d), rz = A2.hingeZ - 0.3 * Math.cos(d);
        for (let i = 0; i < bellows.length; i++) {
          const t = (i + 0.5) / bellows.length;
          bellows[i].position.set(rx * t, bellowsInfo.y, bellowsInfo.fz + (rz - bellowsInfo.fz) * t);
          bellows[i].rotation.y = d * t;
        }
      }
      brakeMat.emissiveIntensity = c.braking ? 2.5 : 0.1;
      const blink = Math.floor(c.time * 3) % 2 === 0;
      for (const m of ind.left) m.emissiveIntensity = c.indicator > 0 && blink ? 3 : 0;
      for (const m of ind.right) m.emissiveIntensity = c.indicator < 0 && blink ? 3 : 0;
    },
  };
  return model;
}

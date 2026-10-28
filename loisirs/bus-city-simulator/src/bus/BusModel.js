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

// vue de l'intérieur : paroi claire, fenêtres et pare-brise transparents (alphaTest) pour voir la ville depuis la cabine
function innerSide(st, segLen, doors, mirror) {
  const dbl = st.kind === 'double', h = dbl ? 384 : 256, c = canvas(1024, h), g = c.getContext('2d');
  g.fillStyle = '#c9ced4'; g.fillRect(0, 0, 1024, h);
  g.fillStyle = '#9aa1a8'; g.fillRect(0, h - 70, 1024, 70);
  const dw = (DOOR_W / segLen) * 1024, xs = doors.map((u) => (mirror ? (1 - u) * 1024 - dw : u * 1024));
  const rows = dbl ? [[205, 95], [40, 100]] : [[38, 92]], n = Math.round(segLen / 1.6), w = 1024 / n;
  for (const [y, hh] of rows) for (let i = 0; i < n; i++) g.clearRect(i * w + 5, y, w - 10, hh);
  for (const x of xs) g.clearRect(x, dbl ? 190 : 30, dw, dbl ? 160 : 175);
  return tex(c);
}
function innerEnd(st, front) {
  const c = canvas(512, 256), g = c.getContext('2d');
  g.fillStyle = '#c9ced4'; g.fillRect(0, 0, 512, 256);
  if (front) { g.clearRect(20, 40, 472, st.kind === 'double' ? 70 : 150); if (st.kind === 'double') g.clearRect(20, 150, 472, 70); } else g.clearRect(60, 50, 392, 100);
  return tex(c);
}
const innerMat = (map) => new THREE.MeshStandardMaterial({ map, roughness: 0.8, side: THREE.BackSide, transparent: true, alphaTest: 0.5 });
const innerSkip = new THREE.MeshBasicMaterial({ visible: false });

const texMat = (map) => new THREE.MeshStandardMaterial({ map, roughness: 0.6 });
const dark = mat('#1d232b');
const black = mat('#0c0d10', { roughness: 0.8 }), chrome = mat('#d5dae0', { roughness: 0.15, metalness: 1 }), steel = mat('#8e949e', { roughness: 0.45, metalness: 0.85 });
const glassM = new THREE.MeshPhysicalMaterial({ color: '#0a1622', roughness: 0.05, metalness: 0.5, clearcoat: 1, transparent: true, opacity: 0.55 });
const TIRE_G = new THREE.LatheGeometry([[0.3, -0.15], [0.46, -0.15], [0.5, -0.11], [0.51, -0.05], [0.51, 0.05], [0.5, 0.11], [0.46, 0.15], [0.3, 0.15]].map(([r, w]) => new THREE.Vector2(r, w)), 32).rotateZ(Math.PI / 2);
const RIM_G = new THREE.CylinderGeometry(0.3, 0.3, 0.27, 24).rotateZ(Math.PI / 2), FACE_G = new THREE.CylinderGeometry(0.27, 0.29, 0.03, 24).rotateZ(Math.PI / 2);
const HUBC_G = new THREE.CylinderGeometry(0.09, 0.1, 0.07, 16).rotateZ(Math.PI / 2), LUG_G = new THREE.CylinderGeometry(0.018, 0.018, 0.035, 6).rotateZ(Math.PI / 2);
const put = (parent, geo, m, x, y, z, shadow = false) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = shadow; parent.add(o); return o; };
const bx = (parent, w, h, d, m, x, y, z) => put(parent, new THREE.BoxGeometry(w, h, d), m, x, y, z);
const cy = (parent, r, len, m, x, y, z, axis, seg = 12) => { const g = new THREE.CylinderGeometry(r, r, len, seg); if (axis === 'z') g.rotateX(Math.PI / 2); else if (axis === 'x') g.rotateZ(Math.PI / 2); return put(parent, g, m, x, y, z); };

// bordure arrondie du toit, jupes, climatisation, trappes : habillage d'une unité
function dress(parent, st, zRear, zFront) {
  const W = st.width, H = st.height, len = zFront - zRear, zc = (zFront + zRear) / 2, paint = mat(st.color, { roughness: 0.35, metalness: 0.3 });
  for (const sx of [-1, 1]) {
    cy(parent, 0.11, len - 0.04, paint, sx * (W / 2 - 0.05), H - 0.08, zc, 'z', 14);   // arête de toit arrondie
    bx(parent, 0.03, 0.22, len - 0.1, black, sx * (W / 2 + 0.005), CL + 0.1, zc);        // jupe basse
    bx(parent, 0.03, 0.06, len - 0.1, chrome, sx * (W / 2 + 0.01), CL + 0.26, zc);       // liseré chromé
  }
  const roof = H + 0.01, acl = Math.min(2.4, len * 0.3);
  bx(parent, W * 0.6, 0.28, acl, mat('#c9ced4', { roughness: 0.5 }), 0, roof + 0.14, zc - len * 0.1);
  for (let i = 0; i < 6; i++) bx(parent, W * 0.5, 0.02, 0.04, black, 0, roof + 0.29, zc - len * 0.1 - acl / 2 + 0.2 + i * (acl - 0.4) / 5);
  bx(parent, 0.6, 0.06, 0.6, steel, W * 0.15, roof + 0.03, zc + len * 0.28);          // trappe de toit
  bx(parent, 0.6, 0.06, 0.6, steel, -W * 0.15, roof + 0.03, zc + len * 0.3);
  cy(parent, 0.015, 0.4, black, -W * 0.3, roof + 0.2, zc + len * 0.36, 'y', 6);       // antenne
}


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
  dress(parent, st, zRear, zFront);
  const shell = new THREE.Mesh(new THREE.BoxGeometry(W - 0.04, H - CL - 0.04, len - 0.04), [
    innerMat(innerSide(st, len, [], true)), innerMat(innerSide(st, len, o.doors, false)), innerSkip, innerSkip,
    o.front ? innerMat(innerEnd(st, true)) : innerSkip, o.rear ? innerMat(innerEnd(st, false)) : innerSkip]);
  shell.position.copy(body.position); parent.add(shell);
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
  const tireMat = mat('#151515'), hubMat = mat('#b9c0cc', { roughness: 0.3, metalness: 0.9 });
  const addWheels = (parent, z, front) => {
    for (const sx of [-1, 1]) {
      const pivot = new THREE.Group(), spin = new THREE.Group();
      pivot.position.set(sx * (W / 2 - 0.12), R, z);
      put(spin, TIRE_G, tireMat, 0, 0, 0, true); put(spin, RIM_G, hubMat, 0, 0, 0); put(spin, FACE_G, hubMat, sx * 0.14, 0, 0); put(spin, HUBC_G, steel, sx * 0.17, 0, 0);
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; put(spin, LUG_G, chrome, sx * 0.165, Math.sin(a) * 0.17, Math.cos(a) * 0.17); }
      pivot.add(spin); parent.add(pivot);
      const arch = new THREE.CylinderGeometry(R + 0.1, R + 0.1, 0.55, 22, 1, true, -Math.PI / 2, Math.PI).rotateZ(Math.PI / 2);
      const am = black.clone(); am.side = THREE.DoubleSide; put(parent, arch, am, sx * (W / 2 - 0.12), R, z);
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

  // détails de l'avant : montants, afficheur de ligne, rétroviseurs sur bras, pare-chocs, essuie-glaces, logo
  const hf = st.kind === 'mini' ? 1.1 : 0, zF = zFront - hf;
  bx(tilt, W - 0.1, 0.09, 0.05, black, 0, H * 0.92, zF + 0.03);
  for (const sx of [0]) bx(tilt, 0.03, st.kind === 'double' ? 0.7 : H * 0.55, 0.05, black, sx * (W / 2 - 0.12), st.kind === 'double' ? 1.55 : 1.45, zF + 0.03);
  const dest = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.2), new THREE.MeshBasicMaterial({ map: (() => { const c = canvas(256, 40), g = c.getContext('2d'); g.fillStyle = '#080808'; g.fillRect(0, 0, 256, 40); g.fillStyle = '#ffb000'; g.font = 'bold 26px monospace'; g.textAlign = 'center'; g.fillText('1  GARE - CENTRE', 128, 29); return tex(c); })() }));
  dest.position.set(0, H - 0.3, zF + 0.04); tilt.add(dest);
  for (const sx of [-1, 1]) {
    cy(tilt, 0.015, 0.4, black, sx * (W / 2 + 0.15), H * 0.62, zF - 0.1, 'x', 8);
    bx(tilt, 0.05, 0.34, 0.16, black, sx * (W / 2 + 0.36), H * 0.58, zF - 0.1);
    bx(tilt, 0.015, 0.3, 0.13, glassM, sx * (W / 2 + 0.335), H * 0.58, zF - 0.1);
  }
  bx(tilt, W + 0.02, 0.28, 0.14, black, 0, 0.5, zF + 0.04);
  bx(tilt, W * 0.5, 0.1, 0.06, steel, 0, 0.38, zF + 0.08);
  put(tilt, new THREE.CircleGeometry(0.11, 20), chrome, 0, 0.78, zF + 0.04);
  for (const sx of [-0.45, 0.2]) { const w = bx(tilt, 0.02, 0.03, 0.9, black, sx, H * 0.45, zF + 0.05); w.rotation.z = 0.3; }
  if (!A) { bx(tilt, W + 0.02, 0.22, 0.12, black, 0, 0.55, zFront - st.length - 0.03); bx(tilt, 0.5, 0.12, 0.02, mat('#f4f4f4'), 0, 0.9, zFront - st.length - 0.07); }

  // rampe PMR devant la première porte
  rampPivot = new THREE.Group();
  rampPivot.position.set(-W / 2 - 0.03, 0.62, front.doorZ[0]);
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, DOOR_W * 0.8).translate(-0.6, 0, 0), mat('#e8c200'));
  rampPivot.add(ramp); rampPivot.visible = false; tilt.add(rampPivot);

  // poste de conduite (côté gauche = +x) : planche de bord moulée, combiné numérique, console à voyants, volant, siège, rétro
  const cabState = { lights: false, doors: 0, ramp: 0 };
  const plastic = mat('#202328', { roughness: 0.85 }), plasticL = mat('#31353b', { roughness: 0.8 }), chromeM = mat('#d5dae0', { roughness: 0.15, metalness: 1 });
  const dz0 = zFront - 0.72, DW = W - 0.2;
  const dshape = new THREE.Shape([[0, 0], [0.66, 0], [0.62, 0.3], [0.4, 0.44], [0.16, 0.5], [0, 0.34]].map(([z, y]) => new THREE.Vector2(z, y)));
  const dgeo = new THREE.ExtrudeGeometry(dshape, { depth: DW, bevelEnabled: false }); dgeo.translate(0, 0, -DW / 2); dgeo.rotateY(-Math.PI / 2);
  const dash = new THREE.Mesh(dgeo, plastic); dash.position.set(0, 1.2, dz0); tilt.add(dash);

  // combiné d'instruments : cadran de vitesse, vitesse numérique, voyants (clignotants, phares, portes, rampe, frein)
  const clc = canvas(512, 256), cg = clc.getContext('2d'), clTex = tex(clc);
  let clT = 0;
  const drawCluster = (kmh, c) => {
    cg.fillStyle = '#04070b'; cg.fillRect(0, 0, 512, 256);
    cg.strokeStyle = '#1a2a3a'; cg.lineWidth = 3; cg.strokeRect(2, 2, 508, 252);
    const cx = 150, cy0 = 140, r = 105;
    cg.lineWidth = 3; cg.strokeStyle = '#7fe8e8'; cg.beginPath(); cg.arc(cx, cy0, r, Math.PI * 0.75, Math.PI * 2.25); cg.stroke();
    cg.fillStyle = '#d8e6f0'; cg.font = 'bold 16px monospace'; cg.textAlign = 'center';
    for (let v = 0; v <= 100; v += 10) {
      const an = Math.PI * 0.75 + (v / 100) * Math.PI * 1.5, ca = Math.cos(an), sa = Math.sin(an);
      cg.lineWidth = 3; cg.beginPath(); cg.moveTo(cx + ca * (r - 14), cy0 + sa * (r - 14)); cg.lineTo(cx + ca * r, cy0 + sa * r); cg.stroke();
      cg.fillText(String(v), cx + ca * (r - 30), cy0 + sa * (r - 30) + 5);
    }
    const na = Math.PI * 0.75 + Math.min(Math.abs(kmh), 100) / 100 * Math.PI * 1.5;
    cg.strokeStyle = '#ff5a3c'; cg.lineWidth = 5; cg.beginPath(); cg.moveTo(cx, cy0); cg.lineTo(cx + Math.cos(na) * (r - 8), cy0 + Math.sin(na) * (r - 8)); cg.stroke();
    cg.fillStyle = '#ff5a3c'; cg.beginPath(); cg.arc(cx, cy0, 8, 0, 7); cg.fill();
    cg.fillStyle = '#fff'; cg.font = 'bold 54px monospace'; cg.textAlign = 'right'; cg.fillText(String(Math.round(Math.abs(kmh))), 400, 150);
    cg.font = '20px monospace'; cg.fillStyle = '#7fe8e8'; cg.fillText('km/h', 400, 178);
    const lampTxt = (x, y, col, txt, lit) => { cg.fillStyle = lit ? col : '#1d2a36'; cg.font = 'bold 18px monospace'; cg.textAlign = 'center'; cg.fillText(txt, x, y); };
    const blink = Math.floor(c.time * 3) % 2 === 0;
    lampTxt(330, 40, '#ffb000', '◀', c.indicator > 0 && blink); lampTxt(430, 40, '#ffb000', '▶', c.indicator < 0 && blink);
    lampTxt(360, 215, '#4aa3ff', 'PHARES', cabState.lights); lampTxt(440, 215, '#4adf80', 'PORTES', cabState.doors > 0.05);
    lampTxt(360, 240, '#ffb000', 'RAMPE', cabState.ramp > 0.05); lampTxt(440, 240, '#ff3030', 'FREIN', !!c.braking);
    clTex.needsUpdate = true;
  };
  const cluster = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.23), new THREE.MeshBasicMaterial({ map: clTex }));
  cluster.position.set(0.7, 1.86, dz0 + 0.05); cluster.rotation.set(0.35, Math.PI, 0); tilt.add(cluster);
  drawCluster(0, { time: 0, indicator: 0, braking: false });

  // console de commandes : boutons à voyant qui s'allument avec les touches (O portes, R rampe, L phares, H klaxon, A/E clignotants)
  const cons = canvas(512, 96), cg2 = cons.getContext('2d');
  cg2.fillStyle = '#15181c'; cg2.fillRect(0, 0, 512, 96); cg2.fillStyle = '#c9d2da'; cg2.font = 'bold 20px monospace'; cg2.textAlign = 'center';
  const labels = ['PORTES O', 'RAMPE R', 'PHARES L', 'KLAXON H', '◀ A', 'E ▶', 'CARTE M'];
  labels.forEach((t, i) => cg2.fillText(t, 36 + i * 73, 84));
  const consPanel = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.094), new THREE.MeshBasicMaterial({ map: tex(cons) }));
  consPanel.position.set(0.28, 1.83, dz0 + 0.2); consPanel.rotation.set(-0.7, Math.PI, 0); tilt.add(consPanel);
  const btnOn = ['#27d36b', '#ffb000', '#4aa3ff', '#ffffff', '#ffb000', '#ffb000', '#7fe8e8'];
  const btns = labels.map((_, i) => {
    const m = new THREE.MeshStandardMaterial({ color: '#2a2f35', emissive: btnOn[i], emissiveIntensity: 0, roughness: 0.4 });
    const bt = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.022, 0.018, 14), m);
    bt.position.set(0.28 + 0.215 - i * 0.0715, 1.85, dz0 + 0.19); bt.rotation.x = Math.PI / 2 - 0.7; tilt.add(bt);
    return m;
  });

  // volant à 3 branches, colonne, manettes, siège conducteur, rétro intérieur, pare-soleil
  const wheelPivot = new THREE.Group();
  wheelPivot.position.set(0.7, 1.7, zFront - 1.02); wheelPivot.rotation.x = -1.0;
  const steeringWheel = new THREE.Group();
  steeringWheel.add(new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.032, 10, 32), plastic));
  for (const ang of [Math.PI / 2, Math.PI * 7 / 6, Math.PI * 11 / 6]) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.035, 0.03), plastic); sp.position.set(Math.cos(ang) * 0.11, Math.sin(ang) * 0.11, 0); sp.rotation.z = ang; steeringWheel.add(sp); }
  steeringWheel.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 16).rotateX(Math.PI / 2), plasticL));
  wheelPivot.add(steeringWheel);
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.5, 12), plasticL); column.position.set(0.7, 1.5, zFront - 0.8); column.rotation.x = -1.0; tilt.add(column);
  for (const sx of [-1, 1]) { const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 8).rotateZ(Math.PI / 2), plasticL); stalk.position.set(0.7 + sx * 0.14, 1.66, zFront - 0.84); tilt.add(stalk); }
  const seatM = mat('#2b3a55', { roughness: 0.9 });
  const sbase = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.12, 0.5), seatM); sbase.position.set(0.7, 1.0, zFront - 2.05);
  const sback = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.12), seatM); sback.position.set(0.7, 1.42, zFront - 2.32); sback.rotation.x = -0.12;
  const shead = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.1), seatM); shead.position.set(0.7, 1.9, zFront - 2.36);
  const spost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.5, 10), plasticL); spost.position.set(0.7, 0.72, zFront - 2.05);
  const imirror = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.09, 0.03), plastic); imirror.position.set(0.1, H - 0.34, zFront - 0.3);
  const imGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.23, 0.07), glassM); imGlass.position.set(0.1, H - 0.34, zFront - 0.32); imGlass.rotation.y = Math.PI;
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.025, 0.22), plastic); visor.position.set(0.7, H - 0.1, zFront - 0.18);
  tilt.add(wheelPivot, sbase, sback, shead, spost, imirror, imGlass);
  // barres, poteaux d'appui et plafonniers
  cy(tilt, 0.022, st.length - 3, chromeM, 0, H - 0.34, zFront - 1.5 - (st.length - 3) / 2, 'z', 8);
  for (const dzz of front.doorZ) for (const sz of [-0.8, 0.8]) cy(tilt, 0.025, H - 0.8, chromeM, -W / 2 + 0.3, 0.6 + (H - 0.8) / 2, dzz + sz, 'y', 8);
  for (let z = zFront - 3; z > zFront - st.length + 1; z -= 2.2) bx(tilt, 0.5, 0.02, 0.35, new THREE.MeshBasicMaterial({ color: '#fff7dc' }), 0, H - 0.17, z);
  const seat = sbase;
  eye.position.set(0.7, 2.05, zFront - 1.7); tilt.add(eye);

  const spot = new THREE.SpotLight('#fff3d0', 0, 80, 0.5, 0.5, 1);
  spot.position.set(0, 1, zFront); spot.target.position.set(0, 0, zFront + 20);
  tilt.add(spot, spot.target);

  const model = {
    root, eye, eyeInt, length: st.length, spinAngle: 0, slotCount: interiors.reduce((a, b) => a + b.slotCount, 0),
    setLights(on) { cabState.lights = on; headMat.emissiveIntensity = on ? 2.5 : 0.15; spot.intensity = on ? 600 : 0; },
    setDoors(f) { cabState.doors = f; for (const l of leaves) l.m.position.z = l.z0 + l.dir * f * l.travel; },
    setRamp(f) { cabState.ramp = f; rampPivot.visible = f > 0.02; rampPivot.rotation.z = 0.45 * f; rampPivot.scale.x = Math.max(f, 0.01); },
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
      clT += dt; if (clT > 0.05) { clT = 0; drawCluster(p.speed * 3.6, c); }
      const blinkOn = Math.floor(c.time * 3) % 2 === 0, lit = [cabState.doors > 0.05, cabState.ramp > 0.05, cabState.lights, !!c.horn, c.indicator > 0 && blinkOn, c.indicator < 0 && blinkOn, false];
      btns.forEach((m, i) => { m.emissiveIntensity = lit[i] ? 2.2 : 0; });
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

// Briques communes aux modèles d'engins : matériaux, pneus, jantes, chenilles, cabine avec compteurs, vérins qui suivent leurs points d'attache.
import * as THREE from 'three';

const M = {};
export function mats(accent = '#f2b705') {
  const k = 'm' + accent;
  if (M[k]) return M[k];
  return (M[k] = {
    paint: new THREE.MeshPhysicalMaterial({ color: accent, roughness: 0.38, metalness: 0.25, clearcoat: 0.7, clearcoatRoughness: 0.25 }),
    dark: new THREE.MeshStandardMaterial({ color: '#2a2d2f', roughness: 0.7, metalness: 0.4 }),
    steel: new THREE.MeshStandardMaterial({ color: '#8a9096', roughness: 0.35, metalness: 0.85 }),
    chrome: new THREE.MeshStandardMaterial({ color: '#d9dde0', roughness: 0.12, metalness: 1 }),
    rubber: new THREE.MeshStandardMaterial({ color: '#161616', roughness: 0.95 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#9fc4cf', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.28, depthWrite: false, clearcoat: 1 }),
    black: new THREE.MeshStandardMaterial({ color: '#0d0d0f', roughness: 0.6 }),
    grey: new THREE.MeshStandardMaterial({ color: '#555a5e', roughness: 0.6, metalness: 0.3 }),
    bucket: new THREE.MeshStandardMaterial({ color: '#4a4c4d', roughness: 0.55, metalness: 0.7 }),
    seat: new THREE.MeshStandardMaterial({ color: '#202225', roughness: 0.9 }),
    red: new THREE.MeshStandardMaterial({ color: '#7a0f10', roughness: 0.5, emissive: '#400000', emissiveIntensity: 0.0 }),
    head: new THREE.MeshStandardMaterial({ color: '#fff8e0', emissive: '#fff4c8', emissiveIntensity: 0.0 }),
    tail: new THREE.MeshStandardMaterial({ color: '#a01010', emissive: '#ff1010', emissiveIntensity: 0.0 }),
    amber: new THREE.MeshStandardMaterial({ color: '#d98a00', emissive: '#ffa000', emissiveIntensity: 0.0 }),
  });
}

export function box(parent, w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m;
}
export function cyl(parent, r, len, mat, x, y, z, axis = 'x', seg = 16, r2 = r) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r2, len, seg), mat); m.position.set(x, y, z);
  if (axis === 'x') m.rotation.z = Math.PI / 2; else if (axis === 'z') m.rotation.x = Math.PI / 2;
  m.castShadow = true; parent.add(m); return m;
}
// profil latéral extrudé (points [z, y] dans le plan latéral) sur une largeur w centrée en x
export function extrude(parent, pts, w, mat, x = 0, bevel = 0.04) {
  const sh = new THREE.Shape(pts.map(([z, y]) => new THREE.Vector2(z, y)));
  const g = new THREE.ExtrudeGeometry(sh, { depth: w - bevel * 2, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, steps: 1 });
  g.translate(0, 0, -(w - bevel * 2) / 2); g.rotateY(-Math.PI / 2);   // le profil (x=z, y) -> plan latéral, extrusion selon X
  const m = new THREE.Mesh(g, mat); m.position.x = x; m.castShadow = true; parent.add(m); return m;
}

// Pneu : Lathe arrondi + bande de roulement à crampons, jante à branches, écrous
export function wheel(parent, R, width, x, y, z, left, paint) {
  const k = mats(paint), g = new THREE.Group(); g.position.set(x, y, z);
  const prof = [], hw = width / 2;
  prof.push(new THREE.Vector2(R * 0.55, -hw), new THREE.Vector2(R * 0.9, -hw * 0.98), new THREE.Vector2(R * 0.985, -hw * 0.75), new THREE.Vector2(R, -hw * 0.4), new THREE.Vector2(R, hw * 0.4), new THREE.Vector2(R * 0.985, hw * 0.75), new THREE.Vector2(R * 0.9, hw * 0.98), new THREE.Vector2(R * 0.55, hw));
  const tire = new THREE.Mesh(new THREE.LatheGeometry(prof, 32), k.rubber); tire.rotation.z = Math.PI / 2; tire.castShadow = true; g.add(tire);
  const spin = new THREE.Group(); g.add(spin);
  const side = left ? 1 : -1;
  cyl(spin, R * 0.52, 0.06, k.steel, side * (hw - 0.02), 0, 0, 'x', 24);
  cyl(spin, R * 0.16, 0.12, k.paint, side * (hw + 0.01), 0, 0, 'x', 12);
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2, n = cyl(spin, R * 0.035, 0.08, k.chrome, side * (hw + 0.02), Math.cos(a) * R * 0.3, Math.sin(a) * R * 0.3, 'x', 6);
    const sp = box(spin, 0.05, R * 0.34, R * 0.05, k.dark, side * (hw - 0.03), Math.cos(a) * R * 0.34, Math.sin(a) * R * 0.34); sp.rotation.x = -a + Math.PI / 2 * 0;
    sp.rotation.x = a; n.castShadow = false;
  }
  parent.add(g); return { g, spin };
}

// Chaîne de chenille : carter + patins qui défilent (InstancedMesh le long d'un stade)
export function track(parent, len, hgt, width, x, y, paint) {
  const k = mats(paint), g = new THREE.Group(); g.position.set(x, y, 0); parent.add(g);
  const R = hgt / 2, straight = len - hgt;
  const sh = new THREE.Shape();
  sh.moveTo(-straight / 2, R); sh.lineTo(straight / 2, R); sh.absarc(straight / 2, 0, R, Math.PI / 2, -Math.PI / 2, true); sh.lineTo(-straight / 2, -R); sh.absarc(-straight / 2, 0, R, -Math.PI / 2, Math.PI / 2, true);
  const frame = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: width * 0.5, bevelEnabled: false }), k.dark); frame.scale.set(0.9, 0.9, 1); frame.position.z = -width * 0.25; frame.rotation.y = Math.PI / 2; g.add(frame);
  const N = Math.round(len * 5.2), pad = new THREE.InstancedMesh(new THREE.BoxGeometry(width, 0.07, 0.34), k.rubber, N); pad.castShadow = true; pad.frustumCulled = false; g.add(pad);
  const per = 2 * straight + 2 * Math.PI * R, d = new THREE.Object3D();
  const rollers = [];
  for (let i = 0; i < 6; i++) { const rr = cyl(g, R * 0.34, width * 0.55, k.steel, 0, -R * 0.62, -straight / 2 + (i + 0.5) * straight / 6, 'x', 12); rollers.push(rr); }
  for (const s of [-1, 1]) { const sp = cyl(g, R * 0.72, width * 0.7, k.steel, 0, 0, s * straight / 2, 'x', 14); rollers.push(sp); }
  const update = (offset) => {
    for (let i = 0; i < N; i++) {
      let s = ((i / N + offset) % 1 + 1) % 1 * per, y1, z1, rx;
      if (s < straight) { z1 = -straight / 2 + s; y1 = R; rx = 0; }
      else if ((s -= straight) < Math.PI * R) { const a = s / R; z1 = straight / 2 + Math.sin(a) * R; y1 = Math.cos(a) * R; rx = -a; }
      else if ((s -= Math.PI * R) < straight) { z1 = straight / 2 - s; y1 = -R; rx = Math.PI; }
      else { s -= straight; const a = s / R; z1 = -straight / 2 - Math.sin(a) * R; y1 = -Math.cos(a) * R; rx = Math.PI - a; }
      d.position.set(0, y1, z1); d.rotation.set(rx, 0, 0); d.updateMatrix(); pad.setMatrixAt(i, d.matrix);
    }
    pad.instanceMatrix.needsUpdate = true;
  };
  update(0);
  return { g, update, per };
}

// Cabine vitrée avec poste de conduite : siège, volant, tableau de bord à CanvasTexture (vitesse, carburant, régime, dégâts, voyants)
export function cabin(parent, { w = 1.7, h = 1.9, d = 1.8, x = 0, y = 0, z = 0, paint = '#f2b705', wheelType = 'wheel', door = true }) {
  const k = mats(paint), g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
  box(g, w, 0.1, d, k.dark, 0, 0, 0);
  const roof = box(g, w + 0.12, 0.12, d + 0.14, k.paint, 0, h, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, 0.07, h, 0.07, k.paint, sx * (w / 2 - 0.02), h / 2, sz * (d / 2 - 0.02));
  const gl = (gw, gh, gx, gy, gz, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(gw, gh), k.glass); m.position.set(gx, gy, gz); m.rotation.y = ry; m.renderOrder = 4; g.add(m); };
  gl(w - 0.08, h - 0.35, 0, h / 2 + 0.05, d / 2, 0); gl(w - 0.08, h - 0.35, 0, h / 2 + 0.05, -d / 2, Math.PI);
  gl(d - 0.08, h - 0.35, w / 2, h / 2 + 0.05, 0, Math.PI / 2); gl(d - 0.08, h - 0.35, -w / 2, h / 2 + 0.05, 0, -Math.PI / 2);
  box(g, w - 0.1, 0.5, 0.06, k.paint, 0, 0.3, -d / 2 + 0.03);
  // siège
  const seat = new THREE.Group(); seat.position.set(0, 0.05, -0.2); g.add(seat);
  box(seat, 0.5, 0.12, 0.5, k.seat, 0, 0.45, 0); box(seat, 0.5, 0.65, 0.12, k.seat, 0, 0.8, -0.28); box(seat, 0.12, 0.35, 0.3, k.seat, 0.3, 0.6, 0); box(seat, 0.12, 0.35, 0.3, k.seat, -0.3, 0.6, 0);
  cyl(seat, 0.05, 0.4, k.dark, 0, 0.22, 0, 'y', 8);
  // planche de bord + compteurs
  const dash = box(g, w - 0.2, 0.32, 0.4, k.dark, 0, 0.78, d / 2 - 0.28); dash.rotation.x = -0.25;
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; const cx = cv.getContext('2d'), tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.23), new THREE.MeshBasicMaterial({ map: tex, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  scr.position.set(0, 0.9, d / 2 - 0.5); scr.rotation.x = -0.45 - Math.PI / 2 + Math.PI / 2; scr.rotation.y = Math.PI; g.add(scr);
  scr.position.set(0, 0.93, d / 2 - 0.34); scr.rotation.set(-0.3, Math.PI, 0);
  // volant ou manettes
  const sw = new THREE.Group(); sw.position.set(0, 0.88, d / 2 - 0.65); g.add(sw);
  if (wheelType === 'wheel') {
    const col = cyl(g, 0.03, 0.4, k.dark, 0, 0.8, d / 2 - 0.55, 'z', 8); col.rotation.x = Math.PI / 2 - 0.5;
    sw.rotation.x = -0.5; const ring = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.02, 8, 24), k.black); sw.add(ring);
    box(sw, 0.36, 0.025, 0.025, k.black); box(sw, 0.025, 0.36, 0.025, k.black); sw.position.set(0, 0.97, d / 2 - 0.62); sw.userData.wheel = true;
  } else {
    for (const sx of [-1, 1]) { const st = cyl(g, 0.015, 0.34, k.dark, sx * 0.42, 0.6, 0.0, 'y', 6); st.userData.stick = sx; cyl(g, 0.035, 0.07, k.black, sx * 0.42, 0.79, 0.0, 'y', 8); }
  }
  const eye = new THREE.Object3D(); eye.position.set(0, 1.28, -0.15); g.add(eye);
  const dr = { cx, tex, last: '' };
  const draw = (s) => {
    const key = s.join('|'); if (key === dr.last) return; dr.last = key;
    cx.fillStyle = '#071013'; cx.fillRect(0, 0, 256, 128);
    cx.fillStyle = '#7ef0c8'; cx.font = 'bold 54px Inter,Arial'; cx.textAlign = 'center'; cx.fillText(s[0], 80, 66);
    cx.font = '14px Inter,Arial'; cx.fillStyle = '#6aa89a'; cx.fillText('km/h', 80, 86);
    const bar = (lab, v, y, col) => { cx.fillStyle = '#123'; cx.fillRect(150, y, 90, 10); cx.fillStyle = col; cx.fillRect(150, y, 90 * Math.max(0, Math.min(1, v)), 10); cx.fillStyle = '#9ab'; cx.font = '11px Inter,Arial'; cx.textAlign = 'left'; cx.fillText(lab, 150, y - 3); cx.textAlign = 'center'; };
    bar('CARBURANT', +s[1], 22, +s[1] < 0.15 ? '#ff4a3a' : '#f2b705'); bar('RÉGIME', +s[2], 50, '#5ec8ff'); bar('ÉTAT', 1 - +s[3], 78, +s[3] > 0.6 ? '#ff4a3a' : '#5ee08a');
    cx.fillStyle = s[4] === '1' ? '#7ef0c8' : '#264'; cx.font = '13px Inter,Arial'; cx.fillText('FEUX', 40, 118); cx.fillStyle = s[5] === '1' ? '#ffb000' : '#432'; cx.fillText('GYRO', 100, 118);
    cx.fillStyle = s[6]; cx.fillText(s[7], 190, 118); tex.needsUpdate = true;
  };
  return { g, eye, roof, sw, draw, seat };
}

// Vérin : cylindre + tige entre deux points d'attache (Object3D), recalculés à chaque image
export function ram(parent, a, b, r = 0.07, mat) {
  const m = mats();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 10), mat ?? m.grey), rod = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.6, r * 0.6, 1, 8), m.chrome);
  body.castShadow = true; parent.add(body, rod);
  const A = new THREE.Vector3(), B = new THREE.Vector3(), inv = new THREE.Matrix4(), up = new THREE.Vector3(0, 1, 0);
  const fn = () => {
    parent.updateWorldMatrix(true, false); inv.copy(parent.matrixWorld).invert();
    a.getWorldPosition(A).applyMatrix4(inv); b.getWorldPosition(B).applyMatrix4(inv);
    const len = A.distanceTo(B), dir = B.clone().sub(A).normalize(), q = new THREE.Quaternion().setFromUnitVectors(up, dir);
    for (const [mesh, f0, f1] of [[body, 0, 0.55], [rod, 0.55, 1]]) { mesh.scale.set(1, len * (f1 - f0), 1); mesh.position.copy(A).addScaledVector(dir, len * (f0 + f1) / 2); mesh.quaternion.copy(q); }
  };
  fn.meshes = [body, rod];
  return fn;
}
export const anchor = (parent, x, y, z) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };

// Phares avant / feux arrière / gyrophare ; renvoie une fonction de mise à jour
export function lighting(parent, { front, rear, beacon }, paint) {
  const k = mats(paint), spots = [];
  const lamps = [];
  for (const [x, y, z] of front) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.08), k.head); l.position.set(x, y, z); parent.add(l); lamps.push(l); }
  for (const [x, y, z] of rear) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.06), k.tail); l.position.set(x, y, z); parent.add(l); }
  const bm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.18, 12), new THREE.MeshStandardMaterial({ color: '#d98a00', emissive: '#ff9900', emissiveIntensity: 0, transparent: true, opacity: 0.9 })); bm.position.set(...beacon); parent.add(bm);
  for (const sx of [front[0][0], front[front.length - 1][0]]) {
    const sp = new THREE.SpotLight('#fff4d0', 0, 70, 0.55, 0.5, 1.4); sp.position.set(sx * 0.6, front[0][1], front[0][2] + 0.1);
    const tg = new THREE.Object3D(); tg.position.set(sx * 0.4, front[0][1] - 1.5, front[0][2] + 24); parent.add(sp, tg); sp.target = tg; spots.push(sp);
  }
  return (on, beaconOn, t, reversing, brake, night) => {
    k.head.emissiveIntensity = on ? 2.2 : 0; k.tail.emissiveIntensity = on ? 1.1 + (brake ? 1.2 : 0) : (brake ? 1.5 : 0);
    bm.material.emissiveIntensity = beaconOn ? (Math.sin(t * 9) > 0 ? 3 : 0.3) : 0;
    for (const s of spots) s.intensity = on && night > 0.15 ? 90 * Math.min(1, night * 2) : 0;
  };
}

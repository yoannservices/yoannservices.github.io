'use strict';
/* Monde : terrain, décor, obstacles, collisions (grille spatiale) et portes de course.
   Plan (x = est, z = sud, y = haut, départ en (0, 20) face au nord) :
   - Terrain d'envol + portes autour du départ
   - Bando (bâtiment abandonné) à l'ouest  (-90, -40)
   - Tunnel en S à l'est (80, -50…-130), dalot triple (130, -80), tunnel coudé (-150, -100)
   - Parc d'obstacles au nord : tour de dive, conteneurs, ligne haute tension, éolienne
   - Forêt au nord (z < -205)
   - Zone de suivi au sud-est : voitures en drift sur un parking + circuit */

const World = (() => {
  const V3 = THREE.Vector3;
  const scene = new THREE.Scene();
  const colliders = [], dynamic = [], occluders = [], gates = [], course = [];
  const grid = new Map();
  const CELL = 8;
  let stamp = 0;

  // ── Aléatoire déterministe & bruit ──
  function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const rnd = mulberry(1337);
  const rr = (a, b) => a + (b - a) * rnd();
  function hash(x, z) { const h = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return h - Math.floor(h); }
  function vnoise(x, z) {
    const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
    const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
    const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, z) { return vnoise(x, z) * 0.5 + vnoise(x * 2.1 + 7, z * 2.1) * 0.25 + vnoise(x * 4.3, z * 4.3 + 3) * 0.125; }

  // ── Relief : plat au centre, collines tout autour ──
  const FLAT = { x0: -210, x1: 260, z0: -300, z1: 185 };
  function heightAt(x, z) {
    const dx = Math.max(FLAT.x0 - x, 0, x - FLAT.x1), dz = Math.max(FLAT.z0 - z, 0, z - FLAT.z1);
    const d = Math.sqrt(dx * dx + dz * dz);
    if (d <= 0) return 0;
    const n = fbm(x * 0.008, z * 0.008);
    return (d * d / (d + 60)) * (0.35 + 0.9 * n);
  }

  // ── Textures procédurales ──
  function canvasTex(size, draw, repeat = true) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d'); draw(g, size);
    const t = new THREE.CanvasTexture(c);
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    return t;
  }
  function wrapped(g, s, fn) { for (const ox of [-s, 0, s]) for (const oy of [-s, 0, s]) { g.save(); g.translate(ox, oy); fn(); g.restore(); } }
  function blotches(g, s, n, rmin, rmax, colors, alpha) {
    for (let i = 0; i < n; i++) {
      const x = rnd() * s, y = rnd() * s, r = rr(rmin, rmax), col = colors[(rnd() * colors.length) | 0];
      wrapped(g, s, () => {
        const gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, col.replace('A', alpha)); gr.addColorStop(1, col.replace('A', 0));
        g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
      });
    }
  }
  function speckle(g, s, n, fn) { for (let i = 0; i < n; i++) { g.fillStyle = fn(); g.fillRect(rnd() * s, rnd() * s, 1 + rnd() * 1.5, 1 + rnd() * 1.5); } }

  const TEX = {};
  TEX.grass = canvasTex(512, (g, s) => {
    g.fillStyle = '#4d6b31'; g.fillRect(0, 0, s, s);
    blotches(g, s, 40, 30, 90, ['rgba(70,95,40,A)', 'rgba(105,120,55,A)', 'rgba(60,80,35,A)'], 0.5);
    for (let i = 0; i < 14000; i++) {
      const h = 75 + rnd() * 30, l = 20 + rnd() * 22;
      g.strokeStyle = `hsla(${h},${35 + rnd() * 20}%,${l}%,0.8)`; g.lineWidth = 1;
      const x = rnd() * s, y = rnd() * s; g.beginPath(); g.moveTo(x, y); g.lineTo(x + rr(-2, 2), y - rr(2, 6)); g.stroke();
    }
    blotches(g, s, 8, 6, 16, ['rgba(110,90,60,A)'], 0.35);
  });
  TEX.asphalt = canvasTex(512, (g, s) => {
    g.fillStyle = '#3a3c3f'; g.fillRect(0, 0, s, s);
    blotches(g, s, 30, 30, 100, ['rgba(30,31,33,A)', 'rgba(70,72,75,A)'], 0.35);
    speckle(g, s, 40000, () => `rgba(${rnd() < 0.5 ? '20,20,22' : '120,122,125'},${0.25 + rnd() * 0.4})`);
    g.strokeStyle = 'rgba(15,15,15,.5)'; g.lineWidth = 1.2;
    for (let i = 0; i < 6; i++) { let x = rnd() * s, y = rnd() * s; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 8; j++) { x += rr(-20, 20); y += rr(-20, 20); g.lineTo(x, y); } g.stroke(); }
  });
  TEX.concrete = canvasTex(512, (g, s) => {
    g.fillStyle = '#8e8a83'; g.fillRect(0, 0, s, s);
    blotches(g, s, 50, 20, 80, ['rgba(110,105,98,A)', 'rgba(150,146,138,A)', 'rgba(90,92,80,A)'], 0.45);
    speckle(g, s, 25000, () => `rgba(${rnd() < 0.5 ? '60,58,55' : '180,178,170'},${0.2 + rnd() * 0.3})`);
    g.strokeStyle = 'rgba(60,58,54,.35)'; g.lineWidth = 2;
    for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(0, i * 128); g.lineTo(s, i * 128); g.stroke(); }
    for (let i = 0; i <= 2; i++) { g.beginPath(); g.moveTo(i * 256, 0); g.lineTo(i * 256, s); g.stroke(); }
    // coulures
    for (let i = 0; i < 25; i++) { const x = rnd() * s, y = rnd() * s; const gr = g.createLinearGradient(x, y, x, y + 80); gr.addColorStop(0, 'rgba(50,48,40,.35)'); gr.addColorStop(1, 'rgba(50,48,40,0)'); g.fillStyle = gr; g.fillRect(x, y, 3 + rnd() * 5, 80); }
  });
  TEX.dirt = canvasTex(512, (g, s) => {
    g.fillStyle = '#6d5538'; g.fillRect(0, 0, s, s);
    blotches(g, s, 40, 20, 70, ['rgba(90,70,45,A)', 'rgba(80,95,45,A)', 'rgba(120,100,70,A)'], 0.45);
    speckle(g, s, 30000, () => `rgba(${rnd() < 0.5 ? '45,35,25' : '150,130,100'},${0.3 + rnd() * 0.4})`);
  });
  TEX.metal = canvasTex(256, (g, s) => {
    g.fillStyle = '#9a9ea3'; g.fillRect(0, 0, s, s);
    blotches(g, s, 20, 10, 40, ['rgba(120,80,50,A)', 'rgba(70,75,80,A)'], 0.4);
    speckle(g, s, 6000, () => `rgba(60,60,60,${rnd() * 0.3})`);
  });
  TEX.corrugated = canvasTex(256, (g, s) => {
    for (let x = 0; x < s; x += 16) {
      const gr = g.createLinearGradient(x, 0, x + 16, 0);
      gr.addColorStop(0, '#d9d9d9'); gr.addColorStop(0.5, '#ffffff'); gr.addColorStop(1, '#a8a8a8');
      g.fillStyle = gr; g.fillRect(x, 0, 16, s);
    }
    blotches(g, s, 25, 6, 30, ['rgba(120,70,30,A)'], 0.5);
    speckle(g, s, 3000, () => `rgba(80,50,30,${rnd() * 0.4})`);
  });
  TEX.wood = canvasTex(256, (g, s) => {
    for (let y = 0; y < s; y += 32) { g.fillStyle = `hsl(30,${35 + rnd() * 15}%,${32 + rnd() * 10}%)`; g.fillRect(0, y, s, 31); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, y + 31, s, 1); }
    speckle(g, s, 4000, () => `rgba(40,25,10,${rnd() * 0.3})`);
  });
  TEX.stripes = canvasTex(128, (g, s) => {
    g.fillStyle = '#ff6a00'; g.fillRect(0, 0, s, s);
    g.fillStyle = '#141414';
    for (let i = -2; i < 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64 + 32, 0); g.lineTo(i * 64 + 32 + s, s); g.lineTo(i * 64 + s, s); g.fill(); }
  });
  TEX.checker = canvasTex(256, (g, s) => {
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = (i + j) % 2 ? '#f2f2f2' : '#151515'; g.fillRect(i * 32, j * 32, 32, 32); }
  }, false);
  TEX.kerb = canvasTex(128, (g, s) => {
    g.fillStyle = '#e8e8e8'; g.fillRect(0, 0, s, s); g.fillStyle = '#d42a20'; g.fillRect(0, 0, s, s / 2);
  });

  // ── Matériaux ──
  const L = (o) => new THREE.MeshLambertMaterial(o);
  const M = {
    terrain: L({ map: TEX.grass, vertexColors: true }),
    concrete: L({ map: TEX.concrete }),
    concreteDark: L({ map: TEX.concrete, color: 0x8a8a8a }),
    asphalt: L({ map: TEX.asphalt }),
    dirt: L({ map: TEX.dirt }),
    metal: L({ map: TEX.metal }),
    steel: L({ map: TEX.metal, color: 0x6d7378 }),
    wood: L({ map: TEX.wood }),
    gate: L({ map: TEX.stripes }),
    gateDark: L({ color: 0x1a1a1a }),
    light: new THREE.MeshBasicMaterial({ color: 0xffe2a8 }),
    white: L({ color: 0xf0f0f0 }),
    red: L({ color: 0xd8342a }),
    accent: L({ color: 0x22c55e }),
    trunk: L({ color: 0x5a4330 }),
    leaf: L({ color: 0xffffff }),
    rock: L({ map: TEX.concrete, color: 0x9a948a }),
    kerb: L({ map: TEX.kerb }),
    lineWhite: L({ color: 0xe8e8e8 }),
    pad: L({ map: TEX.checker }),
    cont: [0xb8402e, 0x2d5e9e, 0x3f7f3a, 0xc7a032, 0x8a8f94].map(c => L({ map: TEX.corrugated, color: c })),
    cable: L({ color: 0x222222 }),
    tent: L({ color: 0x1f8f4c, side: THREE.DoubleSide }),
  };
  // surfaces posées au sol : décalage de profondeur pour éviter le scintillement
  [[M.asphalt, -1], [M.kerb, -2], [M.lineWhite, -3]].forEach(([m, o]) => { m.polygonOffset = true; m.polygonOffsetFactor = o; m.polygonOffsetUnits = o * 2; });

  // ── Lot de géométrie fusionnée (peu d'appels de rendu, UV en coordonnées monde) ──
  class Batch {
    constructor(mat, uvScale = 4) { this.mat = mat; this.s = uvScale; this.chunks = new Map(); }
    add(geo, matrix) {
      const g = geo.index ? geo.toNonIndexed() : geo;
      const pa = g.attributes.position, na = g.attributes.normal;
      const nm = new THREE.Matrix3().getNormalMatrix(matrix);
      const v = new V3(), w = new V3(), s = this.s;
      // regroupement par blocs de 64 m pour que le culling (caméra et ombres) reste efficace
      const key = Math.floor(matrix.elements[12] / 64) + ',' + Math.floor(matrix.elements[14] / 64);
      let c = this.chunks.get(key);
      if (!c) this.chunks.set(key, c = { p: [], n: [], uv: [] });
      for (let i = 0; i < pa.count; i++) {
        v.fromBufferAttribute(pa, i).applyMatrix4(matrix);
        w.fromBufferAttribute(na, i).applyMatrix3(nm).normalize();
        c.p.push(v.x, v.y, v.z); c.n.push(w.x, w.y, w.z);
        const ax = Math.abs(w.x), ay = Math.abs(w.y), az = Math.abs(w.z);
        if (ay >= ax && ay >= az) c.uv.push(v.x / s, v.z / s);
        else if (ax >= az) c.uv.push(v.z / s, v.y / s);
        else c.uv.push(v.x / s, v.y / s);
      }
    }
    build(opt = {}) {
      for (const c of this.chunks.values()) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(c.p, 3));
        geo.setAttribute('normal', new THREE.Float32BufferAttribute(c.n, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(c.uv, 2));
        geo.computeBoundingSphere();
        const mesh = new THREE.Mesh(geo, this.mat);
        mesh.castShadow = opt.cast !== false; mesh.receiveShadow = true;
        mesh.matrixAutoUpdate = false;
        scene.add(mesh);
      }
      this.chunks = null;
    }
  }
  const B = {
    concrete: new Batch(M.concrete, 4), concreteDark: new Batch(M.concreteDark, 4), asphalt: new Batch(M.asphalt, 7),
    dirt: new Batch(M.dirt, 5), metal: new Batch(M.metal, 2), steel: new Batch(M.steel, 2), wood: new Batch(M.wood, 2),
    light: new Batch(M.light, 2), white: new Batch(M.white, 2), red: new Batch(M.red, 2), gate: new Batch(M.gate, 1.2),
    gateDark: new Batch(M.gateDark, 2), rock: new Batch(M.rock, 3), cable: new Batch(M.cable, 2), lineWhite: new Batch(M.lineWhite, 4),
    cont: M.cont.map(m => new Batch(m, 2.4)), tent: new Batch(M.tent, 3), accent: new Batch(M.accent, 2),
  };

  // ── Collisions ──
  function cellKey(ix, iz) { return (ix + 2048) * 4096 + (iz + 2048); }
  function insert(c) {
    const ix0 = Math.floor(c.min.x / CELL), ix1 = Math.floor(c.max.x / CELL);
    const iz0 = Math.floor(c.min.z / CELL), iz1 = Math.floor(c.max.z / CELL);
    for (let ix = ix0; ix <= ix1; ix++) for (let iz = iz0; iz <= iz1; iz++) {
      const k = cellKey(ix, iz); let l = grid.get(k); if (!l) grid.set(k, l = []); l.push(c);
    }
    colliders.push(c);
  }
  function boxCol(c, h, q, occ, dyn) {
    const ax = new V3(1, 0, 0).applyQuaternion(q), ay = new V3(0, 1, 0).applyQuaternion(q), az = new V3(0, 0, 1).applyQuaternion(q);
    const col = { t: 0, c: c.clone(), h: h.clone(), ax, ay, az, occ: !!occ, s: 0 };
    if (dyn) { col.v = new V3(); dynamic.push(col); return col; }
    const e = new V3(
      Math.abs(ax.x) * h.x + Math.abs(ay.x) * h.y + Math.abs(az.x) * h.z,
      Math.abs(ax.y) * h.x + Math.abs(ay.y) * h.y + Math.abs(az.y) * h.z,
      Math.abs(ax.z) * h.x + Math.abs(ay.z) * h.y + Math.abs(az.z) * h.z);
    col.min = c.clone().sub(e); col.max = c.clone().add(e);
    insert(col);
    if (occ) occluders.push(col);
    return col;
  }
  function cylCol(x, z, r0, r1, y0, y1) {
    const r = Math.max(r0, r1);
    insert({ t: 1, x, z, r0, r1, y0, y1, min: new V3(x - r, y0, z - r), max: new V3(x + r, y1, z + r), s: 0 });
  }
  function capCol(a, b, r) {
    insert({ t: 2, a: a.clone(), b: b.clone(), r, min: new V3(Math.min(a.x, b.x) - r, Math.min(a.y, b.y) - r, Math.min(a.z, b.z) - r), max: new V3(Math.max(a.x, b.x) + r, Math.max(a.y, b.y) + r, Math.max(a.z, b.z) + r), s: 0 });
  }
  function sphCol(c, r) { insert({ t: 3, c: c.clone(), r, min: new V3(c.x - r, c.y - r, c.z - r), max: new V3(c.x + r, c.y + r, c.z + r), s: 0 }); }

  const pool = []; for (let i = 0; i < 24; i++) pool.push({ n: new V3(), d: 0, v: null });
  const _d = new V3(), _l = new V3(), _cl = new V3(), _ab = new V3();

  function testBox(col, p, r, out) {
    _d.copy(p).sub(col.c);
    const lx = _d.dot(col.ax), ly = _d.dot(col.ay), lz = _d.dot(col.az), h = col.h;
    if (Math.abs(lx) > h.x + r || Math.abs(ly) > h.y + r || Math.abs(lz) > h.z + r) return;
    const cx = Math.max(-h.x, Math.min(h.x, lx)), cy = Math.max(-h.y, Math.min(h.y, ly)), cz = Math.max(-h.z, Math.min(h.z, lz));
    let dx = lx - cx, dy = ly - cy, dz = lz - cz;
    const d2 = dx * dx + dy * dy + dz * dz;
    if (d2 > r * r) return;
    let depth;
    if (d2 > 1e-10) { const d = Math.sqrt(d2); dx /= d; dy /= d; dz /= d; depth = r - d; }
    else {
      const px = h.x - Math.abs(lx), py = h.y - Math.abs(ly), pz = h.z - Math.abs(lz);
      dx = dy = dz = 0;
      if (px < py && px < pz) { dx = Math.sign(lx) || 1; depth = px + r; }
      else if (py < pz) { dy = Math.sign(ly) || 1; depth = py + r; }
      else { dz = Math.sign(lz) || 1; depth = pz + r; }
    }
    push(out, _l.set(0, 0, 0).addScaledVector(col.ax, dx).addScaledVector(col.ay, dy).addScaledVector(col.az, dz), depth, col.v || null, col, p);
  }
  function testCyl(col, p, r, out) {
    if (p.y < col.y0 - r || p.y > col.y1 + r) return;
    const yc = Math.max(col.y0, Math.min(col.y1, p.y));
    const rad = col.r0 + (col.r1 - col.r0) * (yc - col.y0) / (col.y1 - col.y0);
    const dx = p.x - col.x, dz = p.z - col.z, dist = Math.sqrt(dx * dx + dz * dz);
    const k = dist > 1e-6 ? Math.min(dist, rad) / dist : 0;
    _cl.set(col.x + dx * k, yc, col.z + dz * k);
    _d.copy(p).sub(_cl);
    const dl = _d.length();
    if (dl > r) return;
    if (dl > 1e-6) push(out, _d.multiplyScalar(1 / dl), r - dl, null);
    else if (dist > 1e-6) push(out, _l.set(dx / dist, 0, dz / dist), rad - dist + r, null);
    else push(out, _l.set(0, 1, 0), r, null);
  }
  function testCap(col, p, r, out) {
    _ab.copy(col.b).sub(col.a);
    const t = Math.max(0, Math.min(1, _d.copy(p).sub(col.a).dot(_ab) / _ab.lengthSq()));
    _cl.copy(col.a).addScaledVector(_ab, t);
    _d.copy(p).sub(_cl);
    const dl = _d.length(), rs = r + col.r;
    if (dl > rs || dl < 1e-6) return;
    push(out, _d.multiplyScalar(1 / dl), rs - dl, null);
  }
  function testSph(col, p, r, out) {
    _d.copy(p).sub(col.c);
    const dl = _d.length(), rs = r + col.r;
    if (dl > rs || dl < 1e-6) return;
    push(out, _d.multiplyScalar(1 / dl), rs - dl, null);
  }
  const _vel = new V3();
  function push(out, n, d, v, col, p) {
    if (out.length >= pool.length) return;
    const c = pool[out.length];
    c.n.copy(n); c.d = d;
    if (v && col) {
      // vitesse du point de contact (translation + rotation de l'objet)
      _vel.copy(v);
      if (col.w) { _d.copy(p).sub(col.pivot); _vel.add(_ab.crossVectors(col.w, _d)); }
      c.v = c.vv || (c.vv = new V3()); c.v.copy(_vel);
    } else c.v = null;
    out.push(c);
  }

  function collide(p, r, out) {
    out.length = 0; stamp++;
    const ix0 = Math.floor((p.x - r) / CELL), ix1 = Math.floor((p.x + r) / CELL);
    const iz0 = Math.floor((p.z - r) / CELL), iz1 = Math.floor((p.z + r) / CELL);
    for (let ix = ix0; ix <= ix1; ix++) for (let iz = iz0; iz <= iz1; iz++) {
      const l = grid.get(cellKey(ix, iz)); if (!l) continue;
      for (const c of l) {
        if (c.s === stamp) continue; c.s = stamp;
        if (p.y < c.min.y - r || p.y > c.max.y + r) continue;
        if (c.t === 0) testBox(c, p, r, out); else if (c.t === 1) testCyl(c, p, r, out); else if (c.t === 2) testCap(c, p, r, out); else testSph(c, p, r, out);
      }
    }
    for (const c of dynamic) if (c.active !== false) testBox(c, p, r, out);
    // sol
    const h = heightAt(p.x, p.z);
    if (p.y - r < h) {
      const e = 0.5, hx = heightAt(p.x + e, p.z) - heightAt(p.x - e, p.z), hz = heightAt(p.x, p.z + e) - heightAt(p.x, p.z - e);
      _l.set(-hx, 2 * e, -hz).normalize();
      push(out, _l, (h - (p.y - r)) * _l.y, null);
    }
    return out;
  }

  // Combien de murs entre deux points (perte de signal vidéo)
  function segBox(a, b, col) {
    _d.copy(a).sub(col.c); _ab.copy(b).sub(a);
    let t0 = 0, t1 = 1;
    const axes = [col.ax, col.ay, col.az], hs = [col.h.x, col.h.y, col.h.z];
    for (let i = 0; i < 3; i++) {
      const o = _d.dot(axes[i]), dir = _ab.dot(axes[i]), h = hs[i];
      if (Math.abs(dir) < 1e-9) { if (Math.abs(o) > h) return false; continue; }
      let ta = (-h - o) / dir, tb = (h - o) / dir;
      if (ta > tb) { const t = ta; ta = tb; tb = t; }
      t0 = Math.max(t0, ta); t1 = Math.min(t1, tb);
      if (t0 > t1) return false;
    }
    return true;
  }
  const _sa = new V3(), _sb = new V3();
  function occlusion(a, b) {
    let n = 0;
    const minx = Math.min(a.x, b.x), maxx = Math.max(a.x, b.x), minz = Math.min(a.z, b.z), maxz = Math.max(a.z, b.z);
    for (const c of occluders) {
      if (c.max.x < minx || c.min.x > maxx || c.max.z < minz || c.min.z > maxz) continue;
      if (segBox(a, b, c)) { n++; if (n >= 6) break; }
    }
    // relief
    for (let i = 1; i < 16; i++) {
      _sa.lerpVectors(a, b, i / 16);
      if (_sa.y < heightAt(_sa.x, _sa.z) - 0.5) { n += 2; break; }
    }
    return n;
  }

  // ── Aides de construction ──
  const UBOX = new THREE.BoxGeometry(1, 1, 1).toNonIndexed();
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new V3(), _s = new V3(), _e = new THREE.Euler();
  function quatOf(rot) {
    if (rot instanceof THREE.Quaternion) return _q.copy(rot);
    if (typeof rot === 'number') return _q.setFromEuler(_e.set(0, rot, 0));
    if (rot) return _q.setFromEuler(_e.set(rot[0] || 0, rot[1] || 0, rot[2] || 0, 'YXZ'));
    return _q.identity();
  }
  // Boîte (fusionnée dans un lot) + collider ; col: false pour décor sans collision
  function box(batch, w, h, d, x, y, z, rot, opt = {}) {
    const q = quatOf(rot).clone();
    _m.compose(_p.set(x, y, z), q, _s.set(w, h, d));
    if (batch) batch.add(UBOX, _m);
    if (opt.col !== false) boxCol(new V3(x, y, z), new V3(w / 2, h / 2, d / 2), q, opt.occ);
  }
  function addGeo(batch, geo, x, y, z, rot, sc) {
    _m.compose(_p.set(x, y, z), quatOf(rot), sc ? _s.copy(sc) : _s.set(1, 1, 1));
    batch.add(geo, _m);
  }
  // Barre (cylindre fin) entre deux points
  const CYL = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true).toNonIndexed();
  function rod(batch, a, b, r, col = true) {
    const d = new V3().subVectors(b, a), len = d.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new V3(0, 1, 0), d.clone().normalize());
    _m.compose(_p.addVectors(a, b).multiplyScalar(0.5), q, _s.set(r, len, r));
    batch.add(CYL, _m);
    if (col) capCol(a, b, r);
  }
  // Mur percé d'ouvertures [u0,u1,v0,v1] (u le long du mur, v en hauteur)
  function wall(batch, axis, a0, a1, fixed, y0, y1, th, holes = [], occ = true) {
    const us = [a0, a1];
    holes.forEach(h => { us.push(Math.max(a0, Math.min(a1, h[0])), Math.max(a0, Math.min(a1, h[1]))); });
    us.sort((a, b) => a - b);
    for (let i = 0; i < us.length - 1; i++) {
      const ua = us[i], ub = us[i + 1];
      if (ub - ua < 0.01) continue;
      const mid = (ua + ub) / 2;
      const cov = holes.filter(h => h[0] < mid && h[1] > mid).sort((a, b) => a[2] - b[2]);
      let cur = y0;
      const seg = (ya, yb) => {
        if (axis === 'x') box(batch, ub - ua, yb - ya, th, mid, (ya + yb) / 2, fixed, 0, { occ });
        else box(batch, th, yb - ya, ub - ua, fixed, (ya + yb) / 2, mid, 0, { occ });
      };
      for (const h of cov) { if (h[2] > cur + 0.01) seg(cur, h[2]); cur = Math.max(cur, h[3]); }
      if (y1 > cur + 0.01) seg(cur, y1);
    }
  }
  // Dalle percée de trémies [x0,x1,z0,z1]
  function slab(batch, x0, x1, z0, z1, y, th, holes = []) {
    const xs = [x0, x1];
    holes.forEach(h => xs.push(h[0], h[1]));
    xs.sort((a, b) => a - b);
    for (let i = 0; i < xs.length - 1; i++) {
      const xa = xs[i], xb = xs[i + 1]; if (xb - xa < 0.01) continue;
      const mid = (xa + xb) / 2;
      const cov = holes.filter(h => h[0] < mid && h[1] > mid).sort((a, b) => a[2] - b[2]);
      let cur = z0;
      const seg = (za, zb) => box(batch, xb - xa, th, zb - za, mid, y, (za + zb) / 2, 0, { occ: true });
      for (const h of cov) { if (h[2] > cur + 0.01) seg(cur, h[2]); cur = Math.max(cur, h[3]); }
      if (z1 > cur + 0.01) seg(cur, z1);
    }
  }
  // Prisme extrudé le long de z (talus, buttes)
  function prism(batch, pts, z0, z1) {
    const sh = new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], p[1])));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false });
    addGeo(batch, geo, 0, 0, z0);
    // collisions : une boîte sous chaque pente
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
      if (len < 0.5) continue;
      const nx = dy / len, ny = -dx / len; // normale extérieure (contour anti-horaire)
      if (ny < 0.05 && Math.abs(nx) < 0.99) continue;
      const th = 0.8, cx = (a[0] + b[0]) / 2 - nx * th / 2, cy = (a[1] + b[1]) / 2 - ny * th / 2;
      box(null, len, th, z1 - z0, cx, cy, (z0 + z1) / 2, [0, 0, Math.atan2(dy, dx)], { occ: true });
    }
  }

  // ═══════════ Lumières & ciel ═══════════
  const sunDir = new V3(-0.45, 0.78, 0.42).normalize();
  const hemi = new THREE.HemisphereLight(0xc4dcff, 0x5d5444, 0.62);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, 0.95);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera; sc.left = -50; sc.right = 50; sc.top = 50; sc.bottom = -50; sc.near = 1; sc.far = 300;
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03;
  sun.shadow.camera.layers.enable(1);
  scene.add(sun, sun.target);
  const FOG = 0xc9d8e6;
  scene.fog = new THREE.Fog(FOG, 180, 950);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1500, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { sun: { value: sunDir } },
    vertexShader: 'varying vec3 vW; void main(){ vW = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `varying vec3 vW; uniform vec3 sun;
      void main(){ float y = vW.y; vec3 hor = vec3(.79,.85,.9); vec3 top = vec3(.33,.55,.85); vec3 gr = vec3(.55,.6,.62);
        vec3 c = y > 0. ? mix(hor, top, pow(clamp(y,0.,1.), .55)) : mix(hor, gr, clamp(-y*6.,0.,1.));
        float s = max(dot(normalize(vW), sun), 0.); c += vec3(1.,.9,.7) * (pow(s, 900.)*2. + pow(s, 12.)*.18);
        gl_FragColor = vec4(c,1.); }`,
  }));
  sky.renderOrder = -1; sky.frustumCulled = false;
  scene.add(sky);
  // nuages : quelques plaques semi-transparentes
  const cloudTex = canvasTex(256, (g, s) => {
    for (let i = 0; i < 40; i++) { const x = rr(50, 206), y = rr(90, 166), r = rr(20, 50); const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, s, s); }
  }, false);
  const cloudMat = new THREE.SpriteMaterial({ map: cloudTex, transparent: true, depthWrite: false, fog: false, opacity: 0.8 });
  const clouds = new THREE.Group();
  for (let i = 0; i < 22; i++) {
    const c = new THREE.Sprite(cloudMat);
    const a = rnd() * Math.PI * 2, d = rr(700, 1100);
    c.position.set(Math.cos(a) * d, rr(220, 420), Math.sin(a) * d);
    const w = rr(260, 520); c.scale.set(w, w * rr(0.3, 0.45), 1);
    clouds.add(c);
  }
  scene.add(clouds);

  // ═══════════ Terrain ═══════════
  {
    const S = 1600, N = 200;
    const geo = new THREE.PlaneGeometry(S, S, N, N);
    geo.rotateX(-Math.PI / 2);
    geo.translate(25, 0, -55);
    const pos = geo.attributes.position, col = [];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), h = heightAt(x, z);
      pos.setY(i, h);
      const n = fbm(x * 0.02, z * 0.02), dry = vnoise(x * 0.006 + 40, z * 0.006);
      let r = 0.82 + n * 0.35, g = 0.85 + n * 0.3, b = 0.78 + n * 0.25;
      if (dry > 0.6) { const k = (dry - 0.6) * 1.6; r += k * 0.35; g += k * 0.15; }
      if (h > 30) { const k = Math.min(1, (h - 30) / 60); r = r * (1 - k) + 0.95 * k; g = g * (1 - k) + 0.9 * k; b = b * (1 - k) + 0.85 * k; }
      col.push(r, g, b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.computeVertexNormals();
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * S / 5, uv.getY(i) * S / 5);
    const t = new THREE.Mesh(geo, M.terrain);
    t.receiveShadow = true;
    scene.add(t);
  }

  // ═══════════ Zone de départ ═══════════
  const pilots = { free: new V3(5, 1.65, 27), track: new V3(140, 1.65, 113) };
  function launchArea(x, z) {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 1.4), M.pad);
    pad.position.set(x, 0.02, z); pad.receiveShadow = true; scene.add(pad);
    // tente du pilote
    const tx = x + 7, tz = z + 8;
    for (const [dx, dz] of [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]]) box(B.steel, 0.06, 2.4, 0.06, tx + dx, 1.2, tz + dz);
    box(B.tent, 3.3, 0.12, 3.3, tx, 2.45, tz);
    addGeo(B.tent, new THREE.ConeGeometry(2.4, 0.7, 4, 1, true), tx, 2.85, tz, Math.PI / 4);
    box(B.white, 1.6, 0.05, 0.7, tx, 0.75, tz - 0.6);
    box(B.steel, 0.05, 0.75, 0.05, tx - 0.7, 0.37, tz - 0.6, 0, { col: false });
    box(B.steel, 0.05, 0.75, 0.05, tx + 0.7, 0.37, tz - 0.6, 0, { col: false });
    // caisses / batteries
    box(B.gateDark, 0.6, 0.35, 0.4, tx + 0.4, 0.95, tz - 0.6, 0.2, { col: false });
    box(B.red, 0.5, 0.5, 0.5, tx - 1.0, 0.25, tz + 0.8);
  }
  launchArea(0, 20);
  launchArea(132, 105);

  // Manche à air (indique le vent)
  const windsock = new THREE.Group();
  {
    box(B.steel, 0.08, 5, 0.08, -5, 2.5, 30);
    const sockGeo = new THREE.CylinderGeometry(0.15, 0.35, 1.8, 10, 4, true);
    sockGeo.rotateX(Math.PI / 2); sockGeo.translate(0, 0, -0.9);
    const tex = canvasTex(64, (g, s) => { for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? '#fff' : '#ff5a1f'; g.fillRect(0, i * s / 5, s, s / 5); } }, false);
    tex.rotation = Math.PI / 2;
    const sock = new THREE.Mesh(sockGeo, new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }));
    sock.castShadow = true;
    windsock.add(sock);
    windsock.position.set(-5, 4.9, 30);
    scene.add(windsock);
  }

  // ═══════════ Portes ═══════════
  const passMat = () => new THREE.MeshBasicMaterial({ color: 0x52ff9a, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  function gateObj(c, yaw, w, h, name) {
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), passMat());
    plane.position.copy(c); plane.rotation.y = yaw; plane.visible = false;
    scene.add(plane);
    const g = { c: c.clone(), yaw, w, h, name, plane, dir: new V3(-Math.sin(yaw), 0, -Math.cos(yaw)), right: new V3(Math.cos(yaw), 0, -Math.sin(yaw)) };
    gates.push(g);
    return g;
  }
  // Porte à cadre type MultiGP (ouverture w×h, bas de l'ouverture à 0.3 m)
  function frameGate(x, baseY, z, yaw, w, h, name, batchStripe = B.gate) {
    const t = 0.2, q = quatOf(yaw).clone();
    const loc = (lx, ly) => new V3(lx, ly, 0).applyQuaternion(q).add(new V3(x, baseY, z));
    const parts = [
      [t, h + 0.3 + t, t, -(w / 2 + t / 2), (h + 0.3 + t) / 2],
      [t, h + 0.3 + t, t, (w / 2 + t / 2), (h + 0.3 + t) / 2],
      [w + 2 * t, t, t, 0, h + 0.3 + t / 2],
      [w, t * 0.8, t, 0, 0.3 - t * 0.4],
    ];
    for (const p of parts) { const c = loc(p[3], p[4]); box(batchStripe, p[0], p[1], p[2], c.x, c.y, c.z, q); }
    for (const s of [-1, 1]) { const c = loc(s * (w / 2 + t / 2), 0.04); box(B.gateDark, 0.3, 0.08, 0.9, c.x, c.y, c.z, q, { col: false }); }
    return name ? gateObj(loc(0, 0.3 + h / 2), yaw, w, h, name) : null;
  }
  // Arche gonflable (demi-tore)
  function arch(x, z, yaw, R, tube, name) {
    const geo = new THREE.TorusGeometry(R, tube, 8, 28, Math.PI);
    addGeo(B.red, geo, x, 0, z, yaw);
    const q = quatOf(yaw).clone();
    for (let a = 0; a <= Math.PI + 0.01; a += 0.12) sphCol(new V3(Math.cos(a) * R, Math.sin(a) * R, 0).applyQuaternion(q).add(new V3(x, 0, z)), tube);
    return name ? gateObj(new V3(x, R * 0.5, z), yaw, R * 1.6, R * 0.95, name) : null;
  }
  // Fanion de slalom
  function flag(x, z, color) {
    box(B.steel, 0.05, 3.2, 0.05, x, 1.6, z);
    const geo = new THREE.PlaneGeometry(0.7, 2.2);
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }));
    m.position.set(x + 0.37, 2.0, z); m.rotation.y = rnd() * 0.6; m.castShadow = true;
    scene.add(m);
  }

  // ═══════════ Bando (bâtiment abandonné) ═══════════
  function bando() {
    const X0 = -105, X1 = -75, Z0 = -50, Z1 = -30, th = 0.3, top = 12.3;
    const C = B.concrete;
    slab(C, X0, X1, Z0, Z1, 0.1, 0.2);
    slab(C, X0, X1, Z0, Z1, 4, 0.3, [[-93, -87, -43, -37], [-80, -77, -35, -32]]);
    slab(C, X0, X1, Z0, Z1, 8, 0.3, [[-101, -97, -47, -43], [-86, -79, -40, -33]]);
    slab(C, X0, X1, Z0, Z1, 12.15, 0.3, [[-101, -97, -47, -43]]);
    wall(C, 'x', X0 - th / 2, X1 + th / 2, Z0, 0, top, th, [
      [-102, -99, 1, 2.6], [-96.5, -94.5, 0, 2.8], [-82, -78, 1, 2.6],
      [-92.25, -87.75, 4.8, 7.3], [-101, -98, 5, 6.6], [-81, -78, 5, 6.6],
      [-100, -96, 9, 10.6], [-91, -89, 9, 10.6], [-83, -79, 9, 10.6]]);
    wall(C, 'x', X0 - th / 2, X1 + th / 2, Z1, 0, top, th, [
      [-93, -87, 0, 3.2], [-102, -99, 1, 2.6], [-80, -77, 1, 2.6],
      [-101, -97, 5, 6.6], [-92, -88, 5, 6.6], [-82, -78, 5, 6.6],
      [-101, -97, 9, 10.6], [-92, -88, 9, 10.6], [-82, -78, 9, 10.6]]);
    wall(C, 'z', Z0 + th / 2, Z1 - th / 2, X0, 0, top, th, [[-45, -41, 0.8, 2.6], [-38, -35, 0, 3], [-46, -43, 5, 6.6], [-37, -34, 5, 6.6], [-44, -36, 9, 10.8]]);
    wall(C, 'z', Z0 + th / 2, Z1 - th / 2, X1, 0, top, th, [[-47, -43, 1, 2.6], [-37, -33, 1, 2.6], [-42, -38, 5, 7], [-47, -44, 9, 10.6], [-36, -33, 9, 10.6]]);
    // cloison intérieure partielle à l'étage
    wall(B.concreteDark, 'z', -46, -36, -82, 4.15, 7.85, 0.2, [[-43, -40, 4.15, 6.4]]);
    // poteaux
    for (const px of [-101, -94, -86, -79]) for (const pz of [-46, -40, -34]) box(B.concreteDark, 0.5, top, 0.5, px, top / 2, pz, 0, { occ: true });
    // acrotère sur le toit
    wall(C, 'x', X0, X1, Z0 + 0.1, 12.3, 13.1, 0.2, [[-93, -88, 12.3, 13.1]]);
    wall(C, 'x', X0, X1, Z1 - 0.1, 12.3, 13.1, 0.2);
    // gravats
    for (let i = 0; i < 26; i++) {
      const fl = [0.2, 4.15, 8.15][i % 3];
      const x = rr(X0 + 1, X1 - 1), z = rr(Z0 + 1, Z1 - 1);
      if (Math.abs(x + 90) < 4) continue;
      const s = rr(0.3, 1.1);
      box(B.rock, s, s * 0.6, s * rr(0.6, 1.4), x, fl + s * 0.3, z, rnd() * 3);
    }
    // tags
    const tags = [[-95, 2, Z1 - 0.17, 0], [-84, 6, Z0 + 0.17, Math.PI], [-104.8, 2, -44, Math.PI / 2], [-75.2, 10, -40, -Math.PI / 2], [-98, 1.8, Z0 - 0.17, Math.PI], [-80, 6, Z1 + 0.17, 0], [-90, 10.5, Z0 - 0.17, Math.PI], [-75.17, 2, -46, Math.PI / 2]];
    tags.forEach(([x, y, z, ry]) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(rr(3, 5), rr(1.4, 2.2)), new THREE.MeshLambertMaterial({ map: graffiti(), transparent: true, alphaTest: 0.05 }));
      m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true;
      scene.add(m);
    });
  }
  function graffiti() {
    return canvasTex(256, (g, s) => {
      const hue = rnd() * 360;
      g.lineCap = 'round'; g.lineJoin = 'round';
      const pts = []; let x = 30, y = 70;
      for (let i = 0; i < 9; i++) { pts.push([x, y]); x += rr(15, 28); y = rr(40, 110); }
      const path = () => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.quadraticCurveTo(pts[i - 1][0] + 20, pts[i - 1][1] - 30, pts[i][0], pts[i][1]); };
      g.strokeStyle = '#111'; g.lineWidth = 34; path(); g.stroke();
      g.strokeStyle = `hsl(${hue},85%,55%)`; g.lineWidth = 24; path(); g.stroke();
      g.strokeStyle = `hsl(${(hue + 60) % 360},90%,70%)`; g.lineWidth = 6; path(); g.stroke();
      for (let i = 0; i < 30; i++) { g.fillStyle = `hsla(${hue},80%,50%,.5)`; g.fillRect(rr(20, 236), rr(100, 128), 2, rr(4, 18)); }
    }, false);
  }

  // ═══════════ Tunnel en S (section octogonale) ═══════════
  const tunnelCurve = new THREE.CatmullRomCurve3([
    new V3(80, 2.6, -50), new V3(84, 2.6, -70), new V3(93, 2.6, -90), new V3(81, 2.6, -110), new V3(78, 2.6, -132)]);
  function tubeTunnel(curve, R, sides) {
    const len = curve.getLength(), n = Math.ceil(len / 2.2), th = 0.35;
    const width = 2 * (R + th) * Math.tan(Math.PI / sides) + 0.02;
    const UP = new V3(0, 1, 0);
    for (let i = 0; i < n; i++) {
      const p0 = curve.getPointAt(i / n), p1 = curve.getPointAt((i + 1) / n);
      const mid = p0.clone().add(p1).multiplyScalar(0.5);
      const T = p1.clone().sub(p0); const sl = T.length(); T.normalize();
      const X = new V3().crossVectors(UP, T).normalize(), Y = new V3().crossVectors(T, X);
      for (let k = 0; k < sides; k++) {
        const a = (k + 0.5) / sides * Math.PI * 2 - Math.PI / 2;
        const rd = X.clone().multiplyScalar(Math.cos(a)).addScaledVector(Y, Math.sin(a));
        const tr = X.clone().multiplyScalar(Math.sin(a)).addScaledVector(Y, -Math.cos(a));
        const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(tr, rd, T));
        const c = mid.clone().addScaledVector(rd, R + th / 2);
        box(B.concrete, width, th, sl + 0.4, c.x, c.y, c.z, q, { occ: true });
      }
      if (i % 3 === 1) {
        const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, T));
        const c = mid.clone().addScaledVector(Y, R - 0.04);
        box(B.light, 0.5, 0.06, 1.4, c.x, c.y, c.z, q, { col: false });
      }
    }
    // anneaux d'entrée
    for (const u of [0, 1]) {
      const p = curve.getPointAt(u), T = curve.getTangentAt(u);
      const X = new V3().crossVectors(UP, T).normalize(), Y = new V3().crossVectors(T, X);
      for (let k = 0; k < sides; k++) {
        const a = (k + 0.5) / sides * Math.PI * 2 - Math.PI / 2;
        const rd = X.clone().multiplyScalar(Math.cos(a)).addScaledVector(Y, Math.sin(a));
        const tr = X.clone().multiplyScalar(Math.sin(a)).addScaledVector(Y, -Math.cos(a));
        const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(tr, rd, T));
        const c = p.clone().addScaledVector(rd, R + th + 0.25);
        box(B.gate, width + 0.4, 0.5, 0.5, c.x, c.y, c.z, q, { col: true });
      }
    }
  }

  // ═══════════ Dalot triple sous une butte ═══════════
  function culvert() {
    const z0 = -87, z1 = -73;
    for (const x of [126.25, 128.75, 131.25, 133.75]) box(B.concreteDark, 0.5, 2, z1 - z0, x, 1, (z0 + z1) / 2, 0, { occ: true });
    box(B.concreteDark, 8, 0.6, z1 - z0, 130, 2.3, (z0 + z1) / 2, 0, { occ: true });
    for (let i = 0; i < 3; i++) box(B.light, 0.3, 0.05, 1.2, 127.5 + i * 2.5, 1.97, -80, 0, { col: false });
    prism(B.dirt, [[121, 0], [126, 0], [126, 2.6], [134, 2.6], [134, 0], [139, 0], [131.5, 5], [128.5, 5]], z0, z1);
  }

  // ═══════════ Tunnel coudé rectangulaire ═══════════
  function bentTunnel() {
    const C = B.concreteDark, H = 4;
    wall(C, 'z', -122.9, -80, -152.7, 0, H, 0.4);
    wall(C, 'z', -117.5, -80, -147.3, 0, H, 0.4);
    wall(C, 'x', -152.9, -110, -122.7, 0, H, 0.4);
    wall(C, 'x', -147.1, -110, -117.3, 0, H, 0.4);
    box(B.concrete, 5.8, 0.4, 42.9, -150, H + 0.2, -101.45, 0, { occ: true });
    box(B.concrete, 37.1, 0.4, 5.8, -128.55, H + 0.2, -120, 0, { occ: true });
    for (let z = -84; z > -118; z -= 6) box(B.light, 0.5, 0.05, 1.4, -150, H - 0.03, z, 0, { col: false });
    for (let x = -146; x < -112; x += 6) box(B.light, 1.4, 0.05, 0.5, x, H - 0.03, -120, 0, { col: false });
    // butte d'herbe sur le dessus pour l'esthétique
    box(B.dirt, 7, 0.5, 44, -150, H + 0.65, -101, 0, { col: false });
  }

  // ═══════════ Conteneurs ═══════════
  function containers() {
    const L = 12.2, H = 2.6, W = 2.44;
    const c = (bi, x, y, z, yaw) => {
      box(B.cont[bi], yaw ? W : L, H, yaw ? L : W, x, y + H / 2, z, 0, { occ: true });
    };
    c(0, -35, 0, -147.28); c(1, -35, 0, -152.72);
    c(2, -35, H, -150, true);
    c(4, -48, 0, -145); c(0, -48, H, -145); c(2, -22, 0, -158);
    c(1, -53, 0, -158, true);
  }

  // ═══════════ Tour de dive (échafaudage) ═══════════
  function diveTower(x, z, H) {
    const S = 2.9;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(B.metal, 0.14, H, 0.14, x + sx * S, H / 2, z + sz * S);
    for (let y = 2.5; y < H; y += 2.5) {
      for (const s of [-1, 1]) {
        box(B.metal, S * 2, 0.08, 0.08, x, y, z + s * S);
        box(B.metal, 0.08, 0.08, S * 2, x + s * S, y, z);
      }
      // diagonales
      const dl = Math.hypot(S * 2, 2.5), ang = Math.atan2(2.5, S * 2);
      box(B.metal, dl, 0.06, 0.06, x, y - 1.25, z - S, [0, 0, (y / 2.5) % 2 ? ang : -ang]);
      box(B.metal, dl, 0.06, 0.06, x, y - 1.25, z + S, [0, 0, (y / 2.5) % 2 ? -ang : ang]);
      box(B.metal, 0.06, 0.06, dl, x - S, y - 1.25, z, [(y / 2.5) % 2 ? ang : -ang, 0, 0]);
      box(B.metal, 0.06, 0.06, dl, x + S, y - 1.25, z, [(y / 2.5) % 2 ? -ang : ang, 0, 0]);
    }
    box(B.wood, S * 2 + 0.4, 0.25, S * 2 + 0.4, x, H, z);
  }

  // ═══════════ Ligne haute tension ═══════════
  function powerLine() {
    const xs = [-100, -60, -20, 20, 60], z = -95, Hs = 16;
    for (const x of xs) {
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) rod(B.steel, new V3(x + sx * 1.7, 0, z + sz * 1.7), new V3(x + sx * 0.45, Hs, z + sz * 0.45), 0.09);
      for (let y = 2; y < Hs; y += 2.8) {
        const k = 1.7 - (1.25 * y / Hs);
        for (const s of [-1, 1]) { box(B.steel, k * 2, 0.07, 0.07, x, y, z + s * k); box(B.steel, 0.07, 0.07, k * 2, x + s * k, y, z); }
      }
      box(B.steel, 0.4, 0.35, 9.6, x, 14.2, z);
      box(B.steel, 0.3, 0.3, 4, x, Hs + 0.2, z);
      for (const s of [-4.4, 4.4]) rod(B.white, new V3(x, 14, z + s), new V3(x, 13.4, z + s), 0.08, false);
    }
    for (let i = 0; i < xs.length - 1; i++) {
      for (const [dz, y0] of [[-4.4, 13.4], [4.4, 13.4], [0, Hs + 0.3]]) {
        const N = 10, sag = 1.6;
        let prev = new V3(xs[i], y0, z + dz);
        for (let k = 1; k <= N; k++) {
          const t = k / N, p = new V3(xs[i] + (xs[i + 1] - xs[i]) * t, y0 - sag * 4 * t * (1 - t), z + dz);
          rod(B.cable, prev, p, 0.025);
          prev = p;
        }
      }
    }
  }

  // ═══════════ Éolienne (pales mobiles) ═══════════
  const mill = { group: new THREE.Group(), hub: new V3(-10, 18.5, -187.6), w: 0.55, angle: 0, cols: [] };
  function windmill() {
    const x = -10, z = -190;
    addGeo(B.white, new THREE.CylinderGeometry(0.7, 1.3, 18, 14), x, 9, z);
    cylCol(x, z, 1.3, 0.7, 0, 18);
    box(B.white, 1.7, 1.7, 3.6, x, 18.6, z + 0.4);
    const bladeMat = new THREE.MeshLambertMaterial({ color: 0xf4f4f4 });
    const hub = new THREE.Mesh(new THREE.SphereGeometry(0.75, 12, 8), bladeMat);
    hub.scale.z = 1.4; mill.group.add(hub);
    for (let i = 0; i < 3; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, 9.8, 0.22), bladeMat);
      const pv = new THREE.Group(); pv.rotation.z = i * Math.PI * 2 / 3;
      b.position.y = 5.5; b.castShadow = true; pv.add(b); mill.group.add(pv);
      const tip = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.2, 0.24), M.red); tip.position.y = 9.8; pv.add(tip);
      const col = boxCol(new V3(), new V3(0.45, 4.9, 0.2), new THREE.Quaternion(), false, true);
      col.w = new V3(0, 0, mill.w); col.pivot = mill.hub;
      mill.cols.push(col);
    }
    mill.group.position.copy(mill.hub);
    scene.add(mill.group);
  }

  // ═══════════ Végétation ═══════════
  const trees = { pine: [], round: [] };
  const EXCL = [
    [-60, 60, -65, 55], [62, 108, -142, -40], [115, 146, -96, -64], [-118, -62, -62, -18], [-162, -100, -132, -72],
    [-60, 55, -170, -128], [-28, 8, -202, -176], [45, 228, -2, 170], [-115, 72, -101, -89], [-102, -18, -32, 45], [-100, -78, -155, -50],
  ];
  const excluded = (x, z, m = 0) => EXCL.some(r => x > r[0] - m && x < r[1] + m && z > r[2] - m && z < r[3] + m);
  function plantTrees() {
    const placed = [];
    const ok = (x, z, d) => placed.every(p => (p[0] - x) ** 2 + (p[1] - z) ** 2 > d * d);
    // forêt dense au nord, avec un couloir
    for (let i = 0; i < 1400 && placed.length < 300; i++) {
      const x = rr(-160, 160), z = rr(-280, -206);
      if (Math.abs(x - 5) < 5 && z > -262) continue; // allée
      if (!ok(x, z, 4.6)) continue;
      placed.push([x, z]); trees[rnd() < 0.7 ? 'pine' : 'round'].push([x, z, rr(0.75, 1.35)]);
    }
    // arbres épars
    for (let i = 0; i < 2000 && placed.length < 520; i++) {
      const x = rr(-205, 255), z = rr(-205, 180);
      if (excluded(x, z, 3) || !ok(x, z, 7)) continue;
      placed.push([x, z]); trees[rnd() < 0.45 ? 'pine' : 'round'].push([x, z, rr(0.7, 1.3)]);
    }
    // haies d'arbres en bordure
    for (let x = -200; x < 250; x += rr(6, 11)) for (const z of [-292, 176]) { if (ok(x, z, 4)) { placed.push([x, z]); trees.pine.push([x, z + rr(-3, 3), rr(0.9, 1.4)]); } }

    const trunkGeo = new THREE.CylinderGeometry(0.16, 0.3, 1, 6); trunkGeo.translate(0, 0.5, 0);
    const pineGeo = (() => {
      const parts = [[2.2, 4.2, 0.36], [1.75, 3.6, 0.56], [1.2, 3.0, 0.76]].map(([r, h, y]) => { const g = new THREE.ConeGeometry(r, h, 8); g.translate(0, y * 10 + h / 2 - 1.2, 0); return g.toNonIndexed(); });
      return mergeGeos(parts);
    })();
    const roundGeo = new THREE.IcosahedronGeometry(2.6, 1); roundGeo.translate(0, 6.6, 0);
    const all = trees.pine.length + trees.round.length;
    const trunks = new THREE.InstancedMesh(trunkGeo, M.trunk, all);
    const pines = new THREE.InstancedMesh(pineGeo, M.leaf, trees.pine.length);
    const rounds = new THREE.InstancedMesh(roundGeo, M.leaf, trees.round.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
    let ti = 0;
    trees.pine.forEach(([x, z, s], i) => {
      q.setFromAxisAngle(new V3(0, 1, 0), rnd() * 6);
      m.compose(new V3(x, 0, z), q, new V3(s, s, s)); pines.setMatrixAt(i, m);
      col.setHSL(0.28 + rnd() * 0.06, 0.45, 0.2 + rnd() * 0.08); pines.setColorAt(i, col);
      m.compose(new V3(x, 0, z), q, new V3(s, 3.5 * s, s)); trunks.setMatrixAt(ti++, m);
      cylCol(x, z, 0.28 * s, 0.2 * s, 0, 3 * s);
      cylCol(x, z, 2.3 * s, 0.3 * s, 2.4 * s, 9.4 * s);
    });
    trees.round.forEach(([x, z, s], i) => {
      q.setFromAxisAngle(new V3(0, 1, 0), rnd() * 6);
      m.compose(new V3(x, 0, z), q, new V3(s * rr(0.9, 1.2), s, s * rr(0.9, 1.2))); rounds.setMatrixAt(i, m);
      col.setHSL(0.22 + rnd() * 0.08, 0.5, 0.24 + rnd() * 0.08); rounds.setColorAt(i, col);
      m.compose(new V3(x, 0, z), q, new V3(s * 1.3, 5 * s, s * 1.3)); trunks.setMatrixAt(ti++, m);
      cylCol(x, z, 0.35 * s, 0.25 * s, 0, 4.5 * s);
      sphCol(new V3(x, 6.6 * s, z), 2.5 * s);
    });
    for (const im of [trunks, pines, rounds]) { im.frustumCulled = false; im.castShadow = true; im.receiveShadow = true; scene.add(im); }
    // buissons et rochers pour les repères au ras du sol
    const bushGeo = new THREE.IcosahedronGeometry(1, 0);
    const bushes = new THREE.InstancedMesh(bushGeo, M.leaf, 260);
    let bi = 0;
    for (let i = 0; i < 2000 && bi < 260; i++) {
      const x = rr(-200, 250), z = rr(-280, 175);
      if (excluded(x, z, 1)) continue;
      const s = rr(0.4, 1.1);
      m.compose(new V3(x, s * 0.5, z), q.setFromAxisAngle(new V3(0, 1, 0), rnd() * 6), new V3(s * 1.4, s, s * 1.2));
      bushes.setMatrixAt(bi, m); col.setHSL(0.24 + rnd() * 0.07, 0.45, 0.2 + rnd() * 0.1); bushes.setColorAt(bi, col);
      sphCol(new V3(x, s * 0.4, z), s * 0.9);
      bi++;
    }
    bushes.count = bi; bushes.frustumCulled = false; bushes.castShadow = true; bushes.receiveShadow = true; scene.add(bushes);
    for (let i = 0; i < 40; i++) {
      const x = rr(-200, 250), z = rr(-280, 175);
      if (excluded(x, z, 2)) continue;
      const s = rr(0.6, 2.2);
      addGeo(B.rock, new THREE.DodecahedronGeometry(1, 0), x, s * 0.3, z, rnd() * 6, new V3(s * 1.3, s * 0.8, s));
      sphCol(new V3(x, s * 0.3, z), s * 0.85);
    }
  }
  function mergeGeos(list) {
    const b = new THREE.BufferGeometry();
    const p = [], n = [];
    list.forEach(g => { p.push(...g.attributes.position.array); n.push(...g.attributes.normal.array); });
    b.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    b.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3));
    return b;
  }

  // ═══════════ Zone de suivi (parking + circuit) ═══════════
  const trackCurve = new THREE.CatmullRomCurve3([
    new V3(72, 0, 22), new V3(140, 0, 13), new V3(198, 0, 24), new V3(214, 0, 70), new V3(200, 0, 120),
    new V3(158, 0, 136), new V3(126, 0, 122), new V3(92, 0, 138), new V3(62, 0, 118), new V3(56, 0, 62)], true, 'centripetal');
  function trackZone() {
    const pad = new THREE.PlaneGeometry(100, 70); pad.rotateX(-Math.PI / 2);
    addGeo(B.asphalt, pad, 132, 0.02, 70);
    // marquages au sol
    for (let x = 88; x < 178; x += 6) box(B.lineWhite, 0.15, 0.01, 5, x, 0.03, 101, 0, { col: false });
    box(B.lineWhite, 100, 0.01, 0.2, 132, 0.03, 35.2, 0, { col: false });
    // ruban du circuit
    const N = 400, W = 5;
    const pts = trackCurve.getSpacedPoints(N);
    const road = [], kerbL = [], kerbR = [];
    const UP = new V3(0, 1, 0);
    for (let i = 0; i <= N; i++) {
      const p = pts[i % N], t = trackCurve.getTangentAt((i % N) / N);
      const side = new V3().crossVectors(t, UP).normalize();
      road.push([p.clone().addScaledVector(side, -W).setY(0.025), p.clone().addScaledVector(side, W).setY(0.025)]);
      kerbL.push([p.clone().addScaledVector(side, -W - 0.9).setY(0.035), p.clone().addScaledVector(side, -W + 0.1).setY(0.035)]);
      kerbR.push([p.clone().addScaledVector(side, W - 0.1).setY(0.035), p.clone().addScaledVector(side, W + 0.9).setY(0.035)]);
    }
    const ribbon = (rows, mat, uvLen, world) => {
      const pos = [], uv = [], idx = [];
      let acc = 0;
      rows.forEach((r, i) => {
        if (i) acc += r[0].distanceTo(rows[i - 1][0]);
        pos.push(r[0].x, r[0].y, r[0].z, r[1].x, r[1].y, r[1].z);
        if (world) uv.push(r[0].x / 7, r[0].z / 7, r[1].x / 7, r[1].z / 7);
        else uv.push(0, acc / uvLen, 1, acc / uvLen);
        if (i) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      });
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx); g.computeVertexNormals();
      // orientation vers le haut
      const nrm = g.attributes.normal; if (nrm.getY(0) < 0) { g.setIndex(idx.map((v, k) => idx[k - (k % 3) + [0, 2, 1][k % 3]])); g.computeVertexNormals(); }
      const m = new THREE.Mesh(g, mat); m.receiveShadow = true; scene.add(m);
    };
    ribbon(road, M.asphalt, 7, true);
    ribbon(kerbL, M.kerb, 2.4); ribbon(kerbR, M.kerb, 2.4);
    // murets de pneus dans les virages extérieurs
    const tireGeo = new THREE.TorusGeometry(0.32, 0.14, 6, 10); tireGeo.rotateX(Math.PI / 2);
    const tires = [];
    for (let i = 0; i < N; i += 2) {
      const u = i / N, u2 = ((i + 4) % N) / N;
      const t1 = trackCurve.getTangentAt(u), t2 = trackCurve.getTangentAt(u2);
      const k = new V3().crossVectors(t1, t2).y;
      if (Math.abs(k) < 0.035) continue;
      const side = new V3().crossVectors(t1, UP).normalize().multiplyScalar(k > 0 ? 1 : -1);
      const p = pts[i].clone().addScaledVector(side, W + 3.2);
      if (p.x > 80 && p.x < 184 && p.z > 33 && p.z < 107) continue;
      for (let h = 0; h < 3; h++) tires.push([p.x, 0.14 + h * 0.28, p.z]);
      cylCol(p.x, p.z, 0.46, 0.46, 0, 0.85);
    }
    const tm = new THREE.InstancedMesh(tireGeo, new THREE.MeshLambertMaterial({ color: 0x1c1c1c }), tires.length);
    const m4 = new THREE.Matrix4();
    tires.forEach((t, i) => { m4.makeTranslation(t[0], t[1], t[2]); tm.setMatrixAt(i, m4); });
    tm.castShadow = true; tm.frustumCulled = false; scene.add(tm);
    // tribune
    for (let r = 0; r < 5; r++) box(B.concreteDark, 30, 0.5, 1.2, 132, 0.25 + r * 0.5, 158 + r * 1.2, 0, { occ: true });
    box(B.steel, 30, 0.15, 7, 132, 4.8, 160.4, [-0.12, 0, 0]);
    for (const x of [118, 132, 146]) box(B.steel, 0.15, 4.8, 0.15, x, 2.4, 163.7);
    // plots
    const coneGeo = new THREE.ConeGeometry(0.18, 0.5, 10); coneGeo.translate(0, 0.25, 0);
    const cones = new THREE.InstancedMesh(coneGeo, new THREE.MeshLambertMaterial({ color: 0xff6a1a }), 30);
    let ci = 0;
    for (let a = 0; a < 6; a++) { m4.makeTranslation(110 + Math.cos(a) * 1.4, 0.02, 70 + Math.sin(a) * 1.4); cones.setMatrixAt(ci++, m4); }
    for (const x of [137, 155, 173]) { m4.makeTranslation(x, 0.02, 70); cones.setMatrixAt(ci++, m4); }
    for (let x = 86; x < 180; x += 8) { m4.makeTranslation(x, 0.02, 38); cones.setMatrixAt(ci++, m4); }
    cones.count = ci; cones.frustumCulled = false; cones.castShadow = true; scene.add(cones);
  }

  // ═══════════ Petits obstacles libres ═══════════
  function playground() {
    // slalom de fanions
    for (let i = 0; i < 8; i++) flag(-48 + i * 5, 52 + (i % 2) * 4, i % 2 ? 0xff3b30 : 0x1e88ff);
    // échelle de portes empilées
    frameGate(-25, 0, 10, Math.PI / 2, 2.4, 1.8, null);
    frameGate(-25, 2.4, 10, Math.PI / 2, 2.4, 1.8, null);
    // haies basses
    for (let i = 0; i < 4; i++) box(B.gate, 3, 0.2, 0.2, 18 + i * 0, 0.9, 30 + i * 9, 0);
    for (let i = 0; i < 4; i++) { box(B.gateDark, 0.15, 0.9, 0.15, 16.6, 0.45, 30 + i * 9); box(B.gateDark, 0.15, 0.9, 0.15, 19.4, 0.45, 30 + i * 9); }
    // double porte "split S"
    frameGate(30, 0, 40, 0, 2.6, 2, null);
    frameGate(30, 3.2, 40, Math.PI, 2.6, 2, null);
    // ballots de paille
    for (let i = 0; i < 6; i++) addGeo(B.wood, new THREE.CylinderGeometry(0.75, 0.75, 1.2, 12), -50 + i * 2.2, 0.75, 75, [0, 0, Math.PI / 2]);
    for (let i = 0; i < 6; i++) cylCol(-50 + i * 2.2, 75, 0.75, 0.75, 0, 1.5);
    // portes de la forêt
    frameGate(5, 0, -215, 0, 3, 2.4, null);
    frameGate(5, 0, -250, 0, 3, 2.4, null);
  }

  // ═══════════ Construction ═══════════
  bando();
  tubeTunnel(tunnelCurve, 2.4, 10);
  culvert();
  bentTunnel();
  containers();
  diveTower(35, -150, 20);
  powerLine();
  windmill();
  trackZone();
  playground();
  plantTrees();

  // Parcours de course : 9 checkpoints
  {
    course.push(frameGate(0, 0, -10, 0, 2.6, 2.0, 'Porte 1'));
    course.push(frameGate(30, 0, -35, -Math.PI / 2, 2.6, 2.0, 'Porte 2'));
    const tIn = tunnelCurve.getPointAt(0.015), tInT = tunnelCurve.getTangentAt(0.015);
    course.push(gateObj(tIn, Math.atan2(-tInT.x, -tInT.z), 4.2, 4.2, 'Tunnel'));
    const tOut = tunnelCurve.getPointAt(0.985), tOutT = tunnelCurve.getTangentAt(0.985);
    course.push(gateObj(tOut, Math.atan2(-tOutT.x, -tOutT.z), 4.2, 4.2, 'Sortie tunnel'));
    course.push(frameGate(35, 20.125, -150, Math.PI / 2, 2.6, 2.0, 'Dive'));
    course.push(gateObj(new V3(-28.6, 1.35, -150), Math.PI / 2, 2.9, 2.5, 'Conteneurs'));
    course.push(gateObj(new V3(-90, 6.05, -50), Math.PI, 4.5, 2.5, 'Fenêtre bando'));
    course.push(gateObj(new V3(-90, 1.6, -30), Math.PI, 6, 3.2, 'Sortie bando'));
    course.push(arch(-35, 30, -Math.PI / 2, 3.6, 0.45, 'Arche'));
  }

  // Décor : portes libres en plus
  frameGate(-60, 0, 10, 0.4, 2.6, 2, null);
  frameGate(55, 0, 15, -0.3, 2.6, 2, null);
  arch(-70, -10, 0.2, 3.2, 0.4, null);

  const built = Object.values(B).flatMap(b => Array.isArray(b) ? b : [b]).map(b => b.build({ cast: b !== B.lineWhite }));

  // ── Mise à jour (éolienne, manche à air, portes) ──
  const _qz = new THREE.Quaternion();
  let nextGate = -1, windDir = new V3(1, 0, 0);
  function update(dt, t, focus, windV) {
    mill.angle += mill.w * dt;
    mill.group.rotation.z = mill.angle;
    mill.cols.forEach((c, i) => {
      const a = mill.angle + i * Math.PI * 2 / 3;
      _qz.setFromAxisAngle(new V3(0, 0, 1), a);
      c.ax.set(1, 0, 0).applyQuaternion(_qz); c.ay.set(0, 1, 0).applyQuaternion(_qz); c.az.set(0, 0, 1);
      c.c.copy(mill.hub).addScaledVector(c.ay, 5.5);
      c.v.set(0, 0, 0);
    });
    // manche à air
    if (windV) {
      const sp = windV.length();
      if (sp > 0.05) windDir.lerp(windV.clone().normalize(), Math.min(1, dt * 2));
      const yaw = Math.atan2(-windDir.x, -windDir.z);
      windsock.rotation.set(0, yaw, 0);
      windsock.children[0].rotation.x = -(1 - Math.min(1, sp / 7)) * 1.2 + Math.sin(t * 7) * 0.04 * sp / 7;
    }
    // ombres centrées sur la caméra / le drone
    sun.position.copy(focus).addScaledVector(sunDir, 120);
    sun.target.position.copy(focus);
    sky.position.copy(focus);
    clouds.position.set(focus.x, 0, focus.z);
    gates.forEach((g, i) => {
      const on = i === nextGate;
      g.plane.visible = on;
      if (on) g.plane.material.opacity = 0.12 + 0.08 * Math.sin(t * 5);
    });
  }

  function setNextGate(g) { nextGate = g ? gates.indexOf(g) : -1; }

  return {
    scene, heightAt, collide, occlusion, update, setNextGate, course, gates, pilots, sun, sunDir, TEX, M, trackCurve, FOG,
    spawns: { free: { pos: new V3(0, 0.04, 20), yaw: 0 }, race: { pos: new V3(0, 0.04, 20), yaw: 0 }, track: { pos: new V3(132, 0.04, 105), yaw: 0 } },
    addDynamicBox: (h) => boxCol(new V3(), h, new THREE.Quaternion(), false, true),
    canvasTex, rnd,
  };
})();

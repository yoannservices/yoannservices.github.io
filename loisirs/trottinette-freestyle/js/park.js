'use strict';
/* ═══════════════════════════════════════════════════════════
   SKATEPARK
   Chaque module est décrit par un profil exact (hauteur selon
   la position). La physique et les maillages utilisent la même
   fonction : ce qu'on voit est ce sur quoi on roule.
   Repère local d'un module : u = axe de montée, v = largeur.
   ═══════════════════════════════════════════════════════════ */
const Park = (() => {
  const elements = [];
  const rails = [];
  const spawns = [];
  const BOUNDS = { minX: -41, maxX: 41, minZ: -46, maxZ: 47 };

  /* ── Repère local ── */
  function frame(cx, cz, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return {
      cx, cz, a, c, s,
      toLocal(x, z) { const dx = x - cx, dz = z - cz; return [dx * c + dz * s, -dx * s + dz * c]; },
      toWorld(u, v) { return [cx + u * c - v * s, cz + u * s + v * c]; },
    };
  }

  function sample(fn, a, b, n) {
    const out = [];
    for (let i = 0; i <= n; i++) { const u = a + (b - a) * i / n; out.push([u, fn(u)]); }
    return out;
  }

  /* Module extrudé : profil y(u) sur [u0, u1], largeur W */
  function addProfile(o) {
    const el = Object.assign(frame(o.cx, o.cz, o.a), o);
    el.height = (x, z) => {
      const [u, v] = el.toLocal(x, z);
      if (u < el.u0 || u > el.u1 || Math.abs(v) > el.width / 2) return null;
      return el.y(u);
    };
    el.normalAt = (x, z) => {
      const [u] = el.toLocal(x, z);
      const d = el.dy(Math.min(el.u1, Math.max(el.u0, u)));
      const nx = -d * el.c, nz = -d * el.s, l = Math.hypot(nx, 1, nz);
      return [nx / l, 1 / l, nz / l];
    };
    elements.push(el);
    return el;
  }

  /* Courbe de transition (quarter, kicker) : arc de cercle de rayon R */
  function transition(H, R) {
    const L = Math.sqrt(R * R - (R - H) * (R - H));
    return {
      L,
      y: u => R - Math.sqrt(Math.max(0, R * R - u * u)),
      dy: u => { const q = Math.max(1e-4, R * R - u * u); return u / Math.sqrt(q); },
    };
  }

  /* ── Types de modules ── */
  function quarter(cx, cz, a, { H, R, D = 1.5, W, name = 'Quarter' }) {
    const t = transition(H, R), L = t.L;
    const prof = [[0, 0], ...sample(t.y, 0, L, 30), [L, H], [L + D, H], [L + D, H], [L + D, 0]];
    const el = addProfile({
      cx, cz, a, width: W, u0: 0, u1: L + D, kind: 'qp', name, H, R, L, lip: L, vert: true,
      y: u => (u <= L ? t.y(u) : H), dy: u => (u < L ? t.dy(u) : 0), profile: prof,
    });
    // Coping : tube d'acier sur la lèvre, grindable
    const [ax, az] = el.toWorld(L + 0.03, -W / 2 + 0.2), [bx, bz] = el.toWorld(L + 0.03, W / 2 - 0.2);
    addRail(ax, H + 0.035, az, bx, H + 0.035, bz, 'coping', 'coping', 0.035, false);
    return el;
  }

  function kicker(cx, cz, a, { H, R, W, name = 'Kicker' }) {
    const t = transition(H, R), L = t.L;
    const prof = [[0, 0], ...sample(t.y, 0, L, 24), [L, H], [L, 0]];
    return addProfile({
      cx, cz, a, width: W, u0: 0, u1: L, kind: 'kicker', name, H, L, lip: L,
      y: t.y, dy: t.dy, profile: prof,
    });
  }

  function bank(cx, cz, a, { H, L, D = 0, W, name = 'Bank' }) {
    const prof = D > 0
      ? [[0, 0], [L, H], [L, H], [L + D, H], [L + D, H], [L + D, 0]]
      : [[0, 0], [L, H], [L, H], [L, 0]];
    return addProfile({
      cx, cz, a, width: W, u0: 0, u1: L + D, kind: 'bank', name, H,
      y: u => (u <= L ? H * u / L : H), dy: u => (u < L ? H / L : 0), profile: prof,
    });
  }

  function box(cx, cz, a, { H, L, W, name = 'Box', ledge = true }) {
    const h = L / 2;
    const el = addProfile({
      cx, cz, a, width: W, u0: -h, u1: h, kind: 'box', name, H,
      y: () => H, dy: () => 0,
      profile: [[-h, 0], [-h, H], [-h, H], [h, H], [h, H], [h, 0]],
    });
    if (ledge) {
      // Les deux arêtes longues sont grindables
      for (const sv of [-1, 1]) {
        const [ax, az] = el.toWorld(-h + 0.15, sv * (W / 2 - 0.05));
        const [bx, bz] = el.toWorld(h - 0.15, sv * (W / 2 - 0.05));
        addRail(ax, H, az, bx, H, bz, 'ledge', name, 0.03, true);
      }
    }
    return el;
  }

  function stairs(cx, cz, a, { H, n, s, W, name = 'Escalier' }) {
    const h = H / n, len = (n - 1) * s;
    const prof = [[0, 0]];
    for (let k = 0; k < n - 1; k++) {
      const y = H - (k + 1) * h;
      prof.push([k * s, y], [k * s, y], [(k + 1) * s, y], [(k + 1) * s, y]);
    }
    prof.push([len, 0]);
    return addProfile({
      cx, cz, a, width: W, u0: 0, u1: len, kind: 'stairs', name, H,
      y: u => H - (Math.min(n - 2, Math.floor(u / s)) + 1) * h, dy: () => 0, profile: prof,
    });
  }

  function landing(cx, cz, a, { H, D, L, W, name = 'Réception' }) {
    return addProfile({
      cx, cz, a, width: W, u0: 0, u1: D + L, kind: 'landing', name, H,
      y: u => (u <= D ? H : H * (1 - (u - D) / L)), dy: u => (u < D ? 0 : -H / L),
      profile: [[0, 0], [0, H], [0, H], [D, H], [D, H], [D + L, 0]],
    });
  }

  function pyramid(cx, cz, { B, T, H, name = 'Pyramide' }) {
    const k = (B - T) / 2;
    const el = Object.assign(frame(cx, cz, 0), { kind: 'pyramid', name, B, T, H, u0: -B / 2, u1: B / 2 });
    el.height = (x, z) => {
      const u = x - cx, v = z - cz, m = Math.max(Math.abs(u), Math.abs(v));
      if (m > B / 2) return null;
      return H * Math.min(1, Math.max(0, (B / 2 - m) / k));
    };
    el.normalAt = (x, z) => {
      const u = x - cx, v = z - cz;
      if (Math.max(Math.abs(u), Math.abs(v)) <= T / 2) return [0, 1, 0];
      const g = H / k;
      let nx = 0, nz = 0;
      if (Math.abs(u) >= Math.abs(v)) nx = g * Math.sign(u); else nz = g * Math.sign(v);
      const l = Math.hypot(nx, 1, nz);
      return [nx / l, 1 / l, nz / l];
    };
    elements.push(el);
    return el;
  }

  /* ── Rails / ledges / coping ── */
  function addRail(ax, ay, az, bx, by, bz, type, name, radius = 0.03, hidden = false, posts = false) {
    const a = new THREE.Vector3(ax, ay, az), b = new THREE.Vector3(bx, by, bz);
    const d = b.clone().sub(a), len = d.length();
    rails.push({ a, b, dir: d.clone().divideScalar(len), len, type, name, radius, hidden, posts });
  }

  /* ── Requêtes physiques ── */
  function ground(x, z) {
    let best = 0, el = null;
    for (const e of elements) {
      const h = e.height(x, z);
      if (h !== null && h > best + 1e-6) { best = h; el = e; }
    }
    return { y: best, el, n: el ? el.normalAt(x, z) : [0, 1, 0] };
  }

  function inBounds(x, z) {
    return x > BOUNDS.minX && x < BOUNDS.maxX && z > BOUNDS.minZ && z < BOUNDS.maxZ;
  }

  /* ═══ Disposition du park ═══ */
  const NORTH = -Math.PI / 2;   // u vers -z
  const SOUTH = Math.PI / 2;    // u vers +z
  const EAST = 0;               // u vers +x
  const WEST = Math.PI;         // u vers -x

  function layout() {
    // Grand quarter vert au fond (3,2 m)
    quarter(0, -38, NORTH, { H: 3.2, R: 3.7, D: 2.2, W: 26, name: 'Vert 3,2 m' });

    // Mini halfpipe (1,8 m) à gauche
    quarter(-28, -14, WEST, { H: 1.8, R: 2.3, D: 1.6, W: 12, name: 'Mini rampe' });
    quarter(-20, -14, EAST, { H: 1.8, R: 2.3, D: 1.6, W: 12, name: 'Mini rampe' });

    // Quarters latéraux
    quarter(-36, 8, WEST, { H: 2.3, R: 2.9, D: 1.4, W: 14, name: 'Quarter' });
    quarter(33, -6, EAST, { H: 2.0, R: 2.6, D: 1.4, W: 18, name: 'Quarter' });

    // Funbox centrale : montée, table avec ledges + rail, descente
    bank(0, 14, NORTH, { H: 1.0, L: 3, W: 6, name: 'Funbox montée' });
    box(0, 7, NORTH, { H: 1.0, L: 8, W: 6, name: 'Funbox table' });
    bank(0, 0, SOUTH, { H: 1.0, L: 3, W: 6, name: 'Funbox descente' });
    addRail(1.6, 1.36, 10.2, 1.6, 1.36, 3.8, 'rail', 'Rail de la funbox', 0.025, false, true);

    // Ligne de sauts à droite : tour de drop-in, petit, moyen et gros saut
    box(24, 41, NORTH, { H: 3.5, L: 6, W: 5, name: 'Tour de départ', ledge: false });
    bank(24, 31, SOUTH, { H: 3.5, L: 7, W: 5, name: 'Roll-in' });
    kicker(24, 27, NORTH, { H: 2.0, R: 7.0, W: 4.5, name: 'Gros saut' });
    landing(24, 18.6, NORTH, { H: 2.0, D: 1.2, L: 6.5, W: 5, name: 'Réception du gros saut' });
    kicker(24, 5, NORTH, { H: 1.2, R: 4.5, W: 4, name: 'Saut moyen' });
    landing(24, -2, NORTH, { H: 1.2, D: 1.0, L: 4.5, W: 4, name: 'Réception moyenne' });
    kicker(24, -16, NORTH, { H: 0.6, R: 3.0, W: 4, name: 'Petit saut' });

    // Plateforme avec escalier, main courante et bank de descente (à gauche devant)
    box(-24, 28, NORTH, { H: 1.2, L: 8, W: 12, name: 'Plateforme', ledge: false });
    bank(-24, 40, NORTH, { H: 1.2, L: 8, W: 12, name: 'Accès plateforme' });
    stairs(-26.5, 24, NORTH, { H: 1.2, n: 5, s: 0.5, W: 7, name: 'Escalier' });
    bank(-20.5, 19, SOUTH, { H: 1.2, L: 5, W: 5, name: 'Bank' });
    addRail(-23, 1.78, 24.25, -23, 0.58, 22.0, 'rail', 'Main courante', 0.025, false, true);
    addRail(-23, 0.58, 22.0, -23, 0.58, 20.4, 'rail', 'Main courante', 0.025, false, true);

    // Street : rail plat, ledge, manual pad, pyramide, rail long
    addRail(8, 0.42, 24, 8, 0.42, 16, 'rail', 'Rail plat', 0.025, false, true);
    box(-8, 19.5, NORTH, { H: 0.45, L: 7, W: 0.7, name: 'Ledge' });
    box(-8, -2, NORTH, { H: 0.22, L: 6, W: 3, name: 'Manual pad' });
    pyramid(8, -24, { B: 9, T: 3, H: 1.1 });
    addRail(-7, 0.5, -29, -7, 0.5, -19, 'rail', 'Rail long', 0.025, false, true);
    addRail(-12, 0.38, 6, -4, 0.38, 6, 'rail', 'Rail bas', 0.025, false, true);

    // Points de départ
    spawns.push(
      { name: 'Entrée du park', x: 0, z: 40, heading: Math.PI },
      { name: 'Tour de drop-in', x: 24, z: 42.5, heading: Math.PI },
      { name: 'Mini rampe', x: -24, z: -14, heading: Math.PI / 2 },
      { name: 'Plateforme escalier', x: -24, z: 31, heading: Math.PI },
      { name: 'Pied du vert', x: 0, z: -24, heading: Math.PI },
    );
  }
  layout();

  /* ═══════════════════════════════════════════════════════════
     VISUELS
     ═══════════════════════════════════════════════════════════ */
  function canvasTex(size, draw, repeat = 1) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    draw(c.getContext('2d'), size);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
    t.anisotropy = 8;
    return t;
  }

  function noiseFill(g, S, base, amp, alpha = 1) {
    const img = g.getImageData(0, 0, S, S), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * amp;
      d[i] = Math.min(255, Math.max(0, d[i] + n));
      d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n));
      d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n * 1.05));
      d[i + 3] = 255 * alpha;
    }
    g.putImageData(img, 0, 0);
  }

  function stains(g, S, count, color, rMax) {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * S, y = Math.random() * S, r = 10 + Math.random() * rMax;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, color);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }

  /* Béton du sol : 4 m par tuile, joints de dilatation */
  const groundTex = canvasTex(512, (g, S) => {
    g.fillStyle = '#86857f'; g.fillRect(0, 0, S, S);
    noiseFill(g, S, 0, 26);
    stains(g, S, 26, 'rgba(60,60,58,0.10)', 90);
    stains(g, S, 14, 'rgba(255,255,250,0.07)', 70);
    for (let i = 0; i < 140; i++) {          // traces de roues / gomme
      g.strokeStyle = `rgba(30,30,30,${0.03 + Math.random() * 0.05})`;
      g.lineWidth = 1 + Math.random() * 2;
      g.beginPath();
      const x = Math.random() * S, y = Math.random() * S, a = Math.random() * Math.PI;
      g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 80, y + Math.sin(a) * 80); g.stroke();
    }
    g.fillStyle = 'rgba(40,40,40,0.55)';     // joints
    g.fillRect(0, 0, S, 3); g.fillRect(0, 0, 3, S);
  });

  /* Béton lissé des modules */
  const rampTex = canvasTex(512, (g, S) => {
    g.fillStyle = '#a19f98'; g.fillRect(0, 0, S, S);
    noiseFill(g, S, 0, 14);
    stains(g, S, 30, 'rgba(70,70,66,0.08)', 110);
    stains(g, S, 10, 'rgba(255,255,255,0.08)', 80);
    for (let i = 0; i < 90; i++) {
      g.strokeStyle = `rgba(20,20,20,${0.04 + Math.random() * 0.05})`;
      g.lineWidth = 1 + Math.random() * 2.5;
      g.beginPath();
      const x = Math.random() * S, y = Math.random() * S;
      g.moveTo(x, y); g.quadraticCurveTo(x + 40, y + Math.random() * 60 - 30, x + 110, y + Math.random() * 40 - 20); g.stroke();
    }
  });
  const sideTex = canvasTex(512, (g, S) => {
    g.fillStyle = '#918f88'; g.fillRect(0, 0, S, S);
    noiseFill(g, S, 0, 22);
    stains(g, S, 20, 'rgba(50,50,48,0.12)', 120);
    g.fillStyle = 'rgba(0,0,0,0.12)';        // traces de coffrage
    for (let y = 0; y < S; y += 64) g.fillRect(0, y, S, 2);
  });
  const grassTex = canvasTex(256, (g, S) => {
    g.fillStyle = '#4f7a3a'; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 5000; i++) {
      g.fillStyle = `hsl(${85 + Math.random() * 30},${35 + Math.random() * 20}%,${22 + Math.random() * 22}%)`;
      g.fillRect(Math.random() * S, Math.random() * S, 1, 2 + Math.random() * 3);
    }
  });
  const fenceTex = canvasTex(64, (g, S) => {
    g.clearRect(0, 0, S, S);
    g.strokeStyle = 'rgba(190,195,200,0.95)'; g.lineWidth = 2.2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(S, S); g.moveTo(S, 0); g.lineTo(0, S); g.stroke();
  });

  const mats = {
    ground: new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.95 }),
    ramp: new THREE.MeshStandardMaterial({ map: rampTex, roughness: 0.82 }),
    side: new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.92 }),
    steel: new THREE.MeshStandardMaterial({ color: 0xc9ccd1, roughness: 0.32, metalness: 0.85 }),
    paintedRail: new THREE.MeshStandardMaterial({ color: 0xd8432f, roughness: 0.45, metalness: 0.4 }),
    grass: new THREE.MeshStandardMaterial({ map: grassTex, roughness: 1 }),
    fence: new THREE.MeshStandardMaterial({ map: fenceTex, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.5 }),
    post: new THREE.MeshStandardMaterial({ color: 0x6d7278, roughness: 0.5, metalness: 0.7 }),
    trunk: new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 1 }),
    leaves: new THREE.MeshStandardMaterial({ color: 0x3f6b30, roughness: 0.95, flatShading: true }),
    wood: new THREE.MeshStandardMaterial({ color: 0x8a5f3a, roughness: 0.85 }),
  };
  rampTex.repeat.set(0.25, 0.25);
  sideTex.repeat.set(0.25, 0.25);
  groundTex.repeat.set(1, 1);
  grassTex.repeat.set(60, 60);

  /* Maillage d'un module extrudé (surface supérieure lisse + flancs) */
  function profileMesh(el) {
    const pts = el.profile, hw = el.width / 2;
    const pos = [], uv = [], idx = [];
    let s = 0;
    for (let i = 0; i < pts.length; i++) {
      if (i > 0) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      pos.push(pts[i][0], pts[i][1], -hw, pts[i][0], pts[i][1], hw);
      uv.push(s, -hw, s, hw);
    }
    for (let i = 0; i < pts.length - 1; i++) {
      if (pts[i][0] === pts[i + 1][0] && pts[i][1] === pts[i + 1][1]) continue;
      const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
      idx.push(a, b, c, b, d, c);
    }
    const top = new THREE.BufferGeometry();
    top.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    top.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    top.setIndex(idx);
    top.computeVertexNormals();

    // Flancs : polygone du profil triangulé
    const contour = [];
    for (const p of pts) {
      const last = contour[contour.length - 1];
      if (!last || last.x !== p[0] || last.y !== p[1]) contour.push(new THREE.Vector2(p[0], p[1]));
    }
    if (contour.length > 2 && contour[0].equals(contour[contour.length - 1])) contour.pop();
    const tris = THREE.ShapeUtils.triangulateShape(contour, []);
    const sp = [], su = [], si = [];
    for (const side of [-1, 1]) {
      const base = sp.length / 3;
      for (const p of contour) { sp.push(p.x, p.y, side * hw); su.push(p.x, p.y); }
      for (const t of tris) {
        const [i0, i1, i2] = t, A = contour[i0], B = contour[i1], C = contour[i2];
        const area = (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x);
        const ccw = area > 0;
        if ((side > 0) === ccw) si.push(base + i0, base + i1, base + i2);
        else si.push(base + i0, base + i2, base + i1);
      }
    }
    const sides = new THREE.BufferGeometry();
    sides.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    sides.setAttribute('uv', new THREE.Float32BufferAttribute(su, 2));
    sides.setIndex(si);
    sides.computeVertexNormals();

    const group = new THREE.Group();
    const mTop = new THREE.Mesh(top, mats.ramp);
    const mSide = new THREE.Mesh(sides, mats.side);
    for (const m of [mTop, mSide]) { m.castShadow = true; m.receiveShadow = true; group.add(m); }
    group.matrixAutoUpdate = false;
    group.matrix.makeBasis(
      new THREE.Vector3(el.c, 0, el.s), new THREE.Vector3(0, 1, 0), new THREE.Vector3(-el.s, 0, el.c),
    ).setPosition(el.cx, 0, el.cz);
    return group;
  }

  function pyramidMesh(el) {
    const { B, T, H, cx, cz } = el, b = B / 2, t = T / 2;
    const g = new THREE.BufferGeometry();
    const P = [
      [-t, H, -t], [t, H, -t], [t, H, t], [-t, H, t],
      [-b, 0, -b], [b, 0, -b], [b, 0, b], [-b, 0, b],
    ];
    const quads = [[0, 3, 2, 1], [4, 0, 1, 5], [5, 1, 2, 6], [6, 2, 3, 7], [7, 3, 0, 4]];
    const pos = [], uv = [];
    for (const q of quads) {
      const tri = [q[0], q[1], q[2], q[0], q[2], q[3]];
      for (const i of tri) { pos.push(P[i][0] + cx, P[i][1], P[i][2] + cz); uv.push(P[i][0], P[i][2] + P[i][1]); }
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, mats.ramp);
    m.castShadow = m.receiveShadow = true;
    return m;
  }

  function tube(a, b, r, mat) {
    const d = b.clone().sub(a), len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 12), mat);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  function railMesh(r, group) {
    if (r.type === 'ledge') {
      // Cornière d'acier sur l'arête
      const m = tube(r.a, r.b, 0.022, mats.steel);
      m.position.y -= 0.01;
      group.add(m);
      return;
    }
    const mat = r.type === 'coping' ? mats.steel : (r.name.includes('Main') ? mats.steel : mats.paintedRail);
    group.add(tube(r.a, r.b, r.radius, mat));
    if (r.posts) {
      const n = Math.max(2, Math.ceil(r.len / 2.2) + 1);
      for (let i = 0; i < n; i++) {
        const p = r.a.clone().lerp(r.b, n === 1 ? 0 : i / (n - 1));
        if (i === 0) p.lerp(r.b, 0.04);
        if (i === n - 1) p.lerp(r.a, 0.04);
        const gy = ground(p.x, p.z).y;
        if (p.y - gy < 0.08) continue;
        group.add(tube(new THREE.Vector3(p.x, gy, p.z), p, 0.022, mats.post));
      }
    }
  }

  /* Graffiti procéduraux */
  const TAGS = ['SCOOT', 'FLOW', 'WHIP!', 'RIDE', 'BRI FLIP', 'SEND IT', 'PARK LIFE', 'NO HANDS', 'BARSPIN'];
  const PALETTE = ['#ff4d6d', '#ffd23f', '#3bceac', '#4361ee', '#f77f00', '#9b5de5', '#00bbf9', '#ef476f'];
  function graffitiTex(w, h, seed) {
    const c = document.createElement('canvas');
    c.width = 512; c.height = Math.round(512 * h / w);
    const g = c.getContext('2d');
    const pick = a => a[Math.floor(Math.random() * a.length)];
    for (let i = 0; i < 5; i++) {                       // fonds en nuages de bombe
      const x = Math.random() * c.width, y = Math.random() * c.height, r = 40 + Math.random() * 120;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, pick(PALETTE) + 'aa'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
    }
    const text = TAGS[seed % TAGS.length];
    const fs = Math.min(c.height * 0.62, c.width / (text.length * 0.62));
    g.font = `900 ${fs}px Impact, 'Arial Black', sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.save();
    g.translate(c.width / 2, c.height / 2);
    g.rotate((Math.random() - 0.5) * 0.18);
    g.lineJoin = 'round';
    g.lineWidth = fs * 0.2; g.strokeStyle = '#111'; g.strokeText(text, 0, 0);
    g.lineWidth = fs * 0.08; g.strokeStyle = '#fff'; g.strokeText(text, 0, 0);
    const lg = g.createLinearGradient(0, -fs / 2, 0, fs / 2);
    lg.addColorStop(0, pick(PALETTE)); lg.addColorStop(1, pick(PALETTE));
    g.fillStyle = lg; g.fillText(text, 0, 0);
    g.restore();
    for (let i = 0; i < 6; i++) {                       // coulures
      g.fillStyle = pick(PALETTE) + 'cc';
      g.fillRect(c.width * (0.15 + Math.random() * 0.7), c.height * 0.6, 3, 20 + Math.random() * 50);
    }
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 8;
    return t;
  }

  function graffitiPlane(w, h, x, y, z, ry, seed) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshStandardMaterial({ map: graffitiTex(w, h, seed), transparent: true, roughness: 0.9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }),
    );
    m.position.set(x, y, z); m.rotation.y = ry;
    m.receiveShadow = true;
    return m;
  }

  function tree(x, z, s) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * s, 0.26 * s, 3 * s, 8), mats.trunk);
    trunk.position.y = 1.5 * s;
    g.add(trunk);
    for (let i = 0; i < 3; i++) {
      const f = new THREE.Mesh(new THREE.IcosahedronGeometry((1.6 - i * 0.3) * s, 0), mats.leaves);
      f.position.set((Math.random() - 0.5) * s, (3.2 + i * 1.0) * s, (Math.random() - 0.5) * s);
      f.rotation.set(Math.random(), Math.random(), Math.random());
      g.add(f);
    }
    g.position.set(x, 0, z);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return g;
  }

  function building(x, z, w, d, h) {
    const tex = canvasTex(256, (g, S) => {
      g.fillStyle = '#8c8f96'; g.fillRect(0, 0, S, S);
      for (let yy = 12; yy < S; yy += 40) for (let xx = 10; xx < S; xx += 36) {
        g.fillStyle = Math.random() < 0.25 ? '#f3d9a4' : '#3c4656';
        g.fillRect(xx, yy, 20, 26);
      }
    });
    tex.repeat.set(w / 12, h / 12);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }));
    m.position.set(x, h / 2, z);
    m.receiveShadow = true;
    return m;
  }

  function lamp(x, z, ry) {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 7, 10), mats.post);
    pole.position.y = 3.5;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.08), mats.post);
    arm.position.set(0.6, 6.9, 0);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.3), new THREE.MeshStandardMaterial({ color: 0xfff4d6, emissive: 0xffe2a8, emissiveIntensity: 0.6 }));
    head.position.set(1.2, 6.82, 0);
    g.add(pole, arm, head);
    g.position.set(x, 0, z); g.rotation.y = ry;
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return g;
  }

  function bench(x, z, ry) {
    const g = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2, 0.08, 0.45), mats.wood);
    seat.position.y = 0.45;
    const back = new THREE.Mesh(new THREE.BoxGeometry(2, 0.4, 0.06), mats.wood);
    back.position.set(0, 0.75, -0.2);
    g.add(seat, back);
    for (const sx of [-0.85, 0.85]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.4), mats.post);
      leg.position.set(sx, 0.225, 0);
      g.add(leg);
    }
    g.position.set(x, 0, z); g.rotation.y = ry;
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return g;
  }

  function build(scene) {
    const root = new THREE.Group();

    // Sol du park
    const W = BOUNDS.maxX - BOUNDS.minX, D = BOUNDS.maxZ - BOUNDS.minZ;
    const gGeo = new THREE.PlaneGeometry(W, D);
    gGeo.rotateX(-Math.PI / 2);
    const uvs = gGeo.attributes.uv;
    for (let i = 0; i < uvs.count; i++) uvs.setXY(i, uvs.getX(i) * W / 4, uvs.getY(i) * D / 4);
    const floor = new THREE.Mesh(gGeo, mats.ground);
    floor.position.set((BOUNDS.minX + BOUNDS.maxX) / 2, 0, (BOUNDS.minZ + BOUNDS.maxZ) / 2);
    floor.receiveShadow = true;
    root.add(floor);

    // Bordure + herbe autour
    const grass = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mats.grass);
    grass.rotation.x = -Math.PI / 2; grass.position.y = -0.03;
    grass.receiveShadow = true;
    root.add(grass);

    // Modules
    for (const el of elements) root.add(el.kind === 'pyramid' ? pyramidMesh(el) : profileMesh(el));
    for (const r of rails) railMesh(r, root);

    // Grillage périphérique
    const fenceH = 2.6;
    const sides = [
      [BOUNDS.minX, BOUNDS.minZ, BOUNDS.maxX, BOUNDS.minZ],
      [BOUNDS.maxX, BOUNDS.minZ, BOUNDS.maxX, BOUNDS.maxZ],
      [BOUNDS.maxX, BOUNDS.maxZ, BOUNDS.minX, BOUNDS.maxZ],
      [BOUNDS.minX, BOUNDS.maxZ, BOUNDS.minX, BOUNDS.minZ],
    ];
    for (const [x1, z1, x2, z2] of sides) {
      const len = Math.hypot(x2 - x1, z2 - z1);
      const t = fenceTex.clone(); t.needsUpdate = true;
      t.repeat.set(len / 0.12, fenceH / 0.12);
      const mat = mats.fence.clone(); mat.map = t;
      const p = new THREE.Mesh(new THREE.PlaneGeometry(len, fenceH), mat);
      p.position.set((x1 + x2) / 2, fenceH / 2, (z1 + z2) / 2);
      p.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
      root.add(p);
      const n = Math.ceil(len / 3);
      for (let i = 0; i <= n; i++) {
        const x = x1 + (x2 - x1) * i / n, z = z1 + (z2 - z1) * i / n;
        root.add(tube(new THREE.Vector3(x, 0, z), new THREE.Vector3(x, fenceH + 0.05, z), 0.04, mats.post));
      }
      root.add(tube(new THREE.Vector3(x1, fenceH, z1), new THREE.Vector3(x2, fenceH, z2), 0.03, mats.post));
    }

    // Mur à graffitis libre + graffitis sur les flancs plats
    const wall = new THREE.Mesh(new THREE.BoxGeometry(12, 2.8, 0.35), mats.side);
    wall.position.set(-30, 1.4, 44.5); wall.castShadow = wall.receiveShadow = true;
    root.add(wall);
    let seed = Math.floor(Math.random() * 100);
    root.add(graffitiPlane(5.5, 2.4, -32.8, 1.4, 44.31, Math.PI, seed++));
    root.add(graffitiPlane(5.5, 2.4, -27.2, 1.4, 44.31, Math.PI, seed++));
    root.add(graffitiPlane(4.8, 3.2, 21.49, 1.75, 41, -Math.PI / 2, seed++));   // tour (côté ouest)
    root.add(graffitiPlane(4.8, 3.2, 26.51, 1.75, 41, Math.PI / 2, seed++));    // tour (côté est)
    root.add(graffitiPlane(7.4, 0.9, -3.01, 0.5, 7, -Math.PI / 2, seed++));     // funbox
    root.add(graffitiPlane(7.4, 0.9, 3.01, 0.5, 7, Math.PI / 2, seed++));
    root.add(graffitiPlane(7.2, 1.0, -30.01, 0.6, 28, -Math.PI / 2, seed++));   // flanc de la plateforme

    // Décor : lampadaires, bancs, arbres, immeubles
    root.add(lamp(-40, -44, 0), lamp(40, -44, Math.PI), lamp(-40, 45, 0), lamp(40, 45, Math.PI), lamp(-40, 0, 0), lamp(40, 18, Math.PI));
    root.add(bench(10, 44.6, Math.PI), bench(14, 44.6, Math.PI), bench(-39.4, -28, Math.PI / 2));
    for (let i = 0; i < 46; i++) {
      const a = Math.random() * Math.PI * 2, r = 58 + Math.random() * 40;
      root.add(tree(Math.cos(a) * r, Math.sin(a) * r, 0.9 + Math.random() * 0.7));
    }
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * Math.PI * 2 + Math.random() * 0.2, r = 190 + Math.random() * 60;
      root.add(building(Math.cos(a) * r, Math.sin(a) * r, 18 + Math.random() * 18, 16 + Math.random() * 14, 14 + Math.random() * 26));
    }

    scene.add(root);
    return root;
  }

  return { ground, inBounds, rails, spawns, elements, BOUNDS, build };
})();

'use strict';
/* ===== Ville procédurale + parc de cascades + géométrie de collision =====
   Grille de 12 x 12 îlots (pas de 90 m, rues de 20 m), centre-ville dense,
   tunnel, half-pipe, loopings, tube à 360°, mur vertical, tremplins. */
window.buildCity = function (THREE, mergeGeometries, renderer, scene) {
  const V3 = THREE.Vector3;
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const R = rng(20261021);
  const ANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const N = 12, PITCH = 90, ROAD = 20, BLK = PITCH - ROAD, HALF = N * PITCH / 2, CURB = 0.12;
  const roadC = k => -HALF + k * PITCH;
  const blockC = i => -HALF + PITCH / 2 + i * PITCH;

  // ---------- Textures dessinées sur canvas ----------
  function tex(w, h, draw, srgb = true) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = ANISO;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  function speckle(g, w, h, n, base, amp, size = 1) {
    for (let i = 0; i < n; i++) {
      const v = base + (Math.random() - 0.5) * amp;
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.fillRect(Math.random() * w, Math.random() * h, size, size);
    }
  }
  const asphaltTex = tex(512, 512, (g, w, h) => {
    g.fillStyle = '#505257'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 26000, 82, 40, 2);
    g.globalAlpha = 0.08;
    for (let i = 0; i < 18; i++) { g.fillStyle = Math.random() < 0.5 ? '#000' : '#777'; g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 20 + Math.random() * 60, 10 + Math.random() * 30, Math.random() * 3, 0, 7); g.fill(); }
    g.globalAlpha = 1;
  });
  const sidewalkTex = tex(512, 512, (g, w, h) => {
    g.fillStyle = '#9c9a95'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 16000, 150, 30, 2);
    g.strokeStyle = 'rgba(40,40,40,.45)'; g.lineWidth = 3;
    for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); }
  });
  const grassTex = tex(512, 512, (g, w, h) => {
    g.fillStyle = '#3d5a2a'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 30000; i++) { const v = Math.random(); g.fillStyle = `rgb(${40 + v * 40 | 0},${70 + v * 50 | 0},${30 + v * 25 | 0})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 3); }
  });
  const concreteTex = tex(512, 512, (g, w, h) => {
    g.fillStyle = '#8e8e8a'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 20000, 140, 36, 2);
    g.globalAlpha = 0.07;
    for (let i = 0; i < 25; i++) { g.fillStyle = '#333'; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 10 + Math.random() * 50, 0, 7); g.fill(); }
    g.globalAlpha = 1;
    g.strokeStyle = 'rgba(50,50,50,.5)'; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2);
  });
  const roofTex = tex(256, 256, (g, w, h) => { g.fillStyle = '#4a4a4c'; g.fillRect(0, 0, w, h); speckle(g, w, h, 9000, 80, 50, 2); });
  const tubeTex = tex(512, 512, (g, w, h) => {
    g.fillStyle = '#c9cbcf'; g.fillRect(0, 0, w, h); speckle(g, w, h, 14000, 200, 30, 2);
    g.fillStyle = '#e8b21c'; g.fillRect(0, 0, 18, h); g.fillRect(w / 2, 0, 18, h);
    g.fillStyle = '#20242a'; for (let y = 0; y < h; y += 64) g.fillRect(0, y, 18, 32);
  });
  const glowTex = tex(128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,220,160,1)'); gr.addColorStop(0.4, 'rgba(255,190,120,.45)'); gr.addColorStop(1, 'rgba(255,170,90,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });

  // Façades : texture couleur + texture émissive (fenêtres allumées la nuit)
  const TILE = 14; // une tuile = 4 fenêtres x 4 étages
  function facade(style) {
    const W = 512, H = 512, cw = W / 4, ch = H / 4;
    const lit = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) lit.push(Math.random() < (style === 0 ? 0.32 : 0.42) ? ['#ffd59a', '#ffe9c2', '#fff4dc', '#cfe0ff', '#ffc477'][Math.random() * 5 | 0] : null);
    const rect = (r, c) => {
      if (style === 0) return [c * cw + 3, r * ch + 3, cw - 6, ch - 6];
      if (style === 1) return [c * cw + cw * 0.12, r * ch + ch * 0.28, cw * 0.76, ch * 0.5];
      if (style === 2) return [c * cw + cw * 0.25, r * ch + ch * 0.22, cw * 0.5, ch * 0.58];
      return [c * cw + cw * 0.32, r * ch + ch * 0.08, cw * 0.36, ch * 0.84];
    };
    const map = tex(W, H, (g) => {
      const base = ['#2c3a4a', '#b9ae9c', '#8a4a38', '#2b2d31'][style];
      g.fillStyle = base; g.fillRect(0, 0, W, H);
      if (style === 2) { // briques
        for (let y = 0; y < H; y += 8) for (let x = (y / 8 % 2) * 10; x < W; x += 20) { const v = Math.random() * 30 - 15; g.fillStyle = `rgb(${138 + v},${72 + v * 0.5},${54 + v * 0.4})`; g.fillRect(x, y, 18, 6); }
      } else speckle(g, W, H, 9000, style === 1 ? 175 : 50, 26, 2);
      if (style === 1) { g.fillStyle = 'rgba(0,0,0,.18)'; for (let r = 0; r < 4; r++) g.fillRect(0, r * ch + ch - 8, W, 8); }
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        const [x, y, w, h] = rect(r, c);
        if (style === 2) { g.fillStyle = '#e8e2d6'; g.fillRect(x - 5, y - 5, w + 10, h + 10); }
        const gr = g.createLinearGradient(x, y, x + w, y + h);
        const glass = style === 0 ? ['#3d5a78', '#1d2c3c'] : style === 3 ? ['#33404e', '#12161c'] : ['#4c6074', '#1a2330'];
        gr.addColorStop(0, glass[0]); gr.addColorStop(1, glass[1]);
        g.fillStyle = gr; g.fillRect(x, y, w, h);
        if (lit[r * 4 + c]) { g.fillStyle = 'rgba(255,230,190,.10)'; g.fillRect(x, y, w, h); }
        if (style === 0) { g.fillStyle = '#9aa6b2'; g.fillRect(x - 3, y - 3, w + 6, 3); g.fillRect(x - 3, y, 3, h); }
      }
    });
    const em = tex(W, H, (g) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        if (!lit[r * 4 + c]) continue;
        const [x, y, w, h] = rect(r, c);
        g.fillStyle = lit[r * 4 + c]; g.fillRect(x, y, w, h);
        g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x + w * (0.2 + Math.random() * 0.5), y, w * 0.08, h);
      }
    });
    return { map, em };
  }

  // ---------- Matériaux ----------
  // Matériaux légers (Lambert / Phong) pour les grandes surfaces : indispensable sur GPU intégré
  const facadeMats = [0, 1, 2, 3].map(s => {
    const f = facade(s);
    const o = { map: f.map, emissiveMap: f.em, emissive: 0xffffff, emissiveIntensity: 0, vertexColors: true };
    return s === 0 || s === 3
      ? new THREE.MeshPhongMaterial({ ...o, specular: s === 0 ? 0x8899aa : 0x444444, shininess: s === 0 ? 90 : 40 })
      : new THREE.MeshLambertMaterial(o);
  });
  const roofMat = new THREE.MeshLambertMaterial({ map: roofTex });
  const sidewalkMat = new THREE.MeshLambertMaterial({ map: sidewalkTex });
  const parkMat = new THREE.MeshLambertMaterial({ map: grassTex });
  const asphaltMat = new THREE.MeshLambertMaterial({ map: asphaltTex });
  const markMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const concreteMat = new THREE.MeshLambertMaterial({ map: concreteTex, side: THREE.DoubleSide });
  const tubeMat = new THREE.MeshLambertMaterial({ map: tubeTex, side: THREE.DoubleSide });
  const neonMats = [0x22d3ff, 0xff2bd6, 0xffb000, 0x39ff88].map(c => new THREE.MeshStandardMaterial({ color: 0x111111, emissive: c, emissiveIntensity: 1.2 }));
  const lampHeadMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, emissive: 0xffd9a0, emissiveIntensity: 0 });
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x2c2f33, roughness: 0.5, metalness: 0.7 });
  const railMat = new THREE.MeshStandardMaterial({ color: 0x2c2f33, roughness: 0.5, metalness: 0.7, side: THREE.DoubleSide });
  const poolMat = new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const aviationMat = new THREE.MeshStandardMaterial({ color: 0x220000, emissive: 0xff0000, emissiveIntensity: 2 });
  const acMat = new THREE.MeshStandardMaterial({ color: 0x8d9196, roughness: 0.6, metalness: 0.5 });
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a3626 });
  const leafMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
  const groundMat = new THREE.MeshLambertMaterial({ map: grassTex });

  // ---------- Constructeurs de géométrie ----------
  class GB {
    constructor() { this.p = []; this.n = []; this.uv = []; this.c = []; this.i = []; }
    // quad : origine o, vecteurs u (largeur) et v (hauteur), u x v = normale extérieure
    quad(o, u, v, uv0, uv1, col) {
      const k = this.p.length / 3;
      const n = new V3().crossVectors(u, v).normalize();
      const pts = [o, o.clone().add(u), o.clone().add(u).add(v), o.clone().add(v)];
      const uvs = [[uv0[0], uv0[1]], [uv1[0], uv0[1]], [uv1[0], uv1[1]], [uv0[0], uv1[1]]];
      for (let j = 0; j < 4; j++) {
        this.p.push(pts[j].x, pts[j].y, pts[j].z); this.n.push(n.x, n.y, n.z);
        this.uv.push(uvs[j][0], uvs[j][1]);
        this.c.push(col ? col.r : 1, col ? col.g : 1, col ? col.b : 1);
      }
      this.i.push(k, k + 1, k + 2, k, k + 2, k + 3);
    }
    build() {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
      g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
      g.setIndex(this.i);
      return g;
    }
  }
  // Collision : tous les triangles fusionnés (positions seules)
  const colParts = [];
  function colAdd(geo, matrix) {
    let g = geo.index ? geo.toNonIndexed() : geo.clone();
    for (const k of Object.keys(g.attributes)) if (k !== 'position') g.deleteAttribute(k);
    g.clearGroups();
    if (matrix) g.applyMatrix4(matrix);
    colParts.push(g);
  }
  function colBox(x0, y0, z0, x1, y1, z1) {
    const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    colAdd(g);
  }
  // Pavé avec faces latérales texturées en coordonnées monde
  function boxInto(sideGB, topGB, x0, y0, z0, x1, y1, z1, o = {}) {
    const W = x1 - x0, H = y1 - y0, D = z1 - z0, t = o.tile || 4, col = o.col;
    const ou = o.offU || 0, vy0 = (o.v0 !== undefined ? o.v0 : y0);
    const v0 = (y0 - vy0) / t, v1 = (y1 - vy0) / t;
    let run = ou;
    const faces = [
      [new V3(x0, y0, z1), new V3(W, 0, 0), W],
      [new V3(x1, y0, z1), new V3(0, 0, -D), D],
      [new V3(x1, y0, z0), new V3(-W, 0, 0), W],
      [new V3(x0, y0, z0), new V3(0, 0, D), D],
    ];
    if (sideGB) for (const [orig, u, len] of faces) {
      sideGB.quad(orig, u, new V3(0, H, 0), [run, v0], [run + len / t, v1], col);
      run += len / t;
    }
    if (topGB) {
      const tt = o.topTile || t;
      topGB.quad(new V3(x0, y1, z1), new V3(W, 0, 0), new V3(0, 0, -D), [x0 / tt, -z1 / tt], [x1 / tt, -z0 / tt], o.topCol);
    }
    if (o.collide !== false) colBox(x0, y0, z0, x1, y1, z1);
  }

  const facadeGB = [new GB(), new GB(), new GB(), new GB()];
  const roofGB = new GB(), slabSideGB = new GB(), slabTopGB = new GB(), parkTopGB = new GB(), markGB = new GB();
  const inst = { ac: [], tank: [], antenna: [], aviation: [], trunk: [], leaf: [], pole: [], pool: [] };
  const mapItems = { blocks: [], parks: [], stunts: [], tower: null };
  const stuntMeshes = new THREE.Group();
  scene.add(stuntMeshes);

  // ---------- Bâtiments ----------
  const tints = [
    [[0.85, 0.95, 1.1], [0.75, 0.85, 1.0], [0.95, 1.0, 1.05]],
    [[1, 1, 1], [1.05, 0.98, 0.9], [0.9, 0.92, 0.95], [1.1, 1.05, 0.95]],
    [[1, 1, 1], [0.85, 0.8, 0.8], [1.1, 0.95, 0.85]],
    [[1, 1, 1], [0.8, 0.85, 0.9], [1.1, 1.1, 1.1]],
  ];
  function building(x0, z0, x1, z1, h, style, noTiers = false, y0 = CURB) {
    const tl = tints[style][R() * tints[style].length | 0];
    const col = new THREE.Color(tl[0], tl[1], tl[2]);
    const offU = Math.floor(R() * 8), offV = 0;
    let top = y0 + h;
    boxInto(facadeGB[style], roofGB, x0, y0, z0, x1, top, z1, { tile: TILE, col, offU, v0: y0 - offV * TILE, topTile: 8 });
    // gradins pour les tours
    let bx0 = x0, bz0 = z0, bx1 = x1, bz1 = z1;
    if (!noTiers && h > 55 && R() < 0.55) {
      const tiers = 1 + (R() * 2 | 0);
      for (let k = 0; k < tiers; k++) {
        const ins = 2.5 + R() * 4;
        if (bx1 - bx0 < 2 * ins + 8 || bz1 - bz0 < 2 * ins + 8) break;
        bx0 += ins; bz0 += ins; bx1 -= ins; bz1 -= ins;
        const th = 10 + R() * h * 0.35;
        boxInto(facadeGB[style], roofGB, bx0, top, bz0, bx1, top + th, bz1, { tile: TILE, col, offU: offU + 3, v0: y0, topTile: 8 });
        top += th;
      }
    }
    // équipements de toit
    const cx = (bx0 + bx1) / 2, cz = (bz0 + bz1) / 2, w = bx1 - bx0, d = bz1 - bz0;
    const nAc = 1 + (R() * 3 | 0);
    for (let k = 0; k < nAc; k++) {
      const sx = 2 + R() * 3, sy = 1 + R() * 1.5, sz = 2 + R() * 3;
      const px = cx + (R() - 0.5) * (w - sx - 2), pz = cz + (R() - 0.5) * (d - sz - 2);
      inst.ac.push([px, top + sy / 2, pz, sx, sy, sz]);
      colBox(px - sx / 2, top, pz - sz / 2, px + sx / 2, top + sy, pz + sz / 2);
    }
    if (R() < 0.3 && style !== 0) inst.tank.push([cx + w * 0.25, top, cz - d * 0.2, 1.6 + R(), 3 + R() * 2]);
    if (top > 70) {
      const ah = 6 + R() * 18;
      inst.antenna.push([cx, top, cz, ah]);
      inst.aviation.push([cx, top + ah, cz]);
    }
    return top;
  }

  function slab(cx, cz, half, park) {
    boxInto(slabSideGB, park ? parkTopGB : slabTopGB, cx - half, 0, cz - half, cx + half, CURB, cz + half, { tile: 4, topTile: park ? 8 : 4 });
  }

  function tree(x, z, s) {
    const h = (3 + R() * 2) * s;
    inst.trunk.push([x, 0, z, s, h]);
    const c = new THREE.Color().setHSL(0.24 + R() * 0.1, 0.45 + R() * 0.2, 0.2 + R() * 0.12);
    inst.leaf.push([x, h + 1.2 * s, z, (2.2 + R() * 1.2) * s, c]);
  }

  // ---------- Éléments de cascade ----------
  function placeMesh(geo, mat, matrix, collide = true, shadow = true) {
    const m = new THREE.Mesh(geo, mat);
    if (matrix) { m.applyMatrix4(matrix); }
    m.castShadow = shadow; m.receiveShadow = true;
    stuntMeshes.add(m);
    if (collide) { m.updateMatrix(); colAdd(geo, m.matrix); }
    return m;
  }
  const mat4 = (x, y, z, ry = 0) => new THREE.Matrix4().compose(new V3(x, y, z), new THREE.Quaternion().setFromAxisAngle(new V3(0, 1, 0), ry), new V3(1, 1, 1));
  function extrude(shape, depth, segs = 24) {
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: segs, steps: 1 });
    // UV en mètres -> texture de 8 m
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 8, uv.getY(i) / 8);
    return g;
  }
  function neonLine(points, mat, r = 0.12) {
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), Math.max(8, points.length * 2), r, 6), mat);
    stuntMeshes.add(m);
    return m;
  }

  // Tunnel à section arrondie (sans plancher : le sol sert de route), axe le long de X
  function tunnel(x0, z, length, W, H, rc, y0 = 0, outerW = W + 4, outerH = H + 2, slope = 0) {
    const s = new THREE.Shape();
    const ow = outerW / 2, hw = W / 2;
    s.moveTo(-ow - slope, y0 - 0.05);
    s.lineTo(-ow, outerH);
    s.lineTo(ow, outerH);
    s.lineTo(ow + slope, y0 - 0.05);
    s.lineTo(hw - rc, y0 - 0.05);
    s.absarc(hw - rc, y0 - 0.05 + rc, rc, -Math.PI / 2, 0, false);
    s.lineTo(hw, H - rc);
    s.absarc(hw - rc, H - rc, rc, 0, Math.PI / 2, false);
    s.lineTo(-hw + rc, H);
    s.absarc(-hw + rc, H - rc, rc, Math.PI / 2, Math.PI, false);
    s.lineTo(-hw, y0 - 0.05 + rc);
    s.absarc(-hw + rc, y0 - 0.05 + rc, rc, Math.PI, Math.PI * 1.5, false);
    s.lineTo(-ow - slope, y0 - 0.05);
    const g = extrude(s, length, 16);
    g.rotateY(Math.PI / 2); // extrusion +Z -> +X ; forme x -> -Z
    placeMesh(g, concreteMat, mat4(x0, 0, z));
    // bandeaux lumineux au plafond et sur les murs
    neonLine([new V3(x0 + 2, H - 0.15, z), new V3(x0 + length - 2, H - 0.15, z)], neonMats[0], 0.1);
    neonLine([new V3(x0 + 2, H * 0.55, z - hw + 0.12), new V3(x0 + length - 2, H * 0.55, z - hw + 0.12)], neonMats[1], 0.07);
    neonLine([new V3(x0 + 2, H * 0.55, z + hw - 0.12), new V3(x0 + length - 2, H * 0.55, z + hw - 0.12)], neonMats[1], 0.07);
    mapItems.stunts.push({ type: 'rect', x0, z0: z - outerW / 2 - slope, x1: x0 + length, z1: z + outerW / 2 + slope, label: 'Tunnel' });
  }

  // Half-pipe : deux ailes extrudées, axe le long de X
  function halfPipe(x0, z, length, flat, rad, ext, deck, y0 = 0) {
    const wing = (sg) => {
      const s = new THREE.Shape();
      const a = flat / 2, b = a + rad;
      s.moveTo(sg * (b + deck), y0);
      s.lineTo(sg * (b + deck), y0 + rad + ext);
      s.lineTo(sg * b, y0 + rad + ext);
      s.lineTo(sg * b, y0 + rad);
      const pts = [];
      for (let i = 0; i <= 24; i++) { const t = i / 24 * Math.PI / 2; pts.push([sg * (a + rad * Math.sin(Math.PI / 2 - t) * 1), y0 + rad - rad * Math.cos(Math.PI / 2 - t)]); }
      // de (b, rad) vers (a, 0)
      for (let i = 0; i <= 24; i++) { const t = i / 24 * Math.PI / 2; s.lineTo(sg * (a + rad * Math.cos(t)), y0 + rad - rad * Math.sin(t)); }
      s.lineTo(sg * (b + deck), y0);
      return s;
    };
    for (const sg of [-1, 1]) {
      const sh = wing(sg);
      const g = extrude(sh, length, 24);
      g.rotateY(Math.PI / 2);
      placeMesh(g, concreteMat, mat4(x0, 0, z));
      const zc = z - sg * (flat / 2 + rad);
      neonLine([new V3(x0, y0 + rad + ext + 0.12, zc), new V3(x0 + length, y0 + rad + ext + 0.12, zc)], neonMats[2], 0.12);
    }
    const ow = flat / 2 + rad + deck;
    mapItems.stunts.push({ type: 'rect', x0, z0: z - ow, x1: x0 + length, z1: z + ow, label: 'Half-pipe' });
  }

  // Looping : ruban hélicoïdal ; entrée en roulant vers -Z au point (x, z)
  function loop(x, z, Rl, width, shift, y0 = 0, mat = concreteMat) {
    const segs = 160, pos = [], nor = [], uv = [], idx = [];
    for (let i = 0; i <= segs; i++) {
      const a = -0.35 + (Math.PI * 2 + 0.7) * i / segs;
      const aa = Math.min(Math.max(a, 0), Math.PI * 2);
      const lat = shift * (aa / (Math.PI * 2));
      let py, pz, ny, nz;
      if (a < 0) { py = 0; pz = -Rl * a; ny = 1; nz = 0; } // prolongement plat
      else if (a > Math.PI * 2) { py = 0; pz = -Rl * (a - Math.PI * 2); ny = 1; nz = 0; }
      else { py = Rl - Rl * Math.cos(a); pz = -Rl * Math.sin(a); ny = Math.cos(a); nz = Math.sin(a); }
      for (const s of [-1, 1]) {
        pos.push(x + lat + s * width / 2, y0 + py + 0.02, z + pz);
        nor.push(0, ny, nz);
        uv.push((s + 1) * width / 16, i * Rl * 0.05);
      }
    }
    for (let i = 0; i < segs; i++) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    placeMesh(g, mat, null);
    // rails latéraux : ils guident la voiture le long du décalage hélicoïdal
    for (const side of [0, 1]) {
      const rp = [], ri = [];
      for (let i = 0; i <= segs; i++) {
        const k = (i * 2 + side) * 3, nx = nor[k], ny = nor[k + 1], nz = nor[k + 2];
        const x0 = pos[k], y0r = pos[k + 1], z0r = pos[k + 2];
        rp.push(x0, y0r, z0r, x0 + nx * 1.1, y0r + ny * 1.1, z0r + nz * 1.1);
      }
      for (let i = 0; i < segs; i++) { const k = i * 2; ri.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
      const rg = new THREE.BufferGeometry();
      rg.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3));
      rg.setIndex(ri); rg.computeVertexNormals();
      placeMesh(rg, railMat, null, true, false);
    }
    // bords lumineux
    for (const s of [-1, 1]) {
      const pts = [];
      for (let i = 0; i <= 64; i++) {
        const a = (Math.PI * 2) * i / 64, lat = shift * (a / (Math.PI * 2));
        pts.push(new V3(x + lat + s * width / 2, y0 + Rl - Rl * Math.cos(a) + 1.15 * Math.cos(a), z - Rl * Math.sin(a) + 1.15 * Math.sin(a)));
      }
      neonLine(pts, neonMats[3], 0.12);
    }
    // piliers
    for (const a of [Math.PI * 0.75, Math.PI, Math.PI * 1.25]) {
      const lat = shift * (a / (Math.PI * 2));
      const py = Rl - Rl * Math.cos(a), pz = -Rl * Math.sin(a);
      for (const s of [-1, 1]) {
        const h = py + 0.5;
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, h, 10), poleMat);
        p.position.set(x + lat + s * (width / 2 + 1.2), y0 + h / 2, z + pz);
        p.castShadow = true; stuntMeshes.add(p);
      }
    }
    mapItems.stunts.push({ type: 'rect', x0: x - width / 2, z0: z - Rl - 2, x1: x + shift + width / 2, z1: z + Rl + 2, label: 'Looping' });
  }

  // Tube complet (rouler à 360°), axe le long de X, posé sur le sol
  function tube(x0, z, length, Rt) {
    const g = new THREE.CylinderGeometry(Rt, Rt, length, 64, 1, true);
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (2 * Math.PI * Rt) / 10, uv.getY(i) * length / 10);
    g.rotateZ(Math.PI / 2);
    placeMesh(g, tubeMat, mat4(x0 + length / 2, Rt, z));
    for (let x = x0; x <= x0 + length + 0.1; x += 20) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(Rt + 0.35, 0.35, 8, 48), poleMat);
      ring.rotation.y = Math.PI / 2; ring.position.set(x, Rt, z); ring.castShadow = true; stuntMeshes.add(ring);
      const ringN = new THREE.Mesh(new THREE.TorusGeometry(Rt + 0.72, 0.08, 6, 48), neonMats[0]);
      ringN.rotation.y = Math.PI / 2; ringN.position.set(x, Rt, z); stuntMeshes.add(ringN);
    }
    // bandeaux intérieurs
    for (const a of [Math.PI / 2, Math.PI * 0.15, Math.PI * 0.85]) {
      const r = Rt - 0.06;
      neonLine([new V3(x0 + 1, Rt + Math.sin(a) * r, z + Math.cos(a) * r), new V3(x0 + length - 1, Rt + Math.sin(a) * r, z + Math.cos(a) * r)], neonMats[1], 0.06);
    }
    mapItems.stunts.push({ type: 'rect', x0, z0: z - Rt, x1: x0 + length, z1: z + Rt, label: 'Tube 360°' });
  }

  // Tremplin à profil parabolique, monte vers +X (rotation ry possible)
  function kicker(x, z, L, h, width, ry = 0, curved = true) {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    for (let i = 1; i <= 20; i++) { const u = i / 20; s.lineTo(u * L, h * (curved ? u * u : u)); }
    s.lineTo(L + 0.6, h); s.lineTo(L + 0.6, 0); s.lineTo(0, 0);
    const g = extrude(s, width, 12);
    g.translate(0, 0, -width / 2);
    placeMesh(g, concreteMat, mat4(x, 0, z, ry));
    const c = Math.cos(ry), sn = Math.sin(ry);
    const p = (a, b, y) => new V3(x + a * c + b * sn, y, z - a * sn + b * c);
    neonLine([p(L + 0.3, -width / 2, h + 0.1), p(L + 0.3, width / 2, h + 0.1)], neonMats[2], 0.1);
    mapItems.stunts.push({ type: 'pt', x, z, label: '' });
  }

  // Mur vertical avec quarter-pipe à sa base, face vers -X
  function wallRide(x, z0, length, height, rq) {
    const s = new THREE.Shape();
    s.moveTo(-rq, 0);
    for (let i = 1; i <= 28; i++) { const t = i / 28 * Math.PI / 2; s.lineTo(-rq + rq * Math.sin(t), rq - rq * Math.cos(t)); }
    s.lineTo(0, height); s.lineTo(8, height); s.lineTo(8, 0); s.lineTo(-rq, 0);
    const g = extrude(s, length, 24);
    placeMesh(g, concreteMat, mat4(x, 0, z0));
    for (const y of [height * 0.33, height * 0.66, height - 0.3])
      neonLine([new V3(x - 0.08, y, z0 + 2), new V3(x - 0.08, y, z0 + length - 2)], neonMats[y > height * 0.9 ? 0 : 1], 0.1);
    mapItems.stunts.push({ type: 'rect', x0: x - rq, z0, x1: x + 8, z1: z0 + length, label: 'Mur' });
  }

  // ---------- Îlots ----------
  const special = {
    '6,5': 'halfpipe', '5,6': 'tower', '5,4': 'loop', '7,6': 'tunnel', '4,7': 'park', '8,3': 'park', '2,9': 'park', '9,8': 'park',
  };
  const centerDist = (x, z) => Math.hypot(x, z) / (HALF * 1.2);
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const cx = blockC(i), cz = blockC(j), half = BLK / 2;
    let type = special[i + ',' + j] || (R() < 0.06 ? 'park' : 'city');
    if (type === 'park') {
      slab(cx, cz, half, true);
      mapItems.parks.push([cx, cz, half]);
      for (let k = 0; k < 26; k++) tree(cx + (R() - 0.5) * (BLK - 8), cz + (R() - 0.5) * (BLK - 8), 0.9 + R() * 0.6);
      continue;
    }
    if (type === 'tunnel') {
      // colline-tunnel : rampes latérales à 30° pour monter dessus
      tunnel(cx - half, cz, BLK, 16, 9, 5, 0, 26, 12, 22);
      const tg = new THREE.PlaneGeometry(BLK, 26), tuv = tg.attributes.uv;
      for (let k = 0; k < tuv.count; k++) tuv.setXY(k, tuv.getX(k) * BLK / 8, tuv.getY(k) * 26 / 8);
      const top = new THREE.Mesh(tg, parkMat);
      top.rotation.x = -Math.PI / 2; top.position.set(cx, 12.03, cz); top.receiveShadow = true; stuntMeshes.add(top);
      for (let k = 0; k < 8; k++) { const t = new V3(cx + (R() - 0.5) * (BLK - 10), 0, cz + (R() - 0.5) * 18); inst.trunk.push([t.x, 12, t.z, 0.9, 3]); inst.leaf.push([t.x, 12 + 4.2, t.z, 2.4, new THREE.Color(0x2f5a24)]); }
      continue;
    }
    slab(cx, cz, half, false);
    mapItems.blocks.push([cx, cz, half, 0.25]);
    if (type === 'halfpipe') {
      halfPipe(cx - half + 4, cz, BLK - 8, 14, 8, 2.5, 3, CURB);
      continue;
    }
    if (type === 'loop') {
      loop(cx - 8, cz + 18, 15, 10, 14, CURB);
      kicker(cx + 20, cz - 22, 8, 2, 8, -Math.PI / 2);
      continue;
    }
    if (type === 'tower') {
      const t = 22;
      building(cx - t, cz - t, cx + t, cz + t, 175, 0, true);
      // couronne de la tour signal
      boxInto(facadeGB[3], roofGB, cx - t + 6, CURB + 175, cz - t + 6, cx + t - 6, CURB + 225, cz + t - 6, { tile: TILE, v0: CURB });
      boxInto(facadeGB[0], roofGB, cx - 9, CURB + 225, cz - 9, cx + 9, CURB + 262, cz + 9, { tile: TILE, v0: CURB });
      inst.antenna.push([cx, CURB + 262, cz, 40]);
      inst.aviation.push([cx, CURB + 302, cz]);
      mapItems.tower = [cx, cz];
      continue;
    }
    const d = centerDist(cx, cz);
    const tall = () => 10 + R() * 22 + Math.pow(Math.max(0, 1 - d), 2.2) * (30 + R() * 150);
    const styleFor = (h) => h > 70 ? (R() < 0.6 ? 0 : 3) : h > 35 ? [0, 1, 3][R() * 3 | 0] : [1, 2, 2, 3][R() * 4 | 0];
    const inner = half - 4;
    if (R() < 0.22) {
      const h = tall() * 1.15, m = 2 + R() * 5;
      building(cx - inner + m, cz - inner + m, cx + inner - m, cz + inner - m, h, styleFor(h));
    } else {
      for (const qx of [-1, 1]) for (const qz of [-1, 1]) {
        if (R() < 0.08) { tree(cx + qx * inner / 2, cz + qz * inner / 2, 1.2); continue; }
        const lx0 = qx < 0 ? cx - inner : cx, lx1 = qx < 0 ? cx : cx + inner;
        const lz0 = qz < 0 ? cz - inner : cz, lz1 = qz < 0 ? cz : cz + inner;
        const m = () => 1 + R() * 4;
        const h = tall();
        building(lx0 + m(), lz0 + m(), lx1 - m(), lz1 - m(), h, styleFor(h));
      }
    }
  }

  // ---------- Rues : marquages, lampadaires, arbres ----------
  const yellow = new THREE.Color(0xd6aa22), white = new THREE.Color(0xd8d8d8);
  const markQuadX = (x0, x1, z, w, col) => markGB.quad(new V3(x0, 0.03, z + w / 2), new V3(x1 - x0, 0, 0), new V3(0, 0, -w), [0, 0], [1, 1], col);
  const markQuadZ = (z0, z1, x, w, col) => markGB.quad(new V3(x - w / 2, 0.03, z1), new V3(w, 0, 0), new V3(0, 0, z0 - z1), [0, 0], [1, 1], col);
  for (let k = 0; k <= N; k++) {
    const rc = roadC(k);
    for (let s = 0; s < N; s++) {
      const a = roadC(s) + ROAD / 2, b = roadC(s + 1) - ROAD / 2;
      // route le long de X (z = rc) puis le long de Z (x = rc)
      for (const axis of ['x', 'z']) {
        const q = axis === 'x' ? markQuadX : markQuadZ;
        q(a + 5, b - 5, rc - 0.18, 0.14, yellow); q(a + 5, b - 5, rc + 0.18, 0.14, yellow);
        for (const off of [-9.2, 9.2]) q(a, b, rc + off, 0.18, white);
        for (const off of [-4.6, 4.6]) for (let u = a + 6; u < b - 6; u += 9) q(u, u + 4.5, rc + off, 0.14, white);
        // passages piétons aux deux extrémités
        for (const [e, dir] of [[a, 1], [b, -1]]) {
          for (let t = -8.4; t <= 8.4; t += 1.2) {
            if (axis === 'x') markQuadX(Math.min(e + dir * 0.8, e + dir * 3.8), Math.max(e + dir * 0.8, e + dir * 3.8), rc + t, 0.6, white);
            else markQuadZ(Math.min(e + dir * 0.8, e + dir * 3.8), Math.max(e + dir * 0.8, e + dir * 3.8), rc + t, 0.6, white);
          }
        }
        // lampadaires + arbres d'alignement
        for (const side of [-1, 1]) for (const u of [a + 18, b - 18]) {
          const off = rc + side * (ROAD / 2 + 1.0);
          const [px, pz] = axis === 'x' ? [u, off] : [off, u];
          const [dx, dz] = axis === 'x' ? [0, -side] : [-side, 0];
          inst.pole.push([px, pz, dx, dz]);
          inst.pool.push([px + dx * 3, pz + dz * 3]);
        }
        for (const side of [-1, 1]) if (R() < 0.7) {
          const u = (a + b) / 2 + (R() - 0.5) * 8, off = rc + side * (ROAD / 2 + 2.2);
          const [px, pz] = axis === 'x' ? [u, off] : [off, u];
          // ne pas planter sur les îlots spéciaux
          tree(px, pz, 0.8 + R() * 0.3);
          inst.trunk[inst.trunk.length - 1][1] = CURB; inst.leaf[inst.leaf.length - 1][1] += CURB;
        }
      }
    }
  }

  // ---------- Parc de cascades (est de la ville) ----------
  const PARK = { x0: HALF + 30, x1: HALF + 540, z0: -380, z1: 380 };
  tube(PARK.x0 + 50, -270, 170, 11);
  tunnel(PARK.x0 + 50, -150, 220, 24, 13, 6, 0, 30, 15, 0);
  loop(PARK.x0 + 330, -110, 22, 16, 20);
  halfPipe(PARK.x0 + 50, 40, 150, 18, 10, 4, 5);
  kicker(PARK.x0 + 240, 40, 40, 14, 16, 0);
  // tremplin de réception
  {
    const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(24, 9); for (let i = 1; i <= 20; i++) { const u = i / 20; s.lineTo(24 + u * 50, 9 * (1 - u) * (1 - u)); } s.lineTo(0, 0);
    const g = extrude(s, 22, 12); g.translate(0, 0, -11);
    placeMesh(g, concreteMat, mat4(PARK.x0 + 345, 0, 40));
  }
  wallRide(PARK.x1 - 10, -360, 720, 45, 10);
  for (const [x, z, ry, L, h] of [[PARK.x0 + 60, 200, 0, 10, 2.5], [PARK.x0 + 110, 230, 0.6, 12, 3.5], [PARK.x0 + 170, 190, -0.4, 10, 3], [PARK.x0 + 230, 260, Math.PI / 2, 14, 4.5], [PARK.x0 + 300, 210, Math.PI, 12, 3.5], [PARK.x0 + 380, 280, -Math.PI / 2, 10, 2.5], [PARK.x0 + 400, 180, 0.3, 16, 6], [PARK.x0 + 260, 330, 0, 12, 4]])
    kicker(x, z, L, h, 10, ry);
  // grande colline-tunnel praticable dessus
  tunnel(PARK.x0 + 330, -300, 90, 18, 10, 5, 0, 28, 16, 30);

  // ---------- Sols ----------
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), groundMat);
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.08; ground.receiveShadow = true;
  groundMat.map = grassTex.clone(); groundMat.map.repeat.set(900, 900); groundMat.map.needsUpdate = true;
  scene.add(ground);
  const asph = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2 + ROAD, HALF * 2 + ROAD), asphaltMat);
  asphaltMat.map.repeat.set((HALF * 2 + ROAD) / 10, (HALF * 2 + ROAD) / 10);
  asph.rotation.x = -Math.PI / 2; asph.position.y = 0.0; asph.receiveShadow = true; scene.add(asph);
  // bretelle vers le parc
  const link = new THREE.Mesh(new THREE.PlaneGeometry(PARK.x0 - HALF + 2, 20), asphaltMat);
  link.rotation.x = -Math.PI / 2; link.position.set((HALF + PARK.x0) / 2, 0.035, 0); link.receiveShadow = true; scene.add(link);
  const padMat = concreteMat.clone(); padMat.side = THREE.FrontSide; padMat.map = concreteTex.clone(); padMat.map.repeat.set((PARK.x1 - PARK.x0) / 10, (PARK.z1 - PARK.z0) / 10); padMat.map.needsUpdate = true;
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(PARK.x1 - PARK.x0, PARK.z1 - PARK.z0), padMat);
  pad.rotation.x = -Math.PI / 2; pad.position.set((PARK.x0 + PARK.x1) / 2, 0.02, 0); pad.receiveShadow = true; scene.add(pad);
  // sol de collision
  {
    const g = new THREE.PlaneGeometry(9000, 9000); g.rotateX(-Math.PI / 2); colAdd(g);
  }

  // ---------- Maillages fusionnés ----------
  const addGB = (gb, mat, cast = true) => { const m = new THREE.Mesh(gb.build(), mat); m.castShadow = cast; m.receiveShadow = true; scene.add(m); return m; };
  facadeGB.forEach((gb, s) => addGB(gb, facadeMats[s]));
  addGB(roofGB, roofMat);
  addGB(slabSideGB, sidewalkMat, false);
  addGB(slabTopGB, sidewalkMat, false);
  addGB(parkTopGB, parkMat, false);
  addGB(markGB, markMat, false);

  // ---------- Instances ----------
  const dummy = new THREE.Object3D();
  function instanced(geo, mat, list, setter, cast = true) {
    if (!list.length) return null;
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((it, k) => { setter(it, dummy, k, im); dummy.updateMatrix(); im.setMatrixAt(k, dummy.matrix); });
    im.castShadow = cast; im.receiveShadow = true;
    im.instanceMatrix.needsUpdate = true;
    scene.add(im);
    return im;
  }
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  instanced(unitBox, acMat, inst.ac, ([x, y, z, sx, sy, sz], d) => { d.position.set(x, y, z); d.scale.set(sx, sy, sz); d.rotation.set(0, 0, 0); });
  const tankGeo = new THREE.CylinderGeometry(1, 1, 1, 14); tankGeo.translate(0, 0.5, 0);
  instanced(tankGeo, poleMat, inst.tank, ([x, y, z, r, h], d) => { d.position.set(x, y, z); d.scale.set(r, h, r); });
  const antGeo = new THREE.CylinderGeometry(0.08, 0.25, 1, 6); antGeo.translate(0, 0.5, 0);
  instanced(antGeo, poleMat, inst.antenna, ([x, y, z, h], d) => { d.position.set(x, y, z); d.scale.set(1, h, 1); });
  instanced(new THREE.SphereGeometry(0.4, 8, 6), aviationMat, inst.aviation, ([x, y, z], d) => { d.position.set(x, y, z); d.scale.set(1, 1, 1); }, false);
  const trunkGeo = new THREE.CylinderGeometry(0.12, 0.2, 1, 6); trunkGeo.translate(0, 0.5, 0);
  instanced(trunkGeo, trunkMat, inst.trunk, ([x, y, z, s, h], d) => { d.position.set(x, y, z); d.scale.set(s, h, s); });
  const leafIM = instanced(new THREE.IcosahedronGeometry(1, 1), leafMat, inst.leaf, ([x, y, z, s, c], d, k, im) => { d.position.set(x, y, z); d.scale.set(s, s * 1.15, s); d.rotation.set(0, k, 0); im.setColorAt(k, c); });
  if (leafIM) leafIM.instanceColor.needsUpdate = true;
  dummy.rotation.set(0, 0, 0);
  const poleGeo = new THREE.CylinderGeometry(0.09, 0.14, 8, 8); poleGeo.translate(0, 4, 0);
  instanced(poleGeo, poleMat, inst.pole, ([x, z], d) => { d.position.set(x, CURB, z); d.scale.set(1, 1, 1); d.rotation.set(0, 0, 0); });
  const armGeo = new THREE.BoxGeometry(0.12, 0.12, 2.6); armGeo.translate(0, 8, 1.3);
  instanced(armGeo, poleMat, inst.pole, ([x, z, dx, dz], d) => { d.position.set(x, CURB, z); d.rotation.set(0, Math.atan2(dx, dz), 0); });
  const headGeo = new THREE.BoxGeometry(0.5, 0.14, 0.9); headGeo.translate(0, 7.88, 2.6);
  instanced(headGeo, lampHeadMat, inst.pole, ([x, z, dx, dz], d) => { d.position.set(x, CURB, z); d.rotation.set(0, Math.atan2(dx, dz), 0); }, false);
  const poolGeo = new THREE.PlaneGeometry(18, 18); poolGeo.rotateX(-Math.PI / 2);
  const poolIM = instanced(poolGeo, poolMat, inst.pool, ([x, z], d) => { d.position.set(x, 0.06, z); d.rotation.set(0, 0, 0); }, false);
  if (poolIM) { poolIM.receiveShadow = false; poolIM.renderOrder = 2; }

  // ---------- Collision ----------
  const colGeom = mergeGeometries(colParts, false);

  // ---------- Image de la mini-carte ----------
  const MAP = { x0: -HALF - 60, x1: PARK.x1 + 40, z0: -HALF - 60, z1: HALF + 60, ppm: 1 };
  const mapCanvas = document.createElement('canvas');
  mapCanvas.width = (MAP.x1 - MAP.x0) * MAP.ppm; mapCanvas.height = (MAP.z1 - MAP.z0) * MAP.ppm;
  {
    const g = mapCanvas.getContext('2d');
    const X = x => (x - MAP.x0) * MAP.ppm, Z = z => (z - MAP.z0) * MAP.ppm;
    g.fillStyle = '#16301d'; g.fillRect(0, 0, mapCanvas.width, mapCanvas.height);
    g.fillStyle = '#3a3f47'; g.fillRect(X(-HALF - ROAD / 2), Z(-HALF - ROAD / 2), (HALF * 2 + ROAD) * MAP.ppm, (HALF * 2 + ROAD) * MAP.ppm);
    g.fillRect(X(HALF), Z(-10), (PARK.x0 - HALF) * MAP.ppm, 20 * MAP.ppm);
    g.fillStyle = '#4a4e55'; g.fillRect(X(PARK.x0), Z(PARK.z0), (PARK.x1 - PARK.x0) * MAP.ppm, (PARK.z1 - PARK.z0) * MAP.ppm);
    g.fillStyle = '#1b1f25';
    for (const [cx, cz, h] of mapItems.blocks) g.fillRect(X(cx - h), Z(cz - h), 2 * h * MAP.ppm, 2 * h * MAP.ppm);
    g.fillStyle = '#245c30';
    for (const [cx, cz, h] of mapItems.parks) g.fillRect(X(cx - h), Z(cz - h), 2 * h * MAP.ppm, 2 * h * MAP.ppm);
    g.strokeStyle = '#ffb000'; g.fillStyle = 'rgba(255,176,0,.35)'; g.lineWidth = 3;
    for (const s of mapItems.stunts) {
      if (s.type === 'rect') { g.fillRect(X(s.x0), Z(s.z0), (s.x1 - s.x0) * MAP.ppm, (s.z1 - s.z0) * MAP.ppm); g.strokeRect(X(s.x0), Z(s.z0), (s.x1 - s.x0) * MAP.ppm, (s.z1 - s.z0) * MAP.ppm); }
      else { g.beginPath(); g.arc(X(s.x), Z(s.z), 6, 0, 7); g.fill(); }
    }
    if (mapItems.tower) { g.fillStyle = '#22d3ff'; g.fillRect(X(mapItems.tower[0] - 22), Z(mapItems.tower[1] - 22), 44, 44); }
  }

  const spawn = { pos: new V3(4.6, 0, 70), yaw: 0 };

  return {
    colGeom, spawn, mapCanvas, MAP, N, PITCH, ROAD, HALF, CURB, roadC, PARK,
    night: { facadeMats, lampHeadMat, poolMat, neonMats, aviationMat, pools: poolIM },
  };
};

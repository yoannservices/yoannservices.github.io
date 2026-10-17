/* ═══════════════════════════════════════════════════════════
   SIMULATEUR TRAIN — MODÈLES 3D DES VÉHICULES
   Repère local : avant vers +z, rail à y = 0, centré en z.
   Les pièces statiques sont fusionnées par matériau.
   ═══════════════════════════════════════════════════════════ */
'use strict';

TS.Models = (function () {
  const T = THREE;
  const mats = {};
  function mat(color, kind) {
    const k = color + (kind || '');
    if (mats[k]) return mats[k];
    let m;
    if (kind === 'glass') m = new T.MeshPhongMaterial({ color, shininess: 90, specular: 0x667788 });
    else if (kind === 'emit') m = new T.MeshBasicMaterial({ color });
    else if (kind === 'metal') m = new T.MeshPhongMaterial({ color, shininess: 60, specular: 0x555555 });
    else if (kind === 'paint') m = new T.MeshPhongMaterial({ color, shininess: 35, specular: 0x333333 });
    else m = new T.MeshLambertMaterial({ color });
    m.userData.key = k;
    return (mats[k] = m);
  }
  TS.mat = mat;
  const texCache = {};

  /* ── Fusion des géométries par matériau ── */
  function merge(group) {
    group.updateMatrixWorld(true);
    const buckets = new Map();
    const keep = [];
    group.traverse(o => {
      if (!o.isMesh) return;
      if (o.userData.keep) { keep.push(o); return; }
      const key = o.material.uuid;
      if (!buckets.has(key)) buckets.set(key, { m: o.material, list: [] });
      buckets.get(key).list.push(o);
    });
    const out = new T.Group();
    buckets.forEach(({ m, list }) => {
      let total = 0;
      const geos = list.map(o => {
        let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
        g.applyMatrix4(o.matrixWorld);
        total += g.attributes.position.count;
        return g;
      });
      const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), uv = new Float32Array(total * 2);
      let off = 0;
      geos.forEach(g => {
        pos.set(g.attributes.position.array, off * 3);
        if (g.attributes.normal) nor.set(g.attributes.normal.array, off * 3);
        if (g.attributes.uv) uv.set(g.attributes.uv.array, off * 2);
        off += g.attributes.position.count;
        g.dispose();
      });
      const bg = new T.BufferGeometry();
      bg.setAttribute('position', new T.BufferAttribute(pos, 3));
      bg.setAttribute('normal', new T.BufferAttribute(nor, 3));
      bg.setAttribute('uv', new T.BufferAttribute(uv, 2));
      bg.computeBoundingSphere();
      const mesh = new T.Mesh(bg, m);
      out.add(mesh);
    });
    keep.forEach(o => {
      const p = o.parent; o.updateMatrixWorld(true);
      const w = new T.Matrix4().copy(o.matrixWorld);
      p.remove(o);
      w.decompose(o.position, o.quaternion, o.scale);
      out.add(o);
    });
    return out;
  }

  const box = (w, h, d, m, x, y, z, g) => { const o = new T.Mesh(new T.BoxGeometry(w, h, d), m); o.position.set(x, y, z); if (g) g.add(o); return o; };
  const cyl = (r, h, m, seg) => new T.Mesh(new T.CylinderGeometry(r, r, h, seg || 12), m);

  /* ── Bogies ── */
  function bogie(g, z, wide) {
    const dark = mat(0x1b1c1f), steel = mat(0x50535a, 'metal');
    box(2.3, 0.55, wide ? 3.4 : 2.6, dark, 0, 0.62, z, g);
    for (const dz of (wide ? [-1.3, 0, 1.3] : [-1.25, 1.25])) for (const sx of [-0.75, 0.75]) {
      const w = cyl(0.46, 0.14, steel, 14); w.rotation.z = Math.PI / 2; w.position.set(sx, 0.46, z + dz); g.add(w);
    }
  }

  /* ── Texture latérale des voitures ── */
  function sideTex(model, liv, opt, len) {
    const key = model + liv.join() + opt;
    if (texCache[key]) return texCache[key];
    const W = 1024, H = 160;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    const [c1, c2] = liv;
    const acc = c2 === 'mix' ? '#c0392b' : c2;
    const pxm = W / len;
    x.fillStyle = c1; x.fillRect(0, 0, W, H);
    const two = model === 'vb2n' || model === 'duplex' || model === 'r2nm';
    // bande de livrée
    x.fillStyle = acc;
    if (model === 'corail') { x.fillRect(0, H * 0.73, W, H * 0.07); }
    else if (model === 'duplex') { x.fillRect(0, H * 0.82, W, H * 0.06); x.globalAlpha = .9; x.fillRect(0, H * 0.04, W, H * 0.05); x.globalAlpha = 1; }
    else { x.fillRect(0, H * 0.8, W, H * 0.08); }
    // fenêtres
    const win = (y, h) => {
      const n = Math.floor(len / 2.1);
      for (let i = 1; i < n - 1; i++) {
        const wx = i * W / n + 4, ww = W / n - 10;
        const g = x.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#2b3a4a'); g.addColorStop(1, '#0f151c');
        x.fillStyle = g; x.beginPath(); x.roundRect ? x.roundRect(wx, y, ww, h, 5) : x.rect(wx, y, ww, h); x.fill();
        x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(wx + 3, y + 3, ww * 0.4, 3);
      }
    };
    if (two) { win(H * 0.14, H * 0.24); win(H * 0.5, H * 0.24); } else win(H * 0.28, H * 0.3);
    // portes
    x.fillStyle = model === 'corail' ? acc : 'rgba(0,0,0,.25)';
    const dw = 1.0 * pxm;
    const doors = model === 'r2nm' || model === 'agcm' ? [0.5] : [0.06, 0.94];
    doors.forEach(f => { x.fillRect(f * W - dw / 2, H * 0.18, dw, H * 0.72); x.fillStyle = '#1a222c'; x.fillRect(f * W - dw / 2 + 4, H * 0.24, dw - 8, H * 0.24); x.fillStyle = model === 'corail' ? acc : 'rgba(0,0,0,.25)'; });
    // 1re classe : liseré jaune
    if (opt === 0 && model !== 'agcm') { x.fillStyle = '#f2c12e'; x.fillRect(W * 0.1, H * 0.07, W * 0.8, 5); x.font = 'bold 40px sans-serif'; x.fillStyle = '#f2c12e'; x.fillText('1', W * 0.15, H * 0.62); }
    if (model === 'corail' && opt === 2) { x.font = 'bold 30px sans-serif'; x.fillStyle = acc; x.fillText('BAR', W * 0.45, H * 0.68); }
    const t = new T.CanvasTexture(c);
    t.anisotropy = 4;
    return (texCache[key] = t);
  }

  /* ── Locomotives / motrices ── */
  function profile(model, L) {
    const s = new T.Shape();
    const top = model === 'r2n' ? 4.3 : model === 'agc' ? 3.9 : model === 'tgv' ? 3.95 : 4.05;
    s.moveTo(0, 1.0); s.lineTo(0, top);
    switch (model) {
      case 'tgv': s.lineTo(L * 0.42, top); s.bezierCurveTo(L * 0.72, top, L * 0.93, 2.6, L, 1.25); s.lineTo(L, 1.0); break;
      case 'bbnez': s.lineTo(L - 1.1, top); s.lineTo(L, 3.0); s.lineTo(L - 0.25, 1.0); break;
      case 'prima': s.lineTo(L - 0.8, top); s.lineTo(L, 3.25); s.lineTo(L, 1.0); break;
      case 'ccdiesel': s.lineTo(L - 2.3, top); s.lineTo(L - 1.5, 3.05); s.lineTo(L, 2.75); s.lineTo(L, 1.0); break;
      case 'bbdiesel': s.lineTo(L - 1.0, top); s.lineTo(L - 0.1, 2.95); s.lineTo(L, 1.0); break;
      case 'r2n': s.lineTo(L - 2.8, top); s.quadraticCurveTo(L - 0.2, top - 0.2, L, 1.5); s.lineTo(L, 1.0); break;
      case 'agc': s.lineTo(L - 2.4, top); s.quadraticCurveTo(L - 0.3, top - 0.2, L, 1.4); s.lineTo(L, 1.0); break;
      default: s.lineTo(L - 1.4, top); s.lineTo(L - 0.15, 2.75); s.lineTo(L, 1.0);
    }
    s.lineTo(0, 1.0);
    return { s, top };
  }
  function loco(v) {
    const L = v.len, Wd = 2.95, m = v.model;
    const g = new T.Group();
    const [c1, c2] = v.liv;
    const body = mat(c1, 'paint'), accent = mat(c2 === 'mix' ? '#c0392b' : c2, 'paint');
    const dark = mat(0x1b1c1f), glass = mat(0x111a24, 'glass'), roof = mat(0x5d6168);
    const { s, top } = profile(m, L);
    const geo = new T.ExtrudeGeometry(s, { depth: Wd - 0.3, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.15, bevelSegments: 2, curveSegments: 10 });
    geo.rotateY(-Math.PI / 2);
    geo.translate((Wd - 0.3) / 2, 0, -L / 2);
    // affinement du nez
    const p = geo.attributes.position;
    const taper = m === 'tgv' ? 0.45 : m === 'r2n' || m === 'agc' ? 0.18 : 0.06;
    const t0 = m === 'tgv' ? 0.15 : 0.32;
    for (let i = 0; i < p.count; i++) {
      const z = p.getZ(i) / L + 0.5;
      if (z > 1 - t0) { const u = (z - (1 - t0)) / t0; p.setX(i, p.getX(i) * (1 - taper * u * u)); }
      // arrondi du pavillon
      const y = p.getY(i);
      if (y > top - 0.4) { const ax = Math.abs(p.getX(i)) / (Wd / 2); p.setY(i, y - Math.max(0, ax - 0.75) * 0.9 * (y - (top - 0.4)) / 0.4 * 0.5); }
    }
    geo.computeVertexNormals();
    g.add(new T.Mesh(geo, body));
    // bande de livrée
    const bandL = m === 'tgv' ? L * 0.62 : L * 0.9;
    const bandZ = m === 'tgv' ? -L / 2 + bandL / 2 : -0.05 * L;
    box(Wd + 0.04, m === 'tgv' ? 0.5 : 0.42, bandL, accent, 0, m === 'tgv' ? 2.15 : 1.75, bandZ, g);
    if (m === 'tgv') box(Wd + 0.04, 0.12, L * 0.5, accent, 0, 3.3, -L / 2 + L * 0.25, g);
    // châssis & jupes
    box(2.7, 0.5, L * 0.92, dark, 0, 0.85, 0, g);
    // pare-brise
    const ws = new T.Mesh(new T.BoxGeometry(m === 'tgv' ? 1.7 : 2.5, m === 'tgv' ? 1.1 : 1.0, 0.12), glass);
    let wy = 3.35, wz = L / 2 - 0.75, ang = 0.6;
    if (m === 'tgv') { wy = 3.35; wz = L / 2 - 4.7; ang = 1.15; }
    else if (m === 'bbnez') { wy = 3.5; wz = L / 2 - 0.55; ang = -0.42; }
    else if (m === 'prima') { wy = 3.62; wz = L / 2 - 0.4; ang = 0.95; }
    else if (m === 'ccdiesel') { wy = 3.5; wz = L / 2 - 1.9; ang = 0.9; }
    else if (m === 'r2n' || m === 'agc') { wy = 3.0; wz = L / 2 - 0.9; ang = 0.55; ws.scale.set(1, 1.6, 1); }
    else if (m === 'bbdiesel') { wy = 3.45; wz = L / 2 - 0.55; ang = 0.86; }
    else { wy = 3.38; wz = L / 2 - 0.8; ang = 0.78; }
    ws.position.set(0, wy, wz); ws.rotation.x = -ang; g.add(ws);
    // vitres latérales de cabine
    for (const sx of [-1, 1]) {
      box(0.06, 0.8, 1.1, glass, sx * (Wd / 2 + 0.02), 3.15, L / 2 - (m === 'tgv' ? 6.2 : m === 'ccdiesel' ? 3.0 : 2.0), g);
      if (v.trac === 'diesel' || m === 'prima' || m.startsWith('bb')) {
        // grilles de ventilation
        for (let k = 0; k < 4; k++) box(0.05, 0.7, 1.4, dark, sx * (Wd / 2 + 0.01), 3.1, -L / 2 + 3 + k * 2.2, g);
      }
      if (m === 'r2n' || m === 'agc') for (let k = 0; k < 4; k++) box(0.05, m === 'r2n' ? 0.75 : 0.85, 1.9, glass, sx * (Wd / 2 + 0.02), m === 'r2n' ? 2.2 : 2.6, -L / 2 + 2 + k * 2.6, g);
      if (m === 'r2n') for (let k = 0; k < 4; k++) box(0.05, 0.75, 1.9, glass, sx * (Wd / 2 + 0.02), 3.45, -L / 2 + 2 + k * 2.6, g);
    }
    // toiture
    if (v.trac === 'elec' && m !== 'r2n') {
      box(1.6, 0.35, L * 0.25, roof, 0, top + 0.1, -L * 0.05, g);
    }
    if (v.trac === 'diesel') { const ex = cyl(0.18, 0.5, dark); ex.position.set(0.3, top + 0.2, 0); g.add(ex); box(1.8, 0.3, L * 0.3, roof, 0, top + 0.05, -L * 0.15, g); }
    // tampons et attelage
    if (m !== 'tgv' && m !== 'r2n' && m !== 'agc') for (const sx of [-0.88, 0.88]) for (const sz of [-1, 1]) { const b = cyl(0.19, 0.6, mat(0x2a2b2e, 'metal'), 10); b.rotation.x = Math.PI / 2; b.position.set(sx, 1.05, sz * (L / 2 + 0.25)); g.add(b); }
    // bogies
    const wide = m === 'ccdiesel';
    bogie(g, -L * 0.3, wide); bogie(g, L * 0.3, wide);
    const out = merge(g);
    // feux (dynamiques)
    const lights = new T.Group();
    const fw = mat(0xfff6dd, 'emit'), fr = mat(0xff2a1a, 'emit');
    const front = m === 'tgv' ? [L / 2 - 0.55, 1.55] : m === 'r2n' || m === 'agc' ? [L / 2 + 0.02, 1.75] : [L / 2 + 0.03, 1.45];
    const lw = []; const lr = [];
    for (const sx of [-0.85, 0.85]) {
      const a = new T.Mesh(new T.CircleGeometry(0.13, 12), fw); a.position.set(sx * (m === 'tgv' ? 0.7 : 1), front[1], front[0] + 0.03); lights.add(a); lw.push(a);
      const r = new T.Mesh(new T.CircleGeometry(0.09, 10), fr); r.position.set(sx * (m === 'tgv' ? 0.7 : 1) * 0.78, front[1] - 0.05, front[0] + 0.03); lights.add(r); lr.push(r);
    }
    const top1 = new T.Mesh(new T.CircleGeometry(0.11, 12), fw); top1.position.set(0, m === 'tgv' ? 2.5 : top - 0.25, m === 'tgv' ? L / 2 - 2.3 : front[0] - (m === 'r2n' || m === 'agc' ? 0.9 : 0.4)); top1.rotation.x = -0.4; lights.add(top1); lw.push(top1);
    out.add(lights);
    out.userData.lw = lw; out.userData.lr = lr;
    // pantographe (dynamique)
    if (v.trac === 'elec') {
      const pg = new T.Group();
      const pm = mat(0x3a3c40, 'metal');
      const a1 = box(0.08, 0.08, 1.9, pm, 0, 0, 0.9); const a2 = box(0.08, 0.08, 1.9, pm, 0, 0, 0.9);
      const lower = new T.Group(); lower.add(a1); const upper = new T.Group(); upper.add(a2);
      const head = box(1.9, 0.08, 0.3, mat(0x9aa0a8, 'metal'), 0, 0, 0);
      pg.add(lower); lower.add(upper); upper.position.z = 1.9; upper.add(head); head.position.z = 1.9;
      pg.position.set(0, top + 0.3, -L * 0.18 + (m === 'tgv' ? L * 0.15 : 0));
      out.add(pg);
      out.userData.panto = { pg, lower, upper, head, set(u) { const a = 0.08 + u * 0.55; lower.rotation.x = -a; upper.rotation.x = a * 2; head.rotation.x = -a; } };
      out.userData.panto.set(0);
    }
    return out;
  }

  /* ── Voitures et wagons ── */
  function sectionShape(w, y0, h, r) {
    const s = new T.Shape();
    s.moveTo(-w / 2, y0); s.lineTo(w / 2, y0); s.lineTo(w / 2, y0 + h - r);
    s.quadraticCurveTo(w / 2, y0 + h, w / 2 - r, y0 + h); s.lineTo(-w / 2 + r, y0 + h);
    s.quadraticCurveTo(-w / 2, y0 + h, -w / 2, y0 + h - r); s.lineTo(-w / 2, y0);
    return s;
  }
  function extrudeLen(shape, L, m) {
    const g = new T.ExtrudeGeometry(shape, { depth: L, bevelEnabled: false, curveSegments: 6 });
    g.translate(0, 0, -L / 2);
    return new T.Mesh(g, m);
  }
  function car(v) {
    const L = v.len, m = v.model;
    const g = new T.Group();
    const [c1, c2] = v.liv;
    const dark = mat(0x1b1c1f), frame = mat(0x2a2b2e);
    const acc = c2 === 'mix' ? '#c0392b' : c2;
    if (['corail', 'vb2n', 'duplex', 'r2nm', 'agcm'].includes(m)) {
      const tall = m === 'vb2n' || m === 'duplex' || m === 'r2nm';
      const y0 = tall ? 0.75 : 1.05, h = tall ? 3.55 : 3.0, w = 2.86;
      g.add(extrudeLen(sectionShape(w, y0, h, 0.45), L - 0.4, mat(c1, 'paint')));
      const tex = sideTex(m, v.liv, v.opt, L);
      const sm = new T.MeshPhongMaterial({ map: tex, shininess: 30, specular: 0x222222 });
      for (const sx of [-1, 1]) {
        const pl = new T.Mesh(new T.PlaneGeometry(L - 0.5, h - 0.45), sm);
        pl.position.set(sx * (w / 2 + 0.012), y0 + (h - 0.45) / 2, 0);
        pl.rotation.y = sx * Math.PI / 2;
        g.add(pl);
      }
      box(w - 0.5, 0.25, L - 0.6, mat(0x6b6f75), 0, y0 + h + 0.02, 0, g);
      box(2.5, 0.45, L * 0.85, dark, 0, y0 - 0.1, 0, g);
      // soufflets
      box(2.2, h * 0.75, 0.5, dark, 0, y0 + h * 0.42, L / 2 - 0.2, g);
    } else if (m === 'citerne') {
      box(2.6, 0.35, L - 0.4, frame, 0, 1.15, 0, g);
      const tk = new T.Mesh(new T.CylinderGeometry(1.45, 1.45, L - 2.2, 20), mat(c1, 'paint')); tk.rotation.x = Math.PI / 2; tk.position.y = 2.75; g.add(tk);
      for (const sz of [-1, 1]) { const e = new T.Mesh(new T.SphereGeometry(1.45, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(c1, 'paint')); e.scale.y = 0.45; e.rotation.x = sz * Math.PI / 2; e.position.set(0, 2.75, sz * (L / 2 - 1.1)); g.add(e); }
      box(2.95, 0.22, L - 2.6, mat(acc, 'paint'), 0, 2.75, 0, g);
      box(0.9, 0.3, 0.9, frame, 0, 4.25, 0, g);
    } else if (m === 'conteneur') {
      box(2.5, 0.35, L - 0.3, frame, 0, 1.2, 0, g);
      if (v.opt === 1) {
        const cols = acc && c2 !== 'mix' ? [acc, acc] : ['#2c5aa0', '#a8322b', '#d9a521', '#3d7a4a', '#7b5d9a', '#5e6d74'];
        const ci = ((v.idx || 0) * 2) % cols.length;
        for (let k = 0; k < 2; k++) {
          const cm = mat(cols[(ci + k) % cols.length]);
          const cl = (L - 1.2) / 2 - 0.2;
          box(2.44, 2.6, cl, cm, 0, 2.7, (k ? 1 : -1) * (cl / 2 + 0.15), g);
        }
      }
    } else if (m === 'tombereau' || m === 'cereales') {
      box(2.6, 0.35, L - 0.3, frame, 0, 1.15, 0, g);
      if (m === 'tombereau') {
        box(2.9, 2.0, L - 0.5, mat(c1), 0, 2.35, 0, g);
        box(2.6, 0.1, L - 0.8, v.opt === 1 ? mat(0x4d443c) : mat(0x241f1c), 0, v.opt === 1 ? 3.3 : 1.55, 0, g);
        for (let k = 1; k < 7; k++) for (const sx of [-1, 1]) box(0.1, 2.0, 0.12, mat(c2), sx * 1.48, 2.35, -L / 2 + 0.25 + k * (L - 0.5) / 7, g);
      } else {
        const sh = new T.Shape(); sh.moveTo(-0.4, 1.3); sh.lineTo(0.4, 1.3); sh.lineTo(1.45, 2.4); sh.lineTo(1.45, 4.0); sh.lineTo(-1.45, 4.0); sh.lineTo(-1.45, 2.4); sh.lineTo(-0.4, 1.3);
        g.add(extrudeLen(sh, L - 0.6, mat(c1)));
        box(2.9, 0.08, L - 0.7, mat(0x5a5d62), 0, 4.03, 0, g);
      }
    } else if (m === 'couvert') {
      box(2.6, 0.35, L - 0.3, frame, 0, 1.15, 0, g);
      g.add(extrudeLen(sectionShape(2.9, 1.3, 2.95, 0.5), L - 0.6, mat(c1, 'paint')));
      for (let k = 1; k < 4; k++) for (const sx of [-1, 1]) box(0.04, 2.6, 0.08, mat(0x000000), sx * 1.46, 2.7, -L / 2 + k * L / 4, g);
    } else if (m === 'autos') {
      box(2.6, 0.3, L - 0.3, frame, 0, 1.1, 0, g);
      const fm = mat(c1);
      box(2.8, 0.12, L - 0.5, fm, 0, 2.55, 0, g);
      for (let k = 0; k <= 6; k++) for (const sx of [-1, 1]) box(0.1, 2.9, 0.12, fm, sx * 1.4, 2.7, -L / 2 + 0.3 + k * (L - 0.6) / 6, g);
      box(2.8, 0.1, L - 0.4, fm, 0, 4.15, 0, g);
      if (v.opt === 1) {
        const cc = [0xe8e8e8, 0xb71c1c, 0x263238, 0x1565c0, 0x9e9e9e];
        for (let k = 0; k < 5; k++) for (const deck of [1.3, 2.62]) {
          const cm = mat(cc[(k + (deck > 2 ? 2 : 0) + (v.idx || 0)) % 5], 'paint');
          box(1.75, 0.6, 4.1, cm, 0, deck + 0.4, -L / 2 + 2.8 + k * (L - 5) / 4.4, g);
          box(1.5, 0.45, 2.0, mat(0x1a222c, 'glass'), 0, deck + 0.85, -L / 2 + 2.6 + k * (L - 5) / 4.4, g);
        }
      }
    }
    // tampons
    if (!['duplex', 'r2nm', 'agcm'].includes(m)) for (const sx of [-0.88, 0.88]) for (const sz of [-1, 1]) { const b = cyl(0.18, 0.5, mat(0x2a2b2e, 'metal'), 8); b.rotation.x = Math.PI / 2; b.position.set(sx, 1.05, sz * (L / 2 - 0.05)); g.add(b); }
    bogie(g, -L * 0.36, false); bogie(g, L * 0.36, false);
    return merge(g);
  }

  const cache = {};
  function vehicle(v) {
    const key = [v.kind, v.model, v.len, v.liv.join(), v.opt, v.model === 'conteneur' || v.model === 'autos' ? (v.idx || 0) % 3 : 0, v.trac].join('|');
    if (v.kind === 'loco') {
      const o = loco(v);       // éléments dynamiques propres à chaque engin
      if (v.rear) { const w = new T.Group(); o.rotation.y = Math.PI; w.add(o); w.userData = o.userData; return w; }
      return o;
    }
    if (!cache[key]) cache[key] = car(v);
    const c = cache[key].clone();
    return c;
  }

  /* composition d'un train bot */
  function botConsist(ty, rnd) {
    const out = [];
    const L = TS.LOCOS.find(l => l.model === ty.model) || TS.LOCOS[0];
    const head = { kind: 'loco', model: ty.model, len: L.len, liv: ty.liv, trac: L.trac };
    out.push(head);
    if (ty.model === 'tgv') { for (let i = 0; i < ty.cars; i++) out.push({ kind: 'car', model: 'duplex', len: 18.7, liv: ty.liv, opt: 1 }); out.push(Object.assign({}, head, { rear: true })); }
    else if (ty.model === 'r2n') { for (let i = 0; i < ty.cars; i++) out.push({ kind: 'car', model: 'r2nm', len: 16.5, liv: ty.liv, opt: 1 }); out.push(Object.assign({}, head, { rear: true })); }
    else { const W = TS.WAGONS[ty.wagon]; for (let i = 0; i < ty.cars; i++) out.push({ kind: 'car', model: W.model, len: W.len, liv: ty.wliv, opt: W.cat === 'fret' ? (rnd() < 0.8 ? 1 : 0) : 1, idx: i }); }
    let off = 0; out.forEach(x => { x.off = off; off += x.len + 0.8; });
    return { vehicles: out, len: off - 0.8 };
  }

  return { vehicle, botConsist, merge, mat };
})();

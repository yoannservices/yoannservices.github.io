/* ═══════════════════════════════════════════════════════════
   SIMULATEUR TRAIN — MONDE 3D
   Construction par tronçons (chunks) le long de la ligne avec
   origine flottante : terrain, ballast, voies, caténaire,
   gares et quais, signaux, panneaux, décor, trains, cabine.
   ═══════════════════════════════════════════════════════════ */
'use strict';

TS.World = (function () {
  const T = THREE;
  const CH = 360;                 // longueur d'un tronçon (m), multiple de 2,4
  const AHEAD = 3600, BEHIND = 720;
  let R, cfg, renderer, scene, camera, sun, hemi, sky, cab, cabGroup, headLight;
  const O = { s: 0, x: 0, y: 0, z: 0 };
  const chunks = new Map();
  const sigObjs = {};             // j -> [{lamps, track}]
  let playerCars = [], botMeshes = new Map(), oppMeshes = new Map();
  const W = {};
  const tmpA = {}, tmpB = {};
  const mat = (c, k) => TS.mat(c, k);

  /* ══════════ Textures procédurales ══════════ */
  function canvasTex(w, h, draw, rep) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c);
    if (rep) { t.wrapS = t.wrapT = T.RepeatWrapping; }
    t.anisotropy = 8;
    return t;
  }
  let TX = {};
  function makeTextures() {
    TX.sleeper = canvasTex(256, 64, (x, w, h) => {
      x.clearRect(0, 0, w, h);
      for (let i = 0; i < 4; i++) {
        const sx = i * 64 + 18;
        x.fillStyle = '#8d8a84'; x.fillRect(sx, 2, 28, h - 4);
        x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(sx, 2, 28, 3);
        x.fillStyle = '#2b2b2b'; x.fillRect(sx + 4, h * 0.2 - 3, 20, 6); x.fillRect(sx + 4, h * 0.8 - 3, 20, 6);
      }
    }, true);
    TX.ballast = canvasTex(256, 256, (x, w, h) => {
      x.fillStyle = '#6d6862'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 9000; i++) {
        const v = 70 + Math.random() * 90 | 0;
        x.fillStyle = `rgb(${v},${v - 4},${v - 9})`;
        x.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 3);
      }
    }, true);
    TX.platform = canvasTex(256, 64, (x, w, h) => {
      x.fillStyle = '#9a9a96'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 1500; i++) { const v = 130 + Math.random() * 40 | 0; x.fillStyle = `rgba(${v},${v},${v - 3},.5)`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
      x.strokeStyle = 'rgba(0,0,0,.12)'; for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(i * 32, 0); x.lineTo(i * 32, h); x.stroke(); }
    }, true);
    TX.glow = canvasTex(64, 64, (x, w, h) => {
      const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
    });
  }
  const signTex = {};
  function textTex(key, w, h, draw) {
    if (signTex[key]) return signTex[key];
    return (signTex[key] = canvasTex(w, h, draw));
  }
  function boardTex(kind, v) {
    return textTex(kind + v, 128, 128, (x, w, h) => {
      const fr = (bg, fg) => { x.fillStyle = '#111'; x.fillRect(0, 0, w, h); x.fillStyle = bg; x.fillRect(8, 8, w - 16, h - 16); x.fillStyle = fg; };
      x.textAlign = 'center'; x.textBaseline = 'middle';
      if (kind === 'tivd') { fr('#f6d33c', '#111'); x.font = 'bold 64px Arial Narrow, Arial'; x.fillText(String(v), w / 2, h / 2 + 4); }
      else if (kind === 'z') { fr('#f3f3f3', '#111'); x.font = 'bold 80px Arial'; x.fillText('Z', w / 2, h / 2 + 4); }
      else if (kind === 'r') { fr('#f3f3f3', '#111'); x.font = 'bold 80px Arial'; x.fillText('R', w / 2, h / 2 + 4); }
      else if (kind === 'cca') { fr('#1c4fa0', '#fff'); x.font = 'bold 30px Arial'; x.fillText('SECT.', w / 2, h / 2 - 16); x.fillText('SÉP.', w / 2, h / 2 + 18); }
      else if (kind === 'ccdj') { fr('#1c4fa0', '#fff'); x.lineWidth = 9; x.strokeStyle = '#fff'; x.beginPath(); x.moveTo(30, 64); x.lineTo(54, 64); x.lineTo(78, 40); x.moveTo(78, 64); x.lineTo(100, 64); x.stroke(); }
      else if (kind === 'ccfin') { fr('#1c4fa0', '#fff'); x.lineWidth = 9; x.strokeStyle = '#fff'; x.beginPath(); x.moveTo(26, 64); x.lineTo(102, 64); x.stroke(); }
      else if (kind === 'tvmdeb' || kind === 'tvmfin') { fr('#1c4fa0', '#fff'); x.font = 'bold 34px Arial'; x.fillText('TVM', w / 2, h / 2 - 12); x.font = 'bold 22px Arial'; x.fillText(kind === 'tvmdeb' ? 'DÉBUT' : 'FIN', w / 2, h / 2 + 24); }
      else if (kind === 'tvm') { fr('#1c4fa0', '#fff'); x.fillStyle = '#f6d33c'; x.beginPath(); x.moveTo(30, 90); x.lineTo(98, 90); x.lineTo(64, 34); x.closePath(); x.fill(); }
      else if (kind === 'stop') { fr('#f3f3f3', '#111'); x.font = 'bold 28px Arial'; x.fillText('ARRÊT', w / 2, h / 2 - 12); x.font = 'bold 22px Arial'; x.fillText('TÊTE', w / 2, h / 2 + 22); }
    });
  }
  function nameTex(name) {
    return textTex('n' + name, 512, 96, (x, w, h) => {
      x.fillStyle = '#123a73'; x.fillRect(0, 0, w, h); x.strokeStyle = '#fff'; x.lineWidth = 4; x.strokeRect(6, 6, w - 12, h - 12);
      x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
      let fs = 50; x.font = `600 ${fs}px Arial Narrow, Arial`;
      while (x.measureText(name).width > w - 40 && fs > 20) { fs -= 2; x.font = `600 ${fs}px Arial Narrow, Arial`; }
      x.fillText(name, w / 2, h / 2 + 2);
    });
  }
  function voieTex(n) {
    return textTex('v' + n, 128, 64, (x, w, h) => {
      x.fillStyle = '#f3f3f3'; x.fillRect(0, 0, w, h); x.fillStyle = '#123a73'; x.fillRect(0, 0, 44, h);
      x.fillStyle = '#fff'; x.font = 'bold 22px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('Voie', 22, h / 2);
      x.fillStyle = '#111'; x.font = 'bold 44px Arial'; x.fillText(String(n), 86, h / 2 + 2);
    });
  }

  /* ══════════ Géométrie le long de la voie ══════════ */
  // côtés de la plateforme (ballast) en q
  function ext(q) {
    const S = R.stationAt(q);
    const base = TS.MAIN + 2.1;
    if (!S) return [base, base];
    if (S.extL === undefined) {
      let l = Math.abs(S.left[S.left.length - 1]) + 2.1, r = Math.abs(S.right[S.right.length - 1]) + 2.1;
      S.platsL.forEach(p => { l = Math.max(l, Math.abs(p.c) + p.w / 2 + 0.6); });
      S.platsR.forEach(p => { r = Math.max(r, Math.abs(p.c) + p.w / 2 + 0.6); });
      S.extL = l; S.extR = r;
    }
    const a = S.zoneStart - S.maxTurn - 80, b = S.zoneEnd + S.maxTurn + 80;
    let u = Math.min(TS.smooth((q - a) / 120), TS.smooth((b - q) / 120));
    if (S.first && q < a + 120) u = 1;
    if (S.last && q > b - 120) u = 1;
    return [base + (S.extL - base) * u, base + (S.extR - base) * u];
  }
  function hill(q, lat) {
    const a = Math.abs(lat);
    const n1 = TS.noise2(q / 820 + 13.1, lat / 820 + 7.7) - 0.5;
    const n2 = TS.noise2(q / 170 + 3.3, lat / 170 - 2.1) - 0.5;
    return n1 * 70 * Math.min(1, a / 300) + n2 * 7 * Math.min(1, a / 80);
  }
  function terrainY(q, lat, e) {
    const y = R.sample(q, tmpA).y;
    e = e || ext(q);
    const inner = (lat < 0 ? e[0] : e[1]) + 1.2;
    const a = Math.abs(lat);
    if (a <= inner) return y - 0.55;
    return y - 0.55 + hill(q, lat) * TS.smooth((a - inner) / 60);
  }
  W.terrainY = terrainY;

  // ruban : profil [dl, dy] appliqué autour de latFn(q)
  function ribbon(org, q0, q1, ds, latFn, prof, o) {
    o = o || {};
    const rows = Math.max(2, Math.ceil((q1 - q0) / ds) + 1);
    const np = (typeof prof === 'function' ? prof(q0) : prof).length;
    const pos = new Float32Array(rows * np * 3), uv = new Float32Array(rows * np * 2);
    const col = o.colorFn ? new Float32Array(rows * np * 3) : null;
    for (let r = 0; r < rows; r++) {
      const q = r === rows - 1 ? q1 : q0 + r * ds;
      const lat = latFn ? latFn(q) : 0;
      const pr = typeof prof === 'function' ? prof(q) : prof;
      for (let i = 0; i < np; i++) {
        const p = pr[i];
        const pt = R.point(q, lat + p[0], p[1], tmpB);
        const k = (r * np + i) * 3;
        pos[k] = pt.x - org.x; pos[k + 1] = (p[2] !== undefined ? p[2] : pt.y) - org.y; pos[k + 2] = pt.z - org.z;
        uv[(r * np + i) * 2] = o.uLen ? (q - (o.uBase !== undefined ? o.uBase : q0)) / o.uLen : i / (np - 1);
        uv[(r * np + i) * 2 + 1] = o.vFn ? o.vFn(i, p) : i / (np - 1);
        if (col) { const c = o.colorFn(q, lat + p[0], i); col[k] = c[0]; col[k + 1] = c[1]; col[k + 2] = c[2]; }
      }
    }
    const idx = [];
    for (let r = 0; r < rows - 1; r++) for (let i = 0; i < np - 1; i++) {
      const a = r * np + i, b = a + 1, c = a + np, d = c + 1;
      if (o.flip) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c);
    }
    let g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3));
    g.setAttribute('uv', new T.BufferAttribute(uv, 2));
    if (col) g.setAttribute('color', new T.BufferAttribute(col, 3));
    g.setIndex(idx);
    if (o.flat) { g = g.toNonIndexed(); }
    g.computeVertexNormals();
    return g;
  }

  /* ══════════ Tronçons ══════════ */
  const FIELD = [[0.43, 0.56, 0.25], [0.49, 0.6, 0.27], [0.65, 0.63, 0.32], [0.76, 0.69, 0.38], [0.37, 0.49, 0.22], [0.52, 0.46, 0.31], [0.42, 0.54, 0.32], [0.58, 0.6, 0.3]];
  function fieldColor(q, lat) {
    const a = Math.abs(lat);
    const n = TS.noise2(q / 600, lat / 600);
    if (a < 14) return [0.42, 0.47, 0.3];
    if (n > 0.6) return [0.24, 0.36, 0.18];
    const c = FIELD[Math.floor(TS.hash(Math.floor((q + lat * 0.3) / 230), Math.floor(lat / 160)) * FIELD.length)];
    const j = (TS.hash(Math.floor(q / 37), Math.floor(lat / 23)) - 0.5) * 0.05;
    return [c[0] + j, c[1] + j, c[2] + j];
  }

  function buildChunk(ci) {
    const q0 = ci * CH, q1 = q0 + CH;
    const org = Object.assign({}, R.sample(q0, {}));
    const g = new T.Group();
    g.userData = { org, sig: [], dispose: [] };
    const add = (geo, m, keep) => { const me = new T.Mesh(geo, m); g.add(me); if (!keep) g.userData.dispose.push(geo); return me; };
    const trackStart = R.stations[0].zoneStart - 60, trackEnd = R.end + 1;

    /* terrain */
    const tprof = q => {
      const e = ext(q);
      const L = [700, 330, 160, 70, 30, 12, 4.5, 1.2].map(d => -(e[0] + d));
      const Rr = [1.2, 4.5, 12, 30, 70, 160, 330, 700].map(d => e[1] + d);
      return L.concat(Rr).map(l => [l, 0, terrainY(q, l, e)]);
    };
    const tg = ribbon(org, q0, q1, 20, null, tprof, { colorFn: (q, l) => fieldColor(q, l) });
    add(tg, W.terrainMat);

    /* ballast */
    const tq0 = Math.max(q0, trackStart), tq1 = Math.min(q1, trackEnd);
    if (tq1 > tq0) {
      const bprof = q => { const e = ext(q); return [[-e[0] - 1.3, -0.55], [-e[0], 0], [e[1], 0], [e[1] + 1.3, -0.55]]; };
      add(ribbon(org, tq0, tq1, 10, null, bprof, { uLen: 6, uBase: q0, vFn: (i, p) => p[0] / 6 }), W.ballastMat);

      /* voies */
      const paths = [{ fn: () => -TS.MAIN, a: tq0, b: tq1 }, { fn: () => TS.MAIN, a: tq0, b: tq1 }];
      R.stations.forEach(S => {
        const m = Math.max(S.maxTurn, S.maxTurnR) + 60;
        if (S.zoneEnd + m < q0 || S.zoneStart - m > q1) return;
        [[-1, S.left], [1, S.right]].forEach(([side, offs]) => {
          for (let k = 1; k < offs.length; k++) {
            const L = TS.turnoutLen(offs[k] - side * TS.MAIN);
            let a = S.zoneStart - 40 - L, b = S.zoneEnd + 40 + L;
            if (S.first) a = Math.max(trackStart, S.zoneStart - 60);
            if (S.last) b = trackEnd;
            a = Math.max(a, q0); b = Math.min(b, q1);
            if (b > a) paths.push({ fn: q => R.latTrack(S, side, k, q), a, b, st: S, side, k });
          }
        });
      });
      const railProf = [];
      [-0.7175, 0.7175].forEach(r => { railProf.push([[r - 0.036, 0.05], [r - 0.036, 0.2], [r + 0.036, 0.2], [r + 0.036, 0.05]]); });
      paths.forEach(p => {
        add(ribbon(org, p.a, p.b, 5, p.fn, [[-1.3, 0.04], [1.3, 0.04]], { uLen: 2.4, uBase: q0, vFn: i => i }), W.sleeperMat);
        railProf.forEach(rp => add(ribbon(org, p.a, p.b, 5, p.fn, rp), W.railMat));
      });

      /* caténaire */
      const poles = [], arms = [], wires = [];
      const pStep = 60;
      for (let q = Math.ceil(q0 / pStep) * pStep; q < q1; q += pStep) {
        if (q < trackStart || q > trackEnd) continue;
        const e = ext(q);
        const wide = e[0] > 6 || e[1] > 6;
        const pt = R.sample(q, {});
        if (wide) {
          // portique
          for (const lat of [-(e[0] + 1.6), e[1] + 1.6]) poles.push([q, lat, pt.h]);
          arms.push([q, (e[1] - e[0]) / 2, pt.h, e[0] + e[1] + 3.2, 7.6]);
        } else {
          for (const side of [-1, 1]) { poles.push([q, side * (e[side < 0 ? 0 : 1] + 1.6), pt.h]); arms.push([q, side * (TS.MAIN + 2.4), pt.h, 3.4, 6.7]); }
        }
      }
      if (poles.length) {
        const pg = new T.InstancedMesh(W.poleGeo, W.poleMat, poles.length);
        const ag = new T.InstancedMesh(W.armGeo, W.poleMat, arms.length);
        const d = new T.Object3D();
        poles.forEach(([q, lat, h], i) => { const p = R.point(q, lat, 0, {}); d.position.set(p.x - org.x, p.y - org.y - 0.4, p.z - org.z); d.rotation.set(0, h, 0); d.scale.set(1, 1, 1); d.updateMatrix(); pg.setMatrixAt(i, d.matrix); });
        arms.forEach(([q, lat, h, len, hy], i) => { const p = R.point(q, lat, 0, {}); d.position.set(p.x - org.x, p.y - org.y + hy, p.z - org.z); d.rotation.set(0, h, 0); d.scale.set(len, 1, 1); d.updateMatrix(); ag.setMatrixAt(i, d.matrix); });
        g.add(pg, ag); g.userData.dispose.push(pg, ag);
      }
      // fils (porteur + contact) pour chaque voie
      paths.forEach(p => {
        let prev = null;
        for (let q = p.a; q <= p.b + 0.01; q += 15) {
          const zz = Math.sin(q / 60 * Math.PI) * 0.2;
          const lat = p.fn(q);
          const c = R.point(q, lat + zz, 5.55, {}), m = R.point(q, lat, 6.7 - 0.5 * Math.abs(Math.sin(q / 60 * Math.PI)), {});
          const cur = [c.x - org.x, c.y - org.y, c.z - org.z, m.x - org.x, m.y - org.y, m.z - org.z];
          if (prev) wires.push(prev[0], prev[1], prev[2], cur[0], cur[1], cur[2], prev[3], prev[4], prev[5], cur[3], cur[4], cur[5]);
          prev = cur;
        }
      });
      if (wires.length) {
        const wg = new T.BufferGeometry(); wg.setAttribute('position', new T.Float32BufferAttribute(wires, 3));
        g.add(new T.LineSegments(wg, W.wireMat)); g.userData.dispose.push(wg);
      }
    }

    /* gares */
    R.stations.forEach(S => { if (S.zoneEnd + 600 > q0 && S.zoneStart - 600 < q1) buildStation(g, org, S, q0, q1); });

    /* signaux */
    R.signals.forEach(sg => { if (sg.s >= q0 && sg.s < q1) buildSignal(g, org, sg); });
    /* panneaux */
    R.signs.forEach(sn => { if (sn.s >= q0 && sn.s < q1) buildSign(g, org, sn); });
    /* ponts */
    R.bridges.forEach(b => { if (b.s >= q0 && b.s < q1) buildBridge(g, org, b); });
    /* butoirs */
    if (R.end >= q0 && R.end < q1) {
      const S = R.stations[R.stations.length - 1];
      S.left.concat(S.right).forEach(o => bufferStop(g, org, R.end, o, 1));
    }
    const S0 = R.stations[0];
    if (S0.zoneStart - 60 >= q0 && S0.zoneStart - 60 < q1) S0.left.concat(S0.right).forEach(o => bufferStop(g, org, S0.zoneStart - 59, o, -1));
    /* végétation et maisons */
    scatter(g, org, q0, q1, ci);
    return g;
  }

  function bufferStop(g, org, q, lat, dir) {
    const p = R.point(q, lat, 0, {});
    const b = new T.Mesh(W.boxGeo, mat(0xb3261e)); b.scale.set(2.6, 1.0, 1.0);
    b.position.set(p.x - org.x, p.y - org.y + 0.9, p.z - org.z); b.rotation.y = p.h; g.add(b);
    const w = new T.Mesh(W.boxGeo, mat(0xf2f2f2)); w.scale.set(1.2, 0.5, 1.02); w.position.copy(b.position); w.position.y += 0.1; w.rotation.y = p.h; g.add(w);
  }

  function placeAt(obj, org, q, lat, dy, rotExtra) {
    const p = R.point(q, lat, dy || 0, {});
    obj.position.set(p.x - org.x, p.y - org.y, p.z - org.z);
    obj.rotation.y = p.h + (rotExtra || 0);
    return obj;
  }

  /* ── Signal ── */
  const LAMPS = { R2: [0, 0.95], YH1: [-0.17, 0.62], YH2: [0.17, 0.62], R: [0, 0.3], G: [0, 0], Y: [0, -0.3], YV1: [0.32, 0.25], YV2: [0.32, -0.15], W: [-0.2, -0.55] };
  const LCOL = { R2: 0xff2a1a, R: 0xff2a1a, G: 0x22ff77, Y: 0xffb300, YH1: 0xffb300, YH2: 0xffb300, YV1: 0xffb300, YV2: 0xffb300, W: 0xffffff };
  function buildSignal(g, org, sg) {
    const lst = [];
    if (sg.tvm) {
      const grp = new T.Group();
      const post = new T.Mesh(W.boxGeo, mat(0x8a8d92)); post.scale.set(0.08, 2.4, 0.08); post.position.y = 1.2; grp.add(post);
      const bd = new T.Mesh(new T.PlaneGeometry(0.75, 0.75), new T.MeshBasicMaterial({ map: boardTex('tvm', '') })); bd.position.set(0, 2.7, -0.05); bd.rotation.y = Math.PI; grp.add(bd);
      g.userData.dispose.push(bd.geometry, bd.material);
      placeAt(grp, org, sg.s, -TS.MAIN - 2.0, 0); g.add(grp);
      return;
    }
    const tracks = sg.type === 'CS' ? R.stations[sg.st].left.map((o, k) => [o, k]) : [[R.lat(sg.s, TS.Sim.P.path), -1]];
    tracks.forEach(([off, k]) => {
      const grp = new T.Group();
      const tall = sg.type !== 'CS' || k === 0;
      const mastH = tall ? 4.2 : 2.6;
      const mast = new T.Mesh(W.cylGeo, mat(0x8a8d92, 'metal')); mast.scale.set(0.11, mastH, 0.11); mast.position.y = mastH / 2; grp.add(mast);
      // cible
      const head = new T.Group(); head.position.set(0, mastH + 0.9, -0.12);
      const plate = new T.Mesh(W.boxGeo, mat(0x0d0d0e)); plate.scale.set(0.95, 2.35, 0.08); head.add(plate);
      const border = new T.Mesh(W.boxGeo, mat(0xf0f0f0)); border.scale.set(1.05, 2.45, 0.06); border.position.z = 0.02; head.add(border);
      const visor = new T.Mesh(W.boxGeo, mat(0x0d0d0e)); visor.scale.set(0.95, 0.06, 0.25); visor.position.set(0, 1.2, -0.12); head.add(visor);
      const lamps = {};
      Object.entries(LAMPS).forEach(([n, [x, y]]) => {
        const m = new T.MeshBasicMaterial({ color: 0x1a1a1a });
        const l = new T.Mesh(W.lampGeo, m); l.position.set(x, y, -0.06); l.rotation.y = Math.PI; head.add(l);
        const sp = new T.Sprite(new T.SpriteMaterial({ map: TX.glow, color: LCOL[n], blending: T.AdditiveBlending, depthWrite: false, transparent: true }));
        sp.scale.set(1.6, 1.6, 1); sp.position.set(x, y, -0.15); sp.visible = false; head.add(sp);
        lamps[n] = { m, sp, c: LCOL[n] };
        g.userData.dispose.push(m, sp.material);
      });
      grp.add(head);
      // plaque d'identification
      const pl = new T.Mesh(W.boxGeo, mat(0xf2f2f2)); pl.scale.set(0.5, 0.3, 0.04); pl.position.set(0, mastH - 0.4, -0.1); grp.add(pl);
      const lat = k >= 0 ? off - 2.0 : off - 2.6;
      placeAt(grp, org, sg.s, lat, 0);
      g.add(grp);
      lst.push({ lamps, track: k });
    });
    sigObjs[sg.j] = lst;
    g.userData.sig.push(sg.j);
  }
  function setLamps(o, on) {
    for (const n in o.lamps) {
      const L = o.lamps[n], v = on.includes(n);
      L.m.color.setHex(v ? L.c : 0x1a1a1a);
      L.sp.visible = v;
    }
  }
  const ASPECT_LAMPS = { VL: ['G'], A: ['Y'], S: ['R'], C: ['R', 'R2'], R: ['YH1', 'YH2'], RR: ['YV1', 'YV2'], A_RR: ['Y', 'YV1', 'YV2'] };

  /* ── Panneaux ── */
  function buildSign(g, org, sn) {
    const grp = new T.Group();
    const post = new T.Mesh(W.boxGeo, mat(0x8a8d92)); post.scale.set(0.08, 2.6, 0.08); post.position.y = 1.3; grp.add(post);
    const t = boardTex(sn.kind, sn.v || '');
    const bd = new T.Mesh(W.boardGeo, new T.MeshBasicMaterial({ map: t })); bd.position.set(0, 2.9, -0.05); bd.rotation.y = Math.PI; grp.add(bd);
    g.userData.dispose.push(bd.material);
    placeAt(grp, org, sn.s, R.lat(sn.s, TS.Sim.P.path) - 2.5, 0);
    g.add(grp);
  }

  /* ── Pont routier ── */
  function buildBridge(g, org, b) {
    const grp = new T.Group();
    const conc = mat(0xa8a49c), dark = mat(0x55524d);
    const deck = new T.Mesh(W.boxGeo, conc); deck.scale.set(64, 1.3, 9); deck.position.y = 7.8; grp.add(deck);
    const road = new T.Mesh(W.boxGeo, mat(0x3b3c3f)); road.scale.set(64, 0.1, 7); road.position.y = 8.5; grp.add(road);
    for (const sx of [-1, 1]) {
      const pier = new T.Mesh(W.boxGeo, dark); pier.scale.set(1.4, 8, 7); pier.position.set(sx * 9, 3.6, 0); grp.add(pier);
      const rail = new T.Mesh(W.boxGeo, mat(0x9aa0a6, 'metal')); rail.scale.set(64, 1.0, 0.15); rail.position.set(0, 9.0, sx * 4.4); grp.add(rail);
      const abut = new T.Mesh(W.boxGeo, conc); abut.scale.set(6, 8, 11); abut.position.set(sx * 30, 3.8, 0); grp.add(abut);
    }
    placeAt(grp, org, b.s, 0, -0.5, b.ang);
    g.add(grp);
  }

  /* ── Gare ── */
  function buildStation(g, org, S, q0, q1) {
    const a = Math.max(q0, S.zoneStart), b = Math.min(q1, S.zoneStart + S.platLen);
    const platTop = 0.72;
    if (b > a) {
      [[-1, S.platsL], [1, S.platsR]].forEach(([side, plats]) => plats.forEach(p => {
        const l = p.c - p.w / 2, r = p.c + p.w / 2;
        const prof = [[l, -0.5], [l, platTop], [l + 0.45, platTop + 0.01], [r - 0.45, platTop + 0.01], [r, platTop], [r, -0.5]];
        add(ribbon(org, a, b, 10, null, prof, { uLen: 8, uBase: q0, vFn: (i, pp) => pp[0] / 8, flat: true }), W.platMat);
        // lignes de sécurité
        for (const e of [l + 0.55, r - 0.55]) add(ribbon(org, a, b, 10, null, [[e - 0.06, platTop + 0.02], [e + 0.06, platTop + 0.02]]), W.whiteMat);
        // marquise
        if (S.big || S.q >= 6) {
          const ma = Math.max(a, S.s - 110), mb = Math.min(b, S.s + 110);
          if (mb > ma) {
            add(ribbon(org, ma, mb, 10, null, [[l + 0.3, 5.6], [p.c, 6.1], [r - 0.3, 5.6]], { flip: false }), W.roofMat);
            add(ribbon(org, ma, mb, 10, null, [[r - 0.3, 5.58], [p.c, 6.08], [l + 0.3, 5.58]]), W.roofMat);
            for (let q = Math.ceil(ma / 12) * 12; q < mb; q += 12) { const c = new T.Mesh(W.boxGeo, mat(0x4a5058, 'metal')); c.scale.set(0.25, 5.0, 0.25); placeAt(c, org, q, p.c, platTop + 2.5); g.add(c); }
          }
        }
        // panneaux de nom, lampadaires
        for (let q = Math.ceil((a - S.zoneStart) / 60) * 60 + S.zoneStart + 30; q < b; q += 60) {
          const grp = new T.Group();
          for (const dx of [-1.1, 1.1]) { const po = new T.Mesh(W.boxGeo, mat(0x2b2f36)); po.scale.set(0.08, 2.6, 0.08); po.position.set(dx, 1.3, 0); grp.add(po); }
          const nb = new T.Mesh(W.nameGeo, new T.MeshBasicMaterial({ map: nameTex(S.name), side: T.DoubleSide })); nb.position.y = 2.75; nb.rotation.y = Math.PI / 2; grp.add(nb);
          g.userData.dispose.push(nb.material);
          placeAt(grp, org, q, p.c, platTop);
          g.add(grp);
          const lp = new T.Mesh(W.boxGeo, mat(0x3a3f46, 'metal')); lp.scale.set(0.12, 4.5, 0.12); placeAt(lp, org, q + 30, p.c, platTop + 2.25); g.add(lp);
          const lh = new T.Mesh(W.boxGeo, mat(0xfff3d6, 'emit')); lh.scale.set(0.6, 0.12, 0.3); placeAt(lh, org, q + 30, p.c, platTop + 4.5); g.add(lh);
        }
        // numéros de voie
        if (S.zoneStart + 8 >= a && S.zoneStart + 8 < b) p.tracks.forEach(k => {
          const off = (side < 0 ? S.left : S.right)[k];
          const vb = new T.Mesh(W.voieGeo, new T.MeshBasicMaterial({ map: voieTex(S.trackNo(side, k)), side: T.DoubleSide }));
          g.userData.dispose.push(vb.material);
          placeAt(vb, org, S.zoneStart + 14, off + Math.sign(p.c - off) * 2.2, platTop + 2.6, Math.PI);
          g.add(vb);
          const po = new T.Mesh(W.boxGeo, mat(0x2b2f36)); po.scale.set(0.08, 2.4, 0.08); placeAt(po, org, S.zoneStart + 14, off + Math.sign(p.c - off) * 2.2, platTop + 1.2); g.add(po);
        });
      }));
      function add(geo, m) { const me = new T.Mesh(geo, m); g.add(me); g.userData.dispose.push(geo); return me; }
    }
    // repère d'arrêt de notre voie
    if (S.headStop >= q0 && S.headStop < q1 && S.stop) {
      const off = S.left[S.our];
      const side = S.ourPlatSide;
      const grp = new T.Group();
      const po = new T.Mesh(W.boxGeo, mat(0x2b2f36)); po.scale.set(0.08, 2.0, 0.08); po.position.y = 1.0; grp.add(po);
      const bd = new T.Mesh(W.boardGeo, new T.MeshBasicMaterial({ map: boardTex('stop', '') })); bd.position.set(0, 2.2, -0.05); bd.rotation.y = Math.PI; grp.add(bd);
      g.userData.dispose.push(bd.material);
      placeAt(grp, org, S.headStop + 1, off + side * 2.3, 0.7);
      g.add(grp);
    }
    // bâtiment voyageurs
    if (S.s >= q0 && S.s < q1) {
      ext(S.s);
      const lat = -(S.extL + 14);
      const grp = new T.Group();
      const len = S.big ? 110 : S.q >= 6 ? 60 : 30, dep = S.big ? 22 : 12, h = S.big ? 14 : 8;
      const wall = new T.Mesh(W.boxGeo, mat(S.st.lat > 46.5 ? 0xd9cfbd : 0xe7d4b5)); wall.scale.set(dep, h, len); wall.position.y = h / 2 - 1; grp.add(wall);
      const roof = new T.Mesh(W.prismGeo, mat(S.st.lat > 47 ? 0x4f5660 : 0xa4553a)); roof.scale.set(dep + 1, 3.5, len + 1); roof.position.y = h - 1; grp.add(roof);
      for (let k = 0; k < Math.floor(len / 5); k++) { const w = new T.Mesh(W.boxGeo, mat(0x26323e, 'glass')); w.scale.set(0.1, h * 0.35, 2.2); w.position.set(dep / 2 + 0.01, h * 0.45, -len / 2 + 2.5 + k * 5); grp.add(w); }
      const nb = new T.Mesh(new T.PlaneGeometry(Math.min(len * 0.6, 26), 2.6), new T.MeshBasicMaterial({ map: nameTex(S.name) }));
      nb.position.set(dep / 2 + 0.05, h - 2.6, 0); nb.rotation.y = Math.PI / 2; grp.add(nb);
      g.userData.dispose.push(nb.geometry, nb.material);
      if (S.big) { const clock = new T.Mesh(W.cylGeo, mat(0xf4f4f4)); clock.scale.set(1.6, 0.2, 1.6); clock.rotation.z = Math.PI / 2; clock.position.set(dep / 2 + 0.2, h + 2.2, 0); grp.add(clock); const tw = new T.Mesh(W.boxGeo, mat(0xd9cfbd)); tw.scale.set(6, 8, 6); tw.position.set(0, h + 1.5, 0); grp.add(tw); }
      placeAt(grp, org, S.s, lat, 0);
      g.add(grp);
      // trains en stationnement sur les voies de droite
      const rnd = TS.rng(Math.floor(S.s));
      S.right.forEach((off, k) => {
        if (k === 0 || rnd() > 0.45) return;
        const ty = TS.BOT_TYPES[['ter', 'tgv', 'ic'][Math.floor(rnd() * 3)]];
        const c = TS.Models.botConsist(ty, rnd);
        const nV = Math.min(c.vehicles.length, 5);
        for (let i = 0; i < nV; i++) {
          const v = c.vehicles[i];
          const m = TS.Models.vehicle(v);
          const q = S.zoneStart + 20 + c.len - v.off - v.len / 2;
          if (q > S.zoneEnd) continue;
          placeAt(m, org, q, off, 0.17, Math.PI);
          g.add(m);
        }
      });
    }
  }

  /* ── Arbres et maisons ── */
  function scatter(g, org, q0, q1, ci) {
    const rnd = TS.rng(ci * 7919 + 13);
    const trees = [], houses = [];
    const N = 260;
    for (let i = 0; i < N; i++) {
      const q = q0 + rnd() * CH;
      const side = rnd() < 0.5 ? -1 : 1;
      const e = ext(q);
      const lat = side * (e[side < 0 ? 0 : 1] + 14 + Math.pow(rnd(), 1.6) * 420);
      const dens = TS.noise2(q / 600, lat / 600);
      const p = dens > 0.6 ? 0.95 : dens > 0.45 ? 0.12 : 0.04;
      if (rnd() > p) continue;
      trees.push([q, lat, 0.7 + rnd() * 0.8, rnd() < (dens > 0.6 ? 0.4 : 0.15) ? 1 : 0, rnd()]);
    }
    // hameaux / villages / villes autour des gares
    const spots = [];
    R.villages.forEach(v => { if (v.s > q0 - 200 && v.s < q1 + 200) spots.push({ s: v.s, side: v.side, n: v.size, d: v.d, r: 160 }); });
    R.stations.forEach(S => { if (S.s > q0 - 700 && S.s < q1 + 700) { spots.push({ s: S.s, side: -1, n: S.big ? 90 : 35, d: 20, r: S.big ? 600 : 300 }); spots.push({ s: S.s, side: 1, n: S.big ? 70 : 20, d: 25, r: S.big ? 550 : 250 }); } });
    spots.forEach(sp => {
      for (let i = 0; i < sp.n; i++) {
        const q = sp.s + (rnd() - 0.5) * 2 * sp.r;
        if (q < q0 || q >= q1) continue;
        const e = ext(q);
        const lat = sp.side * (e[sp.side < 0 ? 0 : 1] + sp.d + rnd() * sp.r * 0.6);
        houses.push([q, lat, rnd(), rnd(), rnd()]);
      }
    });
    const d = new T.Object3D();
    if (trees.length) {
      const trunk = new T.InstancedMesh(W.trunkGeo, W.trunkMat, trees.length);
      const crowns = [new T.InstancedMesh(W.crownGeo, W.leafMat, trees.length), new T.InstancedMesh(W.coneGeo, W.leafMat, trees.length)];
      const cnt = [0, 0];
      const col = new T.Color(0.3, 0.45, 0.2);
      crowns.forEach(cm => cm.setColorAt(0, col));   // instanceColor toujours présent (programme partagé)
      trees.forEach(([q, lat, sc, type, c], i) => {
        const p = R.point(q, lat, 0, {});
        const y = terrainY(q, lat);
        d.position.set(p.x - org.x, y - org.y, p.z - org.z); d.rotation.set(0, c * 6, 0); d.scale.set(sc, sc * (type ? 1.3 : 1), sc); d.updateMatrix();
        trunk.setMatrixAt(i, d.matrix);
        const cm = crowns[type];
        cm.setMatrixAt(cnt[type], d.matrix);
        col.setRGB(0.2 + c * 0.12, 0.33 + c * 0.14, 0.14 + c * 0.06);
        if (type) col.setRGB(0.13 + c * 0.05, 0.25 + c * 0.06, 0.13);
        cm.setColorAt(cnt[type], col);
        cnt[type]++;
      });
      crowns.forEach((cm, t) => { cm.count = cnt[t]; cm.visible = cnt[t] > 0; cm.instanceColor.needsUpdate = true; });
      g.add(trunk, crowns[0], crowns[1]);
      g.userData.dispose.push(trunk, crowns[0], crowns[1]);
    }
    if (houses.length) {
      const walls = new T.InstancedMesh(W.boxGeo, W.wallMat, houses.length);
      const roofs = new T.InstancedMesh(W.prismGeo, W.roofHMat, houses.length);
      const col = new T.Color();
      houses.forEach(([q, lat, a, b, c], i) => {
        const p = R.point(q, lat, 0, {});
        const y = terrainY(q, lat);
        const w = 7 + a * 6, l = 8 + b * 8, h = 5 + (c > 0.8 ? 6 : 0) + a * 2;
        d.position.set(p.x - org.x, y - org.y + h / 2 - 0.3, p.z - org.z); d.rotation.set(0, p.h + (c > 0.5 ? Math.PI / 2 : 0) + (b - 0.5) * 0.3, 0); d.scale.set(w, h, l); d.updateMatrix();
        walls.setMatrixAt(i, d.matrix);
        col.setRGB(0.82 + a * 0.12, 0.78 + b * 0.1, 0.68 + c * 0.1); walls.setColorAt(i, col);
        d.position.y += h / 2; d.scale.set(w + 0.6, 2.5 + b, l + 0.6); d.updateMatrix(); roofs.setMatrixAt(i, d.matrix);
        if (c < 0.5) col.setRGB(0.55 + a * 0.1, 0.27, 0.18); else col.setRGB(0.28, 0.3, 0.34);
        roofs.setColorAt(i, col);
      });
      walls.instanceColor.needsUpdate = true; roofs.instanceColor.needsUpdate = true;
      g.add(walls, roofs); g.userData.dispose.push(walls, roofs);
    }
  }

  function disposeChunk(c) {
    c.userData.dispose.forEach(x => { if (x.dispose) x.dispose(); });
    c.userData.sig.forEach(j => { delete sigObjs[j]; });
    c.traverse(o => { if (o.isMesh && o.material && o.material.map && o.material.map._own) o.material.map.dispose(); });
  }

  /* ══════════ Cabine ══════════ */
  function buildCab() {
    const L = cfg.loco;
    const g = new T.Group();
    const m = L.model;
    const center = L.kind === 'tgv' ? 0 : -0.55;   // décalage du centre de cabine (x+ = gauche)
    const half = L.kind === 'tgv' ? 1.15 : m === 'r2n' || m === 'agc' ? 1.35 : 1.42;
    const interior = mat(0x34373c), dash = mat(0x202225), trim = mat(0x4a4e55), glassM = new T.MeshBasicMaterial({ color: 0x9fc4d8, transparent: true, opacity: 0.06, depthWrite: false });
    const B = (w, h, d, m_, x, y, z, rx, ry, rz) => { const o = new T.Mesh(W.boxGeo, m_); o.scale.set(w, h, d); o.position.set(x, y, z); o.rotation.set(rx || 0, ry || 0, rz || 0); g.add(o); return o; };
    const zf = L.kind === 'tgv' ? 1.25 : 1.0;
    // pupitre (dessus incliné)
    B(half * 2 + 0.4, 0.08, 1.0, dash, center, -0.5, zf - 0.32, -0.38);
    B(half * 2 + 0.4, 0.5, 0.1, dash, center, -0.76, zf + 0.12);
    // petits écrans éteints / boîtiers
    B(0.5, 0.25, 0.06, mat(0x0b0d10), center + 0.65, -0.38, zf - 0.32, -0.6);
    B(0.4, 0.2, 0.05, mat(0x0b0d10), center - 0.75, -0.39, zf - 0.32, -0.6);
    // pavillon
    B(half * 2 + 0.3, 0.06, 2.6, interior, center, 0.62, -0.3);
    B(half * 2 + 0.3, 0.16, 0.2, trim, center, 0.55, zf - 0.08);
    // montants
    const pillar = (x) => B(0.14, 1.3, 0.14, trim, x, 0.02, zf - 0.18, L.kind === 'tgv' ? -0.5 : -0.12);
    pillar(center + half); pillar(center - half);
    if (L.kind !== 'tgv' && m !== 'r2n' && m !== 'agc') pillar(center);
    // pare-soleil
    B(0.8, 0.07, 0.07, mat(0x1c1d20), center + 0.55, 0.5, zf - 0.22);   // store pare-soleil enroulé
    // essuie-glace
    B(0.02, 0.55, 0.02, mat(0x111111), center + 0.25, -0.3, zf - 0.1, -0.12, 0, 1.2);
    // parois latérales
    for (const sx of [-1, 1]) {
      const x = center + sx * (half + 0.12);
      B(0.08, 1.0, 2.6, interior, x, -0.95, -0.3);
      B(0.08, 0.25, 2.6, interior, x, 0.5, -0.3);
      B(0.08, 1.1, 0.12, trim, x, -0.05, -0.75);
      const gl = new T.Mesh(new T.PlaneGeometry(1.5, 0.9), glassM); gl.position.set(x, -0.03, 0.1); gl.rotation.y = Math.PI / 2; g.add(gl);
    }
    // pare-brise (léger reflet)
    const ws = new T.Mesh(new T.PlaneGeometry(half * 2, 1.2), glassM); ws.position.set(center, 0.03, zf - 0.15); ws.rotation.x = L.kind === 'tgv' ? -0.5 : -0.12; ws.rotation.y = Math.PI; g.add(ws);
    // rétroviseur intérieur / boîtier radio
    B(0.35, 0.18, 0.2, mat(0x1b1c1f), center - 0.2, 0.47, zf - 0.35);
    return g;
  }

  /* ══════════ Initialisation ══════════ */
  W.init = function (container, route, config) {
    R = route; cfg = config;
    renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    container.innerHTML = '';
    container.append(renderer.domElement);
    scene = new T.Scene();
    camera = new T.PerspectiveCamera(62, 1, 0.08, 6000);
    scene.fog = new T.Fog(0xb9d1e6, 600, 4200);
    hemi = new T.HemisphereLight(0xdfeeff, 0x5c5a40, 0.75); scene.add(hemi);
    sun = new T.DirectionalLight(0xfff2dc, 0.95); sun.position.set(0.5, 1, 0.3); scene.add(sun);
    scene.add(new T.AmbientLight(0xffffff, 0.12));
    // ciel
    const sg = new T.SphereGeometry(5000, 24, 12);
    const sc = []; const pos = sg.attributes.position;
    for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / 5000; const t = Math.max(0, y); sc.push(0.72 - t * 0.45, 0.82 - t * 0.35, 0.93 - t * 0.1); }
    sg.setAttribute('color', new T.Float32BufferAttribute(sc, 3));
    sky = new T.Mesh(sg, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false, depthWrite: false }));
    scene.add(sky);
    makeTextures();
    // matériaux et géométries partagés
    W.terrainMat = new T.MeshLambertMaterial({ vertexColors: true });
    W.ballastMat = new T.MeshLambertMaterial({ map: TX.ballast });
    W.sleeperMat = new T.MeshLambertMaterial({ map: TX.sleeper, alphaTest: 0.5, transparent: false });
    W.railMat = new T.MeshPhongMaterial({ color: 0x8c8f94, shininess: 80, specular: 0x999999 });
    W.platMat = new T.MeshLambertMaterial({ map: TX.platform });
    W.whiteMat = new T.MeshBasicMaterial({ color: 0xf2f2f2 });
    W.roofMat = new T.MeshLambertMaterial({ color: 0x5b636d, side: T.DoubleSide });
    W.poleMat = new T.MeshPhongMaterial({ color: 0x8e9399, shininess: 30 });
    W.wireMat = new T.LineBasicMaterial({ color: 0x3c3f45, transparent: true, opacity: 0.75 });
    W.trunkMat = new T.MeshLambertMaterial({ color: 0x4b3a2a });
    W.leafMat = new T.MeshLambertMaterial({ color: 0xffffff });
    W.wallMat = new T.MeshLambertMaterial({ color: 0xffffff });
    W.roofHMat = new T.MeshLambertMaterial({ color: 0xffffff });
    W.boxGeo = new T.BoxGeometry(1, 1, 1);
    W.cylGeo = new T.CylinderGeometry(0.5, 0.5, 1, 10);
    W.lampGeo = new T.CircleGeometry(0.11, 14);
    W.boardGeo = new T.PlaneGeometry(0.9, 0.9);
    W.nameGeo = new T.PlaneGeometry(3.4, 0.64);
    W.voieGeo = new T.PlaneGeometry(1.1, 0.55);
    W.poleGeo = new T.BoxGeometry(0.32, 8.4, 0.32); W.poleGeo.translate(0, 4.2, 0);
    W.armGeo = new T.BoxGeometry(1, 0.12, 0.12);
    W.trunkGeo = new T.CylinderGeometry(0.18, 0.25, 3, 6); W.trunkGeo.translate(0, 1.5, 0);
    W.crownGeo = new T.IcosahedronGeometry(2.6, 0); W.crownGeo.translate(0, 4.6, 0);
    W.coneGeo = new T.ConeGeometry(2.0, 7, 7); W.coneGeo.translate(0, 5.5, 0);
    const pr = new T.Shape(); pr.moveTo(-0.5, 0); pr.lineTo(0.5, 0); pr.lineTo(0, 1); pr.lineTo(-0.5, 0);
    W.prismGeo = new T.ExtrudeGeometry(pr, { depth: 1, bevelEnabled: false }); W.prismGeo.translate(0, 0, -0.5);
    // train du joueur
    playerCars = cfg.vehicles.map(v => { const m = TS.Models.vehicle(v); scene.add(m); return { v, m }; });
    cab = buildCab(); cabGroup = new T.Group(); cabGroup.add(cab); scene.add(cabGroup);
    cabGroup.add(camera);
    camera.rotation.order = 'YXZ';
    headLight = new T.SpotLight(0xfff4dd, 0, 420, 0.32, 0.6, 1.2);
    cabGroup.add(headLight); cabGroup.add(headLight.target); headLight.position.set(0, -1.6, 1.5); headLight.target.position.set(0, -2.5, 60);
    W.resize();
    window.addEventListener('resize', W.resize);
    chunks.clear();
  };

  W.resize = function () {
    if (!renderer) return;
    const el = renderer.domElement.parentElement;
    const w = el.clientWidth, h = el.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  };

  // place un groupe par rapport à l'origine flottante
  function setOrg(grp) { const o = grp.userData.org; grp.position.set(o.x - O.x, o.y - O.y, o.z - O.z); }

  W.preload = function (s, done) {
    O.s = s; Object.assign(O, R.sample(s, {}));
    const need = [];
    for (let c = Math.floor((s - BEHIND) / CH); c <= Math.floor((s + AHEAD) / CH); c++) need.push(c);
    let i = 0;
    (function step() {
      const t0 = performance.now();
      while (i < need.length && performance.now() - t0 < 30) { ensure(need[i]); i++; }
      if (i < need.length) setTimeout(step, 0); else done();
    })();
  };
  function ensure(c) {
    if (chunks.has(c) || c < -6) return;
    if (c * CH > R.len + 2000) return;
    const g = buildChunk(c);
    chunks.set(c, g); setOrg(g); scene.add(g);
  }

  /* placement d'un véhicule entre deux abscisses */
  const vA = new T.Vector3(), vB = new T.Vector3();
  function placeVeh(m, qf, qb, path, yoff) {
    const a = R.point(qf, R.lat(qf, path), 0, tmpA), ax = a.x, ay = a.y, az = a.z;
    const b = R.point(qb, R.lat(qb, path), 0, tmpB);
    vA.set(ax - O.x, ay - O.y + yoff, az - O.z); vB.set(b.x - O.x, b.y - O.y + yoff, b.z - O.z);
    m.position.copy(vA).add(vB).multiplyScalar(0.5);
    m.lookAt(vA);
  }

  /* ══════════ Mise à jour par image ══════════ */
  let viewYaw = 0, viewPitch = -0.05, extYaw = 0.6, extPitch = 0.25, extDist = 40;
  W.look = function (dx, dy, mode) {
    if (mode === 'cab') { viewYaw = TS.clamp(viewYaw - dx * 0.004, -2.2, 2.2); viewPitch = TS.clamp(viewPitch - dy * 0.004, -0.7, 0.5); }
    else { extYaw -= dx * 0.006; extPitch = TS.clamp(extPitch + dy * 0.004, 0.02, 1.3); }
  };
  W.zoom = d => { extDist = TS.clamp(extDist * (1 + d * 0.001), 12, 400); };
  W.resetLook = () => { viewYaw = 0; viewPitch = -0.05; };

  let sway = 0;
  W.update = function (dt, mode) {
    const P = TS.Sim.P;
    // origine flottante
    if (Math.abs(P.s - O.s) > 1500) {
      O.s = P.s; Object.assign(O, R.sample(P.s, {}));
      chunks.forEach(setOrg);
    }
    // tronçons
    const cMin = Math.floor((P.s - BEHIND) / CH), cMax = Math.floor((P.s + AHEAD) / CH);
    let built = 0;
    for (let c = cMin; c <= cMax && built < 2; c++) if (!chunks.has(c) && c * CH < R.len + 2000 && c >= -6) { ensure(c); built++; }
    chunks.forEach((g, c) => { if (c < cMin - 1 || c > cMax + 1) { scene.remove(g); disposeChunk(g); chunks.delete(c); } });

    // signaux visibles
    for (let j = Math.max(0, P.nextSig - 2); j < Math.min(R.signals.length, P.nextSig + 8); j++) {
      const lst = sigObjs[j]; if (!lst) continue;
      const sg = R.signals[j];
      const asp = TS.Sim.aspect(j);
      lst.forEach(o => {
        if (sg.type === 'CS' && o.track !== R.stations[sg.st].our) setLamps(o, ASPECT_LAMPS.C);
        else setLamps(o, ASPECT_LAMPS[asp] || ['R']);
      });
    }

    // train du joueur
    const pa = P.path;
    playerCars.forEach(({ v, m }, i) => {
      const qf = P.s - v.off, qb = qf - v.len;
      placeVeh(m, qf, qb, pa, 0.17);
      m.visible = mode !== 'cab' || i > 0;
      if (m.userData.panto) m.userData.panto.set(i === 0 || v.rear ? P.panto * (v.rear || cfg.loco.kind !== 'tgv' ? 1 : 0) : 0);
      if (m.userData.lw) { const front = i === 0; m.userData.lw.forEach(l => l.visible = front && P.feux); m.userData.lr.forEach(l => l.visible = !front && P.feux); }
    });
    // bots
    const live = new Set();
    TS.Sim.bots.forEach(b => {
      if (Math.abs(b.s - P.s) > 5000) return;
      live.add(b.id);
      let e = botMeshes.get(b.id);
      if (!e) { e = makeTrain(b.ty, b.id); botMeshes.set(b.id, e); b.len = e.len; }
      e.cars.forEach(({ v, m }) => placeVeh(m, b.s - v.off, b.s - v.off - v.len, b.path, 0.17));
    });
    botMeshes.forEach((e, id) => { if (!live.has(id)) { e.cars.forEach(c => scene.remove(c.m)); botMeshes.delete(id); } });
    const liveO = new Set();
    TS.Sim.opp.forEach(o => {
      liveO.add(o.id);
      let e = oppMeshes.get(o.id);
      if (!e) { e = makeTrain(o.ty, o.id); oppMeshes.set(o.id, e); o.len = e.len; }
      e.cars.forEach(({ v, m }) => placeVeh(m, o.s + v.off, o.s + v.off + v.len, OPP_PATH, 0.17));
    });
    oppMeshes.forEach((e, id) => { if (!liveO.has(id)) { e.cars.forEach(c => scene.remove(c.m)); oppMeshes.delete(id); } });

    // caméra
    const head = R.point(P.s, R.lat(P.s, pa), 0, {});
    const L = cfg.loco;
    const back = L.kind === 'tgv' ? 4.3 : L.model === 'r2n' || L.model === 'agc' ? 1.9 : L.model === 'ccdiesel' ? 2.3 : 1.6;
    const qc = P.s - back;
    const pc = R.point(qc, R.lat(qc, pa), 0, {});
    const ahead = R.point(qc + 6, R.lat(qc + 6, pa), 0, {});
    const hdg = Math.atan2(ahead.x - pc.x, ahead.z - pc.z);
    const grade = (ahead.y - pc.y) / 6;
    sway += dt * (1 + P.v * 0.3);
    const vib = P.v > 0.5 ? Math.sin(sway * 7.3) * 0.004 * Math.min(1, P.v / 30) + Math.sin(sway * 2.1) * 0.006 * Math.min(1, P.v / 40) : 0;
    const eye = L.kind === 'tgv' ? 2.95 : L.model === 'r2n' ? 3.25 : L.model === 'agc' ? 2.85 : 3.15;
    cabGroup.position.set(pc.x - O.x, pc.y - O.y + eye + 0.17 + vib, pc.z - O.z);
    cabGroup.rotation.set(0, 0, 0); cabGroup.rotation.order = 'YXZ';
    cabGroup.rotation.y = hdg; cabGroup.rotation.x = -Math.atan(grade);
    if (mode === 'cab') {
      cab.visible = true;
      if (camera.parent !== cabGroup) cabGroup.add(camera);
      camera.position.set(0, 0, 0);
      camera.rotation.set(viewPitch, Math.PI + viewYaw, Math.sin(sway * 1.3) * 0.002 * Math.min(1, P.v / 30));
      camera.fov = 62; camera.near = 0.08;
    } else {
      cab.visible = false;
      if (camera.parent !== scene) scene.add(camera);
      const mid = R.point(P.s - Math.min(P.len, 60) / 2, R.lat(P.s - 20, pa), 2, {});
      const yaw = hdg + extYaw;
      camera.position.set(mid.x - O.x - Math.sin(yaw) * extDist * Math.cos(extPitch), mid.y - O.y + Math.sin(extPitch) * extDist + 1.5, mid.z - O.z - Math.cos(yaw) * extDist * Math.cos(extPitch));
      const gy = terrainY(P.s, 0) - O.y + 1.5;
      if (camera.position.y < gy) camera.position.y = gy;
      camera.lookAt(mid.x - O.x, mid.y - O.y, mid.z - O.z);
      camera.fov = 55; camera.near = 0.3;
    }
    camera.updateProjectionMatrix();
    sky.position.copy(camera.getWorldPosition(vA));

    // éclairage selon l'heure
    const hr = (TS.Sim.time / 3600) % 24;
    const day = TS.clamp(Math.min((hr - 5.6) / 1.6, (21.2 - hr) / 1.6), 0, 1);
    const k = 0.15 + 0.85 * day;
    sun.intensity = 0.95 * day; hemi.intensity = 0.2 + 0.55 * k;
    const fogC = new T.Color().setRGB(0.1 + 0.62 * k, 0.12 + 0.7 * k, 0.18 + 0.73 * k);
    scene.fog.color.copy(fogC); renderer.setClearColor(fogC);
    sky.material.color.setRGB(k, k, Math.min(1, k + 0.08));
    const sa = (hr - 6) / 12 * Math.PI;
    sun.position.set(Math.cos(sa) * 0.6, Math.max(0.15, Math.sin(sa)), 0.4);
    headLight.intensity = P.feux ? (day < 0.6 ? 2.2 * (1 - day) : 0) : 0;

    renderer.render(scene, camera);
  };
  const OPP_PATH = { side: 1, pick: null };

  function makeTrain(ty, id) {
    const c = TS.Models.botConsist(ty, TS.rng(String(id).length * 31 + (typeof id === 'number' ? id : Math.floor(Math.random() * 999))));
    const cars = c.vehicles.map(v => { const m = TS.Models.vehicle(v); scene.add(m); if (m.userData.lw) { const front = !v.rear; m.userData.lw.forEach(l => l.visible = front); m.userData.lr.forEach(l => l.visible = !front); } if (m.userData.panto) m.userData.panto.set(v.rear || v === c.vehicles[0] && ty.model !== 'tgv' ? 1 : 0); return { v, m }; });
    return { cars, len: c.len };
  }

  W.dispose = function () {
    if (!renderer) return;
    chunks.forEach(g => { scene.remove(g); disposeChunk(g); });
    chunks.clear(); botMeshes.clear(); oppMeshes.clear();
    renderer.dispose();
    window.removeEventListener('resize', W.resize);
    renderer.domElement.remove();
    renderer = null;
  };
  W.canvas = () => renderer && renderer.domElement;
  W.scene = () => scene;
  return W;
})();

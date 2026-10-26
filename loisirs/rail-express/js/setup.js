/* ═══════════════════════════════════════════════════════════
   SIMULATEUR TRAIN — CONFIGURATION DU SERVICE
   Voyage → engin moteur → composition → itinéraire → départ
   ═══════════════════════════════════════════════════════════ */
'use strict';

TS.Setup = (function () {
  const $ = s => document.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const st = {
    step: 0, cat: null, loco: null, locoLiv: null, wagon: null, wagonLiv: null, count: 8, cars: [],
    from: null, to: null, corridor: [], stops: {}, hour: 8, help: true, pickMode: 'from', sel: 0,
  };
  try { const sv = JSON.parse(localStorage.getItem('train:setup') || 'null'); if (sv) Object.assign(st, sv, { step: 0, sel: 0 }); } catch (e) { }
  function save() { try { localStorage.setItem('train:setup', JSON.stringify({ cat: st.cat, loco: st.loco, locoLiv: st.locoLiv, wagon: st.wagon, wagonLiv: st.wagonLiv, count: st.count, cars: st.cars, from: st.from, to: st.to, stops: st.stops, hour: st.hour, help: st.help })); } catch (e) { } }

  /* ══════════ Composition ══════════ */
  TS.buildConsist = function (c) {
    const L = TS.LOCO[c.loco];
    const W = TS.WAGONS[c.wagon];
    const v = [];
    const lliv = c.locoLiv || L.liv[0].slice(1);
    v.push({ kind: 'loco', model: L.model, len: L.len, mass: L.mass, liv: lliv, head: true, trac: L.trac });
    const wliv = W.fixed ? lliv : (c.wagonLiv || W.liv[0].slice(1));
    for (let i = 0; i < c.count; i++) {
      const opt = c.cars[i] !== undefined ? c.cars[i] : W.def;
      let m = Array.isArray(W.m) ? W.m[opt === 1 ? 1 : 0] : W.m + (W.seats || 0) * 0.075 * 0.7;
      v.push({ kind: 'car', model: W.model, len: W.len, mass: m, liv: wliv, opt, optName: W.opts[opt], idx: i });
    }
    if (L.kind !== 'loco') v.push({ kind: 'loco', model: L.model, len: L.len, mass: L.mass, liv: lliv, rear: true, trac: L.trac });
    let len = 0, mass = 0;
    v.forEach((x, i) => { x.off = len; len += x.len + (i < v.length - 1 ? 0.8 : 0); mass += x.mass; });
    const loaded = W.cat === 'fret' ? v.filter(x => x.kind === 'car' && x.opt === 1).length / Math.max(1, c.count) : 0;
    const vmax = Math.min(L.vmax, W.vmax, W.cat === 'fret' && loaded > 0.5 ? 100 : 999);
    const adh = L.kind === 'tgv' ? L.mass * 2 : L.kind === 'emu' ? mass * 0.5 : L.mass;
    const decel = L.kind === 'tgv' ? 1.05 : L.kind === 'emu' ? 1.0 : W.cat === 'pax' ? 0.92 : 0.5 + 0.18 * (1 - loaded);
    const brakedPct = W.cat === 'pax' ? (L.kind === 'tgv' ? 180 : 150) : Math.round(70 + 45 * (1 - loaded));
    const seats = W.cat === 'pax' ? v.filter(x => x.kind === 'car').length * (W.seats || 0) : 0;
    return { vehicles: v, len, mass, vmax, adh, decel, brakedPct, seats, loaded };
  };

  /* ══════════ Dessin latéral d'un véhicule (aperçu) ══════════ */
  function drawSide(ctx, x, y, s, veh, sel) {
    const w = veh.len * s, h = 3.9 * s;
    const [c1, c2] = veh.liv;
    const m = veh.model;
    const accent = c2 === 'mix' ? '#c0392b' : c2;
    ctx.save();
    ctx.translate(x, y);
    // bogies
    ctx.fillStyle = '#1a1b1f';
    const bog = (bx) => { ctx.fillRect(bx - 1.3 * s, h + 0.15 * s, 2.6 * s, 0.55 * s); ctx.beginPath(); ctx.arc(bx - 0.75 * s, h + 0.8 * s, 0.45 * s, 0, 7); ctx.arc(bx + 0.75 * s, h + 0.8 * s, 0.45 * s, 0, 7); ctx.fill(); };
    bog(w * 0.16); bog(w * 0.84);
    const flip = veh.rear;
    if (flip) { ctx.translate(w, 0); ctx.scale(-1, 1); }
    const body = (top, col) => { ctx.fillStyle = col; ctx.fillRect(0, top, w, h - top); };
    if (veh.kind === 'loco') {
      ctx.fillStyle = c1;
      ctx.beginPath();
      if (m === 'tgv') { ctx.moveTo(0, h); ctx.lineTo(0, h * 0.18); ctx.lineTo(w * 0.62, h * 0.1); ctx.quadraticCurveTo(w * 0.97, h * 0.35, w, h); }
      else if (m === 'r2n' || m === 'agc') { ctx.moveTo(0, h); ctx.lineTo(0, 0.1 * h); ctx.lineTo(w * 0.86, 0.1 * h); ctx.quadraticCurveTo(w, 0.2 * h, w, h); }
      else if (m === 'bbnez') { ctx.moveTo(0, h); ctx.lineTo(0, 0.12 * h); ctx.lineTo(w * 0.84, 0.12 * h); ctx.lineTo(w, 0.5 * h); ctx.lineTo(w, h); }
      else { ctx.moveTo(0, h); ctx.lineTo(0, 0.12 * h); ctx.lineTo(w * 0.9, 0.12 * h); ctx.lineTo(w, 0.35 * h); ctx.lineTo(w, h); }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = accent; ctx.fillRect(0, h * 0.62, w * 0.98, h * 0.14);
      ctx.fillStyle = '#16202c';
      if (m === 'tgv') { ctx.beginPath(); ctx.moveTo(w * 0.7, h * 0.18); ctx.lineTo(w * 0.86, h * 0.24); ctx.lineTo(w * 0.9, h * 0.4); ctx.lineTo(w * 0.72, h * 0.36); ctx.fill(); }
      else ctx.fillRect(w * 0.86, h * 0.2, w * 0.1, h * 0.22);
      if (veh.trac === 'elec' && m !== 'r2n') { ctx.strokeStyle = '#444'; ctx.lineWidth = Math.max(1, s * 0.12); ctx.beginPath(); ctx.moveTo(w * 0.3, h * 0.08); ctx.lineTo(w * 0.42, -h * 0.25); ctx.lineTo(w * 0.52, h * 0.08); ctx.stroke(); }
      if (m === 'r2n' || m === 'agc') { ctx.fillStyle = '#1b2733'; for (let i = 0; i < 4; i++) ctx.fillRect(w * (0.1 + i * 0.18), h * 0.28, w * 0.12, h * 0.2); }
    } else if (['corail', 'vb2n', 'duplex', 'r2nm', 'agcm'].includes(m)) {
      ctx.fillStyle = c1; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(0, 0.08 * h, w, 0.92 * h, s * 0.6) : ctx.rect(0, 0.08 * h, w, 0.92 * h); ctx.fill();
      ctx.fillStyle = accent; ctx.fillRect(0, h * 0.7, w, h * 0.1);
      ctx.fillStyle = '#1b2733';
      const two = m === 'vb2n' || m === 'duplex' || m === 'r2nm';
      const n = Math.floor(veh.len / 2.4);
      for (let i = 1; i < n - 1; i++) {
        ctx.fillRect(i * w / n + s * 0.2, h * (two ? 0.2 : 0.3), w / n - s * 0.5, h * 0.18);
        if (two) ctx.fillRect(i * w / n + s * 0.2, h * 0.5, w / n - s * 0.5, h * 0.16);
      }
      if (veh.opt === 0 && ['corail', 'vb2n', 'duplex', 'r2nm'].includes(m)) { ctx.fillStyle = '#f2c12e'; ctx.fillRect(w * 0.05, h * 0.12, w * 0.9, h * 0.04); }
    } else if (m === 'citerne') {
      ctx.fillStyle = '#2a2b2e'; ctx.fillRect(0, h * 0.78, w, h * 0.12);
      ctx.fillStyle = c1; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(w * 0.04, h * 0.18, w * 0.92, h * 0.6, h * 0.3) : ctx.rect(w * 0.04, h * 0.18, w * 0.92, h * 0.6); ctx.fill();
      ctx.fillStyle = accent; ctx.fillRect(w * 0.04, h * 0.44, w * 0.92, h * 0.06);
    } else if (m === 'conteneur') {
      ctx.fillStyle = '#3a3c40'; ctx.fillRect(0, h * 0.8, w, h * 0.1);
      if (veh.opt === 1) {
        const cols = c2 === 'mix' ? ['#2c5aa0', '#a8322b', '#d9a521', '#3d7a4a', '#7b5d9a', '#5e6d74'] : [c2, c2];
        const ci = (veh.idx || 0) * 2;
        ctx.fillStyle = cols[ci % cols.length]; ctx.fillRect(w * 0.03, h * 0.18, w * 0.46, h * 0.62);
        ctx.fillStyle = cols[(ci + 1) % cols.length]; ctx.fillRect(w * 0.51, h * 0.18, w * 0.46, h * 0.62);
      }
    } else if (m === 'tombereau' || m === 'cereales') {
      ctx.fillStyle = c1; ctx.fillRect(0, h * 0.25, w, h * 0.65);
      if (m === 'cereales') { ctx.beginPath(); ctx.moveTo(0, h * 0.25); ctx.lineTo(w * 0.5, h * 0.05); ctx.lineTo(w, h * 0.25); ctx.fill(); }
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1;
      for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(w * i / 6, h * 0.25); ctx.lineTo(w * i / 6, h * 0.9); ctx.stroke(); }
      if (m === 'tombereau' && veh.opt === 1) { ctx.fillStyle = '#5b5148'; ctx.beginPath(); ctx.moveTo(w * 0.04, h * 0.25); ctx.quadraticCurveTo(w * 0.5, 0, w * 0.96, h * 0.25); ctx.fill(); }
    } else if (m === 'couvert') {
      ctx.fillStyle = c1; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(0, h * 0.05, w, h * 0.85, s) : ctx.rect(0, h * 0.05, w, h * 0.85); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.3)'; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(w * i / 4, h * 0.08); ctx.lineTo(w * i / 4, h * 0.88); ctx.stroke(); }
    } else if (m === 'autos') {
      ctx.fillStyle = c1; ctx.fillRect(0, h * 0.85, w, h * 0.06); ctx.fillRect(0, h * 0.42, w, h * 0.05);
      ctx.fillRect(0, 0, s * 0.4, h * 0.9); ctx.fillRect(w - s * 0.4, 0, s * 0.4, h * 0.9);
      if (veh.opt === 1) {
        const cc = ['#e8e8e8', '#b71c1c', '#263238', '#1565c0', '#9e9e9e'];
        for (let i = 0; i < 5; i++) { ctx.fillStyle = cc[(i + (veh.idx || 0)) % 5]; ctx.fillRect(s * 0.8 + i * w / 5.4, h * 0.28, w / 6.5, h * 0.13); ctx.fillStyle = cc[(i + 2 + (veh.idx || 0)) % 5]; ctx.fillRect(s * 0.8 + i * w / 5.4, h * 0.7, w / 6.5, h * 0.14); }
      }
    }
    ctx.restore();
    if (sel) { ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--ui-accent') || '#22c55e'; ctx.lineWidth = 2; ctx.strokeRect(x - 3, y - 6, w + 6, h + 18); }
  }
  TS.drawSide = drawSide;

  /* ══════════ Écrans ══════════ */
  const steps = [stepVoyage, stepLoco, stepCompo, stepRoute, stepDepart];
  function render() {
    document.querySelectorAll('#suSteps li').forEach((li, i) => {
      li.classList.toggle('on', i === st.step); li.classList.toggle('done', i < st.step);
      li.onclick = () => { if (i < st.step || canGo(i)) { st.step = i; render(); } };
    });
    const b = $('#suBody'); b.innerHTML = ''; b.scrollTop = 0;
    steps[st.step](b);
    $('#suPrev').style.visibility = st.step ? 'visible' : 'hidden';
    $('#suNext').textContent = st.step === 4 ? 'Prendre le service ▶' : 'Suivant →';
    updateNav();
  }
  function canGo(i) {
    if (i >= 1 && !st.cat) return false;
    if (i >= 2 && !(st.loco && TS.LOCO[st.loco] && TS.LOCO[st.loco].cat === st.cat)) return false;
    if (i >= 3 && !st.wagon) return false;
    if (i >= 4 && !(st.from && st.to && st.from !== st.to)) return false;
    return true;
  }
  function updateNav() {
    $('#suNext').disabled = !canGo(st.step + 1 > 4 ? 4 : st.step + 1);
    const parts = [];
    if (st.cat) parts.push(st.cat === 'pax' ? 'Voyageurs' : 'Marchandises');
    if (st.loco && canGo(2)) parts.push(TS.LOCO[st.loco].name);
    if (st.wagon && canGo(3)) { const c = TS.buildConsist(consistCfg()); parts.push(c.vehicles.length + ' véh. · ' + Math.round(c.len) + ' m · ' + Math.round(c.mass) + ' t'); }
    if (st.from && st.to) parts.push(TS.STATION[st.from].n + ' → ' + TS.STATION[st.to].n);
    $('#suSummary').textContent = parts.join('  ·  ');
  }
  const consistCfg = () => ({ loco: st.loco, locoLiv: st.locoLiv, wagon: st.wagon, wagonLiv: st.wagonLiv, count: st.count, cars: st.cars });

  /* 1 — Voyage */
  function stepVoyage(b) {
    b.append(el('h2', 'su-title', 'Quel type de service ?'));
    const g = el('div', 'grid2');
    [['pax', 'Voyageurs', 'TGV, Intercités, TER : arrêts en gare, portes, horaire et ponctualité.', '<path d="M6 30V12a6 6 0 0 1 6-6h24a6 6 0 0 1 6 6v18z" /><path d="M10 12h28v9H10z" opacity=".35"/><circle cx="15" cy="26" r="2"/><circle cx="33" cy="26" r="2"/><path d="M10 34l-3 6M38 34l3 6"/>'],
     ['fret', 'Marchandises', 'Trains lourds jusqu\'à 750 m : citernes, conteneurs, céréales… Freinage long.', '<path d="M4 14h12v14H4zM18 18h12v10H18zM32 16h12v12H32z"/><circle cx="8" cy="31" r="2"/><circle cx="14" cy="31" r="2"/><circle cx="22" cy="31" r="2"/><circle cx="28" cy="31" r="2"/><circle cx="36" cy="31" r="2"/><circle cx="42" cy="31" r="2"/>']]
      .forEach(([id, t, d, ico]) => {
        const c = el('button', 'card big' + (st.cat === id ? ' sel' : ''), `<svg viewBox="0 0 48 44" class="ico">${ico}</svg><h3>${t}</h3><p>${d}</p>`);
        c.onclick = () => { if (st.cat !== id) { st.cat = id; st.loco = null; st.wagon = null; st.cars = []; } save(); render(); };
        g.append(c);
      });
    b.append(g);
    b.append(el('p', 'note', 'Conseil : la procédure de mise en service complète (batterie, pantographe, disjoncteur, essais de frein, VACMA, KVB…) est guidée par une check-list dans la cabine.'));
  }

  /* 2 — Engin moteur */
  function stepLoco(b) {
    b.append(el('h2', 'su-title', 'Choisissez l\'engin moteur'));
    const g = el('div', 'grid3');
    TS.LOCOS.filter(l => l.cat === st.cat).forEach(l => {
      const kind = l.kind === 'loco' ? 'Locomotive' : l.kind === 'tgv' ? 'Rame TGV' : 'Automotrice';
      const c = el('button', 'card loco' + (st.loco === l.id ? ' sel' : ''));
      const cv = el('canvas', 'side'); cv.width = 520; cv.height = 110;
      c.innerHTML = `<h3>${esc(l.name)}</h3><p>${esc(l.sub)}</p>`;
      c.prepend(cv);
      c.append(el('div', 'specs', `<span class="tag ${l.trac}">${l.trac === 'elec' ? 'Électrique' + (l.bi ? ' · bicourant' : '') : 'Diesel'}</span><span class="tag">${kind}</span>
        <dl><dt>V max</dt><dd>${l.vmax} km/h</dd><dt>Puissance</dt><dd>${l.power.toLocaleString('fr-FR')} kW</dd><dt>Effort</dt><dd>${l.fmax} kN</dd><dt>Masse</dt><dd>${l.mass} t</dd></dl>`));
      c.onclick = () => {
        if (st.loco !== l.id) {
          st.loco = l.id; st.locoLiv = l.liv[0].slice(1);
          if (l.kind !== 'loco') { st.wagon = l.wagon; st.count = l.wdef; st.cars = []; }
          else if (!l.wagons.includes(st.wagon)) { st.wagon = null; st.cars = []; }
        }
        save(); render();
      };
      g.append(c);
      requestAnimationFrame(() => {
        const ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height);
        const veh = { kind: 'loco', model: l.model, len: l.len, liv: (st.loco === l.id && st.locoLiv) || l.liv[0].slice(1), trac: l.trac };
        const s = 22; drawSide(ctx, (cv.width - l.len * s) / 2, 8, s, veh);
      });
    });
    b.append(g);
    const L = st.loco && TS.LOCO[st.loco];
    if (L && L.cat === st.cat) {
      const lv = el('div', 'livery');
      lv.append(el('h4', '', 'Livrée de ' + esc(L.name)));
      const row = el('div', 'swatches');
      L.liv.forEach(([n, a, c]) => {
        const sw = el('button', 'sw' + (st.locoLiv && st.locoLiv[0] === a && st.locoLiv[1] === c ? ' sel' : ''), `<i style="background:linear-gradient(135deg,${a} 55%,${c} 55%)"></i>${esc(n)}`);
        sw.onclick = () => { st.locoLiv = [a, c]; save(); render(); };
        row.append(sw);
      });
      const cu = el('label', 'sw custom', `<i></i>Personnalisée <input type="color" value="${st.locoLiv ? st.locoLiv[0] : '#cccccc'}"><input type="color" value="${st.locoLiv ? st.locoLiv[1] : '#c0392b'}">`);
      const [i1, i2] = cu.querySelectorAll('input');
      const upd = () => { st.locoLiv = [i1.value, i2.value]; save(); updateNav(); b.querySelectorAll('canvas.side').forEach(c => { }); render(); };
      i1.onchange = upd; i2.onchange = upd;
      row.append(cu);
      lv.append(row);
      b.append(lv);
    }
  }

  /* 3 — Composition */
  function stepCompo(b) {
    const L = TS.LOCO[st.loco];
    b.append(el('h2', 'su-title', L.kind === 'loco' ? 'Composez votre train' : 'Composition de la rame'));
    if (L.kind === 'loco') {
      b.append(el('p', 'note', 'Un seul type de véhicule par train : le premier choisi s\'applique à toute la rame. Vous personnalisez ensuite chaque véhicule.'));
      const g = el('div', 'grid3 small');
      L.wagons.forEach(id => {
        const W = TS.WAGONS[id];
        const c = el('button', 'card wag' + (st.wagon === id ? ' sel' : ''));
        const cv = el('canvas', 'side'); cv.width = 420; cv.height = 90;
        c.append(cv, el('h3', '', esc(W.name)), el('p', '', `${W.len} m · ${Array.isArray(W.m) ? W.m[0] + '–' + W.m[1] : W.m} t · ${W.vmax} km/h${W.seats ? ' · ' + W.seats + ' places' : ''}`));
        c.onclick = () => { if (st.wagon !== id) { st.wagon = id; st.wagonLiv = W.liv[0].slice(1); st.cars = []; st.count = W.cat === 'fret' ? 18 : 8; } save(); render(); };
        g.append(c);
        requestAnimationFrame(() => { const ctx = cv.getContext('2d'); const s = 14; drawSide(ctx, (cv.width - W.len * s) / 2, 14, s, { kind: 'car', model: W.model, len: W.len, liv: W.liv[0].slice(1), opt: W.def, idx: 1 }); });
      });
      b.append(g);
    }
    if (!st.wagon) return;
    const W = TS.WAGONS[st.wagon];
    const maxN = L.kind === 'loco' ? (W.cat === 'fret' ? 32 : 14) : L.wmax;
    const minN = L.kind === 'loco' ? 1 : L.wmin;
    st.count = TS.clamp(st.count, minN, maxN);
    const box = el('div', 'compo');
    const ctl = el('div', 'compo-ctl');
    ctl.innerHTML = `<label class="field">Nombre de ${W.cat === 'fret' ? 'wagons' : 'voitures'} <output>${st.count}</output>
      <input type="range" min="${minN}" max="${maxN}" value="${st.count}"></label>`;
    const rg = ctl.querySelector('input');
    rg.oninput = () => { st.count = +rg.value; ctl.querySelector('output').textContent = st.count; drawPreview(); infos(); save(); updateNav(); };
    if (!W.fixed) {
      const lv = el('div', 'swatches');
      W.liv.forEach(([n, a, c]) => {
        const sw = el('button', 'sw' + (st.wagonLiv && st.wagonLiv[0] === a && st.wagonLiv[1] === c ? ' sel' : ''), `<i style="background:linear-gradient(135deg,${a} 55%,${c === 'mix' ? 'conic-gradient(#2c5aa0,#a8322b,#d9a521,#3d7a4a)' : c} 55%)"></i>${esc(n)}`);
        if (c === 'mix') sw.querySelector('i').style.background = 'linear-gradient(90deg,#2c5aa0 25%,#a8322b 25% 50%,#d9a521 50% 75%,#3d7a4a 75%)';
        sw.onclick = () => { st.wagonLiv = [a, c]; save(); render(); };
        lv.append(sw);
      });
      const cu = el('label', 'sw custom', `<i></i>Personnalisée <input type="color" value="${st.wagonLiv ? st.wagonLiv[0] : '#cccccc'}"><input type="color" value="${st.wagonLiv && st.wagonLiv[1] !== 'mix' ? st.wagonLiv[1] : '#c0392b'}">`);
      const [i1, i2] = cu.querySelectorAll('input');
      i1.onchange = i2.onchange = () => { st.wagonLiv = [i1.value, i2.value]; save(); render(); };
      lv.append(cu);
      ctl.append(el('h4', '', 'Livrée des ' + (W.cat === 'fret' ? 'wagons' : 'voitures')), lv);
    }
    const all = el('div', 'allopts');
    all.append(el('span', '', 'Appliquer à tous : '));
    W.opts.forEach((o, i) => { const bt = el('button', 'chip', esc(o)); bt.onclick = () => { st.cars = Array(st.count).fill(i); save(); drawPreview(); infos(); }; all.append(bt); });
    ctl.append(all);
    box.append(ctl);
    const pv = el('div', 'preview');
    const cv = el('canvas'); pv.append(cv);
    const tip = el('div', 'pv-tip', 'Cliquez un véhicule pour changer sa configuration (' + W.opts.join(' / ') + ').');
    box.append(pv, tip);
    const inf = el('div', 'infos'); box.append(inf);
    b.append(box);
    let hits = [];
    function drawPreview() {
      const c = TS.buildConsist(consistCfg());
      const s = 9, pad = 12;
      cv.width = Math.max(pv.clientWidth - 2, c.len * s + pad * 2); cv.height = 70;
      const ctx = cv.getContext('2d');
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = '#3a3d45'; ctx.fillRect(0, 54, cv.width, 2);
      hits = [];
      // tête à droite
      c.vehicles.forEach(v => {
        const x = pad + (c.len - v.off - v.len) * s;
        drawSide(ctx, x, 14, s, v, v.kind === 'car' && v.idx === st.sel);
        if (v.kind === 'car') hits.push([x, x + v.len * s, v.idx]);
      });
      pv.scrollLeft = pv.scrollWidth;
    }
    cv.onclick = e => {
      const r = cv.getBoundingClientRect(); const x = (e.clientX - r.left) * cv.width / r.width;
      const h = hits.find(h => x >= h[0] && x <= h[1]); if (!h) return;
      const i = h[2]; st.sel = i;
      const cur = st.cars[i] !== undefined ? st.cars[i] : W.def;
      for (let k = 0; k < st.count; k++) if (st.cars[k] === undefined) st.cars[k] = W.def;
      st.cars[i] = (cur + 1) % W.opts.length;
      save(); drawPreview(); infos();
    };
    function infos() {
      const c = TS.buildConsist(consistCfg());
      const counts = {};
      c.vehicles.filter(v => v.kind === 'car').forEach(v => counts[v.optName] = (counts[v.optName] || 0) + 1);
      inf.innerHTML = `<div class="kpi"><b>${Math.round(c.len)} m</b><span>Longueur</span></div><div class="kpi"><b>${Math.round(c.mass)} t</b><span>Masse</span></div>
        <div class="kpi"><b>${c.vmax} km/h</b><span>Vitesse limite</span></div><div class="kpi"><b>${c.brakedPct} %</b><span>Masse freinée</span></div>
        ${c.seats ? `<div class="kpi"><b>${c.seats}</b><span>Places</span></div>` : ''}
        <div class="kpi wide"><span>${Object.entries(counts).map(([k, n]) => n + ' × ' + esc(k)).join(' · ')}</span></div>`;
    }
    requestAnimationFrame(() => { drawPreview(); infos(); });
  }

  /* 4 — Itinéraire */
  function corridor() {
    if (!st.from || !st.to) return [];
    const A = TS.STATION[st.from], B = TS.STATION[st.to];
    const k = Math.cos(46.5 * Math.PI / 180) * 111, ky = 111;
    const ax = A.lon * k, ay = A.lat * ky, bx = B.lon * k, by = B.lat * ky;
    const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy, L = Math.sqrt(L2);
    const out = [];
    TS.STATIONS.forEach(S => {
      if (S === A || S === B) return;
      const px = S.lon * k - ax, py = S.lat * ky - ay;
      const t = (px * dx + py * dy) / L2;
      if (t <= 0.02 || t >= 0.98) return;
      const d = Math.abs(px * dy - py * dx) / L;
      if (d < Math.max(28, L * 0.11)) out.push({ S, t, d });
    });
    out.sort((a, b) => a.t - b.t);
    // ne garder qu'une gare parisienne / doublons très proches
    return out.filter((o, i) => !(i && TS.dist(o.S, out[i - 1].S) < 8)).slice(0, 14);
  }
  function legs() {
    const A = TS.STATION[st.from], B = TS.STATION[st.to];
    if (!st.corridor.length) st.corridor = corridor();
    const pts = [{ st: A, stop: true }].concat(st.corridor.map(o => ({ st: o.S, stop: !!st.stops[o.S.id] })), [{ st: B, stop: true }]);
    pts.forEach((p, i) => { p.dist = i ? Math.max(4, TS.dist(pts[i - 1].st, p.st) * 1.13) : 0; });
    return pts;
  }
  function stepRoute(b) {
    b.append(el('h2', 'su-title', 'Itinéraire'));
    const wrap = el('div', 'route');
    const mapBox = el('div', 'map');
    const cv = el('canvas'); mapBox.append(cv);
    const side = el('div', 'route-side');
    const opts = TS.STATIONS.slice().sort((a, b) => a.n.localeCompare(b.n, 'fr')).map(s => `<option value="${s.id}">${esc(s.n)}</option>`).join('');
    side.innerHTML = `<label class="field">Gare de départ<select id="rFrom"><option value="">— choisir —</option>${opts}</select></label>
      <label class="field">Gare d'arrivée<select id="rTo"><option value="">— choisir —</option>${opts}</select></label>
      <p class="hint" id="rHint"></p><div id="rList" class="stops"></div><div id="rTot" class="infos"></div>`;
    wrap.append(mapBox, side);
    b.append(wrap);
    const sf = side.querySelector('#rFrom'), stt = side.querySelector('#rTo');
    sf.value = st.from || ''; stt.value = st.to || '';
    sf.onchange = () => { st.from = sf.value || null; st.pickMode = 'to'; recompute(); };
    stt.onchange = () => { st.to = stt.value || null; recompute(); };
    function recompute(keep) {
      st.corridor = corridor();
      if (!keep) { st.stops = {}; st.corridor.forEach(o => { if (o.S.q >= 6 || TS.LOCO[st.loco].kind === 'emu') st.stops[o.S.id] = true; }); }
      save(); list(); draw(); updateNav();
    }
    function list() {
      const L = side.querySelector('#rList');
      side.querySelector('#rHint').textContent = !st.from ? 'Cliquez une gare sur la carte pour le départ.' : !st.to ? 'Cliquez maintenant la gare d\'arrivée.' : 'Gares sur le parcours : cochez celles où le train marque l\'arrêt.';
      L.innerHTML = '';
      if (!st.from || !st.to) { side.querySelector('#rTot').innerHTML = ''; return; }
      const lg = legs();
      let cum = 0;
      lg.forEach((p, i) => {
        cum += p.dist;
        const row = el('label', 'stop' + (i === 0 || i === lg.length - 1 ? ' end' : ''));
        const fixed = i === 0 || i === lg.length - 1;
        row.innerHTML = `<input type="checkbox" ${p.stop ? 'checked' : ''} ${fixed ? 'disabled' : ''}><span class="nm">${esc(p.st.n)}</span><span class="km">${Math.round(cum)} km</span><span class="q">${p.st.q} voies · ${p.st.v === 25000 ? '25 kV' : '1,5 kV'}</span>`;
        if (!fixed) row.querySelector('input').onchange = e => { st.stops[p.st.id] = e.target.checked; save(); list(); draw(); };
        L.append(row);
      });
      const L0 = TS.LOCO[st.loco];
      const c = TS.buildConsist(consistCfg());
      const vAvg = Math.min(c.vmax, L0.kind === 'tgv' && cum > 120 ? 250 : cum > 150 ? 150 : 115) * 0.85;
      const nStops = lg.filter((p, i) => p.stop && i && i < lg.length - 1).length;
      const mins = Math.round(cum / vAvg * 60 + nStops * 3);
      side.querySelector('#rTot').innerHTML = `<div class="kpi"><b>${Math.round(cum)} km</b><span>Longueur de ligne</span></div><div class="kpi"><b>${nStops}</b><span>Arrêts intermédiaires</span></div><div class="kpi"><b>≈ ${Math.floor(mins / 60)} h ${String(mins % 60).padStart(2, '0')}</b><span>Durée en temps réel ×1</span></div>`;
    }
    // carte
    let proj;
    function draw() {
      const w = mapBox.clientWidth, h = mapBox.clientHeight || 480;
      const dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px';
      const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const kx = Math.cos(46.5 * Math.PI / 180);
      const minX = -4.9 * kx, maxX = 8.3 * kx, minY = 42.2, maxY = 51.2;
      const sc = Math.min((w - 30) / (maxX - minX), (h - 30) / (maxY - minY));
      const ox = (w - (maxX - minX) * sc) / 2, oy = (h - (maxY - minY) * sc) / 2;
      proj = (lat, lon) => [ox + (lon * kx - minX) * sc, oy + (maxY - lat) * sc];
      ctx.clearRect(0, 0, w, h);
      ctx.beginPath();
      TS.FRANCE.forEach(([la, lo], i) => { const [x, y] = proj(la, lo); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,.035)'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1.2; ctx.stroke();
      const acc = getComputedStyle(document.documentElement).getPropertyValue('--ui-accent').trim() || '#22c55e';
      if (st.from && st.to) {
        const lg = legs();
        ctx.strokeStyle = acc; ctx.lineWidth = 3; ctx.lineJoin = 'round';
        ctx.beginPath(); lg.forEach((p, i) => { const [x, y] = proj(p.st.lat, p.st.lon); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
      }
      const onRoute = new Set(st.from && st.to ? legs().map(p => p.st.id) : []);
      TS.STATIONS.forEach(S => {
        const [x, y] = proj(S.lat, S.lon);
        const isEnd = S.id === st.from || S.id === st.to;
        const r = isEnd ? 6 : S.q >= 8 ? 4 : 3;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7);
        ctx.fillStyle = isEnd ? acc : onRoute.has(S.id) ? (st.stops[S.id] ? '#f2f2f2' : '#8892a4') : 'rgba(255,255,255,.35)';
        ctx.fill();
        if (isEnd || onRoute.has(S.id) || S.q >= 8) {
          ctx.font = (isEnd ? '600 12px ' : '11px ') + 'Inter, sans-serif';
          ctx.fillStyle = isEnd ? '#fff' : 'rgba(226,232,240,.7)';
          ctx.fillText(S.n.replace(/-(Gare-de-|Ville|Saint-Jean|Part-Dieu|Matabiau|Saint-Charles|Flandres|Saint-Roch).*$/, ''), x + 7, y + 4);
        }
      });
    }
    cv.onclick = e => {
      const r = cv.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top;
      let best = null, bd = 18;
      TS.STATIONS.forEach(S => { const [sx, sy] = proj(S.lat, S.lon); const d = Math.hypot(sx - x, sy - y); if (d < bd) { bd = d; best = S; } });
      if (!best) return;
      if (!st.from || (st.from && st.to) && st.pickMode === 'from') { st.from = best.id; st.to = null; st.pickMode = 'to'; }
      else if (best.id !== st.from) { st.to = best.id; st.pickMode = 'from'; }
      sf.value = st.from || ''; stt.value = st.to || '';
      recompute();
    };
    requestAnimationFrame(() => { st.corridor = corridor(); list(); draw(); });
    window.addEventListener('resize', draw, { once: true });
  }

  /* 5 — Départ */
  function stepDepart(b) {
    const L = TS.LOCO[st.loco], c = TS.buildConsist(consistCfg());
    const lg = legs();
    b.append(el('h2', 'su-title', 'Prise de service'));
    const g = el('div', 'grid2');
    const a = el('div', 'panel');
    a.innerHTML = `<h4>Service</h4>
      <label class="field">Heure de prise de service <select id="dHour">${Array.from({ length: 18 }, (_, i) => i + 5).map(h => `<option value="${h}" ${h === st.hour ? 'selected' : ''}>${String(h).padStart(2, '0')}:00</option>`).join('')}</select></label>
      <label class="check"><input type="checkbox" id="dHelp" ${st.help ? 'checked' : ''}> Aides à la conduite (signal suivant, vitesse conseillée, mise en évidence des commandes)</label>
      <p class="note">Le départ est prévu 12 minutes après la prise de service, le temps de réaliser la visite et les essais. L'accélération du temps (×1 à ×10) est disponible en cabine.</p>`;
    const bb = el('div', 'panel');
    bb.innerHTML = `<h4>Résumé</h4><dl class="sum">
      <dt>Engin</dt><dd>${esc(L.name)}</dd><dt>Composition</dt><dd>${c.vehicles.length} véhicules · ${Math.round(c.len)} m · ${Math.round(c.mass)} t</dd>
      <dt>Vitesse limite</dt><dd>${c.vmax} km/h</dd><dt>Parcours</dt><dd>${esc(lg[0].st.n)} → ${esc(lg[lg.length - 1].st.n)}</dd>
      <dt>Longueur</dt><dd>${Math.round(lg.reduce((a, p) => a + p.dist, 0))} km · ${lg.filter(p => p.stop).length - 2} arrêt(s) intermédiaire(s)</dd></dl>`;
    g.append(a, bb); b.append(g);
    a.querySelector('#dHour').onchange = e => { st.hour = +e.target.value; save(); };
    a.querySelector('#dHelp').onchange = e => { st.help = e.target.checked; save(); };
    const keys = el('div', 'panel keys');
    keys.innerHTML = `<h4>Commandes clavier</h4><div class="kgrid">
      <span><kbd>Z</kbd>/<kbd>S</kbd> Manipulateur traction + / −</span><span><kbd>D</kbd>/<kbd>F</kbd> Robinet de frein : desserrer / serrer</span>
      <span><kbd>Espace</kbd> Pédale VACMA</span><span><kbd>Entrée</kbd> Acquittement (répétition des signaux)</span>
      <span><kbd>K</kbd> Avertisseur</span><span><kbd>U</kbd> Urgence</span><span><kbd>P</kbd> Portes (côté quai / fermeture)</span>
      <span><kbd>C</kbd> Vue cabine / extérieure</span><span><kbd>H</kbd> Masquer le pupitre</span><span><kbd>Tab</kbd> Check-list</span>
      <span><kbd>M</kbd> Documents de bord</span><span><kbd>+</kbd>/<kbd>−</kbd> Accélération du temps</span><span><kbd>Échap</kbd> Pause</span></div>
      <p class="note">À la souris : cliquez les boutons du pupitre, glissez les manettes, faites glisser la vue pour regarder autour.</p>`;
    b.append(keys);
  }

  function start() {
    const L = TS.LOCO[st.loco];
    const c = TS.buildConsist(consistCfg());
    const lg = legs();
    const rnd = Math.random;
    const num = L.kind === 'tgv' ? 'TGV ' + (6100 + Math.floor(rnd() * 800)) : L.kind === 'emu' ? 'TER ' + (860000 + Math.floor(rnd() * 9000)) :
      L.cat === 'pax' ? 'IC ' + (3600 + Math.floor(rnd() * 300)) : (L.trac === 'elec' ? '4' : '6') + (2000 + Math.floor(rnd() * 7000));
    const cfg = {
      loco: L, wagon: TS.WAGONS[st.wagon], consist: c, vehicles: c.vehicles, trainLen: c.len, mass: c.mass, vmax: c.vmax, adhMass: c.adh, brakeDecel: c.decel,
      brakedPct: c.brakedPct, seats: c.seats, legs: lg, startTime: st.hour * 3600, prepTime: 720, seed: Math.floor(Math.random() * 1e9), number: num, help: st.help,
    };
    $('#setup').hidden = true;
    TS.Main.start(cfg);
  }

  function init() {
    $('#suPrev').onclick = () => { if (st.step) { st.step--; render(); } };
    $('#suNext').onclick = () => { if (st.step === 4) start(); else if (canGo(st.step + 1)) { st.step++; render(); } };
    render();
  }
  return { init, show() { $('#setup').hidden = false; render(); } };
})();

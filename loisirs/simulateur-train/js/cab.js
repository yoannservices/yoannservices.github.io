/* ═══════════════════════════════════════════════════════════
   SIMULATEUR TRAIN — PUPITRE, HUD, CHECK-LIST ET DOCUMENTS
   ═══════════════════════════════════════════════════════════ */
'use strict';

TS.Cab = (function () {
  const $ = s => document.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let cfg, R, P, fam, ctl = {}, lamps = {}, gauges = {}, dmi, kvbSeg, tvmBox, hud = {}, brakeLever, tracLever;
  const C = {};
  let uiT = 0;

  /* ══════════ Cadrans ══════════ */
  function dial(cv, o) {
    const dpr = Math.min(2, devicePixelRatio || 1);
    const S = o.size;
    if (cv.width !== S * dpr) { cv.width = S * dpr; cv.height = S * dpr; cv.style.width = S + 'px'; cv.style.height = S + 'px'; }
    const x = cv.getContext('2d');
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    const c = S / 2, r = S / 2 - 3;
    x.clearRect(0, 0, S, S);
    // boîtier
    let g = x.createRadialGradient(c, c * 0.7, r * 0.2, c, c, r);
    g.addColorStop(0, '#2b2e33'); g.addColorStop(1, '#0d0e10');
    x.fillStyle = '#5b5f66'; x.beginPath(); x.arc(c, c, r + 2, 0, 7); x.fill();
    x.fillStyle = g; x.beginPath(); x.arc(c, c, r - 1, 0, 7); x.fill();
    const ang = v => (135 + 270 * (TS.clamp(v, o.min, o.max) - o.min) / (o.max - o.min)) * Math.PI / 180;
    // zones
    (o.zones || []).forEach(z => { x.strokeStyle = z.color; x.lineWidth = r * 0.07; x.beginPath(); x.arc(c, c, r * 0.82, ang(z.from), ang(z.to)); x.stroke(); });
    // graduations
    x.strokeStyle = '#e8e8e8'; x.fillStyle = '#e8e8e8';
    const n = Math.round((o.max - o.min) / o.minor);
    for (let i = 0; i <= n; i++) {
      const v = o.min + i * o.minor, a = ang(v);
      const major = Math.abs((v - o.min) / o.major - Math.round((v - o.min) / o.major)) < 1e-6;
      x.lineWidth = major ? 2 : 1;
      const r1 = r * 0.88, r0 = major ? r * 0.74 : r * 0.8;
      x.beginPath(); x.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0); x.lineTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1); x.stroke();
      if (major) {
        x.font = `600 ${Math.max(8, r * 0.16)}px "Barlow Condensed", sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillText(o.fmt ? o.fmt(v) : v, c + Math.cos(a) * r * 0.58, c + Math.sin(a) * r * 0.58);
      }
    }
    // repère (bug)
    if (o.bug !== undefined && o.bug !== null) {
      const a = ang(o.bug);
      x.fillStyle = o.bugColor || '#f2c12e';
      x.beginPath(); x.moveTo(c + Math.cos(a) * r * 0.92, c + Math.sin(a) * r * 0.92);
      x.lineTo(c + Math.cos(a + 0.07) * r * 0.78, c + Math.sin(a + 0.07) * r * 0.78); x.lineTo(c + Math.cos(a - 0.07) * r * 0.78, c + Math.sin(a - 0.07) * r * 0.78); x.fill();
    }
    x.fillStyle = '#9aa1aa'; x.font = `600 ${Math.max(8, r * 0.14)}px "Barlow Condensed", sans-serif`; x.textAlign = 'center';
    x.fillText(o.title, c, c - r * 0.3);
    if (o.unit) x.fillText(o.unit, c, c + r * 0.62);
    if (o.digital !== undefined) {
      x.fillStyle = '#050605'; x.fillRect(c - r * 0.36, c + r * 0.22, r * 0.72, r * 0.26);
      x.fillStyle = '#9ef7b6'; x.font = `${r * 0.22}px "Share Tech Mono", monospace`; x.textBaseline = 'middle';
      x.fillText(o.digital, c, c + r * 0.36);
    }
    // aiguilles
    o.needles.forEach(nd => {
      const a = ang(nd.v);
      x.save(); x.translate(c, c); x.rotate(a);
      x.fillStyle = nd.color; x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 4;
      x.beginPath(); x.moveTo(-r * 0.15, -r * 0.035); x.lineTo(r * (nd.len || 0.86), 0); x.lineTo(-r * 0.15, r * 0.035); x.fill();
      x.restore();
    });
    x.fillStyle = '#26282c'; x.beginPath(); x.arc(c, c, r * 0.08, 0, 7); x.fill();
    // reflet
    g = x.createLinearGradient(0, 0, 0, S); g.addColorStop(0, 'rgba(255,255,255,.08)'); g.addColorStop(0.5, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.beginPath(); x.arc(c, c, r - 1, Math.PI, 0); x.fill();
  }

  /* ══════════ Contrôles ══════════ */
  function pb(id, label, color, opts) {
    opts = opts || {};
    const b = el('button', 'pb ' + (color || '') + (opts.big ? ' big' : '') + (opts.mush ? ' mush' : ''), `<span class="cap"></span><span class="lbl">${label}</span>`);
    b.dataset.ctl = id;
    b.title = opts.title || label;
    if (opts.hold) {
      b.addEventListener('pointerdown', e => { e.preventDefault(); b.classList.add('pressed'); TS.Sim.cmd(id, true); });
      const up = () => { b.classList.remove('pressed'); TS.Sim.cmd(id, false); };
      b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up);
    } else b.addEventListener('click', () => { opts.click ? opts.click() : TS.Sim.cmd(id); TS.Audio.resume(); });
    ctl[id] = b;
    return b;
  }
  function tg(id, label) {
    const b = el('button', 'tg', `<span class="sw"></span><span class="lbl">${label}</span><span class="st">0</span>`);
    b.dataset.ctl = id; b.title = label;
    b.addEventListener('click', () => { TS.Sim.cmd(id); TS.Audio.resume(); });
    ctl[id] = b; return b;
  }
  function rot(id, label, positions) {
    const b = el('button', 'rot', `<span class="dial"><span class="knob"></span></span><span class="lbl">${label}</span>`);
    const d = b.querySelector('.dial');
    positions.forEach((p, i) => {
      const a = (-50 + 100 * i / Math.max(1, positions.length - 1)) * Math.PI / 180;
      const s = el('span', 'pos', p.t); s.style.left = (25 + Math.sin(a) * 28 - 10) + 'px'; s.style.top = (25 - Math.cos(a) * 28 - 6) + 'px'; s.style.width = '20px'; s.style.textAlign = 'center';
      d.append(s); p.el = s;
    });
    b.dataset.ctl = id; b.title = label;
    b.addEventListener('click', () => { TS.Sim.cmd(id); TS.Audio.resume(); });
    ctl[id] = b; b._pos = positions;
    return b;
  }
  function key(id, label) {
    const b = el('button', 'key', `<span class="kslot"></span><span class="lbl">${label}</span>`);
    b.dataset.ctl = id; b.addEventListener('click', () => { TS.Sim.cmd(id); TS.Audio.resume(); });
    ctl[id] = b; return b;
  }
  function lamp(id, txt, col, blink) { const l = el('div', 'lamp ' + col + (blink ? ' blink' : ''), txt); lamps[id] = l; return l; }

  // manette verticale à crans
  function lever(cls, notches, onSet, labels) {
    const w = el('div', 'lever-wrap');
    const lv = el('div', 'lever ' + cls);
    lv.append(el('div', 'slot'));
    const hd = el('div', 'handle');
    const nEls = notches.map((n, i) => { const e = el('div', 'notch', n.t); lv.append(e); return e; });
    lv.append(hd);
    const lbl = el('div', 'lbl', labels.name), val = el('div', 'val', '');
    w.append(lv, lbl, val);
    const layout = () => {
      const h = lv.clientHeight - 30;
      notches.forEach((n, i) => { nEls[i].style.top = (15 + h * n.y) + 'px'; });
    };
    let drag = false;
    const pick = e => {
      const r = lv.getBoundingClientRect();
      const y = (e.clientY - r.top - 15) / (r.height - 30);
      onSet(TS.clamp(y, 0, 1));
    };
    lv.addEventListener('pointerdown', e => { drag = true; lv.setPointerCapture(e.pointerId); pick(e); TS.Audio.resume(); });
    lv.addEventListener('pointermove', e => { if (drag) pick(e); });
    lv.addEventListener('pointerup', () => { drag = false; });
    lv.addEventListener('wheel', e => { e.preventDefault(); labels.wheel(Math.sign(e.deltaY)); }, { passive: false });
    return {
      w, lv, layout,
      set(y, txt, active) {
        const h = lv.clientHeight - 30;
        hd.style.top = (15 + h * y) + 'px';
        val.textContent = txt;
        nEls.forEach((e, i) => e.classList.toggle('on', i === active));
      },
    };
  }

  /* ══════════ Construction du pupitre ══════════ */
  function build() {
    const pup = $('#pupitre'); pup.innerHTML = '';
    const desk = el('div', 'desk'); pup.append(desk);
    const pax = cfg.loco.cat === 'pax', elec = cfg.loco.trac === 'elec';
    ctl = {}; lamps = {}; gauges = {};

    // 1. robinet de frein
    const pBr = el('div', 'pnl'); pBr.append(el('h5', '', 'Robinet de frein'));
    const nb = TS.BRAKE_POS.length;
    brakeLever = lever('brake', TS.BRAKE_POS.map((b, i) => ({ t: b.k, y: i / (nb - 1) })), y => TS.Sim.cmd('brake', Math.round(y * (nb - 1))), { name: 'Frein auto', wheel: d => TS.Sim.cmd('brakeStep', d) });
    const brRow = el('div', 'row');
    const side = el('div', 'grid'); side.style.gridTemplateColumns = '1fr';
    side.append(pb('park', 'Frein de parc', 'yellow'), pb('urg', 'Urgence', 'red', { mush: true }), pb('rearm', 'Réarm. FU', 'white'));
    brRow.append(brakeLever.w, side);
    pBr.append(brRow);
    ctl.brake = brakeLever.lv;

    // 2. manomètres
    const pMa = el('div', 'pnl'); pMa.append(el('h5', '', 'Manomètres'));
    const gr = el('div', 'grid'); gr.style.gridTemplateColumns = 'auto auto';
    ['air', 'cf', 'g3', 'g4'].forEach(k => { const cv = el('canvas', 'gauge'); gauges[k] = cv; gr.append(cv); });
    pMa.append(gr);

    // 3. vitesse
    const pV = el('div', 'pnl'); pV.append(el('h5', '', 'Vitesse'));
    const cvV = el('canvas', 'gauge'); gauges.speed = cvV;
    const kv = el('div', 'kvb scr');
    if (cfg.loco.kind === 'tgv') { tvmBox = el('div', 'tvm off', '---'); kv.append(tvmBox); }
    kvbSeg = [el('div', 'seg', '- - -'), el('div', 'seg g', '- - -')];
    kv.append(kvbSeg[0], kvbSeg[1]);
    pV.append(cvV, kv);

    // 4. écran + voyants
    const pD = el('div', 'pnl'); pD.append(el('h5', '', cfg.loco.kind === 'loco' ? 'Signalisation & alarmes' : 'Écran de conduite'));
    dmi = el('div', 'scr dmi');
    const lg = el('div', 'lamps'); lg.style.marginTop = '8px';
    lg.append(lamp('ba', 'BA', 'g'), lamp('dj', elec ? 'DJ' : 'MOT', 'r'), lamp('cp', 'CP', 'y'), lamp('pati', 'Patin', 'y', true),
      lamp('vacma', 'VACMA', 'r', true), lamp('rs', 'RS', 'y', true), lamp('fu', 'FU', 'r', true), lamp('surv', 'Surv.', 'r', true),
      lamp('parc', 'Parc', 'r'), lamp('portes', 'Portes', 'g'), lamp('da', 'DA', 'w'), lamp('kvb', 'KVB', 'y'));
    pD.append(dmi, lg);

    // 5. commandes
    const pC = el('div', 'pnl'); pC.append(el('h5', '', 'Commandes'));
    const cg = el('div', 'grid'); cg.style.gridTemplateColumns = 'repeat(6, auto)';
    cg.append(tg('bat', 'Batterie'), key('key', 'Clé'));
    if (fam.startsWith('emu')) cg.append(tg('eas', 'Mode EAS'));
    if (elec) {
      cg.append(rot('volt', 'Tension', [{ t: '1,5', v: 1500 }, { t: '25', v: 25000 }]), tg('panto', 'Panto'), pb('dj', 'DJ', 'green'), tg('aux', elec && cfg.loco.kind === 'tgv' ? 'Auxil.' : 'Ventil.'));
    } else {
      cg.append(tg('fuel', 'Gazole'), pb('pregr', 'Pré-graiss.', 'blue', { hold: true, title: 'Maintenir enfoncé 6 s' }), pb('start', 'Démarr. moteur', 'green'));
      if (fam === 'locoD') cg.append(tg('exc', 'Excitation'));
    }
    cg.append(tg('cp', 'Compress.'), tg('feux', 'Feux'));
    cg.append(rot('rev', 'Inverseur', [{ t: '0', v: 0 }, { t: 'AV', v: 1 }]));
    cg.append(pb('vacmatest', 'Essai VACMA', 'white'));
    if (cfg.loco.kind === 'tgv') cg.append(pb('tvmtest', 'Essai TVM', 'white'));
    cg.append(pb('kvb', 'Saisie KVB', 'blue', { click: kvbModal }), pb('radio', 'GSM-R', 'blue', { click: radioModal }));
    if (pax) {
      cg.append(pb('doorsL', 'Portes G', 'green'), pb('doorsR', 'Portes D', 'green'), pb('doorsClose', 'Ferm. portes', 'red'));
      if (fam.startsWith('emu')) cg.append(pb('retro', 'Rétrovision', 'white'));
    }
    cg.append(pb('horn', 'Klaxon', '', {}), pb('acq', 'Acquit.', 'yellow', { big: false }), pb('vacma', 'VACMA', 'yellow', { title: 'Pédale de veille (Espace)' }));
    cg.append(pb('visite', 'Visite au sol', 'white', { click: visiteModal }), pb('docs', 'Documents', '', { click: () => docsModal() }));
    pC.append(cg);

    // 6. manipulateur de traction
    const pT = el('div', 'pnl'); pT.append(el('h5', '', 'Manipulateur'));
    const eb = !!cfg.loco.eb;
    const nt = [];
    for (let i = 10; i >= 1; i--) nt.push({ t: i % 2 ? '' : 'T' + i * 10, y: (10 - i) / (eb ? 20 : 10) });
    nt.push({ t: '0', y: eb ? 0.5 : 1 });
    if (eb) for (let i = 1; i <= 10; i++) nt.push({ t: i % 2 ? '' : 'F' + i * 10, y: 0.5 + i / 20 });
    tracLever = lever('trac', nt, y => {
      let v = eb ? (0.5 - y) * 2 : 1 - y;
      v = Math.round(v * 10) / 10; if (Math.abs(v) < 0.05) v = 0;
      TS.Sim.cmd('manip', v);
    }, { name: eb ? 'Traction / Frein élec.' : 'Traction', wheel: d => TS.Sim.cmd('manipStep', -d * 0.1) });
    pT.append(tracLever.w);
    ctl.manip = tracLever.lv;

    desk.append(pBr, pMa, pV, pD, pC, pT);
    requestAnimationFrame(() => { brakeLever.layout(); tracLever.layout(); layoutGauges(); });
    window.addEventListener('resize', () => { brakeLever.layout(); tracLever.layout(); layoutGauges(); });
  }
  function layoutGauges() {
    const ph = $('#pupitre').clientHeight;
    C.gs = Math.max(78, Math.min(116, (ph - 70) / 2));
    C.gv = Math.max(140, Math.min(200, ph - 110));
  }

  /* ══════════ HUD ══════════ */
  function buildHud() {
    const h = $('#hud'); h.innerHTML = '';
    const l = el('div', 'hud-l');
    const ck = el('div', 'hudbox'); hud.clock = el('div', 'clock'); ck.append(hud.clock);
    const ts = el('div', 'tscale');
    [1, 2, 5, 10].forEach(k => { const b = el('button', '', '×' + k); b.onclick = () => setScale(k); b.dataset.k = k; ts.append(b); });
    ck.append(ts); hud.ts = ts;
    ck.style.display = 'grid'; ck.style.gap = '5px';
    const nx = el('div', 'hudbox nexts'); hud.next = nx;
    l.append(ck, nx);
    const r = el('div', 'hud-r');
    const as = el('div', 'hudbox assist'); hud.assist = as;
    if (!cfg.help) as.hidden = true;
    const btns = el('div', ''); btns.style.cssText = 'display:grid;gap:6px;';
    const bv = el('button', 'hudbtn', 'Vue (C)'); bv.onclick = () => TS.Main.toggleView();
    const bp = el('button', 'hudbtn', 'Pause'); bp.onclick = () => pauseModal();
    const bh = el('button', 'hudbtn', 'Pupitre (H)'); bh.onclick = () => $('#game').classList.toggle('nopup');
    btns.append(bv, bh, bp);
    r.append(as, btns);
    h.append(l, r);
  }
  function setScale(k) { TS.Sim.timeScale = k; [...hud.ts.children].forEach(b => b.classList.toggle('on', +b.dataset.k === k)); }
  C.setScale = setScale;

  /* ══════════ Check-list ══════════ */
  let clKey = '';
  function renderChecklist() {
    const box = $('#checklist');
    const proc = TS.Sim.currentProcedure();
    if (!proc) { box.classList.add('gone'); clearHints(); return; }
    box.classList.remove('gone');
    let cur = null, done = 0, tot = 0;
    const st = proc.map(p => { const ok = !!p.ok(); if (!p.opt) { tot++; if (ok) done++; } if (!ok && !p.opt && !cur) cur = p; return ok; });
    const key = proc.map((p, i) => st[i] ? 1 : 0).join('') + (cur ? cur.id : '') + proc.length + (proc[0] && proc[0].ph);
    if (key !== clKey) {
      clKey = key;
      const title = proc[0].ph.startsWith('Arrêt') ? proc[0].ph : 'Mise en service';
      let html = `<div class="cl-head" id="clHead">${esc(title)} <span>${done}/${tot}</span></div><div class="cl-body">`;
      let ph = '';
      proc.forEach((p, i) => {
        if (p.ph !== ph && !p.ph.startsWith('Arrêt')) { ph = p.ph; html += `<div class="cl-ph">${esc(ph)}</div>`; }
        const t = typeof p.t === 'function' ? p.t() : p.t;
        html += `<div class="cl-it${st[i] ? ' ok' : ''}${p === cur ? ' cur' : ''}${p.opt ? ' opt' : ''}"><i></i><div>${esc(t)}${p.d ? `<small>${esc(p.d)}</small>` : ''}</div></div>`;
      });
      html += '</div>';
      box.innerHTML = html;
      box.querySelector('#clHead').onclick = () => box.classList.toggle('min');
      const c = box.querySelector('.cur'); if (c && !box.classList.contains('min')) c.scrollIntoView({ block: 'nearest' });
    }
    clearHints();
    if (cfg.help && cur && cur.ctl && ctl[cur.ctl]) ctl[cur.ctl].classList.add('hint');
    // récupération après un FU : toujours guidée
    const P = TS.Sim.P;
    if (P.fu && P.v < 0.1 && ctl.rearm) ctl.rearm.classList.add('hint');
    else if (!P.fu && P.flags.afterFu && P.cg < 4.6 && ctl.brake) ctl.brake.classList.add('hint');
  }
  function clearHints() { document.querySelectorAll('#pupitre .hint').forEach(e => e.classList.remove('hint')); }

  /* ══════════ Messages et corrections ══════════ */
  const FU_STEPS = 'Manipulateur à 0 → attendre l\'arrêt complet → bouton « Réarm. FU » → robinet de frein sur MAR (touche D) jusqu\'à CG 5 bar → repartir.';
  // conseil de correction selon le texte du message
  const FIXES = [
    [/Clé de commande non activée/, 'Enclenchez la Batterie, puis cliquez sur la Clé.'],
    [/Batterie hors service|hors tension \(batterie\)/, 'Mettez l\'interrupteur Batterie sur 1.'],
    [/Ouvrir le DJ avant de changer/, 'Appuyez sur DJ pour l\'ouvrir, tournez le sélecteur Tension, puis refermez le DJ.'],
    [/Pantographe non levé|Pas de tension/, 'Levez le pantographe (interrupteur Panto) et attendez ~5 s que le voltmètre Ligne monte.'],
    [/Section de séparation : fermeture/, 'Attendez d\'avoir passé le panneau bleu de fin de section (trait continu), puis refermez le DJ.'],
    [/Tension sélectionnée incorrecte|Tension ligne incompatible/, 'DJ ouvert → sélecteur Tension sur la valeur de la ligne (voltmètre Ligne, check-list) → refermez le DJ.'],
    [/Section de séparation franchie/, 'Au panneau bleu « DJ » (interrupteur ouvert), ouvrez le DJ ; refermez-le après le panneau de fin. Maintenant : changez la tension si besoin et refermez le DJ.'],
    [/DJ ouvert/, 'Fermez le disjoncteur : bouton DJ (pantographe levé, bonne tension).'],
    [/Auxiliaires hors service/, 'Mettez l\'interrupteur Ventil. / Auxil. sur 1 (DJ fermé).'],
    [/Moteur arrêté/, 'Démarrez le moteur : Gazole sur 1, maintenir Pré-graiss. 6 s, puis Démarr. moteur.'],
    [/Excitation coupée/, 'Mettez l\'interrupteur Excitation sur 1.'],
    [/Pompe à combustible|Pompe à gazole/, 'Mettez l\'interrupteur Gazole sur 1.'],
    [/Pré-graissage non effectué/, 'Maintenez le bouton Pré-graiss. enfoncé environ 6 s, puis démarrez.'],
    [/Inverseur au neutre/, 'Cliquez sur l\'Inverseur pour le mettre sur AV.'],
    [/Inverseur : arrêt complet/, 'Arrêtez complètement le train avant de toucher à l\'inverseur.'],
    [/Freins serrés/, 'Robinet de frein sur MAR (touche D). Compresseurs en marche : attendez CG 5 bar (aiguille blanche).'],
    [/Frein d'immobilisation serré|Circulation frein d'immobilisation/, 'Appuyez sur « Frein de parc » pour le desserrer (voyant Parc éteint).'],
    [/Portes non verrouillées/, 'Fermez les portes (touche P ou « Ferm. portes ») et attendez le voyant Portes vert.'],
    [/KVB non initialisé/, 'Bouton « Saisie KVB » : type, vitesse, longueur et masse freinée du bulletin (Documents, touche M).'],
    [/Pression d'air insuffisante/, 'Mettez les compresseurs (CP) en marche et attendez RP > 3 bar.'],
    [/Essai VACMA à l'arrêt|Réarmement impossible en mouvement/, 'Attendez l\'arrêt complet du train.'],
    [/Essai VACMA : pédale/, 'Pendant l\'essai, appuyez sur Espace (bouton VACMA) dès que l\'alarme sonne. ' + FU_STEPS],
    [/VACMA : veille/, 'Appuyez sur Espace (pédale VACMA) au moins toutes les 55 s, et immédiatement quand l\'alarme sonne. ' + FU_STEPS],
    [/Répétition des signaux/, 'Après chaque feu jaune, appuyez sur Entrée (bouton Acquit.) dans les 5 s. ' + FU_STEPS],
    [/Survitesse/, 'Restez sous le repère jaune du compteur et respectez les panneaux TIV. ' + FU_STEPS],
    [/Franchissement/, 'Arrêtez-vous toujours avant un feu rouge et freinez dès le feu jaune. ' + FU_STEPS],
    [/Freinage d'urgence commandé/, FU_STEPS],
    [/Train en mouvement : ouverture|Hors quai/, 'Arrêtez-vous au quai, tête du train au panneau « ARRÊT TÊTE ».'],
    [/Portes ouvertes/, 'Fermez d\'abord les portes (touche P).'],
    [/Ouverture des portes côté voie/, 'Ouvrez du côté du quai indiqué dans la check-list (Portes G ou Portes D).'],
    [/Départ sans autorisation/, 'Au prochain arrêt, attendez le voyant DA (départ autorisé) avant de mettre de la traction.'],
    [/Départ anticipé/, 'Ne partez pas avant l\'heure de départ affichée en haut à gauche.'],
    [/Voyageurs non desservis/, 'À chaque arrêt, ouvrez les portes côté quai avant de repartir.'],
    [/sans essai de frein/, 'À l\'arrêt : robinet sur MAR (CG 5 bar), puis S5 ou SP (CG ≤ 3,6), puis retour sur MAR.'],
    [/Essai VACMA non réalisé/, 'À l\'arrêt : bouton « Essai VACMA », puis Espace quand l\'alarme sonne.'],
    [/Essai TVM/, 'À l\'arrêt : bouton « Essai TVM ».'],
    [/GSM-R/, 'Bouton GSM-R : saisissez le numéro du train (fiche horaire, touche M).'],
    [/Feux de tête/, 'Mettez l\'interrupteur Feux sur 1.'],
    [/Visite au sol/, 'Bouton « Visite au sol » avant la mise en service.'],
    [/Repère d'arrêt dépassé|Heurt du butoir/, 'Commencez à freiner plus tôt : robinet S2 à S4 environ 1 km avant le quai.'],
    [/Arrêt non marqué/, 'Consultez la fiche horaire (M) : le prochain arrêt est affiché en haut à gauche.'],
    [/Retard de/, 'Roulez à la vitesse autorisée et limitez les temps d\'arrêt.'],
    [/Arrêt avant le repère/, 'Remettez un peu de traction et avancez lentement jusqu\'au panneau ARRÊT TÊTE.'],
  ];
  function fixFor(t) { for (const [re, f] of FIXES) if (re.test(t)) return f; return ''; }
  C.fixFor = fixFor;
  function toast(t, kind) {
    const box = $('#toasts');
    const fix = kind === 'bad' || kind === 'warn' ? fixFor(t) : '';
    const e = el('div', 'toast ' + kind, esc(t) + (fix ? `<span class="fix">➜ ${esc(fix)}</span>` : ''));
    box.append(e);
    while (box.children.length > 4) box.firstChild.remove();
    setTimeout(() => { e.style.transition = 'opacity .4s'; e.style.opacity = '0'; setTimeout(() => e.remove(), 400); }, fix ? 11000 : kind === 'bad' ? 7000 : 5000);
  }

  /* ══════════ Mise à jour (≈ 15 Hz) ══════════ */
  C.update = function (dt) {
    uiT -= dt; if (uiT > 0) return; uiT = 1 / 15;
    P = TS.Sim.P;
    const elec = cfg.loco.trac === 'elec';
    // contrôles
    const setOn = (id, on, txt) => { const c = ctl[id]; if (!c) return; c.classList.toggle('on', !!on); const s = c.querySelector('.st'); if (s) s.textContent = txt !== undefined ? txt : on ? '1' : '0'; };
    setOn('bat', P.bat); setOn('key', P.key); setOn('eas', P.eas); setOn('panto', P.pantoCmd, P.panto > 0 && P.panto < 1 ? '…' : undefined); setOn('dj', P.dj);
    setOn('aux', P.aux); setOn('cp', P.cp); setOn('feux', P.feux); setOn('fuel', P.fuel); setOn('exc', P.exc); setOn('park', P.park);
    setOn('start', P.engine === 'run' || P.engine === 'crank'); setOn('pregr', P.pregrOn || (P.pregr >= 1 && P.engine !== 'run'));
    setOn('doorsL', P.doorsOpen && P.doorSide < 0); setOn('doorsR', P.doorsOpen && P.doorSide > 0); setOn('doorsClose', !P.doorsOpen && !P.doorsLocked);
    setOn('retro', P.retro); setOn('kvb', !!P.kvb); setOn('radio', P.radio); setOn('visite', P.visite);
    setOn('vacmatest', P.vacTest > 0); setOn('tvmtest', P.tvmTest > 0); setOn('acq', P.rs > 0); setOn('vacma', P.vacAlarm || P.vacTest === 2); setOn('rearm', P.fu);
    if (ctl.volt) { const k = ctl.volt.querySelector('.knob'); k.style.transform = `rotate(${P.voltSel === 25000 ? 50 : -50}deg)`; ctl.volt._pos.forEach(p => p.el.classList.toggle('on', p.v === P.voltSel)); }
    if (ctl.rev) { const k = ctl.rev.querySelector('.knob'); k.style.transform = `rotate(${P.rev === 1 ? 50 : -50}deg)`; ctl.rev._pos.forEach(p => p.el.classList.toggle('on', p.v === P.rev)); }
    // voyants
    const L = (id, on) => lamps[id] && lamps[id].classList.toggle('on', !!on);
    L('ba', P.bat); L('dj', P.key && (elec ? !P.dj : P.engine !== 'run')); L('cp', P.cpRun); L('pati', P.slip);
    L('vacma', P.vacAlarm || P.vacTest === 2); L('rs', P.rs > 0); L('fu', P.fu); L('surv', P.overWarn);
    L('parc', P.park && P.bat); L('portes', cfg.loco.cat === 'pax' && P.doorsLocked && P.bat); L('da', P.auth); L('kvb', P.bat && !P.kvb);
    // leviers
    const nb = TS.BRAKE_POS.length;
    brakeLever.set(P.brake / (nb - 1), TS.BRAKE_POS[P.brake].name, P.brake);
    const eb = !!cfg.loco.eb;
    const y = eb ? 0.5 - P.manip / 2 : 1 - P.manip;
    tracLever.set(y, P.manip > 0 ? 'T ' + Math.round(P.manip * 100) + ' %' : P.manip < 0 ? 'F ' + Math.round(-P.manip * 100) + ' %' : '0', -1);
    // cadrans
    const gs = C.gs || 100, gv = C.gv || 180;
    dial(gauges.air, { size: gs, min: 0, max: 10, major: 2, minor: 0.5, title: 'CG / RP', unit: 'bar', needles: [{ v: P.rp, color: '#ff4d3d' }, { v: P.cg, color: '#f2f2f2' }], zones: [{ from: 4.9, to: 5.1, color: '#3ddc7a' }] });
    dial(gauges.cf, { size: gs, min: 0, max: 6, major: 1, minor: 0.5, title: 'CF', unit: 'bar', needles: [{ v: P.cf, color: '#f2f2f2' }], zones: [{ from: 3.5, to: 4.2, color: '#ffc531' }] });
    if (elec) {
      const kv = P.voltSel === 25000;
      dial(gauges.g3, { size: gs, min: 0, max: kv ? 30 : 4, major: kv ? 5 : 1, minor: kv ? 2.5 : 0.5, title: 'Ligne', unit: 'kV', needles: [{ v: P.lineV / 1000 * (kv === (P.lineV === 25000) ? 1 : kv ? 1 : 1), color: '#f2c12e' }], fmt: v => String(v).replace('.', ',') });
      dial(gauges.g4, { size: gs, min: -1000, max: 3000, major: 1000, minor: 250, title: 'Intensité', unit: 'A', needles: [{ v: (P.tracForce - P.ebForce) * Math.max(P.v, 0.5) / 2500 / (P.lineV === 25000 ? 8 : 1) * (P.dj ? 1 : 0), color: '#f2f2f2' }], fmt: v => v / 1000 + 'k' });
    } else {
      dial(gauges.g3, { size: gs, min: 0, max: 2000, major: 500, minor: 100, title: 'Moteur', unit: 'tr/min', needles: [{ v: P.rpm, color: '#f2f2f2' }], zones: [{ from: 1700, to: 2000, color: '#ff4d3d' }], fmt: v => v / 1000 + 'k' });
      dial(gauges.g4, { size: gs, min: 0, max: 120, major: 20, minor: 10, title: 'Eau / Huile', unit: '°C · bar', needles: [{ v: P.water, color: '#f2f2f2' }, { v: P.oilP * 10, color: '#ff4d3d', len: 0.6 }], zones: [{ from: 0, to: 40, color: '#4a90d9' }, { from: 95, to: 120, color: '#ff4d3d' }] });
    }
    const vmax = cfg.vmax <= 160 ? 180 : cfg.vmax <= 220 ? 240 : 360;
    const vk = P.v * 3.6;
    dial(gauges.speed, { size: gv, min: 0, max: vmax, major: vmax > 240 ? 40 : 20, minor: vmax > 240 ? 10 : 5, title: 'km/h', needles: [{ v: vk, color: '#ffffff' }], bug: cfg.help || P.kvb ? P.ctl : null, digital: String(Math.round(vk)).padStart(3, ' ') });
    // KVB
    if (!P.bat) { kvbSeg[0].textContent = '   '; kvbSeg[1].textContent = '   '; }
    else if (!P.kvb) { kvbSeg[0].textContent = P.key ? 'PA400' : '- - -'; kvbSeg[1].textContent = ''; }
    else {
      kvbSeg[0].textContent = P.kvbCurve ? (P.kvbCurve.vt ? 'L' + P.kvbCurve.vt : '000') : 'b';
      kvbSeg[1].textContent = String(Math.round(P.ctl)).padStart(3, '0');
    }
    if (tvmBox) {
      tvmBox.className = 'tvm' + (P.inTVM ? '' : ' off');
      if (P.inTVM && P.bat) {
        const c = P.tvmCode;
        tvmBox.textContent = c === 0 ? '000' : String(c).padStart(3, '0');
        if (c === 0) tvmBox.classList.add('c000'); else if (P.tvmPrev != null && c < P.tvmPrev) tvmBox.classList.add('cwarn');
      } else tvmBox.textContent = P.tvmTest > 0 ? '888' : '---';
    }
    // écran
    const lines = [];
    const St = R.stations;
    if (P.bat) {
      lines.push(`<p class="dim">${TS.fmtTime(TS.Sim.time, true)} · ${esc(cfg.number)} · ${P.key ? 'Cabine active' : 'Cabine inactive'}</p>`);
      if (P.fu) lines.push(`<p class="bad">FU : ${esc(P.fuReason)}</p><p class="warn">${P.v > 0.1 ? 'Manipulateur à 0, attendez l\'arrêt complet…' : 'Arrêté : appuyez sur « Réarm. FU »'}</p>`);
      else if (P.flags.afterFu && P.cg < 4.6) lines.push(`<p class="warn">Robinet sur MAR (touche D) : recharge CG ${P.cg.toFixed(1)} / 5 bar</p>`);
      if (P.manip > 0.01 && P.tracWhy) lines.push(`<p class="warn">Traction coupée : ${esc(P.tracWhy)}</p><p class="dim">➜ ${esc(fixFor(P.tracWhy))}</p>`);
      if (P.vacAlarm) lines.push(`<p class="bad">VACMA : appuyez sur la pédale (Espace) !</p>`);
      else if (P.key && P.v > 1 && P.vacT > 40) lines.push(`<p class="warn">VACMA dans ${Math.ceil(55 - P.vacT)} s : appuyez sur Espace</p>`);
      if (P.rs > 0) lines.push(`<p class="warn">Répétition signal : ACQUITTER (${P.rs.toFixed(1)} s)</p>`);
      if (R.inNeutral(P.s + 400) && elec && P.dj) lines.push(`<p class="warn">Section de séparation : ouvrir le DJ</p>`);
      const ms = TS.Sim.messages().slice(-4);
      ms.forEach(m => lines.push(`<p class="${m.kind === 'bad' ? 'bad' : m.kind === 'warn' ? 'warn' : ''}">${esc(m.t)}</p>`));
    }
    dmi.innerHTML = lines.slice(-6).join('');

    // HUD
    hud.clock.innerHTML = TS.fmtTime(TS.Sim.time) + `<small>:${String(Math.floor(TS.Sim.time) % 60).padStart(2, '0')}</small>`;
    let nk = P.stopK >= 0 ? P.stopK : P.nextStop;
    while (nk < St.length && !St[nk].stop) nk++;
    if (nk < St.length) {
      const S = St[nk];
      const here = P.stopK === nk;
      const dist = S.headStop - P.s;
      const ref = here ? S.dep : S.arr;
      let delay = '';
      if (ref) {
        const est = here ? TS.Sim.time : TS.Sim.time + Math.max(0, dist) / Math.max(15, Math.min(cfg.vmax / 3.6 * 0.8, P.v + 5));
        const d = Math.round((est - ref) / 60);
        delay = d > 1 ? `<span class="late">+${d} min</span>` : d < -1 ? `<span class="ok">${d} min</span>` : '<span class="ok">à l\'heure</span>';
      }
      hud.next.innerHTML = here
        ? `<span>${S.last ? 'Terminus' : 'À quai'} · voie ${S.ourNo}</span><b>${esc(S.name)}</b><span>${S.last ? 'Arrivée' : 'Départ ' + TS.fmtTime(S.dep)} ${S.last ? '' : delay}</span>`
        : `<span>Prochain arrêt · voie ${S.ourNo}</span><b>${esc(S.name)}</b><span>${TS.fmtDist(Math.max(0, dist))} · ${TS.fmtTime(S.arr)} ${delay}</span>`;
    }
    if (cfg.help) {
      const j = P.nextSig;
      let sh = '';
      if (j < R.signals.length) {
        const g = R.signals[j];
        const d = g.s - P.s;
        if (g.tvm) sh = `<div class="asig"><div><b>TVM</b>${P.tvmCode != null ? P.tvmCode + ' km/h' : ''}</div></div>`;
        else {
          const a = TS.Sim.aspect(j);
          const lit = { VL: ['', '', 'g', ''], A: ['', '', '', 'y'], S: ['', 'r', '', ''], C: ['r', 'r', '', ''], R: ['y', '', '', ''], RR: ['y', '', '', 'y'], A_RR: ['y', '', '', 'y'] }[a] || ['', 'r', '', ''];
          const nm = { VL: 'Voie libre', A: 'Avertissement', S: 'Sémaphore', C: 'Carré', R: 'Ralentissement 60', RR: 'Rappel 60', A_RR: 'Avert. + rappel 60' }[a];
          sh = `<div class="asig"><span class="mini">${lit.map(c => `<i class="${c}"></i>`).join('')}</span><div><b>${nm}</b>${TS.fmtDist(d)}</div></div>`;
        }
      }
      const lim = Math.round(P.lineLimit || 0);
      const nl = R.nextLimit(P.s, Math.min(lim, cfg.vmax), 3000);
      sh += `<div class="tiv white" title="Vitesse limite">${lim}</div>`;
      if (nl && nl.v < cfg.vmax) sh += `<div class="asig"><div class="tiv">${nl.v}</div><div>dans<br><b>${TS.fmtDist(nl.s0 - P.s)}</b></div></div>`;
      hud.assist.innerHTML = sh;
    }
    renderChecklist();
  };

  /* ══════════ Modales ══════════ */
  const modal = $('#modal'), mbox = modal.querySelector('.md-box');
  function openModal(html, onOpen) { mbox.innerHTML = html; modal.hidden = false; TS.Main.setPaused(true); onOpen && onOpen(mbox); }
  function closeModal() { modal.hidden = true; TS.Main.setPaused(false); }
  C.closeModal = closeModal;
  C.modalOpen = () => !modal.hidden;
  modal.addEventListener('click', e => { if (e.target === modal && !modal.dataset.lock) closeModal(); });

  function visiteModal() {
    const pax = cfg.loco.cat === 'pax';
    const n = cfg.vehicles.length;
    const items = [
      ['Roues et bandages', 'Absence de méplat, de fissure ou d\'échauffement.'],
      [cfg.loco.kind === 'tgv' ? 'Disques et garnitures de frein' : 'Semelles et timonerie de frein', 'Usure, fixation, jeu.'],
      ['Suspensions et boîtes d\'essieux', 'Ressorts, amortisseurs, graissage.'],
      [cfg.loco.kind === 'loco' ? 'Attelages, accouplements CG / CP et câbles UIC' : 'Coupleurs automatiques et intercirculations', 'Verrouillage et étanchéité.'],
      ['Robinets d\'arrêt de la conduite générale', 'Ouverts sur toute la rame, fermés en queue.'],
      [pax ? 'Portes et marchepieds' : 'Chargement et fermetures des wagons', pax ? 'Fonctionnement et verrouillage.' : 'Bâches, portes, scellés, gabarit.'],
      ['Signalisation d\'arrière', 'Feux rouges de queue en place.'],
      ['Abords du train', 'Absence d\'obstacle, de cale ou de personnel engagé.'],
    ];
    const fault = Math.floor(Math.random() * items.length);
    const faultTxt = fault === 4 ? `Robinet d'arrêt fermé entre les véhicules ${1 + Math.floor(Math.random() * (n - 1))} et suivant` : fault === 7 ? 'Cale anti-dérive oubliée sous un essieu' : null;
    const state = items.map(() => 0);
    openModal(`<h3>Visite de préparation</h3><p class="sub">Contrôlez chaque point autour du train (${n} véhicules, ${Math.round(cfg.trainLen)} m).</p><div class="vis-list" id="vl"></div><div class="md-actions"><button class="btn ghost" id="vx">Annuler</button><button class="btn primary" id="vo" disabled>Terminer la visite</button></div>`, b => {
      const list = b.querySelector('#vl');
      const draw = () => {
        list.innerHTML = '';
        items.forEach(([t, d], i) => {
          const s = state[i];
          const row = el('div', 'vis-it' + (s === 2 ? ' ok' : s === 3 ? ' fault' : ''), `<div>${esc(t)}<small>${s === 3 ? esc(faultTxt) : esc(d)}</small></div>`);
          if (s === 0) { const bt = el('button', '', 'Contrôler'); bt.onclick = () => { state[i] = 1; draw(); setTimeout(() => { state[i] = (i === fault && faultTxt) ? 3 : 2; draw(); }, 700); }; row.append(bt); }
          else if (s === 1) row.append(el('span', 'st', '…'));
          else if (s === 3) { const bt = el('button', '', fault === 4 ? 'Ouvrir le robinet' : 'Retirer la cale'); bt.onclick = () => { state[i] = 2; draw(); }; row.append(bt); }
          else row.append(el('span', 'st', 'OK'));
          list.append(row);
        });
        b.querySelector('#vo').disabled = !state.every(s => s === 2);
      };
      draw();
      b.querySelector('#vx').onclick = closeModal;
      b.querySelector('#vo').onclick = () => { TS.Sim.cmd('visite'); TS.Sim.say('Visite de préparation terminée : rien à signaler.', 'ok'); closeModal(); };
    });
  }

  function kvbModal() {
    if (!TS.Sim.P.key) { TS.Sim.say('Clé de commande non activée : KVB hors service.', 'warn'); return; }
    openModal(`<h3>Saisie KVB</h3><p class="sub">Paramètres du train d'après le bulletin de composition (bouton Documents).</p>
      <div class="fgrid">
        <div class="field">Type de train<div class="seg-radio"><label><input type="radio" name="kt" value="V">V — Voyageurs</label><label><input type="radio" name="kt" value="MA">MA — Marchandises</label><label><input type="radio" name="kt" value="ME">ME — Messagerie</label></div></div>
        <label class="field">Vitesse limite (km/h)<input type="number" id="kv" min="10" max="360" step="10"></label>
        <label class="field">Longueur (m)<input type="number" id="kl" min="10" max="900" step="10"></label>
        <label class="field">Masse freinée (%)<input type="number" id="kf" min="20" max="250" step="5"></label>
      </div><p class="err" id="ke"></p>
      <div class="md-actions"><button class="btn ghost" id="kd">Bulletin</button><button class="btn ghost" id="kx">Annuler</button><button class="btn primary" id="ko">Valider</button></div>`, b => {
      b.querySelector('#kx').onclick = closeModal;
      b.querySelector('#kd').onclick = () => docsModal('compo');
      b.querySelector('#ko').onclick = () => {
        const t = (b.querySelector('input[name=kt]:checked') || {}).value;
        const v = +b.querySelector('#kv').value, l = +b.querySelector('#kl').value, f = +b.querySelector('#kf').value;
        const err = m => { b.querySelector('#ke').textContent = m; TS.Audio.fx('refus'); };
        const want = cfg.loco.cat === 'pax' ? 'V' : 'MA';
        if (!t) return err('Choisissez le type de train.');
        if (t !== want) return err('Type incohérent avec la composition.');
        if (!v || v > cfg.vmax) return err('Vitesse supérieure à la vitesse limite du train (' + cfg.vmax + ' km/h).');
        if (v < cfg.vmax - 20) return err('Vitesse trop faible : saisir la vitesse limite du train.');
        if (!l || l < Math.ceil(cfg.trainLen)) return err('Longueur inférieure à la longueur réelle : dangereux.');
        if (l > cfg.trainLen + 100) return err('Longueur très supérieure à la composition.');
        if (!f || f > cfg.brakedPct) return err('Masse freinée supérieure à celle du bulletin : dangereux.');
        TS.Sim.cmd('kvb', { type: t, v, len: l, pct: f });
        closeModal();
      };
    });
  }

  function radioModal() {
    if (!TS.Sim.P.bat) { TS.Sim.say('Radio hors tension (batterie).', 'warn'); return; }
    openModal(`<h3>Radio sol-train GSM-R</h3><p class="sub">Enregistrez le numéro du train figurant sur la fiche horaire.</p>
      <label class="field">Numéro de train<input type="text" id="rn" autocomplete="off" placeholder="ex. 12345"></label><p class="err" id="re"></p>
      <div class="md-actions"><button class="btn ghost" id="rd">Fiche horaire</button><button class="btn ghost" id="rx">Annuler</button><button class="btn primary" id="ro">Enregistrer</button></div>`, b => {
      const inp = b.querySelector('#rn'); inp.focus();
      b.querySelector('#rx').onclick = closeModal;
      b.querySelector('#rd').onclick = () => docsModal('horaire');
      const ok = () => {
        const want = cfg.number.replace(/\D/g, ''), got = inp.value.replace(/\D/g, '');
        if (got !== want) { b.querySelector('#re').textContent = 'Numéro inconnu du régulateur.'; TS.Audio.fx('refus'); return; }
        TS.Sim.cmd('radio'); closeModal();
      };
      b.querySelector('#ro').onclick = ok;
      inp.onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') ok(); };
    });
  }

  function docsModal(tab) {
    tab = tab || 'horaire';
    const P = TS.Sim.P, St = R.stations;
    const tabs = [['horaire', 'Fiche horaire'], ['compo', 'Bulletin de composition'], ['proc', 'Procédure'], ['sig', 'Signalisation'], ['log', 'Rapport']];
    let body = '';
    if (tab === 'horaire') {
      body = `<p><b>${esc(cfg.number)}</b> · ${esc(St[0].name)} → ${esc(St[St.length - 1].name)}</p><table><tr><th>Gare</th><th>Km</th><th>Arr.</th><th>Dép.</th><th>Voie</th></tr>` +
        St.map((S, i) => {
          const past = P.s > S.zoneEnd + 5 || (P.stopK === i && false);
          const next = !past && (i === P.nextStop || P.stopK === i);
          return `<tr class="${past ? 'past' : next ? 'next' : ''}"><td>${esc(S.name)}${S.stop ? '' : ' <small>(passage)</small>'}</td><td class="m">${((S.s - St[0].s) / 1000).toFixed(1).replace('.', ',')}</td><td class="m">${S.arr ? TS.fmtTime(S.arr) : ''}</td><td class="m">${S.dep && S.stop ? TS.fmtTime(S.dep) : S.stop ? '' : TS.fmtTime(S.arr)}</td><td class="m">${S.stop ? S.ourNo : ''}</td></tr>`;
        }).join('') + '</table>';
    } else if (tab === 'compo') {
      const v = cfg.vehicles;
      body = `<table><tr><th>N°</th><th>Véhicule</th><th>Config.</th><th>Long.</th><th>Masse</th></tr>` + v.map((x, i) => `<tr><td class="m">${i + 1}</td><td>${x.kind === 'loco' ? esc(cfg.loco.name) + (x.rear ? ' (arrière)' : '') : esc(cfg.wagon.name)}</td><td>${x.optName ? esc(x.optName) : ''}</td><td class="m">${x.len.toFixed(1)} m</td><td class="m">${Math.round(x.mass)} t</td></tr>`).join('') +
        `</table><table><tr><th>Train</th><td class="m">${esc(cfg.number)}</td></tr><tr><th>Type</th><td>${cfg.loco.cat === 'pax' ? 'V (voyageurs)' : 'MA (marchandises)'}</td></tr><tr><th>Longueur</th><td class="m">${Math.ceil(cfg.trainLen)} m</td></tr><tr><th>Masse</th><td class="m">${Math.round(cfg.mass)} t</td></tr><tr><th>Vitesse limite</th><td class="m">${cfg.vmax} km/h</td></tr><tr><th>Masse freinée</th><td class="m">${cfg.brakedPct} %</td></tr><tr><th>Régime de frein</th><td>${cfg.loco.cat === 'pax' ? 'P (voyageurs)' : 'G (marchandises)'}</td></tr></table>`;
    } else if (tab === 'proc') {
      const proc = TS.Sim.currentProcedure();
      body = proc ? '<ol>' + proc.map(p => `<li>${esc(typeof p.t === 'function' ? p.t() : p.t)}${p.d ? ` <small style="color:var(--muted)">— ${esc(p.d)}</small>` : ''}</li>`).join('') + '</ol>' : '<p>En ligne : respecter la signalisation, acquitter les avertissements (Entrée), appuyer sur la pédale VACMA (Espace) au moins toutes les 55 s.</p>';
    } else if (tab === 'sig') {
      body = `<table><tr><th>Indication</th><th>Signification</th></tr>
        <tr><td>Vert</td><td>Voie libre : vitesse de la ligne.</td></tr>
        <tr><td>Jaune (avertissement)</td><td>Le signal suivant est fermé : se préparer à s'arrêter. Acquitter (Entrée).</td></tr>
        <tr><td>Rouge (sémaphore)</td><td>Arrêt avant le signal : canton occupé.</td></tr>
        <tr><td>Deux rouges (carré)</td><td>Arrêt absolu : itinéraire non tracé / départ non autorisé.</td></tr>
        <tr><td>Deux jaunes horizontaux</td><td>Ralentissement : 60 km/h au signal suivant (aiguilles déviées).</td></tr>
        <tr><td>Deux jaunes verticaux</td><td>Rappel de ralentissement : 60 km/h sur les aiguilles.</td></tr>
        <tr><td>Panneau jaune chiffré</td><td>TIV à distance : limitation à venir.</td></tr>
        <tr><td>Panneaux Z / R</td><td>Début / fin de la zone limitée (la queue du train doit l'avoir dépassé).</td></tr>
        <tr><td>Panneaux bleus</td><td>Section de séparation : ouvrir le DJ, refermer après le panneau de fin. Changer la tension si nécessaire.</td></tr>
        <tr><td>TVM (LGV)</td><td>Signalisation en cabine : vitesse affichée, 000 = arrêt.</td></tr></table>`;
    } else {
      body = `<p>Score actuel : <b>${Math.round(P.score)}</b></p><ul>` + P.log.map(l => `<li class="${l.pts < 0 ? 'neg' : 'pos'}">${TS.fmtTime(l.t)} — ${esc(l.txt)} (${l.pts > 0 ? '+' : ''}${l.pts})</li>`).join('') + '</ul>';
    }
    openModal(`<h3>Documents de bord</h3><div class="tabs">${tabs.map(([k, t]) => `<button data-t="${k}" class="${k === tab ? 'on' : ''}">${t}</button>`).join('')}</div><div class="doc report">${body}</div><div class="md-actions"><button class="btn primary" id="dx">Fermer</button></div>`, b => {
      b.querySelectorAll('.tabs button').forEach(bt => bt.onclick = () => docsModal(bt.dataset.t));
      b.querySelector('#dx').onclick = closeModal;
    });
  }
  C.docs = docsModal;

  function pauseModal() {
    openModal(`<h3>Pause</h3><p class="sub">${esc(cfg.number)} · ${esc(R.stations[0].name)} → ${esc(R.stations[R.stations.length - 1].name)}</p>
      <div class="md-actions" style="justify-content:flex-start"><button class="btn primary" id="pr">Reprendre</button><button class="btn" id="pd">Documents</button><button class="btn" id="pq">Changer de service</button></div>`, b => {
      b.querySelector('#pr').onclick = closeModal;
      b.querySelector('#pd').onclick = () => docsModal();
      b.querySelector('#pq').onclick = () => { closeModal(); TS.Main.quit(); };
    });
  }
  C.pause = pauseModal;

  C.report = function () {
    const P = TS.Sim.P;
    const note = TS.clamp(Math.round(P.score / 50 * 10) / 10, 0, 20);
    const arr = P.stats.stops.filter(s => s.kind === 'arr');
    modal.dataset.lock = '1';
    openModal(`<div class="report"><h3>Fin de service</h3><p class="sub">${esc(cfg.number)} · arrivée à ${esc(R.stations[R.stations.length - 1].name)} à ${TS.fmtTime(TS.Sim.time)}</p>
      <div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap"><div class="big">${String(note).replace('.', ',')}/20</div>
      <div class="infos"><div class="kpi"><b>${(P.stats.dist / 1000).toFixed(1).replace('.', ',')} km</b><span>Parcourus</span></div><div class="kpi"><b>${Math.round(P.stats.maxV)} km/h</b><span>V max</span></div><div class="kpi"><b>${P.stats.fu}</b><span>Freinages d'urgence</span></div><div class="kpi"><b>${arr.length}</b><span>Arrêts</span></div></div></div>
      <table class="doc"><tr><th>Gare</th><th>Écart horaire</th><th>Précision</th></tr>${arr.map(s => `<tr><td>${esc(s.name)}</td><td class="m">${s.delay > 0 ? '+' : ''}${Math.round(s.delay / 60)} min</td><td class="m">${s.prec.toFixed(1)} m</td></tr>`).join('')}</table>
      <ul>${P.log.map(l => `<li class="${l.pts < 0 ? 'neg' : 'pos'}">${esc(l.txt)} (${l.pts > 0 ? '+' : ''}${l.pts})</li>`).join('')}</ul></div>
      <div class="md-actions"><button class="btn" id="rq">Nouveau service</button><button class="btn primary" id="rr">Rejouer ce trajet</button></div>`, b => {
      b.querySelector('#rq').onclick = () => { delete modal.dataset.lock; closeModal(); TS.Main.quit(); };
      b.querySelector('#rr').onclick = () => { delete modal.dataset.lock; closeModal(); TS.Main.restart(); };
    });
  };

  C.init = function (config, route) {
    cfg = config; R = route; fam = TS.Sim.family(); clKey = '';
    build(); buildHud(); setScale(1);
    $('#checklist').className = '';
    $('#toasts').innerHTML = '';
    TS.Sim.onMsg = toast;
    layoutGauges();
  };
  return C;
})();

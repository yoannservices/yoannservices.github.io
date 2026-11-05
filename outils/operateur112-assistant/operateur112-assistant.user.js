// ==UserScript==
// @name         Operateur112 – Assistant d'envoi
// @namespace    loisirs.operateur112
// @version      1.2.0
// @description  Hôpitaux et cellules choisis tout seuls ; page mission : pré-coche les véhicules ; bouton « Envois auto » : enchaîne les missions rouges.
// @match        https://operateur112.fr/*
// @match        https://www.operateur112.fr/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // Toujours : hôpitaux et cellules sont choisis tout seuls (page mission et carte).
  // Page mission : le script coche des cases, c'est TOI qui cliques sur « Déployer »,
  // sauf avec le bouton « Envois auto » (désactivé au départ) qui enchaîne les missions rouges.
  // C'est de l'automatisation, interdite par les CGU.
  const TRANSPORT_WAIT = 30 * 1000;  // sur la carte : le transport automatique du jeu passe d'abord
  const CHAIN_PAUSE = 30 * 1000;     // pause entre deux passages sur les missions rouges
  const CHAIN_MAX = 20;              // missions par passage
  const BAD_TTL = 10 * 60 * 1000;    // véhicule refusé (effectifs) écarté pendant

  const TYPE_ASSU = 5;
  const TYPE_AR = 28;

  const CACHE_KEY = 'o112_missions_cache';
  const CACHE_TTL = 24 * 3600 * 1000;

  // Libellés lisibles pour les besoins les plus courants (clé brute sinon).
  const LABELS = {
    firetrucks: 'Engins incendie',
    platform_trucks: 'Échelles',
    battalion_chief_vehicles: 'Chefs de groupe',
    kdow_orgl: 'Chefs de colonne',
    mobile_command_vehicles: 'PC mobiles',
    police_cars: 'Véhicules de police',
    ambulances: 'Ambulances',
    heavy_rescue_vehicles: 'Secours routier / sauvetage',
    water_tankers: 'Citernes',
    hazmat_vehicles: 'Risques chimiques',
    mobile_air_vehicles: 'Air respirable',
    brush_truck: 'Feux de forêt',
    water_needed: 'Eau nécessaire (L)',
    foam: 'Mousse (L)',
    hose: 'Tuyaux',
    pump: 'Pompage',
    boats: 'Bateaux',
    police_helicopters: 'Hélico police',
    thw_gkw: 'VTU',
  };

  const norm = (s) =>
    (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9 ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const css = `
    #o112-panel,#o112-autobox{position:fixed;z-index:99999;width:280px;max-height:50vh;overflow:auto;opacity:.95;
      background:#1f2430;color:#eee;font:13px/1.4 system-ui,sans-serif;border-radius:8px;
      box-shadow:0 4px 16px rgba(0,0,0,.4);padding:10px;right:8px;bottom:64px}
    #o112-panel h4{margin:0 0 6px;font-size:14px;color:#ffb347}
    #o112-panel ul{margin:4px 0 8px;padding-left:18px}
    #o112-panel .ok{color:#7ddc7d}#o112-panel .ko{color:#ff7b7b}
    #o112-panel button{margin:2px 4px 2px 0;padding:4px 8px;border:0;border-radius:4px;cursor:pointer;
      background:#3a4255;color:#fff}
    #o112-panel button:hover{background:#4c5670}
    #o112-autobox{bottom:56px;font-size:12px;color:#ccc}
    #o112-auto{position:fixed;bottom:12px;right:12px;z-index:99999;padding:8px 12px;border:0;border-radius:6px;
      color:#fff;font:bold 13px system-ui,sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.4)}
    .o112-highlight{outline:3px solid #ffb347 !important;outline-offset:2px;animation:o112pulse 1s infinite}
    @keyframes o112pulse{50%{outline-color:transparent}}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ---------- Document lu ----------
  const D = document;
  const tick = (cb) => cb.click(); // click() : le jeu met à jour ses compteurs
  const toDoc = (html) => new DOMParser().parseFromString(html, 'text/html');
  const fetchText = (url, opt) => fetch(url, { credentials: 'same-origin', ...opt }).then((r) => r.text());
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const jitter = (ms) => ms + Math.random() * ms * 0.5;

  const ss = (k, v) => {
    try {
      if (v === undefined) return sessionStorage.getItem(k);
      if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v);
    } catch (e) { /* stockage bloqué */ }
    return null;
  };
  const ssJson = (k) => { try { return JSON.parse(ss(k) || '{}'); } catch (e) { return {}; } };

  // ---------- Données des types de mission (publiques, mises en cache) ----------
  async function getMissionTypes() {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (cached && Date.now() - cached.t < CACHE_TTL) return cached.d;
    } catch (e) { /* cache illisible : on recharge */ }
    const res = await fetch('/einsaetze.json');
    const list = await res.json();
    const d = {};
    list.forEach((m) => { d[m.id] = { name: m.name, req: m.requirements || {}, chances: m.chances || {} }; });
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d })); } catch (e) { /* quota */ }
    return d;
  }

  // ---------- Lecture d'une page mission ----------
  function missionTypeId() {
    const help = D.querySelector('#mission_help, a[href*="/einsaetze/"]');
    const m = help && help.getAttribute('href').match(/einsaetze\/(\d+)/);
    return m ? m[1] : null;
  }

  // Lit « Restant à envoyer : 2 Xxx, 1 Yyy » affiché par le jeu.
  function parseMissing() {
    const box = D.querySelector('#missing_text');
    if (!box || box.offsetParent === null) return [];
    const out = [];
    box.textContent.split('\n').forEach((line) => {
      const idx = line.indexOf(':');
      if (idx < 0) return;
      line.slice(idx + 1).split(',').forEach((part) => {
        const m = part.trim().replace(/\.$/, '').match(/^(\d+)\s+(.+)$/);
        if (m) out.push({ count: parseInt(m[1], 10), caption: m[2].trim() });
      });
    });
    return out;
  }

  // Véhicules refusés par le jeu (« manque d'effectifs… ») : écartés un moment.
  const BAD_KEY = 'o112_bad';
  function badVehicles() {
    const bad = ssJson(BAD_KEY);
    return new Set(Object.keys(bad).filter((id) => Date.now() - bad[id] < BAD_TTL));
  }

  // Lit les erreurs rouges qui nomment un véhicule ; retourne combien de nouveaux véhicules sont écartés.
  function collectErrors() {
    const bad = ssJson(BAD_KEY);
    let added = 0;
    D.querySelectorAll('.alert-danger, .alert-error').forEach((al) => {
      if (!/manque d.effectifs|pas qualifi|personnel/i.test(al.textContent)) return;
      al.querySelectorAll('a[href^="/vehicles/"]').forEach((a) => {
        const id = a.getAttribute('href').match(/vehicles\/(\d+)/)[1];
        if (!bad[id] || Date.now() - bad[id] > BAD_TTL) added++;
        bad[id] = Date.now();
      });
    });
    ss(BAD_KEY, JSON.stringify(bad));
    return added;
  }

  function vehicleRows() {
    const bad = badVehicles();
    return [...D.querySelectorAll('#vehicle_show_table_body_all tr, tr.vehicle_select_table_tr')]
      .filter((tr, i, all) => all.indexOf(tr) === i)
      .map((tr) => {
        const cb = tr.querySelector('input.vehicle_checkbox, input[type=checkbox]');
        const caption = tr.getAttribute('vehicle_type') ||
          (tr.querySelector('[vehicle_type_caption]') || {}).textContent || '';
        const dist = parseFloat(tr.getAttribute('data-distance') || cb?.getAttribute('data-distance')) || 9999;
        return cb ? { tr, cb, type: norm(caption), dist } : null;
      })
      .filter(Boolean)
      .filter((r) => !bad.has(r.cb.value))
      // Un même véhicule peut apparaître dans plusieurs onglets (Tout, Ambulance…).
      .filter((r, i, all) => all.findIndex((x) => x.cb.value === r.cb.value) === i)
      .sort((a, b) => a.dist - b.dist);
  }

  // Le texte du jeu peut être au pluriel ou abrégé : on accepte une correspondance partielle.
  function matches(rowType, wanted) {
    const w = norm(wanted).replace(/s\b/g, '');
    const r = rowType.replace(/s\b/g, '');
    return r === w || r.startsWith(w) || w.startsWith(r);
  }

  // 'vtu' : aucun tag dans le jeu, on reconnaît le nom du véhicule.
  // r.cb peut être nul (véhicule engagé dont le type n'a aucun exemplaire libre).
  const has = (r, attr) => attr === 'vtu' ? /\bvtu\b|tout usage/.test(r.type) : r.cb?.getAttribute(attr) === '1';
  const water = (r) => parseInt(r.cb?.getAttribute('wasser_amount') || '0', 10);
  const typeId = (r) => parseInt(r.cb.getAttribute('vehicle_type_id'), 10);

  // Noms génériques du jeu (« Restant à envoyer : 1 fourgon d'incendie… ») → tag de la case.
  // Les plus spécifiques d'abord ; le premier qui correspond gagne.
  const CAPTION_ATTR = [
    [/tout usage|\bvtu\b/i, 'vtu'], // avant « fourgon » : aucun tag sur la case, on compare le nom
    [/[ée]chelle|bras|dlk|platform/i, 'dlk'],
    [/chef de colonne|kdow/i, 'kdow_orgl'],
    [/chef de groupe|commandement|elw/i, 'elw'],
    [/secours routier|sauvetage|d[ée]sincarc/i, 'rw'],
    [/air respirable|appareil respiratoire/i, 'gwa'],
    [/citerne|camion[- ]citerne/i, 'gwl2wasser'],
    [/feu.*for[êe]t|forestier/i, 'brush_truck'],
    [/patrouille|police|v[ée]hicule de patrouille/i, 'fustw'],
    [/ambulance|samu|sanitaire/i, 'rtw'],
    [/fourgon|engin.*incendie|pompe|camion.*pompier|pompier/i, 'fire'],
  ];

  // Retourne une fonction qui dit si une ligne de véhicule répond à ce libellé.
  function matcher(caption) {
    const hit = CAPTION_ATTR.find(([re]) => re.test(caption));
    if (hit) return (r) => has(r, hit[1]);
    return (r) => matches(r.type, caption); // sinon : nom exact du véhicule (FPT, VSRM…)
  }

  function preselect(missing) {
    const rows = vehicleRows(); // les plus proches d'abord
    const result = [];
    const used = new Set();
    missing.forEach(({ count, caption }) => {
      const ok = matcher(caption);
      let got = rows.filter((r) => r.cb.checked && ok(r)).length;
      for (const r of rows) {
        if (got >= count) break;
        if (!r.cb.checked && !used.has(r) && ok(r)) {
          used.add(r);
          tick(r.cb);
          got++;
        }
      }
      result.push({ caption, count, got });
    });
    return result;
  }

  function uncheckAll() {
    vehicleRows().forEach((r) => { if (r.cb.checked) r.cb.click(); });
  }

  // Besoin de mission (einsaetze.json) → tag porté par la case du véhicule.
  // Ordre = priorité : les engins spécialisés d'abord, les engins incendie
  // génériques en dernier pour ne pas « gaspiller » une échelle comme FPT.
  const REQ_ATTR = [
    ['platform_trucks', 'dlk'],
    ['battalion_chief_vehicles', 'elw'],
    ['elw3', 'elw3'],
    ['kdow_orgl', 'kdow_orgl'],
    ['mobile_command_vehicles', 'elw2'],
    ['heavy_rescue_vehicles', 'rw'],
    ['mobile_air_vehicles', 'gwa'],
    ['water_tankers', 'gwl2wasser'],
    ['brush_truck', 'brush_truck'],
    ['thw_gkw', 'vtu'],
    ['police_cars', 'fustw'],
    ['ambulances', 'rtw'],
    ['firetrucks', 'fire'],
  ];

  // Véhicules déjà sur les lieux ou en route : ils comptent dans les besoins.
  // Le tag vient d'une case libre du même type de véhicule, à défaut on se rabat sur le nom.
  function engagedRows(rows) {
    const tags = new Map();
    rows.forEach((r) => tags.set(r.cb.getAttribute('vehicle_type_id'), r.cb));
    return [...D.querySelectorAll('#mission_vehicle_at_mission tbody tr, #mission_vehicle_driving tbody tr')]
      .map((tr) => {
        const a = tr.querySelector('a[vehicle_type_id]');
        if (!a) return null;
        const name = (tr.querySelector('small') || {}).textContent || a.textContent;
        return { type: norm(name.replace(/[()]/g, '')), cb: tags.get(a.getAttribute('vehicle_type_id')) || null };
      })
      .filter(Boolean);
  }

  function preselectFromRequirements(req) {
    const rows = vehicleRows();
    const engaged = engagedRows(rows);
    const usedE = new Set();
    const used = new Set();
    const report = [];
    for (const [key, attr] of REQ_ATTR) {
      const count = req[key];
      if (!count) continue;
      let got = 0;
      for (const e of engaged) {
        if (got >= count) break;
        if (!usedE.has(e) && has(e, attr)) { usedE.add(e); got++; }
      }
      for (const r of rows) {
        if (got >= count) break;
        if (used.has(r) || !has(r, attr)) continue;
        if (!r.cb.checked) tick(r.cb);
        used.add(r);
        got++;
      }
      report.push({ caption: LABELS[key] || key, count, got });
    }
    // Eau : on complète avec les véhicules qui en transportent le plus.
    if (req.water_needed) {
      let total = [...used, ...engaged].reduce((s, r) => s + water(r), 0);
      const extra = rows.filter((r) => !used.has(r) && water(r) > 0).sort((a, b) => a.dist - b.dist);
      for (const r of extra) {
        if (total >= req.water_needed) break;
        if (!r.cb.checked) tick(r.cb);
        used.add(r);
        total += water(r);
      }
      report.push({ caption: 'Eau (L)', count: req.water_needed, got: total });
    }
    const unknown = Object.keys(req).filter((k) => k !== 'water_needed' && !REQ_ATTR.some(([rk]) => rk === k));
    return { report, unknown };
  }

  // Patients pas encore pris en charge (« 1 Patient - 1 Patients non traités »).
  function untreatedPatients() {
    const el = D.querySelector('#patient_button_text');
    const m = (el ? el.textContent : D.body.textContent).match(/(\d+)\s+Patients?\s+non\s+trait/i);
    return m ? parseInt(m[1], 10) : 0;
  }

  // S'assure que `count` véhicules acceptés par `pick` sont cochés
  // (ceux déjà cochés comptent), en préférant ceux où `prefer` est vrai.
  function ensureChecked(count, pick, prefer = () => true) {
    const rows = vehicleRows().filter(pick);
    let got = rows.filter((r) => r.cb.checked).length;
    const free = rows.filter((r) => !r.cb.checked)
      .sort((a, b) => (prefer(b) - prefer(a)) || (a.dist - b.dist));
    for (const r of free) {
      if (got >= count) break;
      tick(r.cb);
      got++;
    }
    return got;
  }

  // Ce que réclament les patients (« Il nous faut : Ambulance », « Transport sanitaire, Équipe Médicale »…).
  // Une AR couvre à la fois l'équipe médicale et le transport : elle passe en premier.
  const PATIENT_NEEDS = [
    {
      re: /[ée]quipe m[ée]dicale|m[ée]decin/i, label: 'AR (équipe médicale)',
      pick: (r) => typeId(r) === TYPE_AR, covers: (t) => t === TYPE_AR,
    },
    {
      re: /ambulance|transport sanitaire/i, label: 'Ambulances (patients)',
      pick: (r) => has(r, 'rtw'), prefer: (r) => typeId(r) !== TYPE_AR, // on garde les AR pour les équipes médicales
      covers: (t) => t === TYPE_ASSU || t === TYPE_AR,
    },
  ];

  // Un véhicule par patient : le besoin le plus exigeant de sa carte l'emporte.
  function patientNeeds() {
    const counts = new Map();
    const unknown = {};
    D.querySelectorAll('.mission_patient .alert-danger').forEach((a) => {
      const needs = a.textContent.replace(/Il nous faut\s*:\s*/i, '').split(/,|\bet\b/)
        .map((n) => n.replace(/\s+/g, ' ').trim()).filter(Boolean);
      const def = PATIENT_NEEDS.find((d) => needs.some((n) => d.re.test(n)));
      if (def) counts.set(def, (counts.get(def) || 0) + 1);
      needs.filter((n) => !PATIENT_NEEDS.some((d) => d.re.test(n)))
        .forEach((n) => { unknown[n] = (unknown[n] || 0) + 1; });
    });
    return { counts, unknown };
  }

  // Types des véhicules déjà en route (ils couvriront un besoin à leur arrivée).
  function drivingTypes() {
    return [...D.querySelectorAll('#mission_vehicle_driving a[vehicle_type_id]')]
      .map((a) => parseInt(a.getAttribute('vehicle_type_id'), 10));
  }

  function handlePatients(report, unknown) {
    let driving = drivingTypes();
    const { counts, unknown: other } = patientNeeds();
    counts.forEach((n, def) => {
      // Les véhicules en route couvriront ces patients ; chacun ne compte qu'une fois.
      let count = n;
      driving = driving.filter((t) => !(count > 0 && def.covers(t) && count--));
      if (count <= 0) return;
      report.push({ caption: def.label, count, got: ensureChecked(count, def.pick, def.prefer) });
    });
    Object.entries(other).forEach(([need, n]) => unknown.push(`${n} × ${need} (patient)`));
  }

  // Transferts : 1 véhicule par patient non traité. « Transfert … (Spécialité) » → AR, sinon ambulance.
  function handleTransfer(report) {
    const n = untreatedPatients();
    if (!n) return;
    const title = (D.querySelector('#missionH1') || {}).textContent || '';
    if (/transfert.*\(.+\)/i.test(title)) {
      report.push({ caption: 'AR (transfert spécialisé)', count: n, got: ensureChecked(n, (r) => typeId(r) === TYPE_AR) });
    } else {
      const def = PATIENT_NEEDS[1]; // ambulance
      report.push({ caption: 'Ambulances (patients)', count: n, got: ensureChecked(n, def.pick, def.prefer) });
    }
  }

  // Véhicules déjà en route ou sur place : dans ce cas on ne se fie plus qu'au « manquant » du jeu.
  function engagedVehicles() {
    const rows = D.querySelectorAll(
      '#mission_vehicle_at_mission tbody tr, #mission_vehicle_driving tbody tr, tr[id^="vehicle_row_"]'
    ).length;
    if (rows) return rows;
    // Repli : le jeu n'affiche ces titres que s'il y a des véhicules engagés.
    const titles = [...D.querySelectorAll('h1,h2,h3,h4,h5')].map((h) => h.textContent);
    return titles.some((t) => /V[ée]hicules (sur les lieux|en (route|approche))/i.test(t)) ? 1 : 0;
  }

  // Coche ce qu'il faut sur le document courant D. Si le jeu affiche « manquant », on s'y fie ;
  // sans véhicule engagé, on part des besoins de la mission ; sinon seuls les patients restent.
  function plan(mission) {
    const report = [];
    const unknown = [];
    let source;
    const missing = parseMissing();
    const engaged = engagedVehicles();
    if (missing.length) {
      source = 'Manquant selon le jeu';
      report.push(...preselect(missing));
    } else if (!engaged && mission) {
      source = 'Besoins de la mission';
      const r = preselectFromRequirements(mission.req);
      report.push(...r.report);
      unknown.push(...r.unknown.map((k) => `${mission.req[k]} × ${LABELS[k] || k}`));
    } else {
      source = engaged ? 'Véhicules déjà engagés' : 'Mission';
    }
    if (!engaged) handleTransfer(report);
    handlePatients(report, unknown);
    // Mission sans besoin chiffré mais avec un patient (« Nausées… ») : le jeu attend une première ambulance.
    if (!engaged && !report.some((r) => r.got > 0) && D.querySelector('.mission_patient')) {
      const def = PATIENT_NEEDS[1];
      report.push({ caption: 'Ambulance (premier secours)', count: 1, got: ensureChecked(1, def.pick, def.prefer) });
    }
    return { source, report, unknown };
  }

  // ---------- Page d'une mission (pré-cochage manuel) ----------
  async function missionPage() {
    const panel = document.createElement('div');
    panel.id = 'o112-panel';
    panel.innerHTML = '<h4>Assistant 112</h4><div id="o112-body">Chargement…</div>';
    document.body.appendChild(panel);
    const body = panel.querySelector('#o112-body');

    const retry = collectErrors() > 0; // erreur d'effectifs : ce véhicule est écarté, on en prend un autre
    // Un véhicule de cette mission attend un hôpital / une cellule : on le règle tout de suite.
    const sent = await missionTransports(location.pathname.match(/\d+/)[0]);
    if (sent) {
      body.innerHTML = `<span class="ok">${sent} transport(s) envoyé(s)…</span>`;
      setTimeout(() => location.reload(), 1500);
      return;
    }
    let mission = null;
    const missionType = missionTypeId();
    if (missionType) {
      try { mission = (await getMissionTypes())[missionType] || null; } catch (e) { /* hors ligne */ }
    }

    const li = (r) => `<li class="${r.got >= r.count ? 'ok' : 'ko'}">${r.caption} : ${r.got}/${r.count}</li>`;

    const render = (res) => {
      let html = mission ? `<b>${mission.name}</b><br>` : '';
      if (res) {
        html += `${res.source} — coché :<ul>${res.report.map(li).join('') || '<li>—</li>'}</ul>`;
        if (res.unknown.length) {
          html += '<span class="ko">À vérifier à la main :</span><ul>' +
            res.unknown.map((u) => `<li>${u}</li>`).join('') + '</ul>';
        }
      } else {
        html += '<i>Rien à pré-cocher.</i><br>';
      }
      if (mission && Object.keys(mission.chances).length) {
        html += '<span style="color:#aaa">Possible en renfort : ' +
          Object.entries(mission.chances).map(([k, p]) => `${LABELS[k] || k} (${p} %)`).join(', ') + '</span><br>';
      }
      html += '<button id="o112-pre">Re-cocher</button><button id="o112-clear">Tout décocher</button>' +
        '<div style="margin-top:6px;color:#aaa">Vérifie puis clique toi-même sur <b>Déployer</b>.</div>';
      body.innerHTML = html;
      body.querySelector('#o112-pre').onclick = () => { uncheckAll(); render(plan(mission)); };
      body.querySelector('#o112-clear').onclick = () => { uncheckAll(); render(null); };
    };

    render(plan(mission));
    document.querySelectorAll('#mission_alarm_btn, .alert_next').forEach((b) => b.classList.add('o112-highlight'));
    autoStep(retry);
  }

  // ---------- Transports (toujours actifs) ----------
  const AUTO_KEY = 'o112_auto_on';
  const autoOn = () => { try { return localStorage.getItem(AUTO_KEY) === '1'; } catch (e) { return false; } };
  const lsNum = (k) => { try { return parseInt(localStorage.getItem(k) || '0', 10); } catch (e) { return 0; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* bloqué */ } };
  const getVehicles = async () => (await fetch('/api/vehicles', { credentials: 'same-origin' })).json();

  // Hôpital (1er de la liste) ou cellule (libre, sans taxe d'abord, puis la plus proche) pour un véhicule en attente.
  function chooseTransport(id, html) {
    const hospital = [...toDoc(html).querySelectorAll('a[href*="/patient/"]')]
      .find((a) => !a.classList.contains('disabled') && !/\/patient\/-1/.test(a.getAttribute('href')));
    if (hospital) return { url: hospital.getAttribute('href'), what: 'hôpital' };
    const prisons = [...html.matchAll(/prisons\.push\((\{.*?\})\);/gs)]
      .map((m) => { try { return JSON.parse(m[1]); } catch (e) { return null; } })
      .filter((p) => p && parseInt(p.free_cells, 10) > 0)
      .map((p) => ({ p, tax: p.alliance_share_credits_percentage || 0, dist: parseFloat(String(p.distance_in_km).replace(',', '.')) || 999 }))
      .sort((a, b) => (a.tax - b.tax) || (a.dist - b.dist));
    if (prisons.length) return { url: `/vehicles/${id}/gefangener/${prisons[0].p.id}`, what: 'cellule' };
    return null;
  }

  // Véhicules sur place (4) ou en demande de transport (5) : la page du véhicule dit si un choix est attendu.
  // `mission` : id d'une mission (page mission, envoi immédiat) ; sans lui, tous (carte, après TRANSPORT_WAIT).
  async function doTransports(vehicles, log, mission) {
    const seen = ssJson('o112_seen');
    const idle = ssJson('o112_idle');
    const now = Date.now();
    const next = {};
    let done = 0;
    const waiting = vehicles.filter((x) => (x.fms_real === 4 || x.fms_real === 5) && x.target_type === 'mission' &&
      (!mission || String(x.target_id) === mission));
    for (const v of waiting) {
      if (now - (idle[v.id] || 0) < 120000) continue;
      const choice = chooseTransport(v.id, await fetchText('/vehicles/' + v.id));
      if (!choice) { idle[v.id] = now; continue; }
      next[v.id] = seen[v.id] || now;
      if (!mission && now - next[v.id] < TRANSPORT_WAIT) continue;
      await sleep(jitter(800));
      await fetchText(choice.url);
      delete next[v.id];
      done++;
      log(`${v.caption} → ${choice.what}`);
    }
    ss('o112_seen', JSON.stringify({ ...seen, ...next }));
    ss('o112_idle', JSON.stringify(idle));
    return done;
  }

  async function missionTransports(id) {
    try { return await doTransports(await getVehicles(), () => {}, id); } catch (e) { return 0; }
  }

  // ---------- Missions rouges : enchaînement dans la fenêtre de mission ----------
  // La carte ouvre la 1re mission à traiter ; chaque page mission envoie ses véhicules (« Déployer + mission
  // suivante »), ou passe à la suivante s'il n'y a rien à envoyer, puis ferme la fenêtre. 30 s plus tard, la carte recommence.
  function finishChain() {
    lsSet('o112_active', 0);
    lsSet('o112_wait', Date.now() + CHAIN_PAUSE);
    try { window.parent.lightboxClose(); } catch (e) { if (window.top === window) location.href = '/'; }
  }

  function autoStep(retry) {
    if (!autoOn()) return;
    const id = location.pathname.match(/\d+/)[0];
    let chain = {};
    try { chain = JSON.parse(localStorage.getItem('o112_chain') || '{}'); } catch (e) { /* illisible */ }
    chain.ids = chain.ids || [];
    if ((chain.ids.includes(id) && !retry) || chain.ids.length >= CHAIN_MAX) { setTimeout(finishChain, 1500); return; }
    if (!chain.ids.includes(id)) chain.ids.push(id);
    lsSet('o112_chain', JSON.stringify(chain));
    lsSet('o112_active', Date.now());

    const ticked = D.querySelectorAll('input.vehicle_checkbox:checked').length;
    const send = D.querySelector('#alert_next_btn') || D.querySelector('#mission_alarm_btn');
    const nextBtn = D.querySelector('#mission_next_mission_btn');
    if (ticked && send) {
      setTimeout(() => { send.click(); setTimeout(finishChain, 10000); }, 1500); // la page n'a pas changé : on s'arrête
    } else if (nextBtn && nextBtn.offsetParent !== null && !nextBtn.disabled) {
      setTimeout(() => nextBtn.click(), 1000);
    } else {
      setTimeout(finishChain, 1500);
    }
  }

  // Missions de la carte (déjà à jour : le jeu les rafraîchit en direct).
  function listEntries() {
    return [...document.querySelectorAll('#mission_list .missionSideBarEntry')]
      .map((e) => ({
        id: e.getAttribute('mission_id'),
        col: ((e.querySelector('[class*=mission_panel_]') || {}).className || '').match(/mission_panel_(\w+)/)?.[1],
        missing: ((e.querySelector('[id^=mission_missing_]:not([id*=short])') || {}).textContent || '').replace(/\s+/g, ' ').trim(),
        name: ((e.querySelector('[id^=mission_caption]') || {}).firstChild || {}).textContent?.trim() || e.getAttribute('mission_id'),
      }));
  }

  function mainPage() {
    const btn = document.createElement('button');
    btn.id = 'o112-auto';
    const box = document.createElement('div');
    box.id = 'o112-autobox';
    document.body.append(box, btn);
    const lines = [];
    let status = '';
    const hhmm = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const draw = () => { box.innerHTML = `<b>Assistant</b> ${status}<br>${lines.join('<br>')}`; };
    const log = (m) => { lines.unshift(`${hhmm()} ${m}`); lines.length = Math.min(lines.length, 8); draw(); };
    const label = () => {
      btn.textContent = autoOn() ? '⏸ Envois auto : ON' : '▶ Envois auto : OFF';
      btn.style.background = autoOn() ? '#27ae60' : '#c0392b';
      draw();
    };

    // Mission à traiter : rouge sans véhicule, ou avec un « manquant » qui n'est pas qu'un transport.
    const needsSend = (e, vehicles) => {
      const engaged = vehicles.filter((v) => v.target_type === 'mission' && String(v.target_id) === e.id).length;
      const only = e.missing && /prisonniers? doivent|transport/i.test(e.missing);
      if (e.col === 'red') return !engaged || (e.missing && !only);
      return e.col === 'yellow' && e.missing && !only;
    };

    let busy = false;
    let lastTransport = 0;
    async function tickAuto() {
      if (busy) return;
      busy = true;
      try {
        const vehicles = await getVehicles();
        if (Date.now() - lastTransport >= TRANSPORT_WAIT) {
          lastTransport = Date.now();
          await doTransports(vehicles, log);
        }
        if (autoOn() && Date.now() > lsNum('o112_wait') && Date.now() - lsNum('o112_active') > 60000) {
          const todo = listEntries().find((e) => needsSend(e, vehicles));
          const open = todo && document.querySelector(`#alarm_button_${todo.id}`);
          if (open) {
            lsSet('o112_chain', '{}');
            lsSet('o112_active', Date.now());
            log(`ouvre ${todo.name}`);
            open.click(); // ouvre la fenêtre de la mission : la suite se passe dans la page mission
          } else {
            lsSet('o112_wait', Date.now() + CHAIN_PAUSE);
          }
        }
        status = `vérifié ${hhmm()}`;
      } catch (e) {
        status = `erreur ${hhmm()} : ${e.message}`;
      } finally {
        busy = false;
        draw();
      }
    }

    btn.onclick = () => {
      lsSet(AUTO_KEY, autoOn() ? '0' : '1');
      lsSet('o112_wait', 0);
      lsSet('o112_active', 0);
      label();
      tickAuto();
    };
    label();
    setTimeout(tickAuto, 2000);
    setInterval(tickAuto, 5000);
  }

  if (/^\/missions\/\d+/.test(location.pathname)) missionPage();
  else if (window.top === window && document.querySelector('#mission_list')) mainPage();
})();

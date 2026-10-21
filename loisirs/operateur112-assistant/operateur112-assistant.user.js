// ==UserScript==
// @name         Operateur112 – Assistant d'envoi (semi-auto)
// @namespace    loisirs.operateur112
// @version      0.3.0
// @description  Affiche les besoins de la mission et pré-coche les véhicules manquants. C'est TOI qui cliques sur « Déployer ».
// @match        https://operateur112.fr/*
// @match        https://www.operateur112.fr/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // Le script ne clique JAMAIS sur « Déployer » : il coche des cases et met
  // le bouton en évidence. Seuls les transports vers l'hôpital / la cellule
  // sont automatiques (désactivable ci-dessous).
  const AUTO_TRANSPORT = true;
  const AUTO_DELAY = 700; // ms avant chaque clic automatique

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
    thw_gkw: 'Soutien / logistique',
  };

  const norm = (s) =>
    (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const css = `
    #o112-panel{position:fixed;bottom:64px;right:8px;z-index:99999;width:280px;max-height:50vh;overflow:auto;opacity:.95;
      background:#1f2430;color:#eee;font:13px/1.4 system-ui,sans-serif;border-radius:8px;
      box-shadow:0 4px 16px rgba(0,0,0,.4);padding:10px}
    #o112-panel h4{margin:0 0 6px;font-size:14px;color:#ffb347}
    #o112-panel ul{margin:4px 0 8px;padding-left:18px}
    #o112-panel .ok{color:#7ddc7d}#o112-panel .ko{color:#ff7b7b}
    #o112-panel button{margin:2px 4px 2px 0;padding:4px 8px;border:0;border-radius:4px;cursor:pointer;
      background:#3a4255;color:#fff}
    #o112-panel button:hover{background:#4c5670}
    .o112-highlight{outline:3px solid #ffb347 !important;outline-offset:2px;animation:o112pulse 1s infinite}
    @keyframes o112pulse{50%{outline-color:transparent}}
    #o112-next{position:fixed;bottom:12px;right:12px;z-index:99999;padding:8px 12px;border:0;border-radius:6px;
      background:#c0392b;color:#fff;font:bold 13px system-ui,sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.4)}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

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

  // ---------- Page d'une mission ----------
  function missionTypeId() {
    const help = document.querySelector('#mission_help, a[href*="/einsaetze/"]');
    const m = help && help.getAttribute('href').match(/einsaetze\/(\d+)/);
    return m ? m[1] : null;
  }

  // Lit « Véhicules manquants : 2 Xxx, 1 Yyy » affiché par le jeu.
  function parseMissing() {
    const box = document.querySelector('#missing_text');
    if (!box || box.offsetParent === null) return [];
    const out = [];
    box.innerText.split('\n').forEach((line) => {
      const idx = line.indexOf(':');
      if (idx < 0) return;
      line.slice(idx + 1).split(',').forEach((part) => {
        const m = part.trim().replace(/\.$/, '').match(/^(\d+)\s+(.+)$/);
        if (m) out.push({ count: parseInt(m[1], 10), caption: m[2].trim() });
      });
    });
    return out;
  }

  function vehicleRows() {
    return [...document.querySelectorAll('#vehicle_show_table_body_all tr, tr.vehicle_select_table_tr')]
      .filter((tr, i, all) => all.indexOf(tr) === i)
      .map((tr) => {
        const cb = tr.querySelector('input.vehicle_checkbox, input[type=checkbox]');
        const caption = tr.getAttribute('vehicle_type') ||
          (tr.querySelector('[vehicle_type_caption]') || {}).textContent || '';
        const dist = parseFloat(tr.getAttribute('data-distance') || cb?.getAttribute('data-distance')) || 9999;
        return cb ? { tr, cb, type: norm(caption), dist } : null;
      })
      .filter(Boolean)
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

  function preselect(missing) {
    const rows = vehicleRows(); // les plus proches d'abord
    const result = [];
    missing.forEach(({ count, caption }) => {
      let got = rows.filter((r) => r.cb.checked && matches(r.type, caption)).length;
      for (const r of rows) {
        if (got >= count) break;
        if (!r.cb.checked && matches(r.type, caption)) {
          r.cb.click(); // click() pour que le jeu mette à jour ses compteurs
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
    ['thw_gkw', 'gkw'],
    ['police_cars', 'fustw'],
    ['ambulances', 'rtw'],
    ['firetrucks', 'fire'],
  ];

  const has = (r, attr) => r.cb.getAttribute(attr) === '1';
  const water = (r) => parseInt(r.cb.getAttribute('wasser_amount') || '0', 10);

  function preselectFromRequirements(req) {
    const rows = vehicleRows();
    const used = new Set();
    const report = [];
    for (const [key, attr] of REQ_ATTR) {
      const count = req[key];
      if (!count) continue;
      let got = 0;
      for (const r of rows) {
        if (got >= count) break;
        if (used.has(r) || !has(r, attr)) continue;
        if (!r.cb.checked) r.cb.click();
        used.add(r);
        got++;
      }
      report.push({ caption: LABELS[key] || key, count, got });
    }
    // Eau : on complète avec les véhicules qui en transportent le plus.
    if (req.water_needed) {
      let total = [...used].reduce((s, r) => s + water(r), 0);
      const extra = rows.filter((r) => !used.has(r) && water(r) > 0).sort((a, b) => a.dist - b.dist);
      for (const r of extra) {
        if (total >= req.water_needed) break;
        if (!r.cb.checked) r.cb.click();
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
    const el = document.querySelector('#patient_button_text');
    const m = (el ? el.textContent : document.body.innerText).match(/(\d+)\s+Patients?\s+non\s+trait/i);
    return m ? parseInt(m[1], 10) : 0;
  }

  const typeId = (r) => parseInt(r.cb.getAttribute('vehicle_type_id'), 10);

  // S'assure que `count` véhicules acceptés par `pick` sont cochés
  // (ceux déjà cochés comptent), en préférant ceux où `prefer` est vrai.
  function ensureChecked(count, pick, prefer = () => true) {
    const rows = vehicleRows().filter(pick);
    let got = rows.filter((r) => r.cb.checked).length;
    const free = rows.filter((r) => !r.cb.checked)
      .sort((a, b) => (prefer(b) - prefer(a)) || (a.dist - b.dist));
    for (const r of free) {
      if (got >= count) break;
      r.cb.click();
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
    document.querySelectorAll('.mission_patient .alert-danger').forEach((a) => {
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
    return [...document.querySelectorAll('#mission_vehicle_driving a[vehicle_type_id]')]
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
    const title = (document.querySelector('#missionH1') || {}).textContent || '';
    if (/transfert.*\(.+\)/i.test(title)) {
      report.push({ caption: 'AR (transfert spécialisé)', count: n, got: ensureChecked(n, (r) => typeId(r) === TYPE_AR) });
    } else {
      const def = PATIENT_NEEDS[1]; // ambulance
      report.push({ caption: 'Ambulances (patients)', count: n, got: ensureChecked(n, def.pick, def.prefer) });
    }
  }

  // Véhicules déjà en route ou sur place : dans ce cas on ne se fie plus qu'au « manquant » du jeu.
  function engagedVehicles() {
    const rows = document.querySelectorAll(
      '#mission_vehicle_at_mission tbody tr, #mission_vehicle_driving tbody tr, tr[id^="vehicle_row_"]'
    ).length;
    if (rows) return rows;
    // Repli : le jeu n'affiche ces titres que s'il y a des véhicules engagés.
    const titles = [...document.querySelectorAll('h1,h2,h3,h4,h5')].map((h) => h.textContent);
    return titles.some((t) => /V[ée]hicules (sur les lieux|en (route|approche))/i.test(t)) ? 1 : 0;
  }

  // Prisonniers : surligne, pour chaque véhicule, la cellule la plus proche
  // (les postes de l'alliance avec taxe passent après les tiens).
  function highlightCells() {
    const btns = [...document.querySelectorAll('a.btn, button.btn')].filter((b) => /Cellules disponibles/i.test(b.textContent));
    if (!btns.length) return 0;
    const parse = (b) => {
      const t = b.textContent.replace(/\s+/g, ' ');
      const cells = parseInt((t.match(/Cellules disponibles\s*:\s*(\d+)/i) || [])[1] || '0', 10);
      const dist = parseFloat(((t.match(/distance\s*:\s*([\d.,]+)/i) || [])[1] || '999').replace(',', '.'));
      const tax = parseInt((t.match(/taxe[^:]*:\s*(\d+)/i) || [])[1] || '0', 10);
      return { b, cells, dist, tax };
    };
    // Un groupe de boutons par véhicule transportant des prisonniers.
    const groups = new Map();
    btns.forEach((b) => {
      const key = b.closest('tr') || b.closest('.vehicle_prisoner_select') || b.parentElement.parentElement;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(parse(b));
    });
    let n = 0;
    groups.forEach((list) => {
      const best = list.filter((x) => x.cells > 0).sort((a, b) => (a.tax - b.tax) || (a.dist - b.dist))[0];
      if (best) { best.b.classList.add('o112-highlight'); n++; }
    });
    return n;
  }

  // Ambulances / patrouilles sur place qui attendent qu'on choisisse un hôpital ou une cellule.
  function transportRequests() {
    return [...document.querySelectorAll('a[href^="/vehicles/"]')]
      .filter((a) => /demande de transport/i.test(a.textContent))
      .map((a) => ({ href: a.getAttribute('href'), text: a.textContent.replace(/\s+/g, ' ').trim() }));
  }

  function highlightAlarm() {
    document.querySelectorAll('#mission_alarm_btn, .alert_next').forEach((b) => b.classList.add('o112-highlight'));
  }

  async function missionPage() {
    const panel = document.createElement('div');
    panel.id = 'o112-panel';
    panel.innerHTML = '<h4>Assistant 112</h4><div id="o112-body">Chargement…</div>';
    document.body.appendChild(panel);
    const body = panel.querySelector('#o112-body');

    let mission = null;
    const missionType = missionTypeId();
    if (missionType) {
      try { mission = (await getMissionTypes())[missionType] || null; } catch (e) { /* hors ligne */ }
    }

    const li = (r) => `<li class="${r.got >= r.count ? 'ok' : 'ko'}">${r.caption} : ${r.got}/${r.count}</li>`;

    // Si le jeu affiche déjà « manquant », on s'y fie ; sinon on part des besoins de la mission.
    const run = () => {
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
        // Des véhicules sont déjà engagés et le jeu ne signale rien de manquant.
        source = engaged ? 'Véhicules déjà engagés' : 'Mission';
      }
      if (!engaged) handleTransfer(report);
      handlePatients(report, unknown);
      return { source, report, unknown };
    };

    const render = (res) => {
      let html = mission ? `<b>${mission.name}</b><br>` : '';
      const cells = highlightCells();
      if (cells) html += `<span class="ok">Prisonniers : clique sur la cellule surlignée (${cells}).</span><br>`;
      const reqs = transportRequests();
      if (reqs.length) {
        html += '<span class="ko">Transport à attribuer :</span><ul>' +
          reqs.map((r) => `<li><a href="${r.href}" style="color:#ffb347">${r.text}</a></li>`).join('') + '</ul>';
      }
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
      body.querySelector('#o112-pre').onclick = () => { uncheckAll(); render(run()); };
      body.querySelector('#o112-clear').onclick = () => { uncheckAll(); render(null); };
    };

    // Un transport en attente passe avant tout : on s'en occupe puis on revient ici.
    if (autoOpenTransport()) {
      body.innerHTML = '<span class="ok">Transport en attente → ouverture du véhicule…</span>';
      return;
    }
    // Pré-cochage à l'ouverture ; l'envoi reste toujours manuel.
    render(run());
    highlightAlarm();
  }

  // ---------- Carte principale : ouvrir la prochaine mission sans véhicule ----------
  function mainPage() {
    const btn = document.createElement('button');
    btn.id = 'o112-next';
    btn.textContent = '➜ Mission suivante (N)';
    btn.title = 'Ouvre la prochaine mission sans véhicule engagé';
    document.body.appendChild(btn);

    const openNext = () => {
      const entries = [...document.querySelectorAll('#mission_list .missionSideBarEntry, #mission_list > div[id^="mission_"]')]
        .filter((e) => e.offsetParent !== null);
      const red = entries.find((e) => e.querySelector('.mission_panel_red')) || null;
      if (!red) { btn.textContent = 'Aucune mission en attente'; setTimeout(() => (btn.textContent = '➜ Mission suivante (N)'), 2000); return; }
      const link = red.querySelector('a[id^="alarm_button_"], a.btn[href*="/missions/"]');
      if (link) link.click(); // ouvre la fenêtre de la mission (n'envoie rien)
    };
    btn.onclick = openNext;
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'n' && !/input|textarea|select/i.test(e.target.tagName)) openNext();
    });
  }

  // ---------- Transports automatiques ----------
  const RETURN_KEY = 'o112_return_mission';
  const later = (fn) => setTimeout(fn, AUTO_DELAY);

  // Sur la mission : ouvre la première « Demande de transport envoyée ».
  function autoOpenTransport() {
    if (!AUTO_TRANSPORT) return false;
    const link = [...document.querySelectorAll('a[href^="/vehicles/"]')].find((a) => /demande de transport/i.test(a.textContent));
    if (!link) return false;
    try { sessionStorage.setItem(RETURN_KEY, location.pathname); } catch (e) { /* stockage bloqué */ }
    link.classList.add('o112-highlight');
    later(() => link.click());
    return true;
  }

  // Page du véhicule : clique le 1er hôpital (ou la 1re cellule) de la liste,
  // puis passe au véhicule suivant ou revient à la mission.
  function vehiclePage() {
    const usable = (a) => !a.classList.contains('disabled') && a.offsetParent !== null;
    const target =
      [...document.querySelectorAll('a[href*="/patient/"]')].find(usable) ||
      [...document.querySelectorAll('a[href*="/gefangener/"]')].find(usable);
    const next = [...document.querySelectorAll('a, button')].find((b) => /prochain v[ée]hicule/i.test(b.textContent));

    if (target) {
      target.classList.add('o112-highlight');
      target.scrollIntoView({ block: 'center' });
      if (!AUTO_TRANSPORT) return;
      // Garde-fou : jamais deux fois de suite sur le même véhicule.
      const key = 'o112_done_' + location.pathname;
      try {
        if (Date.now() - parseInt(sessionStorage.getItem(key) || '0', 10) < 15000) return;
        sessionStorage.setItem(key, String(Date.now()));
      } catch (e) { /* stockage bloqué */ }
      later(() => target.click());
    } else if (next) {
      if (AUTO_TRANSPORT) later(() => next.click());
      else next.classList.add('o112-highlight');
    } else if (AUTO_TRANSPORT && /va [êe]tre transport|transport[ée]/i.test(document.body.innerText)) {
      let back = null;
      try { back = sessionStorage.getItem(RETURN_KEY); sessionStorage.removeItem(RETURN_KEY); } catch (e) { /* idem */ }
      if (back) later(() => { location.href = back; });
    }
  }

  if (/^\/missions\/\d+/.test(location.pathname)) missionPage();
  else if (/^\/vehicles\/\d+/.test(location.pathname)) vehiclePage();
  else if (location.pathname === '/' && document.querySelector('#mission_list')) mainPage();
})();

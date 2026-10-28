/* Écrans : titre, championnat, garage (voitures, améliorations, réglages), briefing, assistance, résultats, pause, réglages, aide.
   Gabarits HTML + délégation d'événements (data-act, data-set, data-setup). Le jeu (main.js) fournit les actions. */
import { CARS, UPGRADES, RALLIES, ENVS, DIFFS, TIME_OF_DAY } from '../core/data.js';
import { SURFACES, TIRES, WEATHERS } from '../surfaces/surfaces.js';
import { save, persist, resetSave } from '../core/save.js';
import { fmtTime, fmtMoney } from '../core/util.js';
import { getRally, standings, upLevel, upPrice, buyCar, buyUpgrade, getSetup, setSetup, SERVICE_MIN } from '../rally/championship.js';
import { PARTS, TIRE_MIN, TIRE_NAMES, planCost, newPlan, repairStep, undoStep, toggleTire, applyPlan } from '../rally/service.js';

const $ = (id) => document.getElementById(id);
const TOD_NAME = { jour: 'Jour', crepuscule: 'Crépuscule', nuit: 'Nuit' };
const car = (id) => CARS.find((c) => c.id === id);
const hue = (v) => `hsl(${Math.round(120 * (1 - Math.min(1, Math.max(0, v))))} 75% 48%)`;
const pct = (v) => `<span class="pct"><i style="width:${100 - Math.min(100, v)}%;background:${hue(v / 100)}"></i></span>`;

export class Menus {
  constructor(G) {
    this.G = G; this.root = $('screen'); this.s = { rally: 'forets', car: save.owned[0], ai: save.settings.ai, tab: 'cars', back: null, free: { env: 'foret', seed: '', length: 4000, weather: 'soleil', tod: 'jour', car: save.owned[0] } };
    this.root.addEventListener('click', (e) => { const b = e.target.closest('[data-act]'); if (b && !b.disabled) { G.audio.click(); this.act(b.dataset.act, b.dataset, b); } });
    const onSet = (e) => { const el = e.target.closest('[data-set],[data-setup],[data-free]'); if (el) this.change(el, e.type); };
    this.root.addEventListener('input', onSet); this.root.addEventListener('change', onSet);
  }
  show(html, cls = '') { this.root.hidden = false; this.root.className = 'overlay ' + cls; this.root.innerHTML = html; this.root.scrollTop = 0; }
  hide() { this.root.hidden = true; this.root.innerHTML = ''; }

  /* ---------- actions ---------- */
  act(a, d) {
    const G = this.G, s = this.s;
    switch (a) {
      case 'title': this.title(); break;
      case 'champ': this.champSelect(); break;
      case 'continue': G.menuContinue(); break;
      case 'free': this.freeSetup(); break;
      case 'garage': s.back = d.back || 'title'; this.garage(); break;
      case 'settings': s.back = d.back || 'title'; this.settings(); break;
      case 'help': s.back = d.back || 'title'; this.help(); break;
      case 'back': this[s.back || 'title'](); break;
      case 'rally': if (!d.locked) { s.rally = d.id; this.champSelect(); } break;
      case 'pickcar': s.car = d.id; this.champSelect(); break;
      case 'ai': s.ai = +d.id; save.settings.ai = s.ai; persist(); this.champSelect(); break;
      case 'startchamp': G.menuStartChampionship(s.rally, s.car, s.ai); break;
      case 'newchamp': if (save.championship && !this.confirmNew) { this.confirmNew = true; this.title(); } else { this.confirmNew = false; this.champSelect(); } break;
      case 'abandonchamp': save.championship = null; persist(); this.confirmNew = false; this.title(); break;
      case 'begin': G.menuBegin(); break;
      case 'freestart': G.menuStartFree({ ...s.free, car: s.free.car }); break;
      case 'tab': s.tab = d.id; this.garage(); break;
      case 'gcar': s.car = d.id; s.free.car = d.id; G.setCarPreview(d.id); this.garage(); break;
      case 'buycar': if (buyCar(d.id)) { s.car = d.id; s.free.car = d.id; G.setCarPreview(d.id); } this.garage(); break;
      case 'buyup': buyUpgrade(s.car, d.id, UPGRADES); this.garage(); break;
      case 'resetsetup': save.setups[s.car] = {}; persist(); this.garage(); break;
      case 'repair': repairStep(this.sv.dmg, this.sv.plan, d.key, this.budget() - (this.sv.tire !== this.sv.tire0 ? 4 : 0)); this.service(this.sv.info, true); break;
      case 'unrepair': undoStep(this.sv.dmg, this.sv.plan, d.key); this.service(this.sv.info, true); break;
      case 'tire': toggleTire(this.sv.dmg, this.sv.plan, +d.i, this.budget()); this.service(this.sv.info, true); break;
      case 'repairall': this.autoRepair(); this.service(this.sv.info, true); break;
      case 'servicedone': G.menuServiceDone(this.sv.plan, this.sv.tire); break;
      case 'next': G.menuNext(); break;
      case 'retry': G.menuRetry(); break;
      case 'resume': G.menuResume(); break;
      case 'restart': G.menuRestart(); break;
      case 'abort': G.menuAbort(); break;
      case 'quit': G.menuQuit(); break;
      case 'reset': if (this.confirmReset) { resetSave(); this.confirmReset = false; G.audio.setVolume(save.settings.volume); this.title(); } else { this.confirmReset = true; this.settings(); } break;
      case 'setup-open': s.back = 'service'; this.setupOnly(); break;
      case 'setup-close': this.service(this.sv.info, true); break;
    }
  }
  change(el, type) {
    const s = this.s, G = this.G, v = el.type === 'checkbox' ? el.checked : el.value;
    if (el.dataset.set) {
      const k = el.dataset.set; save.settings[k] = el.type === 'range' || el.dataset.num ? +v : el.type === 'checkbox' ? v : v; persist();
      const out = el.type === 'range' && el.parentElement.querySelector('output'); if (out) out.textContent = this.fmtSetting(k, +v);
      G.applySettings(k); if (type === 'change' && (k === 'quality' || k === 'units')) { /* appliqué au prochain affichage */ }
    } else if (el.dataset.setup) {
      const k = el.dataset.setup, val = el.tagName === 'SELECT' ? v : +v; setSetup(s.car, k, val);
      const out = el.parentElement.querySelector('output'); if (out) out.textContent = this.fmtSetup(k, val);
    } else if (el.dataset.free) {
      const k = el.dataset.free; s.free[k] = el.type === 'range' ? +v : v; const out = el.parentElement.querySelector('output'); if (out) out.textContent = k === 'length' ? (s.free.length / 1000).toFixed(1) + ' km' : '';
      if (el.tagName === 'SELECT' && (k === 'env' || k === 'car')) this.freeSetup();
    }
  }
  fmtSetting(k, v) { return k === 'volume' || k === 'voiceVolume' ? Math.round(v * 100) + ' %' : k === 'voiceRate' ? v.toFixed(2) + '×' : k === 'anticipation' ? v + ' s' : k === 'detail' ? ['', 'Dangers', 'Normal', 'Tout'][v] : k === 'ai' ? DIFFS[v].nom : k === 'quality' ? ['Faible', 'Normal', 'Élevé'][v] : String(v); }
  fmtSetup(k, v) { return k === 'frein' ? `${Math.round(v * 100)} / ${Math.round((1 - v) * 100)}` : k.startsWith('diff') || k === 'centre' ? Math.round(v * 100) + ' %' : typeof v === 'number' ? v.toFixed(2) : String(v); }

  /* ---------- briques ---------- */
  field(label, input, out = '') { return `<label class="field"><span>${label}</span>${input}<output>${out}</output></label>`; }
  slider(key, label, min, max, step, val, fmt, attr = 'data-set') { return this.field(label, `<input type="range" ${attr}="${key}" min="${min}" max="${max}" step="${step}" value="${val}">`, fmt); }
  wealth() { return `<span class="tag ok">${fmtMoney(save.cash)}</span>`; }
  carStats(c) { return `<span class="tag">${c.power} kW</span><span class="tag">${c.mass} kg</span><span class="tag">${c.drive}</span>${c.turbo ? '<span class="tag warn">Turbo</span>' : ''}`; }

  /* ---------- titre ---------- */
  title() {
    const ch = save.championship, r = ch && getRally(ch.rallyId), st = save.stats;
    this.show(`<div class="card mid">
      <p class="eyebrow">Simulation de rallye</p>
      <div class="logo">Rally <span>Masters</span></div>
      <p class="lede">Spéciales générées par graine, copilote, dégâts réels, assistance entre les spéciales et championnat contre l'IA. Tout est généré par le code : modèles, textures, sons et voix.</p>
      <div class="stats"><span>Argent <b>${fmtMoney(save.cash)}</b></span><span>Spéciales <b>${st.stages}</b></span><span>Victoires <b>${st.wins}</b></span></div>
      <div class="menu">
        ${ch ? `<button class="btn primary" data-act="continue">▶ Continuer : ${r.nom} — spéciale ${ch.stage + 1}/${r.stages.length}</button>` : ''}
        <button class="btn ${ch ? '' : 'primary'}" data-act="newchamp">${ch ? (this.confirmNew ? '⚠ Cliquer ici écrase le championnat en cours' : 'Nouveau championnat') : '🏆 Championnat'}</button>
        ${this.confirmNew ? '<button class="btn danger" data-act="abandonchamp">Abandonner le championnat en cours</button><button class="btn ghost" data-act="title">Annuler</button>' : ''}
        <button class="btn" data-act="free">🎯 Spéciale libre (graine au choix)</button>
        <button class="btn" data-act="garage">🔧 Garage, boutique et réglages voiture</button>
        <div class="row"><button class="btn" data-act="settings">⚙ Réglages</button><button class="btn" data-act="help">❓ Aide et touches</button></div>
      </div></div>`, 'side');
  }

  /* ---------- championnat ---------- */
  champSelect() {
    const s = this.s, r = getRally(s.rally);
    const owned = CARS.filter((c) => save.owned.includes(c.id));
    if (!save.owned.includes(s.car)) s.car = owned[0].id;
    this.show(`<div class="card">
      <div class="row between"><div><p class="eyebrow">Championnat</p><h2>Choisis ton rallye</h2></div><div>${this.wealth()}</div></div>
      <div class="grid">${RALLIES.map((x) => {
        const lock = !save.unlocked.includes(x.id), fin = save.finished[x.id];
        return `<button class="opt ${s.rally === x.id ? 'sel' : ''} ${lock ? 'lock' : ''}" data-act="rally" data-id="${x.id}" ${lock ? 'data-locked="1"' : ''}>
          <b>${lock ? '🔒 ' : ''}${x.nom}</b><small>${x.stages.length} spéciales · ${(x.stages.reduce((a, b) => a + b, 0) / 1000).toFixed(1)} km</small>
          <small>${lock ? 'Terminer : ' + getRally(x.req).nom : x.desc}</small>${fin ? `<small class="ok">Meilleure place : ${fin}</small>` : ''}</button>`;
      }).join('')}</div>
      <h3>Voiture</h3>
      <div class="grid">${owned.map((c) => `<button class="opt ${s.car === c.id ? 'sel' : ''}" data-act="pickcar" data-id="${c.id}"><b>${c.nom}</b><small>${c.classe}</small><small>${c.power} kW · ${c.mass} kg · ${c.drive}</small></button>`).join('')}</div>
      <h3>Niveau des pilotes IA</h3>
      <div class="tabs">${DIFFS.map((d) => `<button class="tab ${s.ai === d.id ? 'sel' : ''}" data-act="ai" data-id="${d.id}">${d.nom}</button>`).join('')}</div>
      <p class="muted">Prime : ${fmtMoney(r.prize[0])} au vainqueur. Les dégâts se cumulent d'une spéciale à l'autre : ${SERVICE_MIN} minutes d'assistance seulement pour réparer.</p>
      <div class="row"><button class="btn primary" data-act="startchamp" ${save.unlocked.includes(s.rally) ? '' : 'disabled'}>Commencer le rallye</button><button class="btn ghost" data-act="title">Retour</button></div></div>`);
    this.G.setCarPreview(s.car);
  }

  /* ---------- briefing d'une spéciale ---------- */
  briefing(info) {
    const { stage, def, champ, mode } = info, c = car(info.carId), cnt = new Array(6).fill(0);
    for (let i = 0; i < stage.N; i++) cnt[stage.surf[i]]++;
    const bar = cnt.map((n, k) => (n ? `<i style="width:${n / stage.N * 100}%;background:rgb(${SURFACES[k].color.map((v) => Math.round(v * 255)).join(',')})" title="${SURFACES[k].nom}"></i>` : '')).join('');
    const legend = cnt.map((n, k) => (n ? `<span class="tag">${SURFACES[k].nom} ${Math.round(n / stage.N * 100)} %</span>` : '')).join('');
    const sev = [0, 0, 0, 0, 0, 0, 0]; stage.notes.forEach((n) => n.type === 'corner' && sev[n.sev]++);
    const feats = stage.features.map((f) => f.type);
    const tire = getSetup(info.carId).pneus === 'auto' ? ENVS[stage.env].tire : getSetup(info.carId).pneus;
    const label = champ ? `Spéciale ${def.index + 1}/${getRally(champ.rallyId).stages.length} — ${getRally(champ.rallyId).nom}` : 'Spéciale libre';
    this.show(`<div class="card mid">
      <p class="eyebrow">${label}</p>
      <h2>${stage.name}</h2>
      <div class="stats"><span>Longueur <b>${(stage.length / 1000).toFixed(2)} km</b></span><span>Terrain <b>${ENVS[stage.env].nom}</b></span><span>Météo <b>${WEATHERS[stage.weather].icon} ${WEATHERS[stage.weather].nom}</b></span><span>Heure <b>${TOD_NAME[stage.tod]}</b></span></div>
      <div><h3>Surfaces</h3><div class="bar" style="margin:6px 0">${bar}</div>${legend}</div>
      <div class="stats"><span>Virages <b>${stage.corners.length}</b></span><span>Épingles <b>${sev[1]}</b></span><span>Sauts <b>${feats.filter((f) => f === 'jump').length}</b></span><span>Ponts <b>${feats.filter((f) => f === 'bridge').length}</b></span><span>Gués <b>${feats.filter((f) => f === 'ford').length}</b></span></div>
      <p class="muted">Pneus actuels : <b>${TIRES.find((t) => t.id === tire).nom}</b>. Voiture : <b>${c.nom}</b> (${c.classe}). Un crash peut coûter la course : pas de remise en piste gratuite (<kbd>T</kbd> = +45 s, <kbd>R</kbd> redémarrage = +60 s en championnat).</p>
      ${champ ? `<h3>Classement général</h3>${this.standTable(champ, true)}` : `<p class="muted">Graine : <b>${def.seedLabel || def.seed}</b> — le même mot donne toujours la même spéciale.</p>`}
      <div class="row"><button class="btn primary" data-act="begin">▶ Départ</button><button class="btn" data-act="garage" data-back="briefingBack">Réglages voiture</button><button class="btn ghost" data-act="quit">Quitter</button></div></div>`);
    this.info = info; this.briefingBack = () => this.briefing(info);
  }

  standTable(champ, brief) {
    if (!champ.times.length) return '<p class="muted">Premier départ : aucun temps encore.</p>';
    const st = standings(champ), lead = st[0].total, top = st.slice(0, 8), me = st.find((x) => x.human);
    if (!top.includes(me)) top.push(me);
    return `<table class="t"><tr><th>#</th><th>Pilote</th><th class="n">Total</th><th class="n">Écart</th></tr>${top.map((r) => `<tr class="${r.human ? 'me' : ''}"><td>${r.rank}</td><td>${r.name}</td><td class="n">${fmtTime(r.total)}</td><td class="n">${r.rank === 1 ? '' : fmtTime(r.total - lead, true)}</td></tr>`).join('')}</table>`;
  }

  /* ---------- garage ---------- */
  garage() {
    const s = this.s, c = car(s.car), tabs = [['cars', 'Voitures'], ['up', 'Améliorations'], ['setup', 'Réglages']];
    let body = '';
    if (s.tab === 'cars') {
      body = `<div class="grid">${CARS.map((x) => {
        const own = save.owned.includes(x.id);
        return `<div class="opt ${s.car === x.id ? 'sel' : ''}" data-act="${own ? 'gcar' : ''}" data-id="${x.id}"><b>${x.nom}</b><small>${x.classe}</small><span>${this.carStats(x)}</span><small>${x.desc}</small>
          ${own ? `<small class="ok">${s.car === x.id ? '✔ Sélectionnée' : 'Possédée — cliquer pour choisir'}</small>` : `<button class="btn sm ${save.cash >= x.prix ? 'primary' : ''}" data-act="buycar" data-id="${x.id}" ${save.cash >= x.prix ? '' : 'disabled'}>Acheter ${fmtMoney(x.prix)}</button>`}</div>`;
      }).join('')}</div>`;
    } else if (s.tab === 'up') {
      body = `<p class="muted">Améliorations de <b>${c.nom}</b> (3 niveaux chacune).</p><div class="col">${UPGRADES.map((u) => {
        const l = upLevel(c.id, u.id), price = l < 3 ? upPrice(c, u, l) : 0;
        return `<div class="rep"><div><b>${u.nom}</b> <span class="tag">niveau ${l}/3</span><br><small class="muted">${u.desc}</small></div><div class="bar" style="height:6px"><i style="width:${l / 3 * 100}%;background:var(--ui-accent)"></i></div>
          ${l >= 3 ? '<span class="tag ok">Max</span>' : `<button class="btn sm ${save.cash >= price ? 'primary' : ''}" data-act="buyup" data-id="${u.id}" ${save.cash >= price ? '' : 'disabled'}>${fmtMoney(price)}</button>`}</div>`;
      }).join('')}</div>`;
    } else {
      const set = getSetup(c.id), me = ENVS;
      body = `<p class="muted">Réglages de <b>${c.nom}</b>, enregistrés par voiture.</p><div class="col">
        ${this.slider('suspF', 'Suspension avant (raideur)', 0.6, 1.4, 0.05, set.suspF, this.fmtSetup('suspF', set.suspF), 'data-setup')}
        ${this.slider('suspR', 'Suspension arrière (raideur)', 0.6, 1.4, 0.05, set.suspR, this.fmtSetup('suspR', set.suspR), 'data-setup')}
        ${this.slider('frein', 'Répartition freinage AV / AR', 0.45, 0.75, 0.01, set.frein, this.fmtSetup('frein', set.frein), 'data-setup')}
        ${this.slider('diffAv', 'Différentiel avant (blocage)', 0, 1, 0.05, set.diffAv, this.fmtSetup('diffAv', set.diffAv), 'data-setup')}
        ${this.slider('diffAr', 'Différentiel arrière (blocage)', 0, 1, 0.05, set.diffAr, this.fmtSetup('diffAr', set.diffAr), 'data-setup')}
        ${c.drive === 'AWD' ? this.slider('centre', 'Couple avant (central)', 0.2, 0.7, 0.01, set.centre, this.fmtSetup('centre', set.centre), 'data-setup') : ''}
        ${this.field('Pneus', `<select data-setup="pneus"><option value="auto" ${set.pneus === 'auto' ? 'selected' : ''}>Automatique (selon le terrain)</option>${TIRES.map((t) => `<option value="${t.id}" ${set.pneus === t.id ? 'selected' : ''}>${t.nom}</option>`).join('')}</select>`)}
        <p class="muted">Souple à l'avant et raide à l'arrière : plus de sous-virage. L'inverse rend la voiture plus vive. Un différentiel plus bloqué stabilise mais pousse à l'avant sous puissance. Plus de frein à l'avant donne de la stabilité.</p>
        <div class="row"><button class="btn sm" data-act="resetsetup">Réglages d'usine</button></div></div>`;
    }
    this.show(`<div class="card"><div class="row between"><div><p class="eyebrow">Garage</p><h2>${c.nom} <small class="muted">${c.classe}</small></h2></div>${this.wealth()}</div>
      <div class="tabs">${tabs.map(([k, n]) => `<button class="tab ${s.tab === k ? 'sel' : ''}" data-act="tab" data-id="${k}">${n}</button>`).join('')}</div>${body}
      <div class="row"><button class="btn primary" data-act="back">Retour</button></div></div>`);
    this.G.setCarPreview(s.car);
  }
  setupOnly() { this.s.tab = 'setup'; this.garage(); }

  /* ---------- assistance ---------- */
  budget() { return this.sv.info.champ.service; }
  autoRepair() { /* réparer par ordre de rapport temps/efficacité jusqu'à épuisement du budget */
    const sv = this.sv, order = ['engine', 'steer', 'bumpF', 'bumpR', 'body'];
    for (const p of PARTS) sv.plan[p.key] = sv.dmg[p.key]; for (let i = 0; i < 4; i++) sv.plan.tires[i] = sv.dmg.tires[i];
    const bud = this.budget() - (sv.tire !== sv.tire0 ? 4 : 0);
    for (let i = 0; i < 4; i++) if (sv.dmg.tires[i] > 0 && planCost(sv.dmg, { ...sv.plan, tires: sv.plan.tires.map((t, j) => (j === i ? 0 : t)) }) <= bud) sv.plan.tires[i] = 0;
    for (const k of order) { for (let n = 0; n < 11; n++) if (!repairStep(sv.dmg, sv.plan, k, bud)) break; }
  }
  service(info, keep) {
    const champ = info.champ, nxt = info.next;
    if (!keep || !this.sv) this.sv = { info, dmg: JSON.parse(JSON.stringify(champ.dmg)), plan: newPlan(champ.dmg), tire0: getSetup(champ.carId).pneus, tire: getSetup(champ.carId).pneus };
    const sv = this.sv, tireSwap = sv.tire !== sv.tire0 ? 4 : 0, cost = planCost(sv.dmg, sv.plan) + tireSwap, left = champ.service - cost;
    const rows = PARTS.map((p) => {
      const base = sv.dmg[p.key], cur = sv.plan[p.key];
      return `<div class="rep"><div><b>${p.label}</b> <small class="muted">${p.hint}</small></div>${pct(cur)}
        <div class="row"><button class="btn sm" data-act="unrepair" data-key="${p.key}" ${cur >= base ? 'disabled' : ''}>−</button><span style="min-width:62px;text-align:center">${Math.round(cur)} % <small class="muted">${cur < base ? '(−' + Math.round((base - cur) * p.rate) + ' min)' : ''}</small></span><button class="btn sm" data-act="repair" data-key="${p.key}" ${cur <= 0 ? 'disabled' : ''}>Réparer</button></div></div>`;
    }).join('');
    const tires = [0, 1, 2, 3].map((i) => `<button class="btn sm ${sv.dmg.tires[i] === 0 ? 'ghost' : sv.plan.tires[i] === 0 ? 'primary' : 'danger'}" data-act="tire" data-i="${i}" ${sv.dmg.tires[i] === 0 ? 'disabled' : ''}>${TIRE_NAMES[i]} ${sv.dmg.tires[i] === 0 ? 'OK' : sv.plan.tires[i] === 0 ? `changé (${TIRE_MIN} min)` : `crevé : changer (${TIRE_MIN} min)`}</button>`).join(' ');
    const w = WEATHERS[nxt.weather], tireTip = TIRES.find((t) => t.id === ENVS[nxt.env].tire).nom;
    this.show(`<div class="card">
      <div class="row between"><div><p class="eyebrow">Zone d'assistance</p><h2>Avant la spéciale ${nxt.index + 1} : ${ENVS[nxt.env].nom}</h2></div><div class="minutes ${left < 5 ? 'warn' : ''}">${left.toFixed(0)} min</div></div>
      <p class="muted">Temps d'assistance restant. Prochaine spéciale : ${w.icon} ${w.nom}, ${TOD_NAME[nxt.tod]}, ${(nxt.length / 1000).toFixed(1)} km. Pneus conseillés : <b>${tireTip}</b>.</p>
      ${rows}
      <div class="row"><b>Pneus crevés :</b> ${tires}</div>
      ${this.field('Type de pneus', `<select data-svtire="1" id="svtire">${[['auto', 'Automatique'], ...TIRES.map((t) => [t.id, t.nom])].map(([k, n]) => `<option value="${k}" ${sv.tire === k ? 'selected' : ''}>${n}${k !== sv.tire0 && k === sv.tire ? ' (+4 min)' : ''}</option>`).join('')}</select>`)}
      <div class="row"><button class="btn primary" data-act="servicedone" ${left < -0.001 ? 'disabled' : ''}>Quitter l'assistance et partir</button><button class="btn" data-act="repairall">Priorités auto</button><button class="btn" data-act="garage" data-back="serviceBack">Réglages voiture</button></div>
      ${this.standTable(champ)}</div>`);
    const sel = $('svtire'); if (sel) sel.onchange = (e) => { sv.tire = e.target.value; this.service(info, true); };
    this.serviceBack = () => this.service(info, true);
  }

  /* ---------- résultats ---------- */
  stageResult(r) {
    const { run, rank, champ, k, last, record, dnf } = r;
    const rows = rank ? rank.slice(0, 8) : [], me = rank && rank.find((x) => x.human), tot = run.finishTime;
    if (me && !rows.includes(me)) rows.push(me);
    const pens = run.pen.map((p) => `<li>${p.why} : +${p.sec} s</li>`).join('');
    this.show(`<div class="card mid">
      <p class="eyebrow">${dnf ? 'Abandon' : 'Spéciale terminée'}</p>
      <div class="row between"><div class="big ${dnf ? 'bad' : ''}">${dnf ? 'Abandon' : fmtTime(tot)}</div>${me ? `<div class="big">P${me.rank}<small class="muted">/${rank.length}</small></div>` : ''}</div>
      ${!dnf ? `<div class="stats"><span>Temps pur <b>${fmtTime(run.t)}</b></span><span>Pénalités <b>${run.penTotal.toFixed(0)} s</b></span>${record ? '<span class="ok"><b>Nouveau meilleur temps !</b></span>' : run.best ? `<span>Record <b>${fmtTime(run.best.time)}</b></span>` : ''}</div>` : `<p class="muted">${r.why}. En championnat, ce résultat est compté avec un temps très pénalisant.</p>`}
      ${pens ? `<ul class="muted">${pens}</ul>` : ''}
      ${rank ? `<h3>Classement de la spéciale</h3><table class="t"><tr><th>#</th><th>Pilote</th><th class="n">Temps</th></tr>${rows.map((x) => `<tr class="${x.human ? 'me' : ''}"><td>${x.rank}</td><td>${x.name}</td><td class="n">${fmtTime(x.total)}</td></tr>`).join('')}</table>` : ''}
      ${champ ? `<h3>Classement général</h3>${this.standTable(champ)}` : ''}
      <div class="row"><button class="btn primary" data-act="next">${champ ? (last ? 'Voir le résultat final' : 'Zone d\'assistance') : 'Menu'}</button>${!champ ? '<button class="btn" data-act="retry">Rejouer la spéciale</button>' : ''}</div></div>`);
  }
  finalResult(f) {
    const r = getRally(f.rallyId);
    this.show(`<div class="card mid">
      <p class="eyebrow">${r.nom}</p><h2>${f.rank === 1 ? '🏆 Victoire au rallye !' : f.rank <= 3 ? '🥈 Sur le podium' : 'Rallye terminé'}</h2>
      <div class="stats"><span>Classement <b>P${f.rank}/${f.standings.length}</b></span><span>Prime <b>${fmtMoney(f.prize)}</b></span><span>Victoires de spéciale <b>${fmtMoney(f.bonus)}</b></span></div>
      ${f.unlocked.length ? `<p class="ok">Nouveau rallye débloqué : <b>${f.unlocked.join(', ')}</b></p>` : ''}
      <table class="t"><tr><th>#</th><th>Pilote</th><th class="n">Total</th></tr>${f.standings.slice(0, 10).map((x) => `<tr class="${x.human ? 'me' : ''}"><td>${x.rank}</td><td>${x.name}</td><td class="n">${fmtTime(x.total)}</td></tr>`).join('')}</table>
      <div class="row"><button class="btn primary" data-act="quit">Retour au menu</button><button class="btn" data-act="garage" data-back="title">Garage et boutique</button></div></div>`);
  }

  /* ---------- pause, réglages, aide, spéciale libre ---------- */
  pause(free) {
    this.show(`<div class="card small"><p class="eyebrow">Pause</p><h2>Rally Masters</h2><div class="menu">
      <button class="btn primary" data-act="resume">Reprendre</button>
      <button class="btn" data-act="restart">Redémarrer la spéciale ${free ? '' : '(+60 s)'}</button>
      <button class="btn" data-act="settings" data-back="pauseBack">Réglages</button>
      <button class="btn" data-act="help" data-back="pauseBack">Touches</button>
      <button class="btn danger" data-act="abort">${free ? 'Quitter la spéciale' : 'Abandonner la spéciale'}</button></div></div>`);
    this.pauseBack = () => this.pause(free);
  }
  settings() {
    const c = save.settings, f = (k, l, a, b, st) => this.slider(k, l, a, b, st, c[k], this.fmtSetting(k, c[k]));
    this.show(`<div class="card mid"><p class="eyebrow">Réglages</p><h2>Son, copilote, jeu</h2><div class="col">
      ${f('volume', 'Volume général', 0, 1, 0.05)}
      <h3>Copilote</h3>
      ${this.field('Voix du copilote', `<input type="checkbox" data-set="voice" ${c.voice ? 'checked' : ''}>`)}
      ${f('voiceVolume', 'Volume de la voix', 0, 1, 0.05)}
      ${f('voiceRate', 'Débit de la voix', 0.7, 1.6, 0.05)}
      ${f('anticipation', 'Anticipation des notes', 3, 12, 1)}
      ${f('detail', 'Fréquence des notes (1 dangers, 2 normal, 3 tout)', 1, 3, 1)}
      <h3>Jeu</h3>
      ${f('ai', 'Difficulté des pilotes IA', 0, 3, 1)}
      ${f('quality', 'Qualité graphique', 0, 2, 1)}
      ${this.field('Vue au départ', `<select data-set="view" data-num="1">${['Poursuite', 'Capot', 'Pare-chocs', 'Cabine'].map((n, i) => `<option value="${i}" ${+c.view === i ? 'selected' : ''}>${n}</option>`).join('')}</select>`)}
      ${this.field('Unité de vitesse', `<select data-set="units"><option value="kmh" ${c.units === 'kmh' ? 'selected' : ''}>km/h</option><option value="mph" ${c.units === 'mph' ? 'selected' : ''}>mph</option></select>`)}
      </div><div class="row"><button class="btn primary" data-act="back">Retour</button><button class="btn danger" data-act="reset">${this.confirmReset ? 'Confirmer : tout effacer' : 'Effacer la sauvegarde'}</button></div></div>`);
  }
  help() {
    this.show(`<div class="card mid"><p class="eyebrow">Aide</p><h2>Touches</h2><table class="keys">
      <tr><td><kbd>Z</kbd> <kbd>↑</kbd></td><td>Accélérer</td></tr><tr><td><kbd>S</kbd> <kbd>↓</kbd></td><td>Freiner / marche arrière à l'arrêt</td></tr>
      <tr><td><kbd>Q</kbd> <kbd>D</kbd> <kbd>←</kbd> <kbd>→</kbd></td><td>Tourner</td></tr><tr><td><kbd>Espace</kbd></td><td>Frein à main (relance les glissades)</td></tr>
      <tr><td><kbd>C</kbd></td><td>Changer de vue : poursuite, capot, pare-chocs, cabine</td></tr><tr><td><kbd>M</kbd></td><td>Carte de la spéciale</td></tr>
      <tr><td><kbd>L</kbd></td><td>Phares</td></tr><tr><td><kbd>V</kbd></td><td>Copilote : voix on / off</td></tr>
      <tr><td><kbd>R</kbd></td><td>Redémarrer la spéciale (+60 s en championnat)</td></tr><tr><td><kbd>T</kbd></td><td>Remise sur la route (+45 s, les dégâts restent)</td></tr>
      <tr><td><kbd>Échap</kbd> <kbd>Tab</kbd></td><td>Pause</td></tr></table>
      <p class="muted">Manette ou volant (API Gamepad) : stick ou volant = direction, RT / LT ou pédales = gaz / frein, A = frein à main, Y = vue, X = redémarrer, B = remise en piste, LB = phares, RB = voix, Start = pause, Back = carte. Le volant est détecté d'après son nom ; si les pédales ne répondent pas, utilise la manette.</p>
      <p class="muted">Notes du copilote : « gauche 3 serré, 50, droite 5 » = virage à gauche de gravité 3 (1 = épingle, 6 = presque plein gaz) qui se referme, puis 50 m, puis un virage à droite de gravité 5. Les pénalités sont données pour les coupures de virages et les remises en piste.</p>
      <div class="row"><button class="btn primary" data-act="back">Retour</button></div></div>`);
  }
  freeSetup() {
    const f = this.s.free, owned = CARS.filter((c) => save.owned.includes(c.id));
    this.show(`<div class="card mid"><p class="eyebrow">Spéciale libre</p><h2>Génère une spéciale</h2><div class="col">
      ${this.field('Terrain', `<select data-free="env">${Object.entries(ENVS).map(([k, e]) => `<option value="${k}" ${f.env === k ? 'selected' : ''}>${e.nom}</option>`).join('')}</select>`)}
      ${this.field('Graine (un mot)', `<input class="txt" type="text" data-free="seed" value="${f.seed}" placeholder="vide = au hasard" maxlength="20">`)}
      ${this.slider('length', 'Longueur', 2500, 8000, 250, f.length, (f.length / 1000).toFixed(1) + ' km', 'data-free')}
      ${this.field('Météo', `<select data-free="weather">${Object.entries(WEATHERS).map(([k, w]) => `<option value="${k}" ${f.weather === k ? 'selected' : ''}>${w.nom}</option>`).join('')}</select>`)}
      ${this.field('Heure', `<select data-free="tod">${TIME_OF_DAY.map((t) => `<option value="${t}" ${f.tod === t ? 'selected' : ''}>${TOD_NAME[t]}</option>`).join('')}</select>`)}
      ${this.field('Voiture', `<select data-free="car">${owned.map((c) => `<option value="${c.id}" ${f.car === c.id ? 'selected' : ''}>${c.nom} — ${c.classe}</option>`).join('')}</select>`)}
      </div><div class="row"><button class="btn primary" data-act="freestart">Générer et partir</button><button class="btn ghost" data-act="title">Retour</button></div></div>`);
    this.G.setCarPreview(f.car);
  }
}

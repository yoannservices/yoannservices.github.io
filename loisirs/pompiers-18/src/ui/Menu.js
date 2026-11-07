// Menu (départ et pause) comme les autres jeux du site : liste de grands boutons, un écran par rubrique avec « Retour ».
import { UPGRADES, GRADES } from '../economy/Economy.js';
import { OPTIONS, LEVELS, Q, get, setOption, setLevel, setShared, levelName, levelKey } from '../settings.js';

export class Menu {
  constructor(game) {
    this.g = game; this.el = document.getElementById('menu'); this.open = false; this.tab = 'main'; this.needReload = false;
    this.el.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const a = b.dataset;
      if (a.tab) { this.tab = a.tab; this.render(); this.el.querySelector('.panel')?.scrollTo(0, 0); }
      if (a.act === 'resume') this.toggle(false);
      if (a.act === 'reload') location.reload();
      if (a.buy) { const err = this.g.economy.buy(a.buy); this.g.toast(err ?? `${UPGRADES[a.buy].name} : acheté`, err ? 'warn' : 'ok'); this.g.applyUpgrades(); this.render(); }
      if (a.level) { const before = this.reloadKeys(); setLevel(a.level); this.afterGfx(before); }
      if (a.opt) { const before = this.reloadKeys(); setOption(a.opt, JSON.parse(a.v)); this.afterGfx(before); }
      if (a.shared) { setShared(a.shared, JSON.parse(a.v)); this.render(); }
      if (a.act === 'reset') { if (b.dataset.sure) { this.g.economy.reset(); this.g.applyUpgrades(); this.render(); this.g.toast('Nouvelle carrière', 'ok'); } else { b.dataset.sure = '1'; b.textContent = 'Confirmer : tout effacer'; } }
    });
    for (const ev of ['keydown', 'keyup']) this.el.addEventListener(ev, (e) => { if (e.key !== 'Escape' && e.key !== 'Tab') e.stopPropagation(); });
  }
  reloadKeys() { return Object.keys(OPTIONS).filter((k) => OPTIONS[k].reload).map((k) => get(k)).join(); }
  afterGfx(before) { this.g.applyGfx(); if (this.reloadKeys() !== before) this.needReload = true; this.render(); }

  toggle(v = !this.open) {
    this.open = v; this.el.style.display = v ? 'flex' : 'none';
    if (v) { this.tab = 'main'; this.render(); document.exitPointerLock?.(); }
  }
  render() {
    const e = this.g.economy, t = this.tab;
    const seg = (items) => `<span class="seg">${items.join('')}</span>`;
    const btn = (attrs, label, on) => `<button ${attrs} class="${on ? 'sel' : ''}">${label}</button>`;
    let body = '';
    const back = '<button data-tab="main">Retour</button>';
    if (t === 'main') body = `<div class="menu-list">
      <button class="go" data-act="resume">${this.g.started ? 'Reprendre' : 'Prendre la garde'}</button>
      <button data-tab="gfx">Graphismes</button><button data-tab="shop">Matériel</button><button data-tab="career">Carrière</button><button data-tab="help">Conseils</button></div>`;
    if (t === 'help') body = `<p>Alerte incendie : FPT, lance et ARI ; il peut y avoir des victimes à sortir de la fumée. Secours à personne : VSAV, bilan (F maintenu), brancard et transport aux urgences. Feu d'immeuble : victimes aux balcons, va les chercher avec la nacelle de l'EPA (F à l'arrière de l'EPA pour les commandes).</p>
      <p class="hint">Suis le tracé orange au sol et la flèche GPS en haut à gauche : elle indique le prochain virage. C change de vue, jusqu'à la cabine.</p>
      <p class="hint">Binôme : 1 établir une 2e lance · 2 reconnaissance et sauvetage · 3 ventiler · 4 regroupement. Ferme les portes pour freiner le feu, reste accroupi (X) sous la fumée, branche le FPT sur un poteau incendie si la citerne baisse.</p>`;
    if (t === 'gfx') {
      const lv = levelName();
      body = `<div class="card"><div class="grow"><b>Qualité</b><small>${lv === 'auto' ? `Auto : s'adapte aux FPS (actuellement ${LEVELS[levelKey()].name})` : 'Règle tout d\'un coup ; tu peux ajuster chaque option ensuite.'}</small></div>
        ${seg([['auto', 'Auto'], ['haut', 'Haut'], ['moyen', 'Moyen'], ['bas', 'Bas']].map(([k, n]) => btn(`data-level="${k}"`, n, lv === k)))}</div>
        <div class="card"><div class="grow"><b>Ombres</b></div>${seg([[true, 'Oui'], [false, 'Non']].map(([v, n]) => btn(`data-shared="shadows" data-v="${v}"`, n, Q.shadows === v)))}</div>
        <div class="card"><div class="grow"><b>Limite d'images</b></div>${seg([[false, '60 FPS'], [true, '30 FPS']].map(([v, n]) => btn(`data-shared="fps30" data-v="${v}"`, n, Q.fps30 === v)))}</div>`
        + Object.entries(OPTIONS).map(([k, o]) => `<div class="card"><div class="grow"><b>${o.label}</b>${o.reload ? '<small>Appliqué au rechargement</small>' : ''}</div>${seg(o.values.map(([v, n]) => btn(`data-opt="${k}" data-v='${JSON.stringify(v)}'`, n, get(k) === v)))}</div>`).join('')
        + `<p class="hint">La qualité règle aussi la distance d'affichage, le brouillard et la taille des ombres (réglage commun aux jeux du site).</p>`
        + (this.needReload ? '<button class="go" data-act="reload">Recharger pour appliquer</button>' : '');
    if (t !== 'main') body = `<h2>${{ gfx: 'Graphismes', shop: 'Matériel', career: 'Carrière', help: 'Conseils' }[t]}</h2>` + body + `<div class="menu-list">${back}</div>`;
    }
    if (t === 'shop') body = `<p class="hint">Argent : <b>${Math.round(e.d.money)} €</b> · Grade : ${e.grade}</p>` + Object.entries(UPGRADES).map(([id, u]) => {
      const n = e.d.up[id], full = n >= u.max, lock = e.gradeIndex < u.grade;
      return `<div class="card"><div class="grow"><b>${u.name}</b>${u.max > 1 ? ` (${n}/${u.max})` : ''}<small>${u.desc}${lock ? ` · ${GRADES[u.grade].name} requis` : ''}</small></div>
        <button data-buy="${id}" ${full || lock ? 'disabled' : ''}>${full ? 'Acquis' : `${u.price} €`}</button></div>`;
    }).join('');
    if (t === 'career') body = `<div class="stats"><div><b>${e.grade}</b><small>Grade</small></div><div><b>${e.d.xp}</b><small>XP</small></div><div><b>${e.d.missions}</b><small>Interventions</small></div><div><b>${e.d.saved}</b><small>Victimes sauvées</small></div></div>
      <p class="hint">Grades : ${GRADES.map((g) => `${g.name} (${g.xp} XP)`).join(' · ')}</p><button class="danger" data-act="reset">Nouvelle carrière</button>`;
    this.el.innerHTML = `<div class="panel"><div class="head"><h1>Pompiers 18</h1></div><div class="body">${body}</div></div>`;
  }
}

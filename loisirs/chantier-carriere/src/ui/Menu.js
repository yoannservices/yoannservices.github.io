// Menu (départ et pause) comme les autres jeux du site : liste de grands boutons, un écran par rubrique avec « Retour ».
import { UPGRADES, GRADES } from '../economy/Economy.js';
import { SPECS } from '../machines/Machine.js';
import { OPTIONS, LEVELS, Q, get, setOption, setLevel, setShared, levelName, levelKey } from '../settings.js';

export class Menu {
  constructor(game) {
    this.g = game; this.el = document.getElementById('menu'); this.open = false; this.tab = 'main';
    this.el.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const a = b.dataset;
      if (a.tab) { this.tab = a.tab; this.render(); this.el.querySelector('.panel')?.scrollTo(0, 0); }
      if (a.act === 'resume') this.toggle(false);
      if (a.act === 'tuto') { this.g.tuto.start(); this.toggle(false); }
      if (a.pick) { this.g.switchTo(a.pick); this.toggle(false); }
      if (a.buy) { const err = this.g.economy.buy(a.buy); this.g.toast(err ?? `${UPGRADES[a.buy].name} : acheté`, err ? 'warn' : 'ok'); this.g.applyUpgrades(); this.render(); }
      if (a.level) { setLevel(a.level); this.g.applyGfx(); this.render(); }
      if (a.opt) { setOption(a.opt, JSON.parse(a.v)); this.g.applyGfx(); this.render(); }
      if (a.shared) { setShared(a.shared, JSON.parse(a.v)); this.render(); }
      if (a.weather) { this.g.env.auto = a.weather === 'auto'; if (a.weather !== 'auto') this.g.env.setWeather(a.weather); this.render(); }
      if (a.hour) { this.g.env.setHour(+a.hour); this.render(); }
      if (a.speed) { this.g.timeSpeed = +a.speed; this.render(); }
      if (a.act === 'reset') { if (b.dataset.sure) { this.g.newCareer(); this.render(); } else { b.dataset.sure = '1'; b.textContent = 'Confirmer : tout effacer'; } }
    });
    for (const ev of ['keydown', 'keyup']) this.el.addEventListener(ev, (e) => { if (e.key !== 'Escape' && e.key !== 'Tab') e.stopPropagation(); });
  }
  toggle(v = !this.open) { this.open = v; this.el.style.display = v ? 'flex' : 'none'; if (v) { this.tab = 'main'; this.render(); } }
  render() {
    const e = this.g.economy, t = this.tab, env = this.g.env;
    const seg = (items) => `<span class="seg">${items.join('')}</span>`;
    const btn = (attrs, label, on) => `<button ${attrs} class="${on ? 'sel' : ''}">${label}</button>`;
    const back = '<button data-tab="main">Retour</button>';
    let body = '';
    if (t === 'main') body = `<div class="menu-list"><button class="go" data-act="resume">${this.g.started ? 'Reprendre' : 'Prendre le poste'}</button>
      <button data-tab="fleet">Engins</button><button data-tab="gfx">Graphismes</button><button data-tab="game">Heure et météo</button><button data-tab="shop">Améliorations</button><button data-tab="career">Carrière</button><button data-tab="help">Conseils</button><button data-act="tuto">Tutoriel</button></div>`;
    if (t === 'help') body = `<p>La roche abattue (tir de mine, cabine orange) est creusée par la pelle ou la chargeuse, versée dans un tombereau puis dans la trémie du concasseur. Le gravier s'accumule en tas au bout du convoyeur : charge-le dans les camions clients pour livrer les commandes.</p>
      <p class="hint">Le bouteur rassemble les éboulis. La roche en place ne se creuse presque pas : déclenche un tir de mine (F à la cabine, 250 €, engins à plus de 35 m du front). Fais le plein à la station, répare à l'atelier, vends du gravier directement au pont-bascule avec le camion benne.</p>
      <p class="hint">1 à 5 : changer d'engin. C : vue (poursuite, éloignée, cabine). I : aide des commandes de l'engin actif.</p>`;
    if (t === 'fleet') body = Object.values(SPECS).map((s) => { const m = this.g.world.machines.find((x) => x.id === s.id); return `<div class="card"><div class="grow"><b>${s.key}. ${s.name}</b><small>Carburant ${Math.round(m.fuel)} L · état ${Math.round((1 - m.damage) * 100)} %${m === this.g.active ? ' · en service' : ''}</small></div><button data-pick="${s.id}">Prendre</button></div>`; }).join('');
    if (t === 'gfx') {
      const lv = levelName();
      body = `<div class="card"><div class="grow"><b>Qualité</b><small>${lv === 'auto' ? `Auto : s'adapte aux FPS (actuellement ${LEVELS[levelKey()].name})` : "Règle tout d'un coup ; tu peux ajuster chaque option ensuite."}</small></div>
        ${seg([['auto', 'Auto'], ['haut', 'Haut'], ['moyen', 'Moyen'], ['bas', 'Bas']].map(([k, n]) => btn(`data-level="${k}"`, n, lv === k)))}</div>
        <div class="card"><div class="grow"><b>Ombres</b></div>${seg([[true, 'Oui'], [false, 'Non']].map(([v, n]) => btn(`data-shared="shadows" data-v="${v}"`, n, Q.shadows === v)))}</div>
        <div class="card"><div class="grow"><b>Limite d'images</b></div>${seg([[false, '60 FPS'], [true, '30 FPS']].map(([v, n]) => btn(`data-shared="fps30" data-v="${v}"`, n, Q.fps30 === v)))}</div>`
        + Object.entries(OPTIONS).map(([k, o]) => `<div class="card"><div class="grow"><b>${o.label}</b></div>${seg(o.values.map(([v, n]) => btn(`data-opt="${k}" data-v='${JSON.stringify(v)}'`, n, get(k) === v)))}</div>`).join('')
        + '<p class="hint">La qualité règle aussi la distance d\'affichage, le brouillard et la taille des ombres (réglage commun aux jeux du site).</p>';
    }
    if (t === 'game') body = `<div class="card"><div class="grow"><b>Météo</b><small>Auto : change toute seule</small></div>${seg([['auto', 'Auto'], ['clear', 'Dégagé'], ['rain', 'Pluie'], ['fog', 'Brouillard']].map(([k, n]) => btn(`data-weather="${k}"`, n, k === 'auto' ? env.auto : !env.auto && env.weather === k)))}</div>
      <div class="card"><div class="grow"><b>Heure</b><small>Il est ${env.clock}</small></div>${seg([[7, 'Matin'], [12, 'Midi'], [18.5, 'Soir'], [23, 'Nuit']].map(([h, n]) => btn(`data-hour="${h}"`, n, false)))}</div>
      <div class="card"><div class="grow"><b>Écoulement du temps</b><small>0 = heure figée</small></div>${seg([[0, 'Figé'], [1, 'Normal'], [3, 'Rapide']].map(([v, n]) => btn(`data-speed="${v}"`, n, this.g.timeSpeed === v)))}</div>`;
    if (t === 'shop') body = `<p class="hint">Argent : <b>${Math.round(e.d.money)} €</b> · Grade : ${e.grade}</p>` + Object.entries(UPGRADES).map(([id, u]) => {
      const n = e.d.up[id], full = n >= u.max, lock = e.gradeIndex < u.grade;
      return `<div class="card"><div class="grow"><b>${u.name}</b> (${n}/${u.max})<small>${u.desc}${lock ? ` · ${GRADES[u.grade].name} requis` : ''}</small></div><button data-buy="${id}" ${full || lock ? 'disabled' : ''}>${full ? 'Acquis' : `${e.price(id)} €`}</button></div>`;
    }).join('');
    if (t === 'career') body = `<div class="stats"><div><b>${e.grade}</b><small>Grade</small></div><div><b>${e.d.xp}</b><small>XP</small></div><div><b>${e.d.trucks}</b><small>Camions chargés</small></div><div><b>${Math.round(e.d.sold)} t</b><small>Vendues</small></div></div>
      <div class="stats"><div><b>${Math.round(e.d.soldMoney)} €</b><small>Chiffre d'affaires</small></div><div><b>${e.d.orders}</b><small>Commandes finies</small></div><div><b>${e.d.blasts}</b><small>Tirs de mine</small></div><div><b>${Math.round(e.d.crushed)} m³</b><small>Concassés</small></div></div>
      <p class="hint">Grades : ${GRADES.map((g) => `${g.name} (${g.xp} XP)`).join(' · ')}</p><button class="danger" data-act="reset">Nouvelle carrière</button>`;
    if (t !== 'main') body = `<h2>${{ gfx: 'Graphismes', shop: 'Améliorations', career: 'Carrière', help: 'Conseils', fleet: 'Engins', game: 'Heure et météo' }[t]}</h2>` + body + `<div class="menu-list">${back}</div>`;
    this.el.innerHTML = `<div class="panel"><div class="head"><h1>Chantier &amp; Carrière</h1></div><div class="body">${body}</div></div>`;
  }
}

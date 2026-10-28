// Menu principal : service (lignes), garage (bus), carrière.
import { BUS_TYPES, BUS_ORDER } from '../bus/BusStats.js';
import { LINES } from '../lines/Lines.js';
import { LEVEL_XP } from '../economy/Economy.js';

const eur = (v) => `${Math.round(v).toLocaleString('fr-FR')} €`;

export class Menu {
  constructor(game) {
    this.g = game; this.open = false; this.tab = 'service';
    this.root = document.getElementById('menu');
    this.root.addEventListener('click', (ev) => {
      const t = ev.target.closest('[data-act]');
      if (t) this.act(t.dataset.act);
    });
  }
  toggle(force) {
    this.open = force ?? !this.open;
    this.root.style.display = this.open ? 'flex' : 'none';
    if (this.open) this.render();
  }
  act(a) {
    const g = this.g, e = g.economy, [cmd, arg] = a.split(':');
    let err = null;
    if (cmd === 'tab') this.tab = arg;
    else if (cmd === 'close') return this.toggle(false);
    else if (cmd === 'line') { g.service.start(arg); this.toggle(false); return; }
    else if (cmd === 'stop') { g.service.end(); }
    else if (cmd === 'buyline') err = e.buyLine(arg);
    else if (cmd === 'buybus') { err = e.buyBus(arg); }
    else if (cmd === 'usebus') { g.switchBus(arg); this.toggle(false); return; }
    else if (cmd === 'reset' && confirm('Effacer la sauvegarde ?')) { e.reset(); location.reload(); return; }
    if (err) g.toast(err, 'warn');
    this.render();
  }
  render() {
    const g = this.g, e = g.economy, d = e.d, s = g.service;
    const tabs = [['service', 'Service'], ['garage', 'Garage'], ['carriere', 'Carrière']];
    let body = '';
    if (this.tab === 'service') {
      body = LINES.map((l) => {
        const own = e.ownsLine(l.id), lock = e.level < l.level;
        const action = s.line === l ? `<button data-act="stop">Arrêter</button>`
          : own ? `<button class="go" data-act="line:${l.id}">Démarrer</button>`
          : lock ? `<button disabled>Niveau ${l.level}</button>`
          : `<button data-act="buyline:${l.id}">Acheter ${eur(l.price)}</button>`;
        return `<div class="card"><i class="dot" style="background:${l.color}"></i><div class="grow"><b>${l.name}</b>
          <small>${l.stops.length} arrêts · ${(l.path.length * 100 / 1000).toFixed(1)} km · course ≈ ${Math.round(l.lapTime / 60)} min</small></div>${action}</div>`;
      }).join('') + `<p class="hint">Conduisez jusqu'à l'arrêt, alignez-vous le long du trottoir, ouvrez les portes (O). Le dépôt est au sud-ouest du centre. La carte : M.</p>`;
    } else if (this.tab === 'garage') {
      body = BUS_ORDER.map((id) => {
        const b = BUS_TYPES[id], own = e.ownsBus(id), lock = e.level < b.level, cur = g.vehicle.id === id;
        const action = cur ? '<button disabled>En service</button>' : own ? `<button class="go" data-act="usebus:${id}">Utiliser</button>`
          : lock ? `<button disabled>Niveau ${b.level}</button>` : `<button data-act="buybus:${id}">Acheter ${eur(b.price)}</button>`;
        const en = b.electric ? `autonomie ${b.range} km` : `${b.consumption} L/100 km`;
        return `<div class="card"><i class="dot" style="background:${b.color}"></i><div class="grow"><b>${b.name}</b>
          <small>${b.seats} places · ${b.length} m · ${b.power} kW · rayon ${b.turnRadius} m · ${en} · ${b.doors} porte${b.doors > 1 ? 's' : ''}</small></div>${action}</div>`;
      }).join('') + `<p class="hint">Changer de bus vous ramène au dépôt et arrête le service en cours.</p>`;
    } else {
      body = `<div class="stats"><div><b>${e.level}</b><small>Niveau</small></div><div><b>${d.xp}</b><small>XP${e.maxLevel ? '' : ` / ${LEVEL_XP[e.level]}`}</small></div>
        <div><b>${eur(d.money)}</b><small>Argent</small></div><div><b>${d.runs}</b><small>Courses</small></div><div><b>${d.stopsDone}</b><small>Arrêts</small></div>
        <div><b>${d.pax}</b><small>Voyageurs</small></div><div><b>${d.fines}</b><small>Amendes</small></div><div><b>${eur(d.finesTotal)}</b><small>Total amendes</small></div></div>
        <p class="hint">Niveau 2 : périphérie, bus électrique · Niveau 3 : zone commerciale, double étage · Niveau 4 : grande ceinture, bus articulé.</p>
        <button class="danger" data-act="reset">Effacer la sauvegarde</button>`;
    }
    this.root.innerHTML = `<div class="panel"><div class="head"><h1>Bus City Simulator</h1><span>${eur(d.money)} · Niveau ${e.level}</span>
      <button data-act="close">✕</button></div><div class="tabs">${tabs.map(([k, n]) => `<button class="${this.tab === k ? 'on' : ''}" data-act="tab:${k}">${n}</button>`).join('')}</div>
      <div class="body">${body}</div><div class="foot">Tab / Échap : menu · C vue · O portes · R rampe PMR · N sauter l'arrêt · M carte · I aide</div></div>`;
  }
}

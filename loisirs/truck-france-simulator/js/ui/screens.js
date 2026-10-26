import { CITIES } from '../map/cities.js';
import { TRAILERS } from '../truck/truckData.js';
import { state, save, hasSave } from '../core/state.js';

const $ = (id) => document.getElementById(id);
const eur = (n) => `${Math.round(n).toLocaleString('fr-FR')} €`;
const name = (id) => CITIES.find((c) => c.id === id).name;
const hm = (h) => `${Math.floor(h)} h ${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;

/** Menu principal + options. */
export function createMenu({ onNew, onContinue, onOptions }) {
  const root = $('menu');
  const sync = () => { $('mn-cont').disabled = !hasSave(); };
  $('mn-new').onclick = () => { if (!hasSave() || confirm('Effacer la sauvegarde et recommencer ?')) onNew(); };
  $('mn-cont').onclick = onContinue;
  $('mn-opt').onclick = () => { $('mn-options').hidden = !$('mn-options').hidden; };
  for (const k of ['shadows', 'lowres']) {
    const box = $(`op-${k}`);
    box.checked = state.options[k];
    box.onchange = () => { state.options[k] = box.checked; save(); onOptions(); };
  }
  return { show() { sync(); root.hidden = false; }, hide() { root.hidden = true; } };
}

/** Tableau des contrats pour la remorque sélectionnée. */
export function createContracts({ onAccept, onBack }) {
  const root = $('contracts');
  $('ct-back').onclick = onBack;
  return {
    show(contracts) {
      $('ct-money').textContent = eur(state.money);
      $('ct-title').textContent = `Contrats · ${TRAILERS[state.trailer].name}`;
      $('ct-list').replaceChildren(...contracts.map((c) => {
        const b = document.createElement('button');
        b.className = 'item route';
        b.style.setProperty('--c', '#22c55e');
        b.innerHTML = `<b>${name(c.from)} → ${name(c.to)}</b><span>${eur(c.pay)}</span>
          <small>${c.cargo} · ${Math.round(c.loadFrac * TRAILERS[c.trailerId].maxLoad / 1000)} t · ${c.km} km · délai ${hm(c.deadline)}</small>`;
        b.onclick = () => onAccept(c);
        return b;
      }));
      root.hidden = false;
    },
    hide() { root.hidden = true; },
  };
}

/** Résumé de livraison. */
export function createSummary({ onNext, onMenu }) {
  const root = $('summary');
  $('sm-next').onclick = onNext;
  $('sm-menu').onclick = onMenu;
  return {
    show({ contract, result, hours, km, failed }) {
      $('sm-title').textContent = failed ? 'Camion hors service' : `Livraison à ${name(contract.to)}`;
      $('sm-lines').innerHTML =
        `<div class="row"><span>Cargaison</span><b>${contract.cargo}</b></div>
         <div class="row"><span>Temps (délai ${hm(contract.deadline)})</span><b>${hm(hours)}</b></div>
         <div class="row"><span>Distance</span><b>${Math.round(km)} km</b></div><hr>` +
        result.lines.map(([l, v]) => `<div class="row"><span>${l}</span><b class="${v < 0 ? 'neg' : 'pos'}">${v < 0 ? '−' : '+'}${eur(Math.abs(v))}</b></div>`).join('') +
        `<hr><div class="row total"><span>Gain net</span><b class="${result.net < 0 ? 'neg' : 'pos'}">${result.net < 0 ? '−' : '+'}${eur(Math.abs(result.net))}</b></div>
         <div class="row"><span>Argent</span><b>${eur(state.money)}</b></div>`;
      root.hidden = false;
    },
    hide() { root.hidden = true; },
  };
}

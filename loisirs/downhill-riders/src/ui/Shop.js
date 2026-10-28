/* Boutique : vélos, cadres, roues, tenues, casques. On achète avec la réputation gagnée, on équipe en un clic. */
import { CATALOG } from '../bike/parts.js';
import { CAT_NAMES } from '../bike/parts.js';
import { save } from '../core/save.js';
import { owns, buy, equip } from '../gameplay/Progression.js';

const hex = (n) => '#' + (n ?? 0).toString(16).padStart(6, '0');
const swatch = (cat, it) => (cat === 'frame' ? `<span class="swatch" style="background:${hex(it.col)}"></span>` : cat === 'wheel' ? `<span class="swatch" style="background:${hex(it.rim)}"></span>` : cat === 'outfit' ? `<span class="swatch" style="background:${hex(it.top)}"></span><span class="swatch" style="background:${hex(it.pants)}"></span>` : cat === 'helmet' ? `<span class="swatch" style="background:${hex(it.col)}"></span>` : '');

export function renderShop(root, { onChange, onBack }) {
  let cat = 'bike';
  const draw = () => {
    root.innerHTML = `<div class="card"><p class="eyebrow">Garage</p><div class="row" style="justify-content:space-between"><h2>Boutique</h2><div class="stats"><span>Réputation <b>${Math.floor(save.rep)}</b></span><span>À dépenser <b>${Math.floor(save.cash)}</b></span></div></div>
      <div class="tabs">${Object.keys(CAT_NAMES).map((c) => `<button class="tab ${c === cat ? 'sel' : ''}" data-cat="${c}">${CAT_NAMES[c]}</button>`).join('')}</div>
      <div class="grid">${CATALOG[cat].map((it) => {
        const o = owns(cat, it.id), eq = save.eq[cat] === it.id, can = save.cash >= it.price;
        return `<button class="opt ${eq ? 'sel' : ''} ${!o && !can ? 'lock' : ''}" data-id="${it.id}"><b>${swatch(cat, it)} ${it.name}</b><small>${it.desc || ''}</small><small>${eq ? '✔ Équipé' : o ? 'Équiper' : it.price + ' pts'}</small></button>`;
      }).join('')}</div>
      <div class="row"><button class="btn primary" data-back>Retour</button></div></div>`;
    root.querySelectorAll('[data-cat]').forEach((b) => (b.onclick = () => { cat = b.dataset.cat; draw(); }));
    root.querySelectorAll('[data-id]').forEach((b) => (b.onclick = () => {
      const id = b.dataset.id; const ok = owns(cat, id) ? equip(cat, id) : buy(cat, id);
      if (ok) onChange(cat); draw();
    }));
    root.querySelector('[data-back]').onclick = onBack;
  };
  draw();
}

/* Écrans : titre (liste des niveaux), pause, résultats. Les niveaux se débloquent dans l'ordre. */
import { LEVELS } from '../levels/levels.js';
import { save } from '../core/save.js';
import { fmt } from './hud.js';

const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const starsHtml = (n) => [1, 2, 3].map((i) => `<i class="${i <= n ? 'on' : ''}">★</i>`).join('');
const CHAPTERS = [...new Set(LEVELS.map((l) => l.chapter))];
/* Dans un chapitre, les niveaux se débloquent dans l'ordre ; les quatre chapitres sont ouverts dès le départ. */
export const unlocked = (level) => { const same = LEVELS.filter((l) => l.chapter === level.chapter), i = same.indexOf(level); return i === 0 || !!save.best[same[i - 1].id]; };
const chapterStars = (ch) => LEVELS.filter((l) => l.chapter === ch).reduce((s, l) => s + (save.best[l.id] ? save.best[l.id].stars : 0), 0);

export class Menus {
  constructor(game) { this.g = game; this.root = document.getElementById('screen'); }
  hide() { this.root.hidden = true; this.root.innerHTML = ''; this.root.className = 'overlay'; }
  open(card, cls = '') { this.root.className = 'overlay ' + cls; this.root.hidden = false; this.root.innerHTML = ''; this.root.append(card); }
  button(label, fn, cls = '') { const b = el('button', 'btn ' + cls, label); b.addEventListener('click', () => { this.g.audio.click(); fn(); }); return b; }

  title(tab) {
    this.tab = tab || this.tab || (this.g.level && this.g.level.chapter) || CHAPTERS[0];
    const card = el('div', 'card');
    card.append(el('div', 'eyebrow', 'JEU DE STATIONNEMENT'), el('h1', 'logo', 'Parking Master'),
      el('p', 'lede', 'Suis les flèches au sol et gare-toi dans la place. À 10 km/h ou plus, un choc fait perdre le niveau ; en dessous, c’est un simple avertissement. Piétons et voitures circulent : attention à eux.'));
    const tabs = el('div', 'tabs');
    for (const ch of CHAPTERS) {
      const t = el('button', 'tab' + (ch === this.tab ? ' on' : ''), `${ch} <small>${chapterStars(ch)}/15 ★</small>`);
      t.addEventListener('click', () => { this.g.audio.click(); this.title(ch); });
      tabs.append(t);
    }
    card.append(tabs);
    const list = el('div', 'levels');
    LEVELS.filter((l) => l.chapter === this.tab).forEach((L, n) => {
      const open = unlocked(L), b = save.best[L.id];
      const row = el('div', 'lv' + (open ? '' : ' locked'));
      row.append(el('div', 'lv-t', `<small>Niveau ${n + 1}</small><b>${L.name}</b><span>${open ? L.blurb : 'Termine le niveau précédent pour le débloquer.'}</span>`),
        el('div', 'lv-s', open ? `<div class="stars">${starsHtml(b ? b.stars : 0)}</div><small>${b ? 'Record ' + fmt(b.time) : 'Pas encore joué'}</small>` : '🔒'));
      if (open) row.append(this.button(b ? 'Rejouer' : 'Jouer', () => this.g.start(L.id)));
      list.append(row);
    });
    card.append(list);
    const ft = window.GameSettings?.foot(); if (ft) card.append(ft); // Réglages + commandes : même pied que les autres jeux
    this.open(card);
  }

  pause() {
    const card = el('div', 'card small');
    card.append(el('h2', null, 'Pause'));
    const vol = el('label', 'vol', 'Volume <input type="range" min="0" max="1" step="0.05">');
    const r = vol.querySelector('input'); r.value = save.volume; r.addEventListener('input', () => { save.volume = +r.value; this.g.audio.setVolume(save.volume); });
    card.append(this.button('Reprendre', () => this.g.resume(), 'primary'), this.button('Recommencer', () => this.g.restart()), this.button('Menu', () => this.g.toMenu()), vol);
    this.open(card, 'dim');
  }

  result(r) {
    const L = r.level, idx = LEVELS.indexOf(L), next = LEVELS[idx + 1] && LEVELS[idx + 1].chapter === L.chapter ? LEVELS[idx + 1] : null;
    const card = el('div', 'card small');
    card.append(el('h2', null, 'Bien garé !'), el('div', 'stars big', starsHtml(r.stars)),
      el('p', 'lede', `Temps : <b>${fmt(r.time)}</b>${r.record ? ' · <span class="rec">nouveau record</span>' : ''}<br><small>${r.warns ? r.warns + ' avertissement' + (r.warns > 1 ? 's' : '') + ' · ' : ''}3 étoiles avant ${fmt(L.stars[0])}</small>`));
    if (next) card.append(this.button('Niveau suivant', () => this.g.start(next.id), 'primary'));
    card.append(this.button('Rejouer', () => this.g.start(L.id), next ? '' : 'primary'), this.button('Menu', () => this.g.toMenu()));
    this.open(card, 'dim');
  }
}

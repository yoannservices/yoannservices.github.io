/* Menus : accueil, préparation de la descente (mode, biome, niveau, graine), commandes, réglages, pause. */
import { DIFFS, BIOME_REP } from '../core/config.js';
import { BIOMES, BIOME_IDS } from '../world/Biomes.js';
import { save, persist } from '../core/save.js';
import { biomeUnlocked, diffUnlocked, nextUnlock } from '../gameplay/Progression.js';
import { randomSeedWord } from '../core/rng.js';
import { renderShop } from './Shop.js';
import { renderResults } from './Results.js';

const KEYS = [
  ['Z', 'Pédaler (en l\'air : frontflip)'], ['S', 'Frein arrière (en l\'air : backflip)'], ['F', 'Frein avant (attention à l\'endo)'], ['Q / D', 'Tourner (en l\'air : rotations 180 / 360)'],
  ['Espace', 'Maintenir puis relâcher : saut'], ['Maj', 'Manual (Maj + Z : nose manual)'], ['E', "Revert : demi-tour rapide en l'air"],
  ['J / U', 'Whip à gauche / à droite'], ['K / I', 'Barspin'], ['L', 'Tabletop (Maj + L : superman)'], ['T', 'No-hander'],
  ['C', 'Changer de vue'], ['M', 'Carte de la descente'], ['R', 'Retour au point de contrôle'], ['H', 'Aide'], ['P / Échap', 'Pause'], ['Clic + glisser', 'Tourner la caméra'],
];

export class Menu {
  constructor(root, h) { this.root = root; this.h = h; this.sel = { mode: 'run', biome: 'forest', diff: 'green', seed: save.lastSeed || randomSeedWord() }; }
  hide() { this.root.hidden = true; this.root.innerHTML = ''; }
  _open(clear = false) { this.root.hidden = false; this.root.className = 'overlay' + (clear ? ' clear' : ''); }
  show(name, data) { this._open(name === 'shop'); this[name](data); }

  main() {
    const nu = nextUnlock();
    this.root.innerHTML = `<div class="card"><p class="eyebrow">Loisirs · Jeu de VTT</p><h1>Downhill<br><span>Riders</span></h1>
      <p class="lede">Des descentes générées à partir d'une graine : sauts, passerelles, rails, drops, tronçons techniques et lignes risquées. Enchaîne les figures, ne tombe pas.</p>
      <div class="stats"><span>Réputation <b>${Math.floor(save.rep)}</b></span><span>À dépenser <b>${Math.floor(save.cash)}</b></span><span>Descentes <b>${save.stats.runs}</b></span><span>Plus long saut <b>${save.stats.longestJump.toFixed(0)} m</b></span>${nu ? `<span>Prochain déblocage : <b>${nu.name}</b> à ${nu.rep}</span>` : ''}</div>
      <div class="row"><button class="btn primary" data-a="setup">Descendre</button><button class="btn" data-a="shop">Garage</button><button class="btn ghost" data-a="help">Commandes</button><button class="btn ghost" data-a="settings">Réglages</button></div></div>`;
    this._bind();
  }

  setup() {
    const s = this.sel, bi = (id) => BIOMES[id], lock = (id) => !biomeUnlocked(id);
    if (lock(s.biome)) s.biome = 'forest'; if (!diffUnlocked(DIFFS.find((d) => d.id === s.diff))) s.diff = 'green';
    this.root.innerHTML = `<div class="card"><p class="eyebrow">Nouvelle descente</p><h2>Prépare ta descente</h2>
      <h3>Mode</h3><div class="grid"><button class="opt ${s.mode === 'run' ? 'sel' : ''}" data-mode="run"><b>Run</b><small>Vies limitées, un crash en coûte une. Fin de run = résultats.</small></button><button class="opt ${s.mode === 'free' ? 'sel' : ''}" data-mode="free"><b>Libre</b><small>Sans pression : réapparition illimitée.</small></button></div>
      <h3>Biome</h3><div class="grid">${BIOME_IDS.map((id) => `<button class="opt ${s.biome === id ? 'sel' : ''} ${lock(id) ? 'lock' : ''}" data-biome="${id}"><b>${bi(id).name}</b><small>${lock(id) ? '🔒 ' + BIOME_REP[id] + ' de réputation' : bi(id).desc}</small></button>`).join('')}</div>
      <h3>Niveau</h3><div class="grid">${DIFFS.map((d) => `<button class="opt ${s.diff === d.id ? 'sel' : ''} ${!diffUnlocked(d) ? 'lock' : ''}" data-diff="${d.id}"><b><span class="dot" style="background:${d.col}"></span> ${d.name}</b><small>${diffUnlocked(d) ? `${d.len} m · ${d.lives} vies` : '🔒 ' + d.minRep + ' de réputation'}</small></button>`).join('')}</div>
      <div class="row"><label class="field">Graine<input id="seed" maxlength="12" value="${s.seed}" /></label><button class="btn" data-a="dice">🎲 Aléatoire</button></div>
      <div class="row"><button class="btn primary" data-a="go">Lancer la descente</button><button class="btn ghost" data-a="main">Retour</button></div></div>`;
    this.root.querySelectorAll('[data-mode]').forEach((b) => (b.onclick = () => { s.mode = b.dataset.mode; this.setup(); }));
    this.root.querySelectorAll('[data-biome]').forEach((b) => (b.onclick = () => { if (!lock(b.dataset.biome)) { s.biome = b.dataset.biome; this.setup(); } }));
    this.root.querySelectorAll('[data-diff]').forEach((b) => (b.onclick = () => { const d = DIFFS.find((x) => x.id === b.dataset.diff); if (diffUnlocked(d)) { s.diff = d.id; this.setup(); } }));
    const seed = this.root.querySelector('#seed'); seed.oninput = () => { s.seed = seed.value.toUpperCase(); };
    this._bind({ dice: () => { s.seed = randomSeedWord(); this.setup(); }, go: () => { s.seed = (seed.value || randomSeedWord()).toUpperCase(); save.lastSeed = s.seed; persist(); this.h.play({ ...s }); } });
  }

  help() {
    this.root.innerHTML = `<div class="card"><p class="eyebrow">Commandes</p><h2>Clavier AZERTY (comme Trottinette Freestyle)</h2><table class="keys">${KEYS.map(([k, a]) => `<tr><td>${k.split(' / ').map((x) => `<kbd>${x}</kbd>`).join(' ')}</td><td>${a}</td></tr>`).join('')}</table>
      <p class="lede">Manette : stick gauche = direction, A = saut, RT = pédaler, B = frein arrière, LT = frein avant, X = tabletop, Y = no-hander, LB / RB = whips, stick droit = flips et rotations en l'air.</p>
      <div class="row"><button class="btn primary" data-a="${this.back || 'main'}">Retour</button></div></div>`;
    this._bind();
  }

  settings() {
    this.root.innerHTML = `<div class="card small"><p class="eyebrow">Réglages</p><h2>Réglages</h2>
      <label class="row"><input type="checkbox" id="blur" ${save.settings.blur ? 'checked' : ''} /> Flou radial en vitesse</label>
      <label class="field">Volume <input type="range" id="vol" min="0" max="100" value="${Math.round(save.settings.volume * 100)}" style="text-transform:none" /></label>
      <div class="row"><button class="btn" data-a="reset">Effacer la sauvegarde</button><button class="btn primary" data-a="${this.back || 'main'}">Retour</button></div></div>`;
    this.root.querySelector('#blur').onchange = (e) => { save.settings.blur = e.target.checked; persist(); this.h.setBlur(e.target.checked); };
    this.root.querySelector('#vol').oninput = (e) => { save.settings.volume = e.target.value / 100; persist(); this.h.setVolume(save.settings.volume); };
    this._bind({ reset: () => { if (confirm('Effacer toute la progression ?')) { localStorage.removeItem('downhill-riders:v1'); location.reload(); } } });
  }

  pause() {
    this.root.innerHTML = `<div class="card small"><p class="eyebrow">Pause</p><h2>En pause</h2><div class="row"><button class="btn primary" data-a="resume">Reprendre</button><button class="btn" data-a="restart">Recommencer la descente</button><button class="btn ghost" data-a="help2">Commandes</button><button class="btn ghost" data-a="settings2">Réglages</button><button class="btn ghost" data-a="quit">Abandonner</button></div></div>`;
    this._bind({ resume: () => this.h.resume(), restart: () => this.h.restart(), quit: () => this.h.quit(), help2: () => { this.back = 'pause'; this.help(); }, settings2: () => { this.back = 'pause'; this.settings(); } });
  }

  shop() { renderShop(this.root, { onChange: (c) => this.h.preview(c), onBack: () => { this.h.preview(); this.show('main'); } }); }
  results(d) { renderResults(this.root, d, { again: () => this.h.again(), newseed: () => this.h.newSeed(), garage: () => this.h.garage(), menu: () => { this.h.toMenu(); } }); }

  _bind(extra = {}) {
    this.root.querySelectorAll('[data-a]').forEach((b) => (b.onclick = () => {
      const a = b.dataset.a; if (extra[a]) return extra[a]();
      if (a === 'setup') { this.show('setup'); } else if (a === 'main') { this.back = null; this.h.toMenu(); } else if (a === 'shop') { this.h.garage(); } else if (a === 'help') { this.back = 'main'; this.show('help'); } else if (a === 'settings') { this.back = 'main'; this.show('settings'); } else if (a === 'pause') { this.show('pause'); }
    }));
  }
}

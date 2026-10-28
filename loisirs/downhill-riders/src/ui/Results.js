/* Écran de résultats de fin de descente. */
import { fmt } from '../gameplay/Objectives.js';

export function renderResults(root, d, h) {
  const unlocks = [...d.unlocks.biomes.map((b) => `Biome ${b}`), ...d.unlocks.diffs.map((x) => `Niveau ${x.name}`)];
  root.innerHTML = `<div class="card small"><p class="eyebrow">${d.finished ? 'Descente terminée' : d.free ? 'Descente abandonnée' : 'Run terminée'}</p>
    <h2>${d.finished ? 'Bien joué !' : d.free ? 'À la prochaine' : 'Plus de vies'}</h2>
    <div class="big">${d.free ? '—' : d.score}</div>
    <div class="stats"><span>Temps <b>${fmt(d.time)}</b></span><span>Crashs <b>${d.crashes}</b></span><span>Meilleur combo <b>${d.bestCombo}</b></span><span>Plus long saut <b>${d.longest.toFixed(1)} m</b></span></div>
    <div>${d.objectives.map((o) => `<div class="${o.done ? 'ok' : ''}">${o.done ? '✔' : '○'} ${o.label}${o.done ? ` (+${o.reward})` : ''}</div>`).join('')}</div>
    <div class="row"><span>Réputation gagnée</span><b class="ok" style="font-size:1.4rem">+${d.reward.rep}</b></div>
    ${unlocks.length ? `<div class="ok">🔓 Débloqué : ${unlocks.join(', ')}</div>` : ''}
    <div class="row"><button class="btn primary" data-act="again">Rejouer cette graine</button><button class="btn" data-act="newseed">Nouvelle graine</button><button class="btn ghost" data-act="garage">Garage</button><button class="btn ghost" data-act="menu">Menu</button></div></div>`;
  root.querySelectorAll('[data-act]').forEach((b) => (b.onclick = () => h[b.dataset.act]()));
}

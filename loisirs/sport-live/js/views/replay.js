/* Replays 3D avec tracking réel (StatsBomb Open Data, données 360). */
(() => {
'use strict';
const { statsbomb } = SL;
const { t } = SL;
const { esc, loading, errorBox } = SL;

const REPLAYS = [
  { id: 3869685, home: 'Argentina', away: 'France', title: 'Argentine 3-3 France (t.a.b. 4-2)', comp: 'Coupe du monde 2022 · Finale', colors: ['#7dd3fc', '#1e3a8a'], shorts: ['#111827', '#f8fafc'] },
  { id: 3943043, home: 'Spain', away: 'England', title: 'Espagne 2-1 Angleterre', comp: 'Euro 2024 · Finale', colors: ['#dc2626', '#f8fafc'], shorts: ['#1e3a8a', '#1e3a8a'] },
  { id: 3942752, home: 'Spain', away: 'France', title: 'Espagne 2-1 France', comp: 'Euro 2024 · Demi-finale', colors: ['#dc2626', '#1e3a8a'], shorts: ['#1e3a8a', '#f8fafc'] },
  { id: 3869552, home: 'France', away: 'Morocco', title: 'France 2-0 Maroc', comp: 'Coupe du monde 2022 · Demi-finale', colors: ['#1e3a8a', '#dc2626'], shorts: ['#f8fafc', '#16a34a'] },
  { id: 3869354, home: 'England', away: 'France', title: 'Angleterre 1-2 France', comp: 'Coupe du monde 2022 · Quart de finale', colors: ['#f8fafc', '#1e3a8a'], shorts: ['#1e3a8a', '#f8fafc'] },
  { id: 3869519, home: 'Argentina', away: 'Croatia', title: 'Argentine 3-0 Croatie', comp: 'Coupe du monde 2022 · Demi-finale', colors: ['#7dd3fc', '#ef4444'], shorts: ['#111827', '#f8fafc'] },
  { id: 3942819, home: 'Netherlands', away: 'England', title: 'Pays-Bas 1-2 Angleterre', comp: 'Euro 2024 · Demi-finale', colors: ['#f97316', '#f8fafc'], shorts: ['#f97316', '#1e3a8a'] },
  { id: 3941019, home: 'France', away: 'Belgium', title: 'France 1-0 Belgique', comp: 'Euro 2024 · 8e de finale', colors: ['#1e3a8a', '#dc2626'], shorts: ['#f8fafc', '#dc2626'] },
];

async function render(root, { id }) {
  const m = REPLAYS.find(r => String(r.id) === String(id));
  if (!m) {
    root.innerHTML = `
      <header class="page-h"><button id="burger" class="burger" aria-label="Menu">☰</button><span class="page-ico">🎥</span>
        <div><h1>${t('sim3d')}</h1><p>${t('replayIntro')}</p></div></header>
      <section class="card"><header><h2>${t('replay')}</h2><small class="muted">StatsBomb Open Data</small></header>
        <div class="replay-grid">${REPLAYS.map(r => `<a class="replay-card" href="#/replay/${r.id}">
          <span class="rc-col" style="background:linear-gradient(90deg,${r.colors[0]} 50%,${r.colors[1]} 50%)"></span>
          <b>${esc(r.title)}</b><small>${esc(r.comp)}</small></a>`).join('')}</div></section>
      <section class="card"><header><h2>${t('liveSim')}</h2></header>
        <p>${t('simNote')}</p><p class="muted">⚽ → ${t('sports')} → Football → match → <b>${t('sim3d')}</b></p></section>`;
    return;
  }
  root.innerHTML = `
    <header class="page-h slim"><button id="burger" class="burger" aria-label="Menu">☰</button><a class="back" href="#/replay">←</a>
      <div><h1>${esc(m.title)}</h1><p>${esc(m.comp)} · StatsBomb 360</p></div></header>
    <div id="v3">${loading()}<p class="muted center">${t('loadingBig')}</p></div>
    <section class="card"><header><h2>${t('bigPlays')}</h2></header><ol class="tline" id="evs"></ol></section>`;
  let viewer = null, dead = false;
  try {
    const [events, frames, lineups, { StatsBombDirector }, { mountViewer }] = await Promise.all([
      statsbomb.events(m.id), statsbomb.frames(m.id), statsbomb.lineups(m.id), SL, SL]);
    if (dead) return;
    const dir = new StatsBombDirector(events, frames, lineups, m);
    const box = root.querySelector('#v3');
    box.innerHTML = '';
    viewer = await mountViewer(box, dir, [m.home, m.away]);
    root.querySelector('#evs').innerHTML = dir.events.filter(e => e.kind !== 'shot' || true).map(e => `<li class="${e.ti ? 'a' : 'h'} ${e.score ? 'goal' : ''}">
      <span class="tm">${esc(e.clock)}</span><div class="tx"><b>${esc(e.text)}</b></div><button class="btn ghost xs" data-seek="${e.t - 6}">🎥</button></li>`).join('');
    root.querySelector('#evs').onclick = e => { const b = e.target.closest('[data-seek]'); if (b) viewer.seek(Math.max(0, Number(b.dataset.seek))); };
  } catch (e) {
    root.querySelector('#v3').innerHTML = errorBox(e);
  }
  return { destroy() { dead = true; viewer?.destroy(); } };
}

SL.views['replay'] = { render };
Object.assign(SL, { REPLAYS });
})();

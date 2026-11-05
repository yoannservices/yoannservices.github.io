/* Accueil « Mon suivi » : matchs de mes équipes / compétitions + tous les directs. */
(() => {
'use strict';
const { SPORTS, sportOfPath, leagueOfPath } = SL;
const { espn, stateOf, teamsOf } = SL;
const { t, getLang } = SL;
const { store } = SL;
const { esc, loading, matchRow, logo, empty } = SL;
const { windowEvents } = SL;

async function render(root) {
  const u = store.user;
  root.innerHTML = `
    <header class="page-h">
      <button id="burger" class="burger" aria-label="Menu">☰</button>
      <span class="page-ico">⭐</span>
      <div><h1>${t('myFeed')}</h1><p>${u ? esc(u.name) : t('guest')}</p></div>
    </header>
    <div class="fav-chips">${store.data.teams.map(tm => `<a class="fchip" href="#/league/${tm.path}">${logo(tm.logo, tm.name, 'logo sm')}${esc(tm.name)}</a>`).join('')}
      ${store.data.leagues.map(p => `<a class="fchip" href="#/league/${p}">${leagueOfPath(p)?.flag || ''} ${esc(leagueOfPath(p)?.name || p)}</a>`).join('')}</div>
    <div id="mine"></div>
    <a class="promo card" href="#/replay"><span>🎥</span><div><b>${t('sim3d')}</b><small>${t('replayIntro')}</small></div><span>→</span></a>
    <section class="card"><header><h2>● ${t('liveNow')}</h2><small id="liveCount" class="muted"></small></header><div id="live">${loading()}</div></section>`;
  let anyLive = false;

  async function load() {
    const team = SPORTS.flatMap(s => s.leagues.filter(() => s.kind === 'team'));
    const favTeamIds = new Set(store.data.teams.map(x => x.id));
    const favPaths = new Set([...store.data.teams.map(x => x.path), ...store.data.leagues]);
    const results = await Promise.all(team.map(l => espn.scoreboard(l.path).then(d => ({ l, d }), () => ({ l, d: { events: [] } }))));

    // Mes équipes / compétitions
    const mine = [];
    const favRes = await Promise.all(results.filter(r => favPaths.has(r.l.path)).map(({ l }) => windowEvents(l.path).then(d => ({ l, d }), () => ({ l, d: { events: [] } }))));
    for (const { l, d } of favRes) {
      for (const e of d.events || []) {
        const ids = teamsOf(e.competitions?.[0]).map(c => String(c.team?.id));
        if (store.data.leagues.includes(l.path) || ids.some(i => favTeamIds.has(i))) mine.push({ l, e });
      }
    }
    const order = { in: 0, pre: 1, post: 2 };
    mine.sort((a, b) => order[stateOf(a.e)] - order[stateOf(b.e)] || new Date(a.e.date) - new Date(b.e.date));
    const mineEl = root.querySelector('#mine');
    mineEl.innerHTML = !favPaths.size ? `<div class="empty">${t('noFav')}</div>`
      : `<section class="card"><header><h2>⭐ ${t('favorites')}</h2></header>${mine.length ? `<div class="rows">${mine.map(x => matchRow(x.e, x.l.path)).join('')}</div>` : empty(t('noMatches'))}</section>`;

    // Tous les directs, par sport
    const bySport = new Map();
    for (const { l, d } of results) {
      const lv = (d.events || []).filter(e => stateOf(e) === 'in');
      if (!lv.length) continue;
      const s = sportOfPath(l.path);
      if (!bySport.has(s)) bySport.set(s, []);
      bySport.get(s).push({ l, lv });
    }
    anyLive = bySport.size > 0;
    const n = [...bySport.values()].flat().reduce((a, x) => a + x.lv.length, 0);
    root.querySelector('#liveCount').textContent = n ? `${n}` : '';
    root.querySelector('#live').innerHTML = anyLive ? [...bySport].map(([s, ls]) => `<div class="live-sport"><h3>${s.icon} ${esc(s.name[getLang()])}</h3>
      ${ls.map(({ l, lv }) => `<div class="live-league"><small class="muted">${l.flag} ${esc(l.name)}</small><div class="rows">${lv.map(e => matchRow(e, l.path)).join('')}</div></div>`).join('')}</div>`).join('')
      : empty(t('noMatches'));
  }
  await load();
  return { refresh: load, isLive: () => true, interval: 30000 };
}

SL.views['home'] = { render };
})();

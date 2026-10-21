/* Page d'une compétition : calendrier du mois (sports d'équipe) ou saison
   (F1, golf, UFC…), et classement. */
(() => {
'use strict';
const { sportOfPath, leagueOfPath } = SL;
const { espn, stateOf, ym, ymd } = SL;
const { t, getLang, locale } = SL;
const { esc, loading, errorBox, matchRow, favStar, fmtDay, fmtShort, sameDay, tabs, logo, empty } = SL;

async function render(root, { path }) {
  const sport = sportOfPath(path), league = leagueOfPath(path);
  if (!sport) { root.innerHTML = errorBox('?', false); return; }
  const team = sport.kind === 'team';
  root.innerHTML = `
    <header class="page-h" style="--sc:${sport.color}">
      <button id="burger" class="burger" aria-label="Menu">☰</button>
      <a class="back" href="#/sport/${sport.id}">←</a>
      <span class="page-ico">${league.flag}</span>
      <div><h1>${esc(league.name)}</h1><p>${sport.icon} ${esc(sport.name[getLang()])}</p></div>
      ${favStar('league', { path })}
    </header>
    ${tabs([['games', team ? t('calendar') : t('calendar')], ['table', t('standings')]], 'games')}
    <div id="pane"></div>`;
  const pane = root.querySelector('#pane');
  let tab = 'games', month = new Date(), live = false;

  root.querySelector('.tabs').addEventListener('click', e => {
    const b = e.target.closest('[data-tab]'); if (!b) return;
    tab = b.dataset.tab;
    root.querySelectorAll('[data-tab]').forEach(x => x.classList.toggle('on', x === b));
    draw();
  });
  pane.addEventListener('click', e => {
    const m = e.target.closest('[data-month]'); if (!m) return;
    month = new Date(month.getFullYear(), month.getMonth() + Number(m.dataset.month), 1);
    draw();
  });

  async function draw() {
    pane.innerHTML = loading();
    try {
      pane.innerHTML = tab === 'table' ? await standings(path) : team ? await monthView() : await seasonView();
      if (tab === 'games') pane.querySelector('.today')?.scrollIntoView({ block: 'center' });
    } catch (e) { pane.innerHTML = errorBox(e); }
  }

  async function monthView() {
    const d = await espn.scoreboard(path, { dates: ym(month), limit: 400 }, 30);
    const evs = (d.events || []).sort((a, b) => new Date(a.date) - new Date(b.date));
    live = evs.some(e => stateOf(e) === 'in');
    const days = new Map();
    evs.forEach(e => { const k = new Date(e.date).toDateString(); if (!days.has(k)) days.set(k, []); days.get(k).push(e); });
    const label = month.toLocaleDateString(locale(), { month: 'long', year: 'numeric' });
    return `<div class="month-nav"><button class="btn ghost" data-month="-1">← ${t('prev')}</button><strong>${esc(label)}</strong><button class="btn ghost" data-month="1">${t('next')} →</button></div>
      ${days.size ? [...days].map(([k, list]) => `<section class="day ${sameDay(k, new Date()) ? 'today' : ''}">
        <h3>${esc(fmtDay(k))}${sameDay(k, new Date()) ? ` · <span class="accent">${t('today')}</span>` : ''}</h3>
        <div class="rows">${list.map(e => matchRow(e, path)).join('')}</div></section>`).join('') : empty(t('noMatches'))}`;
  }

  async function seasonView() {
    const d = await espn.scoreboard(path, {}, 30);
    const cal = d.leagues?.[0]?.calendar;
    const cur = (d.events || []);
    live = cur.some(e => stateOf(e) === 'in');
    const now = new Date();
    let html = `<section class="card"><header><h2>${t('live')} / ${t('upcoming')}</h2></header><div class="rows">
      ${cur.map(e => `<a class="ev-row st-${stateOf(e)}" href="#/event/${path}/${e.id}"><div class="ev-main"><strong>${esc(e.name)}</strong><small>${fmtShort(e.date)}${e.endDate ? ' – ' + fmtShort(e.endDate) : ''}</small></div></a>`).join('') || empty(t('noMatches'))}
    </div></section>`;
    if (Array.isArray(cal) && typeof cal[0] === 'object') {
      html += `<section class="card"><header><h2>${t('calendar')} ${d.leagues[0].season?.year || ''}</h2></header><div class="rows">
        ${cal.map(c => {
          const id = c.id || c.event?.$ref?.match(/events\/(\d+)/)?.[1];
          const past = new Date(c.endDate) < now, curr = new Date(c.startDate) <= now && !past;
          const date = ymd(new Date(c.endDate || c.startDate));
          return `<a class="ev-row ${past ? 'st-post' : curr ? 'st-in today' : 'st-pre'}" ${id ? `href="#/event/${path}/${id}/${date}"` : ''}>
            <div class="ev-main"><strong>${esc(c.label)}</strong><small>${fmtShort(c.startDate)} – ${fmtShort(c.endDate)}</small></div>
            ${past ? `<span class="badge post">${t('results')}</span>` : curr ? `<span class="badge live"><i></i>${t('live')}</span>` : ''}</a>`;
        }).join('')}</div></section>`;
    }
    return html;
  }

  await draw();
  return { refresh: () => tab === 'games' ? draw() : Promise.resolve(), isLive: () => live, interval: 30000 };
}

/** Classement (toutes compétitions ESPN qui en ont un). */
async function standings(path, highlight = []) {
  const d = await espn.standings(path);
  const groups = d.children?.length ? d.children : d.standings ? [d] : [];
  if (!groups.length) return empty(t('noData'));
  const statOrder = ['gamesPlayed', 'wins', 'ties', 'losses', 'pointDifferential', 'points', 'winPercent', 'gamesBehind', 'streak'];
  return groups.map(g => {
    const entries = g.standings?.entries || [];
    if (!entries.length) return '';
    const keys = statOrder.filter(k => entries[0].stats?.some(s => s.name === k));
    const sorted = [...entries].sort((a, b) => (val(a, 'rank') ?? val(a, 'playoffSeed') ?? 99) - (val(b, 'rank') ?? val(b, 'playoffSeed') ?? 99));
    return `<section class="card table-card"><header><h2>${esc(g.name || '')}</h2></header>
      <div class="table-wrap"><table class="table"><thead><tr><th>#</th><th class="l">${t('team')}</th>${keys.map(k => `<th title="${esc(k)}">${esc(abbr(entries[0], k))}</th>`).join('')}</tr></thead><tbody>
      ${sorted.map((e, i) => `<tr class="${highlight.includes(String(e.team?.id)) ? 'hl' : ''}"><td>${val(e, 'rank') ?? i + 1}</td>
        <td class="l team-cell">${logo(e.team?.logos?.[0]?.href, e.team?.abbreviation)}<span>${esc(e.team?.shortDisplayName || e.team?.displayName)}</span>${favStar('team', { id: e.team?.id, name: e.team?.displayName, logo: e.team?.logos?.[0]?.href, path })}</td>
        ${keys.map(k => `<td class="${k === 'points' ? 'b' : ''}">${esc(e.stats.find(s => s.name === k)?.displayValue ?? '')}</td>`).join('')}</tr>`).join('')}
      </tbody></table></div></section>`;
  }).join('');
}
const val = (e, k) => { const s = e.stats?.find(x => x.name === k); return s ? Number(s.value) : undefined; };
const abbr = (e, k) => e.stats.find(s => s.name === k)?.abbreviation || e.stats.find(s => s.name === k)?.shortDisplayName || k;

SL.views['league'] = { render };
Object.assign(SL, { standings });
})();

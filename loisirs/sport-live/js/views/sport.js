/* Page d'un sport : compétitions en cours / à venir. */
(() => {
'use strict';
const { sportById } = SL;
const { espn, stateOf, statusLabel, ym } = SL;
const { t, getLang } = SL;
const { esc, loading, errorBox, matchRow, favStar, liveBadge, fmtShort, fmtTime, logo, fmtDay } = SL;
const { CYCLING_RACES, raceState } = SL;

async function render(root, { id }) {
  const sport = sportById(id);
  if (!sport) { root.innerHTML = errorBox('Sport inconnu', false); return; }
  root.innerHTML = `
    <header class="page-h" style="--sc:${sport.color}">
      <button id="burger" class="burger" aria-label="Menu">☰</button>
      <span class="page-ico">${sport.icon}</span>
      <div><h1>${esc(sport.name[getLang()])}</h1><p>${t('competitions')} · ${sport.leagues.length}</p></div>
    </header>
    <div class="filters seg" role="group">
      <button data-f="all" class="on">${t('seeAll')}</button><button data-f="in">● ${t('live')}</button><button data-f="pre">${t('upcoming')}</button><button data-f="post">${t('finished')}</button>
    </div>
    <div id="grid" class="league-grid">${loading()}</div>`;
  const grid = root.querySelector('#grid');
  let filter = 'all', live = false, data = [];

  root.querySelector('.filters').addEventListener('click', e => {
    const b = e.target.closest('[data-f]'); if (!b) return;
    filter = b.dataset.f;
    root.querySelectorAll('[data-f]').forEach(x => x.classList.toggle('on', x === b));
    draw();
  });

  if (sport.kind === 'cycling') {
    grid.classList.add('single');
    grid.innerHTML = cyclingList();
    return {};
  }

  async function load() {
    data = await Promise.all(sport.leagues.map(l => (sport.kind === 'team' ? windowEvents(l.path) : espn.scoreboard(l.path)).then(d => ({ l, d }), err => ({ l, err }))));
    live = data.some(x => (x.d?.events || []).some(e => stateOf(e) === 'in' || hasLiveChild(e)));
    draw();
  }

  function draw() {
    const cards = data.map(({ l, d, err }) => {
      if (err) return card(l, `<div class="muted sm">${t('error')}</div>`, 0);
      const evs = (d.events || []).filter(e => filter === 'all' || stateOf(e) === filter || (filter === 'in' && hasLiveChild(e)));
      const nLive = (d.events || []).filter(e => stateOf(e) === 'in' || hasLiveChild(e)).length;
      if (!evs.length) return filter === 'all' ? card(l, `<div class="muted sm">${t('noMatches')}</div>`, 0, true) : '';
      return card(l, body(sport, l, evs), nLive);
    }).join('');
    grid.innerHTML = cards || `<div class="empty">${t('noMatches')}</div>`;
  }

  grid.innerHTML = loading();
  await load();
  return { refresh: load, isLive: () => live, interval: 20000 };
}

/** Matchs de J-3 à J+7 (le scoreboard par défaut d'ESPN ne donne qu'une journée). */
async function windowEvents(path) {
  const now = new Date(), from = new Date(now - 3 * 864e5), to = new Date(+now + 7 * 864e5);
  const months = [...new Set([from, now, to].map(ym))];
  const res = await Promise.all([espn.scoreboard(path, {}, 20), ...months.map(m => espn.scoreboard(path, { dates: m, limit: 400 }, 60).catch(() => ({ events: [] })))]);
  const byId = new Map();
  // le scoreboard du jour (plus frais) écrase les données du mois
  [...res.slice(1), res[0]].forEach(d => (d.events || []).forEach(e => byId.set(e.id, e)));
  return { events: [...byId.values()].filter(e => stateOf(e) === 'in' || (new Date(e.date) >= from && new Date(e.date) <= to)) };
}

function hasLiveChild(ev) {
  return (ev.groupings || []).some(g => g.competitions.some(c => c.status?.type?.state === 'in'))
    || (ev.competitions || []).length > 1 && ev.competitions.some(c => c.status?.type?.state === 'in');
}

function card(l, inner, nLive, dim = false) {
  return `<section class="card league ${dim ? 'dim' : ''}">
    <header><span class="flag">${l.flag}</span><a href="#/league/${l.path}"><h2>${esc(l.name)}</h2></a>
      ${nLive ? `<span class="badge live"><i></i>${nLive}</span>` : ''}
      ${favStar('league', { path: l.path })}
      <a class="more" href="#/league/${l.path}">${t('seeAll')} →</a></header>
    ${inner}</section>`;
}

function sortEvents(evs) {
  const order = { in: 0, pre: 1, post: 2 };
  return [...evs].sort((a, b) => order[stateOf(a)] - order[stateOf(b)] || (stateOf(a) === 'post' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)));
}

function body(sport, l, evs) {
  const list = sortEvents(evs);
  if (sport.kind === 'team') {
    return `<div class="rows">${list.slice(0, 12).map(e => matchRow(e, l.path)).join('')}</div>`;
  }
  return `<div class="rows">${list.slice(0, 6).map(e => eventRow(sport, l, e)).join('')}</div>`;
}

/** Ligne pour un tournoi / Grand Prix / gala / tournoi de golf. */
function eventRow(sport, l, e) {
  const st = stateOf(e);
  const dates = e.endDate && e.endDate.slice(0, 10) !== e.date.slice(0, 10) ? `${fmtShort(e.date)} – ${fmtShort(e.endDate)}` : `${fmtDay(e.date, { weekday: 'short' })} ${fmtTime(e.date)}`;
  let extra = '';
  if (sport.kind === 'tennis') {
    const comps = (e.groupings || []).flatMap(g => g.competitions);
    const lv = comps.filter(c => c.status?.type?.state === 'in');
    extra = lv.length ? `<div class="mini-live">${lv.slice(0, 4).map(c => tennisLine(c)).join('')}</div>` : `<small class="muted">${comps.length} matchs</small>`;
  } else if (sport.kind === 'golf') {
    const cs = (e.competitions?.[0]?.competitors || []).slice(0, 3);
    extra = cs.length ? `<div class="mini-live">${cs.map((c, i) => `<div class="tl"><span>${i + 1}. ${esc(c.athlete?.displayName)}</span><b>${esc(c.score ?? '')}</b></div>`).join('')}</div>` : '';
  } else if (sport.kind === 'mma') {
    extra = `<small class="muted">${(e.competitions || []).length} ${t('fights').toLowerCase()}</small>`;
  } else if (sport.kind === 'racing') {
    const ses = (e.competitions || []).map(c => `<span class="chip ${c.status?.type?.state}">${esc(c.type?.abbreviation || '')}</span>`).join('');
    extra = `<div class="chips">${ses}</div>`;
  }
  return `<a class="ev-row st-${st}" href="#/event/${l.path}/${e.id}">
    <div class="ev-main"><strong>${esc(e.name)}</strong><small>${esc(dates)}${e.venue?.fullName ? ' · ' + esc(e.venue.fullName) : ''}</small>${extra}</div>
    ${liveBadge(st, st === 'in' ? t('live') : st === 'post' ? t('ft') : statusLabel(e))}
  </a>`;
}

function tennisLine(c) {
  const [a, b] = c.competitors || [];
  const sets = x => (x?.linescores || []).map(s => s.value).join(' ');
  const nm = x => x?.athlete?.shortName || x?.athlete?.displayName || x?.roster?.shortDisplayName || '?';
  return `<div class="tl"><span>${logo(a?.athlete?.flag?.href, '', 'flag-img')}${esc(nm(a))}</span><b>${esc(sets(a))}</b></div>
          <div class="tl"><span>${logo(b?.athlete?.flag?.href, '', 'flag-img')}${esc(nm(b))}</span><b>${esc(sets(b))}</b></div>`;
}

function cyclingList() {
  const now = new Date();
  const groups = { in: [], pre: [], post: [] };
  CYCLING_RACES.forEach(r => groups[raceState(r, now)].push(r));
  groups.post.reverse();
  const row = r => {
    const st = raceState(r, now);
    const days = Math.ceil((new Date(r.start) - now) / 864e5);
    return `<a class="ev-row st-${st}" href="#/race/${r.id}">
      <div class="ev-main"><strong>${r.country} ${esc(r.name)}</strong>
      <small>${fmtShort(r.start)}${r.end !== r.start ? ' – ' + fmtShort(r.end) : ''} · ${r.stages ? `${r.stages} ${t('stages')}` : t(r.type === 'monument' ? 'race' : 'race')}${r.type === 'grandtour' ? ' · Grand Tour' : r.type === 'monument' ? ' · Monument' : ''}</small></div>
      ${st === 'pre' ? `<span class="badge pre">${t('in')} ${days} ${t('days')}</span>` : liveBadge(st)}
    </a>`;
  };
  return `<p class="note">ℹ️ ${t('cyclingNote')} <em>(${t('datesApprox')})</em></p>
    ${groups.in.length ? `<section class="card"><header><h2>● ${t('live')}</h2></header><div class="rows">${groups.in.map(row).join('')}</div></section>` : ''}
    <section class="card"><header><h2>${t('upcoming')}</h2></header><div class="rows">${groups.pre.map(row).join('')}</div></section>
    <section class="card dim"><header><h2>${t('finished')}</h2></header><div class="rows">${groups.post.map(row).join('')}</div></section>`;
}

SL.views['sport'] = { render };
Object.assign(SL, { windowEvents, tennisLine });
})();

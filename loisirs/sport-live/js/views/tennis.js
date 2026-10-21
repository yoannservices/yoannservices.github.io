/* Tournoi de tennis : matchs par tableau et par tour, score set par set en direct. */
(() => {
'use strict';
const { espn } = SL;
const { leagueOfPath } = SL;
const { t } = SL;
const { esc, loading, errorBox, logo, fmtShort, fmtTime, liveBadge, empty, tabs } = SL;

async function render(root, { path, id, tab, sport }) {
  const league = leagueOfPath(path);
  root.innerHTML = loading();
  let ev, group = 0, live = false;

  async function load() {
    const params = tab && /^\d{8}$/.test(tab) ? { dates: tab } : {};
    const d = await espn.scoreboard(path, params, 0);
    ev = (d.events || []).find(e => String(e.id) === String(id)) || (d.events || [])[0];
    if (!ev) throw new Error(t('noData'));
  }
  try { await load(); } catch (e) { root.innerHTML = errorBox(e); return; }

  function draw() {
    const groups = ev.groupings || [];
    const g = groups[group] || groups[0];
    const comps = g?.competitions || [];
    live = groups.some(x => x.competitions.some(c => c.status?.type?.state === 'in'));
    const rounds = new Map();
    // tours du plus avancé au premier, matchs en direct d'abord
    [...comps].sort((a, b) => Number(b.round?.id || 0) - Number(a.round?.id || 0)).forEach(c => {
      const k = c.round?.displayName || '';
      if (!rounds.has(k)) rounds.set(k, []);
      rounds.get(k).push(c);
    });
    const order = { in: 0, pre: 1, post: 2 };
    root.innerHTML = `
      <header class="page-h" style="--sc:${sport.color}">
        <button id="burger" class="burger" aria-label="Menu">☰</button>
        <a class="back" href="#/sport/${sport.id}">←</a><span class="page-ico">🎾</span>
        <div><h1>${esc(ev.name)}</h1><p>${esc(league.name)} · ${fmtShort(ev.date)} – ${fmtShort(ev.endDate || ev.date)} ${ev.venue?.fullName ? '· ' + esc(ev.venue.fullName) : ''}</p></div>
      </header>
      ${groups.length > 1 ? tabs(groups.map((x, i) => [String(i), x.grouping?.displayName]), String(group)) : ''}
      ${live ? `<section class="card"><header><h2>● ${t('liveNow')}</h2></header><div class="tgrid">${comps.filter(c => c.status?.type?.state === 'in').map(matchCard).join('')}</div></section>` : ''}
      ${[...rounds].map(([r, list]) => `<section class="card"><header><h2>${esc(r)}</h2><span class="muted sm">${list.length}</span></header>
        <div class="tgrid">${list.sort((a, b) => order[a.status?.type?.state] - order[b.status?.type?.state] || new Date(a.date) - new Date(b.date)).map(matchCard).join('')}</div></section>`).join('') || empty(t('noMatches'))}`;
    root.querySelector('.tabs')?.addEventListener('click', e => {
      const b = e.target.closest('[data-tab]'); if (!b) return;
      group = Number(b.dataset.tab); draw();
    });
  }
  draw();
  return { refresh: async () => { await load(); draw(); }, isLive: () => live, interval: 15000 };
}

function matchCard(c) {
  const st = c.status?.type?.state;
  const cs = [...(c.competitors || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  const nSets = Math.max(...cs.map(x => x.linescores?.length || 0), 0);
  const name = x => x.athlete?.displayName || x.roster?.displayName || (x.roster?.athletes || []).map(a => a.shortName).join(' / ') || 'TBD';
  const flag = x => x.athlete?.flag?.href || x.roster?.athletes?.[0]?.flag?.href;
  const row = x => `<tr class="${x.winner ? 'win' : ''}">
    <td class="l">${logo(flag(x), '', 'flag-img')}<span>${esc(name(x))}</span>${x.possession ? ' <span class="srv" title="Service">●</span>' : ''}</td>
    ${Array.from({ length: nSets }, (_, i) => { const s = x.linescores?.[i]; return `<td class="${s?.winner ? 'b' : ''}">${s ? esc(s.value) : ''}${s?.tiebreak != null ? `<sup>${esc(s.tiebreak)}</sup>` : ''}</td>`; }).join('')}</tr>`;
  return `<div class="tcard st-${st}">
    <div class="tc-h">${liveBadge(st, st === 'pre' ? fmtTime(c.date) : c.status?.type?.shortDetail)}<small class="muted">${esc(c.venue?.court || '')}</small></div>
    <table class="tscore">${cs.map(row).join('')}</table>
    ${c.notes?.[0]?.text && st === 'post' ? `<small class="muted">${esc(c.notes[0].text)}</small>` : ''}</div>`;
}

SL.views['tennis'] = { render };
})();

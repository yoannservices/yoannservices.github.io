/* Golf (leaderboard par tour) et MMA (carte des combats). */
(() => {
'use strict';
const { espn } = SL;
const { leagueOfPath } = SL;
const { t } = SL;
const { esc, loading, errorBox, logo, fmtShort, fmtTime, liveBadge, empty } = SL;

async function render(root, { path, id, tab, sport }) {
  const league = leagueOfPath(path);
  root.innerHTML = loading();
  let ev, live = false;
  async function load() {
    const params = tab && /^\d{8}$/.test(tab) ? { dates: tab } : {};
    const d = await espn.scoreboard(path, params, 0);
    ev = (d.events || []).find(e => String(e.id) === String(id)) || (d.events || [])[0];
    if (!ev) throw new Error(t('noData'));
  }
  try { await load(); } catch (e) { root.innerHTML = errorBox(e); return; }

  function draw() {
    const comps = ev.competitions || [];
    live = comps.some(c => c.status?.type?.state === 'in') || ev.status?.type?.state === 'in';
    root.innerHTML = `
      <header class="page-h" style="--sc:${sport.color}">
        <button id="burger" class="burger" aria-label="Menu">☰</button>
        <a class="back" href="#/sport/${sport.id}">←</a><span class="page-ico">${sport.icon}</span>
        <div><h1>${esc(ev.name)}</h1><p>${esc(league.name)} · ${fmtShort(ev.date)}${ev.endDate ? ' – ' + fmtShort(ev.endDate) : ''}</p></div>
        ${liveBadge(ev.status?.type?.state, ev.status?.type?.shortDetail || '')}
      </header>
      ${sport.kind === 'golf' ? golf(comps[0]) : mma(comps)}`;
  }
  draw();
  return { refresh: async () => { await load(); draw(); }, isLive: () => live, interval: 30000 };
}

function golf(c) {
  const cs = c?.competitors || [];
  if (!cs.length) return empty(t('noData'));
  const nR = Math.max(...cs.map(x => x.linescores?.length || 0));
  return `<section class="card table-card"><header><h2>${t('leaderboard')}</h2></header><div class="table-wrap"><table class="table">
    <thead><tr><th>${t('pos')}</th><th class="l">${t('players')}</th><th>${t('toPar')}</th>${Array.from({ length: nR }, (_, i) => `<th>R${i + 1}</th>`).join('')}</tr></thead>
    <tbody>${cs.map((x, i) => `<tr><td class="b">${esc(x.status?.position?.displayName || x.order || i + 1)}</td>
      <td class="l">${logo(x.athlete?.flag?.href, '', 'flag-img')}${esc(x.athlete?.displayName)}</td><td class="b">${esc(x.score ?? '')}</td>
      ${Array.from({ length: nR }, (_, r) => `<td>${esc(x.linescores?.[r]?.displayValue ?? x.linescores?.[r]?.value ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
}

function mma(comps) {
  if (!comps.length) return empty(t('noData'));
  return `<section class="card"><header><h2>${t('fights')}</h2></header><div class="tgrid">
    ${[...comps].reverse().map(c => {
      const st = c.status?.type?.state;
      const [a, b] = c.competitors || [];
      const f = x => `<div class="fighter ${x?.winner ? 'win' : ''}">${logo(x?.athlete?.flag?.href, '', 'flag-img')}<b>${esc(x?.athlete?.displayName || 'TBD')}</b><small class="muted">${esc(x?.records?.[0]?.summary || '')}</small></div>`;
      return `<div class="tcard st-${st}"><div class="tc-h">${liveBadge(st, st === 'pre' ? fmtTime(c.date) : c.status?.type?.shortDetail)}<small class="muted">${esc(c.type?.abbreviation || c.note || '')}</small></div>
        ${f(a)}<div class="vs">VS</div>${f(b)}
        ${st === 'post' && c.status?.result?.displayName ? `<small class="muted">${esc(c.status.result.displayName)} · R${esc(c.status.period)} ${esc(c.status.displayClock || '')}</small>` : ''}</div>`;
    }).join('')}</div></section>`;
}

SL.views['individual'] = { render };
})();

/* Match d'un sport d'équipe : score en direct, fil du match, compos, stats,
   joueurs, classement et (foot) simulation 3D. Panneaux personnalisables. */
(() => {
'use strict';
const { espn, teamsOf } = SL;
const { leagueOfPath } = SL;
const { t, getLang } = SL;
const { store } = SL;
const { esc, loading, errorBox, favStar, logo, teamLogo, fmtDay, fmtTime, statBar, tabs, empty, liveBadge } = SL;
const { standings } = SL;

const PANELS = ['timeline', 'lineups', 'stats', 'players', 'sim3d', 'standings'];

async function render(root, { path, id, tab, sport }) {
  const league = leagueOfPath(path);
  const soccer = sport.id === 'soccer';
  root.innerHTML = loading();
  let sum;
  try { sum = await espn.summary(path, id, 0); } catch (e) { root.innerHTML = errorBox(e); return; }

  let active = tab || 'timeline', viewer = null, director = null, lastScore = null;
  const panels = () => PANELS.filter(p => store.data.prefs.panels[p] !== false && (p !== 'sim3d' || soccer));

  root.innerHTML = `
    <header class="page-h slim" style="--sc:${sport.color}">
      <button id="burger" class="burger" aria-label="Menu">☰</button>
      <a class="back" href="#/league/${path}">←</a>
      <div><p>${sport.icon} ${esc(league?.name || '')}</p></div>
      <div class="h-actions">
        <button class="btn ghost sm" id="notifyBtn">🔔 ${t('notify')}</button>
        <details class="custom"><summary class="btn ghost sm">⚙️ ${t('customize')}</summary>
          <div class="custom-pop"><b>${t('panels')}</b>${PANELS.filter(p => p !== 'sim3d' || soccer).map(p => `<label><input type="checkbox" data-panel="${p}" ${store.data.prefs.panels[p] !== false ? 'checked' : ''}> ${t(p)}</label>`).join('')}</div>
        </details>
      </div>
    </header>
    <div id="score"></div>
    <div id="tabbar"></div>
    <div id="pane"></div>`;
  const $ = s => root.querySelector(s);

  $('.custom-pop').addEventListener('change', e => {
    const k = e.target.dataset.panel; if (!k) return;
    store.setPanel(k, e.target.checked);
    if (!panels().includes(active)) active = panels()[0] || 'timeline';
    drawTabs(); drawPane();
  });
  const nb = $('#notifyBtn');
  const paintNotify = () => { nb.classList.toggle('on', store.data.prefs.notify); nb.textContent = `🔔 ${store.data.prefs.notify ? t('notifyOn') : t('notify')}`; };
  paintNotify();
  nb.onclick = async () => {
    if (!store.data.prefs.notify && 'Notification' in window && Notification.permission === 'default') await Notification.requestPermission();
    store.setNotify(!store.data.prefs.notify); paintNotify();
  };

  function drawTabs() {
    $('#tabbar').innerHTML = tabs(panels().map(p => [p, t(p)]), active);
    $('#tabbar .tabs').onclick = e => {
      const b = e.target.closest('[data-tab]'); if (!b) return;
      active = b.dataset.tab;
      history.replaceState(null, '', `#/event/${path}/${id}/${active}`);
      drawTabs(); drawPane();
    };
  }

  function drawScore() {
    const comp = sum.header?.competitions?.[0] || {};
    const [home, away] = teamsOf(comp);
    const st = comp.status?.type || {};
    const info = sum.gameInfo || {};
    const side = c => `<div class="sb-team">
      ${logo(teamLogo(c?.team), c?.team?.abbreviation, 'logo xl')}
      <div class="sb-name">${esc(c?.team?.displayName)} ${favStar('team', { id: c?.team?.id, name: c?.team?.displayName, logo: teamLogo(c?.team), path })}</div>
      ${c?.record?.[0]?.summary ? `<small class="muted">${esc(c.record[0].summary)}</small>` : ''}
    </div>`;
    const sc = st.state === 'pre' ? `<div class="sb-vs">${fmtTime(comp.date)}</div>` : `<div class="sb-sc">${esc(home?.score ?? 0)}<span>-</span>${esc(away?.score ?? 0)}</div>`;
    const scorers = soccer ? goalLines(sum, home, away) : '';
    $('#score').innerHTML = `<section class="scoreboard st-${st.state}" style="--h:#${home?.team?.color || '334155'};--a:#${away?.team?.color || '334155'}">
      ${side(home)}
      <div class="sb-mid">${sc}${liveBadge(st.state, st.state === 'pre' ? fmtDay(comp.date, { weekday: 'short' }) : st.shortDetail)}
        ${home?.shootoutScore != null ? `<small>(t.a.b. ${home.shootoutScore}-${away.shootoutScore})</small>` : ''}</div>
      ${side(away)}
      ${scorers}
      <div class="sb-info">${info.venue?.fullName ? `🏟️ ${esc(info.venue.fullName)}` : ''}${info.attendance ? ` · 👥 ${Number(info.attendance).toLocaleString()}` : ''}${info.officials?.[0] ? ` · 🧑‍⚖️ ${esc(info.officials[0].displayName)}` : ''}</div>
    </section>`;
    // Alertes
    const score = `${home?.score}-${away?.score}`;
    if (lastScore && score !== lastScore && store.data.prefs.notify && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`${home?.team?.abbreviation} ${home?.score} - ${away?.score} ${away?.team?.abbreviation}`, { body: lastPlayText(sum), icon: teamLogo(home?.team) });
    }
    lastScore = score;
  }

  async function drawPane() {
    const pane = $('#pane');
    if (active !== 'sim3d' && viewer) { viewer.destroy(); viewer = null; }
    if (active === 'sim3d') return draw3d(pane);
    if (active === 'standings') { pane.innerHTML = loading(); try { const [h, a] = teamsOf(sum.header.competitions[0]); pane.innerHTML = await standings(path, [String(h?.team?.id), String(a?.team?.id)]); } catch (e) { pane.innerHTML = empty(t('noData')); } return; }
    pane.innerHTML = active === 'timeline' ? timeline(sum, soccer)
      : active === 'lineups' ? lineups(sum, soccer)
      : active === 'stats' ? teamStats(sum)
      : active === 'players' ? playerStats(sum, soccer) : '';
    pane.querySelectorAll('[data-seek]').forEach(b => b.onclick = () => {
      active = 'sim3d'; drawTabs(); drawPane().then(() => viewer?.seek(Number(b.dataset.seek)));
    });
  }

  async function draw3d(pane) {
    if (viewer) return;
    pane.innerHTML = loading();
    const { EspnDirector, mountViewer } = SL;
    director = new EspnDirector(sum);
    if (!director.geo.length) { pane.innerHTML = empty(t('noPos')); return; }
    pane.innerHTML = `<div id="v3"></div><p class="note">ℹ️ ${t('simNote')}</p>`;
    const [h, a] = teamsOf(sum.header.competitions[0]);
    viewer = await mountViewer(pane.querySelector('#v3'), director, [h?.team?.abbreviation || 'DOM', a?.team?.abbreviation || 'EXT']);
  }

  drawScore(); drawTabs(); await drawPane();

  return {
    interval: 15000,
    isLive: () => sum.header?.competitions?.[0]?.status?.type?.state === 'in',
    async refresh() {
      sum = await espn.summary(path, id, 0);
      drawScore();
      if (active === 'sim3d' && director) { director.update(sum); viewer?.update(director); }
      else if (active !== 'standings') await drawPane();
    },
    destroy() { viewer?.destroy(); },
  };
}

function lastPlayText(sum) {
  const k = sum.keyEvents?.filter(e => e.scoringPlay).at(-1) || sum.scoringPlays?.at(-1);
  return k?.text || '';
}

function goalLines(sum, home, away) {
  const goals = (sum.keyEvents || []).filter(e => e.scoringPlay);
  if (!goals.length) return '';
  const col = tid => goals.filter(g => String(g.team?.id) === String(tid)).map(g => `<div>⚽ ${esc(g.participants?.[0]?.athlete?.displayName || '')} ${esc(g.clock?.displayValue || '')}</div>`).join('');
  return `<div class="sb-goals"><div>${col(home?.team?.id)}</div><div></div><div class="r">${col(away?.team?.id)}</div></div>`;
}

/* ── Fil du match ── */
const ICON = { goal: '⚽', 'yellow-card': '🟨', 'red-card': '🟥', substitution: '🔁', kickoff: '🏁', 'halftime': '⏸', 'end-regular-time': '🏁', penalty: '🎯', 'own-goal': '⚽' };
function iconFor(type = '') {
  if (/goal/.test(type)) return '⚽';
  if (/yellow/.test(type)) return '🟨';
  if (/red/.test(type)) return '🟥';
  if (/sub/.test(type)) return '🔁';
  if (/shot|attempt/.test(type)) return '🎯';
  if (/corner/.test(type)) return '🚩';
  if (/foul/.test(type)) return '⚠️';
  if (/offside/.test(type)) return '🚫';
  return ICON[type] || '•';
}

function timeline(sum, soccer) {
  const comp = sum.header?.competitions?.[0] || {};
  const [home] = teamsOf(comp);
  const hid = String(home?.team?.id);
  let html = '';
  if (sum.winprobability?.length) html += winProb(sum);
  if (sum.drives?.current || sum.situation) html += nflSituation(sum);

  if (soccer) {
    const key = (sum.keyEvents || []).filter(e => e.type?.type !== 'kickoff' || e.period?.number === 1);
    const comm = sum.commentary || [];
    html += key.length ? `<section class="card"><header><h2>${t('bigPlays')}</h2></header><ol class="tline">
      ${[...key].reverse().map(e => {
        const isHome = String(e.team?.id) === hid;
        const pos = e.fieldPositionX != null;
        return `<li class="${e.team ? (isHome ? 'h' : 'a') : 'n'} ${e.scoringPlay ? 'goal' : ''}">
          <span class="tm">${esc(e.clock?.displayValue || '')}</span><span class="ic">${iconFor(e.type?.type)}</span>
          <div class="tx"><b>${esc(e.shortText || e.type?.text || '')}</b><small>${esc(e.text || '')}</small></div>
          ${pos ? `<button class="btn ghost xs" data-seek="${e.clock?.value || 0}" title="${t('showOnPitch')}">🎥</button>` : ''}</li>`;
      }).join('')}</ol></section>` : '';
    if (comm.length) html += `<section class="card"><header><h2>${t('timeline')}</h2></header><ol class="comm">
      ${[...comm].reverse().map(c => `<li><span class="tm">${esc(c.time?.displayValue || '')}</span><span class="ic">${iconFor(c.play?.type?.type)}</span><span>${esc(c.text)}</span></li>`).join('')}</ol></section>`;
  } else {
    const sp = sum.scoringPlays || [];
    if (sp.length) html += `<section class="card"><header><h2>${t('scoring')}</h2></header><ol class="tline">
      ${[...sp].reverse().map(p => `<li class="${String(p.team?.id) === hid ? 'h' : 'a'}"><span class="tm">${esc(p.period?.number ? `P${p.period.number}` : '')} ${esc(p.clock?.displayValue || '')}</span>
        ${logo(p.team?.logo || p.team?.logos?.[0]?.href, '', 'logo sm')}
        <div class="tx"><b>${esc(p.type?.text || '')}</b><small>${esc(p.text || '')}</small></div><span class="sc">${esc(p.homeScore ?? '')}-${esc(p.awayScore ?? '')}</span></li>`).join('')}</ol></section>`;
    const drives = [...(sum.drives?.previous || [])].reverse();
    if (drives.length) html += `<section class="card"><header><h2>${t('drives')}</h2></header><ol class="tline">
      ${drives.map(d => `<li class="${String(d.team?.id) === hid ? 'h' : 'a'}">${logo(d.team?.logos?.[0]?.href, '', 'logo sm')}
        <div class="tx"><b>${esc(d.displayResult || d.result || '')}</b><small>${esc(d.description || '')}</small></div></li>`).join('')}</ol></section>`;
    const plays = sum.plays ? [...sum.plays].reverse().slice(0, 80) : [];
    if (plays.length) html += `<section class="card"><header><h2>${t('timeline')}</h2></header><ol class="comm">
      ${plays.map(p => `<li><span class="tm">${esc(p.period?.displayValue || (p.period?.number ? 'P' + p.period.number : ''))} ${esc(p.clock?.displayValue || '')}</span><span>${esc(p.text)}</span><b>${esc(p.homeScore ?? '')}-${esc(p.awayScore ?? '')}</b></li>`).join('')}</ol></section>`;
  }
  return html || empty(t('noData'));
}

function winProb(sum) {
  const wp = sum.winprobability;
  const W = 600, H = 120;
  const pts = wp.map((p, i) => `${(i / (wp.length - 1 || 1)) * W},${H - p.homeWinPercentage * H}`).join(' ');
  const last = wp.at(-1).homeWinPercentage;
  const [home, away] = teamsOf(sum.header.competitions[0]);
  return `<section class="card"><header><h2>${t('winProb')}</h2><span class="muted sm">${esc(home?.team?.abbreviation)} ${(last * 100).toFixed(0)}% · ${esc(away?.team?.abbreviation)} ${((1 - last) * 100).toFixed(0)}%</span></header>
    <svg class="wp" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${t('winProb')}">
      <line x1="0" x2="${W}" y1="${H / 2}" y2="${H / 2}" class="mid"/>
      <polyline points="${pts}" fill="none" stroke="#${home?.team?.color || '60a5fa'}" stroke-width="2.5" vector-effect="non-scaling-stroke"/>
    </svg></section>`;
}

function nflSituation(sum) {
  const s = sum.situation || sum.drives?.current?.plays?.at(-1)?.end;
  const d = sum.drives?.current;
  if (!d && !s) return '';
  const yl = s?.yardLine ?? d?.end?.yardLine;
  return `<section class="card"><header><h2>🏈 ${esc(d?.team?.displayName || '')}</h2><span class="muted sm">${esc(s?.downDistanceText || s?.shortDownDistanceText || d?.description || '')}</span></header>
    ${yl != null ? `<div class="gridiron"><i style="left:${yl}%"></i>${Array.from({ length: 9 }, (_, i) => `<span style="left:${(i + 1) * 10}%">${(i + 1) * 10 > 50 ? 100 - (i + 1) * 10 : (i + 1) * 10}</span>`).join('')}</div>` : ''}
    ${d?.plays?.length ? `<ol class="comm">${[...d.plays].reverse().slice(0, 8).map(p => `<li><span>${esc(p.text)}</span></li>`).join('')}</ol>` : ''}</section>`;
}

/* ── Compositions ── */
function lineups(sum, soccer) {
  const rosters = sum.rosters || [];
  if (soccer && rosters.some(r => r.roster?.length)) {
    return `<div class="lineups">
      <section class="card"><header><h2>${t('field')}</h2></header>${pitchSvg(rosters)}</section>
      <div class="two">${rosters.map(r => `<section class="card"><header>${logo(teamLogo(r.team), '', 'logo sm')}<h2>${esc(r.team?.displayName)}</h2><span class="chip">${esc(r.formation || '')}</span></header>
        <ul class="plist">${(r.roster || []).filter(p => p.starter).map(pRow).join('')}</ul>
        <h4 class="muted">${t('subs')}</h4><ul class="plist bench">${(r.roster || []).filter(p => !p.starter).map(pRow).join('')}</ul></section>`).join('')}</div></div>`;
  }
  // autres sports : effectifs depuis la feuille de match
  const teams = sum.boxscore?.players || [];
  if (!teams.length) return empty(t('noData'));
  return `<div class="two">${teams.map(tm => {
    const ath = new Map();
    tm.statistics?.forEach(g => g.athletes?.forEach(a => ath.set(a.athlete.id, a)));
    return `<section class="card"><header>${logo(tm.team?.logo, '', 'logo sm')}<h2>${esc(tm.team?.displayName)}</h2></header>
      <ul class="plist">${[...ath.values()].map(a => `<li>${a.athlete.headshot?.href ? `<img class="hs" src="${esc(a.athlete.headshot.href)}" alt="" loading="lazy">` : ''}<span class="num">${esc(a.athlete.jersey || '')}</span><span>${esc(a.athlete.displayName)}</span><small class="muted">${esc(a.athlete.position?.abbreviation || '')}</small>${a.starter ? '<span class="chip">XI</span>' : ''}</li>`).join('')}</ul></section>`;
  }).join('')}</div>`;
}

function pRow(p) {
  const st = Object.fromEntries((p.stats || []).map(s => [s.name, s.value]));
  const ev = `${st.totalGoals ? '⚽'.repeat(Math.min(st.totalGoals, 4)) : ''}${st.yellowCards ? '🟨' : ''}${st.redCards ? '🟥' : ''}${p.subbedOut ? '🔻' : ''}${p.subbedIn ? '🔺' : ''}`;
  return `<li><span class="num">${esc(p.jersey || '')}</span><span>${esc(p.athlete?.displayName)}</span><small class="muted">${esc(p.position?.abbreviation || '')}</small><span class="evs">${ev}</span></li>`;
}

function pitchSvg(rosters) {
  // Dessine les deux équipes sur un terrain vertical, chacune dans sa moitié.
  const [home, away] = rosters;
  const W = 68, H = 105;
  const lines = r => String(r.formation || '4-4-2').split('-').map(Number);
  const place = (r, top) => {
    const st = (r.roster || []).filter(p => p.starter);
    if (!st.length) return '';
    const gk = st.find(p => p.position?.abbreviation === 'G') || st[0];
    const rest = st.filter(p => p !== gk).sort((a, b) => depth(a) - depth(b) || lat(b) - lat(a));
    const ls = lines(r); let k = 0;
    const color = '#' + (r.team?.color || (top ? 'e5e7eb' : '2563eb'));
    const dot = (p, x, y) => `<g transform="translate(${x},${y})"><circle r="2.6" fill="${color}" stroke="#fff" stroke-width=".4"/>
      <text y=".9" text-anchor="middle" font-size="2.4" font-weight="700" fill="${contrast(color)}">${esc(p.jersey || '')}</text>
      <text y="5.2" text-anchor="middle" font-size="2" fill="#fff">${esc((p.athlete?.lastName || p.athlete?.shortName || '').slice(0, 14))}</text></g>`;
    let out = dot(gk, W / 2, top ? 5 : H - 5);
    ls.forEach((n, li) => {
      const grp = rest.slice(k, k + n); k += n;
      const y = 14 + (li * 34) / Math.max(1, ls.length - 1);
      grp.forEach((p, i) => {
        const x = (W / (n + 1)) * (i + 1);
        out += dot(p, top ? W - x : x, top ? y : H - y);
      });
    });
    return out;
  };
  return `<svg class="pitch2d" viewBox="-2 -2 ${W + 4} ${H + 4}" role="img" aria-label="${t('lineups')}">
    <rect x="0" y="0" width="${W}" height="${H}" rx="1" class="grass"/>
    <g class="pl"><rect x="0" y="0" width="${W}" height="${H}"/><line x1="0" y1="${H / 2}" x2="${W}" y2="${H / 2}"/><circle cx="${W / 2}" cy="${H / 2}" r="9.15"/>
    <rect x="${W / 2 - 20.16}" y="0" width="40.32" height="16.5"/><rect x="${W / 2 - 20.16}" y="${H - 16.5}" width="40.32" height="16.5"/>
    <rect x="${W / 2 - 9.16}" y="0" width="18.32" height="5.5"/><rect x="${W / 2 - 9.16}" y="${H - 5.5}" width="18.32" height="5.5"/></g>
    ${away ? place(away, true) : ''}${home ? place(home, false) : ''}</svg>`;
}
const DEP = { G: 0, 'CD-L': 1, 'CD-R': 1, CD: 1, LB: 1, RB: 1, LWB: 1.5, RWB: 1.5, DM: 2, LM: 3, RM: 3, CM: 3, 'CM-L': 3, 'CM-R': 3, AM: 4, 'AM-L': 4, 'AM-R': 4, LW: 4.5, RW: 4.5, F: 5, 'CF-L': 5, 'CF-R': 5 };
const depth = p => DEP[p.position?.abbreviation] ?? 3;
const lat = p => { const a = p.position?.abbreviation || ''; return /^L|-L$/.test(a) ? (/^L/.test(a) ? 2 : 1) : /^R|-R$/.test(a) ? (/^R/.test(a) ? -2 : -1) : 0; };
function contrast(hex) {
  const n = parseInt(hex.slice(1), 16); const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return r * 0.3 + g * 0.59 + b * 0.11 > 150 ? '#111' : '#fff';
}

/* ── Stats d'équipe ── */
function teamStats(sum) {
  const teams = sum.boxscore?.teams || [];
  if (teams.length < 2 || !teams[0].statistics?.length) return empty(t('noData'));
  const comp = sum.header?.competitions?.[0];
  const [home] = teamsOf(comp);
  const [A, B] = String(teams[0].team?.id) === String(home?.team?.id) ? teams : [teams[1], teams[0]];
  const bm = new Map(B.statistics.map(s => [s.name, s]));
  const pct = /Pct$|possession/i;
  return `<section class="card"><header>${logo(teamLogo(A.team), '', 'logo sm')}<h2>${esc(A.team?.abbreviation)} — ${esc(B.team?.abbreviation)}</h2>${logo(teamLogo(B.team), '', 'logo sm')}</header>
    <div class="sbars" style="--h:#${A.team?.color || '60a5fa'};--a:#${B.team?.color || 'e5e7eb'}">
    ${A.statistics.filter(s => bm.has(s.name) && s.displayValue !== undefined).map(s => {
      const b = bm.get(s.name);
      const isPct = pct.test(s.name) && s.name === 'possessionPct';
      return statBar(s.label || s.name, s.displayValue, b.displayValue, isPct);
    }).join('')}</div></section>`;
}

/* ── Stats individuelles ── */
function playerStats(sum, soccer) {
  if (soccer) {
    const rs = sum.rosters || [];
    if (!rs.some(r => r.roster?.some(p => p.stats?.length))) return empty(t('noData'));
    const cols = ['totalGoals', 'goalAssists', 'totalShots', 'shotsOnTarget', 'foulsCommitted', 'foulsSuffered', 'offsides', 'saves', 'yellowCards', 'redCards'];
    return rs.map(r => {
      const ps = (r.roster || []).filter(p => p.starter || p.subbedIn);
      const have = cols.filter(c => ps.some(p => p.stats?.some(s => s.name === c)));
      const ab = c => ps.flatMap(p => p.stats || []).find(s => s.name === c)?.abbreviation || c;
      return `<section class="card table-card"><header>${logo(teamLogo(r.team), '', 'logo sm')}<h2>${esc(r.team?.displayName)}</h2></header><div class="table-wrap"><table class="table">
        <thead><tr><th>#</th><th class="l">${t('players')}</th>${have.map(c => `<th>${esc(ab(c))}</th>`).join('')}</tr></thead>
        <tbody>${ps.map(p => `<tr><td>${esc(p.jersey)}</td><td class="l">${esc(p.athlete?.displayName)} <small class="muted">${esc(p.position?.abbreviation || '')}</small></td>
          ${have.map(c => { const v = p.stats?.find(s => s.name === c)?.displayValue ?? ''; return `<td class="${v && v !== '0' ? 'b' : 'muted'}">${esc(v)}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div></section>`;
    }).join('');
  }
  const teams = sum.boxscore?.players || [];
  if (!teams.length) return empty(t('noData'));
  return teams.map(tm => tm.statistics.map(g => `<section class="card table-card"><header>${logo(tm.team?.logo, '', 'logo sm')}<h2>${esc(tm.team?.abbreviation)} · ${esc(g.text || g.name || '')}</h2></header>
    <div class="table-wrap"><table class="table"><thead><tr><th class="l">${t('players')}</th>${(g.labels || []).map(l => `<th>${esc(l)}</th>`).join('')}</tr></thead>
    <tbody>${(g.athletes || []).map(a => `<tr><td class="l">${esc(a.athlete.shortName || a.athlete.displayName)}</td>${(a.stats || []).map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}
    ${g.totals?.length ? `<tr class="tot"><td class="l">Total</td>${g.totals.map(v => `<td>${esc(v)}</td>`).join('')}</tr>` : ''}</tbody></table></div></section>`).join('')).join('');
}

SL.views['match'] = { render };
})();

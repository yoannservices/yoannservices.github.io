/* Petits utilitaires d'affichage partagés par les vues. */
(() => {
'use strict';
const { t, locale } = SL;
const { stateOf, statusLabel, teamsOf } = SL;
const { store } = SL;

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const loading = () => `<div class="loading"><span class="spin"></span>${t('loading')}</div>`;
const errorBox = (e, retry = true) => `<div class="empty err">⚠️ ${t('error')}<small>${esc(e?.message || e)}</small>${retry ? `<button class="btn" data-retry>${t('retry')}</button>` : ''}</div>`;
const empty = msg => `<div class="empty">${esc(msg)}</div>`;

function fmtTime(d) { return new Date(d).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' }); }
function fmtDay(d, opts = {}) {
  return new Date(d).toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long', ...opts });
}
function fmtShort(d) { return new Date(d).toLocaleDateString(locale(), { day: 'numeric', month: 'short' }); }
function sameDay(a, b) { a = new Date(a); b = new Date(b); return a.toDateString() === b.toDateString(); }

function logo(url, alt = '', cls = 'logo') {
  return url ? `<img class="${cls}" src="${esc(url)}" alt="${esc(alt)}" loading="lazy" onerror="this.style.visibility='hidden'">` : `<span class="${cls} ph">${esc((alt || '?')[0])}</span>`;
}

function teamLogo(team) {
  return team?.logo || team?.logos?.[0]?.href || '';
}

function favStar(kind, payload) {
  const on = kind === 'team' ? store.isFavTeam(payload.id) : store.isFavLeague(payload.path);
  return `<button class="star ${on ? 'on' : ''}" data-fav="${kind}" data-payload="${esc(JSON.stringify(payload))}" title="${on ? t('removeFav') : t('addFav')}" aria-pressed="${on}">${on ? '★' : '☆'}</button>`;
}

function liveBadge(state, label) {
  if (state === 'in') return `<span class="badge live"><i></i>${esc(label || t('live'))}</span>`;
  if (state === 'post') return `<span class="badge post">${esc(label || t('ft'))}</span>`;
  return `<span class="badge pre">${esc(label)}</span>`;
}

/** Ligne de match compacte (sports d'équipe). */
function matchRow(ev, path) {
  const comp = ev.competitions?.[0] || {};
  const [home, away] = teamsOf(comp);
  const st = stateOf(ev);
  const showScore = st !== 'pre';
  const day = sameDay(ev.date, new Date()) ? '' : new Date(ev.date).toLocaleDateString(locale(), { weekday: 'short', day: 'numeric' }) + ' · ';
  const lbl = st === 'pre' ? day + fmtTime(ev.date) : st === 'post' && day ? day + statusLabel(ev) : statusLabel(ev);
  const side = c => {
    const win = st === 'post' && c?.winner;
    return `<div class="mr-team ${win ? 'win' : ''}">${logo(teamLogo(c?.team), c?.team?.abbreviation)}<span class="nm">${esc(c?.team?.shortDisplayName || c?.team?.displayName || c?.athlete?.displayName || '?')}</span>${showScore ? `<b class="sc">${esc(c?.score ?? '')}</b>` : ''}</div>`;
  };
  return `<a class="match-row st-${st}" href="#/event/${path}/${ev.id}">
    <div class="mr-time">${st === 'in' ? `<span class="badge live"><i></i>${esc(lbl)}</span>` : esc(lbl)}</div>
    <div class="mr-teams">${side(home)}${side(away)}</div>
  </a>`;
}

/** Barre comparative (stats d'équipe). */
function statBar(label, a, b, pct = false) {
  const na = parseFloat(a) || 0, nb = parseFloat(b) || 0;
  const tot = na + nb || 1;
  const fa = pct ? na : (na / tot) * 100;
  return `<div class="sbar"><div class="sbar-h"><b>${esc(a)}</b><span>${esc(label)}</span><b>${esc(b)}</b></div>
    <div class="sbar-t"><i style="width:${fa}%"></i><i style="width:${pct ? nb : 100 - fa}%"></i></div></div>`;
}

function tabs(list, active) {
  return `<div class="tabs" role="tablist">${list.map(([k, label]) => `<button role="tab" data-tab="${k}" class="${k === active ? 'on' : ''}" aria-selected="${k === active}">${esc(label)}</button>`).join('')}</div>`;
}

Object.assign(SL, { esc, fmtTime, fmtDay, fmtShort, sameDay, logo, teamLogo, favStar, liveBadge, matchRow, statBar, tabs, loading, errorBox, empty });
})();

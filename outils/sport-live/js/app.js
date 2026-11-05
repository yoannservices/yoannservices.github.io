/* Sport Live — routeur, panneau latéral et rafraîchissement automatique. */
(() => {
'use strict';
const { SPORTS } = SL;
const { t, getLang, setLang, locale } = SL;
const { store, googleEnabled, renderGoogleButton } = SL;
const { esc, errorBox } = SL;

const VIEWS = {
  home: () => SL.views.home,
  sport: () => SL.views.sport,
  league: () => SL.views.league,
  event: () => SL.views.event,
  replay: () => SL.views.replay,
  race: () => SL.views.cycling,
};

const main = document.getElementById('main');
const side = document.getElementById('side');
let current = null, timer = null, routeId = 0;

/* ── Routage par hash : #/sport/soccer, #/league/soccer/fra.1, #/event/soccer/fra.1/123 ── */
function parse() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [name, ...rest] = parts;
  switch (name) {
    case 'sport': return { view: 'sport', params: { id: rest[0] } };
    case 'league': return { view: 'league', params: { path: rest.slice(0, 2).join('/') } };
    case 'event': return { view: 'event', params: { path: rest.slice(0, 2).join('/'), id: rest[2], tab: rest[3] } };
    case 'replay': return { view: 'replay', params: { id: rest[0] } };
    case 'race': return { view: 'race', params: { id: rest[0] } };
    default: return { view: 'home', params: {} };
  }
}

async function route() {
  const id = ++routeId;
  clearInterval(timer);
  try { current?.destroy?.(); } catch { /* ignore */ }
  current = null;
  const { view, params } = parse();
  highlightNav(view, params);
  document.body.classList.remove('nav-open');
  main.scrollTop = 0; window.scrollTo(0, 0);
  main.innerHTML = '';
  try {
    const mod = await VIEWS[view]();
    if (id !== routeId) return;
    const ctl = await mod.render(main, params);
    if (id !== routeId) { ctl?.destroy?.(); return; }
    current = ctl || null;
    if (ctl?.refresh) {
      timer = setInterval(() => {
        if (document.hidden || !ctl.isLive?.()) return; // n'actualise que les directs
        ctl.refresh().then(stamp).catch(() => {});
      }, ctl.interval || 15000);
    }
    stamp();
  } catch (e) {
    console.error(e);
    if (id === routeId) main.innerHTML = errorBox(e);
  }
}

function stamp() {
  const el = document.getElementById('stamp');
  if (el) el.textContent = `${t('updated')} ${new Date().toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
}

/* ── Panneau latéral ── */
function renderSide() {
  const u = store.user;
  side.innerHTML = `
    <div class="brand"><span class="brand-ico">📡</span><div><strong>${t('appName')}</strong><small id="stamp"></small></div></div>
    <nav class="nav">
      <a href="#/" data-nav="home"><span>⭐</span>${t('myFeed')}</a>
      <a href="#/replay" data-nav="replay"><span>🎥</span>${t('sim3d')}</a>
      <div class="nav-h">${t('sports')}</div>
      ${SPORTS.map(s => `<a href="#/sport/${s.id}" data-nav="sport:${s.id}" style="--sc:${s.color}"><span>${s.icon}</span>${esc(s.name[getLang()])}</a>`).join('')}
    </nav>
    <div class="side-foot">
      <div class="lang seg" role="group" aria-label="${t('language')}">
        <button data-lang="fr" class="${getLang() === 'fr' ? 'on' : ''}">FR</button>
        <button data-lang="en" class="${getLang() === 'en' ? 'on' : ''}">EN</button>
      </div>
      <div class="account">
        ${u ? `<div class="user">${u.picture ? `<img src="${esc(u.picture)}" alt="" referrerpolicy="no-referrer">` : ''}<div><b>${esc(u.name)}</b><small>${esc(u.email || '')}</small></div></div>
              <button class="btn ghost sm" data-logout>${t('logout')}</button>`
            : `<div id="gbtn"></div>${googleEnabled ? '' : `<p class="hint">${t('configLogin')}</p>`}`}
      </div>
    </div>`;
  if (!u) renderGoogleButton(side.querySelector('#gbtn'), getLang());
  highlightNav(parse().view, parse().params);
}

function highlightNav(view, params) {
  const key = view === 'sport' ? `sport:${params.id}` : view === 'home' ? 'home' : view === 'replay' ? 'replay' : null;
  let k = key;
  if (!k && params.path) {
    const s = SPORTS.find(x => x.leagues.some(l => l.path === params.path));
    if (s) k = `sport:${s.id}`;
  }
  if (view === 'race') k = 'sport:cycling';
  side.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === k));
}

/* ── Délégation d'événements globaux ── */
document.addEventListener('click', e => {
  const fav = e.target.closest('[data-fav]');
  if (fav) {
    e.preventDefault(); e.stopPropagation();
    const p = JSON.parse(fav.dataset.payload);
    if (fav.dataset.fav === 'team') store.toggleTeam(p); else store.toggleLeague(p.path);
    const on = fav.dataset.fav === 'team' ? store.isFavTeam(p.id) : store.isFavLeague(p.path);
    document.querySelectorAll(`[data-fav="${fav.dataset.fav}"]`).forEach(b => {
      const q = JSON.parse(b.dataset.payload);
      if ((q.id ?? q.path) !== (p.id ?? p.path)) return;
      b.classList.toggle('on', on); b.textContent = on ? '★' : '☆'; b.title = on ? t('removeFav') : t('addFav');
    });
    return;
  }
  if (e.target.closest('[data-retry]')) { route(); return; }
  if (e.target.closest('[data-logout]')) { store.signOut(); return; }
  const lang = e.target.closest('[data-lang]');
  if (lang) { setLang(lang.dataset.lang); renderSide(); route(); return; }
  if (e.target.closest('#burger')) document.body.classList.toggle('nav-open');
  else if (e.target.closest('.scrim')) document.body.classList.remove('nav-open');
});

let lastUser = store.user?.sub;
store.onChange(() => {
  if (store.user?.sub !== lastUser) { lastUser = store.user?.sub; renderSide(); if (parse().view === 'home') route(); }
});

window.addEventListener('hashchange', route);
renderSide();
route();


})();

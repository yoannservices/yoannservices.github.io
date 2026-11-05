/* Profil utilisateur : connexion Google (Google Identity Services) et
   favoris / préférences enregistrés sur l'appareil, par compte. */
(() => {
'use strict';
const { GOOGLE_CLIENT_ID } = SL;

const USER_KEY = 'sportlive:user';
const listeners = new Set();

function read(k, def) {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; }
}
function write(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* stockage indisponible */ }
}

let user = read(USER_KEY, null);
const dataKey = () => `sportlive:data:${user ? user.sub : 'guest'}`;
const DEFAULT = { teams: [], leagues: [], prefs: { panels: { timeline: true, lineups: true, stats: true, players: true, sim3d: true, standings: true }, notify: false } };
let data = load();

function load() {
  const d = read(dataKey(), null);
  return d ? { ...DEFAULT, ...d, prefs: { ...DEFAULT.prefs, ...d.prefs, panels: { ...DEFAULT.prefs.panels, ...(d.prefs || {}).panels } } } : structuredClone(DEFAULT);
}
function save() { write(dataKey(), data); listeners.forEach(f => f()); }

const store = {
  get user() { return user; },
  get data() { return data; },
  onChange(f) { listeners.add(f); return () => listeners.delete(f); },

  isFavTeam(id) { return data.teams.some(t => t.id === String(id)); },
  toggleTeam(team) {
    const id = String(team.id);
    if (this.isFavTeam(id)) data.teams = data.teams.filter(t => t.id !== id);
    else data.teams.push({ id, name: team.name, logo: team.logo || '', path: team.path });
    save();
  },
  isFavLeague(path) { return data.leagues.includes(path); },
  toggleLeague(path) {
    data.leagues = this.isFavLeague(path) ? data.leagues.filter(p => p !== path) : [...data.leagues, path];
    save();
  },
  setPanel(k, v) { data.prefs.panels[k] = v; save(); },
  setNotify(v) { data.prefs.notify = v; save(); },

  signIn(u) {
    // Les favoris invité sont repris dans le compte au premier login
    const guest = data;
    user = u; write(USER_KEY, u);
    data = load();
    if (!read(dataKey(), null)) data = guest;
    save();
  },
  signOut() {
    user = null;
    try { localStorage.removeItem(USER_KEY); } catch { /* ignore */ }
    if (window.google?.accounts?.id) google.accounts.id.disableAutoSelect();
    data = load(); save();
  },
};

/* ── Google Identity Services ── */
const googleEnabled = !!GOOGLE_CLIENT_ID;

function decodeJwt(token) {
  const b = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(atob(b).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''));
  return JSON.parse(json);
}

let gisReady = null;
function loadGis() {
  if (gisReady) return gisReady;
  gisReady = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  }).then(() => {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: r => {
        const p = decodeJwt(r.credential);
        store.signIn({ sub: p.sub, name: p.name, email: p.email, picture: p.picture });
      },
      auto_select: true,
    });
  });
  return gisReady;
}

/** Affiche le bouton Google dans `el` (si un Client ID est configuré). */
async function renderGoogleButton(el, locale) {
  if (!googleEnabled) return false;
  try {
    await loadGis();
    google.accounts.id.renderButton(el, { theme: 'filled_black', size: 'medium', shape: 'pill', locale, text: 'signin_with' });
    return true;
  } catch {
    return false;
  }
}

Object.assign(SL, { renderGoogleButton, store, googleEnabled });
})();

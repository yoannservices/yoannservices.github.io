/* Accès aux API publiques gratuites (sans clé) :
   - ESPN (site.api.espn.com) : scores, compos, stats, fil du match, classements
   - OpenF1 (api.openf1.org) : positions des F1 sur le circuit
   - StatsBomb Open Data (GitHub) : tracking 360 pour les replays 3D
   - Wikipédia : présentation des courses cyclistes */
(() => {
'use strict';

const ESPN = 'https://site.api.espn.com/apis/site/v2/sports/';
const ESPN_V2 = 'https://site.api.espn.com/apis/v2/sports/';
const OPENF1 = 'https://api.openf1.org/v1/';
const SB = 'https://raw.githubusercontent.com/statsbomb/open-data/master/data/';

const cache = new Map();

/** fetch JSON avec cache mémoire ; ttl en secondes (0 = toujours recharger) */
async function getJSON(url, ttl = 30) {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.t < ttl * 1000) return hit.p;
  const p = fetch(url).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });
  cache.set(url, { t: Date.now(), p });
  p.catch(() => cache.delete(url));
  return p;
}

const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'fr');

const espn = {
  scoreboard(path, params = {}, ttl = 20) {
    const q = new URLSearchParams({ lang: lang(), region: lang() === 'fr' ? 'fr' : 'gb', ...params });
    return getJSON(`${ESPN}${path}/scoreboard?${q}`, ttl);
  },
  summary(path, id, ttl = 10) {
    return getJSON(`${ESPN}${path}/summary?event=${id}&lang=${lang()}`, ttl);
  },
  standings(path) {
    return getJSON(`${ESPN_V2}${path}/standings?lang=${lang()}`, 600);
  },
};

/* OpenF1 limite à quelques requêtes par seconde : file d'attente + reprise sur 429. */
let f1Queue = Promise.resolve();
const wait = ms => new Promise(r => setTimeout(r, ms));
async function f1Fetch(url) {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url);
    if (r.status === 429) { await wait(1200 * (i + 1)); continue; }
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }
  throw new Error('HTTP 429');
}
const openf1 = {
  get(endpoint, params = {}, ttl = 3600) {
    const q = Object.entries(params).map(([k, v]) => `${k}${/[<>]$/.test(k) ? '' : '='}${encodeURIComponent(v)}`).join('&');
    const url = `${OPENF1}${endpoint}?${q}`;
    const hit = cache.get(url);
    if (hit && Date.now() - hit.t < ttl * 1000) return hit.p;
    const p = f1Queue.then(() => f1Fetch(url));
    f1Queue = p.catch(() => {}).then(() => wait(400));
    cache.set(url, { t: Date.now(), p });
    p.catch(() => cache.delete(url));
    return p;
  },
};

const statsbomb = {
  events: id => getJSON(`${SB}events/${id}.json`, 86400),
  frames: id => getJSON(`${SB}three-sixty/${id}.json`, 86400),
  lineups: id => getJSON(`${SB}lineups/${id}.json`, 86400),
};

async function wikiSummary(title, l = lang()) {
  try {
    return await getJSON(`https://${l}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`, 86400);
  } catch {
    return null;
  }
}

/* ── Helpers de lecture des réponses ESPN ── */

function stateOf(ev) {
  const st = (ev.status || ev.competitions?.[0]?.status)?.type || {};
  return st.state || 'pre'; // pre | in | post
}

function statusLabel(ev) {
  const s = ev.status || ev.competitions?.[0]?.status || {};
  return s.type?.shortDetail || s.type?.detail || s.type?.description || '';
}

/** Ramène les deux équipes d'un match (domicile d'abord). */
function teamsOf(comp) {
  const cs = comp?.competitors || [];
  const home = cs.find(c => c.homeAway === 'home') || cs[0];
  const away = cs.find(c => c.homeAway === 'away') || cs[1];
  return [home, away].filter(Boolean);
}

function ymd(d) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}
function ym(d) { return ymd(d).slice(0, 6); }

Object.assign(SL, { getJSON, wikiSummary, stateOf, statusLabel, teamsOf, ymd, ym, espn, openf1, statsbomb });
})();

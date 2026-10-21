/* Catalogue des sports et compétitions.
   `kind` choisit la vue : team (match entre deux équipes), tennis, racing,
   golf, mma, cycling. `path` = sport/ligue de l'API publique ESPN. */
(() => {
'use strict';

const SPORTS = [
  {
    id: 'soccer', icon: '⚽', name: { fr: 'Football', en: 'Soccer' }, kind: 'team', color: '#22c55e',
    leagues: [
      { path: 'soccer/fra.1', name: 'Ligue 1', flag: '🇫🇷' },
      { path: 'soccer/eng.1', name: 'Premier League', flag: '🏴' },
      { path: 'soccer/esp.1', name: 'LaLiga', flag: '🇪🇸' },
      { path: 'soccer/ita.1', name: 'Serie A', flag: '🇮🇹' },
      { path: 'soccer/ger.1', name: 'Bundesliga', flag: '🇩🇪' },
      { path: 'soccer/uefa.champions', name: 'Ligue des champions', flag: '🇪🇺' },
      { path: 'soccer/uefa.europa', name: 'Ligue Europa', flag: '🇪🇺' },
      { path: 'soccer/uefa.europa.conf', name: 'Conference League', flag: '🇪🇺' },
      { path: 'soccer/uefa.nations', name: 'Ligue des nations', flag: '🌍' },
      { path: 'soccer/fifa.worldq.uefa', name: 'Qualif. Coupe du monde', flag: '🌍' },
      { path: 'soccer/fra.2', name: 'Ligue 2', flag: '🇫🇷' },
      { path: 'soccer/por.1', name: 'Liga Portugal', flag: '🇵🇹' },
      { path: 'soccer/ned.1', name: 'Eredivisie', flag: '🇳🇱' },
      { path: 'soccer/usa.1', name: 'MLS', flag: '🇺🇸' },
      { path: 'soccer/bra.1', name: 'Brasileirão', flag: '🇧🇷' },
    ],
  },
  {
    id: 'tennis', icon: '🎾', name: { fr: 'Tennis', en: 'Tennis' }, kind: 'tennis', color: '#eab308',
    leagues: [
      { path: 'tennis/atp', name: 'ATP', flag: '♂' },
      { path: 'tennis/wta', name: 'WTA', flag: '♀' },
    ],
  },
  {
    id: 'cycling', icon: '🚴', name: { fr: 'Cyclisme', en: 'Cycling' }, kind: 'cycling', color: '#f59e0b',
    leagues: [{ path: 'cycling/uci', name: 'UCI WorldTour', flag: '🌍' }],
  },
  {
    id: 'nfl', icon: '🏈', name: { fr: 'Football américain', en: 'American football' }, kind: 'team', color: '#a16207',
    leagues: [
      { path: 'football/nfl', name: 'NFL', flag: '🇺🇸' },
      { path: 'football/college-football', name: 'NCAA Football', flag: '🇺🇸' },
    ],
  },
  {
    id: 'basketball', icon: '🏀', name: { fr: 'Basket', en: 'Basketball' }, kind: 'team', color: '#f97316',
    leagues: [
      { path: 'basketball/nba', name: 'NBA', flag: '🇺🇸' },
      { path: 'basketball/wnba', name: 'WNBA', flag: '🇺🇸' },
      { path: 'basketball/mens-college-basketball', name: 'NCAA', flag: '🇺🇸' },
    ],
  },
  {
    id: 'f1', icon: '🏎️', name: { fr: 'Sport auto', en: 'Motorsport' }, kind: 'racing', color: '#ef4444',
    leagues: [
      { path: 'racing/f1', name: 'Formule 1', flag: '🏁' },
      { path: 'racing/irl', name: 'IndyCar', flag: '🇺🇸' },
      { path: 'racing/nascar-premier', name: 'NASCAR Cup', flag: '🇺🇸' },
    ],
  },
  {
    id: 'rugby', icon: '🏉', name: { fr: 'Rugby', en: 'Rugby' }, kind: 'team', color: '#10b981',
    leagues: [
      { path: 'rugby/270559', name: 'Top 14', flag: '🇫🇷' },
      { path: 'rugby/271937', name: 'Champions Cup', flag: '🇪🇺' },
      { path: 'rugby/180659', name: 'Six Nations', flag: '🌍' },
      { path: 'rugby/267979', name: 'Premiership', flag: '🏴' },
      { path: 'rugby/270557', name: 'URC', flag: '🌍' },
      { path: 'rugby/242041', name: 'Super Rugby', flag: '🌏' },
      { path: 'rugby/289234', name: 'Tests internationaux', flag: '🌍' },
    ],
  },
  {
    id: 'hockey', icon: '🏒', name: { fr: 'Hockey', en: 'Hockey' }, kind: 'team', color: '#38bdf8',
    leagues: [{ path: 'hockey/nhl', name: 'NHL', flag: '🇺🇸' }],
  },
  {
    id: 'baseball', icon: '⚾', name: { fr: 'Baseball', en: 'Baseball' }, kind: 'team', color: '#f43f5e',
    leagues: [{ path: 'baseball/mlb', name: 'MLB', flag: '🇺🇸' }],
  },
  {
    id: 'golf', icon: '⛳', name: { fr: 'Golf', en: 'Golf' }, kind: 'golf', color: '#84cc16',
    leagues: [
      { path: 'golf/pga', name: 'PGA Tour', flag: '🇺🇸' },
      { path: 'golf/eur', name: 'DP World Tour', flag: '🇪🇺' },
      { path: 'golf/lpga', name: 'LPGA', flag: '♀' },
    ],
  },
  {
    id: 'mma', icon: '🥊', name: { fr: 'MMA', en: 'MMA' }, kind: 'mma', color: '#dc2626',
    leagues: [{ path: 'mma/ufc', name: 'UFC', flag: '🌍' }],
  },
  {
    id: 'afl', icon: '🦘', name: { fr: 'Football australien', en: 'Aussie rules' }, kind: 'team', color: '#c084fc',
    leagues: [{ path: 'australian-football/afl', name: 'AFL', flag: '🇦🇺' }],
  },
];

function sportById(id) { return SPORTS.find(s => s.id === id); }
function sportOfPath(path) { return SPORTS.find(s => s.leagues.some(l => l.path === path)); }
function leagueOfPath(path) {
  for (const s of SPORTS) { const l = s.leagues.find(x => x.path === path); if (l) return l; }
  return null;
}

Object.assign(SL, { sportById, sportOfPath, leagueOfPath, SPORTS });
})();

/* Traductions FR / EN. t('clé') renvoie le texte dans la langue choisie. */
(() => {
'use strict';

const DICT = {
  fr: {
    appName: 'Sport Live', myFeed: 'Mon suivi', sports: 'Sports', live: 'En direct', upcoming: 'À venir',
    finished: 'Terminés', today: "Aujourd'hui", noMatches: 'Aucun match sur cette période.', loading: 'Chargement…',
    error: 'Impossible de charger les données', retry: 'Réessayer', back: 'Retour', competitions: 'Compétitions',
    seeAll: 'Tout voir', standings: 'Classement', summary: 'Résumé', lineups: 'Compos', stats: 'Stats',
    players: 'Joueurs', timeline: 'Fil du match', sim3d: 'Simulation 3D', field: 'Terrain', ht: 'Mi-temps',
    ft: 'Terminé', sched: 'Programmé', login: 'Se connecter avec Google', logout: 'Déconnexion', guest: 'Invité',
    favorites: 'Favoris', addFav: 'Suivre', removeFav: 'Ne plus suivre', noFav: "Vous ne suivez encore aucune équipe. Ouvrez un match et touchez ☆ à côté d'une équipe ou d'une compétition.",
    liveNow: 'En direct maintenant', allLive: 'Tous les directs', autoRefresh: 'Actualisation auto', updated: 'Mis à jour',
    formation: 'Système', subs: 'Remplaçants', bench: 'Banc', coach: 'Entraîneur', venue: 'Stade', attendance: 'Affluence',
    referee: 'Arbitre', possession: 'Possession', noData: 'Données non disponibles pour ce match.', tournaments: 'Tournois',
    rounds: 'Tours', set: 'Set', calendar: 'Calendrier', stages: 'étapes', race: 'Course', sessions: 'Séances',
    results: 'Résultats', leaderboard: 'Classement', pos: 'Pos', driver: 'Pilote', team: 'Équipe', gap: 'Écart',
    trackMap: 'Carte du circuit', play: 'Lecture', pause: 'Pause', speed: 'Vitesse', camera: 'Caméra',
    camTv: 'TV', camTop: 'Dessus', camGoal: 'But', camFollow: 'Suivre le ballon', camFree: 'Libre',
    replay: 'Replay données réelles', liveSim: 'Direct simulé', replayIntro: 'Replays avec la position réelle des 22 joueurs et du ballon (données StatsBomb 360).',
    replayPick: 'Choisir un match', loadingBig: 'Téléchargement des données de tracking (≈ 13 Mo)…',
    simNote: 'Positions du ballon réelles (coordonnées des actions ESPN) ; placement des joueurs reconstitué à partir de la composition.',
    noPos: "Ce match n'a pas encore d'actions géolocalisées.", events: 'Actions', panels: 'Panneaux affichés',
    customize: 'Personnaliser', notify: 'Alertes score', notifyOn: 'Alertes activées', language: 'Langue',
    winProb: 'Probabilité de victoire', drives: 'Séries offensives', down: 'Tentative', scoring: 'Points marqués',
    configLogin: "Connexion Google non configurée : ajoutez votre Client ID dans js/config.js. En attendant, vos favoris sont gardés sur cet appareil.",
    leagueMonth: 'Matchs du mois', prev: 'Précédent', next: 'Suivant', officialSite: 'Site officiel / direct',
    cyclingNote: "Aucune API gratuite ne diffuse le direct du cyclisme : calendrier, présentation et lien vers le suivi officiel.",
    datesApprox: 'dates indicatives', in: 'dans', days: 'j', fights: 'Combats', card: 'Carte', round: 'Round',
    hole: 'Trou', thru: 'Trous joués', toPar: 'Par', strokes: 'Coups', f1Replay: 'Replay du dernier Grand Prix (OpenF1)',
    lap: 'Tour', interval: 'Intervalle', laps: 'tours', home: 'Accueil', search: 'Rechercher une équipe…',
    openMatch: 'Ouvrir', recentResults: 'Derniers résultats', nextMatches: 'Prochains matchs', bigPlays: 'Temps forts',
    period: 'Période', goals: 'Buts', cards: 'Cartons', topPlayers: 'Meilleurs joueurs', showOnPitch: 'Voir sur le terrain',
    demo: 'Démo', startReplay: 'Lancer', minute: 'Minute', exitFull: 'Quitter le plein écran', fullscreen: 'Plein écran',
  },
  en: {
    appName: 'Sport Live', myFeed: 'My feed', sports: 'Sports', live: 'Live', upcoming: 'Upcoming',
    finished: 'Finished', today: 'Today', noMatches: 'No matches in this period.', loading: 'Loading…',
    error: 'Could not load data', retry: 'Retry', back: 'Back', competitions: 'Competitions',
    seeAll: 'See all', standings: 'Standings', summary: 'Summary', lineups: 'Lineups', stats: 'Stats',
    players: 'Players', timeline: 'Match feed', sim3d: '3D simulation', field: 'Pitch', ht: 'Half-time',
    ft: 'Full time', sched: 'Scheduled', login: 'Sign in with Google', logout: 'Sign out', guest: 'Guest',
    favorites: 'Favorites', addFav: 'Follow', removeFav: 'Unfollow', noFav: "You don't follow any team yet. Open a match and tap ☆ next to a team or competition.",
    liveNow: 'Live now', allLive: 'All live games', autoRefresh: 'Auto refresh', updated: 'Updated',
    formation: 'Formation', subs: 'Substitutes', bench: 'Bench', coach: 'Coach', venue: 'Venue', attendance: 'Attendance',
    referee: 'Referee', possession: 'Possession', noData: 'No data available for this match.', tournaments: 'Tournaments',
    rounds: 'Rounds', set: 'Set', calendar: 'Calendar', stages: 'stages', race: 'Race', sessions: 'Sessions',
    results: 'Results', leaderboard: 'Leaderboard', pos: 'Pos', driver: 'Driver', team: 'Team', gap: 'Gap',
    trackMap: 'Track map', play: 'Play', pause: 'Pause', speed: 'Speed', camera: 'Camera',
    camTv: 'TV', camTop: 'Top', camGoal: 'Goal', camFollow: 'Follow ball', camFree: 'Free',
    replay: 'Real-data replay', liveSim: 'Live simulation', replayIntro: 'Replays with the real position of all 22 players and the ball (StatsBomb 360 data).',
    replayPick: 'Pick a match', loadingBig: 'Downloading tracking data (≈ 13 MB)…',
    simNote: 'Real ball positions (ESPN event coordinates); player placement rebuilt from the lineup.',
    noPos: 'This match has no geolocated events yet.', events: 'Events', panels: 'Visible panels',
    customize: 'Customize', notify: 'Score alerts', notifyOn: 'Alerts on', language: 'Language',
    winProb: 'Win probability', drives: 'Drives', down: 'Down', scoring: 'Scoring plays',
    configLogin: 'Google sign-in not configured: add your Client ID in js/config.js. Meanwhile your favorites are kept on this device.',
    leagueMonth: 'Games this month', prev: 'Previous', next: 'Next', officialSite: 'Official site / live',
    cyclingNote: 'No free API streams live cycling data: calendar, overview and a link to the official live tracker.',
    datesApprox: 'approximate dates', in: 'in', days: 'd', fights: 'Fights', card: 'Card', round: 'Round',
    hole: 'Hole', thru: 'Thru', toPar: 'To par', strokes: 'Strokes', f1Replay: 'Latest Grand Prix replay (OpenF1)',
    lap: 'Lap', interval: 'Interval', laps: 'laps', home: 'Home', search: 'Search a team…',
    openMatch: 'Open', recentResults: 'Recent results', nextMatches: 'Next games', bigPlays: 'Key moments',
    period: 'Period', goals: 'Goals', cards: 'Cards', topPlayers: 'Top players', showOnPitch: 'Show on pitch',
    demo: 'Demo', startReplay: 'Start', minute: 'Minute', exitFull: 'Exit full screen', fullscreen: 'Full screen',
  },
};

const KEY = 'sportlive:lang';
let lang = (() => {
  try { return localStorage.getItem(KEY) || (navigator.language || 'fr').slice(0, 2); } catch { return 'fr'; }
})();
if (!DICT[lang]) lang = 'fr';

function t(k) { return DICT[lang][k] ?? DICT.fr[k] ?? k; }
function getLang() { return lang; }
function setLang(l) {
  lang = DICT[l] ? l : 'fr';
  try { localStorage.setItem(KEY, lang); } catch { /* ignore */ }
  document.documentElement.lang = lang;
}
function locale() { return lang === 'fr' ? 'fr-FR' : 'en-GB'; }
document.documentElement.lang = lang;

Object.assign(SL, { t, getLang, setLang, locale });
})();

/* Calendrier cyclisme (aucune API publique gratuite ne fournit le direct).
   Dates indicatives : `wiki` donne la page Wikipédia de la course
   (résumé chargé en direct), `site` le site officiel pour le suivi live. */
(() => {
'use strict';

const CYCLING_RACES = [
  { id: 'lombardia-2026', name: 'Il Lombardia', type: 'monument', start: '2026-10-10', end: '2026-10-10', country: '🇮🇹', wiki: { fr: 'Tour de Lombardie 2026', en: '2026 Il Lombardia' }, site: 'https://www.ilombardia.it/' },
  { id: 'guangxi-2026', name: 'Tour of Guangxi', type: 'stage', stages: 6, start: '2026-10-14', end: '2026-10-19', country: '🇨🇳', wiki: { fr: 'Tour du Guangxi 2026', en: '2026 Tour of Guangxi' } },
  { id: 'tdu-2027', name: 'Tour Down Under', type: 'stage', stages: 6, start: '2027-01-19', end: '2027-01-24', country: '🇦🇺', wiki: { fr: 'Tour Down Under 2027', en: '2027 Tour Down Under' }, site: 'https://tourdownunder.com.au/' },
  { id: 'uae-2027', name: 'UAE Tour', type: 'stage', stages: 7, start: '2027-02-15', end: '2027-02-21', country: '🇦🇪', wiki: { fr: 'UAE Tour 2027', en: '2027 UAE Tour' } },
  { id: 'omloop-2027', name: 'Omloop Nieuwsblad', type: 'classic', start: '2027-02-27', end: '2027-02-27', country: '🇧🇪', wiki: { fr: 'Omloop Nieuwsblad 2027', en: '2027 Omloop Nieuwsblad' } },
  { id: 'strade-2027', name: 'Strade Bianche', type: 'classic', start: '2027-03-06', end: '2027-03-06', country: '🇮🇹', wiki: { fr: 'Strade Bianche 2027', en: '2027 Strade Bianche' } },
  { id: 'paris-nice-2027', name: 'Paris-Nice', type: 'stage', stages: 8, start: '2027-03-07', end: '2027-03-14', country: '🇫🇷', wiki: { fr: 'Paris-Nice 2027', en: '2027 Paris–Nice' }, site: 'https://www.paris-nice.fr/' },
  { id: 'tirreno-2027', name: 'Tirreno-Adriatico', type: 'stage', stages: 7, start: '2027-03-08', end: '2027-03-14', country: '🇮🇹', wiki: { fr: 'Tirreno-Adriatico 2027', en: '2027 Tirreno–Adriatico' } },
  { id: 'sanremo-2027', name: 'Milan-San Remo', type: 'monument', start: '2027-03-20', end: '2027-03-20', country: '🇮🇹', wiki: { fr: 'Milan-San Remo 2027', en: '2027 Milan–San Remo' } },
  { id: 'catalunya-2027', name: 'Volta a Catalunya', type: 'stage', stages: 7, start: '2027-03-22', end: '2027-03-28', country: '🇪🇸', wiki: { fr: 'Tour de Catalogne 2027', en: '2027 Volta a Catalunya' } },
  { id: 'ronde-2027', name: 'Tour des Flandres', type: 'monument', start: '2027-04-04', end: '2027-04-04', country: '🇧🇪', wiki: { fr: 'Tour des Flandres 2027', en: '2027 Tour of Flanders' } },
  { id: 'roubaix-2027', name: 'Paris-Roubaix', type: 'monument', start: '2027-04-11', end: '2027-04-11', country: '🇫🇷', wiki: { fr: 'Paris-Roubaix 2027', en: '2027 Paris–Roubaix' }, site: 'https://www.paris-roubaix.fr/' },
  { id: 'amstel-2027', name: 'Amstel Gold Race', type: 'classic', start: '2027-04-18', end: '2027-04-18', country: '🇳🇱', wiki: { fr: 'Amstel Gold Race 2027', en: '2027 Amstel Gold Race' } },
  { id: 'fleche-2027', name: 'Flèche wallonne', type: 'classic', start: '2027-04-21', end: '2027-04-21', country: '🇧🇪', wiki: { fr: 'Flèche wallonne 2027', en: '2027 La Flèche Wallonne' } },
  { id: 'liege-2027', name: 'Liège-Bastogne-Liège', type: 'monument', start: '2027-04-25', end: '2027-04-25', country: '🇧🇪', wiki: { fr: 'Liège-Bastogne-Liège 2027', en: '2027 Liège–Bastogne–Liège' } },
  { id: 'giro-2027', name: "Giro d'Italia", type: 'grandtour', stages: 21, start: '2027-05-08', end: '2027-05-30', country: '🇮🇹', wiki: { fr: "Tour d'Italie 2027", en: "2027 Giro d'Italia" }, site: 'https://www.giroditalia.it/' },
  { id: 'dauphine-2027', name: 'Tour Auvergne-Rhône-Alpes', type: 'stage', stages: 8, start: '2027-06-06', end: '2027-06-13', country: '🇫🇷', wiki: { fr: 'Tour Auvergne-Rhône-Alpes 2027', en: '2027 Tour Auvergne-Rhône-Alpes' } },
  { id: 'suisse-2027', name: 'Tour de Suisse', type: 'stage', stages: 8, start: '2027-06-13', end: '2027-06-20', country: '🇨🇭', wiki: { fr: 'Tour de Suisse 2027', en: '2027 Tour de Suisse' } },
  { id: 'tdf-2027', name: 'Tour de France', type: 'grandtour', stages: 21, start: '2027-07-02', end: '2027-07-25', country: '🇫🇷', wiki: { fr: 'Tour de France 2027', en: '2027 Tour de France' }, site: 'https://www.letour.fr/' },
  { id: 'tdffemmes-2027', name: 'Tour de France Femmes', type: 'grandtour', stages: 9, start: '2027-07-31', end: '2027-08-08', country: '🇫🇷', wiki: { fr: 'Tour de France Femmes 2027', en: '2027 Tour de France Femmes' }, site: 'https://www.letour.fr/' },
  { id: 'vuelta-2027', name: 'Vuelta a España', type: 'grandtour', stages: 21, start: '2027-08-21', end: '2027-09-12', country: '🇪🇸', wiki: { fr: "Tour d'Espagne 2027", en: '2027 Vuelta a España' }, site: 'https://www.lavuelta.es/' },
  { id: 'worlds-2027', name: 'Championnats du monde', type: 'championship', start: '2027-09-19', end: '2027-09-26', country: '🇫🇷', wiki: { fr: 'Championnats du monde de cyclisme sur route 2027', en: '2027 UCI Road World Championships' } },
  { id: 'lombardia-2027', name: 'Il Lombardia', type: 'monument', start: '2027-10-09', end: '2027-10-09', country: '🇮🇹', wiki: { fr: 'Tour de Lombardie 2027', en: '2027 Il Lombardia' } },
];

function raceState(r, now = new Date()) {
  const s = new Date(r.start + 'T00:00:00'), e = new Date(r.end + 'T23:59:59');
  return now < s ? 'pre' : now > e ? 'post' : 'in';
}

Object.assign(SL, { raceState, CYCLING_RACES });
})();

const SCORE = {
  timeLimit: 120,       // durée d'une partie (s)

  // points/s = angle(°) × vitesse(px/s) × pointsK × combo ; ils restent "en jeu" jusqu'à la fin de la chaîne
  pointsK: 0.006,

  comboRise: 0.6,       // +multiplicateur par seconde de glisse maintenue
  comboMax: 10,
  graceTime: 1.0,       // s hors glisse avant de valider la chaîne (retour en adhérence prolongé)
  comboBreakSpeed: 75, // vitesse d'impact (px/s) qui annule la chaîne en cours

  // passage près d'un obstacle sans le toucher
  nearMargin: 22,       // distance (px) entre la carrosserie et l'obstacle
  nearMinSpeed: 160,
  nearBonus: 100,
  nearSpeedK: 0.23,     // points en plus par px/s
  nearComboBoost: 0.5,  // multiplicateur ajouté au combo
};

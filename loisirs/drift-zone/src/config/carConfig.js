// Tous les réglages de ressenti. Unités : pixels, secondes, radians.
const DEFAULT_CAR = {
  // Moteur / freins
  accel: 620,            // poussée max (px/s²)
  maxSpeed: 700,        // vitesse de pointe approx. (px/s)
  drag: 0.18,            // traînée proportionnelle à la vitesse (1/s)
  rolling: 45,           // résistance de roulement constante (px/s²)
  brake: 1000,           // décélération au frein (px/s²)
  reverseAccel: 320,
  maxReverse: 230,
  handbrakeDrag: 160,    // ralentissement longitudinal du frein à main (px/s²)

  // Direction
  steerAttack: 6,        // vitesse de montée du braquage (1/s) : braquage progressif
  steerRelease: 9,       // vitesse de retour au centre
  steerRate: 3.4,        // vitesse de rotation max (rad/s)
  steerSpeedLoss: 0.4,   // perte de braquage à pleine vitesse (0..1)
  yawResponse: 14,       // nervosité de la rotation (plus haut = plus sec)
  yawRampSpeed: 80,     // en dessous, la voiture tourne peu (px/s)
  handbrakeYawBoost: 1.5,

  // Adhérence latérale
  grip: 1500,            // décélération latérale max à basse vitesse (px/s²)
  gripSpeedLoss: 0.55,   // perte d'adhérence à pleine vitesse (0..1)
  handbrakeGrip: 0.18,   // multiplicateur d'adhérence au frein à main
  throttleGripLoss: 0.3, // perte d'adhérence sous gaz à haute vitesse
  slideThreshold: 95,   // vitesse latérale au-delà de laquelle on "glisse" (px/s)
  slideGrip: 0.8,        // multiplicateur d'adhérence en glisse (maintient la dérive)
  driftSpeedKeep: 0.45,  // part de la vitesse latérale perdue redirigée vers l'avant (0..1)

  // Détection de dérive
  minDriftSpeed: 100,    // px/s
  minDriftAngle: 0.17,   // rad (~10°)

  // Collisions
  mass: 1,               // masse relative aux objets déplaçables

  // Dimensions (rendu + collisions)
  length: 46,
  width: 22,
};

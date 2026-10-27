// Caméra 3D et effets. Unités : px du plan de jeu.
const VIEW = {
  camera: {
    fov: 50,
    follow: 7,          // vitesse de rattrapage (1/s) : plus bas = plus de retard
    lookAhead: 0.2,     // décalage du point visé selon la vitesse (s)
    heightMin: 420,     // hauteur à l'arrêt
    heightMax: 780,     // hauteur à pleine vitesse
    back: 1.0,          // recul de la caméra = hauteur × back (plus grand = vue plus rasante)
    zoomSpeed: 700,    // vitesse (px/s) à laquelle heightMax est atteinte
    zoomLerp: 2.5,
    shakeDuration: 0.25, // s
    shakeIntensity: 14,  // décalage max (px) pour un impact d'intensité 1
  },
  skids: {
    max: 15000,         // segments conservés (les plus anciens sont recyclés)
    width: 4,
    slipMin: 60,        // vitesse latérale (px/s) à partir de laquelle ça marque
    slipMax: 320,
  },
  smoke: {
    max: 500,
    rate: 55,           // particules/s par roue à intensité 1
    life: 0.9,          // s
    size: 34,
  },
  colors: {
    sky: 0x7fe8e8,
    floor: 0xefe6d4,
    skid: 0x6f6a62,
    red: 0xe8363b,
  },
};

// Sons d'ouverture des portes (fichiers dans public/sounds, joués ensemble pour un effet "mécanique").
// Si le navigateur bloque le son, ce n'est pas grave : les portes s'ouvrent quand même.
const OPEN_SOUNDS = [
  { src: '/sounds/porte-futuriste.mp3', volume: 0.7 },
  { src: '/sounds/activation-machine.mp3', volume: 0.5 },
];

// Lance les deux sons en même temps. Chaque <audio> est créé à la volée : on ne garde pas de référence.
export const playOpenSound = () => {
  OPEN_SOUNDS.forEach(({ src, volume }) => {
    const audio = new Audio(src);
    audio.volume = volume;
    // Le navigateur peut refuser la lecture automatique : on ignore l'erreur volontairement
    audio.play().catch(() => {});
  });
};

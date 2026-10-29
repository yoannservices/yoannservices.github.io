// Son de fermeture des portes (retour à l'accueil) : une note qui descend, générée par le navigateur.
// Pas de fichier audio : rien à télécharger, et pas de licence à vérifier.
// Si le navigateur bloque le son, ce n'est pas grave : les portes se referment quand même.

// Un seul contexte audio pour toute la page : le navigateur en limite le nombre. Créé au premier besoin,
// car il doit naître après un geste de l'élève (Échap ou clic sur "Se déconnecter").
let contexteAudio: AudioContext | null = null;

// Joue une note sinusoïdale qui descend de 660 Hz à 220 Hz en 0,4 s, avec un fondu pour finir sans "clic"
export const playCloseSound = () => {
  try {
    contexteAudio ??= new AudioContext();
    const contexte = contexteAudio;
    // Un contexte peut être "suspendu" : on le relance avant de jouer
    if (contexte.state === 'suspended') void contexte.resume();

    const maintenant = contexte.currentTime;
    const oscillateur = contexte.createOscillator();
    const gain = contexte.createGain();
    oscillateur.type = 'sine';
    oscillateur.frequency.setValueAtTime(660, maintenant);
    oscillateur.frequency.exponentialRampToValueAtTime(220, maintenant + 0.4);
    gain.gain.setValueAtTime(0.3, maintenant);
    gain.gain.exponentialRampToValueAtTime(0.001, maintenant + 0.4);
    oscillateur.connect(gain).connect(contexte.destination);
    oscillateur.start(maintenant);
    oscillateur.stop(maintenant + 0.4);
  } catch {
    // Volontairement ignoré : pas de son, mais les portes se referment quand même
  }
};

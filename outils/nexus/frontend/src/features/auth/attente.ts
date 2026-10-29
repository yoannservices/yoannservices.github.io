// Convertit le temps d'attente renvoyé par le serveur (en secondes) en minutes pour l'affichage.
// On arrondit vers le haut et on ne descend jamais sous 1 : "dans 0 min" n'aurait pas de sens pour l'élève.
export const minutesDattente = (secondes: number): number => Math.max(1, Math.ceil(secondes / 60));

import { useEffect, useState } from 'react';
import { playCloseSound } from './playCloseSound';
import { playOpenSound } from './playOpenSound';

// Durées des animations des portes (en ms) : doivent rester alignées avec index.css
const OPEN_DURATION = 1800;
const CLOSE_DURATION = 1400;

// Vrai si la cible d'un clavier est un endroit où l'on écrit ou choisit une valeur
const estDansUnChamp = (cible: EventTarget | null): boolean => {
  if (!(cible instanceof HTMLElement)) return false;
  return cible.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(cible.tagName);
};

// Durée réelle d'une étape : sans animation (préférence "réduire les animations"), on passe tout de suite à l'étape suivante
const dureeAnimation = (duree: number): number =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : duree;

// Les quatre étapes des portes : fermées, en train de s'ouvrir, ouvertes, en train de se refermer
export type DoorsState = 'closed' | 'opening' | 'open' | 'closing';

// Gère l'animation d'ouverture (accueil -> chat) et de fermeture (chat -> accueil)
export const useDoors = () => {
  const [doors, setDoors] = useState<DoorsState>('closed');

  // Ouvre les portes (accueil -> chat)
  const openDoors = () => {
    if (doors !== 'closed') return; // ignore les clics pendant l'animation
    setDoors('opening');
    playOpenSound();
    setTimeout(() => setDoors('open'), dureeAnimation(OPEN_DURATION));
  };

  // Referme les portes (chat -> accueil). Échap et la déconnexion passent tous les deux par ici.
  const closeDoors = () => {
    if (doors !== 'open') return;
    setDoors('closing');
    playCloseSound();
    setTimeout(() => setDoors('closed'), dureeAnimation(CLOSE_DURATION));
  };

  // La touche Échap referme les portes et ramène à l'accueil. (Le panneau "Mon compte" intercepte Échap lui-même.)
  // L'écouteur est recréé à chaque changement de `doors` : closeDoors voit ainsi toujours l'état à jour.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // Pendant qu'on écrit, Échap ne doit pas ramener à l'accueil : on laisse le champ gérer la touche
      if (estDansUnChamp(e.target)) return;
      closeDoors();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [doors]);

  return { doors, openDoors, closeDoors };
};

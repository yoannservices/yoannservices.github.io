import { useEffect } from 'react';

/**
 * useEscapeKey : appelle onEscape quand l'élève appuie sur Échap, tant que actif vaut vrai.
 * La phase de capture et stopPropagation évitent que la même touche ferme aussi les portes ou une autre fenêtre.
 * Props :
 * - onEscape : fonction à appeler (fermer une fenêtre, un menu…).
 * - actif : vrai quand l'écouteur doit être en place (facultatif, vrai par défaut).
 */
export const useEscapeKey = (onEscape: () => void, actif = true): void => {
  useEffect(() => {
    if (!actif) return;

    const gererEchap = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      onEscape();
    };

    window.addEventListener('keydown', gererEchap, true);
    return () => window.removeEventListener('keydown', gererEchap, true);
  }, [onEscape, actif]);
};

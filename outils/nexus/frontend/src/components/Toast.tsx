import { useEffect } from 'react';

// Combien de temps le message reste affiché avant de disparaître tout seul (en ms) : assez pour le lire
const DUREE_AFFICHAGE_MS = 6000;

/**
 * Toast : un petit message temporaire en bas de l'écran (ex. "Impossible de supprimer la conversation").
 * Il disparaît tout seul après quelques secondes. C'est une erreur : role="alert" pour que les lecteurs d'écran l'annoncent tout de suite.
 * Props :
 * - message : le texte à afficher, déjà traduit.
 * - isDarkMode : thème actuel, pour choisir les couleurs.
 * - onDismiss : appelé quand le délai est écoulé, pour que le parent retire le message.
 *   Doit rester la même fonction d'un rendu à l'autre (useCallback), sinon le délai repart à chaque rendu.
 */

type ToastProps = {
  message: string;
  isDarkMode: boolean;
  onDismiss: () => void;
};

const Toast = ({ message, isDarkMode, onDismiss }: ToastProps) => {
  // Le délai démarre au montage. Quand le parent change la clé (nouveau message), le toast est recréé et le délai repart.
  useEffect(() => {
    const minuteur = window.setTimeout(onDismiss, DUREE_AFFICHAGE_MS);
    return () => window.clearTimeout(minuteur);
  }, [onDismiss]);

  return (
    <div
      role="alert"
      // pointer-events-none : le message ne bloque jamais un clic sur ce qu'il recouvre
      className={`animate-fadeIn pointer-events-none fixed top-20 left-1/2 z-[70] max-w-[90vw] -translate-x-1/2 rounded-lg border px-4 py-3 text-sm font-bold shadow-lg ${
        isDarkMode ? 'border-red-500/60 bg-[color:var(--surface)] text-red-300' : 'border-red-400 bg-red-100 text-red-700'
      }`}
    >
      {message}
    </div>
  );
};

export default Toast;

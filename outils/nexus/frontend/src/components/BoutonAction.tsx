import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * BoutonAction : un vrai bouton avec une icône et un libellé court (ex. "Joindre", "Copier").
 * Sobre et sombre : fond bleu nuit, fine bordure cyan, léger changement au survol. Pas de halo.
 * Le libellé reste visible sur tous les écrans, pour que l'élève sache ce que fait le bouton.
 * Props :
 * - icon : l'icône (un composant de Icones.tsx).
 * - label : le texte du bouton (déjà traduit).
 * - isDarkMode : thème actuel, pour choisir les couleurs.
 * - Toutes les autres props d'un <button> (onClick, disabled, aria-expanded, title, ref…) sont transmises.
 */

type BoutonActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  label: string;
  isDarkMode: boolean;
};

const BoutonAction = forwardRef<HTMLButtonElement, BoutonActionProps>(
  ({ icon, label, isDarkMode, className = '', type = 'button', ...props }, ref) => {
    const couleurs = isDarkMode
      ? 'border-cyan-500/25 bg-[#0f1535]/80 text-gray-200 hover:border-cyan-400/60 hover:bg-[color:var(--bouton-survol)] hover:text-white'
      : 'border-cyan-300 bg-white text-gray-700 hover:border-cyan-500 hover:bg-cyan-50 hover:text-gray-900';
    const couleurIcone = isDarkMode ? 'text-cyan-400' : 'text-cyan-600';

    return (
      <button
        ref={ref}
        type={type}
        className={`inline-flex h-11 w-11 items-center justify-center gap-2 rounded-lg border px-0 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-auto sm:justify-start sm:px-3.5 ${couleurs} ${className}`}
        {...props}
      >
        <span className={`flex shrink-0 ${couleurIcone}`}>{icon}</span>
        {/* Sur téléphone seul l'icône reste visible : le libellé reste lu par les lecteurs d'écran */}
        <span className="sr-only sm:not-sr-only">{label}</span>
      </button>
    );
  }
);

BoutonAction.displayName = 'BoutonAction';

export default BoutonAction;

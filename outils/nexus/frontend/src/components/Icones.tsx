import type { SVGProps } from 'react';

/**
 * Icones : petits pictogrammes en trait fin, dessinés en SVG (pas d'emoji).
 * Ils prennent la couleur du texte autour (currentColor), donc ils suivent le thème clair ou sombre.
 * Props : toutes les props d'un <svg> (className pour la taille et la couleur).
 * Ils sont décoratifs : le texte du bouton qui les contient donne le sens à l'élève.
 */

type IconeProps = SVGProps<SVGSVGElement>;

// Base commune : 18 px, trait de 1,8, angles arrondis
const Base = ({ children, ...props }: IconeProps) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    {children}
  </svg>
);

// Trombone : fichier joint
export const IconeTrombone = (props: IconeProps) => (
  <Base {...props}>
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </Base>
);

// Avion en papier : envoyer le message
export const IconeEnvoi = (props: IconeProps) => (
  <Base {...props}>
    <path d="M22 2L11 13" />
    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
  </Base>
);

// Trois traits : menu et liste des conversations
export const IconeMenu = (props: IconeProps) => (
  <Base {...props}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Base>
);

// Croix : fermer
export const IconeFermer = (props: IconeProps) => (
  <Base {...props}>
    <path d="M18 6L6 18M6 6l12 12" />
  </Base>
);

// Trois points : options d'une conversation
export const IconePoints = (props: IconeProps) => (
  <Base {...props}>
    <circle cx="5" cy="12" r="1.2" fill="currentColor" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    <circle cx="19" cy="12" r="1.2" fill="currentColor" />
  </Base>
);

// Deux feuilles : copier
export const IconeCopier = (props: IconeProps) => (
  <Base {...props}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Base>
);

// Coche : copie réussie
export const IconeCoche = (props: IconeProps) => (
  <Base {...props}>
    <path d="M20 6L9 17l-5-5" />
  </Base>
);

// Silhouette : compte
export const IconeCompte = (props: IconeProps) => (
  <Base {...props}>
    <circle cx="12" cy="7" r="4" />
    <path d="M4 21v-1a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7v1" />
  </Base>
);

// Bulle : conversations
export const IconeConversation = (props: IconeProps) => (
  <Base {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Base>
);

// Chevrons : replier et afficher la liste des conversations
export const IconeChevronGauche = (props: IconeProps) => (
  <Base {...props}>
    <path d="M15 18l-6-6 6-6" />
  </Base>
);

export const IconeChevronDroite = (props: IconeProps) => (
  <Base {...props}>
    <path d="M9 18l6-6-6-6" />
  </Base>
);

// Oeil : montrer le mot de passe
export const IconeOeil = (props: IconeProps) => (
  <Base {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </Base>
);

// Oeil barré : cacher le mot de passe
export const IconeOeilBarre = (props: IconeProps) => (
  <Base {...props}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <path d="M1 1l22 22" />
  </Base>
);

// Soleil : affiché en thème sombre, pour passer en thème clair
export const IconeSoleil = (props: IconeProps) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </Base>
);

// Lune : affichée en thème clair, pour passer en thème sombre
export const IconeLune = (props: IconeProps) => (
  <Base {...props}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </Base>
);

// Carré plein : arrêter la réponse en cours
export const IconeArret = (props: IconeProps) => (
  <Base {...props}>
    <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
  </Base>
);

// Flèche vers le bas : descendre à la fin de la conversation
export const IconeFlecheBas = (props: IconeProps) => (
  <Base {...props}>
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </Base>
);

// Manette : ouvre la liste des jeux
export const IconeJeu = (props: IconeProps) => (
  <Base {...props}>
    <rect x="2" y="7" width="20" height="10" rx="5" />
    <path d="M7 10v4M5 12h4" />
    <path d="M16 11h.01M18 13h.01" />
  </Base>
);

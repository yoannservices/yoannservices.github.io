import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * useFocusTrap : garde le focus clavier à l'intérieur d'une fenêtre (modale, tiroir) tant qu'elle est ouverte.
 * - À l'ouverture, le focus va sur premierFocus, ou sur le premier élément focusable de la fenêtre.
 * - Tab et Maj+Tab bouclent à l'intérieur de la fenêtre au lieu de sortir vers la page derrière.
 * - À la fermeture, le focus revient sur l'élément qui l'avait avant l'ouverture.
 * Props :
 * - conteneur : la fenêtre à garder.
 * - actif : vrai quand la fenêtre est ouverte.
 * - premierFocus : élément à focaliser en premier (facultatif).
 */

const SELECTEUR_FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export const useFocusTrap = (
  conteneur: RefObject<HTMLElement>,
  actif: boolean,
  premierFocus?: RefObject<HTMLElement>,
): void => {
  useEffect(() => {
    const element = conteneur.current;
    if (!actif || !element) return;

    // L'élément qui avait le focus avant l'ouverture : on y revient à la fermeture
    const elementPrecedent = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusables = () => Array.from(element.querySelectorAll<HTMLElement>(SELECTEUR_FOCUSABLE));
    (premierFocus?.current ?? focusables()[0])?.focus();

    const gererTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const liste = focusables();
      if (liste.length === 0) return;
      const premier = liste[0];
      const dernier = liste[liste.length - 1];
      if (event.shiftKey && document.activeElement === premier) {
        event.preventDefault();
        dernier.focus();
      } else if (!event.shiftKey && document.activeElement === dernier) {
        event.preventDefault();
        premier.focus();
      }
    };

    document.addEventListener('keydown', gererTab);
    return () => {
      document.removeEventListener('keydown', gererTab);
      elementPrecedent?.focus();
    };
  }, [actif, conteneur, premierFocus]);
};

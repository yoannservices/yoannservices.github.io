import type { KeyboardEvent } from 'react';
import DoorFace from './DoorFace';
import type { DoorsState } from '../features/doors/useDoors';
import { useI18n } from '../i18n/LangueProvider';

/**
 * DoorsOverlay : le voile plein écran (deux portes + lumière) qui couvre l'accueil.
 * La porte de gauche est le bouton accessible : on l'atteint au clavier (Tab) et elle s'ouvre avec Entrée ou Espace.
 * La porte de droite est une copie décorative : elle reste cliquable à la souris, mais elle est cachée aux lecteurs d'écran
 * et n'a pas de focus, pour que l'élève n'ait pas deux boutons identiques à parcourir.
 * Props :
 * - doors : étape actuelle des portes ; elle choisit l'animation via la classe "doors-<étape>".
 * - onOpenDoors : appelé quand l'élève clique sur une des deux portes, ou appuie sur Entrée/Espace sur la porte de gauche.
 */

type DoorsOverlayProps = {
  doors: DoorsState;
  onOpenDoors: () => void;
};

const DoorsOverlay = ({ doors, onOpenDoors }: DoorsOverlayProps) => {
  const { t } = useI18n();

  // Entrée et Espace ouvrent les portes, comme un clic (Espace fait défiler la page par défaut : on l'annule)
  const gererTouche = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onOpenDoors();
  };

  return (
    <div className={`doors-overlay doors-${doors}`}>
      <div className="door-light" />
      <div
        className="door door-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-cyan-300"
        role="button"
        tabIndex={0}
        aria-label={t.interface.portes.entrer}
        onClick={onOpenDoors}
        onKeyDown={gererTouche}
      >
        <DoorFace id="l" />
      </div>
      <div className="door door-right" onClick={onOpenDoors}>
        <DoorFace id="r" decorative />
      </div>
    </div>
  );
};

export default DoorsOverlay;

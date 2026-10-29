import { useRef } from 'react';
import type { MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { useEscapeKey } from '../features/focus/useEscapeKey';
import { useFocusTrap } from '../features/focus/useFocusTrap';
import { useI18n } from '../i18n/LangueProvider';
import { IconeFermer } from './Icones';
import '../styles/htmlPreview.css';

/**
 * HtmlPreviewPanel : le "navigateur interne" qui affiche une page HTML rendue, au-dessus de la page.
 * Le HTML vient de l'IA, il n'est donc pas fiable : il est affiché dans une iframe "bac à sable"
 * (sandbox) sans allow-same-origin, pour qu'il ne puisse pas lire la session de l'élève.
 * Il se ferme avec le bouton ×, un clic sur le fond, ou la touche Échap. Le focus reste dans la fenêtre
 * tant qu'elle est ouverte, et revient à l'endroit d'où on l'a ouverte.
 * Props :
 * - code : le HTML à afficher (le texte du bloc de code).
 * - onClose : ferme l'aperçu.
 */

type HtmlPreviewPanelProps = {
  code: string;
  onClose: () => void;
};

const HtmlPreviewPanel = ({ code, onClose }: HtmlPreviewPanelProps) => {
  const { t } = useI18n();
  const fenetreRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Le bouton × reçoit le focus à l'ouverture (pour que Échap marche tout de suite), et le focus reste dans la fenêtre
  useFocusTrap(fenetreRef, true, closeButtonRef);
  // Échap ferme seulement cet aperçu (le hook arrête la touche, pour que portes et paramètres ne se ferment pas aussi)
  useEscapeKey(onClose);

  // Un clic sur le fond (et non sur la fenêtre elle-même) ferme l'aperçu
  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  // Rendu dans <body> : le message qui contient ce Markdown a un fond flou (backdrop-filter)
  // qui casserait la position "fixed" de la fenêtre si elle était dessinée à l'intérieur.
  return createPortal(
    <div className="html-preview-backdrop" onClick={handleBackdropClick}>
      <div ref={fenetreRef} role="dialog" aria-modal="true" aria-label={t.interface.apercu.titre} className="html-preview-window">
        <div className="html-preview-header">
          <span className="html-preview-title">{t.interface.apercu.titre}</span>
          <button
            ref={closeButtonRef}
            type="button"
            className="html-preview-close flex items-center gap-2 px-3"
            aria-label={t.interface.apercu.fermer}
            onClick={onClose}
          >
            <IconeFermer width="16" height="16" />
            <span className="sr-only text-sm sm:not-sr-only">{t.interface.apercu.fermerCourt}</span>
          </button>
        </div>
        {/* sandbox : scripts et formulaires autorisés, mais pas allow-same-origin (sinon le HTML lirait le jeton
            de connexion dans localStorage), ni fenêtres popup, ni navigation de la page principale */}
        <iframe
          className="html-preview-frame"
          title={t.interface.apercu.iframeTitre}
          srcDoc={code}
          sandbox="allow-scripts allow-forms"
        />
      </div>
    </div>,
    document.body,
  );
};

export default HtmlPreviewPanel;

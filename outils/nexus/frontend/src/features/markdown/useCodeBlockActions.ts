import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { copyText } from '../clipboard/copyText';
import { COPY_FEEDBACK_DURATION_MS } from '../clipboard/useCopyFeedback';
import { useI18n } from '../../i18n/LangueProvider';
import {
  CODE_BLOCK_CLASS,
  CODE_REPLIE_CLASS,
  COPY_CODE_ATTRIBUTE,
  PREVIEW_CODE_ATTRIBUTE,
  TOGGLE_CODE_ATTRIBUTE,
} from './renderCodeBlock';

// Le HTML des blocs de code vient de dangerouslySetInnerHTML : React ne gère pas ces boutons.
// On écoute donc les clics au niveau du conteneur (délégation) et on agit selon le bouton cliqué.

// Renvoie le bouton (avec l'attribut donné) sur lequel on a cliqué, ou null si le clic vient d'ailleurs
const findBlockButton = (target: EventTarget | null, attribute: string): HTMLButtonElement | null => {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLButtonElement>(`button[${attribute}]`);
};

// Le code d'un bloc est uniquement le contenu de <code> : pas la barre, pas les libellés des boutons
const readBlockCode = (button: HTMLButtonElement): string => {
  const codeBlock = button.closest(`.${CODE_BLOCK_CLASS}`);
  return codeBlock?.querySelector('pre code')?.textContent ?? '';
};

// Affiche un libellé sur le bouton "Copier le code", puis le remet après le délai.
// Un délai est gardé par bouton pour pouvoir être annulé si l'élève reclique avant la fin.
const showCopyLabel = (
  button: HTMLButtonElement,
  label: string,
  libelleDefaut: string,
  timers: Map<HTMLButtonElement, number>,
) => {
  const previousTimer = timers.get(button);
  if (previousTimer !== undefined) window.clearTimeout(previousTimer);

  button.textContent = label;
  const timerId = window.setTimeout(() => {
    button.textContent = libelleDefaut;
    timers.delete(button);
  }, COPY_FEEDBACK_DURATION_MS);
  timers.set(button, timerId);
};

// Gère les clics sur les boutons d'un bloc de code (copier, prévisualiser).
// Renvoie le gestionnaire de clic à mettre sur le conteneur du Markdown, l'aperçu en cours (ou null),
// et la fonction qui le ferme.
export const useCodeBlockActions = () => {
  const { t } = useI18n();
  // Libellés des boutons et des retours de copie, dans la langue courante
  const { blocCode, copie } = t.features;
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  // Délais en attente pour les boutons "Copier le code", un par bouton
  const timersRef = useRef(new Map<HTMLButtonElement, number>());
  // Vrai tant que le composant est affiché (la copie est asynchrone)
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    const timers = timersRef.current;
    return () => {
      isMountedRef.current = false;
      // Au démontage, on annule tous les délais pour ne rien modifier après coup
      timers.forEach(timerId => window.clearTimeout(timerId));
      timers.clear();
    };
  }, []);

  const onClick = useCallback(async (event: MouseEvent<HTMLElement>) => {
    const previewButton = findBlockButton(event.target, PREVIEW_CODE_ATTRIBUTE);
    if (previewButton) {
      setPreviewCode(readBlockCode(previewButton));
      return;
    }

    // Voir ou réduire un bloc long : on change seulement la classe du conteneur, le code reste dans le HTML
    const toggleButton = findBlockButton(event.target, TOGGLE_CODE_ATTRIBUTE);
    if (toggleButton) {
      const codeBlock = toggleButton.closest(`.${CODE_BLOCK_CLASS}`);
      // classList.toggle renvoie vrai quand la classe "replié" est présente après le clic
      const estReplie = codeBlock?.classList.toggle(CODE_REPLIE_CLASS) ?? false;
      toggleButton.textContent = estReplie ? blocCode.voirCodeComplet : blocCode.reduireCode;
      toggleButton.setAttribute('aria-expanded', String(!estReplie));
      return;
    }

    const copyButton = findBlockButton(event.target, COPY_CODE_ATTRIBUTE);
    if (!copyButton) return;

    const copied = await copyText(readBlockCode(copyButton));
    if (!isMountedRef.current) return;
    showCopyLabel(
      copyButton,
      copied ? copie.reussie : copie.echec,
      blocCode.copierCode,
      timersRef.current,
    );
  }, [blocCode, copie]);

  const closePreview = useCallback(() => setPreviewCode(null), []);

  return { onClick, previewCode, closePreview };
};

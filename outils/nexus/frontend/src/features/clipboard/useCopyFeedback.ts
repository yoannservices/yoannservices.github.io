import { useCallback, useEffect, useRef, useState } from 'react';
import { copyText } from './copyText';
import { useI18n } from '../../i18n/LangueProvider';

// Durée pendant laquelle le libellé "copié" ou "échec" reste affiché (les textes sont dans le dictionnaire)
export const COPY_FEEDBACK_DURATION_MS = 2000;

export type CopyStatus = 'idle' | 'copied' | 'failed';

// Gère l'état d'un bouton de copie : "copié", "échec", puis retour à l'état normal après un court délai.
// Renvoie aussi le libellé à afficher pour l'état courant, dans la langue choisie.
export const useCopyFeedback = () => {
  const { t } = useI18n();
  const [status, setStatus] = useState<CopyStatus>('idle');
  const timerRef = useRef<number | null>(null);
  // Vrai tant que le composant est affiché : la copie peut finir après que l'élève a changé de chat
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // On annule le délai en attente pour ne pas toucher à un composant disparu
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const copy = useCallback(async (text: string) => {
    const copied = await copyText(text);
    if (!isMountedRef.current) return;
    // Un nouveau clic remplace le délai précédent au lieu de s'empiler dessus
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setStatus(copied ? 'copied' : 'failed');
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setStatus('idle');
    }, COPY_FEEDBACK_DURATION_MS);
  }, []);

  // Le libellé est calculé à chaque rendu (pas stocké), pour suivre tout de suite un changement de langue
  const label = status === 'copied'
    ? t.features.copie.reussie
    : status === 'failed'
      ? t.features.copie.echec
      : t.features.copie.copier;

  return { status, copy, label };
};

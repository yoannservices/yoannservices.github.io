import { useEffect, useRef, useState } from 'react';
import { markdownToSafeHtml } from '../features/markdown/markdownToSafeHtml';
import { useCodeBlockActions } from '../features/markdown/useCodeBlockActions';
import { useI18n } from '../i18n/LangueProvider';
import HtmlPreviewPanel from './HtmlPreviewPanel';

/**
 * MarkdownMessage : affiche un texte Markdown (les réponses de NEXUS) sous forme de HTML mis en forme.
 * Les blocs de code ont une barre avec "Copier le code" (et "Prévisualiser" pour le HTML).
 * Props :
 * - text : le texte brut Markdown à afficher.
 */

type MarkdownMessageProps = {
  text: string;
};

// Délai minimal entre deux conversions (en ms). Pendant qu'une réponse s'écrit, le texte change à chaque morceau :
// sans ce délai, tout le message serait reconverti des dizaines de fois par seconde.
const DELAI_MIN_ENTRE_RENDUS_MS = 150;

const MarkdownMessage = ({ text }: MarkdownMessageProps) => {
  const { t } = useI18n();
  const [html, setHtml] = useState('');
  const { onClick, previewCode, closePreview } = useCodeBlockActions();
  // Libellés des boutons des blocs de code, dans la langue choisie (l'objet change seulement avec la langue)
  const blocCodeLabels = t.features.blocCode;

  // Moment de la dernière conversion terminée (en ms), pour espacer les suivantes
  const dernierRenduRef = useRef(0);

  // La conversion est asynchrone : on la refait à chaque nouveau texte, et quand la langue change.
  // Pendant l'écriture, on attend que le délai minimal soit passé. Le texte final est toujours converti :
  // chaque changement remplace le minuteur précédent par un nouveau, qui utilise le texte le plus récent.
  // Le drapeau évite qu'une conversion lancée pour un ancien texte écrase le HTML du texte actuel.
  useEffect(() => {
    let estObsolete = false;
    const attente = Math.max(0, dernierRenduRef.current + DELAI_MIN_ENTRE_RENDUS_MS - Date.now());
    const minuteur = window.setTimeout(async () => {
      const resultat = await markdownToSafeHtml(text, blocCodeLabels);
      if (estObsolete) return;
      dernierRenduRef.current = Date.now();
      setHtml(resultat);
    }, attente);

    return () => {
      estObsolete = true;
      window.clearTimeout(minuteur);
    };
  }, [text, blocCodeLabels]);

  return (
    <>
      {/* Un seul gestionnaire de clic pour tous les blocs : les boutons du HTML ne sont pas des éléments React */}
      <div
        className="markdown-content max-w-none"
        onClick={onClick}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {previewCode !== null && <HtmlPreviewPanel code={previewCode} onClose={closePreview} />}
    </>
  );
};

export default MarkdownMessage;

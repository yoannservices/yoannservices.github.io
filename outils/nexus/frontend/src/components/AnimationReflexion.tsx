import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/LangueProvider';
import '../styles/reflexion.css';

/**
 * AnimationReflexion : ce qui s'affiche à la place de la réponse de NEXUS tant qu'elle n'a pas commencé.
 * Une petite orbe qui tourne, des barres qui dansent et une phrase qui change toutes les deux secondes,
 * avec un reflet lumineux. Le style est dans styles/reflexion.css.
 * Props :
 * - isDarkMode : thème actuel, pour choisir les couleurs.
 */

type AnimationReflexionProps = {
  isDarkMode: boolean;
};

// Durée d'affichage de chaque phrase, en millisecondes
const DUREE_PHRASE_MS = 2200;

const AnimationReflexion = ({ isDarkMode }: AnimationReflexionProps) => {
  const { t, langue } = useI18n();
  const phrases = t.interface.reflexion.phrases;
  const [index, setIndex] = useState(0);

  // La phrase change à intervalle régulier. Quand la langue change, on repart de la première phrase.
  useEffect(() => {
    setIndex(0);
    const minuteur = window.setInterval(() => {
      setIndex(actuel => (actuel + 1) % phrases.length);
    }, DUREE_PHRASE_MS);
    return () => window.clearInterval(minuteur);
  }, [phrases.length, langue]);

  return (
    <div role="status" aria-label={t.interface.chat.nexusEcritAria} className="flex items-center gap-3 py-1">
      <span className="reflexion-orbe" aria-hidden="true" />
      <div className="flex flex-col gap-1.5">
        {/* key : chaque nouvelle phrase repart avec son apparition en douceur */}
        <span
          key={`${langue}-${index}`}
          aria-hidden="true"
          className={`reflexion-phrase ${isDarkMode ? 'reflexion-phrase--sombre' : 'reflexion-phrase--clair'}`}
        >
          {phrases[index]}
        </span>
        <span className="reflexion-barres" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
      </div>
    </div>
  );
};

export default AnimationReflexion;

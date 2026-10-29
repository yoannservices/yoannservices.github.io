import { useEffect, useRef, useState } from 'react';
import { useEscapeKey } from '../features/focus/useEscapeKey';
import { useFocusTrap } from '../features/focus/useFocusTrap';
import { JEUX } from '../features/jeux/jeux';
import type { Jeu } from '../features/jeux/jeux';
import { useI18n } from '../i18n/LangueProvider';
import BoutonAction from './BoutonAction';
import { IconeChevronGauche, IconeFermer } from './Icones';

/**
 * PanneauJeux : la liste des jeux, dans une fenêtre au-dessus d'un fond sombre.
 * Un clic sur un jeu l'ouvre en plein écran, dans un cadre (iframe) : le jeu tourne tout seul dans sa page.
 * "Retour à la liste" revient à la liste, "Fermer" ferme tout. Échap ferme aussi le panneau.
 * Props :
 * - isDarkMode : thème actuel, pour choisir les couleurs.
 * - onClose : ferme le panneau (et le jeu s'il est ouvert).
 */

type PanneauJeuxProps = {
  isDarkMode: boolean;
  onClose: () => void;
};

// Les jeux gardent leurs résultats dans le stockage du navigateur. Ils ne peuvent pas y accéder eux-mêmes
// (l'iframe n'a pas le même origine que NEXUS) : NEXUS leur transmet ces clés, et range ce qu'ils lui envoient.
// La session de connexion n'est jamais dans cette liste.
const CLES_JEUX = ['xbit-history', 'roadster:bestTrick'];

// Fabrique la partie "#..." de l'adresse du jeu : les valeurs enregistrées pour ses clés, au format JSON
const donneesPourJeu = (): string => {
  const donnees: Record<string, string> = {};
  try {
    CLES_JEUX.forEach(cle => {
      const valeur = localStorage.getItem(cle);
      if (valeur !== null) donnees[cle] = valeur;
    });
  } catch {
    // Stockage bloqué : le jeu démarre sans ses anciens résultats
  }
  return encodeURIComponent(JSON.stringify(donnees));
};

const PanneauJeux = ({ isDarkMode, onClose }: PanneauJeuxProps) => {
  const { t } = useI18n();

  // Jeu affiché en plein écran, ou null quand on est sur la liste
  const [jeuOuvert, setJeuOuvert] = useState<Jeu | null>(null);

  // Adresse du jeu ouvert, figée à l'ouverture : sinon l'iframe se rechargerait à chaque nouveau rendu
  const [adresseJeu, setAdresseJeu] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fenêtre de la liste : le focus reste dedans tant qu'elle est affichée
  const dialogRef = useRef<HTMLDivElement>(null);

  useEscapeKey(onClose);
  useFocusTrap(dialogRef, jeuOuvert === null);

  // Le jeu envoie ici ses résultats à enregistrer. On n'écoute que l'iframe du jeu, et seulement ses clés autorisées
  useEffect(() => {
    const recevoirStockage = (event: MessageEvent) => {
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return;
      const message = event.data as { type?: unknown; cle?: unknown; valeur?: unknown } | null;
      if (message?.type !== 'nexus-stockage-jeu') return;
      if (typeof message.cle !== 'string' || !CLES_JEUX.includes(message.cle)) return;
      try {
        if (typeof message.valeur === 'string') {
          localStorage.setItem(message.cle, message.valeur);
        } else {
          localStorage.removeItem(message.cle);
        }
      } catch {
        // Stockage bloqué : le résultat reste affiché pendant la partie, sans être gardé
      }
    };
    window.addEventListener('message', recevoirStockage);
    return () => window.removeEventListener('message', recevoirStockage);
  }, []);

  // Ouvre un jeu en plein écran en lui transmettant ses données enregistrées
  const ouvrirJeu = (jeu: Jeu) => {
    setAdresseJeu(`${jeu.chemin}#${donneesPourJeu()}`);
    setJeuOuvert(jeu);
  };

  // Un jeu ouvert prend tout l'écran : pas besoin de fond ni de fenêtre autour
  if (jeuOuvert) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col bg-black">
        <div className={`flex items-center justify-between gap-2 px-3 py-2 ${isDarkMode ? 'bg-[#0a0e27]' : 'bg-white'}`}>
          <BoutonAction
            icon={<IconeChevronGauche />}
            label={t.interface.jeux.retourListe}
            isDarkMode={isDarkMode}
            onClick={() => setJeuOuvert(null)}
          />
          <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{jeuOuvert.titre}</span>
          <BoutonAction
            icon={<IconeFermer />}
            label={t.interface.jeux.fermer}
            isDarkMode={isDarkMode}
            onClick={onClose}
          />
        </div>
        {/* Le jeu vit dans sa propre page (dossier public/jeux/...). Le sandbox l'isole de NEXUS :
            sans allow-same-origin, il ne peut ni lire la session de connexion ni appeler l'API.
            allow-modals : les alert/confirm des outils. allow-scripts : les jeux sont en JavaScript.
            allow="fullscreen" : plein écran ; "microphone" : test du micro ; "clipboard-write" : copie de l'historique */}
        <iframe
          ref={iframeRef}
          src={adresseJeu}
          title={jeuOuvert.titre}
          sandbox="allow-scripts allow-modals"
          allow="fullscreen; microphone; clipboard-write"
          className="flex-1 w-full border-0"
        />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 flex overflow-y-auto p-4"
      onClick={onClose}
    >
      {/* Un clic dans la fenêtre ne la ferme pas : on arrête la remontée du clic vers le fond */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-jeux"
        className={`neo-glow m-auto w-full max-w-md p-6 rounded-lg flex flex-col gap-6 ${isDarkMode ? 'bg-[#0f1535]' : 'bg-white'}`}
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="titre-jeux" className="text-xl font-black neon-text">{t.interface.jeux.titre}</h2>
          <BoutonAction
            icon={<IconeFermer />}
            label={t.interface.jeux.fermer}
            isDarkMode={isDarkMode}
            onClick={onClose}
          />
        </div>

        <ul className="flex flex-col gap-3">
          {JEUX.map(jeu => (
            <li key={jeu.id}>
              <button
                type="button"
                onClick={() => ouvrirJeu(jeu)}
                className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${isDarkMode ? 'border-cyan-500/25 bg-[#0a0e27] text-gray-200 hover:border-cyan-400/60 hover:text-white' : 'border-cyan-300 bg-white text-gray-800 hover:border-cyan-500 hover:bg-cyan-50'}`}
              >
                <span className="font-semibold">{jeu.titre}</span>
                <span className={`text-sm ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>{t.interface.jeux.jouer}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PanneauJeux;

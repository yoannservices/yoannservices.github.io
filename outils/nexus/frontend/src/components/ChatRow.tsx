import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { Chat } from '../features/chats/types';
import { useEscapeKey } from '../features/focus/useEscapeKey';
import { conversationEnMarkdown, nomFichierMarkdown, telechargerTexte } from '../features/chats/exportMarkdown';
import { useI18n } from '../i18n/LangueProvider';
import type { Langue } from '../i18n/langue';
import { IconePoints } from './Icones';

// Doit rester identique à la limite côté serveur (backend/main.py)
const MAX_TITLE_LENGTH = 60;

// Nom affiché : le titre si l'élève en a donné un, sinon un libellé provisoire (traduit).
// Ce libellé provisoire n'est jamais enregistré comme titre : voir startRename et finishRename.
const getChatLabel = (chat: Chat, nomProvisoire: string): string => chat.title || nomProvisoire;

// Sous-titre : "il y a 5 min", "hier"... écrit par le navigateur dans la langue choisie (sans dépendance).
// Le chat n'a pas de date de dernière activité : on part de sa date de création.
const formatDateRelative = (isoDate: string, langue: Langue): string => {
  const time = Date.parse(isoDate);
  if (Number.isNaN(time)) return '';
  const formatter = new Intl.RelativeTimeFormat(langue === 'en' ? 'en-GB' : 'fr-FR', { numeric: 'auto', style: 'short' });

  // Écart en secondes, négatif pour le passé. On prend la plus grande unité qui tient dans cet écart.
  const ecartSecondes = (time - Date.now()) / 1000;
  const unites: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 365 * 86400],
    ['month', 30 * 86400],
    ['week', 7 * 86400],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unite, secondesParUnite] of unites) {
    if (Math.abs(ecartSecondes) >= secondesParUnite) {
      return formatter.format(Math.round(ecartSecondes / secondesParUnite), unite);
    }
  }
  // "|| 0" : Math.round peut donner -0, que le navigateur écrirait comme un passé
  return formatter.format(Math.round(ecartSecondes) || 0, 'second');
};

type ChatRowProps = {
  chat: Chat;
  isCurrent: boolean;
  isDarkMode: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
};

/**
 * ChatRow : une ligne de la liste (le nom du chat, le bouton "⋯" et son menu).
 * Chaque ligne gère elle-même son menu ouvert et son renommage en cours,
 * pour que ces états ne se mélangent pas entre deux chats.
 * Props :
 * - chat : le chat affiché.
 * - isCurrent : vrai si c'est le chat ouvert.
 * - isDarkMode : thème actuel.
 * - onSelect / onRename / onDelete : actions remontées à ChatList.
 */
const ChatRow = ({ chat, isCurrent, isDarkMode, onSelect, onRename, onDelete }: ChatRowProps) => {
  const { t, langue } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  // Suppression en deux temps : "Supprimer" ouvre une confirmation dans le menu, sans boîte du navigateur
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [draft, setDraft] = useState('');
  const rowRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);
  const supprimerRef = useRef<HTMLButtonElement>(null);
  const annulerRef = useRef<HTMLButtonElement>(null);
  // Identifiant unique : relie le texte de confirmation au groupe qu'il décrit, pour les lecteurs d'écran
  const idConfirmation = useId();
  const renameTextareaRef = useRef<HTMLTextAreaElement>(null);
  // Entrée, Échap et la perte de focus peuvent arriver les uns après les autres :
  // ce drapeau garantit qu'on ne termine le renommage qu'une seule fois.
  const renameDoneRef = useRef(false);
  const label = getChatLabel(chat, t.interface.liste.nouvelleConversation);
  const dateRelative = formatDateRelative(chat.created_at, langue);

  // Menu ouvert : un clic ailleurs le referme
  useEffect(() => {
    if (!isMenuOpen) return;

    // Le clic peut toucher n'importe quel élément : l'écouteur est posé sur le document
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && rowRef.current?.contains(target)) return;
      setIsMenuOpen(false);
      setIsConfirmingDelete(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isMenuOpen]);

  // Menu ouvert : Échap referme la confirmation si elle est ouverte (comme "Mon compte"), sinon le menu,
  // et rend le focus au bouton "⋯" pour que le clavier retrouve sa place.
  // useEscapeKey arrête la propagation : la même touche ne ferme pas aussi les portes.
  const fermerMenu = useCallback(() => {
    setIsMenuOpen(false);
    setIsConfirmingDelete(false);
    menuButtonRef.current?.focus();
  }, []);
  const gererEchapMenu = useCallback(() => {
    if (isConfirmingDelete) setIsConfirmingDelete(false);
    else fermerMenu();
  }, [isConfirmingDelete, fermerMenu]);
  useEscapeKey(gererEchapMenu, isMenuOpen);

  // Menu ouvert : le focus va sur la première option, pour pouvoir utiliser le clavier tout de suite
  useEffect(() => {
    if (isMenuOpen) firstMenuItemRef.current?.focus();
  }, [isMenuOpen]);

  // Confirmation ouverte : le focus va sur "Annuler", pour qu'une touche Entrée distraite ne supprime rien.
  // Confirmation refermée (Annuler ou Échap) : le focus revient sur "Supprimer", le bouton qui l'a ouverte.
  // Au moment où le menu se ferme, le bouton n'existe plus : la référence est vide et rien ne se passe.
  useEffect(() => {
    if (isConfirmingDelete) annulerRef.current?.focus();
    else supprimerRef.current?.focus();
  }, [isConfirmingDelete]);

  // Passage en mode renommage : le champ prend le focus et tout le texte est sélectionné
  useEffect(() => {
    if (!isRenaming) return;
    renameTextareaRef.current?.focus();
    renameTextareaRef.current?.select();
  }, [isRenaming]);

  // Le champ part du vrai titre seulement : un chat sans titre part d'un champ vide (le libellé provisoire
  // ne devient jamais un titre, il sert seulement de texte grisé dans le champ)
  const startRename = () => {
    setIsMenuOpen(false);
    renameDoneRef.current = false;
    setDraft(chat.title || '');
    setIsRenaming(true);
  };

  // Télécharge la conversation en .md. Le menu se referme, et le focus revient sur le bouton "⋯".
  const exporterChat = () => {
    setIsMenuOpen(false);
    const libelles = {
      titreDefaut: t.interface.liste.nouvelleConversation,
      roleEleve: t.interface.liste.exportRoleEleve,
      roleNexus: t.interface.liste.exportRoleNexus,
    };
    telechargerTexte(nomFichierMarkdown(label), conversationEnMarkdown(chat, libelles));
    menuButtonRef.current?.focus();
  };

  // Ouvre la suppression : le menu reste ouvert, avec la question et les deux boutons
  const supprimerChat = () => {
    setIsMenuOpen(false);
    setIsConfirmingDelete(false);
    onDelete();
  };

  // Termine le renommage. Si on n'enregistre pas (Échap), ou si le titre est vide ou inchangé,
  // on ne fait aucun appel réseau.
  const finishRename = (shouldSave: boolean) => {
    if (renameDoneRef.current) return;
    renameDoneRef.current = true;
    setIsRenaming(false);

    // Un titre tient sur une seule ligne : les sauts de ligne (collés, par exemple) et les espaces multiples
    // deviennent un seul espace
    const newTitle = draft.replace(/\s+/g, ' ').trim();
    // Comparé au vrai titre (et non au libellé affiché) : un chat sans titre n'est jamais "inchangé"
    if (!shouldSave || newTitle === '' || newTitle === (chat.title || '')) return;
    onRename(newTitle);
  };

  // Pendant un renommage, Échap annule : useEscapeKey s'en charge (il passe avant la zone de texte,
  // et arrête la touche pour qu'elle ne ferme pas aussi les portes).
  useEscapeKey(() => finishRename(false), isRenaming);

  const handleRenameKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    // Pendant la composition d'un caractère (IME), Entrée sert à valider le caractère, pas le renommage
    if (event.nativeEvent.isComposing) return;
    // Entrée, Maj+Entrée et Ctrl+Entrée valident le renommage. On bloque le retour à la ligne :
    // un titre de chat reste sur une seule ligne logique.
    if (event.key === 'Enter') {
      event.preventDefault();
      finishRename(true);
    }
  };

  if (isRenaming) {
    return (
      <div className="relative">
        {/* Zone de texte sur 2 lignes : un long nom passe à la ligne au lieu de défiler. Entrée valide (voir handleRenameKeyDown). */}
        <textarea
          ref={renameTextareaRef}
          value={draft}
          rows={2}
          // Pour un chat sans titre, le libellé provisoire s'affiche en grisé : c'est un indice, pas le texte enregistré
          placeholder={chat.title ? undefined : label}
          maxLength={MAX_TITLE_LENGTH}
          aria-label={t.interface.liste.nouveauNom}
          onChange={event => setDraft(event.target.value)}
          onKeyDown={handleRenameKeyDown}
          onBlur={() => finishRename(true)}
          className={`w-full px-3 py-2 rounded-lg text-sm outline-none resize-none whitespace-pre-wrap break-words ${
            isDarkMode ? 'bg-[color:var(--saisie-fond)] text-white border border-cyan-400' : 'bg-white text-gray-900 placeholder-gray-500 border border-blue-400'
          }`}
        />
      </div>
    );
  }

  return (
    <div ref={rowRef} data-chat-id={chat.id} className="relative">
      <button
        onClick={onSelect}
        // aria-current : les lecteurs d'écran annoncent quel chat est ouvert
        aria-current={isCurrent ? 'true' : undefined}
        className={`w-full px-3 min-h-11 py-2.5 pr-12 sm:pr-14 lg:pr-24 rounded-lg text-left text-sm break-words transition-colors ${
          isCurrent
            ? `${isDarkMode ? 'bg-cyan-500/30 border border-cyan-400' : 'bg-blue-200 border border-blue-400'}`
            : `${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'}`
        }`}
      >
        <span className="block">{label}</span>
        {/* Sous-titre discret : la date relative de la dernière activité. Le contraste reste lisible sur les deux fonds. */}
        {dateRelative && (
          <span className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{dateRelative}</span>
        )}
      </button>
      {/* Bouton "Options" avec icône (40px de haut) : le padding du bouton du chat réserve la place pour ne pas le chevaucher.
          top-0 : quand le nom passe sur plusieurs lignes, le bouton reste à côté de la première au lieu de flotter au milieu.
          Icône seule jusqu'à l'écran large : le libellé rendrait la liste trop étroite pour le nom du chat. */}
      <button
        ref={menuButtonRef}
        onClick={() => {
          // Ouvrir ou refermer le menu repart toujours du menu normal, sans confirmation restée ouverte
          setIsConfirmingDelete(false);
          setIsMenuOpen(open => !open);
        }}
        aria-label={t.interface.liste.optionsChat}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        className={`absolute right-1 top-0 h-11 w-11 flex items-center justify-center gap-1.5 rounded-md border px-0 text-sm font-medium transition-colors lg:h-10 lg:w-auto lg:justify-start lg:px-2.5 ${
          isDarkMode
            ? 'border-cyan-500/25 text-gray-200 hover:border-cyan-400/60 hover:bg-cyan-400/10'
            : 'border-blue-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50'
        }`}
      >
        <IconePoints width="16" height="16" />
        <span className="sr-only lg:not-sr-only">{t.interface.liste.options}</span>
      </button>
      {isMenuOpen && (
        // Sans confirmation, le menu est un role="menu" (seules des options y sont permises).
        // Avec la confirmation, ce sont des boutons : on passe alors à un simple groupe nommé par la question.
        <div
          role={isConfirmingDelete ? 'group' : 'menu'}
          aria-labelledby={isConfirmingDelete ? idConfirmation : undefined}
          className={`absolute right-1 top-full mt-1 z-20 min-w-[10rem] p-1 rounded-lg border shadow-lg flex flex-col ${
            isDarkMode ? 'bg-[color:var(--surface)] border-cyan-500/30 text-white' : 'bg-[color:var(--surface)] border-gray-300 text-gray-900'
          }`}
        >
          {isConfirmingDelete ? (
            <div className="flex flex-col gap-2 p-2">
              <p id={idConfirmation} className="text-sm">
                {t.interface.liste.confirmerSuppression}
              </p>
              {/* Annuler est à gauche, comme dans "Mon compte". Il reçoit le focus à l'ouverture (voir l'effet plus haut). */}
              <div className="flex gap-2">
                <button
                  ref={annulerRef}
                  onClick={() => setIsConfirmingDelete(false)}
                  className={`flex-1 px-3 py-2 rounded text-sm font-bold ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                  }`}
                >
                  {t.interface.liste.annuler}
                </button>
                <button
                  onClick={supprimerChat}
                  className="flex-1 px-3 py-2 rounded text-sm font-bold bg-red-600 hover:bg-red-700 text-white"
                >
                  {t.interface.liste.supprimer}
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                ref={firstMenuItemRef}
                role="menuitem"
                onClick={startRename}
                className={`w-full px-3 min-h-11 py-2.5 rounded text-left text-sm ${
                  isDarkMode ? 'hover:bg-cyan-500/20 focus-visible:bg-cyan-500/20' : 'hover:bg-blue-100 focus-visible:bg-blue-100'
                }`}
              >
                {t.interface.liste.renommer}
              </button>
              <button
                role="menuitem"
                onClick={exporterChat}
                className={`w-full px-3 min-h-11 py-2.5 rounded text-left text-sm ${
                  isDarkMode ? 'hover:bg-cyan-500/20 focus-visible:bg-cyan-500/20' : 'hover:bg-blue-100 focus-visible:bg-blue-100'
                }`}
              >
                {t.interface.liste.exporter}
              </button>
              <button
                ref={supprimerRef}
                role="menuitem"
                onClick={() => setIsConfirmingDelete(true)}
                className={`w-full px-3 min-h-11 py-2.5 rounded text-left text-sm ${isDarkMode ? 'text-red-400' : 'text-red-700'} ${
                  isDarkMode ? 'hover:bg-red-500/20 focus-visible:bg-red-500/20' : 'hover:bg-red-100 focus-visible:bg-red-100'
                }`}
              >
                {t.interface.liste.supprimer}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatRow;

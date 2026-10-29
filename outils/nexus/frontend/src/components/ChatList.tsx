import { useEffect, useRef } from 'react';
import type { Chat } from '../features/chats/types';
import { useEscapeKey } from '../features/focus/useEscapeKey';
import { useFocusTrap } from '../features/focus/useFocusTrap';
import { useI18n } from '../i18n/LangueProvider';
import BoutonAction from './BoutonAction';
import ChatRow from './ChatRow';
import { IconeChevronDroite, IconeChevronGauche, IconeFermer } from './Icones';

/**
 * ChatList : la liste des conversations, rangée dans une "aside".
 * Chaque chat a un bouton "Options" qui ouvre un petit menu (Renommer, Supprimer) : voir ChatRow.
 * Props :
 * - chats : les chats à afficher, déjà triés du plus récent au plus ancien.
 * - currentChatId : identifiant du chat ouvert, pour le mettre en évidence.
 * - onSelectChat : appelé avec l'identifiant du chat cliqué.
 * - onNewChat : appelé quand on clique sur "Nouveau chat".
 * - onDeleteChat : appelé avec l'identifiant du chat dont on veut supprimer la conversation.
 * - onRenameChat : appelé avec l'identifiant du chat et le nouveau titre (déjà nettoyé des espaces).
 * - isDarkMode : thème actuel, pour choisir les couleurs.
 * - isDrawerOpen / onCloseDrawer : tiroir sur téléphone (ouvert ou non, et fermeture).
 * - isListOpen / onToggleList : colonne dépliée ou réduite sur tablette et ordinateur.
 * Sur téléphone (moins de 640px) : c'est un tiroir fixe qui glisse depuis la gauche, par-dessus le chat.
 * Il se ferme avec la croix, un clic sur le fond sombre ou la touche Échap.
 * À partir de 640px : c'est une colonne normale à côté du chat, plus étroite sur tablette.
 * Un bouton ◀ la replie en une barre étroite (▶ la rouvre) ; le chat prend alors toute la largeur.
 */

type ChatListProps = {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, title: string) => void;
  isDarkMode: boolean;
  // Téléphone : vrai quand le tiroir est ouvert (le tiroir est ouvert par le bouton ☰ de l'en-tête).
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
  // Tablette et ordinateur : vrai quand la liste est dépliée, faux quand elle est réduite à une barre étroite.
  isListOpen: boolean;
  onToggleList: () => void;
};

const ChatList = ({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  isDarkMode,
  isDrawerOpen,
  onCloseDrawer,
  isListOpen,
  onToggleList,
}: ChatListProps) => {
  const { t } = useI18n();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const nouveauChatRef = useRef<HTMLButtonElement>(null);
  // Où mettre le focus une fois le chat supprimé : sur le chat suivant de la liste, sinon sur "Nouveau chat".
  // Le bouton supprimé disparaît, sans cela le focus se perdrait au début de la page.
  const focusApresSuppressionRef = useRef<{ supprimeId: string; cible: string | null } | null>(null);

  // La liste change : si le chat supprimé n'y est plus, la suppression a réussi et on déplace le focus.
  // Tant qu'il est encore là (suppression en cours, ou échouée), on ne touche à rien.
  useEffect(() => {
    const attente = focusApresSuppressionRef.current;
    if (!attente || chats.some(chat => chat.id === attente.supprimeId)) return;
    focusApresSuppressionRef.current = null;
    if (attente.cible === null) {
      nouveauChatRef.current?.focus();
      return;
    }
    drawerRef.current?.querySelector<HTMLElement>(`[data-chat-id="${CSS.escape(attente.cible)}"] > button`)?.focus();
  }, [chats]);

  // Choisit le chat qui recevra le focus (le suivant, ou le précédent s'il s'agit du dernier), puis lance la suppression
  const handleDeleteChat = (chatId: string) => {
    const index = chats.findIndex(chat => chat.id === chatId);
    const suivant = chats[index + 1] ?? chats[index - 1] ?? null;
    focusApresSuppressionRef.current = { supprimeId: chatId, cible: suivant?.id ?? null };
    onDeleteChat(chatId);
  };

  // Tiroir ouvert : Échap le referme. useEscapeKey arrête la propagation, sinon useDoors reçoit
  // la même touche et ramène aussi l'élève à l'accueil (même logique que "Mon compte").
  useEscapeKey(onCloseDrawer, isDrawerOpen);

  // Tiroir ouvert : le focus reste dedans (Tab boucle) et va d'abord sur la croix, pour le clavier et les lecteurs d'écran
  useFocusTrap(drawerRef, isDrawerOpen, closeButtonRef);

  return (
    <>
      {/* Fond sombre (téléphone seulement) : un clic dessus ferme le tiroir */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 sm:hidden" onClick={onCloseDrawer} aria-hidden="true" />
      )}

      {/* Le tiroir glisse grâce à transform ; visibility évite qu'il reste cliquable ou accessible au clavier une fois fermé.
          À partir de 640px, les classes "sm:" le remettent en colonne normale. Réduite, la colonne ne garde que sa barre étroite. */}
      <aside
        ref={drawerRef}
        aria-label={t.interface.liste.listeConversations}
        className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] p-4 flex flex-col gap-4 border-r border-cyan-500/30 transition-[transform,visibility] duration-300 ease-out ${
          isDrawerOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'
        } bg-[color:var(--panneau)] sm:static sm:z-auto sm:max-w-none sm:flex-shrink-0 sm:translate-x-0 sm:visible sm:transition-none ${
          isListOpen ? 'sm:w-56 lg:w-64' : 'sm:w-auto sm:p-2 lg:w-auto'
        }`}
      >
        {/* En-tête du tiroir : visible seulement sur téléphone, où il faut un moyen de le fermer */}
        <div className="flex items-center justify-between sm:hidden">
          <h2 className="text-lg font-black neon-text">{t.interface.liste.titreTiroir}</h2>
          <BoutonAction
            ref={closeButtonRef}
            icon={<IconeFermer />}
            label={t.interface.liste.fermer}
            isDarkMode={isDarkMode}
            onClick={onCloseDrawer}
            aria-label={t.interface.liste.fermerTiroir}
          />
        </div>

        {/* Bouton de repli : visible seulement sur tablette et ordinateur (c'est le seul bouton d'ouverture/fermeture
            de cette taille d'écran). Réduite, la liste ne montre que ce bouton, avec une flèche pour la rouvrir. */}
        <div className={`hidden sm:flex ${isListOpen ? 'justify-end' : 'justify-center'}`}>
          <BoutonAction
            icon={isListOpen ? <IconeChevronGauche /> : <IconeChevronDroite />}
            label={isListOpen ? t.interface.liste.labelReplier : t.interface.liste.labelAfficher}
            isDarkMode={isDarkMode}
            onClick={onToggleList}
            aria-label={t.interface.liste.listeConversations}
            aria-expanded={isListOpen}
            title={isListOpen ? t.interface.liste.replier : t.interface.liste.afficher}
          />
        </div>

        {/* Le bouton "Nouveau chat" et les conversations sont cachés quand la liste est réduite (ordinateur et tablette) */}
        <div className={`flex-1 min-h-0 flex flex-col gap-4 ${isListOpen ? '' : 'sm:hidden'}`}>
          <button
            ref={nouveauChatRef}
            onClick={() => {
              onNewChat();
              onCloseDrawer();
            }}
            className="chip-btn w-full px-4 min-h-11 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-700 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/50"
          >
            {t.interface.liste.nouveauChat}
          </button>
          <div className="flex-1 overflow-y-auto space-y-2">
            {chats.map(chat => (
              <ChatRow
                key={chat.id}
                chat={chat}
                isCurrent={currentChatId === chat.id}
                isDarkMode={isDarkMode}
                onSelect={() => {
                  onSelectChat(chat.id);
                  // Sur téléphone, le tiroir se referme dès qu'un chat est choisi
                  onCloseDrawer();
                }}
                onRename={title => onRenameChat(chat.id, title)}
                onDelete={() => handleDeleteChat(chat.id)}
              />
            ))}
            {/* Aucun chat : un petit texte discret à la place de la liste vide */}
            {chats.length === 0 && (
              <p className={`px-2 py-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t.interface.liste.aucuneConversation}
              </p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default ChatList;

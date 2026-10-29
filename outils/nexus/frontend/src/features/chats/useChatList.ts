import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createChatOnServer, deleteChatOnServer, fetchChats, renameChatOnServer } from './chatApi';
import { sortNewestFirst } from './sortChats';
import type { Chat } from './types';

// Crée un chat pour ce compte côté serveur et renvoie la version locale (vide). En cas d'échec : null.
const createChat = async (token: string): Promise<Chat | null> => {
  try {
    const chatId = await createChatOnServer(token);
    return { id: chatId, created_at: new Date().toISOString(), messages: [] };
  } catch (err) {
    console.error('Erreur lors de la création du chat:', err);
    return null;
  }
};

// Vrai si le compte d'une requête est toujours celui qui est affiché (fourni par useChats)
export type VerifieCompte = (accountToken: string) => boolean;

// Action de la liste qui a échoué. On garde un code (et non un texte) : le message est écrit dans la langue affichée (voir App).
export type ErreurListe = 'creation' | 'renommage' | 'suppression';

// Ce que la liste expose aux autres hooks : le chat ouvert, et un moyen de le modifier
export type EtatListeChats = {
  currentChat: Chat | null;
  currentChatId: string | null;
  // Modifie un chat de la liste à partir de sa version actuelle. Ne fait rien si le chat n'existe plus.
  updateChat: (chatId: string, modifier: (chat: Chat) => Chat) => void;
};

// Gère la liste des chats du compte connecté : chargement (avec nouvel essai), sélection, création, suppression et renommage.
// `token` est le jeton du compte courant, ou null si personne n'est connecté. Sans jeton, rien n'est chargé ni créé.
export const useChatList = (token: string | null, isSameAccount: VerifieCompte) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  // Vrai si le chargement a échoué et qu'aucun chat ne peut être ouvert : ChatWindow propose alors "Réessayer"
  const [chatsLoadError, setChatsLoadError] = useState(false);
  // Dernière action de la liste qui a échoué. Le numéro change à chaque échec, même s'il est identique au précédent,
  // pour que le message s'affiche de nouveau.
  const [erreurListe, setErreurListe] = useState<{ code: ErreurListe; id: number } | null>(null);
  // Augmenté à chaque "Réessayer" : le changement relance le chargement
  const [tentativeChargement, setTentativeChargement] = useState(0);
  // Compte pour lequel la liste ci-dessus a été chargée
  const [ownerToken, setOwnerToken] = useState<string | null>(token);

  // Changement de compte : on vide la liste pendant le rendu, pour ne jamais montrer les chats de l'ancien compte
  if (ownerToken !== token) {
    setOwnerToken(token);
    setChats([]);
    setCurrentChatId(null);
    setChatsLoadError(false);
  }

  // Copies à jour de la liste et du chat ouvert. Après une attente réseau, une valeur capturée au moment du clic
  // peut être périmée : on lit ces références au moment où on en a besoin.
  const chatsRef = useRef(chats);
  const currentChatIdRef = useRef(currentChatId);
  useLayoutEffect(() => {
    chatsRef.current = chats;
    currentChatIdRef.current = currentChatId;
  }, [chats, currentChatId]);

  const currentChat = chats.find(c => c.id === currentChatId) || null;

  // Modifie un chat à partir de sa version la plus récente (la modification passe par la forme fonctionnelle de setChats)
  const updateChat = (chatId: string, modifier: (chat: Chat) => Chat) => {
    setChats(prev => prev.map(chat => (chat.id === chatId ? modifier(chat) : chat)));
  };

  // Charge les chats du compte connecté, sélectionne le plus récent, et crée un chat s'il n'en existe pas
  useEffect(() => {
    if (!token) return;

    // Passe à true si le compte change pendant le chargement, ou si React annule cet effet.
    // En StrictMode (dev), React lance les effets deux fois : sans ce drapeau, on créerait deux chats vides.
    let isStale = false;
    const isStillCurrent = (): boolean => !isStale && isSameAccount(token);

    const loadChats = async () => {
      try {
        const loadedChats = sortNewestFirst(await fetchChats(token));
        if (!isStillCurrent()) return;

        if (loadedChats.length > 0) {
          setChats(loadedChats);
          setCurrentChatId(loadedChats[0].id);
          return;
        }
        const newChat = await createChat(token);
        if (!isStillCurrent()) return;
        if (newChat) {
          setChats([newChat]);
          setCurrentChatId(newChat.id);
        } else {
          // Sans chat ouvert et sans chat créé, l'élève ne peut rien faire : on lui propose de réessayer
          setChatsLoadError(true);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des chats:', err);
        if (isStillCurrent()) setChatsLoadError(true);
      }
    };
    loadChats();

    return () => {
      isStale = true;
    };
  }, [token, isSameAccount, tentativeChargement]);

  const signalerErreurListe = (code: ErreurListe) => {
    setErreurListe(prev => ({ code, id: (prev?.id ?? 0) + 1 }));
  };

  // Retire le message d'erreur (appelé par le toast quand son délai est écoulé)
  const effacerErreurListe = useCallback(() => setErreurListe(null), []);

  // Relance le chargement après une erreur (bouton "Réessayer")
  const reloadChats = () => {
    setChatsLoadError(false);
    setTentativeChargement(n => n + 1);
  };

  // Crée un nouveau chat, le place en tête de liste et l'ouvre. Renvoie vrai si la création a réussi.
  const createNewChat = async (): Promise<boolean> => {
    if (!token) return false;
    const newChat = await createChat(token);
    if (!isSameAccount(token)) return false;
    if (!newChat) {
      signalerErreurListe('creation');
      return false;
    }
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    return true;
  };

  // Ouvre un chat de la liste
  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  // Supprime un chat côté serveur, puis le retire de la liste. Renvoie vrai si c'était le chat ouvert
  // (l'appelant doit alors vider la saisie). Si le chat ouvert a disparu, on ouvre le plus récent restant,
  // ou on en crée un vide s'il ne reste rien.
  const deleteChat = async (chatId: string): Promise<boolean> => {
    if (!token) return false;
    try {
      await deleteChatOnServer(token, chatId);
    } catch (err) {
      console.error('Erreur lors de la suppression du chat:', err);
      signalerErreurListe('suppression');
      return false;
    }
    if (!isSameAccount(token)) return false;

    setChats(prev => prev.filter(c => c.id !== chatId));
    // Lecture à jour : l'élève a pu changer de chat pendant la suppression, il ne faut pas se fier à la valeur du clic
    if (chatId !== currentChatIdRef.current) return false;

    const remaining = chatsRef.current.filter(c => c.id !== chatId);
    if (remaining.length > 0) {
      // La liste est triée du plus récent au plus ancien : le premier est le plus récent
      setCurrentChatId(remaining[0].id);
      return true;
    }

    const newChat = await createChat(token);
    if (!isSameAccount(token)) return true;
    if (newChat) {
      setChats(prev => [newChat, ...prev]);
      setCurrentChatId(newChat.id);
    } else {
      setCurrentChatId(null);
      signalerErreurListe('creation');
    }
    return true;
  };

  // Renomme un chat côté serveur. Le nom n'est changé dans la liste qu'après succès :
  // en cas d'échec, l'ancien nom reste affiché. Un titre vide ne fait aucun appel réseau.
  const renameChat = async (chatId: string, title: string) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || !token) return;

    try {
      await renameChatOnServer(token, chatId, trimmedTitle);
    } catch (err) {
      console.error('Erreur lors du renommage du chat:', err);
      signalerErreurListe('renommage');
      return;
    }
    if (!isSameAccount(token)) return;

    updateChat(chatId, chat => ({ ...chat, title: trimmedTitle }));
  };

  return {
    chats,
    currentChat,
    currentChatId,
    chatsLoadError,
    erreurListe,
    effacerErreurListe,
    reloadChats,
    createNewChat,
    selectChat,
    deleteChat,
    renameChat,
    updateChat,
  };
};

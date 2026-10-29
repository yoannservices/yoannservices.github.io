import { useCallback, useLayoutEffect, useRef } from 'react';
import { useChatList } from './useChatList';
import { useChatMessages } from './useChatMessages';

// Point d'entrée des chats pour l'interface : relie la liste des chats (useChatList)
// et les messages et fichiers du chat ouvert (useChatMessages). Les composants n'ont besoin que de ce hook.
// `token` est le jeton du compte courant, ou null si personne n'est connecté.
export const useChats = (token: string | null) => {
  // Jeton du compte actuellement affiché : une réponse qui arrive après un changement de compte est ignorée.
  // Mis à jour au commit (useLayoutEffect) : une réponse réseau de l'ancien compte ne peut pas passer avant.
  const activeTokenRef = useRef<string | null>(token);
  useLayoutEffect(() => {
    activeTokenRef.current = token;
  }, [token]);
  const isSameAccount = useCallback((accountToken: string): boolean => activeTokenRef.current === accountToken, []);

  const liste = useChatList(token, isSameAccount);
  const messages = useChatMessages(token, isSameAccount, liste);

  // Changer de chat (ou en créer un) vide la saisie : on ne veut pas envoyer un brouillon dans le mauvais chat
  const createNewChat = async () => {
    if (await liste.createNewChat()) messages.clearDraft();
  };

  const selectChat = (chatId: string) => {
    // Cliquer sur le chat déjà ouvert ne change rien : le message à moitié tapé doit rester dans la saisie
    if (chatId === liste.currentChatId) return;
    liste.selectChat(chatId);
    messages.clearDraft();
  };

  const deleteChat = async (chatId: string) => {
    if (await liste.deleteChat(chatId)) messages.clearDraft();
  };

  return {
    chats: liste.chats,
    currentChat: liste.currentChat,
    currentChatId: liste.currentChatId,
    chatsLoadError: liste.chatsLoadError,
    erreurListe: liste.erreurListe,
    effacerErreurListe: liste.effacerErreurListe,
    reloadChats: liste.reloadChats,
    inputChatMessage: messages.inputChatMessage,
    setInputChatMessage: messages.setInputChatMessage,
    isTyping: messages.isTyping,
    errorChatId: messages.errorChatId,
    createNewChat,
    selectChat,
    deleteChat,
    renameChat: liste.renameChat,
    sendMessage: messages.sendMessage,
    retryMessage: messages.retryMessage,
    stopMessage: messages.stopMessage,
    attachFile: messages.attachFile,
    removePendingFile: messages.removePendingFile,
    isUploading: messages.isUploading,
    fileError: messages.fileError,
  };
};

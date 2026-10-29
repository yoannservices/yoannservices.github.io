import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { deleteFileOnServer, FileUploadError, streamMessageToChat, uploadFileToChat } from './chatApi';
import { MAX_FICHIERS_EN_ATTENTE, libelleErreurFichier, verifierFichier } from './fichierConfig';
import type { EtatListeChats, VerifieCompte } from './useChatList';
import type { ChatMessage, ErreurFichier, FileError } from './types';
import { useI18n } from '../../i18n/LangueProvider';

// Longueur maximale d'un message, en caractères. Même valeur que MESSAGE_MAX_LENGTH dans backend/main.py : à changer aux deux endroits.
const MESSAGE_MAX_LENGTH = 2000;

// Gère la saisie, l'envoi des messages et les fichiers joints, pour le chat ouvert.
// `token` est le compte courant. `isSameAccount` dit si une réponse appartient encore au compte affiché.
// `liste` donne le chat ouvert et permet de le modifier (fourni par useChatList).
export const useChatMessages = (token: string | null, isSameAccount: VerifieCompte, liste: EtatListeChats) => {
  // Langue affichée : sert à écrire les messages d'erreur au moment où on les montre
  const { t } = useI18n();
  const { currentChat, currentChatId, updateChat } = liste;
  const [inputChatMessage, setInputChatMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // Annulation de l'envoi en cours : le bouton "Arrêter" appelle abort() sur ce contrôleur
  const controleurEnvoi = useRef<AbortController | null>(null);
  // Chat dans lequel le dernier envoi a échoué : la bulle d'erreur n'apparaît que là
  const [errorChatId, setErrorChatId] = useState<string | null>(null);
  // Dernier envoi échoué (chat et texte exacts). Le texte peut aussi être dans la saisie, mais l'élève a pu
  // taper autre chose depuis : on garde donc une copie, pour que "Réessayer" renvoie toujours le même message.
  // Une référence suffit : seul le clic sur "Réessayer" la lit, rien ne s'affiche à partir de sa valeur.
  const envoiEchoue = useRef<{ chatId: string; texte: string } | null>(null);
  // Erreur d'ajout de fichier, avec le chat où elle est arrivée : elle ne s'affiche que dans ce chat.
  // On garde le code de l'erreur, pas son texte : le texte change si l'élève change de langue.
  const [fileErrorState, setFileErrorState] = useState<{
    chatId: string;
    erreur: ErreurFichier;
    analyse?: string;
  } | null>(null);
  // Vrai après un envoi refusé parce que le message est trop long. Le texte reste dans la saisie.
  const [messageRefuse, setMessageRefuse] = useState(false);
  // Vrai pendant l'analyse d'un fichier (le bouton 📎 est alors désactivé)
  const [isUploading, setIsUploading] = useState(false);
  // Compte pour lequel les données ci-dessus ont été chargées
  const [ownerToken, setOwnerToken] = useState<string | null>(token);

  // Changement de compte : on vide la saisie et les états d'envoi pendant le rendu
  if (ownerToken !== token) {
    setOwnerToken(token);
    setInputChatMessage('');
    setIsTyping(false);
    setErrorChatId(null);
    setFileErrorState(null);
    setMessageRefuse(false);
    setIsUploading(false);
  }

  // Déconnexion ou session expirée : le jeton change (il passe à null), donc le nettoyage de cet effet s'exécute.
  // On coupe alors le flux en cours, sinon le serveur continuerait d'écrire la réponse et de consommer des jetons Claude.
  // Ce n'est pas une erreur : le bloc "arrêt voulu" de envoyerTexte ignore l'abandon sans message rouge.
  useEffect(() => () => {
    controleurEnvoi.current?.abort();
    controleurEnvoi.current = null;
  }, [token]);

  // Vide la saisie et l'erreur de fichier. Appelé quand le chat ouvert change : on ne veut pas
  // envoyer un brouillon dans le mauvais chat, ni voir revenir une erreur de fichier plus tard.
  const clearDraft = () => {
    setInputChatMessage('');
    setFileErrorState(null);
    setMessageRefuse(false);
  };

  // Envoie le message de la saisie au chat actuel
  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const texte = inputChatMessage.trim();
    // Message trop long : on n'envoie rien et le texte reste dans la saisie, pour que l'élève le raccourcisse
    if ([...texte].length > MESSAGE_MAX_LENGTH) {
      setMessageRefuse(true);
      return;
    }
    setMessageRefuse(false);
    await envoyerTexte(texte);
  };

  // Renvoie le dernier message qui a échoué, dans le même chat. Le bouton "Réessayer" n'existe que dans ce cas.
  const retryMessage = async () => {
    const echec = envoiEchoue.current;
    if (!echec || echec.chatId !== currentChatId) return;
    await envoyerTexte(echec.texte);
  };

  // Envoie `messageText` (déjà sans espaces au début et à la fin) au chat actuel. Sert à l'envoi normal et au réessai.
  const envoyerTexte = async (messageText: string) => {
    if (!token || !currentChatId || !messageText || isTyping) return;

    const chatId = currentChatId;
    setErrorChatId(null);
    setIsTyping(true);
    // Un contrôleur par envoi : le bouton "Arrêter" peut annuler cette requête pendant qu'elle lit la réponse
    const controleur = new AbortController();
    controleurEnvoi.current = controleur;
    // Texte reçu jusqu'ici : permet de savoir, en cas d'arrêt, s'il reste quelque chose à garder
    let texteRecu = '';

    // Affichage immédiat : le message de l'élève apparaît tout de suite, et la réponse de NEXUS commence vide
    // (animation de réflexion) puis se remplit au fil de l'écriture. Ce sont des messages provisoires :
    // le serveur les remplace par les siens à la fin du flux.
    const suffixe = Date.now();
    const idEleve = `envoi-${suffixe}`;
    const idReponse = `reponse-${suffixe}`;
    const maintenant = new Date().toISOString();
    const fichiersJoints = (currentChat?.fichiers_en_attente ?? []).map(fichier => ({ id: fichier.id, name: fichier.name }));
    const messagesProvisoires: ChatMessage[] = [
      { id: idEleve, chat_id: chatId, role: 'user', content: messageText, timestamp: maintenant, fichiers: fichiersJoints },
      { id: idReponse, chat_id: chatId, role: 'assistant', content: '', timestamp: maintenant, fichiers: [], enCours: true },
    ];
    updateChat(chatId, chat => ({ ...chat, messages: [...chat.messages, ...messagesProvisoires] }));
    // On vide la saisie seulement si elle contient encore ce texte : au réessai, l'élève peut avoir commencé à taper autre chose
    setInputChatMessage(prev => (prev.trim() === messageText ? '' : prev));

    const estProvisoire = (msg: ChatMessage): boolean => msg.id === idEleve || msg.id === idReponse;

    try {
      const data = await streamMessageToChat(token, chatId, messageText, morceau => {
        texteRecu += morceau;
        if (!isSameAccount(token)) return;
        // Chaque morceau reçu s'ajoute à la fin de la réponse provisoire
        updateChat(chatId, chat => ({
          ...chat,
          messages: chat.messages.map(msg => (msg.id === idReponse ? { ...msg, content: msg.content + morceau } : msg)),
        }));
      }, controleur.signal);
      // Réponse d'un ancien compte : on ne l'affiche pas (le changement de compte a déjà tout vidé)
      if (!isSameAccount(token)) return;

      // Les fichiers envoyés avec ce message ne sont plus en attente. On retire seulement ceux-là :
      // un fichier ajouté pendant l'envoi reste en attente, comme sur le serveur.
      const fichiersEnvoyes = new Set((data.message.fichiers ?? []).map(fichier => fichier.id));
      // Le titre n'est remplacé que s'il est non vide : après le premier échange, NEXUS vient de le générer.
      updateChat(chatId, chat => ({
        ...chat,
        title: data.title || chat.title,
        fichiers_en_attente: (chat.fichiers_en_attente ?? []).filter(fichier => !fichiersEnvoyes.has(fichier.id)),
        // Les messages provisoires sont remplacés par ceux du serveur
        messages: [...chat.messages.filter(msg => !estProvisoire(msg)), data.message, data.reply],
      }));
    } catch (err) {
      // Arrêt voulu par l'élève : ce n'est pas une erreur, donc pas de message rouge et pas de journal d'erreur
      if (controleur.signal.aborted) {
        if (!isSameAccount(token)) return;
        if (texteRecu === '') {
          // Arrêt avant le premier mot : une bulle vide avec un bouton "Copier" n'a pas de sens, on rend le message à l'élève
          updateChat(chatId, chat => ({ ...chat, messages: chat.messages.filter(msg => !estProvisoire(msg)) }));
          setInputChatMessage(prev => (prev.trim() === '' ? messageText : prev));
        } else {
          // Texte déjà reçu : il reste affiché, et la bulle n'est plus marquée "en cours" (plus de curseur, bouton "Copier")
          updateChat(chatId, chat => ({
            ...chat,
            messages: chat.messages.map(msg => (msg.id === idReponse ? { ...msg, enCours: false } : msg)),
          }));
        }
        return;
      }
      // Échec : les messages provisoires disparaissent et le texte revient dans la saisie, pour réessayer
      console.error('Erreur lors de l\'envoi du message:', err);
      if (!isSameAccount(token)) return;
      // Le texte est gardé pour le bouton "Réessayer", même si l'élève a déjà tapé autre chose dans la saisie
      envoiEchoue.current = { chatId, texte: messageText };
      updateChat(chatId, chat => ({ ...chat, messages: chat.messages.filter(msg => !estProvisoire(msg)) }));
      // On ne remet le texte dans la saisie que si elle est vide : on ne remplace jamais ce que l'élève tape
      setInputChatMessage(prev => (prev.trim() === '' ? messageText : prev));
      setErrorChatId(chatId);
    } finally {
      // On ne retire que le contrôleur de cet envoi : un envoi plus récent ne doit pas perdre le sien
      if (controleurEnvoi.current === controleur) controleurEnvoi.current = null;
      if (isSameAccount(token)) setIsTyping(false);
    }
  };

  // Arrête la réponse en cours. Le texte déjà reçu reste affiché (voir le bloc d'arrêt dans sendMessage)
  const stopMessage = () => {
    controleurEnvoi.current?.abort();
  };

  // Joint un fichier au chat affiché : vérifications locales, puis lecture et analyse par NEXUS côté serveur
  const attachFile = async (file: File) => {
    const chatId = currentChatId;
    if (!token || !chatId) return;

    // Erreurs détectées tout de suite : le fichier n'est même pas lu
    const erreurLocale = verifierFichier(file);
    if (erreurLocale) {
      setFileErrorState({ chatId, erreur: erreurLocale });
      return;
    }
    const nombreEnAttente = currentChat?.fichiers_en_attente?.length ?? 0;
    if (nombreEnAttente >= MAX_FICHIERS_EN_ATTENTE) {
      setFileErrorState({ chatId, erreur: { code: 'nombre-max' } });
      return;
    }

    setFileErrorState(null);
    setIsUploading(true);
    try {
      const content = await file.text();
      const data = await uploadFileToChat(token, chatId, file.name, content);
      if (!isSameAccount(token)) return;

      // Le fichier attend l'envoi du message, et l'analyse de NEXUS rejoint la conversation
      updateChat(chatId, chat => ({
        ...chat,
        fichiers_en_attente: [...(chat.fichiers_en_attente ?? []), data.fichier],
        messages: [...chat.messages, data.message],
      }));
    } catch (err) {
      console.error('Erreur lors de l\'ajout du fichier:', err);
      if (!isSameAccount(token)) return;
      // Le serveur explique son refus (motif et analyse) ; sinon, on reste sur un message générique
      const erreur: ErreurFichier =
        err instanceof FileUploadError && err.message
          ? { code: 'serveur', motif: err.message }
          : { code: 'analyse-impossible' };
      const analyse = err instanceof FileUploadError ? err.analyse : undefined;
      setFileErrorState({ chatId, erreur, analyse });
    } finally {
      if (isSameAccount(token)) setIsUploading(false);
    }
  };

  // Retire un fichier joint qui n'a pas encore été envoyé. Un 404 (déjà retiré) est traité comme un succès.
  const removePendingFile = async (fileId: string) => {
    const chatId = currentChatId;
    if (!token || !chatId) return;
    try {
      await deleteFileOnServer(token, chatId, fileId);
    } catch (err) {
      console.error('Erreur lors du retrait du fichier:', err);
      return;
    }
    if (!isSameAccount(token)) return;

    updateChat(chatId, chat => ({
      ...chat,
      fichiers_en_attente: (chat.fichiers_en_attente ?? []).filter(fichier => fichier.id !== fileId),
    }));
  };

  // Message trop long : affiché tant que la saisie dépasse la limite, donc il disparaît dès que l'élève raccourcit le texte.
  // Le texte est calculé à chaque rendu, dans la langue courante.
  const longueurSaisie = [...inputChatMessage.trim()].length;
  const messageTropLong = messageRefuse && longueurSaisie > MESSAGE_MAX_LENGTH;

  // L'erreur de fichier n'est montrée que dans le chat où elle est arrivée
  // Le texte est écrit ici, à chaque rendu, dans la langue courante.
  // ChatInput n'a qu'un seul emplacement d'erreur : l'erreur de longueur du message y passe aussi, à la place de l'erreur de fichier.
  const fileError: FileError | null = messageTropLong
    ? { message: t.features.saisie.messageTropLong(longueurSaisie, MESSAGE_MAX_LENGTH) }
    : fileErrorState && fileErrorState.chatId === currentChatId
      ? { message: libelleErreurFichier(fileErrorState.erreur, t), analyse: fileErrorState.analyse }
      : null;

  return {
    inputChatMessage,
    setInputChatMessage,
    isTyping,
    errorChatId,
    clearDraft,
    sendMessage,
    retryMessage,
    stopMessage,
    attachFile,
    removePendingFile,
    isUploading,
    fileError,
  };
};

import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { Chat } from '../features/chats/types';
import { useCopyFeedback } from '../features/clipboard/useCopyFeedback';
import { useI18n } from '../i18n/LangueProvider';
import AnimationReflexion from './AnimationReflexion';
import MarkdownMessage from './MarkdownMessage';
import { IconeCoche, IconeCopier, IconeCompte, IconeTrombone } from './Icones';

/**
 * ChatWindow : la zone centrale qui affiche les messages du chat ouvert.
 * La réponse de NEXUS s'affiche au fil de l'écriture : tant qu'elle n'a pas commencé, une animation de réflexion la remplace.
 * Props :
 * - chat : le chat affiché, ou null si aucun n'est sélectionné.
 * - isDarkMode : thème actuel, pour choisir les couleurs.
 * - messagesEndRef : repère placé tout en bas, pour que la page puisse y descendre automatiquement.
 * - errorMessage : message d'erreur à afficher sous les messages, ou null. Le bouton "Réessayer" s'affiche avec lui.
 * - isTyping : vrai pendant qu'une réponse s'écrit (le bouton "Réessayer" est alors désactivé).
 * - onRetrySend : renvoie le dernier message qui a échoué.
 * - chatsLoadError : vrai si le chargement des chats a échoué (utile seulement quand aucun chat n'est ouvert).
 * - onRetryLoad : relance le chargement des chats (bouton "Réessayer").
 * - onNewChat : crée un nouveau chat (bouton "Nouveau chat" de l'écran d'accueil, affiché quand aucun chat n'est ouvert).
 */

type ChatWindowProps = {
  chat: Chat | null;
  isDarkMode: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
  errorMessage: string | null;
  isTyping: boolean;
  onRetrySend: () => void;
  chatsLoadError: boolean;
  onRetryLoad: () => void;
  onNewChat: () => void;
};

/**
 * CopyResponseButton : petit bouton "Copier" sous une réponse de NEXUS. Il copie le texte brut de la réponse.
 * Props :
 * - text : le texte brut de la réponse, tel que reçu du serveur.
 * - isDarkMode : thème actuel, pour choisir les couleurs.
 */

type CopyResponseButtonProps = {
  text: string;
  isDarkMode: boolean;
};

const CopyResponseButton = ({ text, isDarkMode }: CopyResponseButtonProps) => {
  const { t } = useI18n();
  const { status, copy } = useCopyFeedback();

  const label = status === 'copied' ? t.interface.chat.copie : status === 'failed' ? t.interface.chat.copieImpossible : t.interface.chat.copier;

  return (
    <button
      type="button"
      aria-label={t.interface.chat.copierReponse}
      onClick={() => copy(text)}
      // Sur téléphone, 40px de haut pour bien viser du doigt ; sur ordinateur, bouton plus discret
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-md border px-2.5 text-sm font-medium transition-colors sm:min-h-0 sm:px-3 sm:py-1 ${
        isDarkMode
          ? 'border-cyan-500/25 text-cyan-200/90 hover:border-cyan-400/60 hover:bg-cyan-400/10'
          : 'border-blue-300 text-blue-700 hover:border-blue-500 hover:bg-blue-50'
      }`}
    >
      {status === 'copied' ? <IconeCoche width="14" height="14" /> : <IconeCopier width="14" height="14" />}
      <span className="sr-only sm:not-sr-only">{label}</span>
    </button>
  );
};

const ChatWindow = ({
  chat,
  isDarkMode,
  messagesEndRef,
  errorMessage,
  isTyping,
  onRetrySend,
  chatsLoadError,
  onRetryLoad,
  onNewChat,
}: ChatWindowProps) => {
  const { t, langue } = useI18n();
  // Annonce de fin de réponse pour les lecteurs d'écran. Elle n'est lue qu'une fois, à la fin de la réponse,
  // et non à chaque morceau : sinon le lecteur ne s'arrêterait jamais de parler.
  const [annonce, setAnnonce] = useState('');
  const etaitEnCours = useRef(false);
  useEffect(() => {
    if (isTyping) {
      etaitEnCours.current = true;
      setAnnonce('');
      return;
    }
    // Un échec n'est pas une réponse : son message d'erreur est déjà annoncé (role="alert")
    if (etaitEnCours.current && !errorMessage) setAnnonce(t.interface.chat.reponseTerminee);
    etaitEnCours.current = false;
  }, [isTyping, errorMessage, t]);

  if (!chat) {
    // Échec du chargement : on dit pourquoi la page est vide, et on propose de réessayer
    if (chatsLoadError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 text-center">
          <p role="alert" className={isDarkMode ? 'text-red-300' : 'text-red-700'}>
            {t.interface.chat.erreurChargement}
          </p>
          <button
            type="button"
            onClick={onRetryLoad}
            className="chip-btn px-4 min-h-11 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-700 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/50"
          >
            {t.interface.chat.reessayer}
          </button>
        </div>
      );
    }

    // Aucun chat ouvert : écran d'accueil. On centre avec m-auto (et non justify-center) : sur un petit écran,
    // justify-center couperait le haut du contenu au lieu de laisser la zone défiler.
    return (
      <div className="flex flex-1 min-h-0 overflow-y-auto px-4 py-8">
        <div className="m-auto flex w-full max-w-md flex-col items-center gap-8 text-center">
          <h1 className="text-5xl font-black neon-text sm:text-6xl">NEXUS</h1>
          <div className={`space-y-2 text-base leading-relaxed sm:text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>{t.interface.accueil.presentation}</p>
            <p>{t.interface.accueil.invitation}</p>
          </div>
          {/* Même style que le bouton "Nouveau chat" de la liste, en plus grand */}
          <button
            type="button"
            onClick={() => onNewChat()}
            className="chip-btn w-full min-h-[52px] px-10 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-700 text-lg text-white font-bold hover:shadow-lg hover:shadow-cyan-500/50 sm:w-auto"
          >
            {t.interface.accueil.nouveauChat}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6">
      {chat.messages.map(msg => {
        // Réponse de NEXUS pas encore commencée : l'animation de réflexion prend la place du texte
        const enReflexion = msg.enCours === true && msg.content === '';

        return (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3 animate-fadeIn`}>
            {msg.role === 'assistant' && (
              <div className="message-avatar avatar-ai flex-shrink-0">
                ∞
              </div>
            )}
            <div
              className={`max-w-[85%] sm:max-w-md px-5 py-3 rounded-lg backdrop-blur-sm ${
                msg.role === 'user'
                  ? `${isDarkMode ? 'bg-blue-900/40 border border-blue-500/50' : 'bg-blue-100/40 border border-blue-400/50'}`
                  : `neo-glow`
              }`}
            >
              {/* Fichiers joints à ce message : une ligne par fichier, au-dessus du texte */}
              {msg.fichiers && msg.fichiers.length > 0 && (
                <div className="text-sm opacity-80 mb-1 flex flex-wrap gap-x-3">
                  {msg.fichiers.map(fichier => (
                    <span key={fichier.id} className="flex items-center gap-1.5">
                      <IconeTrombone width="12" height="12" />
                      {fichier.name}
                    </span>
                  ))}
                </div>
              )}
              {/* Compteur de tokens au-dessus de la réponse de NEXUS (seulement pour une réponse reçue pendant cette session) */}
              {msg.role === 'assistant' && typeof msg.tokens === 'number' && (
                <div className="text-xs opacity-70 mb-1">
                  {msg.tokens.toLocaleString(langue === 'en' ? 'en-GB' : 'fr-FR')} tokens
                </div>
              )}
              {enReflexion ? (
                <AnimationReflexion isDarkMode={isDarkMode} />
              ) : (
                <>
                  <div className={`message-text flex items-start gap-2 ${msg.role === 'user' ? (isDarkMode ? 'text-blue-200' : 'text-blue-800') : (isDarkMode ? 'text-cyan-300' : 'text-blue-600')}`}>
                    {/* break-words : un mot très long (une adresse web par exemple) ne doit pas faire déborder la bulle sur téléphone */}
                    <span className="flex-1 min-w-0 break-words">
                      {msg.role === 'assistant' ? <MarkdownMessage text={msg.content} /> : msg.content}
                      {/* Curseur clignotant pendant que la réponse s'écrit */}
                      {msg.enCours && <span className="curseur-flux" aria-hidden="true" />}
                    </span>
                    <span className="message-timestamp">
                      {new Date(msg.timestamp).toLocaleTimeString(langue === 'en' ? 'en-GB' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {/* Seules les réponses de NEXUS terminées ont ce bouton ; le message d'erreur n'est pas un message du chat */}
                  {msg.role === 'assistant' && !msg.enCours && (
                    <div className="flex justify-end mt-1">
                      <CopyResponseButton text={msg.content} isDarkMode={isDarkMode} />
                    </div>
                  )}
                </>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="message-avatar avatar-user flex-shrink-0">
                <IconeCompte width="16" height="16" />
              </div>
            )}
          </div>
        );
      })}
      {errorMessage && (
        <div className="flex justify-start animate-fadeIn">
          <div
            role="alert"
            className={`flex flex-wrap items-center gap-3 px-5 py-3 rounded-lg border text-sm ${
              isDarkMode ? 'bg-red-900/30 border-red-500/60 text-red-300' : 'bg-red-100 border-red-400 text-red-700'
            }`}
          >
            <span>{errorMessage}</span>
            {/* Renvoie le même message. Désactivé pendant une réponse en cours, pour ne jamais envoyer deux fois */}
            <button
              type="button"
              onClick={() => onRetrySend()}
              disabled={isTyping}
              // Sur téléphone, 40px de haut pour bien viser du doigt, comme le bouton "Copier"
              className={`inline-flex min-h-11 items-center rounded-md border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0 sm:py-1 ${
                isDarkMode
                  ? 'border-red-400/60 text-red-200 hover:bg-red-400/10'
                  : 'border-red-500 text-red-700 hover:bg-red-200'
              }`}
            >
              {t.interface.chat.reessayer}
            </button>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
      {/* Zone invisible, lue par les lecteurs d'écran. Elle existe dès l'ouverture du chat, pour que l'annonce soit captée */}
      <div aria-live="polite" className="sr-only">{annonce}</div>
    </div>
  );
};

export default ChatWindow;

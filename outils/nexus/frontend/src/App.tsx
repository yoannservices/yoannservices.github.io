import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import AppHeader from './components/AppHeader';
import ChatInput from './components/ChatInput';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import DoorsOverlay from './components/DoorsOverlay';
import { IconeFlecheBas } from './components/Icones';
import LoginPage from './components/LoginPage';
import PanneauJeux from './components/PanneauJeux';
import Toast from './components/Toast';
import SettingsPanel from './components/SettingsPanel';
import { setSessionExpiredHandler } from './features/auth/session';
import { useAuth } from './features/auth/useAuth';
import type { ErreurListe } from './features/chats/useChatList';
import { useChats } from './features/chats/useChats';
import { useDoors } from './features/doors/useDoors';
import { useTextSize } from './features/settings/useTextSize';
import { useTheme } from './features/theme/useTheme';
import { useI18n } from './i18n/LangueProvider';

// Clé de la préférence "liste des chats dépliée ou réduite" (ordinateur et tablette), dans localStorage
const CHATS_LIST_STORAGE_KEY = 'listeChatsOuverte';

// Distance (en px) sous laquelle l'élève est considéré comme "en bas" de la conversation
const SEUIL_BAS_PX = 100;

// Lit la préférence. La liste est dépliée par défaut ; si le stockage est bloqué, on garde ce défaut.
const readChatsListOpen = (): boolean => {
  try {
    return localStorage.getItem(CHATS_LIST_STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
};

// Mémorise le choix. Si le stockage est bloqué, le choix vaut pour cette session seulement.
const writeChatsListOpen = (isOpen: boolean): void => {
  try {
    localStorage.setItem(CHATS_LIST_STORAGE_KEY, String(isOpen));
  } catch {
    // Volontairement ignoré : le choix reste appliqué jusqu'au rechargement
  }
};

// Composant racine : il branche ensemble le thème, les portes, le compte et les chats, puis les affiche.
function App() {
  const { t } = useI18n();
  const { isDarkMode, toggleTheme } = useTheme();
  const { doors, openDoors, closeDoors } = useDoors();
  const { username, token, sessionExpired, authenticate, logout, expireSession, deleteAccount } = useAuth();
  const { textSize, changeTextSize } = useTextSize();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // Liste des jeux ouverte ou fermée (bouton manette du header)
  const [isGamesOpen, setIsGamesOpen] = useState(false);
  // Téléphone : tiroir des conversations ouvert ou fermé (sans effet sur les grands écrans)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // Ordinateur et tablette : liste dépliée (vrai) ou réduite à une barre étroite (faux), mémorisé entre les visites
  const [isListOpen, setIsListOpen] = useState(readChatsListOpen);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const toggleChatsList = () => {
    const nextIsOpen = !isListOpen;
    setIsListOpen(nextIsOpen);
    writeChatsListOpen(nextIsOpen);
  };
  const {
    chats,
    currentChat,
    currentChatId,
    chatsLoadError,
    erreurListe,
    effacerErreurListe,
    reloadChats,
    inputChatMessage,
    setInputChatMessage,
    isTyping,
    errorChatId,
    createNewChat,
    selectChat,
    deleteChat,
    renameChat,
    sendMessage,
    stopMessage,
    retryMessage,
    attachFile,
    removePendingFile,
    isUploading,
    fileError,
  } = useChats(token);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  // Texte du message d'erreur de la liste, dans la langue choisie
  const libelleErreurListe = (code: ErreurListe): string => {
    if (code === 'creation') return t.interface.liste.erreurCreation;
    if (code === 'renommage') return t.interface.liste.erreurRenommage;
    return t.interface.liste.erreurSuppression;
  };

  // Après un envoi, le curseur revient dans la saisie : l'élève peut écrire la question suivante sans cliquer.
  // Le bouton "Envoyer" avait pris le focus ; on le rend à la zone de texte.
  const handleSubmit = (e: FormEvent) => {
    void sendMessage(e);
    chatInputRef.current?.focus();
  };
  const currentMessageCount = currentChat?.messages.length ?? 0;
  // Longueur de la dernière réponse : elle grandit pendant l'écriture, la page doit suivre
  const dernierMessage = currentChat?.messages[currentMessageCount - 1];
  const longueurDerniereReponse = dernierMessage?.content.length ?? 0;

  // Vrai si l'élève est proche du bas de la conversation. Mis à jour quand il fait défiler la page.
  const suitLeBasRef = useRef(true);
  // Même information, en état : elle sert à afficher le bouton ↓ quand l'élève remonte pour relire
  const [isEnBas, setIsEnBas] = useState(true);

  // Note si l'élève remonte pour relire. Au changement de chat, on repart du bas.
  // Le conteneur des messages est le parent du repère messagesEndRef (voir ChatWindow).
  useEffect(() => {
    suitLeBasRef.current = true;
    setIsEnBas(true);
    const conteneur = messagesEndRef.current?.parentElement;
    if (!conteneur) return;
    const mesurerPosition = () => {
      const distanceDuBas = conteneur.scrollHeight - conteneur.scrollTop - conteneur.clientHeight;
      const enBas = distanceDuBas < SEUIL_BAS_PX;
      const etaitEnBas = suitLeBasRef.current;
      suitLeBasRef.current = enBas;
      // On ne met l'état à jour que si la valeur change : le défilement envoie des dizaines d'événements, pas la peine de re-rendre à chaque fois
      if (enBas !== etaitEnBas) setIsEnBas(enBas);
    };
    conteneur.addEventListener('scroll', mesurerPosition);
    return () => conteneur.removeEventListener('scroll', mesurerPosition);
  }, [currentChatId, username]);

  // Descend tout en bas de la conversation. On règle le défilement du seul conteneur des messages :
  // scrollIntoView ferait aussi défiler les parents cachés (overflow-hidden) de la page, et la barre de saisie glisserait avec eux.
  const descendreEnBas = (comportement: ScrollBehavior) => {
    const conteneur = messagesEndRef.current?.parentElement;
    conteneur?.scrollTo({ top: conteneur.scrollHeight, behavior: comportement });
  };

  // Descend tout en bas au changement de chat, à un nouveau message ou à une erreur (action de l'élève)
  useEffect(() => {
    descendreEnBas('smooth');
  }, [currentChatId, currentMessageCount, errorChatId]);

  // Pendant que la réponse s'écrit, on ne suit le texte que si l'élève était déjà en bas.
  // Défilement instantané : un défilement animé relancé à chaque morceau saccade et prend du retard sur le texte.
  useEffect(() => {
    if (suitLeBasRef.current) descendreEnBas('auto');
  }, [longueurDerniereReponse]);

  // Dès que le chat est visible (portes ouvertes, chat changé ou connexion réussie), on peut écrire tout de suite.
  // `username` est dans la liste : après une connexion, le champ de saisie apparaît et doit recevoir le focus.
  useEffect(() => {
    if (doors === 'open') chatInputRef.current?.focus();
  }, [doors, currentChatId, username]);

  // Déconnexion volontaire : logout efface la session (et prévient le serveur), on ferme le panneau
  // et on referme les portes pour revenir à l'accueil
  const handleLogout = () => {
    logout();
    setIsSettingsOpen(false);
    setIsDrawerOpen(false);
    closeDoors();
  };

  // Session expirée (le serveur a répondu 401 à un appel de chats) : même retour à l'accueil que la déconnexion,
  // mais le message "Ta session a expiré" reste affiché sur la page de connexion.
  // Enregistré à chaque rendu, car closeDoors change à chaque rendu et doit voir l'état à jour.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      expireSession();
      setIsSettingsOpen(false);
      setIsDrawerOpen(false);
      closeDoors();
    });
    return () => setSessionExpiredHandler(null);
  }, [expireSession, closeDoors]);

  return (
    // min-h-dvh / h-dvh : la hauteur "dynamique" suit la barre d'adresse et le clavier du téléphone (100vh resterait trop haut)
    <div className={`min-h-dvh bg-gradient-to-br from-[color:var(--fond-page-debut)] via-[color:var(--fond-page-milieu)] to-[color:var(--fond-page-fin)] flex flex-col overflow-hidden`}>

      {/* Fond animé - grille sci-fi */}
      <div className="animated-background">
        <div className="grid-pattern"></div>
      </div>

      {/* PAGE NEXUS */}
      <div className="h-dvh flex flex-col overflow-hidden">
        <AppHeader
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenGames={() => setIsGamesOpen(true)}
          // Le bouton ☰ (téléphone) n'existe que si quelqu'un est connecté, comme la liste des chats
          onToggleChats={username ? () => setIsDrawerOpen(open => !open) : undefined}
          isChatsOpen={isDrawerOpen}
        />

        {/* Sans utilisateur connecté, on affiche la page de connexion à la place du chat.
            Elle est rendue derrière les portes fermées tant que personne n'est connecté : elle n'est donc
            pas visible pendant l'animation d'ouverture, ce qui évite de voir le chat puis la connexion. */}
        {username ? (
          /* Layout: ChatList à gauche (tiroir sur téléphone, colonne sur tablette et ordinateur), ChatWindow + ChatInput à droite.
             min-w-0 sur la colonne du chat : sans lui, un contenu large l'empêche de rétrécir et crée un défilement horizontal. */
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <ChatList
              chats={chats}
              currentChatId={currentChatId}
              onSelectChat={selectChat}
              onNewChat={createNewChat}
              onDeleteChat={deleteChat}
              onRenameChat={renameChat}
              isDarkMode={isDarkMode}
              isDrawerOpen={isDrawerOpen}
              onCloseDrawer={closeDrawer}
              isListOpen={isListOpen}
              onToggleList={toggleChatsList}
            />

            {/* Contenu du chat (messages + input) */}
            <div className="flex-1 min-w-0 flex flex-col min-h-0 overflow-hidden">
              {/* Repère de position : le bouton ↓ se pose en bas de cette zone, au-dessus de la saisie */}
              <div className="relative flex-1 min-h-0 flex flex-col">
                <ChatWindow
                  chat={currentChat}
                  isDarkMode={isDarkMode}
                  messagesEndRef={messagesEndRef}
                  // Message d'envoi échoué : texte fixe (on ne montre jamais le détail d'erreur du serveur)
                  errorMessage={errorChatId !== null && errorChatId === currentChatId ? t.interface.chat.erreurEnvoi : null}
                  chatsLoadError={chatsLoadError}
                  onRetryLoad={reloadChats}
                  onNewChat={createNewChat}
                  isTyping={isTyping}
                  onRetrySend={retryMessage}
                />

                {/* Bouton ↓ : seulement si une conversation est ouverte et que l'élève a remonté pour relire.
                    Il disparaît tout seul une fois arrivé en bas, car le défilement met isEnBas à jour. */}
                {currentChat && !isEnBas && (
                  <button
                    type="button"
                    onClick={() => descendreEnBas('smooth')}
                    aria-label={t.interface.chat.allerFinConversation}
                    title={t.interface.chat.allerFinConversation}
                    // inset-x-0 + mx-auto (et pas translate) : le survol de .chip-btn remplace la propriété transform
                    className="chip-btn absolute bottom-3 inset-x-0 mx-auto z-10 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-700 text-white shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60"
                  >
                    <IconeFlecheBas />
                  </button>
                )}
              </div>

              <ChatInput
                inputMessage={inputChatMessage}
                onInputChange={setInputChatMessage}
                onSubmit={handleSubmit}
                isDisabled={isTyping || !currentChatId}
                isTyping={isTyping}
                onStop={stopMessage}
                isDarkMode={isDarkMode}
                textareaRef={chatInputRef}
                pendingFiles={currentChat?.fichiers_en_attente ?? []}
                onAttachFile={attachFile}
                onRemoveFile={removePendingFile}
                isUploading={isUploading}
                fileError={fileError}
              />
            </div>
          </div>
        ) : (
          <LoginPage isDarkMode={isDarkMode} sessionExpired={sessionExpired} onAuthenticate={authenticate} />
        )}
      </div>

      {/* PANNEAU "MON COMPTE" : au-dessus de tout, ouvert depuis le bouton du header */}
      {isSettingsOpen && (
        <SettingsPanel
          isDarkMode={isDarkMode}
          username={username}
          textSize={textSize}
          onChangeTextSize={changeTextSize}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
          onDeleteAccount={deleteAccount}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* LISTE DES JEUX : au-dessus de tout, ouverte depuis le bouton manette du header */}
      {isGamesOpen && <PanneauJeux isDarkMode={isDarkMode} onClose={() => setIsGamesOpen(false)} />}

      {/* MESSAGE TEMPORAIRE : une action de la liste a échoué. Hors de la liste, car son transform casserait le positionnement fixe. */}
      {username && erreurListe && (
        <Toast
          key={erreurListe.id}
          message={libelleErreurListe(erreurListe.code)}
          isDarkMode={isDarkMode}
          onDismiss={effacerErreurListe}
        />
      )}

      {/* PORTES : couvrent tout l'écran sur l'accueil et s'ouvrent vers le chat */}
      {doors !== 'open' && <DoorsOverlay doors={doors} onOpenDoors={openDoors} />}
    </div>
  );
}

export default App;

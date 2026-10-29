import { useCallback, useState } from 'react';
import { AuthRequestError, deleteAccountOnServer, loginOnServer, logoutOnServer, registerOnServer } from './authApi';
import { getStoredSession, reportUnauthorized, writeSession } from './session';
import type { Session } from './session';

// Les modes de la page de connexion : se connecter à un compte existant, ou en créer un
export type AuthMode = 'connexion' | 'inscription';

// Pourquoi une tentative a échoué. Le texte affiché est choisi par LoginPage à partir de cette raison.
export type AuthFailureReason = 'not-found' | 'wrong-password' | 'taken' | 'invalid' | 'too-many' | 'unreachable';

// Un échec de connexion : la raison, et pour 'too-many' le temps restant si le serveur l'a indiqué.
export type AuthFailure = { reason: AuthFailureReason; attenteSecondes?: number };

// Pourquoi la suppression du compte a échoué. Le texte affiché est choisi par SettingsPanel.
export type DeleteFailureReason = 'wrong-password' | 'too-many' | 'failed';

// Un échec de suppression : la raison, et pour 'too-many' le temps restant si le serveur l'a indiqué.
export type DeleteFailure = { reason: DeleteFailureReason; attenteSecondes?: number };

// Traduit une erreur technique en raison simple. Tout ce qui n'est pas 404, 401, 409, 422 ou 429 est "serveur injoignable".
const failureFromError = (err: unknown): AuthFailure => {
  console.error("Erreur lors de l'authentification:", err);
  if (err instanceof AuthRequestError) {
    if (err.status === 404) return { reason: 'not-found' };
    if (err.status === 401) return { reason: 'wrong-password' };
    if (err.status === 409) return { reason: 'taken' };
    if (err.status === 422) return { reason: 'invalid' };
    if (err.status === 429) return { reason: 'too-many', attenteSecondes: err.attenteSecondes };
  }
  return { reason: 'unreachable' };
};

// Gère le compte courant : connexion, inscription, déconnexion et expiration de la session.
export const useAuth = () => {
  // La session mémorisée est lue dès le premier rendu : l'élève déjà connecté ne voit pas la page de connexion
  const [session, setSession] = useState<Session | null>(getStoredSession);
  // Vrai quand le serveur a refusé la session. Cet état vit ici (et non dans la page de connexion)
  // pour que le message survive au retour sur la page de connexion.
  const [sessionExpired, setSessionExpired] = useState(false);

  // Renvoie null si la tentative réussit, sinon l'échec (raison et temps d'attente éventuel)
  const authenticate = async (
    mode: AuthMode,
    name: string,
    password: string,
  ): Promise<AuthFailure | null> => {
    // Une nouvelle tentative efface le message "session expirée" : l'élève agit à nouveau
    setSessionExpired(false);
    try {
      const trimmedName = name.trim();
      // On garde le pseudo et le jeton renvoyés par le serveur : ce sont eux qui font foi.
      // Le mot de passe n'est jamais nettoyé (les espaces peuvent en faire partie).
      const newSession = mode === 'connexion'
        ? await loginOnServer(trimmedName, password)
        : await registerOnServer(trimmedName, password);
      writeSession(newSession);
      setSession(newSession);
      return null;
    } catch (err) {
      return failureFromError(err);
    }
  };

  // Déconnexion volontaire. La requête part avant l'effacement (le jeton est lu maintenant),
  // mais on n'attend pas sa réponse : la déconnexion doit rester instantanée même si le serveur tarde.
  const logout = (): void => {
    if (session) void logoutOnServer(session.token);
    writeSession(null);
    setSession(null);
    setSessionExpired(false);
  };

  // Le serveur a refusé le jeton : on efface la session et on signale l'expiration. Pas d'appel au serveur,
  // il a déjà supprimé la session de son côté.
  const expireSession = useCallback((): void => {
    writeSession(null);
    setSession(null);
    setSessionExpired(true);
  }, []);

  // Supprime le compte après vérification du mot de passe. Renvoie null si c'est fait, sinon la raison de l'échec.
  // En cas de succès on ne touche pas à la session ici : l'appelant appelle logout, qui efface tout et ferme le panneau.
  const deleteAccount = async (password: string): Promise<DeleteFailure | null> => {
    if (!session) return { reason: 'failed' };
    try {
      await deleteAccountOnServer(session.token, password);
      return null;
    } catch (err) {
      // 403 = mauvais mot de passe : ce n'est PAS une déconnexion, l'élève reste connecté et corrige sa saisie
      if (err instanceof AuthRequestError && err.status === 403) return { reason: 'wrong-password' };
      // 429 = trop d'essais de mot de passe : on garde le temps d'attente pour l'afficher
      if (err instanceof AuthRequestError && err.status === 429) {
        return { reason: 'too-many', attenteSecondes: err.attenteSecondes };
      }
      // 401 = la session n'est plus valide : on le signale comme pour les chats (le panneau se ferme alors)
      if (err instanceof AuthRequestError && err.status === 401) reportUnauthorized(session.token);
      // Le mot de passe n'est pas journalisé : l'erreur ne contient que le code HTTP
      if (!(err instanceof AuthRequestError)) console.error('Erreur lors de la suppression du compte:', err);
      return { reason: 'failed' };
    }
  };

  return {
    username: session?.username ?? null,
    token: session?.token ?? null,
    sessionExpired,
    authenticate,
    logout,
    expireSession,
    deleteAccount,
  };
};

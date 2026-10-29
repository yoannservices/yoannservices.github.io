// Gère la session du compte connecté : le nom et le jeton renvoyés par le serveur.
// Le jeton est la preuve d'identité de l'élève : il est envoyé à chaque appel aux chats.

// Une session = le pseudo confirmé par le serveur + le jeton qui le prouve
export type Session = {
  username: string;
  token: string;
};

// Clé de la session dans localStorage (l'ancienne clé "utilisateur" n'est plus lue nulle part)
const STORAGE_KEY = 'session';

// Ce qu'on lit dans localStorage peut être n'importe quoi : on vérifie la forme avant de faire confiance
const isSession = (value: unknown): value is Session => {
  if (typeof value !== 'object' || value === null) return false;
  return 'username' in value && 'token' in value
    && typeof value.username === 'string' && typeof value.token === 'string';
};

// Lit la session mémorisée. Si le stockage est bloqué ou si la valeur est abîmée, personne n'est connecté.
const readStoredSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return isSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

// Copie en mémoire de la session. Elle est lue une seule fois au chargement de la page (donc avant le premier rendu)
// et reste à jour à chaque écriture. Elle sert à savoir si un jeton est encore celui du compte courant.
let currentSession: Session | null = readStoredSession();

// Fonction appelée quand le serveur refuse le jeton du compte courant (voir reportUnauthorized)
let sessionExpiredHandler: (() => void) | null = null;

// Renvoie la session du compte courant, ou null
export const getStoredSession = (): Session | null => currentSession;

// Mémorise la session, ou l'efface si on passe null. Si le stockage est bloqué, la session vaut pour cette page seulement.
export const writeSession = (session: Session | null): void => {
  currentSession = session;
  try {
    if (session === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  } catch {
    // Volontairement ignoré : l'application reste utilisable sans mémorisation
  }
};

// En-tête HTTP qui prouve l'identité au serveur. Le jeton est passé en paramètre (et non lu ici)
// pour qu'un appel en cours garde le jeton du compte pour lequel il a été lancé.
export const getAuthHeader = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
});

// Enregistre (ou retire avec null) ce qu'il faut faire quand la session expire
export const setSessionExpiredHandler = (handler: (() => void) | null): void => {
  sessionExpiredHandler = handler;
};

// Appelée quand le serveur répond 401 à un appel fait avec `token`.
// On ne déconnecte que si ce jeton est celui du compte courant : une réponse tardive d'un ancien compte
// ne doit pas éjecter le compte qui vient de se connecter.
export const reportUnauthorized = (token: string): void => {
  if (currentSession?.token !== token) return;
  sessionExpiredHandler?.();
};

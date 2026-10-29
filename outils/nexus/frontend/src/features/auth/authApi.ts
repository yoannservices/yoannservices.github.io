// Ce fichier ne fait que parler au backend : il renvoie la session confirmée par le serveur ou lève une erreur.
// Le choix du message affiché se fait dans useAuth et LoginPage, jamais avec le texte renvoyé par le serveur.

import { getAuthHeader } from './session';
import type { Session } from './session';
import { enteteLangue } from '../../i18n/langue';

// Erreur HTTP renvoyée par le serveur (401, 404, 409, 422, 429…). On ne garde que le code, pas le texte.
// attenteSecondes : pour un 429, le temps à attendre avant de réessayer, lu dans l'en-tête Retry-After.
export class AuthRequestError extends Error {
  readonly status: number;
  readonly attenteSecondes?: number;

  constructor(status: number, attenteSecondes?: number) {
    super(`Réponse HTTP ${status}`);
    this.name = 'AuthRequestError';
    this.status = status;
    this.attenteSecondes = attenteSecondes;
  }
}

// Lit l'en-tête Retry-After (nombre de secondes). Absent ou illisible : undefined, et le message générique reste affiché.
const lireAttente = (res: Response): number | undefined => {
  const valeur = Number(res.headers.get('Retry-After'));
  return Number.isFinite(valeur) && valeur > 0 ? valeur : undefined;
};

// Envoie le pseudo et le mot de passe à une route d'authentification.
// Renvoie le pseudo et le jeton confirmés par le serveur : ce sont eux qui font foi.
const postCredentials = async (
  route: 'connexion' | 'inscription',
  username: string,
  password: string,
): Promise<Session> => {
  const res = await fetch(`/api/auth/${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...enteteLangue() },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new AuthRequestError(res.status, lireAttente(res));
  const data: Session = await res.json();
  return { username: data.username, token: data.token };
};

// Vérifie le pseudo et le mot de passe (404 pseudo inconnu, 401 mot de passe faux)
export const loginOnServer = (username: string, password: string): Promise<Session> =>
  postCredentials('connexion', username, password);

// Crée un compte (409 si le nom est déjà pris, 422 si le nom ou le mot de passe est invalide)
export const registerOnServer = (username: string, password: string): Promise<Session> =>
  postCredentials('inscription', username, password);

// Demande au serveur de supprimer la session. Une erreur réseau est ignorée : l'élève doit pouvoir
// se déconnecter sur cet appareil même si le serveur ne répond pas.
export const logoutOnServer = async (token: string): Promise<void> => {
  try {
    await fetch('/api/auth/deconnexion', {
      method: 'POST',
      headers: { ...getAuthHeader(token), ...enteteLangue() },
    });
  } catch {
    // Volontairement ignoré (voir le commentaire ci-dessus)
  }
};

// Supprime le compte du jeton donné, après vérification du mot de passe (403 si le mot de passe est faux,
// 401 si la session n'est plus valide). Le mot de passe part dans le corps de la requête et n'est gardé nulle part.
export const deleteAccountOnServer = async (token: string, password: string): Promise<void> => {
  const res = await fetch('/api/auth/compte', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader(token), ...enteteLangue() },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new AuthRequestError(res.status, lireAttente(res));
};

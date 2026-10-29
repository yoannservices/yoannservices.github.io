import { getAuthHeader, reportUnauthorized } from '../auth/session';
import { enteteLangue } from '../../i18n/langue';
import type { Chat, ChatMessage, SendMessageResponse, UploadedFileResponse } from './types';

// Ce fichier ne fait que parler au backend : il renvoie les données ou lève une erreur.
// Ce qu'on affiche ou journalise en cas d'échec reste dans useChats.
// Chaque fonction reçoit le jeton du compte : le serveur ne renvoie que les chats de ce compte.

// Envoie un appel authentifié à /api/chats. Un 401 signale une session expirée (voir reportUnauthorized).
// signal permet d'annuler l'appel en cours (bouton "Arrêter" pendant une réponse de NEXUS).
const requestWithToken = async (
  token: string,
  url: string,
  method: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<Response> => {
  const res = await fetch(url, {
    method,
    headers: {
      ...getAuthHeader(token),
      ...enteteLangue(),
      // Le type JSON n'est annoncé que lorsqu'il y a vraiment un corps à lire
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });
  if (res.status === 401) reportUnauthorized(token);
  return res;
};

// Récupère la liste des chats du compte enregistrés côté serveur
export const fetchChats = async (token: string): Promise<Chat[]> => {
  const res = await requestWithToken(token, '/api/chats', 'GET');
  if (!res.ok) throw new Error(`Réponse HTTP ${res.status}`);
  const data: { chats?: Chat[] } = await res.json();
  return data.chats || [];
};

// Demande au serveur de créer un chat vide pour ce compte et renvoie son identifiant
export const createChatOnServer = async (token: string): Promise<string> => {
  const res = await requestWithToken(token, '/api/chats', 'POST');
  if (!res.ok) throw new Error(`Réponse HTTP ${res.status}`);
  const data: { chat_id: string } = await res.json();
  return data.chat_id;
};

// Supprime un chat côté serveur. Un 404 veut dire "déjà supprimé" : ce n'est pas une vraie erreur.
export const deleteChatOnServer = async (token: string, chatId: string): Promise<void> => {
  const res = await requestWithToken(token, `/api/chats/${chatId}`, 'DELETE');
  if (!res.ok && res.status !== 404) throw new Error(`Réponse HTTP ${res.status}`);
};

// Renomme un chat côté serveur. Le serveur refuse un titre vide ou trop long (422) : l'erreur remonte à useChats.
export const renameChatOnServer = async (token: string, chatId: string, title: string): Promise<void> => {
  const res = await requestWithToken(token, `/api/chats/${chatId}`, 'PATCH', { title });
  if (!res.ok) throw new Error(`Réponse HTTP ${res.status}`);
};

// Envoie le message de l'élève et renvoie les deux messages à ajouter (le sien et la réponse de NEXUS),
// ainsi que le titre du chat, qui peut venir d'être généré au premier échange
// Une ligne du flux de réponse (format NDJSON) : un morceau de texte, la fin avec les deux messages définitifs, ou une erreur
type EvenementFlux =
  | { type: 'morceau'; texte: string }
  | { type: 'fin'; message: ChatMessage; reply: ChatMessage; title: string; tokens: number | null }
  | { type: 'erreur'; detail: string };

// Envoie le message de l'élève et lit la réponse de NEXUS au fil de l'écriture.
// onMorceau est appelé pour chaque morceau de texte reçu. Renvoie les deux messages définitifs et le titre, comme avant.
// signal : quand il est annulé, la lecture s'arrête et la promesse est rejetée avec une AbortError (arrêt voulu par l'élève).
export const streamMessageToChat = async (
  token: string,
  chatId: string,
  text: string,
  onMorceau: (texte: string) => void,
  signal: AbortSignal,
): Promise<SendMessageResponse> => {
  const res = await requestWithToken(token, `/api/chats/${chatId}/messages`, 'POST', { message: text }, signal);
  if (!res.ok) throw new Error(`Réponse HTTP ${res.status}`);
  if (!res.body) throw new Error('Flux de réponse indisponible');

  const lecteur = res.body.getReader();
  const decodeur = new TextDecoder();
  let tampon = '';
  let fin: SendMessageResponse | undefined;
  for (;;) {
    const { done, value } = await lecteur.read();
    tampon += decodeur.decode(value, { stream: !done });
    // Une ligne n'est traitée que lorsqu'elle est complète (terminée par un saut de ligne)
    const lignes = tampon.split('\n');
    const reste = lignes.pop() ?? '';
    tampon = done ? '' : reste;
    for (const ligne of done ? [...lignes, reste] : lignes) {
      if (!ligne.trim()) continue;
      const evenement = JSON.parse(ligne) as EvenementFlux;
      if (evenement.type === 'morceau') onMorceau(evenement.texte);
      // Le nombre de tokens est rangé sur la réponse : il ne vit que dans l'écran de la session
      else if (evenement.type === 'fin') {
        fin = { message: evenement.message, reply: { ...evenement.reply, tokens: evenement.tokens }, title: evenement.title };
      }
      else throw new Error(evenement.detail);
    }
    if (done) break;
  }
  if (!fin) throw new Error('Réponse incomplète');
  return fin;
};

// Erreur renvoyée quand le serveur refuse un fichier (format, taille, analyse dangereuse, limite atteinte).
// message est le motif à afficher, analyse le texte de NEXUS quand le fichier a pu être lu.
export class FileUploadError extends Error {
  analyse?: string;

  constructor(message: string, analyse?: string) {
    super(message);
    this.name = 'FileUploadError';
    this.analyse = analyse;
  }
}

// Envoie le contenu d'un fichier au serveur, qui le lit et renvoie l'analyse de NEXUS.
// En cas de refus, le motif du serveur est gardé dans FileUploadError pour l'afficher à l'élève.
export const uploadFileToChat = async (
  token: string,
  chatId: string,
  name: string,
  content: string,
): Promise<UploadedFileResponse> => {
  const res = await requestWithToken(token, `/api/chats/${chatId}/fichiers`, 'POST', { name, content });
  if (!res.ok) {
    const erreur: { detail?: unknown; analyse?: unknown } = await res.json().catch(() => ({}));
    // On n'affiche que du texte : un détail qui n'est pas une chaîne (erreur de format FastAPI) donne un motif vide,
    // et useChats affiche alors son message générique traduit
    const motif = typeof erreur.detail === 'string' ? erreur.detail : '';
    const analyse = typeof erreur.analyse === 'string' ? erreur.analyse : undefined;
    throw new FileUploadError(motif, analyse);
  }
  const data: UploadedFileResponse = await res.json();
  return data;
};

// Retire un fichier en attente côté serveur. Un 404 veut dire "déjà retiré" : ce n'est pas une vraie erreur.
export const deleteFileOnServer = async (token: string, chatId: string, fileId: string): Promise<void> => {
  const res = await requestWithToken(token, `/api/chats/${chatId}/fichiers/${fileId}`, 'DELETE');
  if (!res.ok && res.status !== 404) throw new Error(`Réponse HTTP ${res.status}`);
};

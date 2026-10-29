import type { Chat } from './types';

// Trie les chats du plus récent au plus ancien (le nouveau chat se retrouve en tête).
// On travaille sur une copie [...list] : sort() modifie le tableau en place, et ce tableau
// vient de l'état React qu'on ne doit jamais muter directement.
export const sortNewestFirst = (list: Chat[]): Chat[] =>
  [...list].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));

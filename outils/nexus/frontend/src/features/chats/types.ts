// Un message échangé dans un chat (écrit par l'élève ou par NEXUS)
export type ChatMessage = {
  id: string;
  chat_id: string;
  role: string;
  content: string;
  timestamp: string;
  // Fichiers joints à ce message (envoyé par l'élève). Absent ou vide : aucun fichier.
  fichiers?: { id: string; name: string }[];
  // Vrai pour la réponse de NEXUS pendant qu'elle s'écrit : elle n'existe pas encore côté serveur
  enCours?: boolean;
  // Nombre de tokens de cette réponse. Donné seulement pendant la session : il n'est pas enregistré en base.
  tokens?: number | null;
};

// Fichier joint à un chat : il a été lu et analysé par NEXUS, mais pas encore envoyé avec un message
export type ChatFile = {
  id: string;
  name: string;
  size: number;
  verdict: 'SÛR' | 'À VÉRIFIER' | 'DANGEREUX';
};

// Un chat tel qu'il est affiché dans l'interface
export type Chat = {
  id: string;
  // Nom donné par l'élève ou par NEXUS. Absent ou vide : on affiche la date de création à la place.
  title?: string;
  created_at: string;
  messages: ChatMessage[];
  // Fichiers analysés en attente d'envoi. Absent ou vide : rien en attente.
  fichiers_en_attente?: ChatFile[];
};

// Réponse du serveur à l'envoi d'un message : les deux messages du tour, et le titre actuel du chat
export type SendMessageResponse = {
  message: ChatMessage;
  reply: ChatMessage;
  // Vide tant que le chat n'a pas de nom (il se remplit après le premier échange)
  title: string;
};

// Réponse du serveur à l'ajout d'un fichier : le fichier en attente, et l'analyse écrite par NEXUS
export type UploadedFileResponse = {
  fichier: ChatFile;
  message: ChatMessage;
};

// Erreur d'ajout de fichier à afficher : le motif, et l'analyse de NEXUS si le fichier a été lu
export type FileError = {
  message: string;
  analyse?: string;
};

// Raison d'un refus de fichier. On garde un code (et non le texte) pour que le message soit écrit
// dans la langue affichée au moment où on le montre (voir libelleErreurFichier).
// Seul 'serveur' porte un texte : le motif déjà rédigé par le serveur.
export type ErreurFichier =
  | { code: 'format' }
  | { code: 'nom-invalide' }
  | { code: 'taille' }
  | { code: 'nombre-max' }
  | { code: 'analyse-impossible' }
  | { code: 'serveur'; motif: string };

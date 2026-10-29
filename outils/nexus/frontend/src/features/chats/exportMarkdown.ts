import type { Chat } from './types';

// Libellés écrits dans le fichier, dans la langue affichée au moment de l'export
export type LibellesExport = {
  titreDefaut: string;
  roleEleve: string;
  roleNexus: string;
};

// Construit le texte Markdown d'une conversation : un titre, puis chaque message dans l'ordre.
// Une réponse encore en cours d'écriture est laissée de côté : elle serait incomplète dans le fichier.
export const conversationEnMarkdown = (chat: Chat, libelles: LibellesExport): string => {
  const titre = chat.title || libelles.titreDefaut;
  const blocs = chat.messages
    .filter(message => !message.enCours)
    .map(message => `## ${message.role === 'user' ? libelles.roleEleve : libelles.roleNexus}\n\n${message.content}`);
  return [`# ${titre}`, ...blocs].join('\n\n') + '\n';
};

// Nom de fichier sûr : on remplace les caractères interdits par Windows, macOS ou Linux, on retire les
// caractères de contrôle, et on raccourcit un titre trop long. Sans titre exploitable, on utilise "conversation".
export const nomFichierMarkdown = (titre: string): string => {
  const propre = titre
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/[\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)
    .trim();
  return `${propre || 'conversation'}.md`;
};

// Télécharge un texte comme fichier. Tout se passe dans le navigateur : le contenu ne repart pas vers le serveur.
export const telechargerTexte = (nomFichier: string, contenu: string): void => {
  const url = URL.createObjectURL(new Blob([contenu], { type: 'text/markdown;charset=utf-8' }));
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  // On attend un peu avant de libérer le contenu : certains navigateurs ont besoin de ce délai pour démarrer le téléchargement
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

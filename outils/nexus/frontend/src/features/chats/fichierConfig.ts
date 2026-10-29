// Règles des fichiers joints à un chat. Le navigateur les vérifie pour répondre tout de suite,
// mais c'est le serveur qui fait foi : il revérifie les mêmes règles à l'arrivée du fichier.

import type { Messages } from '../../i18n/messages';
import type { ErreurFichier } from './types';

// Formats de texte acceptés. Pas d'image, de programme compilé ni d'archive : seul du texte peut être lu et analysé.
export const FORMATS_ACCEPTES = [
  '.txt', '.md', '.py', '.js', '.jsx', '.ts', '.tsx', '.html', '.css',
  '.json', '.csv', '.xml', '.yml', '.yaml', '.cs', '.gd',
];

// Valeur de l'attribut accept de l'<input type="file"> : la boîte de dialogue ne propose que ces formats
export const ATTRIBUT_ACCEPT = FORMATS_ACCEPTES.join(',');

// Taille maximale d'un fichier, en octets (50 Ko). Assez pour un script, et on ne charge jamais un gros fichier en mémoire.
export const TAILLE_MAX_OCTETS = 51200;

// Nombre maximal de fichiers joints en attente avant l'envoi du message
export const MAX_FICHIERS_EN_ATTENTE = 3;

// Règle du nom de fichier, la même que le serveur (NewFileRequest dans backend/main.py) : pour refuser tout de suite.
// \p{L} (lettres, accents compris) et \p{N} (chiffres) remplacent le \w de Python, qui accepte aussi les lettres accentuées.
const MOTIF_NOM_FICHIER = /^[\p{L}\p{N}_ .()-]+$/u;
// Longueur maximale du nom, en caractères (et non en unités UTF-16 : [...nom] compte bien les caractères)
const NOM_MAX_CARACTERES = 100;

// Vrai si le nom est accepté par le serveur : espaces de bord retirés, 1 à 100 caractères, et seulement les caractères autorisés
const nomAccepte = (nom: string): boolean => {
  const nettoye = nom.trim();
  return [...nettoye].length <= NOM_MAX_CARACTERES && MOTIF_NOM_FICHIER.test(nettoye);
};

// Renvoie la raison du refus du fichier, ou null s'il est accepté. Le texte n'est pas écrit ici :
// il est choisi au moment de l'affichage (libelleErreurFichier), pour suivre la langue choisie.
// L'extension, le nom et la taille sont vérifiés AVANT de lire le contenu du fichier.
export const verifierFichier = (file: File): ErreurFichier | null => {
  const position = file.name.lastIndexOf('.');
  const extension = position === -1 ? '' : file.name.slice(position).toLowerCase();
  if (!FORMATS_ACCEPTES.includes(extension)) {
    return { code: 'format' };
  }
  if (!nomAccepte(file.name)) {
    return { code: 'nom-invalide' };
  }
  if (file.size > TAILLE_MAX_OCTETS) {
    return { code: 'taille' };
  }
  return null;
};

// Texte à afficher pour une erreur de fichier, dans la langue du dictionnaire donné
export const libelleErreurFichier = (erreur: ErreurFichier, t: Messages): string => {
  switch (erreur.code) {
    case 'format':
      return t.features.fichiers.formatNonAccepte(FORMATS_ACCEPTES.join(', '));
    case 'nom-invalide':
      return t.features.fichiers.nomInvalide;
    case 'taille':
      return t.features.fichiers.tropLourd(TAILLE_MAX_OCTETS / 1024);
    case 'nombre-max':
      return t.features.fichiers.nombreMax(MAX_FICHIERS_EN_ATTENTE);
    case 'analyse-impossible':
      return t.features.fichiers.analyseImpossible;
    case 'serveur':
      return erreur.motif;
  }
};

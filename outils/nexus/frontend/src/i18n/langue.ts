// Langue de l'interface : français ou anglais. Le choix est gardé dans le navigateur (par appareil),
// et envoyé au serveur avec chaque requête pour que l'IA réponde dans la même langue.

export type Langue = 'fr' | 'en';

export const LANGUES: Langue[] = ['fr', 'en'];

// Nom de la clé dans le localStorage. Le navigateur peut le bloquer : on lit et on écrit dans un try/catch.
const CLE_STOCKAGE = 'nexus-langue';

// Langue actuellement affichée. Les fonctions qui n'ont pas accès à React (appels réseau) la lisent ici.
let langueCourante: Langue = 'fr';

const estLangue = (valeur: unknown): valeur is Langue =>
  typeof valeur === 'string' && (LANGUES as string[]).includes(valeur);

// Première langue utilisée : le choix déjà fait, sinon la langue du navigateur (anglais si elle commence par "en"), sinon français.
export const lireLangueInitiale = (): Langue => {
  try {
    const sauvegardee = localStorage.getItem(CLE_STOCKAGE);
    if (estLangue(sauvegardee)) return sauvegardee;
  } catch {
    // Stockage bloqué (navigation privée, données effacées) : on passe à la langue du navigateur.
  }
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'fr';
};

export const sauvegarderLangue = (langue: Langue): void => {
  try {
    localStorage.setItem(CLE_STOCKAGE, langue);
  } catch {
    // Pas de sauvegarde possible : le choix vaut pour cette page seulement.
  }
};

export const getLangueCourante = (): Langue => langueCourante;

export const setLangueCourante = (langue: Langue): void => {
  langueCourante = langue;
};

// En-tête envoyé avec chaque requête vers le backend : le serveur répond et écrit dans cette langue.
export const enteteLangue = (): { 'Accept-Language': Langue } => ({ 'Accept-Language': langueCourante });

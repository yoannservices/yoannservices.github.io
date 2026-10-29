// Liste des jeux proposés dans NEXUS.
// Pour ajouter un jeu : copier ses fichiers dans public/jeux/<nom-du-jeu>/, puis ajouter une ligne ici.
// Le "chemin" est l'adresse de la page d'accueil du jeu, à partir de la racine du site.
export type Jeu = {
  id: string;
  titre: string;
  chemin: string;
};

export const JEUX: Jeu[] = [
  {
    id: 'tesla-roadster',
    titre: 'Tesla Roadster',
    chemin: '/jeux/tesla-roadster/index.html',
  },
  {
    id: 'game-tools-lab',
    titre: 'Game Tools Lab',
    chemin: '/jeux/game-tools-lab/index.html',
  },
];

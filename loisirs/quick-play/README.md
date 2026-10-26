# QuickPlay

15 mini-jeux arcade dans le navigateur.

**▶ Démo en ligne : [https://yoannservices.github.io/quick-play/](https://yoannservices.github.io/quick-play/)**

## Fonctionnalités

- Réaction, Space Clicker (idle), Mémoire, Devinette, Typing Rush, Aim Trainer, Anagramme
- Snake, 2048, Démineur, Blackjack, Dino Run, Dodge Zone, Hunter Zone, Space Tower Defense
- Profil joueur avec niveaux et XP, meilleurs scores et 10 succès
- Filtre par catégorie (Réflexe, Puzzle, Vitesse, Arcade, Cartes, Survie, Action, Stratégie, Idle)
- Progression enregistrée (`localStorage`)

## Lancer en local

Aucune installation : ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
python -m http.server 8000
```

puis allez sur http://localhost:8000 (dans le dossier `web/` de Mes Projets : http://localhost:8000/loisirs/quick-play/).

## Structure

- `index.html` : l'accueil et le choix du jeu
- `games/` : une page HTML par jeu
- `js/` : un script par jeu
- `css/` : `main.css`, `shared.css` et une feuille par jeu

## Technologies

HTML, CSS et JavaScript, sans framework ni étape de build.

---

Fait partie de [Mes Projets](https://yoannservices.github.io/) · [Portfolio](https://yoannservices.github.io/portfolio/) · par [@yoannservices](https://github.com/yoannservices)

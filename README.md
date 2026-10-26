# Mes Projets

Le site qui regroupe tous mes projets web : outils, développement, loisirs et éducation.

**▶ En ligne : [https://yoannservices.github.io/](https://yoannservices.github.io/)**

Chaque projet important a aussi son propre dépôt (voir mon [portfolio](https://yoannservices.github.io/portfolio/) et [mon profil GitHub](https://github.com/yoannservices)).

## Organisation

- `index.html` : la page d'accueil (le hub) qui liste tous les projets
- `assets/site.js` : la liste des projets (catégorie, chemin, nom, description) et la barre de navigation commune
- `assets/theme.css` : le thème commun à toutes les pages
- `developpement/` : API Dashboard, Portfolio
- `education/` : Révision Lycée, Tableau Périodique
- `outils/` : Agenda, Conjugator, CSS Animator, Game Tools Lab, Générateur de CV, Habit Tracker, Lieux Proches, PC Builder, Unit Converter
- `loisirs/` : jeux, simulateurs 3D, Sport Live, Pokédex, Music Player, Tier List, Univers, script Operateur112

Chaque projet a son propre `README.md` dans son dossier.

## Ajouter un projet

1. Créer le dossier dans la bonne catégorie (nom en `minuscules-avec-tirets`) avec son `index.html`.
2. Ajouter une ligne dans la liste des projets de `assets/site.js` (`cat`, `path`, `name`, `desc`).

## Lancer en local

```bash
python -m http.server 8765
```

puis ouvrez http://localhost:8765 (c'est aussi la configuration `web` de `.claude/launch.json`). HTML, CSS et JavaScript, sans build.

## Publier sur GitHub

Le script `.claude/publier.py` copie ce dossier vers le dépôt `yoannservices.github.io` et chaque projet vers son propre dépôt :

```bash
python .claude/publier.py                          # aperçu, ne pousse rien
python .claude/publier.py --projet loisirs/moto-rider
python .claude/publier.py --publier -m "Message"   # commit et push
```

Il faut [GitHub CLI](https://cli.github.com/) (`gh`) connecté au compte. Les dossiers `.claude`, `.github` et `node_modules` ne sont jamais publiés.

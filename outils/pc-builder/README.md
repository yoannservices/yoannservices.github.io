# PC Builder Pro

Configurateur de PC : compatibilité des composants, budget et benchmarks estimés.

**▶ Démo en ligne : [https://yoannservices.github.io/pc-builder/](https://yoannservices.github.io/pc-builder/)**

## Fonctionnalités

- Assistant : profil (Gaming, Streaming, Création, Bureautique), budget de 300 à 5000 €, préférence de marques (AMD / Intel / NVIDIA)
- Recommandation automatique ou choix manuel de chaque composant (CPU, GPU, carte mère, RAM, stockage, refroidissement, alimentation, boîtier, écran, périphériques)
- Prix total, consommation, reste du budget, contrôle de compatibilité
- Scores par usage et estimation des FPS en 1080p / 1440p / 4K
- Sauvegarde, export et panier Amazon

## Lancer en local

Aucune installation : ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
python -m http.server 8000
```

puis allez sur http://localhost:8000 (dans le dossier `web/` de Mes Projets : http://localhost:8000/outils/pc-builder/).

## Structure

- `index.html` : la page
- `style.css` : les styles
- `script.js` : la logique

## À savoir

Les prix et performances sont des estimations intégrées au code, pas des données en temps réel.

## Technologies

HTML, CSS et JavaScript, sans framework ni étape de build.

---

Fait partie de [Mes Projets](https://yoannservices.github.io/) · [Portfolio](https://yoannservices.github.io/portfolio/) · par [@yoannservices](https://github.com/yoannservices)

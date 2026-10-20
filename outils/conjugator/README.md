# Conjugator

Analyse une forme verbale française : mode, temps et personne.

**▶ Démo en ligne : [https://yoannservices.github.io/conjugator/](https://yoannservices.github.io/conjugator/)**

## Fonctionnalités

- Tapez un verbe conjugué puis **Entrée** : l'outil retrouve l'infinitif, le mode, le temps et la personne
- Bouton « Conjuguer tout » pour afficher toute la conjugaison
- Favoris et historique des recherches
- Les données sont enregistrées dans le navigateur (`localStorage`) : elles restent sur cet appareil.

## Lancer en local

Ce projet charge des fichiers locaux : il faut le servir (l'ouverture directe de `index.html` ne suffit pas).

```bash
python -m http.server 8000
```

puis allez sur http://localhost:8000 (dans le dossier `web/` de Mes Projets : http://localhost:8000/outils/conjugator/).

## Structure

- `index.html` : la page
- `style.css` : les styles
- `script.js` : la logique
- `conjugaisons.json` : la base de conjugaisons chargée au démarrage

## Technologies

HTML, CSS et JavaScript, sans framework ni étape de build.

---

Fait partie de [Mes Projets](https://yoannservices.github.io/) · [Portfolio](https://yoannservices.github.io/Y.Portfolio/) · par [@yoannservices](https://github.com/yoannservices)

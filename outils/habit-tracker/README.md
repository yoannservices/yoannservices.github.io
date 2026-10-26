# Habit Tracker

Suivi d'habitudes quotidiennes avec séries, statistiques et vue mensuelle.

**▶ Démo en ligne : [https://yoannservices.github.io/habit-tracker/](https://yoannservices.github.io/habit-tracker/)**

## Fonctionnalités

- Créer des habitudes par catégorie et les cocher chaque jour
- Séries (streaks) en cours et record
- Statistiques et graphiques, vue mensuelle
- Export du mois en JSON ou CSV
- Les données sont enregistrées dans le navigateur (`localStorage`) : elles restent sur cet appareil.

## Lancer en local

Aucune installation : ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
python -m http.server 8000
```

puis allez sur http://localhost:8000 (dans le dossier `web/` de Mes Projets : http://localhost:8000/outils/habit-tracker/).

## Structure

- `index.html` : application React complète (JSX compilé dans le navigateur)

## Technologies

React 18 et Babel standalone chargés depuis un CDN (pas de build), graphiques avec Chart.js 4. Tout tient dans `index.html`.

---

Fait partie de [Mes Projets](https://yoannservices.github.io/) · [Portfolio](https://yoannservices.github.io/portfolio/) · par [@yoannservices](https://github.com/yoannservices)

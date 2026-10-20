# Agenda Semaine A/B

Planning interactif pour les emplois du temps en semaines alternées (A / B).

**▶ Démo en ligne : [https://yoannservices.github.io/outils/agenda/](https://yoannservices.github.io/outils/agenda/)**

## Fonctionnalités

- Ajouter un événement : nom, semaine (A, B ou les deux), jour, heures de début et de fin, lieu, description
- Affichage filtré : semaine A, semaine B ou tout
- Suppression d'un événement depuis le tableau
- Les données sont enregistrées dans le navigateur (`localStorage`) : elles restent sur cet appareil.

## Lancer en local

Aucune installation : ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
python -m http.server 8000
```

puis allez sur http://localhost:8000 (dans le dossier `web/` de Mes Projets : http://localhost:8000/outils/agenda/).

## Structure

- `index.html` : la page
- `style.css` : les styles
- `script.js` : la logique

## Technologies

HTML, CSS et JavaScript, sans framework ni étape de build.

---

Fait partie de [Mes Projets](https://yoannservices.github.io/) · [Portfolio](https://yoannservices.github.io/Y.Portfolio/) · par [@yoannservices](https://github.com/yoannservices)

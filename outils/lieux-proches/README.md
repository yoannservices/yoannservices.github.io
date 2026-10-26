# Lieux Proches

Découvrir des lieux et des événements proches de chez soi selon son profil.

**▶ Démo en ligne : [https://yoannservices.github.io/outils/lieux-proches/](https://yoannservices.github.io/outils/lieux-proches/)**

## Fonctionnalités

- Formulaire de profil (nom, année de naissance, envies…)
- Carte interactive des lieux
- Filtres par type (Culture, Social, Nature, Food, Sport) et distance maximale
- Favoris (cœur sur un lieu)
- Les données sont enregistrées dans le navigateur (`localStorage`) : elles restent sur cet appareil.

## Lancer en local

Aucune installation : ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
python -m http.server 8000
```

puis allez sur http://localhost:8000 (dans le dossier `web/` de Mes Projets : http://localhost:8000/outils/lieux-proches/).

## Structure

- `index.html` : la page
- `style.css` : les styles
- `script.js` : la logique
- `about.html` : page « À propos »
- `concert.png`, `musee.png`, `tour-eiffel.png` : images des lieux

## À savoir

Les lieux proposés sont des exemples intégrés au code (pas de base de données réelle).

## Technologies

HTML, CSS et JavaScript ; carte avec [Leaflet](https://leafletjs.com/) 1.9.4 (CDN).

---

Fait partie de [Mes Projets](https://yoannservices.github.io/) · [Portfolio](https://yoannservices.github.io/portfolio/) · par [@yoannservices](https://github.com/yoannservices)

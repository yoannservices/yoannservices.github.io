# Tier List Maker

Créer un classement (tier list) par glisser-déposer.

**▶ Démo en ligne : [https://yoannservices.github.io/loisirs/tier-list/](https://yoannservices.github.io/loisirs/tier-list/)**

## Fonctionnalités

- Glisser les éléments dans les rangs du classement
- Renommer un élément (Entrée pour valider, Échap pour annuler)
- Export en image PNG et remise à zéro
- Les données sont enregistrées dans le navigateur (`localStorage`) : elles restent sur cet appareil.

## Lancer en local

Aucune installation : ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
python -m http.server 8000
```

puis allez sur http://localhost:8000 (dans le dossier `web/` de Mes Projets : http://localhost:8000/loisirs/tier-list/).

## Structure

- `index.html` : la page
- `style.css` : les styles
- `script.js` : la logique

## Technologies

HTML, CSS et JavaScript, sans framework ni étape de build.

---

Fait partie de [Mes Projets](https://yoannservices.github.io/) · [Portfolio](https://yoannservices.github.io/portfolio/) · par [@yoannservices](https://github.com/yoannservices)

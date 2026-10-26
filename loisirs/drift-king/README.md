# Drift King (Col du Drift)

Jeu de drift 3D sur une route de montagne au coucher du soleil, jouable dans le navigateur.

**▶ Démo en ligne : [https://yoannservices.github.io/drift-king/](https://yoannservices.github.io/drift-king/)**

## Fonctionnalités

- Entrez en virage avec de la vitesse et tenez la glisse le plus longtemps possible
- Score et combo, perdu si vous touchez la glissière
- Meilleur score enregistré (`localStorage`)

## Commandes

| Touche | Action |
|---|---|
| ↑ / Z / W | Accélérer |
| ↓ / S | Freiner |
| ← → / Q D | Tourner |
| Espace | Frein à main |
| R | Replacer la voiture |
| Clic + glisser | Tourner la caméra autour de la voiture |

## Lancer en local

Aucune installation : ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
python -m http.server 8000
```

puis allez sur http://localhost:8000 (dans le dossier `web/` de Mes Projets : http://localhost:8000/loisirs/drift-king/).

## Structure

- `index.html`, `style.css`
- `js/main.js` : le jeu

## Technologies

HTML, CSS et JavaScript ; rendu 3D avec [Three.js](https://threejs.org/) r128 (chargé depuis un CDN). Sans étape de build.

---

Fait partie de [Mes Projets](https://yoannservices.github.io/) · [Portfolio](https://yoannservices.github.io/portfolio/) · par [@yoannservices](https://github.com/yoannservices)

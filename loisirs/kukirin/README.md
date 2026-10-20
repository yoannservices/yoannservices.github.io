# Kukirin (Kuki City)

Jeu 3D de trottinette électrique en ville : livraisons, quêtes et garage.

**▶ Démo en ligne : [https://yoannservices.github.io/kukirin/](https://yoannservices.github.io/kukirin/)**

## Fonctionnalités

- Ville ouverte : livraisons de colis, pièces à ramasser, quêtes
- Téléphone en jeu : livraisons, carte, trottinettes
- Police : un feu grillé ou un excès de vitesse vu par une patrouille déclenche une poursuite
- Garage : boutique, atelier, repos ; batterie à gérer
- Progression enregistrée automatiquement (`localStorage`)

## Commandes

| Touche | Action |
|---|---|
| Z S Q D (ou flèches) | Accélérer, freiner / reculer, tourner |
| Maj | Wheelie |
| Espace | Frein arrière (dérapage) |
| E | Garage |
| T | Téléphone |
| C / M / Tab | Caméra / carte / quêtes et aide |
| Échap | Pause |

## Lancer en local

Aucune installation : ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
python -m http.server 8000
```

puis allez sur http://localhost:8000 (dans le dossier `web/` de Mes Projets : http://localhost:8000/loisirs/kukirin/).

## Structure

- `index.html`, `style.css`
- `js/main.js` : le jeu

## À savoir

Fan game non officiel : les caractéristiques des trottinettes KUKIRIN sont ajustées pour le jeu.

## Technologies

HTML, CSS et JavaScript ; rendu 3D avec [Three.js](https://threejs.org/) r128 (chargé depuis un CDN). Sans étape de build.

---

Fait partie de [Mes Projets](https://yoannservices.github.io/) · [Portfolio](https://yoannservices.github.io/Y.Portfolio/) · par [@yoannservices](https://github.com/yoannservices)

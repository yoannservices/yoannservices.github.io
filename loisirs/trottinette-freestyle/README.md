# Trottinette Freestyle

Skatepark 3D : whips, barspins, flips et grinds en trottinette freestyle.

**▶ Démo en ligne : [https://yoannservices.github.io/trottinette-freestyle/](https://yoannservices.github.io/trottinette-freestyle/)**

## Fonctionnalités

- Skatepark en béton : quarters, vert de 3,2 m, mini rampe, funbox, kickers, escalier avec main courante, rails et ledges
- Figures : bunny hops, tailwhips, heelwhips, barspins, flips, grinds, manuals, combos
- Modes Ride libre et Session de 2 minutes, livre des figures et défis du park
- Meilleurs scores (`localStorage`)

## Commandes

| Touche | Action |
|---|---|
| Z | Pousser / pumper (Z maintenu en l'air : frontflip) |
| S | Freiner (en l'air : backflip) |
| Q / D | Tourner (en l'air : rotations 180 / 360…) |
| Espace | Maintenir puis relâcher : saut |
| Maj | Manual (Maj + Z : nose manual) |
| E | Revert |
| J / U | Tailwhip / heelwhip |
| P / Échap | Pause |
| Clic + glisser | Tourner la caméra autour du rider |

## Lancer en local

Aucune installation : ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
python -m http.server 8000
```

puis allez sur http://localhost:8000 (dans le dossier `web/` de Mes Projets : http://localhost:8000/loisirs/trottinette-freestyle/).

## Structure

- `index.html`, `style.css`
- `js/main.js` : boucle et interface
- `js/park.js` : le skatepark
- `js/rider.js` : physique du rider
- `js/tricks.js` : figures et score

## À savoir

Touches indiquées en AZERTY. En QWERTY : W A S D. Les flèches marchent aussi.

## Technologies

HTML, CSS et JavaScript ; rendu 3D avec [Three.js](https://threejs.org/) r128 (chargé depuis un CDN). Sans étape de build.

---

Fait partie de [Mes Projets](https://yoannservices.github.io/) · [Portfolio](https://yoannservices.github.io/Y.Portfolio/) · par [@yoannservices](https://github.com/yoannservices)

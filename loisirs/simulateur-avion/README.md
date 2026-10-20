# Simulateur Avion (Horizon)

Simulateur de vol 3D dans le navigateur : F-35B et PV-40 à aile basculante, relief, météo, vol libre.

**▶ Démo en ligne : [https://yoannservices.github.io/simulateur-avion/](https://yoannservices.github.io/simulateur-avion/)**

## Fonctionnalités

- Deux appareils : F-35B (tuyères orientables) et PV-40 à aile basculante (couleur personnalisable)
- Quatre pistes, départ sur la piste, au décollage vertical ou en vol
- Heure au choix : jour, coucher de soleil, nuit
- Pilotage assisté optionnel, train, volets, parachute, rampe arrière, carte

## Commandes

| Touche | Action |
|---|---|
| Z / ↓ | Cabrer |
| S / ↑ | Piquer |
| Q ← / D → | Rouler à gauche / droite |
| A / E | Palonnier |
| Maj / Ctrl | Poussée + / − (à 100 %, rappuyer sur Maj = boost) |
| Espace | Freinage d'urgence |
| J | Larguer le parachute |
| T / Y | Tuyères (F-35) · basculer / rabaisser l'aile (PV-40) |
| B | Freins VTOL (PV-40) |
| O | Portes et rampe arrière (PV-40) |
| G | Train d'atterrissage |
| F | Volets |
| C | Changer de vue |

## Lancer en local

Aucune installation : ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
python -m http.server 8000
```

puis allez sur http://localhost:8000 (dans le dossier `web/` de Mes Projets : http://localhost:8000/loisirs/simulateur-avion/).

## Structure

- `index.html`, `style.css`
- `js/main.js` : le simulateur

## Technologies

HTML, CSS et JavaScript ; rendu 3D avec [Three.js](https://threejs.org/) r128 (chargé depuis un CDN). Sans étape de build.

---

Fait partie de [Mes Projets](https://yoannservices.github.io/) · [Portfolio](https://yoannservices.github.io/Y.Portfolio/) · par [@yoannservices](https://github.com/yoannservices)

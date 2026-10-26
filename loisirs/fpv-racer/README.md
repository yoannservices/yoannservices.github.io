# FPV Racer

Simulateur de drone FPV 3D dans le navigateur : acro, rates Betaflight, propwash, tunnels, bando, course et suivi de voitures en drift.

**▶ Démo en ligne : [https://yoannservices.github.io/fpv-racer/](https://yoannservices.github.io/fpv-racer/)**

## Fonctionnalités

- Mode acro réaliste (sans stabilisation) ou angle auto-level pour débuter
- Trois sessions : vol libre, course (9 checkpoints, chrono au tour), suivi de voitures en drift
- Rates Betaflight, propwash, OSD et effet vidéo analogique
- Manette Xbox / PlayStation ou radiocommande USB (EdgeTX / OpenTX en mode Joystick) avec calibrage
- Réglages enregistrés (`localStorage`)

## Commandes

| Touche | Action |
|---|---|
| Z / S (W/S en QWERTY) | Gaz |
| Q / D | Lacet |
| ↑ ↓ | Tangage |
| ← → | Roulis |
| Espace | Armer / désarmer |
| R | Reset |
| C | Caméra |
| Clic + glisser | Tourner autour du drone (vue poursuite) |
| T | Cible |
| H | OSD |
| Échap | Menu |

## Lancer en local

Aucune installation : ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
python -m http.server 8000
```

puis allez sur http://localhost:8000 (dans le dossier `web/` de Mes Projets : http://localhost:8000/loisirs/fpv-racer/).

## Structure

- `index.html`, `style.css`
- `js/main.js` : boucle principale
- `js/physics.js` : physique du drone
- `js/input.js` : clavier, manette, radiocommande
- `js/world.js` : la carte
- `js/targets.js` : course et cibles
- `js/fx.js` : effets vidéo
- `js/ui.js`, `js/settings.js` : menus et réglages

## Technologies

HTML, CSS et JavaScript ; rendu 3D avec [Three.js](https://threejs.org/) r128 (chargé depuis un CDN). Sans étape de build.

---

Fait partie de [Mes Projets](https://yoannservices.github.io/) · [Portfolio](https://yoannservices.github.io/portfolio/) · par [@yoannservices](https://github.com/yoannservices)

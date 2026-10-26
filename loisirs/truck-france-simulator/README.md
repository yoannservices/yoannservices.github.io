# Truck France Simulator

```
truck-france-simulator/
├─ index.html · style.css
└─ js/
   ├─ main.js              boucle de jeu, caméra, assemblage
   ├─ core/                input (clavier + manette), state (sauvegarde)
   ├─ truck/               truckData, truckPhysics, truckModel
   ├─ world/               environment (jour/nuit), routeWorld (route 3D)
   ├─ map/                 cities, graph (A*), routing, mapScreen (Leaflet)
   ├─ economy/             contracts (génération, gains/pénalités)
   ├─ weather/ · traffic/  météo, voitures IA
   └─ ui/                  hud, garage, screens (menu, contrats, résumé)
```

## Lancer
Aucune installation : three.js et Leaflet viennent d'un CDN (connexion internet requise).
Les modules JS exigent un serveur local, pas un double-clic :
```
python -m http.server 8765   # puis http://localhost:8765/
```

## Contrôles
ZQSD / flèches · Espace frein à main · C caméra · G garage · M carte · L charge · F plein · H météo · P pause (à l'arrêt) · R départ · manette : stick, RT/LT, A.

Assets : aucun, tout est en primitives Three.js (pas de source externe).

## Tests
```
node js/map/routing.test.mjs
node js/economy/contracts.test.mjs
```
Flux : menu → garage → contrats → carte → conduite → résumé (sauvegarde localStorage `tfs-save-v1`). Échap : menu.

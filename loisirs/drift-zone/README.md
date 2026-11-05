# Drift Zone

Jeu d'arcade de drift en 3D, caméra haute qui suit la voiture et prend de la hauteur avec la vitesse : une arène remplie d'obstacles, une voiture, 120 secondes. Plus tu glisses longtemps et vite, plus tu marques. Le but est de battre ton meilleur score.

## Règles

- **Durée** : 120 s par partie.
- **Points** : tant que tu dérapes, tu gagnes `angle de glisse x vitesse x multiplicateur`. Ces points restent « en jeu » et ne sont validés qu'à la fin de la chaîne de drift.
- **Combo** : le multiplicateur monte pendant que tu tiens la glisse (jusqu'à x10). Hors glisse, tu as 1 s avant que la chaîne soit validée.
- **Frôler un obstacle** sans le toucher (moins de 22 px, assez vite) donne un bonus et un coup de pouce au combo.
- **Chocs** : un impact assez fort annule la chaîne en cours (pas pour les cônes). Cônes et caisses se déplacent à l'impact ; piliers, murs et blocs sont fixes.
- **Meilleur score** enregistré dans le navigateur (`localStorage`).

## Touches (AZERTY)

| Touche | Action |
|---|---|
| Z S Q D / flèches | Accélérer, freiner, tourner |
| Espace | Frein à main (déclenche la glisse) |
| R | Recommencer |
| P / Échap | Pause |
| M | Son |
| G | Debug |

Manette supportée.

## Lancer

Servir le dossier `web/` puis ouvrir `loisirs/drift-zone/index.html` (modules ES : le double-clic ne marche pas) :

```
npx http-server . -p 5180 -c-1
```

## Arborescence

```
src/config     voiture, obstacles, score, vues
src/systems    Car (physique), Collision, Input, Obstacles, Score
src/render     Stage (arène), CarMesh, CameraRig, fumée, traces de pneus
src/game.js    boucle de partie (chrono, fin, meilleur score)
src/hud.js  src/audio.js  src/map.js  src/main.js
```

## Crédits des modèles 3D

Voir `assets/models/CREDITS.md`.

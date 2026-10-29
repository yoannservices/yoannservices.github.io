# Downhill Riders

VTT de descente freestyle façon Descenders : pistes générées à partir d'une graine, sauts, passerelles, rails, drops, tronçons techniques, lignes risquées, tricks, mode run à vies limitées, progression et boutique. Tout est généré par code : aucun modèle, aucune texture ni aucun son externe.

## Lancer

Aucune installation, aucun build : servir le dossier `web/` et ouvrir `loisirs/downhill-riders/`.

```bash
python -m http.server 8000
```

puis http://localhost:8000/loisirs/downhill-riders/

## Commandes (clavier AZERTY, mêmes touches que Trottinette Freestyle)

| Touche | Action |
|---|---|
| Z | Pédaler (en l'air : frontflip) |
| S | Frein arrière (en l'air : backflip) |
| F | Frein avant |
| Q / D | Tourner (en l'air : rotations 180 / 360) |
| Espace | Maintenir puis relâcher : saut |
| Maj | Manual (Maj + Z : nose manual) |
| E | Revert (demi-tour rapide en l'air) |
| J / U | Whip à gauche / à droite |
| K / I | Barspin |
| L | Tabletop (Maj + L : superman) |
| T | No-hander |
| C | Changer de vue (3e personne, casque, éloignée) |
| M | Carte de la descente |
| R | Retour au dernier point de contrôle |
| H | Aide |
| P / Échap | Pause |
| Clic + glisser | Tourner la caméra |

Une touche de figure déjà tenue au décollage ne la déclenche pas : relâche puis appuie en l'air. Manette : stick gauche, A saut, RT pédaler, B frein arrière, LT frein avant, X tabletop, Y no-hander, LB / RB whips, stick droit flips et rotations.

## Jeu

- **Descentes** : une graine = une descente. Biomes forêt, montagne, désert, neige, volcan. Niveaux vert, bleu, rouge, noir. Bifurcations : ligne sûre ou ligne risquée avec un gros saut.
- **Mode run** : vies limitées, un crash en coûte une, fin de run = résultats. **Mode libre** : sans pression.
- **Score** : points de réputation par figures, sauts, vitesse, rails, lignes risquées ; combos ; un crash fait perdre le combo en cours.
- **Progression** : la réputation débloque biomes et niveaux ; boutique de vélos (enduro, descente, freeride), cadres, roues, tenues, casques.
- **Objectifs** par descente : chrono, figure précise, saut le plus long.

## Structure

- `src/core` : graine, entrées (clavier, manette), sauvegarde `localStorage`, configuration
- `src/bike` : physique du vélo, modèle en primitives, catalogue
- `src/rider` : pilote, ragdoll, réception
- `src/world` : générateur de piste, éléments, terrain par segments, biomes, végétation, textures canvas
- `src/gameplay` : tricks, score, run, points de contrôle, objectifs, progression
- `src/camera`, `src/fx` (flou radial), `src/audio` (Web Audio), `src/ui` (HUD, menus, boutique, résultats)

Terrain généré par segments chargés et déchargés autour du pilote, végétation en `InstancedMesh`, géométries fusionnées.

## Technologies

JavaScript (modules ES) et [Three.js](https://threejs.org/) r186 chargé par import map depuis un CDN. Sans étape de build.

## Crédits des modèles 3D

Véhicules réels sous licence CC-BY (Sketchfab) : auteurs et licences dans `assets/models/CREDITS.md`.

# Parking Master

Jeu de stationnement en 3D : on suit les chevrons verts posés au sol jusqu'à la place, puis on se gare sans toucher un obstacle. **20 niveaux** (4 lieux x 5 niveaux de plus en plus difficiles), des voitures et des piétons PNJ, des espaces serrés mais réalistes ; de 1 à 3 étoiles selon le temps (comme Car Parking Multiplayer).

Three.js r186 par import map, modules ES, sans build. Les voitures sont de vrais modèles .glb (pack « Generic passenger car pack », `assets/models/npc/car-*.glb`, CC-BY, crédité dans `assets/models/CREDITS.md`), ainsi que les piétons (`proportional_low_poly_man`). Tout le décor est généré par code : textures peintes en canvas (asphalte, pavés, pierre, gravier, terre, herbe, écorce, roche, neige, bois, façades, tuiles...), ciel atmosphérique avec reflets sur les voitures, ombres, brume.

## Les niveaux

| Lieu | Niveau | Voiture | Défi |
|---|---|---|---|
| **Ville** | 1 · Centre-ville | compacte | stationnement en bataille entre deux voitures |
| | 2 · Rue Pasteur | berline | créneau le long du trottoir, circulation en face, piétons |
| | 3 · Le supermarché | break | place étroite entre deux SUV, caddies, voitures qui cherchent une place |
| | 4 · Parking souterrain | compacte | plafond bas, piliers, place serrée par un pilier |
| | 5 · La cour du vieux quartier | compacte | ruelle pavée, porche de 3,6 m, cour aux places serrées |
| **Campagne** | 1 · La ferme | pick-up | cour de ferme, entre deux véhicules, face à la clôture |
| | 2 · La place du village | compacte | marché, fontaine, terrasses, voiture qui tourne autour |
| | 3 · Le hangar à tracteurs | pick-up | entrer dans le hangar, contourner le tracteur, place au fond |
| | 4 · Le chemin creux | break | chemin entre deux murs de pierre, niche de 2,75 m |
| | 5 · Le vide-grenier | monospace | pré rempli de voitures garées en épi, visiteurs |
| **Forêt** | 1 · La clairière | 4x4 | chemin de terre, alvéole entre deux troncs |
| | 2 · Le camping | SUV | boucle autour du feu, emplacement entre caravane et pin |
| | 3 · La scierie | pick-up | couloir de 3,4 m entre deux piles de grumes |
| | 4 · Le chalet | break | place de poche contre la façade, entre bois et pick-up |
| | 5 · Le pont de bois | SUV | pont à voie unique, randonneurs, aire de départ des sentiers |
| **Montagne** | 1 · Le belvédère | SUV | parking au bord du précipice, face au garde-corps |
| | 2 · La station de ski | SUV | parking enneigé, skieurs, congères |
| | 3 · L'aire du col | break | créneau entre deux camping-cars, circulation du col |
| | 4 · Le village alpin | compacte | ruelle enneigée, niche entre deux chalets |
| | 5 · Le garage du téléphérique | SUV | creusé dans la roche, piliers, la place la plus serrée |

Dans un lieu, les niveaux se débloquent dans l'ordre ; les quatre lieux sont ouverts dès le départ (onglets du menu).

## Règles

- **Chevrons** : ils guident de la voiture jusqu'à l'entrée de la place, puis s'éteignent. La place est seulement peinte au sol : on ne la voit pas de loin ni à travers un mur.
- **Choc** : à **10 km/h ou plus**, le niveau est perdu et recommence aussitôt. En dessous, c'est un simple avertissement à l'écran (aucune pénalité).
- **Piéton touché** : le niveau est perdu quelle que soit la vitesse. Les piétons s'arrêtent quand la voiture arrive devant eux ; les voitures PNJ s'arrêtent devant un obstacle.
- **Réussite** : voiture entièrement dans le cadre, immobile environ 1 seconde. Le chrono part au premier mouvement.
- **Étoiles** : 3 étoiles en 20 s, 2 étoiles en 30 s, sinon 1, pour le premier niveau de chaque lieu ; les niveaux suivants ont un temps un peu plus long (de 24 / 36 s à 36 / 54 s).
- **Suite d'un lieu** : un niveau peut avoir `after: '<id précédent>'` dans `src/levels/levels.js` ; il commence alors là où l'autre s'est terminé, avec la même voiture. Non utilisé pour l'instant.

## Touches (AZERTY)

| Touche | Action |
|---|---|
| Z / ↑ | Avancer |
| S / ↓ | Freiner, puis reculer en gardant la touche |
| Q D / ← → | Tourner |
| Espace | Frein à main |
| C | Changer de vue (poursuite, proche, haute) |
| R | Recommencer le niveau |
| Échap | Pause |
| Clic + glisser | Tourner la caméra autour de la voiture |

La caméra se rapproche quand un mur, un pilier ou un arbre passe derrière la voiture, et ne dépasse jamais le plafond d'un parking couvert. Manette : stick gauche (direction), RT / LT (gaz, frein), A (frein à main), Y (vue), B (recommencer), Start (pause).

## Lancer

Servir le dossier `web/` puis ouvrir `loisirs/parking-master/index.html` (modules ES : le double-clic ne marche pas) :

```
npx http-server . -p 5180 -c-1
```

## Tests

- `node test/logic.mjs` : physique (accélération, freinage, marche arrière, rayon de braquage), collisions, détection de la place, cohérence des 20 niveaux et des étoiles. Sans rendu.
- Dans le navigateur (le décor a besoin de Three.js) : `const { check } = await import('/loisirs/parking-master/test/browser-check.js'); await check();` ou `check(['ville-3'])`. Pour chaque niveau : départ libre, voiture dans la place sans contact, route libre d'obstacle fixe, PNJ qui ne bloquent pas la place, stationnement réussi.
- Le panneau navigateur caché ne fait pas avancer `requestAnimationFrame` : appeler `window.__pm.updatePlay(dt)` à la main pour simuler une partie.
- Pour vérifier la syntaxe, copier un fichier en `.mjs` avant `node --check` (sur `.js`, Node 24 ne signale pas toutes les erreurs).

## Arborescence

```
src/core        util (bruit, graine), input (clavier, manette), save (localStorage)
src/car         physics (voiture arcade autour de l'essieu arrière), model (.glb, roues, tangage)
src/camera      rig (poursuite, proche, haute, orbite à la souris, anti-mur)
src/gameplay    collision (rectangles orientés), run (chocs, piétons, étoiles), guide (chevrons, marquage de la place)
src/levels      levels (départ, route, place, temps d'étoiles) ; chaque niveau a un décor `scene` (par défaut son id)
src/world       textures (canvas), kit (relief, ciel, arbres, rochers, herbes, voitures garées), common (squelette begin/finish, places),
                parts (maisons, murs, étals, caravanes, tas de bois, tracteur...), npc (voitures et piétons PNJ), landscape (paysage),
                garage (parking couvert), ville.js (rue), campagne.js, foret.js, montagne.js, scenes/<id>.js (un fichier par autre niveau)
src/ui          hud, menus (onglets par lieu)
src/audio       sons synthétisés (moteur discret, avertissement, choc, réussite)
src/main.js     boucle et enchaînement menu → niveau → résultats
test/           logic.mjs, browser-check.js
```

## À savoir

- La voiture est une « bicyclette » arcade qui pivote autour de l'essieu arrière, sans dérapage : fluide et prévisible. Vitesse maxi 40 km/h en avant, 15 km/h en arrière.
- Les dimensions de chaque voiture (empattement, essieu arrière, largeur) sont mesurées sur le modèle .glb au chargement.
- Pour ajouter un niveau : une entrée dans `LEVELS` (route, place, temps), et un fichier `src/world/scenes/<id>.js` qui exporte `build({ renderer, level })` et renvoie `ctx.finish({ cars, peds })` (voir `scenes/ville-3.js` : `begin`, `ctx.bays`, `parts`, `makeNpcs`). Lancer ensuite `check([id])` dans le navigateur.
- Les voitures PNJ suivent un chemin (`closed: true` pour une boucle, sinon elles réapparaissent au départ) ; les piétons font des allers-retours.

## Crédits des modèles 3D

Voitures : Generic passenger car pack par Comrade1280 (Sketchfab, CC-BY 4.0). Piétons : Proportional Low Poly Man par Robin Butler. Voir `assets/models/CREDITS.md`.

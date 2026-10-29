# Méthodes et règles des jeux (Yoann)

Notes tirées du travail du 28/10/2026. À relire avant de créer ou modifier un jeu du dossier `loisirs/`.

## 1. Moteur : Three.js

- Dernière version de Three.js partout (r186 au 28/10/2026, `three@0.186.1`). Pas de Vite, pas de `package.json`, pas de `node_modules`, pas d'étape de build (sauf bus-city-simulator, voir plus bas).
- Jeu en modules ES : `<script type="importmap">` avec `three` et `three/addons/` depuis jsdelivr, puis `<script type="module" src="src/main.js">`.
- Jeu en scripts classiques (ancien style r128 : moto-rider, sky-pilot, drift-king, drift-zone, fpv-racer, kukirin, rail-express, trottinette-freestyle) : une seule balise `<script type="module" src="../../assets/three-compat.js" data-scripts="js/a.js,js/b.js">`. Elle charge r186, expose `window.THREE`, puis charge les scripts dans l'ordre.
- `assets/three-compat.js` rattrape r128 : `sRGBEncoding`/`.encoding`, intensités de lumière du rendu physique (x pi ambiante/directe/hémisphère, x 4 pi ponctuelle/spot, decay 1), `PCFSoftShadowMap` -> `PCFShadowMap`.
- bus-city-simulator : Three.js local dans `lib/` (`three.module.js` + `three.core.js`) et `game.js` reconstruit avec `npx esbuild src/main.js --bundle --minify --format=iife --alias:three=./lib/three.module.js --outfile=game.js`. Penser à relancer après toute modification de `src/`.
- Les builds de `three` modernes n'ont plus de `.min.js` : utiliser `three.module.js`.

## 2. Pages de jeu

- Chaque page charge `assets/theme.css`, `assets/simulateur.css` et `assets/site.js` : c'est ce qui affiche le menu du site (accueil, projet précédent/suivant, recherche). Sans les deux CSS, le menu est invisible (cas de drift-zone).
- Chaque nouveau jeu : ajouter l'entrée dans `PROJECTS` de `assets/site.js` et dans `index.html`.
- Charte graphique : voir la mémoire `charte-graphique-sites`.

## 3. Touches communes (clavier AZERTY)

| Action | Touche |
|---|---|
| Avancer / reculer / gauche / droite | Z S Q D (et flèches) |
| Penchés, tonneaux, clignotants | A et E |
| Changer de vue (caméra) | **C** |
| Carte | **M** (la lettre M, pas la touche point-virgule) |
| Frein à main | Espace |
| Recommencer / replacer | R |
| Menu | Échap ou Tab |
| Phares / klaxon | L / H |
| Wheelie ou boost | Maj |

- Les jeux lisent `event.code` : sur AZERTY, `KeyW` = Z, `KeyA` = Q, `KeyQ` = A. C'est voulu pour ZQSD.
- La lettre M a le code `Semicolon` sur AZERTY (`KeyM` est la touche virgule). `assets/site.js` relaie donc la lettre M comme `KeyM` et ignore la virgule. Ne pas utiliser `Semicolon` dans un jeu.
- steep-peaks : vue sur C, abandon d'un défi sur V. bus-city-simulator : vue sur C (V marche encore).
- Toujours écrire les touches affichées dans l'aide du jeu (menu, README) avec les lettres AZERTY.

## 4. Véhicules : niveau de détail attendu

Références : `tesla-roadster/js/model.js` et `monde-ouvert/js/models/` (avions, moto, kukirin, trottinette).

- Carrosserie par sections lofted (superellipse) ou profil latéral extrudé, jamais des boîtes seules.
- Matériaux physiques : peinture `MeshPhysicalMaterial` avec `clearcoat`, vitrage sombre et brillant, chrome, caoutchouc.
- Pneus par `LatheGeometry`, jantes avec branches/rayons, écrous, disques et étriers, passages de roue.
- Feux émissifs, rétroviseurs sur bras, plaque, échappements.
- Un biseau d'`ExtrudeGeometry` agrandit la forme de `bevelSize` : rétrécir le profil d'autant (voir `ext()` dans `truckModel.js`).
- Vitrage transparent : `depthWrite: false`, opacité faible (0,3) si la caméra est derrière.

## 5. Intérieurs et caméras

- Chaque véhicule qui a une vue intérieure doit montrer un vrai habitacle : compteur, compte-tours, rapport, voyants, boutons qui s'allument avec les touches, volant qui tourne, siège, rétro.
- Instruments = `CanvasTexture` redessinée en direct (20 Hz), sur un plan avec `polygonOffset` pour éviter le z-fighting avec le cadre. Modèle : `monde-ouvert/js/models/cockpit.js` et le combiné du bus.
- La caméra intérieure est dans l'habitacle, jamais au-dessus du toit. Pas de montant ou de pare-soleil de plus de quelques centimètres devant les yeux.
- Les coques à face unique sont transparentes vues de l'intérieur : ajouter une coque intérieure `BackSide` avec `alphaTest` et fenêtres découpées (voir le bus).
- Vue première personne : cacher le pilote (sinon sa tête remplit l'écran) et montrer l'afficheur.
- Wheelie : la caméra suit la trottinette autour de l'axe de la roue arrière pour garder le compteur visible ; caméra de poursuite basse qui ne monte pas.
- Tester chaque caméra de chaque véhicule : captures, aucun objet qui bouche la vue.

## 6. Performances

- `assets/perf.js` (`patch(THREE)`) est branché sur tous les jeux 3D : plafond 60 FPS, et résolution adaptative (sous 40 FPS la résolution baisse de 10 % par palier, minimum 40 %, elle remonte quand la marge revient). Il intercepte `render` et `setPixelRatio`, que `WebGLRenderer` définit sur chaque instance.
- Les optimisations de détail se font après le niveau de détail demandé : Yoann veut d'abord les modèles les plus détaillés, les FPS ensuite.
- Fusionner les pièces fixes qui partagent un matériau (cf. `optimizeModel` de `monde-ouvert`) si un modèle dépasse environ 500 objets.

## 7. Test dans le navigateur

- Serveur : entrée `site` de `.claude/launch.json` (port 5180, racine `web/`).
- Le panneau navigateur de l'application doit être visible : caché, les pages tombent à 2 images/s et les captures expirent.
- Laisser 3 à 4 s avant une capture dans les gros jeux (monde-ouvert).
- Les `confirm()` sont bloqués : utiliser « Continuer » plutôt que « Nouvelle partie » quand une sauvegarde existe.
- Mesures de FPS depuis le navigateur de test : indicatives seulement.

## 8. Publication GitHub

- Jamais de publication sans demande de Yoann.
- Un projet à la fois : `python .claude/publier.py --projet loisirs/<jeu> --publier -m "message"`. Chaque appel pousse aussi le site principal.
- Les projets sans dépôt séparé n'existent que sur `yoannservices.github.io`.
- Aperçu sans pousser : `python .claude/publier.py --projet loisirs/<jeu>`.

## 9. Pièges rencontrés

- Fichiers en CRLF (tesla-roadster) : `str.includes` multi-lignes échoue, utiliser `sed` ligne par ligne.
- Bash : un script JS long en heredoc peut casser sur les apostrophes ; écrire le script dans un fichier puis le lancer avec `node`.
- Modules ES : le cache navigateur garde les anciens fichiers, incrémenter `?v=` quand le fichier est chargé en classique (tesla `model.js?v=16`).
- Éclairage r186 : sans les facteurs de `three-compat.js`, les jeux r128 paraissent sombres.

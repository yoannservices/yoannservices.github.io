# Rally Masters

Jeu de rallye 3D en **Three.js r186** (import map, aucun `node_modules`, aucun build). **Aucun asset externe** : modèles, textures, sons et voix sont générés par le code (primitives, `CanvasTexture`, Web Audio, Web Speech).

Lancer : servir le dossier `web/` (`npx http-server . -p 5180`) puis ouvrir `loisirs/rally-masters/index.html`.

## Contenu
- **4 voitures** (traction compacte, 4x4 turbo, propulsion classique, groupe B) avec modèle 3D, intérieur à compteurs et comportement propres.
- **Physique** faite main : adhérence par surface et par pneu, transfert de masse, sous/survirage, différentiels, frein à main, turbo, suspension simulée, sauts.
- **Spéciales par graine** : épingles, enchaînements, sauts, ponts, gués ; 4 terrains (forêt de terre, neige et glace, asphalte de montagne, gravier méditerranéen) ; 6 surfaces ; météo (soleil, pluie, brouillard, neige) ; jour, crépuscule, nuit avec phares.
- **Copilote** : notes annoncées en avance (« gauche 3 serré, 50, droite 5 »), voix Web Speech, anticipation et fréquence réglables, icônes dans le HUD.
- **Chrono** : départ, 3 points de passage, écart au meilleur temps, fantôme, pénalités de coupure.
- **Dégâts** : pare-chocs, direction, moteur, pneus crevés, bosses sur la carrosserie ; **assistance** de 30 min entre les spéciales ; pas de remise en piste gratuite (`T` = +45 s, `R` = +60 s en championnat).
- **Championnat** : 5 rallyes de 4 à 6 spéciales, pilotes IA par temps réalistes, argent, boutique (voitures et 4 améliorations), déblocages, sauvegarde `localStorage`.

## Touches (AZERTY)
`Z S Q D` / flèches, `Espace` frein à main, `C` vue (poursuite, capot, pare-chocs, cabine), `M` carte, `L` phares, `V` voix du copilote, `R` redémarrer (double appui), `T` remise en piste (double appui), `Échap` pause. Manette ou volant via l'API Gamepad.

## Arborescence
```
src/core     util, input, save, data
src/surfaces surfaces (adhérence), textures (canvas)
src/stage    spline (génération), track (maillage, tronçons à la volée), scenery, weather
src/car      physics, model
src/camera   views
src/fx       particles
src/rally    codriver, timing, service, championship
src/audio    audio
src/ui       hud, menus
src/main.js  boucle et enchaînement
```

## Crédits des modèles 3D

Véhicules réels sous licence CC-BY (Sketchfab) : auteurs et licences dans `assets/models/CREDITS.md`.

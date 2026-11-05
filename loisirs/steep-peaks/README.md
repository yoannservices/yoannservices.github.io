# Steep Peaks

Sports de montagne en monde ouvert : on dévale une grande chaîne enneigée (rayon d'environ 3 km, générée par code) en **snowboard**, en **ski** ou en **wingsuit**, on s'entraîne dans un snowpark et on enchaîne des défis chronométrés pour gagner des médailles, de l'XP et du matériel.

Seuls le skieur et le snowboardeur sont de vrais modèles .glb (crédits dans `assets/models/CREDITS.md`). Le terrain, la neige, la végétation, le ciel et les sons sont générés par code. Three.js par import map, sans build.

## Ce qu'on y fait

- **Trois disciplines**, changées à tout moment (touches 1/2/3 ou roue Tab) : snowboard, ski, wingsuit (vol plané avec angle d'attaque, portance, traînée, décrochage, virage à l'inclinaison). On peut sauter d'un tremplin et passer en wingsuit.
- **Monde ouvert** : relief en tuiles chargées autour du joueur, 6 sommets de départ, points d'intérêt (cabane du trappeur, lac gelé, belvédère, grotte de glace, refuge, cascade gelée...) et une carte (M) pour se téléporter.
- **Snowpark** : kickers, rails et boîtes pour les grinds, avec figures (grabs E/F/G, rotations, flips) et score de combo.
- **Défis** par discipline, médailles bronze/argent/or : descentes chrono (snowboard, slalom ski, vol de 1,8 km en wingsuit), descentes libres de 250 m, score en 60 s dans le park, saut géant, vol rasant et distance de vol en wingsuit.
- **Météo** (soleil, neige, brouillard, blizzard) et **cycle jour/nuit** : la visibilité et le risque d'avalanche en dépendent.
- **Avalanches** : déclenchées par une plaque à vent quand le risque monte (plus vite en blizzard) ou à la main (X) ; une coulée de neige suit la pente et te fait chuter si elle te rattrape.
- **Chutes** en ragdoll et relance (R).
- **Progression** : l'XP débloque par niveau des planches, skis, combinaisons de wingsuit (stats de vitesse, adhérence, pop, agilité, portance) et des tenues. Sauvegarde automatique dans `localStorage`.

## Touches (AZERTY)

| Touche | Action |
|---|---|
| Z S / Q D | Se pencher en avant (tuck) ou freiner, tourner (flèches aussi) |
| Espace | Maintenir puis relâcher : saut |
| E / F / G | Grabs en l'air |
| Maj | Dérapage |
| 1 / 2 / 3 | Snowboard / ski / wingsuit |
| Tab (maintenir) | Roue des disciplines, le temps ralentit |
| C | Changer de caméra |
| M | Carte |
| T | Prochain point de départ (téléportation) |
| B | Changer la météo |
| N | Avancer l'heure de 3 h |
| X | Déclencher une avalanche (il faut une pente) |
| V | Abandonner le défi en cours |
| R | Relancer après une chute |
| P / Échap | Pause |

Manette supportée (sticks, A saut, B/X/Y grabs, LB/RB changer de discipline).

## Lancer

Servir le dossier `web/` puis ouvrir `loisirs/steep-peaks/index.html` :

```
npx http-server . -p 5180 -c-1
```

## Arborescence

```
src/core        config, entrées (clavier, manette), sauvegarde
src/world       heightmap, terrain en tuiles, végétation, ciel, météo, avalanche, snowpark
src/player      joueur, ski, snowboard, wingsuit, personnage
src/gameplay    figures, défis, progression (XP, matériel)
src/camera      caméra de suivi
src/ui          HUD, carte, roue des disciplines
src/audio       sons synthétisés
src/main.js     boucle principale
```

## Crédits des modèles 3D

Skieur et snowboardeur : voir `assets/models/CREDITS.md` (CC-BY, Sketchfab).

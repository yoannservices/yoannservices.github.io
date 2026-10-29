# Rapport des projets loisirs (28/10/2026)

Méthode : `node --check` sur les 80+ fichiers JS (0 erreur de syntaxe) puis chargement de chaque jeu dans un navigateur via un serveur local, lecture de la console (0 erreur au chargement pour les 15 projets testés). Non testé : jouabilité en profondeur (clavier/manette), performances sur machine faible.

## Three.js : version et chargement

| Projet | Three.js | Chargement dans index.html |
|---|---|---|
| moto-rider, sky-pilot, drift-king, drift-zone, fpv-racer, kukirin, rail-express, trottinette-freestyle | r128 | `<script>` global cdnjs (ancien, 2021) |
| monde-ouvert, tesla-roadster | 0.165.0 | import map jsdelivr |
| sport-live | 0.160.0 | import map jsdelivr |
| steep-peaks, truck-france-simulator | 0.170.0 | import map jsdelivr |
| bus-city-simulator | 0.170 | fichier local `lib/three.module.min.js` |
| banc-essai-moteur | aucun (canvas 2D) | normal |
| quick-play, music-player, pokedex, tier-list, univers, operateur112 | aucun | normal |

Constat : 5 versions de Three.js différentes. Tous les projets 3D chargent bien Three.js dans leur `index.html`.

## Physique : constat

Chaque jeu a sa propre physique, écrite à la main (aucune bibliothèque partagée). C'est normal : moto, avion, train, camion, drone et trottinette n'ont pas le même modèle. Seul bus-city-simulator et truck-france-simulator ont des modules physiques séparés (`BusPhysics`, `TruckPhysics`). Les autres ont la physique dans un gros `main.js` (kukirin 2377 lignes, sky-pilot 1683, moto-rider 1310).

Ce qui peut être commun sans risque : version de Three.js, plafond du pas de temps (`dt`), `setPixelRatio`, redimensionnement, entrées clavier.

## Par projet

| Projet | État au chargement | Point d'attention |
|---|---|---|
| moto-rider | OK | r128 ; modèle de moto à améliorer |
| sky-pilot | OK | r128 ; avion à améliorer ; `main.js` 1683 lignes |
| drift-king | OK | r128 |
| drift-zone | OK | r128 ; mieux structuré (src/systems, src/render) |
| fpv-racer | OK | r128 ; `world.js` 1031 lignes |
| kukirin | OK | r128 ; `main.js` 2377 lignes, difficile à maintenir |
| rail-express | OK | r128 |
| trottinette-freestyle | OK | r128 |
| monde-ouvert | OK | 0.165 ; contient déjà des modèles de véhicules réutilisables (`models/`) |
| tesla-roadster | OK | 0.165 |
| sport-live | OK | 0.160 |
| steep-peaks | OK | 0.170 |
| truck-france-simulator | OK | 0.170 |
| bus-city-simulator | OK | 0.170 en local ; `game.js` 3837 lignes |
| banc-essai-moteur | OK | canvas 2D, pas de Three.js |
| quick-play, music-player, pokedex, tier-list, univers, operateur112 | non testés en détail | hors 3D |

## Proposition

1. Migrer les 8 jeux r128 vers un module Three.js 0.170 (risque : r128 -> 0.170 change l'éclairage physique, les couleurs (sRGB) et retire `Geometry`). À faire jeu par jeu avec vérification visuelle.
2. Améliorer les modèles de véhicules un par un, en commençant par moto-rider puis sky-pilot.

## Migration Three.js r186 (28/10/2026)

Tous les projets 3D tournent maintenant sur Three.js 0.186.1 (dernière version npm).

- 8 jeux r128 (moto-rider, sky-pilot, drift-king, drift-zone, fpv-racer, kukirin, rail-express, trottinette-freestyle) : `index.html` charge `assets/three-compat.js`, qui importe r186, expose `window.THREE` puis charge les scripts du jeu dans l'ordre (`data-scripts`). Le code des jeux n'a pas changé. Le module rattrape les différences r128 : encodages (`sRGBEncoding`, `.encoding`), intensités de lumière (rendu physique : x pi ambiante/directe/hémisphère, x 4 pi ponctuelle/spot, decay 1), `PCFSoftShadowMap` déprécié.
- monde-ouvert, tesla-roadster, sport-live, steep-peaks, truck-france-simulator : import map passée à 0.186.1. `PCFSoftShadowMap` -> `PCFShadowMap` dans truck-france-simulator et sport-live.
- bus-city-simulator : `lib/` contient r186 (`three.module.js` + `three.core.js`) et `game.js` a été reconstruit avec esbuild depuis `src/main.js`.

Vérifié : chargement et 0 erreur console sur tous ; rendu vu à l'écran pour moto-rider, sky-pilot, drift-king, drift-zone, fpv-racer, kukirin, monde-ouvert, tesla-roadster, steep-peaks, bus-city. Non vérifié visuellement (le navigateur de test ne rendait plus qu'à 2 images/s) : rail-express, trottinette-freestyle, camion en route, scène 3D de sport-live. La luminosité des jeux r128 peut demander un réglage fin.

## Véhicules, caméras, FPS (28/10/2026)

**Modèles de véhicules**
- drift-king : voiture refaite (carrosserie extrudée depuis un profil latéral, vitrage, toit, prise d'air, splitter, diffuseur, aileron, rétroviseurs, échappements, feux, jantes à 5 rayons avec disques de frein). Vue arrière et vue latérale vérifiées, 60 FPS.
- moto-rider, trottinette-freestyle, kukirin, rail-express (cabine), bus-city-simulator : déjà détaillés (loft, textures, pilote articulé, cabine avec instruments) ; pas modifiés.
- Pas encore revus un par un : sky-pilot (avions), drift-zone, fpv-racer, tesla-roadster, truck-france-simulator, monde-ouvert (modèles dans `js/models/`).

**Caméras**
- moto-rider : 3e personne, pilote, roue avant : OK. drift-king : poursuite + orbite à la souris : OK. bus-city-simulator : cabine et externe : OK. trottinette-freestyle, sky-pilot, kukirin, fpv-racer : vue par défaut OK. Les autres caméras de ces jeux restent à parcourir.

**FPS**
- `assets/perf.js` (chargé par les 14 jeux 3D) : plafond à 60 FPS (écran 120/144 Hz : une image sur deux) et résolution adaptative : sous 40 FPS la résolution baisse par paliers de 10 % (minimum 40 %), puis remonte doucement quand la marge revient. Test : charge CPU artificielle sur drift-king, la résolution baisse puis remonte.
- Mesuré dans le navigateur de test : 60 FPS sur moto-rider, drift-king, trottinette, rail-express, monde-ouvert, tesla-roadster, steep-peaks, bus-city. Ce navigateur est plus rapide que le PC d'un joueur moyen ; le gain réel dépend de la machine.

## Refonte des véhicules, 2e passe (28/10/2026)

Références de qualité : Tesla Roadster (`tesla-roadster/js/model.js` : carrosserie lofted par sections, matériaux physiques vernis, habitacle, jantes à branches, étriers) et les modèles de `monde-ouvert/js/models/` (avions, moto, kukirin, trottinette freestyle).

| Projet | Véhicule | Travail |
|---|---|---|
| truck-france-simulator | tracteur + 5 remorques | Refait : cabine extrudée (pare-brise incliné, vitrage, calandre chromée, phares, pare-chocs, rétros sur bras, marchepieds, échappements, réservoirs, châssis, ponts, sellette), 3 cabines, 5 remorques détaillées (bâchée à sangles, frigorifique avec groupe froid, citerne inox, plateau chargé, conteneur ISO ondulé), roues à écrous, garde-boue, bavettes. Caméra cabine déplacée dans la cabine (elle était au-dessus du toit), habitacle ajouté. ~500 objets par camion. |
| bus-city-simulator | bus | Habillage : arêtes de toit arrondies, jupes, liseré chromé, climatisation et trappes de toit, pneus tournés + jantes à écrous, passages de roue, pare-chocs, montants, afficheur de ligne, rétros sur bras, essuie-glaces, plaque. Corps toujours texturé en boîte. |
| drift-king | voiture | Refaite : coque extrudée, vitrage, toit, prise d'air, splitter, diffuseur, aileron, échappements, feux, jantes à 5 rayons + disques. |
| drift-zone | voiture (vue du dessus) | Refaite : coque effilée, habitacle vitré, capot bombé à prises d'air, bandes, ailes élargies, feux, aileron, jantes à rayons. Trop petite à l'écran pour vérifier le détail. |
| fpv-racer | drone 5" | Refait : plaques carbone + bras effilés, colonnettes, électronique, batterie sanglée, caméra inclinée, antenne, moteurs colorés, hélices à 3 pales, LED. Vérifié : le jeu tourne sans erreur ; le drone est trop petit en vue poursuite pour juger le détail. |

Déjà au niveau de référence, non modifiés : moto-rider, kukirin, trottinette-freestyle, rail-express (trains + cabine), tesla-roadster, monde-ouvert (modèles). À comparer avec la référence : sky-pilot (avions).

## Corrections demandées (28/10/2026)

- **drift-zone** : le menu du site (accueil, projets précédent/suivant, recherche) n'apparaissait pas : la page n'avait pas les feuilles `theme.css` et `simulateur.css`. Ajoutées ; la barre s'affiche.
- **F-35B (sky-pilot)** : la vitesse restait bloquée vers Mach 1 (la traînée transsonique dépassait la poussée : 5,8 + 4,4 m/s²). Poussée à sec 7 m/s², post-combustion +16 m/s², effet de compression 0,6, traînée d'onde réduite, plafond à 845 m/s (≈ 3000 km/h). Mesuré en jeu depuis 720 km/h en vol : 2616 km/h à 21 s, environ 3000 km/h vers 26 s.
- **kukirin** : caméra de poursuite abaissée et qui ne monte plus en wheelie ; en vue pilote, la tête suit la trottinette autour de la roue arrière (80 %), le compteur reste dans le champ à toutes les inclinaisons (vérifié de 0 à 1,2 rad).
- **Touches** : `assets/site.js` relaie la lettre M comme KeyM (sur AZERTY, M est la touche physique « Semicolon » ; KeyM est la virgule) pour tous les jeux. Bus : la vue passe de V à C (V marche encore). Les autres jeux lisaient déjà ZQSD, C, Espace par positions physiques. Non testé sur un vrai clavier AZERTY (l'outil de test envoie un clavier QWERTY).
- **Bus, intérieur** : coque intérieure à fenêtres et pare-brise transparents, planche de bord moulée, combiné 3D (cadran, vitesse, clignotants, phares, portes, rampe, frein, mis à jour en direct), console à 7 boutons dont les voyants s'allument avec O, R, L, H, A, E, volant 3 branches, colonne, manettes, siège conducteur, rétro intérieur, barres et plafonniers. Les piliers noirs qui bouchaient la vue sont retirés, le cadran 2D est masqué (le 3D le remplace).
- **Tesla, vue cockpit** : regard plus bas, écran central orienté vers le conducteur et affichant la vitesse en direct.
- **Camion, vue cabine** : caméra placée dans la cabine, habitacle ajouté.

À faire : intérieurs de monde-ouvert (11 véhicules) et du drone, vérification de toutes les caméras de ces jeux.

## monde-ouvert : intérieurs et caméras (28/10/2026)

Vérifié caméra par caméra (vues intérieures) : supercar, voiture de drift, Tesla (déjà faite), moto (casque), kukirin, hélicoptères Colibri et Atlas, F-35B, PV-40, drone FPV.

- Nouveau module `js/models/cockpit.js` : instruments en canvas redessinés en direct (voiture : compte-tours, compteur, rapport, écran de navigation, voyants ; hélicoptère : anémomètre, horizon artificiel, altimètre, variomètre, régime rotor et collectif ; avion : écran de vol avec horizon, vitesse, altitude, cap, Mach, G + écran tactique/navigation + affichage tête haute + manche et manette animés). `main.js` les met à jour seulement en vue intérieure.
- Bugs de caméra corrigés : PV-40 (la caméra cockpit était derrière la bande anti-reflets noire : écran noir), kukirin en première personne (la tête du pilote remplissait l'écran : pilote caché, compteur affiché).
- Limites : en voiture et en hélicoptère les instruments flottent au-dessus de la planche du modèle (les modèles d'origine n'ont pas de planche de bord) ; les vues Cabine/Place passager des hélicoptères n'ont pas d'aménagement (sièges) ; le dessus de la verrière du PV-40 reste noir.

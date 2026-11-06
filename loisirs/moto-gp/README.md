# Moto GP

Simulation de MotoGP dans le navigateur (Three.js r186 via `assets/three-compat.js`). Même structure qu'Apex GP, moto et pilote repris de `moto-rider`. Équipes et pilotes fictifs, 8 circuits inspirés de vrais circuits (Mugello, Assen, Phillip Island, Jerez, Le Mans, Sachsenring, Silverstone, COTA : tracés approchés, pas des relevés).

## Lancer

Ouvrir `index.html` via un serveur (`site` dans `.claude/launch.json`). Raccourci de test : `index.html#race,mugello` (modes `race|tt|practice|champ`, météo `rain|cloud|dynamic`, `night`, `rolling`, circuit `mugello|assen|phillip|jerez|lemans|sachsen|silverstone|cota`).

## Pilotage

Un seul mode : aides forcées, la moto ne peut pas tomber. L'inclinaison vient de l'accélération latérale (`lean = atan(a_lat / g)`), la chute arrive quand le pneu avant dépasse son pic d'adhérence trop longtemps. Le HUD affiche l'angle actuel, la silhouette de la moto, et les angles max à gauche et à droite (tour en cours, record de la session).

Touches : Z gaz, S frein, Q/D pencher, Espace frein arrière, E/F rapports, X stand, C caméra, V derrière, R replacer, Échap pause.

## Tests (Node, sans rendu)

`node test/tracks-check.js` · `node test/steady.js` (virage stabilisé par vitesse et niveau) · `node test/solo.js [circuit] [tours] [niveau]` · `node test/race-check.js [circuit] [tours] [niveau]`. Les tests chargent Three depuis `../apex-gp/vendor/three.min.js`.

## Freinage, virage et pilote

- Freinage très fort (`PH.brakeG` 4,2 et `BRAKE_GRIP` 1,7 : ~2,6 à 3 G en ligne droite, `node test/brake-straight.js`), la part d'adhérence réservée au freinage diminue quand on braque ; le braquage au freinage reste calé sur l'ancienne référence (`brakeLoad`). IA : même perf que le joueur (même `perf`, plus de `crashK`), allure plafonnée à la limite de la voiture (`driver.js`), freinage de référence `BOT.brake`/`BOT.bg` aligné. Freiner réduit le braquage utilisable (`A.steerGrip`, cercle de friction) : plein frein + plein braquage à 280 km/h ne tourne que doucement, et plus la moto ralentit plus le braquage revient. Le pneu avant perd de l'adhérence latérale en freinant et le lacet est plus amorti : plus de toupie au freinage (`node test/brake-turn.js`).
- IA : même règle de braquage, freinage de référence plus fort (`BOT.brake`), évitement des contacts (voir apex-gp), visée courte quand elle est sortie de la piste.
- Pilote : buste redressé et bassin reculé au freinage, couché sur le réservoir à l'accélération, bassin vers l'intérieur (hang-off), épaules et tête suivent le guidon, poses lissées (`carModel.js`).

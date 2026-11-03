# Moto GP

Simulation de MotoGP dans le navigateur (Three.js r186 via `assets/three-compat.js`). Même structure qu'Apex GP, moto et pilote repris de `moto-rider`. Équipes et pilotes fictifs, 8 circuits inspirés de vrais circuits (Mugello, Assen, Phillip Island, Jerez, Le Mans, Sachsenring, Silverstone, COTA : tracés approchés, pas des relevés).

## Lancer

Ouvrir `index.html` via un serveur (`site` dans `.claude/launch.json`). Raccourci de test : `index.html#race,mugello` (modes `race|tt|practice|champ`, météo `rain|cloud|dynamic`, `night`, `rolling`, circuit `mugello|assen|phillip|jerez|lemans|sachsen|silverstone|cota`).

## Pilotage

Un seul mode : aides forcées, la moto ne peut pas tomber. L'inclinaison vient de l'accélération latérale (`lean = atan(a_lat / g)`), la chute arrive quand le pneu avant dépasse son pic d'adhérence trop longtemps. Le HUD affiche l'angle actuel, la silhouette de la moto, et les angles max à gauche et à droite (tour en cours, record de la session).

Touches : Z gaz, S frein, Q/D pencher, Espace frein arrière, E/F rapports, X stand, C caméra, V derrière, R replacer, Échap pause.

## Tests (Node, sans rendu)

`node test/tracks-check.js` · `node test/steady.js` (virage stabilisé par vitesse et niveau) · `node test/solo.js [circuit] [tours] [niveau]` · `node test/race-check.js [circuit] [tours] [niveau]`. Les tests chargent Three depuis `../apex-gp/vendor/three.min.js`.

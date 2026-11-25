# Chambre 3D

Modélisation 3D de la chambre de Yoann dans le navigateur, faite à partir de photos et de mesures.

## But

- Pièce aux dimensions réelles (mesures au mètre).
- Chaque meuble ou objet est une pièce séparée et détaillée, aux dimensions exactes du modèle (recherchées sur internet quand la marque est connue).
- Déplacer un meuble : glisser au sol à la souris, le pivoter avec une touche.
- Empiler : un objet peut se poser sur le dessus d'un meuble (bureau, étagère...).
- Collisions : un meuble ne peut pas entrer dans un autre ni sortir de la pièce.
- Sauvegarde dans un fichier local `chambre.json` : bouton Enregistrer (réécrit le fichier sur Edge/Chrome, téléchargement ailleurs) et bouton Ouvrir.

## Stack

HTML, CSS, JavaScript, Three.js r186 par import map. Pas de build, comme le reste de `web/`.

## Lancement

Depuis `web/` : serveur `site` de `web/.claude/launch.json` (port 5180), puis http://localhost:5180/outils/chambre-3d/

## État

Dossier créé le 2026-11-25. En attente des photos et des mesures de la chambre. Pas encore inscrit dans `assets/site.js` ni `index.html`.

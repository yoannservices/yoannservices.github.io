# Sport Live

Suivi de sport en direct : scores, compos, stats, fil du match et simulation 3D des matchs de foot.

**▶ Démo en ligne : [https://yoannservices.github.io/loisirs/sport-live/](https://yoannservices.github.io/loisirs/sport-live/)**

## Fonctionnalités

- **Panneau de gauche** : 12 sports (foot, tennis, cyclisme, football américain, basket, F1/IndyCar/NASCAR, rugby, hockey, baseball, golf, MMA, football australien) et plus de 40 compétitions
- **Page sport** : compétitions avec les matchs en direct, à venir et terminés (filtres)
- **Page compétition** : calendrier mois par mois et classement
- **Page match** (sports d'équipe), actualisée toutes les 15 s pendant le direct :
  - score, buteurs, stade, affluence, arbitre
  - fil du match / temps forts, probabilité de victoire (NFL, NBA…), séries offensives NFL
  - compos (terrain 2D avec le système de jeu pour le foot), stats d'équipe, stats individuelles, classement
  - panneaux à afficher au choix (⚙️ Personnaliser) et alertes de score (notifications du navigateur)
- **Simulation 3D (foot)** :
  - *Direct reconstitué* : le ballon passe par les vraies coordonnées des actions ESPN (tirs, fautes, corners…), les joueurs sont placés selon la compo puis se déplacent en bloc. Caméras TV / dessus / but / suivi du ballon / libre, frise avec buts et cartons, vitesse ×1 à ×32
  - *Replays données réelles* : finales de Coupe du monde 2022 et Euro 2024… avec la position réelle des joueurs à chaque action (StatsBomb 360)
- **Tennis** : tournois, tableaux simple/double, score set par set et jeu décisif
- **F1** : séances et classements + carte du circuit animée avec la position réelle des monoplaces (OpenF1)
- **Golf** (leaderboard), **MMA** (carte des combats), **cyclisme** (calendrier, résumé Wikipédia, lien vers le direct officiel)
- **Mon suivi** : équipes et compétitions favorites (☆), et tous les directs du moment
- **Connexion Google** et interface **FR / EN**

## Lancer en local

Ouvrez simplement `index.html` dans le navigateur (connexion Internet nécessaire), ou servez le dossier :

```bash
python -m http.server 8765
```

puis http://localhost:8765/loisirs/sport-live/ (depuis le dossier `web/` de Mes Projets).

## Connexion Google

1. Sur [Google Cloud Console](https://console.cloud.google.com/apis/credentials), créer un **ID client OAuth 2.0** de type *Application Web*.
2. Dans *Origines JavaScript autorisées*, ajouter `http://localhost:8765` et `https://yoannservices.github.io`.
3. Coller l'ID dans `js/config.js` (`GOOGLE_CLIENT_ID`).

Sans ID, l'app marche en mode invité. La connexion Google ne fonctionne pas en ouvrant le fichier directement (`file://`) : il faut passer par le serveur local ou le site en ligne. Les favoris et préférences sont gardés dans le navigateur, séparément pour chaque compte (pas de synchronisation entre appareils, faute de serveur).

## Structure

- `index.html`, `style.css`
- `js/app.js` : routeur, panneau latéral, actualisation auto
- `js/sports.js` : catalogue des sports et compétitions
- `js/api.js` : accès aux API · `js/store.js` : compte Google, favoris · `js/i18n.js` : traductions
- `js/views/` : pages (accueil, sport, compétition, match, tennis, course, golf/MMA, cyclisme, replays)
- `js/pitch3d.js` : terrain 3D (Three.js) · `js/sim.js` : calcul des positions (direct ESPN et replays StatsBomb) · `js/viewer3d.js` : lecteur 3D

## À savoir

- Données gratuites et sans clé, mais **non officielles** : l'API ESPN n'est pas documentée et peut changer.
- Aucune API gratuite ne donne la position des 22 joueurs **en direct** (c'est un service payant). La 3D en direct reconstitue donc les joueurs ; seuls les replays StatsBomb ont le vrai tracking.
- OpenF1 ne donne les positions F1 gratuitement qu'après la séance (le temps réel est payant).
- Cyclisme : aucune API gratuite pour le direct ; les dates du calendrier sont indicatives.

## Technologies

HTML, CSS et JavaScript sans build (scripts classiques regroupés dans l'objet global `SL`, pour marcher aussi en ouvrant le fichier directement) ; [Three.js](https://threejs.org/) pour la 3D. Données : ESPN, [OpenF1](https://openf1.org/), [StatsBomb Open Data](https://github.com/statsbomb/open-data), Wikipédia.

---

Fait partie de [Mes Projets](https://yoannservices.github.io/) · [Portfolio](https://yoannservices.github.io/portfolio/) · par [@yoannservices](https://github.com/yoannservices)

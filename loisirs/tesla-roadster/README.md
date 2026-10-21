# Tesla Roadster — Simulateur 3D

Simulateur de Tesla Roadster (2e génération) en 3D dans le navigateur : ville procédurale, parc de cascades, trafic et cycle jour/nuit.

**▶ Démo en ligne : [https://yoannservices.github.io/tesla-roadster/](https://yoannservices.github.io/tesla-roadster/)**

## Fonctionnalités

- Modèle 3D procédural détaillé : carrosserie galbée, canopée vitrée, toit targa, jantes turbine, étriers, phares LED, intérieur, propulseurs SpaceX
- Conduite sur les murs et les plafonds à toute vitesse, même à l'arrêt (Espace pour s'en décoller)
- Boost et vol aux propulseurs (poussée dans l'axe du toit), avec un réservoir de liquide qui se recharge seul
- Contrôle en l'air : tangage, rotation, tonneaux ; les figures sont annoncées à l'atterrissage
- Score des figures : tout ce qui se passe en l'air rapporte des points (temps de vol, hauteur, rotations, tonneaux, saltos, vrilles), atterrissage parfait x2, crash = combo perdu, meilleure figure enregistrée
- Ville de 12 x 12 îlots, tour signal de 300 m, tunnel, half-pipe, loopings, tube à 360°, mur vertical et tremplins
- Trafic qu'on peut percuter, cycle jour/nuit avec fenêtres et lampadaires allumés la nuit
- Mode performance automatique sur GPU intégré et résolution dynamique

## Commandes (AZERTY ; WASD en QWERTY)

| Touche | Action |
|---|---|
| Z / S | Accélérer / freiner — en l'air : piquer / cabrer |
| Q / D | Tourner — en l'air : pivoter |
| A / E | En l'air : tonneau gauche / droite |
| Maj | Boost |
| Espace | Propulseurs (décollage dans l'axe du toit) |
| C | Caméra (poursuite, éloignée, cockpit) |
| R | Retour au départ |
| K | Couleur de peinture |
| L | Phares |
| T (maintenir) / N | Accélérer le temps / avancer de 6 h |
| G | Qualité graphique |
| M | Son |
| H | Aide |
| Échap | Pause |

## Lancer en local

Ouvrez `index.html` dans un navigateur récent (Three.js est chargé depuis un CDN, une connexion internet est nécessaire), ou servez le dossier :

```bash
python -m http.server 8000
```

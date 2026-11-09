# Chantier & Carrière

Simulateur de carrière en 3D (Three.js r186, modules ES, sans build). Tu diriges une carrière : tir de mine, creusage, transport, concassage, chargement des camions clients, commandes, carburant, usure.

## La chaîne de production

1. **Tir de mine** (cabine orange à l'ouest, **F**, 250 €) : la roche du front de taille tombe au pied du gradin (engins à plus de 35 m).
2. **Pelle** ou **chargeuse** : creusent l'éboulis (le godet se remplit en avançant ou en refermant). **Bouteur** : rassemble les tas.
3. **Tombereau** : recule jusqu'à la trémie, lève la benne, la roche tombe dans le concasseur.
4. **Concasseur** : trémie → mâchoires → convoyeur → tas de **gravier** (hauteur max 8 m).
5. **Chargeuse** : charge le gravier dans les **camions clients** (IA) qui viennent sur la route à l'ouest, un par commande.
6. **Pesée** automatique, paiement à la tonne + prime à la fin de la commande (réduite si en retard).
7. Le **camion benne** (pilotable) vend aussi directement : au pont-bascule, **F** (gravier 14 €/t, tout-venant 5 €/t).

Terrain déformable : grille de hauteurs, roche en place (ne s'éboule pas) + matériau meuble (s'éboule à 38°), part de gravier suivie pour chaque cellule. Le terrain et la carrière sont sauvegardés dans le navigateur.

## Engins (touches 1 à 5, ou F près d'un autre engin)

| Engin | Outils |
|---|---|
| 1 Chargeuse sur pneus | **A E** bras · **X V** godet |
| 2 Pelle hydraulique 30 t | **← →** pivoter · **↑ ↓** balancier · **A E** flèche · **X V** godet |
| 3 Tombereau rigide 45 t | **A E** benne |
| 4 Bouteur D8 | **A E** lame |
| 5 Camion benne 8x4 | **A E** benne |

## Commandes (AZERTY)

- **Z S Q D** / flèches : conduire (sur la pelle, les flèches commandent le bras)
- **Espace** : frein à main · **H** klaxon · **L** phares · **G** gyrophare
- **C** : vue (poursuite, éloignée, cabine avec compteurs) · clic + glisser / molette : caméra
- **R** : replacer l'engin · **M** : carte · **I** : aide de l'engin actif
- **F** : action selon le lieu (plein, réparation, pesée, tir de mine, changer d'engin)
- **Échap** ou **Tab** : menu (engins, graphismes, heure et météo, améliorations, carrière, conseils)
- **Manette Xbox** : RT/LT accélérer/freiner, stick gauche direction, stick droit outils, RB/LB godet, A frein à main, X action, Y vue, croix haut gyrophare, croix bas phares, croix ← → engin précédent/suivant, L3 klaxon, Back carte, Start pause. Pelle : B/A flèche, stick droit pivot et balancier.
- Tactile : boutons à l'écran.

## Économie

Argent, XP et 6 grades (Manœuvre → Directeur). Carburant (1,25 €/L à la station), usure (les chocs abîment ; atelier pour réparer), 5 améliorations (godets, moteurs, réservoirs, concasseur, pneus), commandes clients de 25 à 80 t.

## Réglages

Menu Graphismes : qualité Auto/Haut/Moyen/Bas, ombres, 30 FPS (communs aux jeux du site), résolution, reflets, phares de nuit, pluie, volume. Menu Heure et météo : dégagé / pluie / brouillard, heure, écoulement du temps.

## Arborescence

```
index.html  style.css
src/main.js            boucle de jeu, interactions (F), tir de mine, sauvegarde
src/core/terrain.js    terrain déformable (creuser, déposer, ébouler, tirer, sauvegarder), sans Three.js
src/machines/          Machine.js (physique), ops.js (godet, lame, benne), models.js + kit.js (modèles 3D procéduraux)
src/world/             TerrainMesh, Site (décor), Plant (concasseur), Customers (camions IA), Environment (ciel, météo)
src/economy/           Economy (argent, grades, boutique), Orders (commandes)
src/ui/                Hud, Menu · src/audio/audio.js · src/input.js · src/camera.js · src/settings.js
test/                  logic.mjs (logique), syntax.mjs (syntaxe des modules)
```

## Tester

```
node test/logic.mjs
node --experimental-vm-modules test/syntax.mjs
```

Puis `loisirs/chantier-carriere/index.html` via le serveur `site`. Les modèles sont procéduraux (aucun .glb libre de droits pour ce matériel). Non vérifié : conduite à la manette réelle, son, FPS sur un vrai GPU.

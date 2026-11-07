# Pompiers 18

Jeu de sapeur-pompier français, version 3 (en cours). Tu es chef d'agrès au centre de secours.
1. Quand l'alerte 18 tombe, tu montes dans le FPT et tu pars avec la sirène deux-tons.
2. Sur place, tu établis une lance depuis l'arrière du camion.
3. Tu entres dans la maison avec ton ARI et tu éteins le feu pièce par pièce.

Three.js r186 par import map, modules ES, sans build ni npm. Rendu : tonalité ACES, reflets d'environnement (RoomEnvironment), ciel en dégradé, textures de maisons dessinées au canvas (enduit, tuiles, parquet, carrelage), volets, braises et fumée sortant des fenêtres éclatées. La ville en grille, les feux tricolores, le trafic, le cycle jour/nuit et la base audio sont **copiés** de `bus-city-simulator` (copiés et non importés, pour que le dépôt du jeu reste autonome).

## Ce qu'on y fait

- **Choisir son engin.** À pied, une grande flèche verte rebondit au-dessus de l'engin que tu regardes (à moins de 4,5 m), avec son nom : F pour y monter. Pendant une alerte, une flèche orange signale l'engin conseillé : FPT pour un feu de maison, VSAV pour un secours à personne, EPA pour un feu d'immeuble.
- **Collisions des engins.** Chaque engin a une boîte calée sur son vrai modèle au chargement. Le joueur s'arrête contre la carrosserie, sans y entrer.

- **GPS.** Un tracé orange à chevrons au sol suit les routes sur la voie de droite (plus court chemin sur la grille, recalculé toutes les 0,5 s). Une vraie flèche en haut à gauche pointe vers le trajet 25 m devant et annonce le prochain virage (« ↱ À droite dans 120 m ») et la distance. Le tracé passe au bleu pour le transport aux urgences et le retour caserne.
- **Feu d'immeuble** (R+4 : rez-de-chaussée et 1er visitables, 3 étages d'appartements au-dessus).
  - Le feu part le plus souvent en étage, et des victimes attendent sur les balcons.
  - Leur santé baisse avec la fumée et la chaleur de l'appartement derrière elles.
  - Les flammes sortent par les vitres éclatées.
- **EPA (grande échelle)**, garé à gauche du FPT. Sur place, F à l'arrière de l'EPA : mise en station (stabilisateurs), puis commandes de l'échelle.
  - **Z / S** : lever, **Q / D** : tourner, **A / E** : rentrer / sortir (9 à 30 m). Sous l'horizontale, la nacelle descend jusqu'au sol.
  - **F** près d'une victime au balcon : elle monte dans la nacelle (2 au plus). Nacelle au sol : F, et elle est confiée au SAMU.
  - **Clic gauche** : lance canon de la nacelle (1 000 L/min, alimentée par le FPT à moins de 60 m). Elle casse la vitre la plus proche devant et arrose l'appartement.
  - **R** : repli automatique, obligatoire avant de reprendre la route.
  - La nacelle ne traverse pas les façades : tourne ou rentre l'échelle si elle bute.
- **Vue cabine** (C) : planche de bord avec vitesse, sirène et niveau d'eau, et un volant qui tourne.

- **Deux types d'alerte.**
  - **Feu d'habitation** : FPT, lance, ARI. Il y a parfois 1 ou 2 victimes dans la maison ; l'ambulance du SAMU arrive alors sur place.
  - **Secours à personne** : VSAV, bilan (maintenir F près de la victime), brancard (F), chargement à l'arrière du VSAV (F), puis transport jusqu'aux urgences de l'hôpital (H sur la carte).
- **Victimes.** Leur santé baisse dans la fumée et la chaleur. On les porte (F, sans la lance, plus lentement) et on les pose près de l'ambulance. Chaque victime sauvée rapporte une prime ; chaque décès coûte cher.
- **Binôme IA** (2 équipiers qui suivent le chef d'agrès) :
  - **1** : établir une 2e lance (400 L/min) depuis le FPT jusqu'à la porte de la pièce en feu la plus proche, puis passer à la suivante.
  - **2** : reconnaissance. L'équipier visite les pièces assez froides, sort les victimes trouvées et signale les pièces trop chaudes.
  - **3** : ventiler. Il ouvre la porte d'entrée et les fenêtres des pièces enfumées sans flammes ; l'air frais attise les pièces encore en feu.
  - **4** : regroupement.
  - Messages radio dans les notifications.

- **Caserne et alerte.** On attend près du FPT. L'alerte donne une adresse et un motif. Le feu démarre dès l'alerte, mais à mi-vitesse jusqu'à l'arrivée.
- **Conduite prioritaire.** G allume la sirène et les gyrophares. Les voitures à moins de 50 m se rangent à droite et s'arrêtent. Avec la sirène, on peut passer un feu rouge ou dépasser la limite sans amende. Il faut quand même ralentir aux carrefours, et les chocs comptent toujours.
- **Maison visitable.** C'est une maison R+1 avec 6 pièces par niveau, des portes qui s'ouvrent et se ferment, et un escalier. Le départ de feu est tiré au hasard, et certaines portes sont fermées au départ.
- **Feu réaliste simplifié** (`src/fire/FireSim.js`) :
  - Chaque pièce a sa température, son combustible, ses flammes et sa fumée.
  - La chaleur et la fumée passent par les portes ouvertes. Une porte fermée retient presque tout. L'escalier fait monter la chaleur.
  - Au-dessus de 280 °C, une pièce voisine s'embrase. Au-dessus de 450 °C, les vitres éclatent et la pièce se ventile.
  - Si on arrête d'arroser trop tôt, le feu peut reprendre.
- **Lance et eau** :
  - Clic gauche : arroser. Clic droit ou V : passer du jet droit (500 L/min, longue portée, attaque le foyer) au diffusé (250 L/min, courte portée, refroidit les gaz et protège le porteur).
  - La citerne du FPT fait 3 000 L. Le tuyau mesure 60 m au départ et se déroule derrière soi ; revenir sur ses pas l'enroule.
  - Si la citerne baisse, on branche le FPT sur un **poteau incendie** rouge (angles des carrefours) : 1 000 L/min.
- **ARI et chaleur.** L'air de la bouteille se vide dès qu'on est dans la maison : 8 min, avec un sifflet sous 25 %. Debout dans une pièce chaude, la santé baisse. Accroupi (X), on est sous la couche de fumée : on y voit mieux et on a moins chaud. À 0 % de santé, le binôme est évacué, avec une pénalité.
- **Bilan et carrière** :
  - Le bilan tient compte du délai d'arrivée, des dégâts, de l'eau utilisée et des infractions. Il donne une prime et de l'XP.
  - Grades : de Sapeur 2e classe à Adjudant.
  - Matériel à acheter : tuyaux plus longs, bouteille ARI 9 L, lance LDV 1000.
  - La carrière est sauvegardée dans `localStorage`.

## Graphismes

Menu (Échap) → onglet **Graphismes** :
- **Qualité** : Auto, Haut, Moyen ou Bas. C'est le réglage commun du site (`assets/quality.js` : distance d'affichage, brouillard, taille des ombres). Il fixe aussi toutes les options ci-dessous. Bas coupe les ombres.
- Les pièces fixes de chaque maison sont fusionnées par matériau (`Building.mergeStatic`) : environ 10 appels de dessin par maison au lieu d'une centaine.
- **Ombres** et **limite d'images** (60 / 30 FPS).
- **flammes, fumée, eau**, **lumières dynamiques**, **reflets**, **résolution max**, **circulation**, **textures des maisons**.
- Les textures s'appliquent au rechargement (bouton dans le menu). Le reste s'applique tout de suite.
- Sauvegarde : `pompiers18.gfx.v1` pour le jeu, `site.quality.v1` pour le réglage commun.

## Lancer

Les modules ES exigent un serveur HTTP. Depuis `web/` :

```bash
python -m http.server 8765
```

puis ouvrir http://localhost:8765/loisirs/pompiers-18/

Après une mise à jour du jeu, faire **Ctrl + Maj + R** une fois. Sinon, le navigateur peut garder d'anciens modules en cache, et le jeu reste bloqué sur l'écran de chargement sans erreur visible.

## Touches (AZERTY)

| Contexte | Touches |
|---|---|
| FPT | Z S Q D (ou flèches) conduire · Espace frein à main · **G sirène + gyrophares** · H klaxon · C vue (poursuite / éloignée) · R replacer · **F descendre** |
| À pied | Z S Q D marcher · souris (clic pour la capturer) ou ← → regarder · **F** interagir (lance à l'arrière du FPT, porte, victime, brancard, poteau incendie, monter dans le FPT ou le VSAV) · **F maintenu** bilan · clic gauche arroser · clic droit ou V jet / diffusé · X s'accroupir · Maj courir |
| Grande échelle | Z/S lever · Q/D tourner · A/E rentrer / sortir · clic gauche lance canon · F victime ou quitter · R replier |
| Binôme | **1** 2e lance · **2** reconnaissance · **3** ventiler · **4** regroupement (touches du haut ou pavé numérique) |
| Partout | M carte · Échap ou Tab menu · I aide |

Manette : RT accélérer ou arroser · LT freiner · stick gauche volant ou marche · stick droit regard · A frein à main · X interagir · B jet / diffusé · LB sirène · Y vue · clic du stick droit s'accroupir · Back carte · Start pause · croix ← → ↑ ↓ ordres 1 à 4.

## Arborescence

```
src/city         grille, ville, feux tricolores, collisions (copiés de bus-city), caserne, poteaux incendie
src/traffic      voitures IA (copiées de bus-city) + se ranger devant la sirène
src/truck        FPT, VSAV, EPA : physique (BusPhysics adapté), modèle .glb, gyrophares ; Ladder (grande échelle), Cockpit (vue cabine)
src/nav          Route (tracé au sol, flèche), path (itinéraire, logique pure)
src/settings.js  réglages graphiques (onglet Graphismes)
src/fire         FireSim (logique du feu), Building (maison visitable, chemins des équipiers), Effects (eau, braises, fumée, lumières), textures
src/firefighter  Player (vue subjective, ARI, tuyau), Crew (binôme IA), water (citerne, débits)
src/mission      alertes feu et secours à personne, Victims, pay (bilan chiffré)
src/economy      carrière et matériel, code de la route (fines.js = logique pure)
src/ui  src/audio  src/world  src/camera.js  src/input.js  src/main.js
test/logic.mjs   feu, eau, tuyau, sirène, bilan, itinéraire
test/syntax.mjs  syntaxe de tous les modules
```

## Tester

```bash
node test/logic.mjs
node --experimental-vm-modules test/syntax.mjs
```

`node --check` ne voit pas les erreurs de syntaxe des modules ES avec Node 24 : utiliser `test/syntax.mjs`. Debug dans la console : `window.game`.

## Modèles 3D (tous CC-BY, crédités dans assets/models/CREDITS.md)

- **FPT** et **EPA** : `npc/veh-fire_truck.glb` (l'échelle de l'EPA est construite en primitives) ; le pack marque la carrosserie « transparente » : `fixMaterials` (`src/truck/Truck.js`) la rend opaque, et double face pour la vue cabine ; **VSAV et ambulance du SAMU** : `npc/veh-ambulance.glb` (pack de Comrade1280). Les gyrophares sont calés au chargement sur l'avant et le toit réels de la cabine.
- **Équipiers** et **victimes** : `proportional_low_poly_man` (Robin Butler). Les équipiers sont habillés en pompiers au chargement : tenue bleu nuit, bandes jaunes, casque chromé, bouteille d'ARI. Ils n'ont pas d'animation : la marche est simulée par un balancement.

## Pas encore fait (versions suivantes)

- Équipiers dans les étages d'immeuble (ils ne vont pas au-dessus du 1er).
- Commande de l'échelle depuis la nacelle (elle se commande depuis la tourelle).
- Pas de piétons en ville (bus-city en a).

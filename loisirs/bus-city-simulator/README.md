# Bus City Simulator

Simulateur de conducteur de bus dans une ville en grille (10 x 10 carrefours) : on prend des passagers aux arrêts de lignes, on respecte le code de la route, on gagne de l'argent et de l'XP, et on agrandit sa flotte et son réseau.

Three.js seul (copie locale dans `lib/`, r186), aucun npm. La ville est générée par code ; bus, voitures du trafic et piétons sont de vrais modèles .glb.

## Ce qu'on y fait

- **Lignes de bus** : 5 lignes (Gare - Centre, Circulaire Centre, Périphérie Nord-Ouest, Zone commerciale, Grande ceinture). Chacune s'achète et se débloque par niveau. On s'arrête aux arrêts, on ouvre les portes (O), on embarque et débarque les passagers ; la rampe PMR (R) sert pour les personnes à mobilité réduite.
- **Flotte** : minibus, bus standard, bus électrique (batterie à gérer), double étage et bus articulé, chacun avec ses dimensions et son comportement.
- **Code de la route** : limites de vitesse par zone, feux tricolores, stops, piétons qui traversent. Excès de vitesse, feu rouge grillé, stop non marqué ou accrochage = **amendes**.
- **Événements aléatoires** en service : passager PMR, embouteillage, déviation (rues barrées), panne moteur.
- **Trafic et piétons** animés, foule aux arrêts, heure qui avance (jour et nuit).
- **Économie** : le billet rapporte de l'argent, le service de l'XP ; niveaux 1 à 5 ; achats de bus et de lignes ; sauvegarde `localStorage`.
- **Vues** : externe, cabine, passagers. Mini-carte et carte (M). Manette supportée.

## Lancer

Les modules ES exigent un serveur HTTP (le double-clic sur `index.html` ne marche pas) :

```
python -m http.server 5200
```

Puis http://localhost:5200

## Touches

Z S Q D (ou flèches) conduire · Espace frein à main · H klaxon · L phares · A / E clignotants · O portes · R rampe PMR · N sauter l'arrêt · C vue (externe / cabine / passagers) · M carte · Tab menu · I aide. Debug : `window.game` dans la console.

## Arborescence

```
src/bus         physique, stats, modèle, véhicule
src/city        grille, carrefours, feux, collisions
src/lines       lignes et service (arrêts, passagers)
src/traffic     voitures, piétons
src/passengers  foule aux arrêts
src/economy     argent, XP, achats ; code de la route et amendes
src/events      événements aléatoires
src/ui          HUD, menu, mini-carte
src/audio  src/camera.js  src/input.js  src/main.js
game.js         bundle esbuild de src/ (seule exception du site à la règle « sans build »)
```

## Crédits des modèles 3D

Véhicules réels sous licence CC-BY (Sketchfab) : auteurs et licences dans `assets/models/CREDITS.md`.

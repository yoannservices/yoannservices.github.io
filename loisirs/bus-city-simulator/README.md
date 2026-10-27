# Bus City Simulator

Three.js seul (copie locale dans `lib/`), aucun npm, aucun asset externe : tout est généré par code.

Les modules ES exigent un serveur HTTP (double-clic sur `index.html` ne marche pas) :

```
python -m http.server 5200
```

Puis http://localhost:5200

Touches : Z/S/Q/D (ou flèches), Espace frein à main, H klaxon, L phares, A/E clignotants, O portes, R rampe PMR,
N sauter l'arrêt, V vue (externe / cabine / passagers), M carte, Tab menu, I aide. Manette supportée.
Sauvegarde : localStorage. Debug : `window.game` dans la console.

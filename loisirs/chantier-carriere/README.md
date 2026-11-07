# Chantier & Carrière

Prototype jouable à graphismes réduits pour tester la boucle de base d'un simulateur de chantier.

## Boucle actuelle

- Conduire une chargeuse compacte jusqu'à un tas de gravier.
- Abaisser le godet avec **A**, puis utiliser **Espace** pour charger.
- Relever le godet avec **E**, conduire jusqu'à la trémie jaune et utiliser **Espace** pour livrer.
- Chaque livraison rapporte 40 € ; après trois livraisons, un convoyeur automatisé se débloque et produit des revenus régulièrement.
- La progression et l'argent sont conservés dans le navigateur.
- La chargeuse entre en collision avec les tas, la trémie, le convoyeur et les bordures ; le cap de la caisse est pris en compte.
- La touche **Échap** ou le bouton Pause commun ouvre le menu de pause.

## Commandes AZERTY

- **Z / S** : avancer / reculer
- **Q / D** : tourner
- **A / E** : abaisser / relever le godet
- **Espace** : charger du gravier ou le déverser dans la trémie
- **C** : changer de caméra
- **R** : replacer la chargeuse
- **Échap** : pause / reprise

Le prototype utilise des formes procédurales simples, sans modèle externe ni étape de build. Three.js r186 est chargé depuis jsDelivr.

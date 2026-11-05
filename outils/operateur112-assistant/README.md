# Operateur112 – Assistant d'envoi (v1.2)

Script Tampermonkey pour https://operateur112.fr.

## Toujours actif

- **Transports** : un véhicule qui attend un hôpital ou une cellule reçoit le 1er hôpital de la
  liste, ou la meilleure cellule libre (sans taxe d'abord, puis la plus proche).
  - Page mission : envoi immédiat pour les véhicules de cette mission, puis la page se recharge.
  - Carte : même chose pour tous les véhicules, 30 s après leur mise en attente.
- **Page mission** : le panneau « Assistant 112 » pré-coche les véhicules manquants (besoins de la
  mission, « Restant à envoyer », patients, transferts, VTU…). Un véhicule refusé pour manque
  d'effectifs est remplacé par un autre.

## Bouton « Envois auto » (carte, désactivé au départ)

Toutes les 5 s la carte regarde s'il y a une mission rouge à traiter (ou jaune avec un manquant).
Si oui, elle ouvre la mission. Chaque page mission :

1. coche les véhicules, puis clique sur « Déployer + mission suivante » ;
2. s'il n'y a rien à envoyer, clique sur la flèche « mission suivante » ;
3. à la fin (ou après 20 missions, ou si une mission revient), ferme la fenêtre.

30 s plus tard, la carte recommence. Laisse l'onglet de la carte ouvert.

## Attention aux CGU

Les envois automatiques sont de l'automatisation, interdite par les CGU (§3, §7).
Risque de sanction ou de suppression du compte.

## Installation

1. Installer l'extension Tampermonkey.
2. Nouveau script, coller `operateur112-assistant.user.js`, enregistrer.

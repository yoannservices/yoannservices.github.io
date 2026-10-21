# Assistant Operateur112

Script Tampermonkey pour https://operateur112.fr.

## Ce qu'il fait

**Sur une mission** (pré-cochage, c'est toi qui cliques sur **Déployer**) :
- Mission neuve : coche les véhicules les plus proches selon les besoins de la mission (`/einsaetze.json`).
- Liste « véhicules manquants » du jeu affichée : coche ce qui manque.
- Véhicules déjà engagés et rien de manquant : ne coche rien (pas de doublon).
- Patients : lit chaque carte (« Il nous faut : Ambulance », « Transport sanitaire, Équipe Médicale »…). 1 ambulance par patient, ou 1 AR si une équipe médicale est demandée. Les véhicules déjà en route sont déduits.
- Transferts : 1 véhicule par patient non traité. « Transfert interhospitalier (Spécialité) » → AR, sinon ASSU.
- Prisonniers : surligne la cellule la plus proche (tes postes avant ceux de l'alliance).

**Transports (automatique)** : quand une mission a une « Demande de transport envoyée », le script :
1. ouvre le véhicule,
2. clique sur le premier hôpital de la liste (ou la première cellule),
3. passe au véhicule suivant qui attend un transport, ou revient à la mission.

Pour désactiver cette partie : `const AUTO_TRANSPORT = false;` en haut du script (il se contente alors de surligner).

**Sur la carte** : bouton « Mission suivante » (ou touche **N**).

## Attention

Les CGU du jeu (§3 et §7) interdisent les scripts qui effectuent des actions automatiquement. Le transport automatique en est une : risque de suspension du compte. L'API du jeu expose un réglage `hospital_automatic` par véhicule. Regarde dans les paramètres de tes véhicules si le jeu propose l'attribution automatique d'hôpital : c'est l'option sans risque.

## Installation

1. Installer l'extension **Tampermonkey**.
2. Tableau de bord Tampermonkey → **Créer un nouveau script** (ou ouvrir l'ancien).
3. Tout effacer, coller le contenu de `operateur112-assistant.user.js`, **Fichier → Enregistrer**.
4. Recharger operateur112.fr.

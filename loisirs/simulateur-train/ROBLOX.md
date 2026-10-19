# Voie Libre — version Roblox

Portage Roblox du simulateur de train web. Le jeu se trouve dans le projet Roblox Studio (place « Place1 » à sauvegarder sous le nom « Voie Libre »).

## Structure dans Studio

- `ReplicatedStorage.Shared` : `Data` (73 gares, 10 engins, 12 types de wagons), `Consist`, `Route` (génération de ligne, distances ÷ 10), `Sim` (simulation complète), `Vehicles` (fabrique de modèles 3D + livrées)
- `ReplicatedStorage.Assets` : modèles de trains (Toolbox, normalisés à 3 studs = 1 m) et sons
- `StarterPlayerScripts.TrainClient` : `Main` (boucle, entrées), `World` (rendu 3D par tronçons), `Cab` (pupitre, HUD, check-list, modales), `Menu` (assistant 5 étapes, garage, aide), `UI`, `Audio`
- `ServerScriptService.TrainServer` : profils DataStore (argent, XP, niveaux, engins débloqués), récompenses, classement, tableau des départs
- `Workspace.Lobby` : hall de gare (verrière, quais, trains exposés, bornes « Prendre le service »)

## Multijoueur

- Tous les joueurs d'un même itinéraire (départ → arrivée) roulent sur la même ligne : le tracé ne dépend que de l'itinéraire (`Route.lineSeed`).
- `ServerScriptService.Lines` : position des trains joueurs (5 fois/s), trains de circulation simulés par le serveur, diffusion à tous les conducteurs de la ligne.
- La signalisation de chaque client tient compte de tous les trains. Franchir un signal fermé déclenche le FU ; le réarmement n'est possible qu'une fois le canton libéré.
- Pas d'accélération du temps : l'horloge du jeu suit l'heure réelle de Paris (calculée au démarrage du serveur).
- Départ avancé dès que le train est prêt (2 min max d'embarquement), arrêts en gare limités à 2 min.
- Priorité aux joueurs : un train de circulation ne quitte pas une gare tant qu'un joueur y est arrêté ou y arrive (sur une autre voie), 4 min max.
- Après un feu jaune, le contrôle de vitesse KVB est levé dès que le signal visé se rouvre.

## Mode admin

- Réservé à `DragonGameryt77` et `MrDrexx0` (liste `ADMINS` dans `TrainServer`) et au créateur du jeu : attribut `Admin` sur le joueur.
- Spectateur (liste `SPECTATORS`, uniquement `DragonGameryt77`) : bouton « 👁 Spectateur » sous la barre du hall, choix d'un conducteur en service, caméra extérieure (touche C pour changer de vue), bouton Quitter.
- Tous les engins débloqués, pas de limitation de vitesse, signaux / VACMA / KVB / sections de séparation / pénalités ignorés.
- Bouton « Boost » (touche B) : traction renforcée jusqu'à 500 km/h (`Sim.BOOST_VMAX`).

## À faire avant publication

- Fichier > Enregistrer / Publier sur Roblox
- Paramètres du jeu > Sécurité > activer « Accès Studio aux services API » pour tester les sauvegardes en Studio

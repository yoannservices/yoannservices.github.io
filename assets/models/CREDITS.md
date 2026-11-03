# Crédits des modèles 3D

Modèles téléchargés sur [Sketchfab](https://sketchfab.com), licence **Creative Commons Attribution 4.0 (CC-BY)** : l'auteur doit être crédité, l'usage commercial est permis. Les fichiers `.glb` sont repris tels quels, sauf `rally-*.glb`, extraits d'un pack.

| Fichier | Modèle | Auteur | Utilisé dans |
|---|---|---|---|
| `tesla-roadster.glb` | Tesla Roadster | Mona x Supercars | tesla-roadster, monde-ouvert |
| `rally-peugeot-205.glb`, `rally-subaru-impreza.glb`, `rally-ford-escort.glb`, `rally-lancia-s4.glb` | 1965-2002 Rally Cars (4 voitures du pack) | DisneyCars | rally-masters, monde-ouvert (Subaru) |
| `ducati-v4r.glb` | DucatiV4R | IrfanMuaz | moto-rider |
| `yamaha-r1.glb` | Yamaha R1 | ejsnowy | moto-rider, monde-ouvert |
| `town-bus.glb` | Generic Town Bus | own.guest | bus-city-simulator |
| `tier-scooter.glb` | Tier scooter | Niilo Poutanen | kukirin, monde-ouvert |
| `kick-scooter.glb` | Scooter | Deza | trottinette-freestyle |
| `enduro-dh.glb` | Enduro bicycle DH | Res1n | downhill-riders |
| `fpv-drone.glb` | FPV-dron_NonStop | Viktor_ | monde-ouvert |
| `f35.glb` | Lockheed Martin F35 Lightning II | andertan | sky-pilot, monde-ouvert |
| `v22-osprey.glb` | Bell Boeing V-22 Osprey Military Helicopter | Muhamad Mirza Arrafi | sky-pilot, monde-ouvert |
| `diesel-locomotive.glb` | 060 DA Diesel Locomotive | aocrisan | rail-express |
| `trailer (1).glb` | Variante remorque routière | À renseigner | non utilisée |
| `train_liquid_tanker_wagon_queensland_railway_wse.glb`, `train_liquid_tanker_wagon_queensland_railway_wse (1).glb` | Wagon-citerne ferroviaire | À renseigner | rail-express (fichier principal utilisé) |
| `queensland_railways_1900s_bl_heritage_carriage.glb` | Voiture voyageurs Queensland Railways | À renseigner | rail-express (voitures Corail/couchettes) |
| `queensland_railways_1200_class_diesel_locomotive.glb` | Locomotive diesel Queensland Railways 1200 class | À renseigner | rail-express (locomotives diesel) |
| `gros helico.glb`, `petit helico.glb` | Hélicoptères (modèles à confirmer) | À renseigner | non utilisés : pivots rotor/cockpit à adapter |
| `sydney_l1_inner_west_light_rail_tram.glb`, `sydney_metro_driverless_train__alstom_metropolis.glb` | Tramway et métro de Sydney | À renseigner | non utilisés : aucun véhicule correspondant dans le jeu |
| `npc/car-*.glb` (10 voitures), `npc/veh-*.glb` (taxi, police, fourgon postal, ambulance, bus, camions) | Generic passenger car pack / Generic civil service vehicles pack, découpés un véhicule par fichier, repère redressé, textures 512 px | Comrade1280 | bus-city-simulator, tesla-roadster (trafic) |
| `skier_low_poly_character.glb` | Skier low poly character | Sweed | steep-peaks (joueur à ski, découpé en articulations) |
| `low_poly_snowboarder.glb` | Low Poly Snowboarder | gamedevme | steep-peaks (joueur en snowboard, découpé en articulations) |
| `proportional_low_poly_man__free_download.glb` | Proportional Low Poly Man | Robin Butler | bus-city-simulator (piétons, voyageurs), rally-masters (spectateurs) |
| `fairheaven_lt_80_cop_cruiser_-_low_poly_model.glb`, `lct_3000_95_-_low_poly_model.glb` | Fairheaven LT '80 Cop Cruiser, LCT 3000 '95 | Daniel Zhabotinsky | non utilisés (roues nommées, prêts pour `rigWheels`) |
| `low_poly_car_-_chevrolet_c10_pickup_1963.glb` | Chevrolet C10 Pickup 1963 | tedpermana | non utilisé (un seul bloc, sans roues séparées) |
| `stylized_low_poly_animated_character.glb` | Stylized Low poly Animated Character | Karthik Naidu | non utilisé (personnage animé, aucun jeu de piétons animés) |
| `low-poly_psx_pilot_flying_a_plane_animated.glb` | Low-poly PSX Pilot flying a plane (animated) | Jungle Jim | non utilisé (blanc, sans texture) |
| `race_car_driver_-_low_poly.glb` | Race Car Driver - Low Poly | tomkart | non utilisé (debout, 21 pièces rigides) |
| `snowboader_with_gear.glb` | Snowboader with gear | gamedevme | non utilisé |
| `off_road_helmet.glb` | off road helmet | Pieter Ferreira | non utilisé (coque intérieure ouverte, sans visière) |
| `hero_unit001.glb` | Hero_Unit001 (robot) | Christian Rudorff | non utilisé (aucun jeu de robots) |

## Licence à vérifier

`ferrari.glb` : Ferrari 458 Italia par vicent091036, repris des exemples de three.js (drift-king, drift-zone, fpv-racer, monde-ouvert). La page Sketchfab d'origine est désactivée : la licence n'a pas pu être confirmée. À contrôler avant toute publication.

## Chargement

`assets/glb.js` charge et cadre les modèles (taille, centrage, sol). Les anciens modèles procéduraux, leurs intérieurs et caméras d'habitacle ont été supprimés ; les caméras sont posées sur des points du vrai modèle. Les GLB ajoutés (remorques, wagons, locomotives) remplacent les visuels correspondants au chargement, avec le modèle procédural conservé comme secours. Les hélicoptères, PNJ et pilotes restent procéduraux.

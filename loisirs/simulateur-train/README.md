# Simulateur Train

Simulateur de conduite ferroviaire 3D : composez votre train, choisissez un itinéraire entre de vraies gares françaises et conduisez avec signalisation BAL/TVM, KVB, VACMA et procédures de mise en service.

**▶ Démo en ligne : [https://yoannservices.github.io/simulateur-train/](https://yoannservices.github.io/simulateur-train/)**

## Fonctionnalités

- Assistant : engin moteur, composition, itinéraire (départ / arrivée)
- Ligne générée entre de vraies gares françaises
- Signalisation BAL / TVM, contrôle de vitesse KVB, VACMA, procédures de mise en service
- Pupitre de conduite, documents de bord (bulletin de composition, saisie KVB)
- Progression enregistrée (`localStorage`)

## Lancer en local

Aucune installation : ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
python -m http.server 8000
```

puis allez sur http://localhost:8000 (dans le dossier `web/` de Mes Projets : http://localhost:8000/loisirs/simulateur-train/).

## Structure

- `index.html`, `style.css`
- `js/main.js` : boucle principale
- `js/setup.js` : assistant de préparation
- `js/data.js` : gares, engins, wagons
- `js/track.js` : génération de la ligne
- `js/sim.js` : simulation
- `js/cab.js` : pupitre, HUD, modales
- `js/world.js`, `js/models.js` : décor et modèles 3D
- `js/audio.js` : sons
- `ROBLOX.md` : notes sur le portage Roblox (« Voie Libre »)

## Technologies

HTML, CSS et JavaScript ; rendu 3D avec [Three.js](https://threejs.org/) r128 (chargé depuis un CDN). Sans étape de build.

---

Fait partie de [Mes Projets](https://yoannservices.github.io/) · [Portfolio](https://yoannservices.github.io/Y.Portfolio/) · par [@yoannservices](https://github.com/yoannservices)

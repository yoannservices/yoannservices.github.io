# Simu Moto

Simulateur de moto 3D sur route de col, jouable dans le navigateur.

**▶ Démo en ligne : [https://yoannservices.github.io/moto-rider/](https://yoannservices.github.io/moto-rider/)**

## Fonctionnalités

- Choix de la moto, du décor (montagne ou route ouverte), de la lumière et des aides
- Plusieurs caméras : 3e personne, pilote, roue avant
- Puissances et poids proches des valeurs constructeur (arrondies)

## Commandes

| Touche | Action |
|---|---|
| Z / W / ↑ | Gaz |
| S / ↓ | Freins |
| Q / A / ← | Gauche |
| D / → | Droite |
| C | Caméra |
| Clic gauche + glisser | Tourner la caméra |
| R | Remettre sur la route |
| Échap | Menu |

## Lancer en local

Aucune installation : ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
python -m http.server 8000
```

puis allez sur http://localhost:8000 (dans le dossier `web/` de Mes Projets : http://localhost:8000/loisirs/moto-rider/).

## Structure

- `index.html`, `style.css`
- `js/main.js` : le simulateur

## À savoir

Le comportement est une simulation simplifiée, pas un modèle de course.

## Technologies

HTML, CSS et JavaScript ; rendu 3D avec [Three.js](https://threejs.org/) r128 (chargé depuis un CDN). Sans étape de build.

---

Fait partie de [Mes Projets](https://yoannservices.github.io/) · [Portfolio](https://yoannservices.github.io/portfolio/) · par [@yoannservices](https://github.com/yoannservices)

## Crédits des modèles 3D

Véhicules réels sous licence CC-BY (Sketchfab) : auteurs et licences dans `assets/models/CREDITS.md`.

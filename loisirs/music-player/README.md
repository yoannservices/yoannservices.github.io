# Music Player (Wave Player)

Lecteur audio local avec bibliothèque, playlists et égaliseur.

**▶ Démo en ligne : [https://yoannservices.github.io/loisirs/music-player/](https://yoannservices.github.io/loisirs/music-player/)**

## Fonctionnalités

- Import de fichiers audio (bouton ou glisser-déposer)
- Bibliothèque, playlist et favoris
- Égaliseur 5 bandes avec préréglages (Plat, Bass Boost, Rock, Jazz, Vocal)

## Lancer en local

Aucune installation : ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
python -m http.server 8000
```

puis allez sur http://localhost:8000 (dans le dossier `web/` de Mes Projets : http://localhost:8000/loisirs/music-player/).

## Structure

- `index.html` : la page
- `style.css` : les styles
- `script.js` : la logique

## À savoir

Les morceaux restent sur votre ordinateur : rien n'est envoyé sur Internet.

## Technologies

HTML, CSS et JavaScript (Web Audio API), sans framework.

---

Fait partie de [Mes Projets](https://yoannservices.github.io/) · [Portfolio](https://yoannservices.github.io/Y.Portfolio/) · par [@yoannservices](https://github.com/yoannservices)

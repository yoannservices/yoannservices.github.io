# Banc d'essai moteur

Banc d'essai moteur interactif : régime, boîte de vitesses, pédales et sons moteur.

**▶ Démo en ligne : [https://yoannservices.github.io/banc-essai-moteur/](https://yoannservices.github.io/banc-essai-moteur/)**

## Fonctionnalités

- Choix de la voiture (marque, modèle, année, moteur) avec l'enregistrement sonore du même moteur
- Boîte de vitesses réglable (vitesse maxi par rapport) et suralimentation modifiable
- Conduite aux trois pédales : compte-tours, son, couple, puissance, pression turbo, calage et rupteur
- Animation des pistons (admission, compression, combustion, échappement) et courbes de couple / puissance

## Commandes

| Touche | Action |
|---|---|
| Maj / Q / ← | Embrayage |
| S / Espace / ↓ | Frein |
| Z / W / ↑ | Accélérateur |

## Lancer en local

Aucune installation : ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
python -m http.server 8000
```

puis allez sur http://localhost:8000 (dans le dossier `web/` de Mes Projets : http://localhost:8000/loisirs/essaie-moteur/).

## Structure

- `index.html`, `style.css`
- `js/main.js` : simulation moteur et interface
- `js/sons.js` : gestion des sons

## À savoir

Cliquez une fois dans la page pour activer le son (règle des navigateurs).

## Technologies

HTML, CSS et JavaScript, sans framework ni étape de build.

---

Fait partie de [Mes Projets](https://yoannservices.github.io/) · [Portfolio](https://yoannservices.github.io/Y.Portfolio/) · par [@yoannservices](https://github.com/yoannservices)

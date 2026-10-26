# Révision Lycée

Fiches, quiz et flashcards de révision, de la 6e à la Première.

**▶ Démo en ligne : [https://yoannservices.github.io/education/revision/](https://yoannservices.github.io/education/revision/)**

## Fonctionnalités

- Niveaux 6e, 5e, 4e, 3e, Seconde et Première
- Par matière (maths, français, histoire, sciences, physique…) : fiches de cours, quiz et flashcards
- Fiches spéciales bac de français (ex. *Les Cahiers de Douai*)
- Les données sont enregistrées dans le navigateur (`localStorage`) : elles restent sur cet appareil.

## Lancer en local

Aucune installation : ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
python -m http.server 8000
```

puis allez sur http://localhost:8000 (dans le dossier `web/` de Mes Projets : http://localhost:8000/education/revision/).

## Structure

- `index.html`, `style.css`, `script.js` : l'application
- `data.js` : tout le contenu (objet `PROGRAMME` : niveaux → matières → fiches)
- `add_bac_francais.js` : script Node.js qui ajoute les fiches du bac de français dans `data.js` (`node education/revision/add_bac_francais.js` depuis le dossier `web/`)

## Technologies

HTML, CSS et JavaScript, sans framework ni étape de build.

---

Fait partie de [Mes Projets](https://yoannservices.github.io/) · [Portfolio](https://yoannservices.github.io/portfolio/) · par [@yoannservices](https://github.com/yoannservices)

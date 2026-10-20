# API Dashboard

Tableau de bord temps réel : météo, crypto, adresse IP, NASA et ISS.

**▶ Démo en ligne : [https://yoannservices.github.io/api-dashboard/](https://yoannservices.github.io/api-dashboard/)**

## Fonctionnalités

- Météo actuelle et prévisions 7 jours (Paris, Montpellier, Lyon, Marseille, Nantes, Bordeaux, Toulouse) et qualité de l'air
- Cours des cryptomonnaies et convertisseur de devises
- Image du jour de la NASA et position de la Station spatiale internationale (ISS) en direct
- Mon adresse IP, statistiques GitHub, citation du jour, « Le saviez-vous ? »
- Horloge, numéro de semaine, jour de l'année et horloges mondiales
- Bouton Actualiser

## Lancer en local

Aucune installation : ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
python -m http.server 8000
```

puis allez sur http://localhost:8000 (dans le dossier `web/` de Mes Projets : http://localhost:8000/developpement/api-dashboard/).

## Structure

- `index.html` : la page
- `style.css` : les styles
- `script.js` : la logique

## À savoir

Une connexion Internet est nécessaire : toutes les données viennent d'APIs publiques gratuites, qui peuvent limiter le nombre de requêtes.

## Technologies

HTML, CSS et JavaScript ; graphiques avec [Chart.js](https://www.chartjs.org/) 4 (CDN). APIs publiques : Open-Meteo, Frankfurter, NASA, Where the ISS at, ipapi, GitHub.

---

Fait partie de [Mes Projets](https://yoannservices.github.io/) · [Portfolio](https://yoannservices.github.io/Y.Portfolio/) · par [@yoannservices](https://github.com/yoannservices)

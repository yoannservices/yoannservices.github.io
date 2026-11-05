# Bienvenue dans NEXUS 👋

**NEXUS** est l'application de chat de notre projet de lycée. Tu discutes avec
l'IA Claude, tu gardes plusieurs conversations, tu peux joindre un fichier texte
(il est analysé avant d'être envoyé à l'IA).
Pour parler à NEXUS, il faut un compte (pseudo + mot de passe). L'interface
existe en français et en anglais.

C'est un projet de **vibe coding** : tu n'as pas besoin de tout savoir par cœur
pour avancer. Tu explores, tu testes, tu demandes de l'aide à une IA quand tu
bloques, tu casses des trucs, tu les répares. L'important c'est de comprendre
ce que chaque pièce fait, pas de mémoriser la syntaxe.

---

## 🧠 La structure, expliquée simplement

```
Dossier Etudiant/
├── backend/       ← le CERVEAU : reçoit des questions, réfléchit, répond
├── frontend/      ← le VISAGE : ce que les gens voient et cliquent
├── railway.toml          ← dit à Railway comment déployer ton projet
├── nixpacks.toml         ← prépare Python, Node et le site pour Railway
├── start.sh              ← lance backend + frontend en local
├── stop.sh               ← arrête les serveurs si un est resté allumé
├── .env.example           ← modèle pour tes futures clés secrètes
└── .gitignore              ← liste des fichiers à NE JAMAIS envoyer sur GitHub
```

### `backend/` — le cerveau

Un serveur qui tourne quelque part (sur ton PC, puis sur Railway) et qui
répond aux questions. Il est écrit en **Python** avec un framework qui
s'appelle **FastAPI**.

- `main.py` → le code du serveur : les routes (`/api/...`), la base des comptes
  (SQLite), l'appel à Claude et la consigne de NEXUS (`SYSTEM_PROMPT`).
- `requirements.txt` → la liste des librairies Python dont ton projet a
  besoin.

La liste complète des routes du backend (avec leurs codes d'erreur) est dans
`MODIFICATIONS.md`, section « État actuel ». Ce README ne la répète pas, pour
qu'elle ne se contredise pas avec le code.

Les routes `/api/chats` et `DELETE /api/auth/compte` demandent le jeton de
session dans l'en-tête `Authorization: Bearer <jeton>`. Le modèle IA est
`claude-sonnet-5-5` (défini dans `main.py`). Les comptes et les sessions sont
dans une base SQLite, avec les chats et les fichiers joints.

### `frontend/` — le visage

L'interface que les utilisateurs voient dans leur navigateur. Écrit en
**React + TypeScript**, avec **Tailwind** pour le style, et **Vite** pour
le faire tourner vite en développement.

- `src/App.tsx` → le composant principal : il assemble les morceaux
  ci-dessous.
- `src/main.tsx` → le point de départ, qui affiche `<App />` à l'écran.
- `src/index.css` → les styles généraux, et là où Tailwind est branché.
- `src/components/` → ce que tu vois : en-tête, liste des chats, messages,
  saisie, page de connexion, paramètres, aperçu HTML, écran d'accueil avec les
  portes. C'est là que tu changes l'apparence.
- `src/components/PanneauJeux.tsx` → le menu 🎮 « Jeux » (bouton dans l'en-tête) : la liste
  des jeux, qui s'ouvrent dans la fenêtre de NEXUS. Les jeux sont listés dans `src/features/jeux/`.
- `src/features/` → la logique : comptes (`auth/`), parler au backend
  (`chats/`), presse-papiers (`clipboard/`), portes et son (`doors/`), fenêtres
  et clavier (`focus/`), jeux (`jeux/`), Markdown (`markdown/`), taille du texte
  (`settings/`), thème (`theme/`).
- `src/styles/` → les styles des portes, du texte de NEXUS et de l'animation
  d'attente (`doors.css`, `markdown.css`, `reflexion.css`).

### Pourquoi séparer backend et frontend ?

Parce que ce sont deux métiers différents : le frontend s'occupe de
l'affichage, le backend s'occupe de la réflexion (et garde tes secrets,
comme des clés d'API, hors de vue des utilisateurs). Cette séparation,
tu la retrouveras dans presque tous les projets pros.

---

## 🚀 Lancer le projet en local

Installe Python et Node.js sur ton ordinateur. Sous Windows, ouvre un terminal
PowerShell dans le dossier du projet et exécute :

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\start-local.ps1
```

Le premier lancement installe automatiquement les dépendances. Le navigateur
ouvre le site quand il est prêt. Laisse le terminal ouvert pendant que tu
utilises NEXUS ; appuie sur **Ctrl+C** pour l'arrêter. Sur macOS ou Linux,
lance le script `./start.sh` dans un terminal.
Pour parler à Claude, ajoute ta clé `ANTHROPIC_API_KEY` dans le fichier `.env`
à la racine du projet.

---

## 🔑 Les secrets (clés d'API, mots de passe...)

Si ton projet a besoin d'une clé secrète (par exemple pour appeler une IA) :

1. Copie `.env.example` en `.env`, **à la racine du projet** (c'est le seul
   fichier lu au démarrage).
2. Remplis `ANTHROPIC_API_KEY` avec ta vraie clé dans `.env`. Sans clé, l'IA ne
   répond pas : le serveur renvoie une erreur 503.
3. **Ne touche jamais au `.gitignore`** — il empêche `.env` d'être envoyé
   sur GitHub. Une clé qui fuit sur GitHub peut être volée en quelques
   minutes, même si tu la supprimes juste après.

---

## 👤 Comptes et données

- Pour parler à NEXUS, il faut un compte : un **pseudo** (3 à 20 caractères :
  lettres, accents acceptés, chiffres, `_` ou `-`) et un **mot de passe** (8 à
  128 caractères).
- Le pseudo doit être un **surnom**, jamais ton vrai nom. Ne mets pas non plus
  de données personnelles dans les chats.
- Les mots de passe sont hachés : ils ne sont jamais enregistrés en clair.
- Après 5 mots de passe faux, le compte est bloqué pendant 5 minutes.
- Un compte peut être supprimé : il faut retaper son mot de passe, et ses chats
  et fichiers partent avec lui.
- Les comptes et les sessions sont dans une base **SQLite** (un simple fichier).
  En local, c'est `backend/nexus.db`, ignoré par Git. La variable optionnelle
  `DATABASE_PATH` (dans `.env`) permet de choisir un autre fichier.
- **Ce qui reste après un redémarrage** : les comptes, les sessions, les chats
  et les fichiers joints (tout est dans la base).
- Sur Railway, configure un volume persistant monté sur `/data` et la variable
  `DATABASE_PATH=/data/nexus.db` pour garder la base après les redéploiements.

---

## ☁️ Déployer sur Railway

Railway installe Python et Node, construit le frontend, puis lance le backend
FastAPI. Celui-ci sert le site et l'API depuis la même adresse. La configuration
est dans `railway.toml` et `nixpacks.toml`.

**C'est ton formateur qui met ton projet en ligne le J5** : il le relie à
ton dépôt GitHub et te donne son adresse publique, visible par tout le monde
(même sur un smartphone).

Toi, tu n'as qu'une chose à faire : envoyer ton travail sur GitHub.

```bash
git add -A && git commit -m "ce que j'ai fait" && git push
```

Une fois ton projet en ligne, chaque `git push` le met à jour
automatiquement.

---

## 🎯 Ta mission

1. Lance le projet en local et vérifie que tu vois bien l'écran d'accueil
   « NEXUS » dans ton navigateur.
2. Change le sous-titre « ASSISTANT IA » dans `frontend/src/i18n/fr/interface.ts`
   (clé `sousTitre`, bloc `portes`) et regarde la page se mettre à jour toute seule.
3. Ouvre `backend/main.py`, regarde `SYSTEM_PROMPT` (la consigne qui décrit
   NEXUS), modifie-la, puis envoie un message dans le chat pour voir la différence.
4. Quand tu es fier·ère de ton premier changement, demande à ton mentor
   comment faire ton premier `git commit`.

Bon code, et surtout — amuse-toi. 🎨

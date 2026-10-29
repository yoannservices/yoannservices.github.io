# 📘 Documentation du travail réalisé — NEXUS

**Date :** 22 octobre 2026

Ce document résume tout ce qui a été fait sur le projet NEXUS (application de chat
avec Claude, réalisée par les élèves). Le détail, modification par modification, est
dans [`MODIFICATIONS.md`](MODIFICATIONS.md). Pour l'architecture et les commandes,
voir [`CLAUDE.md`](CLAUDE.md) et [`README.md`](README.md).

---

## 1. Vue d'ensemble

NEXUS est une application en deux moitiés qui ne communiquent que par HTTP :

- **`backend/`** : FastAPI, un seul fichier `main.py`, base SQLite (`nexus.db`).
- **`frontend/`** : React + Vite + TypeScript + Tailwind.

Fonctions actuelles :

- **Comptes** : pseudo + mot de passe (haché), sessions de 30 jours, suppression de compte.
- **Chats** : plusieurs conversations par compte, renommage, suppression, export en Markdown.
- **Réponses de Claude** (`claude-sonnet-5-5`) en flux, avec choix de l'effort de réponse.
- **Fichiers joints** : texte seulement, analysés par Claude avant d'être gardés.
- **Interface** : français / anglais, thème clair / sombre, taille du texte, aperçu HTML isolé,
  liste des jeux (dont le simulateur Tesla Roadster).

---

## 2. Travaux par étape

### 2.1 Démarrage (20 octobre 2026)

- Chats multi-conversations (d'abord en mémoire), liste à gauche, indicateur de frappe,
  portes d'accueil, bouton de thème.
- Premières expériences (menu des domaines, suggestions, Pokémon, API externes) : retirées depuis.
- Ajouts visuels (`VISUAL_IMPROVEMENTS.md`, supprimé le 22 octobre : son contenu est dans `MODIFICATIONS.md`).
  Suppression des modes Matrix et compact.

### 2.2 Intégration de Claude et nettoyage (21 octobre 2026)

- Passage à `claude-haiku-5-5`. Le titre automatique est demandé par un appel séparé.
- Comptes par pseudo + mot de passe, sessions en base SQLite, chat rattaché à son compte.
- Suppression et renommage des chats ; liste repliable sur ordinateur et tablette, tiroir sur téléphone.
- Trois mises en page (moins de 640 px, 640 à 1023 px, 1024 px et plus), testées à 375, 768 et 1280 px.
- Taille du texte, thème, boutons « Copier » et « Copier le code », aperçu HTML.
- Code d'essai supprimé (endpoints, suggestions, Pokémon, modes visuels) : `App.tsx` passe de 803 à environ 190 lignes.
- `start.sh` refuse de démarrer si un port est déjà pris, attend le backend avant Vite, et arrête le backend à la sortie.

### 2.3 Menu des jeux et suppression (21–22 octobre 2026)

- Menu 🎮 avec la course-poursuite et la simulation Tesla Roadster.
- **Retiré le 22 octobre :** le menu 🎮, la course-poursuite (`features/conduite/`), l'ancienne simulation
  (`features/tesla/`, `features/games/`, `TeslaGame.tsx`, `GameOverlay.tsx`) et leurs traductions.
  La copie de sauvegarde `docs/archive/jeu-tesla/` a été supprimée à la demande de l'élève : ce code
  n'existe plus nulle part.
- **Réintroduit sous une autre forme le 22 octobre :** bouton 🎮 « Jeux » (`AppHeader.tsx`) ouvrant
  `PanneauJeux.tsx`, une liste lue dans `features/jeux/jeux.ts`. Un jeu s'ouvre en plein écran dans un `iframe`.
  Le Tesla Roadster est une copie statique du dépôt `yoannservices/tesla-roadster` dans
  `frontend/public/jeux/tesla-roadster/` (lien vers le site de l'auteur retiré). Le jeu n'utilise pas `localStorage`
  lui-même : il demande à NEXUS d'enregistrer sa meilleure figure (`roadster:bestTrick`), et `PanneauJeux.tsx` la
  range dans le navigateur.
- Production : `X-Frame-Options` passe à `SAMEORIGIN` pour que l'iframe fonctionne.
- Le jeu charge Three.js et les polices depuis Internet : il ne marche qu'avec une connexion.

### 2.4 Fichiers joints et flux de réponse (22 octobre 2026)

- **Réponses en flux :** `POST /api/chats/{chat_id}/messages` renvoie du NDJSON (`morceau`, puis une seule
  ligne `fin`, ou `erreur`). Rien n'est enregistré sans réponse complète. 73 tests backend passaient à ce stade.
- **Fichiers joints :** `POST /api/chats/{chat_id}/fichiers` et `DELETE /api/chats/{chat_id}/fichiers/{fichier_id}`.
  Texte seulement, 50 Ko maximum, 3 par chat. Refus si extension non listée, nom avec des caractères interdits
  (seuls lettres, chiffres, espaces et `. _ - ( )` sont permis), binaire ou texte non UTF-8.
- **Analyse :** Claude écrit « VERDICT : SÛR / À VÉRIFIER / DANGEREUX ». DANGEREUX ou verdict illisible
  = refus (« fail closed »). Le contenu est encadré par une balise tirée au hasard et présenté comme donnée,
  jamais comme instruction.
- **Limite connue :** l'analyse par IA est un filtre, pas une garantie. Aucun fichier n'est exécuté.
- **Effort de réponse :** champ `effort` (`low`, `medium`, `high`, défaut `medium`) transmis à
  `output_config.effort`. Menu « Rapide / Équilibré / Approfondi ». `xhigh` et `max` non proposés (ils exigent la réflexion).
- **Réponses non coupées :** `MAX_TOKENS` passe de 1024 à 128000 (maximum du modèle). Les titres et l'analyse des fichiers gardent leur propre limite.
- **Corrections :** le clic sur le chat déjà ouvert ne vide plus la saisie ; le défilement ne suit l'écriture que si l'élève est à moins de 100 px du bas ; Échap est ignorée dans les champs de saisie.

### 2.5 Confort, aspect et accessibilité (22 octobre 2026)

- **Liste des chats :** confirmation avant suppression, titre provisoire « Nouvelle conversation », date relative.
- **Saisie :** zone qui grandit jusqu'à 6 lignes, glisser-déposer de fichiers, bouton « Arrêter » pendant une réponse,
  bouton « Réessayer » après un échec.
- **Conversation :** bouton « ↓ » pour rejoindre le bas, export Markdown par chat, erreurs de liste affichées
  par un message temporaire (`components/Toast.tsx`).
- **En-tête et connexion :** bouton ☀️ / 🌙, œil pour afficher le mot de passe.
- **Sécurité, connexion :** le blocage (5 mots de passe faux → 5 minutes) vaut pour le couple pseudo + IP.
  Plafond par IP : 100 échecs en 15 minutes bloquent l'IP 5 minutes. L'adresse de l'élève est lue dans `X-Forwarded-For` par nginx (module `real_ip`, derrière le proxy Railway), puis transmise au backend dans `X-Real-IP`.
  Réponses 429 avec `Retry-After`.
- **Chats sauvegardés :** trois tables SQLite (`chats`, `messages`, `fichiers`), suppression en cascade.
  Les chats survivent au redémarrage.
- **Accessibilité :** annonce `aria-live` à la fin de chaque réponse, animations coupées avec
  `prefers-reduced-motion`, focus renvoyé après envoi et suppression, cibles tactiles de 44 px sur téléphone,
  contraste WCAG AA corrigé en thème clair.
- **Performance :** le Markdown est reconverti au plus toutes les 150 ms pendant le flux.
- **Langue FR / EN :** choix dans « Mon compte », envoyé au serveur (`Accept-Language`). Dictionnaires
  `src/i18n/fr/` et `src/i18n/en/`, typés pour avoir les mêmes clés.
- **Documentation :** `VISUAL_IMPROVEMENTS.md`, `CODE_REVIEW_NEXUS.md` et `docs/UNITY_GUIDE.md` supprimés
  (les deux premiers sont dans l'historique Git ou `MODIFICATIONS.md`).

### 2.6 Infrastructure et qualité du code (22 octobre 2026)

- `useChats` ne fait plus que rassembler `useChatList` et `useChatMessages` ; `ChatRow` dans son fichier ; hook commun
  `useEscapeKey` (remplace six copies) ; CSS de l'aperçu HTML dans `styles/htmlPreview.css`.
- uvicorn tourne sous un utilisateur non-root ; en-têtes de sécurité nginx ; port Docker publié sur `127.0.0.1` seulement.
- `stop.sh` ne tue que les serveurs en écoute. `start.sh` réinstalle `npm ci` si `package-lock.json` a changé.
- `requirements.txt` nettoyé (pydantic épinglé). `@types/node` ajouté en devDependency (seule nouvelle dépendance).
- `.dockerignore` exclut `**/*.db` : la base locale ne part jamais dans l'image.
- `.claude/worktrees/` est exclu de Git.

---

## 3. Routes du backend

| Méthode | Route | Rôle |
|---------|-------|------|
| GET | `/health` | Vérifie que le serveur répond (utilisé par Railway) |
| POST | `/api/auth/inscription` | Crée un compte, renvoie un jeton (201 ; 409 si le pseudo est pris) |
| POST | `/api/auth/connexion` | Connecte un compte (404 inconnu, 401 mot de passe faux, 429 bloqué) |
| POST | `/api/auth/deconnexion` | Supprime la session |
| DELETE | `/api/auth/compte` | Supprime le compte avec mot de passe (403 si faux, 429 après 5 échecs) |
| POST | `/api/chats` | Crée un chat vide |
| GET | `/api/chats` | Liste les chats du compte, avec leurs messages |
| GET | `/api/chats/{id}` | Renvoie un chat (404 si absent ou à un autre compte) |
| PATCH | `/api/chats/{id}` | Renomme un chat |
| DELETE | `/api/chats/{id}` | Supprime un chat et ses fichiers |
| POST | `/api/chats/{id}/messages` | Envoie un message, réponse en flux NDJSON |
| POST | `/api/chats/{id}/fichiers` | Joint un fichier après analyse (201 ; 422 refusé ; 409 limite ; 502 IA indisponible) |
| DELETE | `/api/chats/{id}/fichiers/{fid}` | Retire un fichier en attente |

Les routes `/api/chats` demandent `Authorization: Bearer <jeton>` (401 sinon).

---

## 4. Vérifications effectuées

| Étape | Vérification | Résultat |
|-------|--------------|----------|
| Flux de réponse | 73 tests backend (client Claude simulé, scripts hors dépôt) | Réussis à l'époque |
| Fichiers joints | 31 tests backend (base temporaire, IA simulée, scripts hors dépôt) | Réussis à l'époque |
| Sécurité de connexion | 6 tests (blocage pseudo + IP, plafond, `Retry-After`, persistance, cascade, isolation ; scripts hors dépôt) | Réussis à l'époque |
| Corrections de la journée | 132 tests backend au total (`/tmp/nexus-test/`, hors dépôt, non relancés depuis) | Réussis à l'époque |
| Frontend | `tsc -b` et `vite build` | Réussis à chaque étape |
| Navigateur | Parcours Chromium (Playwright, compte fictif) : 20 + 9 vérifications | Réussies |
| Lancement | `./start.sh` : `/health` 200, `/api` 401 sans jeton via le proxy | Réussi |

Les scripts de test sont hors du dépôt : le projet ne contient pas de suite de tests.

---

## 5. Points non testés ou à trancher

- **Vraie API Claude :** réponse en flux, titre automatique et analyse des fichiers n'ont jamais été testés avec une vraie clé.
  `anthropic` est passé à `2.1.0` (`backend/requirements.txt`) : le comportement avec `claude-sonnet-5-5` reste à tester avec une vraie clé.
- **Docker :** non disponible sur la machine ; l'image n'a pas été construite. Les images sont épinglées
  (`python:3.14.4-slim`, `node:22.23.4-alpine`) et devront être mises à jour à la main. Le volume `nexus-data`
  ajouté à `docker-compose.yml` n'a pas été testé.
- **Railway :** sans volume sur `/data`, les comptes sont effacés à chaque déploiement. La limite par IP
  peut bloquer tout le lycée si plusieurs élèves partagent une adresse : à valider en production.
- **Réponse arrêtée :** elle n'est pas enregistrée côté serveur ; elle disparaît au rechargement.
- **Aperçu HTML :** pas de CSP ; le HTML affiché peut envoyer des requêtes réseau. Il ne peut pas lire la session.
- **Accueil :** l'écran « Nouveau chat » ne s'affiche qu'en cas d'échec de création.
- **Messages d'erreur Pydantic :** encore en anglais.
- **Git :** les fichiers du frontend (`components/`, `features/`, `styles/`, `public/`, sons compris) sont suivis
  par Git ; les modifications en cours se voient avec `git status`. Les 11 entrées de `.claude/worktrees/` sont
  retirées de l'index, en attente de la validation du formateur.
- **Sons :** suivis par Git (`frontend/public/sounds/`) ; licence Mixkit à vérifier (https://mixkit.co/license/).

---

## 6. Règles suivies pendant le travail

- Après chaque changement, `MODIFICATIONS.md` est mis à jour (demande de l'élève).
- Aucune donnée personnelle réelle : les comptes de test sont fictifs, les secrets restent dans `.env` à la racine.
- Le code et les commentaires sont en français, pour le public élève.

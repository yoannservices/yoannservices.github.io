# 📋 Historique des modifications — NEXUS

**Date de dernière mise à jour :** 23 octobre 2026

Ce fichier décrit d'abord **l'état actuel** du projet, puis garde un historique court.
Quand tu modifies le projet, ajoute une section datée en haut de l'historique.

---

## 🧭 État actuel

### Backend (`backend/main.py`)

| Méthode | Route | Rôle |
|---------|-------|------|
| GET | `/health` | Vérifie que le serveur répond (utilisé par Railway) |
| POST | `/api/auth/inscription` | Crée un compte (pseudo + mot de passe), renvoie un jeton (201, ou 409 si le pseudo est pris) |
| POST | `/api/auth/connexion` | Connecte un compte, renvoie un jeton (404 si compte inconnu, 401 si mot de passe faux) |
| POST | `/api/auth/deconnexion` | Supprime la session liée au jeton |
| POST | `/api/chats` | Crée un chat vide pour le compte connecté |
| GET | `/api/chats` | Liste les chats du compte connecté, avec leurs messages |
| GET | `/api/chats/{chat_id}` | Renvoie un chat et ses messages (404 si absent ou à un autre compte) |
| PATCH | `/api/chats/{chat_id}` | Renomme un chat : `{"title": "..."}` |
| DELETE | `/api/chats/{chat_id}` | Supprime un chat (404 si absent ou à un autre compte) |
| POST | `/api/chats/{chat_id}/messages` | Envoie `{"message": "..."}` à Claude, renvoie la réponse en flux NDJSON (lignes `morceau`, puis une ligne `fin` avec la question, la réponse et le titre). Les fichiers en attente partent avec le message |
| POST | `/api/chats/{chat_id}/fichiers` | Joint un fichier `{"name": "...", "content": "..."}` : contrôles, analyse par Claude, garde le fichier si verdict SÛR ou À VÉRIFIER (201). 422 si refusé (avec l'analyse), 409 si 3 fichiers déjà en attente, 502 si l'IA est indisponible |
| DELETE | `/api/chats/{chat_id}/fichiers/{fichier_id}` | Retire un fichier en attente (404 s'il n'est pas ou plus en attente) |

Les routes `/api/chats` demandent le jeton dans l'en-tête `Authorization: Bearer <jeton>` (401 sinon).

- **Modèle IA :** `claude-sonnet-5-5` (`CLAUDE_MODEL`), 128000 tokens maximum (`MAX_TOKENS`, maximum du modèle : les réponses ne sont plus coupées à 1024 tokens). Le frontend n'envoie plus `effort` (sélecteur retiré, voir l'historique) : le backend utilise `EFFORT_PAR_DEFAUT` (`medium`), envoyé à l'API dans `output_config.effort`. La personnalité de NEXUS est dans `SYSTEM_PROMPT`.
- **Erreurs :** 503 si `ANTHROPIC_API_KEY` manque ; 502 avec message générique si Claude échoue. Rien n'est enregistré sans réponse.
- **Comptes :** pseudo de 3 à 20 caractères, mot de passe de 8 à 128. Mots de passe hachés (PBKDF2), jamais journalisés ni renvoyés. Comptes et sessions sont dans la base SQLite (`DATABASE_PATH`, par défaut `backend/nexus.db`, ignorée par Git).
- **Chats :** rattachés à leur compte, **sauvegardés dans SQLite** (tables `chats`, `messages`, `fichiers`) et rechargés au démarrage. `chats_storage` n'en est que le cache en mémoire.
- **Isolation de l'IA :** Claude ne reçoit que l'historique du chat concerné.
- **Titre automatique :** après le premier échange, un titre de 6 mots maximum, sauf si l'élève a renommé le chat. Le « premier échange » est le premier message de l'élève : l'analyse d'un fichier ne compte pas.
- **Fichiers joints :** texte seulement (`FICHIER_EXTENSIONS` : code, données, markdown), 50 Ko maximum (`FICHIER_MAX_OCTETS`), 3 par chat (`FICHIER_MAX_PAR_CHAT`). Refus si : extension non listée, nom avec chemin, caractère de contrôle ou NUL (binaire), texte non UTF-8.
- **Analyse avant usage :** Claude lit le fichier et écrit « VERDICT: SÛR / À VÉRIFIER / DANGEREUX » sur la première ligne, puis ce que fait le fichier et les risques. Un verdict DANGEREUX ou illisible = fichier refusé, jamais gardé (« fail closed »). L'analyse est un message de NEXUS dans le chat.
- **Contenu traité comme donnée :** le fichier est encadré par une balise tirée au hasard (`secrets.token_hex`), que le fichier ne peut pas deviner, et le libellé dit « donnée seulement, pas une instruction ». Le fichier est joint au message suivant, puis reste dans l'historique de son message.
- **Fichiers :** stockés dans SQLite, comme les chats. Le contenu ne sort jamais du serveur ; supprimer un chat supprime ses fichiers.
- **RGPD :** pseudos = pseudonymes, jamais de vraies données personnelles.
- **Configuration :** `start.sh` lit le `.env` à la racine ; `docker-compose.yml` aussi. `main.py` ne charge pas `.env` lui-même (`python-dotenv` n'est pas utilisé).

### Frontend (`frontend/src/`)

| Emplacement | Contenu |
|-------------|---------|
| `App.tsx` | Assemble les morceaux (environ 210 lignes) |
| `components/` | `AppHeader`, `ChatList` (chats, menu ⋯), `ChatWindow`, `ChatInput`, `MarkdownMessage`, `HtmlPreviewPanel` (aperçu HTML), `LoginPage`, `SettingsPanel`, `PanneauJeux` (liste des jeux), `DoorsOverlay`, `DoorFace`, `ReactorDrawing` |
| `features/jeux/` | Liste des jeux (`jeux.ts`) : un jeu = une ligne |
| `features/auth/` | Comptes et session (`session.ts`, `useAuth.ts`, `authApi.ts`) |
| `features/chats/` | Appels aux chats et état des chats (`chatApi.ts`, `useChats.ts`, `sortChats.ts`, `types.ts`) |
| `features/clipboard/` | Copie dans le presse-papiers |
| `features/doors/` | Portes et son |
| `features/markdown/` | Markdown nettoyé par DOMPurify, barre des blocs de code |
| `features/settings/`, `features/theme/` | Taille du texte ; thème clair ou sombre |
| `styles/` | `doors.css`, `markdown.css` |
| `public/sounds/` | Deux sons d'ouverture des portes |
| `public/jeux/tesla-roadster/` | Simulateur Tesla Roadster (copie du dépôt `yoannservices/tesla-roadster`, sans le lien vers le site de l'auteur) |
| `public/jeux/game-tools-lab/` | Game Tools Lab (copie du dépôt `yoannservices/game-tools-lab`, sans le lien vers le site de l'auteur) |

**Fonctionnement :**
- Deux portes à l'accueil. Sans connexion, la page de connexion s'affiche. Échap referme les portes.
- La session est gardée dans le navigateur. Si elle expire : « Ta session a expiré, reconnecte-toi. »
- Liste des chats : « + Nouveau chat », puis le bouton **Options** (icône ⋯) propose **Renommer** et **Supprimer**.
- Saisie : Entrée envoie, Ctrl+Entrée va à la ligne.
- « 📋 Copier » sous chaque réponse ; « Copier le code » sur chaque bloc de code.
- « ▶ Prévisualiser » ouvre un bloc HTML dans un cadre isolé (`sandbox="allow-scripts allow-forms"`, sans `allow-same-origin` : pas d'accès à la session).
- 👤 en haut à droite : paramètres (taille du texte, thème Sombre / Claire, déconnexion).
- Téléphone (moins de 640 px) : liste des chats en tiroir ☰. À partir de 640 px : colonne repliable avec ◀ / ▶.

### Ce qui a été retiré (ne le cherche plus dans le code)

- Modes visuels (Matrix, compact, gradient selon l'heure, cinéma), animations de messages, machine à écrire.
- Suggestions rapides, menu des domaines, bouton Pokémon, bouton « Nouvelle ».
- Réponses pré-écrites, et les endpoints `/api/chat`, `/api/example`, `/api/meteo`, `/api/crypto`, `/api/heure`, `/api/blague`, `/api/pokemon`.
- Jeu « Course-poursuite » (jeu de drift, `features/conduite/` et `ConduiteGame.tsx`) : supprimé le 22 octobre 2026.
- Ancien menu des jeux 🎮 et ancienne simulation Tesla Roadster (`features/tesla/`, `features/games/`, `GamesMenu.tsx`, `GameOverlay.tsx`, `TeslaGame.tsx`, `i18n/*/tesla.ts`) : supprimés le 22 octobre 2026. La copie de sauvegarde (`docs/archive/jeu-tesla/`) a aussi été supprimée à la demande de l'élève : ce code n'existe plus nulle part. **Réintroduits le 22 octobre 2026 sous une autre forme** (voir l'historique) : le nouveau jeu est un simple dossier statique dans `public/jeux/`, sans les anciens fichiers.

---

## 📅 Historique

### 23 octobre 2026 — Corrections issues de la revue complète du projet

Revue par sous-agents (backend, frontend, interface, infra), puis corrections des six points les plus importants :

- **Sécurité de l'affichage (`features/markdown/markdownToSafeHtml.ts`) :** DOMPurify retire désormais `style`, `form`, `input`, `textarea`, `select`, `img` et l'attribut `style`. Chaque lien ouvre un nouvel onglet (`target="_blank"`, `rel="noopener noreferrer"`). Conséquence visible : les images ne s'affichent plus dans les réponses de NEXUS. Non testé dans un navigateur (pas de `jsdom` dans le projet).
- **Verrou de connexion (`backend/main.py`) :** la tentative est comptée avant la vérification du mot de passe (`reserver_tentative`), sinon 30 requêtes simultanées passaient toutes. Un bon mot de passe rend la tentative (`annuler_tentative`, `effacer_echecs(..., lever_blocage=True)`). Testé sur un serveur temporaire : 30 connexions fausses en parallèle donnent 5 × 401 et 25 × 429 ; un bon mot de passe remet le compteur à zéro.
- **Échange enregistré en une fois (`backend/main.py`) :** le message de l'élève, la réponse de Claude et les fichiers joints sont écrits dans une seule transaction (`db_ajouter_echange`). Si l'écriture échoue (chat supprimé pendant le flux), l'élève reçoit une erreur propre, rien n'est écrit, et seul le type d'erreur est journalisé. Testé sur une base temporaire.
- **Déconnexion (`features/chats/useChatMessages.ts`) :** quand le jeton change (déconnexion ou session expirée), le flux en cours est annulé : le serveur arrête de générer. Non testé dans un navigateur.
- **Démarrage sans `.env` (`local.sh`) :** message clair et arrêt avant Docker. Testé sans `.env` (sans lancer Docker).
- **Ports personnels (`stop.sh`, `.env.example`) :** `stop.sh` lit `BACKEND_PORT` / `FRONTEND_PORT` dans `.env` comme `start.sh`, et `.env.example` documente les deux variables en commentaire.
- **Git :** `frontend/src/features/doors/playCloseSound.ts`, importé par `useDoors.ts`, est maintenant indexé (il manquait au dépôt).
- Vérifié : `tsc --noEmit` du frontend passe, `ast.parse` sur `backend/main.py`, `bash -n` sur les scripts, `./start.sh` lance le backend (`/health` 200) et le frontend (200, `/api` relayé), `./stop.sh` libère les ports.
- Fichiers : `backend/main.py`, `frontend/src/features/markdown/markdownToSafeHtml.ts`, `frontend/src/features/chats/useChatMessages.ts`, `local.sh`, `stop.sh`, `.env.example`, `MODIFICATIONS.md`.

### 23 octobre 2026 — Sélecteur d'effort supprimé

- Le menu « Effort de réponse » (Rapide, Équilibré, Approfondi) disparaît de la barre de saisie. Les textes i18n et le type `NiveauEffort` côté frontend sont supprimés.
- Le frontend n'envoie plus `effort` : le backend utilise son défaut, `medium` (`EFFORT_PAR_DEFAUT`). Le backend accepte encore le champ `effort` ; il n'a pas été retiré.
- Fichiers : `frontend/src/components/ChatInput.tsx`, `frontend/src/App.tsx`, `frontend/src/features/chats/` (`useChats.ts`, `useChatMessages.ts`, `chatApi.ts`, `types.ts`), `frontend/src/i18n/{fr,en}/interface.ts`, `MODIFICATIONS.md`.
- Vérifié : `tsc -b` et `npm run build` passent.

### 23 octobre 2026 — Passage à Sonnet 5.5

- Le modèle qui répond aux élèves passe de `claude-haiku-5-5` à `claude-sonnet-5-5` (`CLAUDE_MODEL` dans `backend/main.py`). Le titre automatique utilise le même modèle.
- Mise à jour des mentions du modèle dans `CLAUDE.md`, `README.md`, `documentation.md` et ce fichier.
- Correction : Sonnet 5.5 refuse `"thinking": {"type": "disabled"}` (erreur 400 : il faut `between_tools`). Haiku 5.5, lui, refuse `between_tools`. La valeur est donc choisie selon le modèle dans `REFLEXION_DESACTIVEE` (`backend/main.py`), utilisée par les trois appels à Claude. Opus 5.5 refuse aussi `disabled` (il attend `adaptive`) : il faudra une valeur de plus si on repasse sur Opus.
- NEXUS sait quel modèle il est : le prompt système de chaque réponse contient `Tu es le modèle {CLAUDE_MODEL}` (`backend/main.py`). Testé : Sonnet répond `claude-sonnet-5-5`.
- Fichiers : `backend/main.py`, `CLAUDE.md`, `README.md`, `documentation.md`, `MODIFICATIONS.md`.

### 23 octobre 2026 — Retour à Haiku 5.5

- Le modèle qui répond aux élèves repasse de `claude-opus-5-5` à `claude-haiku-5-5` (`CLAUDE_MODEL` dans `backend/main.py`). Le titre automatique utilise le même modèle.
- Mise à jour des mentions du modèle dans `CLAUDE.md`, `README.md`, `documentation.md` et ce fichier.
- Fichiers : `backend/main.py`, `CLAUDE.md`, `README.md`, `documentation.md`, `MODIFICATIONS.md`.

### 23 octobre 2026 — Passage à Opus 5.5

- Le modèle qui répond aux élèves passe de `claude-haiku-5-5` à `claude-opus-5-5` (`CLAUDE_MODEL` dans `backend/main.py`). Le titre automatique utilise le même modèle.
- Mise à jour des mentions du modèle dans `CLAUDE.md`, `README.md`, `documentation.md` et ce fichier. Un commentaire de `flux_reponse_nexus` ne cite plus Haiku.
- Fichiers : `backend/main.py`, `CLAUDE.md`, `README.md`, `documentation.md`, `MODIFICATIONS.md`.
- Vérifié : `py_compile` du backend passe ; `./start.sh` démarre (backend `/health` 200, frontend 200, `/api` via le proxy 401 sans connexion). L'appel réel à Opus 5.5 n'a pas été testé : `ANTHROPIC_API_KEY` est vide dans `.env` ici.

### 23 octobre 2026 — Compteur de tokens et blocs de code réduits

- Compteur « N tokens » au-dessus de chaque réponse de NEXUS : le serveur envoie `tokens` (sortie de Claude, `usage.output_tokens`) dans la ligne `fin` du flux. Le nombre n'est **pas enregistré en base** : il s'affiche pendant la session, mais disparaît après un rechargement de la page.
- Blocs de code de plus de 15 lignes réduits à 14 rem de haut, avec un bouton « Voir tout le code » / « Réduire le code » dans la barre (FR et EN).
- Fichiers : `backend/main.py` (`flux_reponse_nexus`), `frontend/src/features/chats/{chatApi,types}.ts`, `frontend/src/components/ChatWindow.tsx`, `frontend/src/features/markdown/{renderCodeBlock,useCodeBlockActions}.ts`, `frontend/src/styles/markdown.css`, `frontend/src/i18n/{fr,en}/features.ts`.
- Limite connue : si on déplie un long bloc pendant que la réponse s'écrit, il se replie au morceau suivant (le HTML est recréé à chaque morceau).
- Vérifié : `npm run build` passe, `py_compile` du backend passe, `./start.sh` démarre (frontend 200, `/health` 200, `/api` via le proxy 401 sans connexion). Le rendu et le compteur n'ont pas été vus dans un vrai navigateur, et l'appel réel à Claude n'a pas été testé (pas de clé API lancée ici).

### 23 octobre 2026 — Son de fermeture des portes

- Un son descendant (généré par le navigateur, sans fichier audio) se joue quand on quitte le chat : touche Échap ou bouton « Se déconnecter ».
- Fichiers : `frontend/src/features/doors/playCloseSound.ts` (nouveau), appelé depuis `closeDoors` dans `useDoors.ts`. Le son ne joue que si les portes sont ouvertes, donc pas d'écho si on est déjà à l'accueil.
- Vérifié : `npm run build` passe (TypeScript strict + Vite). Le son lui-même n'a pas été écouté dans un vrai navigateur.

### 23 octobre 2026 — Audit complet et corrections

Audit du projet par sous-agents, puis corrections en trois lots.

- **Backend (`main.py`) :**
  - Un fichier déjà envoyé n'est plus renvoyé en entier à Claude à chaque question : son contenu part avec le message auquel il était joint, puis seulement une mention « joint précédemment ». Conséquence : Claude ne relit plus le fichier aux questions suivantes.
  - La limite de 3 fichiers par chat est vérifiée et appliquée sous verrou, donc des envois en parallèle ne la dépassent plus.
  - Un compte bloqué n'est plus remis à zéro par des échecs concurrents.
  - Le plafond d'échecs par IP passe de 20 à 100 en 15 minutes, pour qu'un réseau de lycée ne soit pas bloqué entier.
  - Quotas anti-abus (voir « Points à surveiller »).
  - Tests : 13 scénarios dans un script hors dépôt, 13/13 réussis ; 8 échouent sur la version d'origine.
- **Frontend :**
  - Nom de fichier vérifié avant envoi, avec la même règle que le serveur (lettres accentuées acceptées), et message clair au lieu d'une erreur générique.
  - Message de plus de 2000 caractères refusé avant envoi, avec le texte gardé dans la saisie.
- **Jeux :**
  - Les iframes des jeux passent en sandbox sans `allow-same-origin` : le jeton de session n'est plus lisible depuis un jeu. L'historique et la meilleure figure passent par un pont `postMessage` avec NEXUS.
  - Game Tools Lab : une seule boucle FPS, micro arrêté au second clic et à la fermeture, test WPM et test de gigue sans minuteur qui reste actif.
- **Infra et documentation :**
  - `local.sh` rendu exécutable (`chmod +x`, à committer).
  - `docker-compose.yml` : volume nommé sur `/data`, la base survit aux recréations en local.
  - `documentation.md` et `README.md` corrigés (Python 3.14, dépendances, route de suppression de fichier, menu Jeux, arborescence).
- **À faire :** handle GitHub d'une personne encore présent dans `documentation.md` et dans cette section (règle RGPD du projet) ; message 429 à afficher proprement côté frontend ; test réel des jeux dans un navigateur ; `docker compose config` à lancer sur une machine avec Docker.

### 22 octobre 2026 — Défilement stable pendant les gros messages

- **Problème :** avec un long message (envoyé ou reçu), la page pouvait glisser et la barre de saisie se décalait avec elle. Cause : `scrollIntoView` faisait aussi défiler les conteneurs cachés de la page.
- **Correction (`frontend/src/App.tsx`) :** une seule fonction `descendreEnBas` règle le défilement du seul conteneur des messages (`scrollTo`). Le bouton ↓ l'utilise aussi. Pendant qu'une réponse s'écrit, le défilement est instantané au lieu d'animé.
- **Vérification :** `npm run build` (TypeScript strict + Vite) passe. **Pas testé dans un navigateur :** la bibliothèque graphique (`libatk`) manque sur la machine, donc le navigateur de test ne se lance pas. À vérifier à la main avec un long message.

### 22 octobre 2026 — Game Tools Lab dans la liste des jeux

- **Ajouté :** Game Tools Lab (suite d'outils gaming : tests souris, clavier, réflexes, calculateurs), copie du dépôt `yoannservices/game-tools-lab` dans `frontend/public/jeux/game-tools-lab/` (`index.html`, `style.css`, `script.js`, `assets/theme.css`). Une ligne ajoutée dans `JEUX` (`features/jeux/jeux.ts`).
- **Retiré de la copie :** `assets/site.js` (barre de navigation du site de l'auteur, avec la balise `<script>` retirée de `index.html`), `README.md`, `.nojekyll`, `.gitignore`.
- **Dépendance réseau :** les polices viennent de Google Fonts ; l'historique des résultats reste dans le navigateur (`localStorage`).
- **Vérification :** `npm run build` passe (TypeScript strict + Vite) ; le jeu est présent dans `dist/jeux/game-tools-lab/`.

### 22 octobre 2026 — Documentation de synthèse

- **Ajouté :** `documentation.md` à la racine, une synthèse de tout le travail (étapes, routes, vérifications, points restants). Ce fichier ne remplace pas `MODIFICATIONS.md`, qui reste le détail modification par modification.
- **Code :** aucun changement.

### 22 octobre 2026 — Confort, aspect et accessibilité (liste d'améliorations)

- **Liste des chats :** suppression avec confirmation dans le menu ⋯ (plus de boîte grise du navigateur) ; titre provisoire « Nouvelle conversation » ; message « Aucune conversation pour l'instant » ; sous-titre avec la date relative (« il y a 5 min »). Fichiers : `ChatRow.tsx`, `ChatList.tsx`.
- **Saisie :** zone de texte qui grandit jusqu'à 6 lignes ; glisser-déposer d'un fichier sur la barre, avec les mêmes règles que le bouton 📎. Fichier : `ChatInput.tsx`.
- **Conversation :** bouton « ↓ » quand on a remonté pour relire (`App.tsx`) ; bouton « Arrêter » pendant une réponse, qui annule la requête et garde le texte déjà reçu (`useChatMessages.ts`, `chatApi.ts`) ; bouton « Réessayer » après un échec d'envoi, qui renvoie le même texte (`useChatMessages.ts`, `ChatWindow.tsx`).
- **Écran d'accueil sans chat :** titre, explication et bouton « Nouveau chat ». Il ne s'affiche que si la création du chat échoue : supprimer le dernier chat en crée un nouveau aussitôt (comportement existant).
- **En-tête et connexion :** bouton ☀️ / 🌙 pour changer de thème (même réglage que « Mon compte ») ; bouton œil pour afficher ou masquer le mot de passe.
- **Aspect :** grille de fond rendue visible (opacité du calque 0,03 → 0,6, soit environ 0,03 effectif en sombre) ; horodatage des messages à 0,85 d'opacité, pour le contraste en thème clair ; message d'erreur de fichier en rouge plus foncé.
- **Documentation :** supprimés `VISUAL_IMPROVEMENTS.md`, `docs/archive/CODE_REVIEW_NEXUS.md` et `docs/archive/jeu-tesla/` ; la table des routes du README est remplacée par un renvoi vers cette page.
- **Vérification :** `tsc -b` et `vite build` passent. Parcours testé dans Chromium (Playwright, compte fictif) : 20 vérifications sur le parcours principal, 9 sur l'arrêt, le bouton « ↓ » et la mise en page téléphone, toutes réussies. Les scripts de test sont hors du dépôt (il n'y a pas de suite de tests dans le projet).
- **À trancher :** (a) une réponse arrêtée n'est pas enregistrée par le serveur : elle disparaît au rechargement et Claude ne s'en souvient pas ; (b) pendant une longue réponse, le défilement cesse de suivre le texte (le bouton « ↓ » permet de rattraper) ; (c) l'écran d'accueil ne s'affiche qu'en cas d'échec de création, voir ci-dessus.

### 23 octobre 2026 — Audit du projet et sécurité

- **Sécurité, adresse IP derrière Railway :** nginx lisait `$remote_addr`, qui est l'adresse du proxy Railway : tous les élèves partageaient un seul compteur (quotas d'inscription, blocage par IP). `nginx.conf.template` utilise maintenant le module `real_ip` : la dernière adresse de `X-Forwarded-For` (ajoutée par le proxy le plus proche, non falsifiable par le navigateur) remplace `$remote_addr`. Sans cet en-tête (lancement local), rien ne change. Pas de `real_ip_recursive`.
  - **À vérifier sur Railway :** (1) `nginx -V` de l'image contient `--with-http_realip_module` ; (2) l'IP reçue par le backend est bien celle du navigateur, et varie selon le réseau.
- **Sécurité, fichiers joints (`backend/main.py`) :**
  - La réponse « refusé » (422) ne renvoie plus le texte de l'analyse au navigateur (champ `analyse` supprimé). Conséquence : l'encadré d'analyse ne s'affiche plus pour les fichiers refusés.
  - Le verdict est lu de façon fail-closed : si le mot « VERDICT » apparaît plus d'une fois, le verdict est DANGEREUX ; si la première ligne n'est pas exactement `VERDICT: SÛR`, `VERDICT: À VÉRIFIER` ou `VERDICT: DANGEREUX`, le fichier est refusé. Conséquence : `VERDICT: sûr` en minuscules est désormais refusé.
  - Le corps de l'analyse n'est écrit dans le chat que si le fichier est accepté.
  - Vérification : 10 cas de lecture du verdict dans un script jetable hors dépôt, tous réussis. Pas encore testé de bout en bout avec une vraie clé Claude.
- **Documentation :** corrections dans `documentation.md`, `MODIFICATIONS.md`, `backend/CLAUDE.md` (environ 1 670 lignes), `frontend/CLAUDE.md` (liste des fichiers CSS). Le plafond par IP est 100 (et non 20), `anthropic` est en `2.1.0`. Les tests cités pour les journées précédentes étaient hors du dépôt et ne sont pas relancés.
- **Interface, barre de saisie (`components/ChatInput.tsx`) :** le bouton joindre (trombone), la zone de texte et le bouton envoyer sont centrés verticalement (`items-center` au lieu de `items-end`).
  Vérification : `tsc --noEmit` passe, `./start.sh` sert la nouvelle version.
- **Non fait :** le volume Railway (`/data`) se vérifie dans le tableau de bord Railway ; la suppression de la fonctionnalité d'effort (non commitée) n'a pas été modifiée, à confirmer.

### 22 octobre 2026 — Sécurité, chats sauvegardés, interface et accessibilité

- **Sécurité, connexion :** le blocage (5 mots de passe faux → 5 minutes) vaut maintenant pour le couple pseudo + adresse IP : un tiers ne peut plus bloquer le compte d'un élève depuis une autre adresse. Plafond par IP : 100 échecs en 15 minutes, tous comptes confondus, bloquent cette IP 5 minutes (valeur corrigée le 23 octobre ; ce paragraphe disait 20). Adresse IP lue dans `X-Real-IP` (posé par nginx, donc fiable), sinon adresse directe (développement). Fonction `adresse_client`, compteurs dans `essais_connexion`.
- **Sécurité, suppression de compte :** même limite (5 échecs → 429 pendant 5 minutes), compteurs séparés de la connexion.
- **Réponses 429 :** portent l'en-tête `Retry-After` (secondes restantes), lu par le frontend pour afficher « Réessaie dans N min ».
- **Chats sauvegardés :** trois tables dans SQLite (`chats`, `messages`, `fichiers`), créées par `init_database`. Chats et fichiers survivent au redémarrage. Suppression en cascade (chat ou compte). L'API ne change pas.
- **Erreurs de liste :** créer, renommer ou supprimer un chat affiche un message temporaire (`components/Toast.tsx`, `role="alert"`, 6 secondes).
- **Focus :** après un envoi, le curseur revient dans la saisie ; après une suppression, il va sur le chat suivant, sinon « Nouveau chat ».
- **Export :** « Exporter en Markdown » dans le menu ⋯ d'un chat (`features/chats/exportMarkdown.ts`). Tout se fait dans le navigateur ; une réponse encore en cours d'écriture est exclue.
- **Interface :** texte `text-sm` au minimum (plus de `text-xs`). Couleurs de fond en variables CSS sur `:root` (`index.css`), avec redéfinition pour le thème clair (`body.light-mode`). Cibles tactiles de 44 px sur téléphone. Contraste WCAG AA corrigé sur les boutons actifs et « Supprimer » en thème clair (mesuré sur 37 couples).
- **Accessibilité :** zone `aria-live="polite"` qui annonce « NEXUS a répondu. » une fois, à la fin de chaque réponse. Animations des portes coupées pour `prefers-reduced-motion`.
- **Performance :** pendant le flux, le Markdown est reconverti au plus toutes les 150 ms, et le texte final est toujours converti.
- **Vérification :** backend, 6 tests avec données fictives (base temporaire, client Claude simulé), hors du dépôt : blocage par pseudo + IP, plafond, suppression bloquée, `Retry-After`, persistance après redémarrage simulé, cascade, isolation. Frontend : `npm run build` passe. `./start.sh` : `/health` répond 200, le site 200, `/api/chats` renvoie 401 sans jeton via le proxy.
- **Restant :** pas encore testé dans un navigateur avec la vraie API Claude ; pas de test de rendu sur téléphone après le passage à `text-sm` ; limite IP à valider sur Railway ; messages Pydantic encore en anglais ; quota de messages et CSP non faits (non demandés).

### 22 octobre 2026 — Liste des jeux et Tesla Roadster (copie depuis GitHub)

- **Bouton 🎮 « Jeux » dans l'en-tête** (`AppHeader.tsx`, icône `IconeJeu`, visible sans connexion) : ouvre `PanneauJeux.tsx`, la liste des jeux. Un clic sur un jeu l'ouvre en plein écran dans un cadre (`iframe`) ; « Retour à la liste » et « Fermer » sont en haut. Échap ferme le panneau quand le focus est hors du jeu.
- **Liste des jeux :** `features/jeux/jeux.ts`. Pour ajouter un jeu : copier ses fichiers dans `frontend/public/jeux/<nom>/`, puis ajouter une ligne dans `JEUX`.
- **Tesla Roadster :** fichiers du dépôt `yoannservices/tesla-roadster` copiés tels quels dans `frontend/public/jeux/tesla-roadster/` (HTML, CSS, `js/`, `assets/theme.css`). Retirés de la copie : `assets/site.js` (barre de navigation du site de l'auteur : elle renvoyait vers `yoannservices.github.io` et écrivait dans le stockage du navigateur), `README.md`, `.nojekyll`, `.git`.
- **Production (`nginx.conf.template`) :** `X-Frame-Options` passe de `DENY` à `SAMEORIGIN`, sinon nginx bloquait l'iframe du jeu. Seul le même site peut afficher NEXUS dans un cadre.
- **Dépendance réseau :** le jeu charge Three.js et ses modules depuis `cdn.jsdelivr.net`, et les polices depuis Google Fonts. Il ne marche donc qu'avec internet.
- **Vérification :** `npm run build` passe (TypeScript strict + Vite) ; le jeu est présent dans `dist/jeux/tesla-roadster/`.

### 22 octobre 2026 — start.sh réinstalle les dépendances npm au bon moment

- **Avant :** `npm ci` ne se relançait que si `package.json` était plus récent que `node_modules`. Un changement seulement dans `package-lock.json` passait donc inaperçu.
- **Maintenant :** réinstallation si le marqueur `node_modules/.package-lock.json` manque, ou si `package.json` ou `package-lock.json` est plus récent (`start.sh`).
- **Vérification :** `./start.sh` lancé, `/health` répond, le frontend sert les derniers fichiers (`ChatInput.tsx`, `ChatRow.tsx`), `/api` passe par le proxy (401 sans jeton, comme attendu), puis `./stop.sh` libère les ports. Pas testé : une vraie conversation avec Claude (nécessite un compte et `ANTHROPIC_API_KEY`).

### 22 octobre 2026 — Alignements et finitions de l'interface

- **Alignements :** la barre de saisie aligne le trombone, la zone de texte et « Envoyer » sur le bas (`ChatInput.tsx`). Les tableaux des réponses défilent dans la bulle au lieu de déborder (`styles/markdown.css`). Le nom d'un fichier joint trop long se coupe avec « … ». Sur tablette, la liste réduite et le bouton « Options » n'affichent plus de libellé (icône seule), pour laisser de la place au nom du chat (`ChatList.tsx`, `ChatRow.tsx`).
- **Suppression :** une confirmation est demandée avant d'effacer un chat (`ChatRow.tsx`, textes `confirmerSuppression` en fr et en).
- **Accessibilité :** bouton d'envoi plus contrasté (dégradé bleu → cyan foncé), « Supprimer » lisible en thème clair, le chat ouvert est annoncé par `aria-current`.
- **Restes à faire (signalés par l'analyse, non corrigés) :** cibles tactiles sous 44 px sur plusieurs boutons ; texte `text-xs` trop petit au réglage « petit » ; animations des portes non coupées par `prefers-reduced-motion` ; erreurs des actions de liste (création, renommage, suppression) non affichées à l'élève ; focus perdu après envoi et après suppression ; état de chargement initial absent ; `aria-live` pour les réponses de NEXUS.
- **Vérification :** `tsc -b` et `npm run build` passent. Pas testé dans le navigateur.

### 22 octobre 2026 — Corrections de saisie, de défilement et d'Échap

- **Saisie :** cliquer sur le chat déjà ouvert ne vide plus le message en cours (`features/chats/useChats.ts`, `selectChat`).
- **Défilement :** pendant que la réponse s'écrit, la page ne descend que si l'élève est à moins de 100 px du bas. Il peut remonter pour relire. Changement de chat, nouveau message et erreur descendent toujours (`App.tsx`).
- **Échap :** ignorée quand le focus est dans un champ `input`, `textarea`, `select` ou `contenteditable` (`features/doors/useDoors.ts`).
- **Vérification :** `tsc -b` passe. Pas testé dans le navigateur.

### 22 octobre 2026 — Sélecteur d'effort

- **Backend :** `NewMessageRequest` accepte `effort` (`low`, `medium`, `high` ; défaut `medium` ; autre valeur = 422). Il est transmis à l'API dans `output_config.effort`, sans bêta. La réflexion reste désactivée. `xhigh` et `max` ne sont pas proposés, car ils exigent une réflexion activée.
- **Frontend :** menu déroulant « Effort de réponse » au-dessus de la saisie (« Rapide », « Équilibré », « Approfondi » ; « Fast », « Balanced », « Thorough » en anglais). Le choix est gardé en mémoire de la page, pas après un rechargement. Composant `ChatInput`, état dans `useChatMessages`, envoi dans `chatApi.ts`, textes dans `i18n/fr` et `i18n/en`.
- **Vérification :** `tsc -b` et `npm run build` passent côté frontend ; la syntaxe de `backend/main.py` est valide. Pas testé avec un vrai appel à l'API.

### 22 octobre 2026 — Réponses non coupées

- **Modifié :** `MAX_TOKENS` passe de 1024 à 128000 dans `backend/main.py` (maximum de sortie de `claude-haiku-5-5`, selon la documentation officielle d'Anthropic). L'API exige toujours une valeur : on ne peut pas la supprimer.
- **Effet :** la limite n'oblige pas Claude à écrire plus. Il ne va jusqu'au bout que si la réponse le demande. Les titres (`TITRE_MAX_TOKENS`) et l'analyse des fichiers (`FICHIER_ANALYSE_MAX_TOKENS`) ne changent pas.
- **Documentation :** `MODIFICATIONS.md` mis à jour (état actuel du backend).

### 22 octobre 2026 — Suppression des jeux

- **Retiré :** le bouton 🎮 et le menu des jeux dans l'en-tête, l'affichage plein écran (`GameOverlay`), la simulation Tesla Roadster (`features/tesla/`, `features/games/`, `TeslaGame.tsx`), les traductions `i18n/*/tesla.ts`, `IconeJeux`, les clés `entete.jeux`, `entete.listeJeux`, `jeu` et `features.jeux` (fr et en), et la prop `onSelectGame` d'`AppHeader`.
- **Sauvegarde :** les fichiers n'étaient pas suivis par Git. La copie `docs/archive/jeu-tesla/` a été supprimée le 22 octobre 2026 : ces jeux ne sont plus récupérables.
- **Documentation :** `CLAUDE.md` et `README.md` ne parlent plus des jeux.
- **Vérification :** `tsc -b` et `npm run build` (voir ci-dessous).

### 22 octobre 2026 — Corrections, améliorations et nouveautés (suite)

- **Langue FR / EN :** choix dans « Mon compte », gardé dans le navigateur et envoyé au serveur avec `Accept-Language`. Toute l'interface, les messages du backend et les réponses de l'IA suivent la langue (sauf si l'élève demande une autre langue). Dictionnaires `src/i18n/fr/` et `src/i18n/en/`, typés pour que les deux langues aient les mêmes clés.
- **Interface :** boutons avec icônes SVG et libellés (pas d'emoji). Sur téléphone, icône seule (le libellé reste lu par les lecteurs d'écran). Menu des jeux opaque, au-dessus du contenu.
- **Chat :** le message de l'élève s'affiche tout de suite. La réponse de NEXUS commence par une animation de réflexion, puis s'écrit morceau par morceau (curseur clignotant). Défilement qui suit l'écriture.
- **Sécurité et comptes :** routes bloquantes passées en `def` (le serveur ne se fige plus pendant une réponse). Messages limités à 2000 caractères. Réflexion désactivée sur la réponse principale (avertissement si la réponse est coupée). Sessions valables 30 jours, jetons stockés sous forme de hash SHA-256. Après 5 mots de passe faux, connexion bloquée 5 minutes (429). Suppression de compte (`DELETE /api/auth/compte`, mot de passe demandé, 403 si faux). Avertissement RGPD sur la page de connexion. **Migration :** les anciennes sessions sont supprimées une fois, donc une reconnexion unique.
- **Accessibilité :** portes d'accueil au clavier, champ de saisie nommé, focus piégé dans les fenêtres (jeu, aperçu HTML, « Mon compte », tiroir), animations désactivées avec `prefers-reduced-motion`.
- **Qualité du code :** `useChats` découpé en `useChatList` et `useChatMessages`, `ChatRow` dans son fichier, hook commun `useEscapeKey` (remplace six copies), CSS de l'aperçu HTML dans `styles/htmlPreview.css`, `tsconfig.node.json` pour `vite.config.ts`.
- **Infrastructure :** uvicorn tourne sous un utilisateur non-root (nginx reste root pour le port), en-têtes de sécurité nginx, port Docker publié sur `127.0.0.1` seulement, `stop.sh` ne tue que les serveurs en écoute, `requirements.txt` nettoyé (pydantic épinglé), `@types/node` ajouté en devDependency (seule nouvelle dépendance).
- **Documentation :** `CLAUDE.md` (racine, backend, frontend) et README mis à jour. `CODE_REVIEW_NEXUS.md` archivé dans `docs/archive/`. `docs/UNITY_GUIDE.md` supprimé (hors sujet, récupérable par Git).
- **Vérification :** `tsc -b` et `npm run build` passent. 132 tests du backend passent (`/tmp/nexus-test/test_fichiers.py`, hors dépôt, client Claude simulé).
- **Restant à faire :**
  - Rien n'est committé : le code du frontend n'est pas suivi par Git (décision à prendre avec l'élève).
  - Pas encore testé dans un navigateur avec la vraie API Claude (streaming, animation, suppression de compte, limite d'essais).
  - Docker absent sur cette machine : le conteneur n'a pas été construit. Les images sont épinglées (`python:3.12.15-slim`, `node:22.23.4-alpine`) et devront être mises à jour à la main.
  - `anthropic` reste en 0.29.0 : à tester avec une vraie clé avant de monter la version.
  - `DELETE /api/auth/compte` n'a pas de limite d'essais sur le mot de passe.
  - Sur téléphone, Échap avec le menu ⋯ ouvert ferme aussi le tiroir.
  - Les portes d'accueil ne donnent pas le focus au chat à l'ouverture ; dans l'aperçu HTML, Tab peut sortir de la fenêtre si on clique dans l'iframe.
  - Les erreurs de validation (Pydantic) restent en anglais.
  - Port 127.0.0.1 : l'application n'est plus accessible depuis les autres postes du réseau local.

### 22 octobre 2026 — Réponse de NEXUS en streaming

- **Backend (`backend/main.py`) :** `POST /api/chats/{chat_id}/messages` renvoie un flux NDJSON (`application/x-ndjson`, une ligne JSON par saut de ligne) : `morceau` (texte au fil de l'écriture), `fin` (une seule fois, après enregistrement : `message`, `reply`, `title`), `erreur` (détail traduit, rien enregistré). Fonctions `flux_reponse_nexus` et `ligne_ndjson`. Les erreurs avant le flux (404, 503) restent des erreurs HTTP. En-têtes `Cache-Control: no-cache` et `X-Accel-Buffering: no`.
- **Vérification :** 73 tests du backend passent (17 nouveaux pour le flux : ordre des morceaux, `fin`, échec en plein flux, réponse vide, en-têtes).

### 22 octobre 2026 — Joindre et analyser des fichiers

- **Backend (`backend/main.py`) :** deux routes (`POST` et `DELETE /api/chats/{chat_id}/fichiers`), constantes de la section « Fichiers joints », fonctions `verifier_fichier`, `lire_verdict` et `contenu_avec_fichiers`. Le premier échange (titre automatique) est désormais le premier message de l'élève, et non plus le premier message du chat.
- **Frontend :** bouton 📎 dans la saisie, puces des fichiers en attente avec verdict et ✕, erreur d'ajout avec l'analyse en cas de refus, ligne « 📎 nom » sur les messages envoyés. Règles dans `features/chats/fichierConfig.ts`, identiques à celles du serveur.
- **Vérification :** 31 tests du backend passent (base temporaire, client Claude simulé, aucun appel réel) : formats, taille, binaire, nom avec chemin, verdicts, panne de l'IA, limite de 3 fichiers, envoi et historique, isolation entre comptes, suppression en cascade. `tsc -b` et `vite build` passent. **Pas encore testé dans un navigateur avec la vraie API Claude** : à faire avec `./start.sh`.
- **Limite connue :** l'analyse par IA est un filtre, pas une garantie. Aucun fichier n'est jamais exécuté, mais un fichier SÛR n'est pas forcément parfait.

### 22 octobre 2026 — Suppression du jeu de drift

- **Course-poursuite supprimé :** dossier `frontend/src/features/conduite/`, composant `ConduiteGame.tsx`, entrée `conduite` dans `gamesCatalog.ts` (le menu 🎮 ne propose plus que la Simulation Tesla Roadster), et rendu dans `GameOverlay.tsx`.
- **Commentaires :** deux commentaires de `features/tesla/` qui renvoyaient au jeu de conduite ont été réécrits.
- **Vérification :** `tsc -b` passe sans erreur.

### 21 octobre 2026 — Menu des jeux

- **Menu 🎮 :** nouveau bouton dans l'en-tête, qui liste les jeux du catalogue (`features/games/gamesCatalog.ts`). Ajouter un jeu = un identifiant dans `GameId`, une ligne dans `GAMES` et un rendu dans `GameOverlay.tsx`.
- **Course-poursuite :** ville infinie générée à la demande (blocs, quatre zones : centre-ville, résidentiel, zone industrielle, parc), dérapage réaliste (frein à main, dérapage à l'accélérateur), score de dérapage, traces de pneus et fumée, police qui grandit et accélère avec le temps.
- **Simulation Tesla Roadster :** plaine quadrillée infinie, tremplins fixes, saut (flèche du haut), boost avec jauge (Maj), tableau de bord (vitesse, jauge, « En l'air »).
- **Choix à valider :** pas de partie sur téléphone (commandes au clavier seulement) ; pas de sauvegarde du meilleur score.
- **Vérification :** `npm run build` passe (TypeScript strict + Vite). Pas encore testé dans un navigateur : à faire avec `./start.sh`.

### 21 octobre 2026

- **IA :** passage à `claude-haiku-5-5`. Le titre est demandé par un appel séparé, réflexion désactivée.
- **Comptes :** inscription, connexion et déconnexion par pseudo + mot de passe. Sessions en base SQLite. Chaque chat est rattaché à son compte.
- **Chats :** suppression (`DELETE`), renommage (`PATCH`, menu ⋯), liste repliable sur ordinateur et tablette, tiroir sur téléphone.
- **Affichage :** trois mises en page (moins de 640 px, 640 à 1023 px, 1024 px et plus), testées à 375, 768 et 1280 px.
- **Paramètres et copie :** taille du texte, thème dans les paramètres, boutons « Copier » et « Copier le code », aperçu HTML.
- **Nettoyage :** code d'essai supprimé (endpoints, suggestions, Pokémon, modes visuels). `App.tsx` passe de 803 à environ 190 lignes.
- **Configuration :** `.gitignore` et `.dockerignore` excluent `.claude/worktrees/`. `.env.example` contient `ANTHROPIC_API_KEY`.
- **Lancement (`start.sh`) :** refuse de démarrer si le port du backend ou du frontend est déjà occupé (message + `./stop.sh`), pour ne pas voir répondre une ancienne version. Attend que le backend écoute avant de lancer Vite, et arrête le backend à la sortie, même si le frontend échoue. Vérifié : `./start.sh` démarre les 10 routes et les 29 modules frontend, et `/api` passe bien par le proxy Vite.

### 20 octobre 2026

- Chats multi-conversations (en mémoire), liste à gauche, indicateur « NEXUS est en train d'écrire », portes d'accueil, bouton de thème.
- Premières expériences (menu des domaines, suggestions, Pokémon, API externes) : retirées depuis.
- Ajouts visuels (fichier `VISUAL_IMPROVEMENTS.md`, supprimé le 22 octobre 2026 : son contenu est ici). Suppression des modes Matrix et compact.

---

## ⚠️ Points à surveiller

- **Railway :** sans volume persistant, la base (comptes et sessions) est effacée à chaque redéploiement. `DATABASE_PATH` permet de pointer vers un volume.
- **Chats :** sauvegardés en base depuis le 22 octobre 2026.
- **Quotas :** inscription 30 par heure et par IP, messages 60 par heure et fichiers 20 par heure et par compte. Compteurs en mémoire : remis à zéro au redémarrage. Au-delà, l'API renvoie 429.
- **Jeux :** les jeux tournent en sandbox sans `allow-same-origin`. Leur stockage (historique, meilleure figure) passe par un pont `postMessage` avec NEXUS. Non testé dans un vrai navigateur (Chromium absent de la machine).
- **Limite par IP :** derrière un proxy partagé (Railway, réseau du lycée), plusieurs élèves peuvent avoir la même adresse. Le plafond par IP bloquerait alors tout le monde. À vérifier en production.
- **Image Docker :** `.dockerignore` exclut désormais `**/*.db`, pour que la base locale (comptes) ne parte jamais dans l'image de `./local.sh` ou de Railway.
- **Aperçu HTML :** il ne peut pas lire la session, mais le HTML affiché peut encore envoyer des requêtes réseau (pas de CSP).
- **IA non testée avec une vraie clé :** réponse de Claude et titre automatique à vérifier. Maj+Entrée valide un renommage, comme Entrée.
- **Commit à faire :** `frontend/src/components/`, `features/`, `styles/`, `frontend/public/` et la plupart des fichiers modifiés ne sont pas encore commités. Un commit ou un clone propre de `main` ne contient donc pas l'application décrite ici.
- `anthropic==2.1.0` (mis à jour par le commit `b43a5ac`) : son bon fonctionnement avec `claude-sonnet-5-5` n'est pas encore testé avec une vraie clé.
- Sons : licence Mixkit à vérifier : https://mixkit.co/license/
- `.claude/worktrees/` : 11 entrées sont retirées de l'index Git (suppression en attente de commit). Le formateur doit confirmer.
- Corrections d'accessibilité et de performance : l'audit `CODE_REVIEW_NEXUS.md` a été supprimé le 22 octobre 2026 (il était périmé ; il reste dans l'historique Git).

---

**Mis à jour par Claude Haiku 5.5** — 23 octobre 2026

#!/usr/bin/env bash
# Lance le projet en local, en mode développement :
#   - installe les dépendances si besoin
#   - démarre le backend (FastAPI) et le frontend (Vite) en même temps
#   - arrête proprement les deux quand tu fais Ctrl+C
#
# Usage : ./start.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

if [ -f "$SCRIPT_DIR/.env" ]; then
  line_number=0
  while IFS= read -r line || [ -n "$line" ]; do
    line_number=$((line_number + 1))
    line="${line%$'\r'}"
    [[ "$line" =~ ^[[:space:]]*$ || "$line" =~ ^[[:space:]]*# ]] && continue
    if [[ "$line" =~ ^[[:space:]]*(export[[:space:]]+)?([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*=(.*)$ ]]; then
      key="${BASH_REMATCH[2]}"
      value="${BASH_REMATCH[3]}"
      value="${value#"${value%%[![:space:]]*}"}"
      if [[ "$value" == \"*\" && "$value" == *\" ]]; then
        value="${value:1:${#value}-2}"
      elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
        value="${value:1:${#value}-2}"
      fi
      export "$key=$value"
    else
      printf '\n  \033[1;31m✗ Format invalide dans .env à la ligne %s.\033[0m\n' "$line_number"
      printf '  Utilise une seule ligne par variable, au format NOM=VALEUR.\n\n'
      exit 1
    fi
  done < "$SCRIPT_DIR/.env"
else
  printf '\n  \033[1;33mAstuce :\033[0m aucun fichier .env trouvé.\n'
  printf '  Copie .env.example en .env et remplis tes variables si besoin.\n\n'
fi

# Ports : 8000 / 5173 par défaut. Sur le serveur partagé, chaque élève a ses
# propres ports (BACKEND_PORT / FRONTEND_PORT, définis dans son ~/.bashrc).
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
export BACKEND_PORT FRONTEND_PORT

# Teste si quelqu'un écoute déjà sur ce port (une connexion TCP réussit).
port_busy() {
  (echo >"/dev/tcp/127.0.0.1/$1") 2>/dev/null
}

# Si un ancien serveur occupe déjà un port, on s'arrête tout de suite :
# sinon c'est l'ancienne version qui répondrait, sans que tu le remarques.
for port in "$BACKEND_PORT" "$FRONTEND_PORT"; do
  if port_busy "$port"; then
    printf '\n  \033[1;31m✗ Le port %s est déjà utilisé.\033[0m\n' "$port"
    printf '  Arrête le serveur sur ce port, puis relance ./start.sh.\n\n'
    exit 1
  fi
done

# ── Backend ───────────────────────────────────────────────────────────────────
cd "$BACKEND_DIR"

if [ ! -d ".venv" ]; then
  printf '  \033[1;36m→\033[0m Première installation du backend (venv Python)...\n'
  if command -v python3 >/dev/null 2>&1; then
    python3 -m venv .venv
  elif command -v python >/dev/null 2>&1; then
    python -m venv .venv
  else
    printf '\n  \033[1;31m✗ Python est introuvable. Installe Python, puis relance le script.\033[0m\n\n'
    exit 1
  fi
fi

if [ -f ".venv/Scripts/python.exe" ]; then
  VENV_PYTHON=".venv/Scripts/python.exe"
else
  VENV_PYTHON=".venv/bin/python"
fi
"$VENV_PYTHON" -m pip install -q -r requirements.txt

"$VENV_PYTHON" -m uvicorn main:app --reload --port "$BACKEND_PORT" &
BACKEND_PID=$!

# Arrête le backend si on quitte (Ctrl+C, ou une étape qui échoue)
cleanup() {
  printf '\n  \033[1;33m→\033[0m Arrêt du backend...\n'
  # uvicorn --reload lance un processus enfant qui écoute aussi le port :
  # on l'arrête avec le parent, sinon le port reste occupé
  pkill -P "$BACKEND_PID" 2>/dev/null || true
  kill "$BACKEND_PID" 2>/dev/null || true
}
trap cleanup EXIT

# On n'annonce le succès qu'une fois le backend réellement à l'écoute
for _ in $(seq 1 30); do
  if port_busy "$BACKEND_PORT"; then
    break
  fi
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    printf '\n  \033[1;31m✗ Le backend s'"'"'est arrêté au démarrage (voir les erreurs ci-dessus).\033[0m\n\n'
    exit 1
  fi
  sleep 1
done
if ! port_busy "$BACKEND_PORT"; then
  printf '\n  \033[1;31m✗ Le backend ne répond pas sur le port %s.\033[0m\n\n' "$BACKEND_PORT"
  exit 1
fi

# ── Frontend ──────────────────────────────────────────────────────────────────
cd "$FRONTEND_DIR"

# Vérifie si les dépendances npm doivent être mises à jour : réinstallation si le marqueur
# manque, ou si package.json ou package-lock.json est plus récent que la dernière installation
if [ ! -f "node_modules/.package-lock.json" ] || [ "package.json" -nt "node_modules/.package-lock.json" ] || [ "package-lock.json" -nt "node_modules/.package-lock.json" ]; then
  printf '  \033[1;36m→\033[0m Installation/mise à jour des dépendances frontend (npm ci)...\n'
  npm ci --silent
else
  printf '  \033[1;36m→\033[0m Dépendances frontend à jour.\n'
fi

printf '\n  \033[1;32m✓ Backend démarré  →\033[0m \033[4mhttp://localhost:%s\033[0m\n' "$BACKEND_PORT"
printf '  \033[1;32m→ Frontend démarre →\033[0m \033[4mhttp://localhost:%s\033[0m\n\n' "$FRONTEND_PORT"

npm run dev

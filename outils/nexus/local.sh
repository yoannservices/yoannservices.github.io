#!/usr/bin/env bash
# Petit raccourci pour lancer tout le projet en local avec Docker.
# Usage : ./local.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -f "$SCRIPT_DIR/.env" ]; then
  # Docker Compose exige le fichier .env : sans lui, il échouerait avec une
  # erreur peu claire. On s'arrête donc ici, avant de lancer Docker.
  printf '\n  \033[1;31m✗ Aucun fichier .env trouvé.\033[0m\n'
  printf '  Copie .env.example en .env (cp .env.example .env), puis écris ta clé\n'
  printf '  dans ANTHROPIC_API_KEY, et relance ./local.sh.\n\n'
  exit 1
fi

docker compose up --build

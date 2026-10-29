#!/usr/bin/env bash
# Arrête le backend et le frontend lancés par ./start.sh.
#
# Normalement, un simple Ctrl+C dans le terminal de ./start.sh suffit.
# Ce script sert de filet de sécurité si le terminal a été fermé sans
# Ctrl+C et qu'un serveur est resté allumé en arrière-plan (les ports du
# backend et du frontend restent alors "occupés"). Par défaut ce sont 8000
# et 5173, ou BACKEND_PORT / FRONTEND_PORT s'ils sont définis.
#
# Il a besoin de la commande lsof (présente sur la plupart des systèmes).
#
# Usage : ./stop.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Comme ./start.sh, on lit le fichier .env : il peut contenir BACKEND_PORT et
# FRONTEND_PORT. Sans ça, on viserait les mauvais ports.
if [ -f "$SCRIPT_DIR/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$SCRIPT_DIR/.env"
  set +a
fi

# 8000 / 5173 par défaut, ou les ports personnels de l'élève (serveur partagé)
PORTS=("${BACKEND_PORT:-8000}" "${FRONTEND_PORT:-5173}")
stopped_ports=()
failed_ports=()

if ! command -v lsof >/dev/null 2>&1; then
  printf '\n  \033[1;31m✗ La commande lsof est introuvable : impossible de chercher les serveurs.\033[0m\n\n'
  exit 1
fi

# Renvoie les pids qui ÉCOUTENT sur un port.
# -sTCP:LISTEN : on ne vise que le serveur, pas les programmes qui s'y connectent
# (navigateur, autre terminal...) : arrêter ceux-là casserait autre chose.
listening_pids() {
  lsof -ti tcp:"$1" -sTCP:LISTEN 2>/dev/null || true
}

for port in "${PORTS[@]}"; do
  pids="$(listening_pids "$port")"

  # Rien n'écoute sur ce port : on n'annonce rien pour lui
  [ -n "$pids" ] || continue

  printf '  \033[1;33m→\033[0m Arrêt du serveur sur le port %s (pid %s)\n' "$port" "$pids"

  # Un signal peut échouer (processus d'un autre utilisateur, par exemple)
  kill_failed=false
  for pid in $pids; do
    kill "$pid" 2>/dev/null || kill_failed=true
  done

  # On attend un court instant que le port soit vraiment libéré : ne compter
  # comme "arrêté" que ce qui n'écoute plus.
  for _ in 1 2 3 4 5 6; do
    [ -n "$(listening_pids "$port")" ] || break
    sleep 0.5
  done

  if [ -z "$(listening_pids "$port")" ] && [ "$kill_failed" = false ]; then
    stopped_ports+=("$port")
  else
    failed_ports+=("$port")
  fi
done

if [ "${#failed_ports[@]}" -gt 0 ]; then
  printf '\n  \033[1;31m✗ Impossible d'"'"'arrêter le serveur sur le port %s.\033[0m\n' "${failed_ports[*]}"
  printf '  Il appartient peut-être à un autre utilisateur, ou il met du temps à s'"'"'arrêter.\n\n'
  exit 1
elif [ "${#stopped_ports[@]}" -gt 0 ]; then
  printf '\n  \033[1;32m✓ Terminé.\033[0m Les ports %s sont libres.\n\n' "${stopped_ports[*]}"
else
  printf '\n  Rien à arrêter — aucun serveur ne tournait sur les ports %s ou %s.\n\n' "${PORTS[0]}" "${PORTS[1]}"
fi

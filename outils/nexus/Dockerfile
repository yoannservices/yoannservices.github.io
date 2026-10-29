# La recette pour "emballer" TOUT ton projet (frontend + backend) dans une
# seule boîte (image), prête à tourner n'importe où — sur Railway, ou sur ton
# PC avec ./local.sh. Même principe que la démo du chatbot final.
# Tu n'as normalement pas besoin d'y toucher au niveau 1.

# ── Étape 1 : construire le site (frontend) ──────────────────────────────────
# Version exacte de l'image (vérifiée sur Docker Hub) : pour la mettre à jour,
# change ce numéro à la main.
FROM node:22.23.4-alpine AS frontend-builder
WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci --silent

COPY frontend/ .
RUN NODE_ENV=production npm run build

# ── Étape 2 : une seule boîte avec nginx (le site) + FastAPI (le backend) ────
# Version exacte de l'image (vérifiée sur Docker Hub).
FROM python:3.14.4-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# nginx sert le site et transmet les appels /api au backend
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx gettext-base \
    && rm -f /etc/nginx/sites-enabled/default \
    && rm -rf /var/lib/apt/lists/*

# Un utilisateur dédié pour le backend : même si le backend était piraté,
# il n'aurait pas les droits root sur la boîte. nginx, lui, reste en root
# (il doit lire sa configuration et écouter sur le port PORT).
# Le dossier /data contient la base SQLite (comptes) : seul cet utilisateur
# doit pouvoir y écrire.
RUN useradd --system --no-create-home --shell /usr/sbin/nologin nexus \
    && mkdir -p /data \
    && chown nexus:nexus /data
ENV DATABASE_PATH=/data/nexus.db

# Le backend Python
WORKDIR /backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

# Le site construit à l'étape 1
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Configuration nginx — ${PORT} est remplacé au démarrage
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template

# Railway donne le port à écouter dans PORT ; 80 par défaut en local
ENV PORT=80
EXPOSE 80

# 1. envsubst remplace ${PORT} dans la config nginx
# 2. nginx démarre en arrière-plan (en root)
# 3. le backend remplace le script par uvicorn (exec), lancé sous l'utilisateur
#    "nexus" : setpriv change d'utilisateur sans créer de processus intermédiaire,
#    donc uvicorn reçoit directement les signaux d'arrêt (Railway, Ctrl+C).
#    La boîte vit tant que uvicorn tourne (il n'écoute que dans la boîte :
#    on passe toujours par nginx)
CMD ["bash", "-c", "envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && mkdir -p /data && chown -R nexus:nexus /data && nginx && exec setpriv --reuid=nexus --regid=nexus --clear-groups uvicorn main:app --host 127.0.0.1 --port 8000"]

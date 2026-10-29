import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuration de Vite : l'outil qui fait tourner ton frontend en
// développement (rechargement instantané) et qui le "build" pour la prod.
// Tu n'as normalement pas besoin d'y toucher au niveau 1.
export default defineConfig({
  plugins: [react()],
  server: {
    // Port 5173 par défaut. Sur le serveur partagé, chaque élève a son
    // propre port (FRONTEND_PORT, défini dans son ~/.bashrc).
    port: Number(process.env.FRONTEND_PORT ?? 5173),
    // Si le port est déjà pris, s'arrêter plutôt que d'en prendre un autre
    // (sinon l'élève risquerait d'ouvrir le site d'un camarade)
    strictPort: process.env.FRONTEND_PORT !== undefined,
    // En dev, les appels à /api/... sont redirigés vers le backend local.
    // En prod, c'est nginx qui fait ce travail (voir nginx.conf.template).
    proxy: {
      "/api": `http://localhost:${process.env.BACKEND_PORT ?? 8000}`,
    },
  },
});

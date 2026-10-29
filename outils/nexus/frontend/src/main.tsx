import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LangueProvider } from "./i18n/LangueProvider";
import "./index.css";
// Feuilles de style découpées par thème (portes, Markdown) : importées après index.css
// pour garder le même ordre de cascade qu'avant le découpage.
import "./styles/doors.css";
import "./styles/markdown.css";

// Point de départ du frontend : on affiche le composant <App /> dans
// la balise <div id="root"> définie dans index.html.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LangueProvider>
      <App />
    </LangueProvider>
  </React.StrictMode>,
);

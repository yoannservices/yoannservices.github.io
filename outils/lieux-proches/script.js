const formIds = ["name", "sexe", "annee", "typeRencontre", "presentation"];

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function showMessage(text) {
  const output = document.getElementById("output-pre");
  if (!output) return;
  output.textContent = text;
}

/* ── Profil History (localStorage) ── */
function saveProfileToHistory(profile) {
  const history = JSON.parse(localStorage.getItem("lp-history") || "[]");
  history.unshift({ ...profile, date: new Date().toISOString() });
  if (history.length > 20) history.length = 20;
  localStorage.setItem("lp-history", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById("history-list");
  const noMsg = document.getElementById("no-history");
  if (!list) return;
  const history = JSON.parse(localStorage.getItem("lp-history") || "[]");
  if (history.length === 0) { noMsg && (noMsg.style.display = ""); list.innerHTML = ""; return; }
  noMsg && (noMsg.style.display = "none");
  list.innerHTML = history.map(h => {
    const d = new Date(h.date);
    return `<div class="history-item"><strong>${h.nom}</strong> — ${h.sexe}, ${new Date().getFullYear() - Number(h.annee)} ans — ${h.typeRencontre} <span class="history-date">${d.toLocaleDateString("fr-FR")} ${d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</span></div>`;
  }).join("");
}

/* ── Favoris (localStorage) ── */
function getFavorites() {
  return JSON.parse(localStorage.getItem("lp-favs") || "[]");
}
function saveFavorites(favs) {
  localStorage.setItem("lp-favs", JSON.stringify(favs));
}
function toggleFavorite(name) {
  let favs = getFavorites();
  if (favs.includes(name)) favs = favs.filter(f => f !== name);
  else favs.push(name);
  saveFavorites(favs);
  updateFavUI();
}
function updateFavUI() {
  const favs = getFavorites();
  document.querySelectorAll(".place-card .fav-btn").forEach(btn => {
    const name = btn.closest(".place-card").querySelector("h3").textContent;
    btn.classList.toggle("favorited", favs.includes(name));
    btn.textContent = favs.includes(name) ? "💖" : "❤️";
  });
  renderFavoritesList();
}
function renderFavoritesList() {
  const favs = getFavorites();
  const container = document.getElementById("favorites-list");
  const noMsg = document.getElementById("no-fav");
  if (!container) return;
  if (favs.length === 0) { noMsg && (noMsg.style.display = ""); container.innerHTML = ""; return; }
  noMsg && (noMsg.style.display = "none");
  const cards = document.querySelectorAll("#places-grid .place-card");
  let html = "";
  cards.forEach(card => {
    const name = card.querySelector("h3").textContent;
    if (favs.includes(name)) {
      html += `<article class="place-card" style="max-width:260px">${card.querySelector("img").outerHTML}<h3>${name}</h3>${card.querySelector("p").outerHTML}</article>`;
    }
  });
  container.innerHTML = html;
}

/* ── Filtres catégorie + distance ── */
let activeFilter = "all";
function applyFilters() {
  const maxDist = parseInt(document.getElementById("dist-range")?.value || "50");
  document.querySelectorAll("#places-grid .place-card").forEach(card => {
    const cat = card.dataset.cat;
    const dist = parseInt(card.dataset.dist || "0");
    const catOk = activeFilter === "all" || cat === activeFilter;
    const distOk = dist <= maxDist;
    card.classList.toggle("hidden", !(catOk && distOk));
  });
}

/* ── Leaflet Map ── */
let map, markers = [];
function initMap() {
  const mapEl = document.getElementById("map");
  if (!mapEl) return;
  map = L.map("map").setView([48.8566, 2.3522], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);
  document.querySelectorAll("#places-grid .place-card").forEach(card => {
    const lat = parseFloat(card.dataset.lat);
    const lng = parseFloat(card.dataset.lng);
    const name = card.querySelector("h3").textContent;
    const desc = card.querySelector("p").textContent;
    if (!isNaN(lat) && !isNaN(lng)) {
      const m = L.marker([lat, lng]).addTo(map).bindPopup(`<strong>${name}</strong><br>${desc}`);
      markers.push({ marker: m, card });
    }
  });
}

function collectProfile() {
  const profile = {
    nom: getValue("name"),
    sexe: getValue("sexe"),
    annee: getValue("annee"),
    typeRencontre: getValue("typeRencontre"),
    presentation: getValue("presentation")
  };

  if (!profile.nom || !profile.sexe || !profile.annee || !profile.typeRencontre || !profile.presentation) {
    showMessage("Merci de remplir tous les champs pour recevoir des recommandations pertinentes.");
    return;
  }

  const age = Math.max(0, new Date().getFullYear() - Number(profile.annee || 0));

  const summary = [
    "Profil validé avec succès.",
    "",
    `Nom: ${profile.nom}`,
    `Sexe: ${profile.sexe}`,
    `Age estimé: ${age} ans`,
    `Recherche: ${profile.typeRencontre}`,
    "",
    "Présentation:",
    profile.presentation,
    "",
    "Conseil LieuxProche: commence par la salle de concert si tu veux des échanges rapides, puis teste un lieu culturel pour une rencontre plus posée."
  ].join("\n");

  showMessage(summary);
  saveProfileToHistory(profile);
}

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("collect-btn");
  if (button) button.addEventListener("click", collectProfile);

  formIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && id !== "presentation") {
        event.preventDefault();
        collectProfile();
      }
    });
  });

  // Filtres catégorie
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.cat;
      applyFilters();
    });
  });

  // Filtre distance
  const distRange = document.getElementById("dist-range");
  const distVal = document.getElementById("dist-val");
  if (distRange) {
    distRange.addEventListener("input", () => {
      distVal.textContent = distRange.value;
      applyFilters();
    });
  }

  // Favoris
  document.querySelectorAll(".fav-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const name = btn.closest(".place-card").querySelector("h3").textContent;
      toggleFavorite(name);
    });
  });
  updateFavUI();

  // Map
  initMap();

  // History
  renderHistory();
});

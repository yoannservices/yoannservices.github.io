const WIKI_API_BASE = "https://onepiece.fandom.com/fr/api.php";
const WIKI_PAGE_BASE = "https://onepiece.fandom.com/fr/wiki/";

let wikiCache = [];
let wikiContinue = null;
// « Catégorie:Personnages » est vide sur le wiki : on parcourt ces deux catégories à la suite
const WIKI_CATEGORIES = ["Catégorie:Personnages Masculins", "Catégorie:Personnages Féminins"];
let wikiCategoryIndex = 0;

function slugify(input) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toWikiUrl(title) {
  return `${WIKI_PAGE_BASE}${encodeURIComponent(title.replace(/ /g, "_"))}`;
}

function formatBerry(amount) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " B";
}

async function getPageThumbnail(title, size = 420) {
  const url = `${WIKI_API_BASE}?action=query&format=json&origin=*&prop=pageimages&piprop=thumbnail&pithumbsize=${size}&titles=${encodeURIComponent(title)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return "";
    }
    const data = await response.json();
    const pages = data?.query?.pages || {};
    const first = Object.values(pages)[0];
    return first?.thumbnail?.source || "";
  } catch {
    return "";
  }
}

function createCharacterCard(character) {
  const card = document.createElement("a");
  card.className = "char-card";
  card.href = `personnage.html?slug=${encodeURIComponent(character.slug)}`;

  const image = document.createElement("img");
  image.alt = character.name;
  image.src = "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";

  const body = document.createElement("div");
  body.className = "char-card-body";
  body.innerHTML = `
    <h3>${character.name}</h3>
    <p class="char-meta">${character.crew}</p>
    <p class="char-meta">${character.role}</p>
  `;

  card.appendChild(image);
  card.appendChild(body);

  getPageThumbnail(character.wikiTitle, 500).then((thumbnail) => {
    if (thumbnail) {
      image.src = thumbnail;
    }
  });

  return card;
}

function renderFeatured(query = "") {
  const grid = document.getElementById("featuredGrid");
  const counter = document.getElementById("featuredCount");
  if (!grid || !counter) {
    return;
  }

  const q = query.trim().toLowerCase();
  const items = detailedCharacters.filter((character) => {
    if (!q) {
      return true;
    }
    const haystack = `${character.name} ${character.alias} ${character.crew} ${character.role}`.toLowerCase();
    return haystack.includes(q);
  });

  grid.innerHTML = "";
  items.forEach((character) => {
    grid.appendChild(createCharacterCard(character));
  });
  counter.textContent = `${items.length} fiche(s)`;
}

async function fetchWikiCharacters() {
  const continuationPart = wikiContinue ? `&cmcontinue=${encodeURIComponent(wikiContinue)}` : "";
  const category = WIKI_CATEGORIES[wikiCategoryIndex];
  if (!category) return;
  const url = `${WIKI_API_BASE}?action=query&format=json&origin=*&list=categorymembers&cmnamespace=0&cmtitle=${encodeURIComponent(category)}&cmlimit=100${continuationPart}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Echec de chargement");
    }

    const data = await response.json();
    const members = data?.query?.categorymembers || [];
    wikiContinue = data?.continue?.cmcontinue || null;
    if (!wikiContinue) wikiCategoryIndex++;

    const normalized = members
      .filter((member) => !member.title.includes("Liste") && !member.title.startsWith("Personnages"))
      .map((member) => member.title);

    wikiCache.push(...normalized);
    wikiCache = [...new Set(wikiCache)].sort((a, b) => a.localeCompare(b, "fr"));
    renderWikiList(document.getElementById("searchInput")?.value || "");
  } catch {
    const wikiCount = document.getElementById("wikiCount");
    if (wikiCount) {
      wikiCount.textContent = "Erreur de chargement Wiki";
    }
  }
}

function renderWikiList(query = "") {
  const list = document.getElementById("wikiList");
  const counter = document.getElementById("wikiCount");
  const moreBtn = document.getElementById("loadMoreBtn");

  if (!list || !counter || !moreBtn) {
    return;
  }

  const q = query.trim().toLowerCase();
  const items = wikiCache.filter((title) => (q ? title.toLowerCase().includes(q) : true));

  list.innerHTML = "";
  items.slice(0, 120).forEach((title) => {
    const link = document.createElement("a");
    link.className = "wiki-link";
    link.href = toWikiUrl(title);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = title;
    list.appendChild(link);
  });

  counter.textContent = `${items.length} personnage(s) charges`;
  moreBtn.style.display = wikiContinue || WIKI_CATEGORIES[wikiCategoryIndex] ? "inline-flex" : "none";
}

function renderDetail() {
  const root = document.getElementById("detailRoot");
  if (!root) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug") || "";
  const character = detailBySlug[slug];

  if (!character) {
    root.innerHTML = `
      <a class="back-btn" href="personnages.html">Retour personnages</a>
      <div class="empty-state">
        Fiche introuvable. Ouvre la liste des personnages pour selectionner une fiche valide.
      </div>
      <a class="pill-link" href="https://onepiece.fandom.com/fr/wiki/Personnages" target="_blank" rel="noopener noreferrer">Voir tous les personnages sur Fandom</a>
    `;
    return;
  }

  const bountyRows = character.bountyHistory
    .map((step) => `<div class="step"><span>${step.label}</span><b>${formatBerry(step.amount)}</b></div>`)
    .join("");

  const haki = character.haki.join(", ");
  const traits = character.characteristics.map((item) => `<span>${item}</span>`).join("");

  root.innerHTML = `
    <a class="back-btn" href="personnages.html">Retour personnages</a>
    <section class="detail-top">
      <img id="detailPortrait" class="portrait" src="https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg" alt="${character.name}">
      <article class="detail-card">
        <h1>${character.name}</h1>
        <p class="alias">${character.alias}</p>
        <table class="stats-table">
          <tr><td>Equipage</td><td>${character.crew}</td></tr>
          <tr><td>Role</td><td>${character.role}</td></tr>
          <tr><td>Origine</td><td>${character.origin}</td></tr>
          <tr><td>Fruit du demon</td><td>${character.devilFruit}</td></tr>
          <tr><td>Haki</td><td>${haki}</td></tr>
        </table>
        <div class="traits">${traits}</div>
        <a id="detailWikiLink" class="pill-link" target="_blank" rel="noopener noreferrer">Page Fandom</a>
      </article>
    </section>

    <section class="bounty-box">
      <h2>Evolution de la prime</h2>
      <div class="timeline">${bountyRows}</div>
    </section>
  `;

  const wikiLink = document.getElementById("detailWikiLink");
  if (wikiLink) {
    wikiLink.href = toWikiUrl(character.wikiTitle);
  }

  getPageThumbnail(character.wikiTitle, 700).then((thumbnail) => {
    const portrait = document.getElementById("detailPortrait");
    if (portrait && thumbnail) {
      portrait.src = thumbnail;
    }
  });
}

function initListPage() {
  renderFeatured();
  fetchWikiCharacters();

  const search = document.getElementById("searchInput");
  if (search) {
    search.addEventListener("input", () => {
      renderFeatured(search.value);
      renderWikiList(search.value);
    });
  }

  const loadMore = document.getElementById("loadMoreBtn");
  if (loadMore) {
    loadMore.addEventListener("click", () => {
      fetchWikiCharacters();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "list") {
    initListPage();
  }
  if (page === "detail") {
    renderDetail();
  }
});

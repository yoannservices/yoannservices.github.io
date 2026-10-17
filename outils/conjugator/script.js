let conjugaisons = {};

async function chargerJSON() {
  try {
    const response = await fetch(new URL("conjugaisons.json", document.baseURI));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    // Le fichier est une liste de verbes : on l'indexe par infinitif
    conjugaisons = {};
    (Array.isArray(data) ? data : Object.values(data)).forEach(verbe => {
      const inf = verbe?.Infinitif?.["Présent"]?.[0];
      if (inf && !conjugaisons[inf.toLowerCase()]) conjugaisons[inf.toLowerCase()] = verbe;
    });
    return true;
  } catch (error) {
    conjugaisons = {};
    const zone = document.getElementById("resultat");
    if (zone) zone.textContent = "La base de conjugaisons est indisponible. Ouvre ce projet avec un serveur local.";
    return false;
  }
}

/* ── Fuzzy / Tolerant search ── */
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+(a[i-1]!==b[j-1]?1:0));
  return dp[m][n];
}

/* ── Pronominal helper ── */
function parsePronominal(input) {
  const s = input.trim().toLowerCase();
  if (s.startsWith("se ")) return { pronominal: true, base: s.slice(3) };
  if (s.startsWith("s'")) return { pronominal: true, base: s.slice(2) };
  if (s.startsWith("se")) return { pronominal: true, base: s.slice(2) };
  return { pronominal: false, base: s };
}

/* ── Radical / Ending highlight ── */
function highlightForme(forme, infinitif) {
  // Find the longest common prefix between the conjugated form and the infinitive stem
  const stem = infinitif.replace(/(er|ir|re|oir)$/i, '');
  let i = 0;
  while (i < stem.length && i < forme.length && forme[i] === stem[i]) i++;
  if (i === 0) return `<span class="hl-end">${forme}</span>`;
  const radical = forme.slice(0, i);
  const ending = forme.slice(i);
  return `<span class="hl-rad">${radical}</span><span class="hl-end">${ending}</span>`;
}

function chercher(verbe) {
  verbe = verbe.toLowerCase();
  let resultats = [];

  for (let infinitif in conjugaisons) {
    let modes = conjugaisons[infinitif];
    for (let mode in modes) {
      for (let temps in modes[mode]) {
        let formes = modes[mode][temps];

        if (formes.includes(verbe) && mode.toLowerCase() === "infinitif") {
          resultats.push({ type: "infinitif", verbe, infinitif, mode, temps });
        }

        let index = formes.indexOf(verbe);
        if (index !== -1 && mode.toLowerCase() !== "infinitif") {
          resultats.push({ type: "conjugue", verbe, infinitif, mode, temps, personne: index + 1 });
        }
      }
    }
  }

  // Fuzzy fallback if no exact match
  if (resultats.length === 0) {
    let best = null, bestDist = Infinity;
    for (let infinitif in conjugaisons) {
      let modes = conjugaisons[infinitif];
      for (let mode in modes) {
        for (let temps in modes[mode]) {
          let formes = modes[mode][temps];
          formes.forEach((f, idx) => {
            const d = levenshtein(verbe, f.toLowerCase());
            if (d < bestDist && d <= 2) {
              bestDist = d;
              best = { type: "fuzzy", verbe: f, infinitif, mode, temps, personne: idx + 1, distance: d };
            }
          });
        }
      }
    }
    if (best) resultats.push(best);
  }

  return resultats;
}

/* ── Full conjugation of an infinitive ── */
function conjuguerTout(infinitif) {
  const data = conjugaisons[infinitif];
  if (!data) return null;
  return data;
}

/* ── History (localStorage) ── */
function getHistory() { return JSON.parse(localStorage.getItem("conj-history") || "[]"); }
function saveHistory(f) { localStorage.setItem("conj-history", JSON.stringify(f)); }
function pushHistory(verb) {
  let hist = getHistory();
  hist = hist.filter(v => v !== verb);
  hist.unshift(verb);
  if (hist.length > 15) hist.length = 15;
  saveHistory(hist);
  renderHistory();
}
function clearHistory() { localStorage.removeItem("conj-history"); renderHistory(); }
function renderHistory() {
  const list = document.getElementById("history-list");
  if (!list) return;
  const hist = getHistory();
  list.innerHTML = hist.length === 0
    ? '<span style="opacity:.4;font-size:.85rem">Aucun historique</span>'
    : hist.map(v => `<button onclick="document.getElementById('inputVerbe').value='${v}';document.getElementById('analyser').click()" style="padding:4px 12px;border-radius:8px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:var(--ui-muted);cursor:pointer;font-size:.78rem">${v}</button>`).join('');
}

/* ── Favorites (localStorage) ── */
function getFavs() { return JSON.parse(localStorage.getItem("conj-favs") || "[]"); }
function saveFavs(f) { localStorage.setItem("conj-favs", JSON.stringify(f)); }
function toggleFav(verb) {
  let favs = getFavs();
  if (favs.includes(verb)) favs = favs.filter(v => v !== verb);
  else { favs.unshift(verb); if (favs.length > 20) favs.length = 20; }
  saveFavs(favs);
  renderFavs();
}
function renderFavs() {
  const list = document.getElementById("favorites-list");
  if (!list) return;
  const favs = getFavs();
  list.innerHTML = favs.length === 0 ? '<span style="opacity:.4;font-size:.85rem">Aucun favori</span>' :
    favs.map(v => `<button onclick="document.getElementById('inputVerbe').value='${v}';document.getElementById('analyser').click()" style="padding:4px 12px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:var(--ui-text);cursor:pointer;font-size:.82rem">${v}</button>`).join('');
}

function afficher(resultats, verbe) {
  const zone = document.getElementById("resultat");
  zone.innerHTML = "";

  // Save to history
  const baseVerb = verbe.replace(/^se? /, '');
  pushHistory(baseVerb);

  if (resultats.length === 0) {
    zone.textContent = `Verbe non trouvé: ${verbe}`;
  } else {
    // Fav button
    const favBtn = document.createElement("button");
    favBtn.textContent = getFavs().includes(verbe) ? "💖 Retirer des favoris" : "⭐ Ajouter aux favoris";
    favBtn.style.cssText = "padding:6px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:var(--ui-text);cursor:pointer;font-size:.82rem;margin-bottom:10px";
    favBtn.onclick = () => { toggleFav(verbe); afficher(resultats, verbe); };
    zone.appendChild(favBtn);

    resultats.forEach(r => {
      let bloc = document.createElement("div");
      bloc.className = "result-line";

      if (r.type === "infinitif") {
        bloc.innerHTML = `<strong>${r.verbe}</strong> est à l'<strong>${r.mode}</strong> <strong>${r.temps}</strong>.`;
      } else if (r.type === "fuzzy") {
        bloc.innerHTML = `⚠️ Vouliez-vous dire <strong>${r.verbe}</strong> ? (${r.mode}, ${r.temps}, ${r.personne}e personne de <em>${r.infinitif}</em>)`;
        bloc.style.opacity = ".7";
      } else if (r.type === "conjugue") {
        let tempsFormate = r.temps.toLowerCase() === "imparfait" ? `à l'<strong>${r.temps}</strong>` : `au <strong>${r.temps}</strong>`;
        bloc.innerHTML = `<strong>${r.verbe}</strong> est conjugué ${tempsFormate} ${/^[aeiouyéèêiî]/i.test(r.mode) ? "de l'" : 'du '}<strong>${r.mode}</strong> à la ${r.personne}e personne <em>(${r.infinitif})</em>.`;
      }

      zone.appendChild(bloc);
    });
  }
}

/* ── Full conjugation display (tabbed by mode) ── */
function afficherConjugaison(infinitif, pronominal) {
  const data = conjuguerTout(infinitif);
  const zone = document.getElementById("resultat");
  if (!data) { zone.textContent = `Verbe "${infinitif}" non trouvé dans la base.`; return; }

  const displayInf = pronominal ? `se ${infinitif}` : infinitif;
  const personnes = pronominal
    ? ["me", "te", "se", "nous", "vous", "se"]
    : ["je", "tu", "il/elle", "nous", "vous", "ils/elles"];

  const modes = Object.keys(data).filter(m => m.toLowerCase() !== 'infinitif');
  const infMode = Object.keys(data).find(m => m.toLowerCase() === 'infinitif');

  // Tab bar
  let tabBar = `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px">`;
  if (infMode) tabBar += `<button class="conj-tab active" data-mode="${infMode}" style="padding:5px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:var(--ui-accent-soft);color:var(--ui-accent-2);cursor:pointer;font:inherit;font-size:.82rem;font-weight:600">${infMode}</button>`;
  modes.forEach((m, i) => {
    tabBar += `<button class="conj-tab${i === 0 && !infMode ? ' active' : ''}" data-mode="${m}" style="padding:5px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:var(--ui-text);cursor:pointer;font:inherit;font-size:.82rem">${m}</button>`;
  });
  tabBar += `</div>`;

  let allPanels = '';
  const allModes = infMode ? [infMode, ...modes] : modes;
  allModes.forEach((mode, mi) => {
    const isInf = mode.toLowerCase() === 'infinitif';
    const visible = mi === 0 ? '' : 'display:none';
    allPanels += `<div class="conj-panel" data-mode="${mode}" style="${visible}">`;
    for (let temps in data[mode]) {
      const formes = data[mode][temps];
      if (isInf) {
        allPanels += `<div class="result-line"><strong>${temps}</strong>: ${formes.join(", ")}</div>`;
      } else {
        allPanels += `<div class="result-line"><strong>${temps}</strong><div style="display:flex;flex-wrap:wrap;gap:4px 16px;margin-top:6px">`;
        formes.forEach((f, i) => {
          const pron = personnes[i] || `${i+1}e`;
          const highlighted = highlightForme(f, infinitif);
          allPanels += `<span style="font-size:.88rem"><span style="opacity:.45">${pron}</span> <strong>${highlighted}</strong></span>`;
        });
        allPanels += `</div></div>`;
      }
    }
    allPanels += `</div>`;
  });

  zone.innerHTML = `<h2 style="font-size:1.2rem;margin-bottom:14px">Conjugaison de <em>${displayInf}</em></h2>${tabBar}${allPanels}`;

  // Tab click handler
  zone.querySelectorAll('.conj-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      zone.querySelectorAll('.conj-tab').forEach(b => {
        b.style.background = 'rgba(255,255,255,.04)';
        b.style.color = 'var(--ui-text)';
        b.style.border = '1px solid rgba(255,255,255,.1)';
      });
      btn.style.background = 'var(--ui-accent-soft)';
      btn.style.color = 'var(--ui-accent-2)';
      btn.style.border = '1px solid rgba(255,255,255,.15)';
      zone.querySelectorAll('.conj-panel').forEach(p => p.style.display = 'none');
      const panel = zone.querySelector(`.conj-panel[data-mode="${btn.dataset.mode}"]`);
      if (panel) panel.style.display = '';
    });
  });
}

/* ── Autocomplete ── */
function updateAutocomplete(query) {
  const list = document.getElementById("autocomplete-list");
  if (!query || query.length < 2) { list.style.display = "none"; return; }
  const q = query.toLowerCase();
  const matches = Object.keys(conjugaisons).filter(v => v.startsWith(q)).slice(0, 8);
  if (matches.length === 0) { list.style.display = "none"; return; }
  list.style.display = "block";
  list.innerHTML = matches.map(m => `<div style="padding:8px 14px;cursor:pointer;font-size:.9rem;border-bottom:1px solid rgba(255,255,255,.05)" onmousedown="document.getElementById('inputVerbe').value='${m}';document.getElementById('autocomplete-list').style.display='none'">${m}</div>`).join('');
}

document.addEventListener("DOMContentLoaded", async () => {
  const loaded = await chargerJSON();
  if (!loaded) return;
  const bouton = document.getElementById("analyser");
  const input = document.getElementById("inputVerbe");
  const btnConj = document.getElementById("btn-conjugate");

  const analyser = () => {
    let raw = input.value.trim();
    if (!raw) return;
    const { pronominal, base } = parsePronominal(raw);
    let res = chercher(base);
    // Tag results as pronominal
    if (pronominal) res = res.map(r => ({ ...r, pronominal: true }));
    afficher(res, pronominal ? `se ${base}` : base);
    document.getElementById("autocomplete-list").style.display = "none";
  };

  bouton.addEventListener("click", analyser);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") analyser();
  });
  input.addEventListener("input", () => updateAutocomplete(input.value.trim()));
  input.addEventListener("blur", () => setTimeout(() => document.getElementById("autocomplete-list").style.display = "none", 200));

  btnConj.addEventListener("click", () => {
    let raw = input.value.trim();
    if (!raw) return;
    const { pronominal, base } = parsePronominal(raw);
    const v = base.toLowerCase();
    // Try to find the infinitive
    if (conjugaisons[v]) {
      afficherConjugaison(v, pronominal);
    } else {
      const res = chercher(v);
      if (res.length > 0 && res[0].infinitif) {
        afficherConjugaison(res[0].infinitif, pronominal);
      } else {
        document.getElementById("resultat").textContent = `Impossible de trouver l'infinitif de "${v}".`;
      }
    }
  });

  renderFavs();
  renderHistory();

  const clearHistBtn = document.getElementById("btn-clear-history");
  if (clearHistBtn) clearHistBtn.addEventListener("click", clearHistory);
});
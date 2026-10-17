/* ══════════════════════════════════════
   NAVIGATION
══════════════════════════════════════ */
function showGame(id){
  window.location.href='games/'+id+'.html';
}

/* ══════════════════════════════════════
   GLOBAL SCORE SYSTEM (localStorage)
══════════════════════════════════════ */
const QP_KEY = "qp-profile";
const GAME_NAMES = {
  reaction: "Réaction", clicker: "Space Clicker", memory: "Mémoire", guess: "Devinette",
  typing: "Typing Rush", aim: "Aim Trainer", anagram: "Anagramme", snake: "Snake",
  "2048": "2048", mines: "Démineur", blackjack: "Blackjack", dino: "Dino Run",
  dodgezone: "Dodge Zone", hunterzone: "Hunter Zone", towerdefense: "Space TD"
};

function getProfile() {
  const def = { name: "Joueur", xp: 0, level: 1, scores: {}, gamesPlayed: 0, achievements: [] };
  try { return { ...def, ...JSON.parse(localStorage.getItem(QP_KEY)) }; } catch { return def; }
}
function saveProfile(p) { localStorage.setItem(QP_KEY, JSON.stringify(p)); }

// Called from individual game pages: QuickPlay.submitScore("snake", 42)
window.QuickPlay = {
  submitScore(gameId, score) {
    const p = getProfile();
    p.gamesPlayed = (p.gamesPlayed || 0) + 1;
    if (!p.scores[gameId] || score > p.scores[gameId]) {
      p.scores[gameId] = score;
    }
    p.xp = (p.xp || 0) + 10;
    while (p.xp >= p.level * 100) {
      p.xp -= p.level * 100;
      p.level++;
    }
    checkAchievements(p);
    saveProfile(p);
  }
};

/* ══════════════════════════════════════
   ACHIEVEMENTS
══════════════════════════════════════ */
const ACHIEVEMENTS = [
  { id: "first_game", icon: "🎮", name: "Première partie", desc: "Jouer ta première partie", test: p => p.gamesPlayed >= 1 },
  { id: "ten_games", icon: "🔟", name: "Habitué", desc: "Jouer 10 parties", test: p => p.gamesPlayed >= 10 },
  { id: "fifty_games", icon: "🏅", name: "Vétéran", desc: "Jouer 50 parties", test: p => p.gamesPlayed >= 50 },
  { id: "five_diff", icon: "🌟", name: "Explorateur", desc: "Jouer à 5 jeux différents", test: p => Object.keys(p.scores || {}).length >= 5 },
  { id: "all_games", icon: "👑", name: "Complétion", desc: "Jouer à tous les jeux", test: p => Object.keys(p.scores || {}).length >= 15 },
  { id: "level5", icon: "⬆️", name: "Niveau 5", desc: "Atteindre le niveau 5", test: p => p.level >= 5 },
  { id: "level10", icon: "🚀", name: "Niveau 10", desc: "Atteindre le niveau 10", test: p => p.level >= 10 },
  { id: "snake100", icon: "🐍", name: "Serpent roi", desc: "Score 100+ au Snake", test: p => (p.scores?.snake || 0) >= 100 },
  { id: "aim90", icon: "🎯", name: "Sniper", desc: "90%+ de précision au Aim", test: p => (p.scores?.aim || 0) >= 90 },
  { id: "reaction200", icon: "⚡", name: "Réflexes d'acier", desc: "< 200ms en Réaction", test: p => (p.scores?.reaction || 9999) <= 200 }
];

function checkAchievements(p) {
  if (!p.achievements) p.achievements = [];
  ACHIEVEMENTS.forEach(a => {
    if (!p.achievements.includes(a.id) && a.test(p)) {
      p.achievements.push(a.id);
    }
  });
}

/* ══════════════════════════════════════
   UI RENDERING
══════════════════════════════════════ */
function renderProfile() {
  const p = getProfile();
  const nameEl = document.getElementById("player-name");
  const levelEl = document.getElementById("player-level");
  const nameInput = document.getElementById("name-input");
  const totalGames = document.getElementById("total-games");
  const achCount = document.getElementById("achievements-count");

  if (nameEl) nameEl.textContent = p.name;
  if (levelEl) levelEl.textContent = `Niveau ${p.level} • ${p.xp} XP`;
  if (nameInput) nameInput.value = p.name;
  if (totalGames) totalGames.textContent = `${p.gamesPlayed || 0} parties`;
  if (achCount) achCount.textContent = `${(p.achievements || []).length} / ${ACHIEVEMENTS.length}`;

  // XP bar
  const xpNeeded = p.level * 100;
  const pct = Math.min((p.xp / xpNeeded) * 100, 100);
  const xpBar = document.getElementById("xp-bar");
  const xpText = document.getElementById("xp-text");
  if (xpBar) xpBar.style.width = pct + "%";
  if (xpText) xpText.textContent = `${p.xp} / ${xpNeeded} XP`;

  // Scores
  const scoresList = document.getElementById("scores-list");
  if (scoresList) {
    const entries = Object.entries(p.scores || {});
    scoresList.innerHTML = entries.length === 0
      ? '<p style="opacity:.5;grid-column:1/-1">Aucun score enregistré</p>'
      : entries.map(([gid, score]) => `
        <div style="background:rgba(255,255,255,.04);padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.06)">
          <div style="font-weight:700;font-size:.85rem">${GAME_NAMES[gid] || gid}</div>
          <div style="font-size:1.1rem;font-weight:800;color:var(--ui-accent-2)">${score}</div>
        </div>
      `).join('');
  }

  // Achievements
  const achList = document.getElementById("achievements-list");
  if (achList) {
    achList.innerHTML = ACHIEVEMENTS.map(a => {
      const unlocked = (p.achievements || []).includes(a.id);
      return `<div style="background:${unlocked ? 'rgba(108,92,231,.15)' : 'rgba(255,255,255,.03)'};padding:12px;border-radius:10px;border:1px solid ${unlocked ? 'rgba(108,92,231,.3)' : 'rgba(255,255,255,.06)'};opacity:${unlocked ? 1 : .4}">
        <span style="font-size:1.3rem">${a.icon}</span>
        <div style="font-weight:700;font-size:.85rem;margin-top:4px">${a.name}</div>
        <div style="font-size:.75rem;opacity:.6">${a.desc}</div>
      </div>`;
    }).join('');
  }
}

function savePlayerName(name) {
  const p = getProfile();
  p.name = name || "Joueur";
  saveProfile(p);
  document.getElementById("player-name").textContent = p.name;
}

function toggleProfile() {
  const el = document.getElementById("profile-panel");
  el.style.display = el.style.display === "none" ? "block" : "none";
  renderProfile();
}
function toggleScores() {
  const el = document.getElementById("scores-panel");
  el.style.display = el.style.display === "none" ? "block" : "none";
  renderProfile();
}
function toggleAchievements() {
  const el = document.getElementById("achievements-panel");
  el.style.display = el.style.display === "none" ? "block" : "none";
  renderProfile();
}

function filterGameCards() {
  const qEl = document.getElementById('game-search');
  const fEl = document.getElementById('game-filter');
  const cards = Array.from(document.querySelectorAll('.cards-grid .card'));
  if (!qEl || !fEl || !cards.length) return;

  const q = qEl.value.trim().toLowerCase();
  const cat = fEl.value;
  let visible = 0;

  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    const cardCat = card.dataset.cat || 'all';
    const matchQ = !q || text.includes(q);
    const matchCat = cat === 'all' || cat === cardCat;
    const show = matchQ && matchCat;
    card.classList.toggle('hidden', !show);
    if (show) visible++;
  });

  const c = document.getElementById('game-counter');
  if (c) c.textContent = `${visible} jeu${visible > 1 ? 'x' : ''}`;
}

function initGameFilters() {
  const qEl = document.getElementById('game-search');
  const fEl = document.getElementById('game-filter');
  if (!qEl || !fEl) return;
  qEl.addEventListener('input', filterGameCards);
  fEl.addEventListener('change', filterGameCards);
  filterGameCards();
}

// Init on page load
document.addEventListener("DOMContentLoaded", () => {
  renderProfile();
  initGameFilters();
});

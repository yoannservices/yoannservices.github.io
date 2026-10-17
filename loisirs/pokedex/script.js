/* ── Pokédex Complet ── */

const API = 'https://pokeapi.co/api/v2';
const SPRITE = id => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
const GEN_RANGES = { 1:[1,151], 2:[152,251], 3:[252,386], 4:[387,493], 5:[494,649], 6:[650,721], 7:[722,809], 8:[810,905], 9:[906,1025] };
const STAT_COLORS = { hp:'#ef4444', attack:'#f97316', defense:'#f59e0b', 'special-attack':'#8b5cf6', 'special-defense':'#3b82f6', speed:'#22c55e' };
const STAT_LABELS = { hp:'PV', attack:'Attaque', defense:'Défense', 'special-attack':'Att. Spé.', 'special-defense':'Déf. Spé.', speed:'Vitesse' };
const TYPES_FR = { normal:'Normal',fire:'Feu',water:'Eau',electric:'Électrik',grass:'Plante',ice:'Glace',fighting:'Combat',poison:'Poison',ground:'Sol',flying:'Vol',psychic:'Psy',bug:'Insecte',rock:'Roche',ghost:'Spectre',dragon:'Dragon',dark:'Ténèbres',steel:'Acier',fairy:'Fée' };

let allPokemon = [];
let displayedPokemon = [];
let batchSize = 60;
let currentBatch = 0;
const CACHE_KEY = 'pokedex-cache-v1';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

const $grid = document.getElementById('poke-grid');
const $loader = document.getElementById('loader');
const $loadMore = document.getElementById('btn-loadmore');
const $search = document.getElementById('search');
const $typeFilter = document.getElementById('type-filter');
const $genFilter = document.getElementById('gen-filter');
const $sortFilter = document.getElementById('sort-filter');
const $resultCount = document.getElementById('result-count');
const $overlay = document.getElementById('modal-overlay');

/* ── Init ── */
async function init() {
  $search.addEventListener('input', filterAndRender);
  $typeFilter.addEventListener('change', filterAndRender);
  $genFilter.addEventListener('change', filterAndRender);
  $sortFilter.addEventListener('change', filterAndRender);
  $loadMore.addEventListener('click', loadMore);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  $overlay.addEventListener('click', e => { if (e.target === $overlay) closeModal(); });

  // Populate type filter
  const typesRes = await fetch(`${API}/type`);
  const typesData = await typesRes.json();
  typesData.results.forEach(t => {
    if (['unknown','shadow'].includes(t.name)) return;
    const opt = document.createElement('option');
    opt.value = t.name;
    opt.textContent = TYPES_FR[t.name] || t.name;
    $typeFilter.appendChild(opt);
  });

  await loadAllPokemon();
}

async function loadAllPokemon() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && cached.savedAt && Date.now() - cached.savedAt < CACHE_TTL && Array.isArray(cached.data)) {
      allPokemon = cached.data;
      $loader.style.display = 'none';
      filterAndRender();
      return;
    }

    const res = await fetch(`${API}/pokemon?limit=1025`);
    const data = await res.json();
    // Limit concurrent requests to keep the API usable and cache the result.
    for (let i = 0; i < data.results.length; i += 50) {
      await loadBatch(data.results.slice(i, i + 50));
    }
    allPokemon.sort((a, b) => a.id - b.id);
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data: allPokemon }));
    $loader.style.display = 'none';
    filterAndRender();
  } catch (e) {
    $loader.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Erreur de chargement. Vérifiez votre connexion.';
  }
}

async function loadBatch(entries) {
  const proms = entries.map(async e => {
    try {
      const res = await fetch(e.url);
      const p = await res.json();
      allPokemon.push({
        id: p.id,
        name: p.name,
        types: p.types.map(t => t.type.name),
        stats: p.stats.reduce((o, s) => { o[s.stat.name] = s.base_stat; return o; }, {}),
        height: p.height,
        weight: p.weight,
        abilities: p.abilities.map(a => a.ability.name),
        species_url: p.species.url
      });
    } catch {}
  });
  await Promise.all(proms);
}

/* ── Filter & Sort ── */
function filterAndRender() {
  let list = [...allPokemon];
  const q = $search.value.toLowerCase().trim();
  const type = $typeFilter.value;
  const gen = $genFilter.value;
  const sort = $sortFilter.value;

  if (q) list = list.filter(p => p.name.includes(q) || String(p.id) === q);
  if (type) list = list.filter(p => p.types.includes(type));
  if (gen) {
    const [lo, hi] = GEN_RANGES[gen];
    list = list.filter(p => p.id >= lo && p.id <= hi);
  }

  if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'hp') list.sort((a, b) => (b.stats.hp || 0) - (a.stats.hp || 0));
  else if (sort === 'attack') list.sort((a, b) => (b.stats.attack || 0) - (a.stats.attack || 0));
  else if (sort === 'speed') list.sort((a, b) => (b.stats.speed || 0) - (a.stats.speed || 0));
  else list.sort((a, b) => a.id - b.id);

  displayedPokemon = list;
  currentBatch = 0;
  $resultCount.textContent = `${list.length} Pokémon trouvé${list.length > 1 ? 's' : ''}`;
  renderGrid();
}

function renderGrid() {
  const end = (currentBatch + 1) * batchSize;
  const slice = displayedPokemon.slice(0, end);
  $grid.innerHTML = '';

  slice.forEach(p => {
    const card = document.createElement('div');
    card.className = 'poke-card';
    card.innerHTML = `
      <span class="poke-id">#${String(p.id).padStart(4,'0')}</span>
      <img src="${SPRITE(p.id)}" alt="${p.name}" loading="lazy" />
      <div class="poke-name">${p.name}</div>
      <div class="poke-types">${p.types.map(t => `<span class="type-badge type-${t}">${TYPES_FR[t] || t}</span>`).join('')}</div>
    `;
    card.addEventListener('click', () => openModal(p));
    $grid.appendChild(card);
  });

  $loadMore.style.display = end < displayedPokemon.length ? 'block' : 'none';
}

function loadMore() {
  currentBatch++;
  renderGrid();
}

/* ── Modal ── */
async function openModal(p) {
  const $body = document.getElementById('modal-body');
  const totalStats = Object.values(p.stats).reduce((s, v) => s + v, 0);

  let evoHTML = '';
  try {
    const specRes = await fetch(p.species_url);
    const specData = await specRes.json();
    const evoRes = await fetch(specData.evolution_chain.url);
    const evoData = await evoRes.json();
    const chain = [];
    let node = evoData.chain;
    while (node) {
      const name = node.species.name;
      const idMatch = node.species.url.match(/\/(\d+)\//);
      const id = idMatch ? idMatch[1] : 0;
      chain.push({ name, id });
      node = node.evolves_to?.[0] || null;
    }
    if (chain.length > 1) {
      evoHTML = `<div class="detail-section"><h4>Évolutions</h4><div class="evo-chain">
        ${chain.map((e, i) => `${i > 0 ? '<span class="evo-arrow"><i class="fas fa-arrow-right"></i></span>' : ''}
        <div class="evo-item" onclick="loadPokeInModal(${e.id})">
          <img src="${SPRITE(e.id)}" alt="${e.name}" />
          <span>${e.name}</span>
        </div>`).join('')}
      </div></div>`;
    }
  } catch {}

  $body.innerHTML = `
    <div class="modal-header">
      <img src="${SPRITE(p.id)}" alt="${p.name}" />
      <span class="modal-id">#${String(p.id).padStart(4,'0')}</span>
      <h2>${p.name}</h2>
      <div class="poke-types">${p.types.map(t => `<span class="type-badge type-${t}">${TYPES_FR[t] || t}</span>`).join('')}</div>
    </div>
    <div class="stat-grid">
      ${Object.entries(p.stats).map(([k, v]) => `
        <div class="stat-row">
          <span class="stat-name">${STAT_LABELS[k] || k}</span>
          <span class="stat-val">${v}</span>
          <div class="stat-bar-bg"><div class="stat-bar" style="width:${Math.min(v / 255 * 100, 100)}%; background:${STAT_COLORS[k] || '#888'}"></div></div>
        </div>
      `).join('')}
      <div class="stat-row">
        <span class="stat-name" style="font-weight:600">Total</span>
        <span class="stat-val" style="font-weight:700">${totalStats}</span>
        <div class="stat-bar-bg"><div class="stat-bar" style="width:${Math.min(totalStats / 720 * 100, 100)}%; background:linear-gradient(90deg,#ef4444,#f59e0b,#22c55e)"></div></div>
      </div>
    </div>
    <div class="detail-section">
      <h4>Informations</h4>
      <div class="detail-row"><span class="label">Taille</span><span>${(p.height / 10).toFixed(1)} m</span></div>
      <div class="detail-row"><span class="label">Poids</span><span>${(p.weight / 10).toFixed(1)} kg</span></div>
      <div class="detail-row"><span class="label">Talents</span><span>${p.abilities.map(a => a.replace('-',' ')).join(', ')}</span></div>
    </div>
    ${evoHTML}
  `;
  $overlay.classList.add('open');
}

function loadPokeInModal(id) {
  const p = allPokemon.find(pk => pk.id === Number(id));
  if (p) openModal(p);
}

function closeModal() {
  $overlay.classList.remove('open');
}

init();

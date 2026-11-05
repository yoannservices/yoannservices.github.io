'use strict';

/* ── Tier config ── */
const TIERS = [
  { id: 'S', label: 'S', color: '#ff6b6b' },
  { id: 'A', label: 'A', color: '#ff9f43' },
  { id: 'B', label: 'B', color: '#ffd32a' },
  { id: 'C', label: 'C', color: '#a3cb38' },
  { id: 'D', label: 'D', color: '#1289a7' },
  { id: 'F', label: 'F', color: '#7d8590' },
];

/* ── Default items ── */
const DEFAULT_ITEMS = [
  'Pizza','Burger','Sushi','Tacos','Ramen','Pasta','Sashimi','Kebab',
  'Salade','Curry','Frites','Sandwich','Crêpe','Lasagne','Pho',
];

const LS_KEY = 'tier-list-v1';

/* ── State ── */
let state = {
  tiers: Object.fromEntries(TIERS.map(t => [t.id, []])),
  pool:  [],
  nextId: 0,
};

/* ── Init ── */
const saved = localStorage.getItem(LS_KEY);
if (saved) {
  try { state = JSON.parse(saved); } catch (_) { buildDefault(); }
} else { buildDefault(); }

function buildDefault() {
  state.pool  = DEFAULT_ITEMS.map((name, i) => ({ id: i, name, img: null }));
  state.nextId = DEFAULT_ITEMS.length;
  state.tiers = Object.fromEntries(TIERS.map(t => [t.id, []]));
}

/* ── Drag state ── */
let dragItem = null;  // { id }
let dragFrom = null;  // 'pool' | tier id

/* ── Render ── */
const tierArea   = document.getElementById('tier-list-area');
const poolArea   = document.getElementById('item-pool');
let ctxMenu      = null;
let renameTarget = null;

function save() {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

function render() {
  renderTiers();
  renderPool();
}

function renderTiers() {
  tierArea.innerHTML = '';
  TIERS.forEach(tier => {
    const row = document.createElement('div');
    row.className = 'tier-row';

    const lbl = document.createElement('div');
    lbl.className = 'tier-label';
    lbl.textContent = tier.label;
    lbl.style.background = tier.color + '33';
    lbl.style.color = tier.color;

    const items = document.createElement('div');
    items.className = 'tier-items';
    items.dataset.tier = tier.id;
    setupDropZone(items, tier.id);

    (state.tiers[tier.id] || []).forEach(item => {
      items.appendChild(makeItemEl(item));
    });

    row.appendChild(lbl);
    row.appendChild(items);
    tierArea.appendChild(row);
  });
}

function renderPool() {
  poolArea.innerHTML = '';
  setupDropZone(poolArea, 'pool');
  state.pool.forEach(item => poolArea.appendChild(makeItemEl(item)));
}

function makeItemEl(item) {
  const el = document.createElement('div');
  el.className = 'tier-item';
  el.draggable = true;
  el.dataset.id = item.id;

  if (item.img) {
    const img = document.createElement('img');
    img.src = item.img;
    img.alt = item.name;
    el.appendChild(img);
    const lbl = document.createElement('div');
    lbl.className = 'tier-item-label';
    lbl.textContent = item.name;
    el.appendChild(lbl);
  } else {
    const lbl = document.createElement('div');
    lbl.className = 'tier-item-label only-text';
    lbl.textContent = item.name;
    el.appendChild(lbl);
    el.style.background = stringToColor(item.name);
  }

  el.addEventListener('dragstart', e => {
    dragItem = item;
    dragFrom = el.closest('.tier-items') ? el.closest('.tier-items').dataset.tier : 'pool';
    el.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });
  el.addEventListener('dragend', () => el.classList.remove('dragging'));

  el.addEventListener('contextmenu', e => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, item);
  });

  return el;
}

/* ── Drop zones ── */
function setupDropZone(zone, zoneId) {
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', e => { if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-over'); });
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    if (!dragItem) return;
    moveItem(dragItem.id, dragFrom, zoneId);
  });
}

/* ── Move item between zones ── */
function moveItem(id, from, to) {
  if (from === to) return;

  // Remove from source
  if (from === 'pool') {
    state.pool = state.pool.filter(i => i.id !== id);
  } else if (state.tiers[from]) {
    state.tiers[from] = state.tiers[from].filter(i => i.id !== id);
  }

  // Get item ref
  const allItems = [...state.pool, ...Object.values(state.tiers).flat()];
  // We need the item from "from" before removing — store in dragItem already
  const item = dragItem;

  // Add to destination
  if (to === 'pool') {
    state.pool.push(item);
  } else if (state.tiers[to] !== undefined) {
    state.tiers[to].push(item);
  }

  save();
  render();
}

/* ── Context menu ── */
function showContextMenu(x, y, item) {
  closeCtxMenu();
  ctxMenu = document.createElement('div');
  ctxMenu.className = 'item-ctx-menu';

  const menuItems = [
    { icon: 'fas fa-pen', label: 'Renommer', action: () => { closeCtxMenu(); openRename(item); } },
    { icon: 'fas fa-arrow-down', label: 'Renvoyer au pool', action: () => { closeCtxMenu(); sendToPool(item); } },
    { icon: 'fas fa-trash', label: 'Supprimer', action: () => { closeCtxMenu(); deleteItem(item); }, danger: true },
  ];

  menuItems.forEach(m => {
    const div = document.createElement('div');
    div.className = 'ctx-item' + (m.danger ? ' danger' : '');
    div.innerHTML = `<i class="${m.icon}"></i> ${m.label}`;
    div.addEventListener('click', m.action);
    ctxMenu.appendChild(div);
  });

  ctxMenu.style.top  = Math.min(y, window.innerHeight - 120) + 'px';
  ctxMenu.style.left = Math.min(x, window.innerWidth  - 160) + 'px';
  document.body.appendChild(ctxMenu);
  document.addEventListener('click', closeCtxMenu, { once: true });
}

function closeCtxMenu() {
  if (ctxMenu) { ctxMenu.remove(); ctxMenu = null; }
}

function sendToPool(item) {
  TIERS.forEach(t => { state.tiers[t.id] = state.tiers[t.id].filter(i => i.id !== item.id); });
  if (!state.pool.find(i => i.id === item.id)) state.pool.push(item);
  save(); render();
}

function deleteItem(item) {
  state.pool = state.pool.filter(i => i.id !== item.id);
  TIERS.forEach(t => { state.tiers[t.id] = state.tiers[t.id].filter(i => i.id !== item.id); });
  save(); render();
}

/* ── Rename ── */
const renameModal = document.getElementById('rename-modal');
const renameInput = document.getElementById('rename-input');

function openRename(item) {
  renameTarget = item;
  renameInput.value = item.name;
  renameModal.style.display = 'flex';
  renameInput.focus();
  renameInput.select();
}

document.getElementById('rename-cancel').addEventListener('click', () => { renameModal.style.display = 'none'; });
document.getElementById('rename-ok').addEventListener('click', () => {
  if (renameTarget && renameInput.value.trim()) {
    renameTarget.name = renameInput.value.trim();
    save(); render();
  }
  renameModal.style.display = 'none';
});
renameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('rename-ok').click();
  if (e.key === 'Escape') document.getElementById('rename-cancel').click();
});

/* ── Add new item ── */
document.getElementById('btn-add-item').addEventListener('click', addNewItem);
document.getElementById('new-item-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addNewItem();
});

function addNewItem() {
  const input = document.getElementById('new-item-input');
  const name  = input.value.trim();
  if (!name) return;
  state.pool.push({ id: state.nextId++, name, img: null });
  input.value = '';
  save(); render();
}

/* ── Image import ── */
document.getElementById('img-import').addEventListener('change', e => {
  const files = Array.from(e.target.files);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = ev => {
      const name = file.name.replace(/\.[^.]+$/, '');
      state.pool.push({ id: state.nextId++, name, img: ev.target.result });
      save(); render();
    };
    reader.readAsDataURL(file);
  });
  e.target.value = '';
});

/* ── Reset ── */
document.getElementById('btn-reset').addEventListener('click', () => {
  if (!confirm('Remettre tous les éléments au pool ?')) return;
  const all = [...state.pool, ...Object.values(state.tiers).flat()];
  state.pool  = all;
  state.tiers = Object.fromEntries(TIERS.map(t => [t.id, []]));
  save(); render();
});

/* ── Export PNG (html2canvas via CDN) ── */
document.getElementById('btn-export').addEventListener('click', async () => {
  // Load html2canvas if not loaded
  if (typeof html2canvas === 'undefined') {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
  }
  const el = document.getElementById('tier-list-area');
  const canvas = await html2canvas(el, { backgroundColor: '#0f1117', scale: 2 });
  const a = document.createElement('a');
  a.download = 'tier-list.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
});

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

/* ── Helpers ── */
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 45%, 30%)`;
}

/* ── Start ── */
render();

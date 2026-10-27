import { DISC } from '../core/config.js';

// Roue de sélection de la discipline (façon roue des armes de GTA V, comme dans Monde Ouvert).
// Maintenir Tab : la roue s'ouvre et le temps ralentit. Survoler un secteur, relâcher Tab (ou cliquer) pour choisir.
const ICONS = {
  snowboard: '<rect x="27" y="4" width="10" height="56" rx="5" transform="rotate(24 32 32)"/><circle cx="26" cy="25" r="3.2" fill="#0f0f13"/><circle cx="38" cy="39" r="3.2" fill="#0f0f13"/>',
  ski: '<rect x="20" y="4" width="6" height="56" rx="3" transform="rotate(12 32 32)"/><rect x="38" y="4" width="6" height="56" rx="3" transform="rotate(12 32 32)"/><path d="M12 18l4 36M52 18l-4 36" stroke="currentColor" stroke-width="2.5" fill="none"/>',
  wingsuit: '<path d="M32 6l5 13 23 15-23-5-3 22-2-22-23 5 23-15z"/><circle cx="32" cy="14" r="4" fill="#0f0f13"/>',
};
const ORDER = ['snowboard', 'ski', 'wingsuit'];
const DESC = {
  snowboard: 'Carves, dérapages, ollies, rails',
  ski: 'Virages nerveux, bâtons, tricks propres',
  wingsuit: 'Vol plané depuis une falaise, vol rasant',
};

export function createWheel(onPick, gear) {
  const el = document.getElementById('wheel'), svg = el.querySelector('svg'), center = el.querySelector('.wcenter');
  const N = ORDER.length, segA = (Math.PI * 2) / N;
  let open = false, hover = -1, current = null, R_IN = 80, R_OUT = 200, cx = 0, cy = 0;

  function layout() {
    const s = Math.min(innerWidth, innerHeight);
    R_OUT = Math.max(150, Math.min(230, s * 0.27)); R_IN = R_OUT * 0.42;
    cx = innerWidth / 2; cy = innerHeight / 2;
    svg.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
    let h = '';
    ORDER.forEach((id, i) => {
      const a0 = -Math.PI / 2 - segA / 2 + i * segA + 0.03, a1 = a0 + segA - 0.06;
      const p = (r, a) => `${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r}`;
      h += `<path class="seg" data-i="${i}" style="--c:${DISC[id].col}" d="M${p(R_IN, a0)} L${p(R_OUT, a0)} A${R_OUT} ${R_OUT} 0 0 1 ${p(R_OUT, a1)} L${p(R_IN, a1)} A${R_IN} ${R_IN} 0 0 0 ${p(R_IN, a0)}Z"/>`;
      const am = (a0 + a1) / 2, rm = (R_IN + R_OUT) / 2, ix = cx + Math.cos(am) * rm, iy = cy + Math.sin(am) * rm, sc = R_OUT / 230;
      h += `<g class="ico" data-i="${i}" transform="translate(${ix - 28 * sc} ${iy - 36 * sc}) scale(${0.88 * sc})">${ICONS[id]}</g>`;
      h += `<text class="lbl" data-i="${i}" x="${ix}" y="${iy + 38 * sc}" text-anchor="middle">${DISC[id].label}</text>`;
    });
    svg.innerHTML = h;
  }
  function refresh() {
    svg.querySelectorAll('.seg,.ico,.lbl').forEach((n) => n.classList.toggle('on', +n.dataset.i === hover));
    svg.querySelectorAll('.seg').forEach((n) => n.classList.toggle('cur', ORDER[+n.dataset.i] === current));
    const id = ORDER[hover >= 0 ? hover : ORDER.indexOf(current)];
    center.innerHTML = id
      ? `<b>${DISC[id].label}</b><small>${DESC[id]}</small><small class="g">${gear(id)}</small>${current === id ? '<em>Discipline actuelle</em>' : ''}`
      : '<b>Disciplines</b>';
  }
  function aim(x, y) {
    if (!open) return;
    const dx = x - cx, dy = y - cy;
    if (Math.hypot(dx, dy) < R_IN * 0.5) return;
    let i = Math.round((Math.atan2(dy, dx) + Math.PI / 2) / segA);
    i = ((i % N) + N) % N;
    if (i !== hover) { hover = i; refresh(); }
  }
  function show() {
    if (open) return;
    open = true; layout(); el.classList.add('on');
    hover = ORDER.indexOf(current);
    refresh();
  }
  function close(confirm) {
    if (!open) return;
    open = false; el.classList.remove('on');
    if (confirm && hover >= 0 && ORDER[hover] !== current) onPick(ORDER[hover]);
  }
  addEventListener('pointermove', (e) => aim(e.clientX, e.clientY));
  addEventListener('resize', () => { if (open) { layout(); refresh(); } });
  el.addEventListener('click', (e) => { if (e.target.closest('.seg')) close(true); });
  return {
    show, close, get isOpen() { return open; },
    setCurrent(id) { current = id; },
    // manette : le stick pointe un secteur
    stick(sx, sy) { if (open && Math.hypot(sx, sy) > 0.5) aim(cx + sx * R_OUT, cy + sy * R_OUT); },
  };
}

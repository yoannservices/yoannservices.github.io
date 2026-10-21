/* Course auto : séances et classements (ESPN) + pour la F1, carte du circuit
   animée avec la position réelle des monoplaces (OpenF1). */
(() => {
'use strict';
const { espn, openf1, stateOf } = SL;
const { leagueOfPath } = SL;
const { t } = SL;
const { esc, loading, errorBox, logo, fmtDay, fmtTime, liveBadge, empty, tabs } = SL;

async function render(root, { path, id, tab, sport }) {
  const league = leagueOfPath(path);
  root.innerHTML = loading();
  let ev, sel = -1, live = false, map = null;

  async function load() {
    const params = tab && /^\d{8}$/.test(tab) ? { dates: tab } : {};
    const d = await espn.scoreboard(path, params, 0);
    ev = (d.events || []).find(e => String(e.id) === String(id)) || (d.events || [])[0];
    if (!ev) throw new Error(t('noData'));
  }
  try { await load(); } catch (e) { root.innerHTML = errorBox(e); return; }

  function draw() {
    const comps = ev.competitions || [];
    live = comps.some(c => c.status?.type?.state === 'in');
    if (sel < 0) { // séance en cours, sinon la dernière jouée
      sel = comps.findIndex(c => c.status?.type?.state === 'in');
      if (sel < 0) sel = Math.max(0, comps.map(c => c.status?.type?.state).lastIndexOf('post'));
    }
    const c = comps[sel];
    root.innerHTML = `
      <header class="page-h" style="--sc:${sport.color}">
        <button id="burger" class="burger" aria-label="Menu">☰</button>
        <a class="back" href="#/sport/${sport.id}">←</a><span class="page-ico">🏁</span>
        <div><h1>${esc(ev.name)}</h1><p>${esc(league.name)} · ${esc(ev.circuit?.fullName || ev.venue?.fullName || '')}</p></div>
      </header>
      ${tabs(comps.map((x, i) => [String(i), `${x.type?.abbreviation || i + 1}${x.status?.type?.state === 'in' ? ' ●' : ''}`]), String(sel))}
      <div class="race-grid racing">
        ${path === 'racing/f1' && c?.status?.type?.state !== 'pre' ? `<section class="card"><header><h2>🗺️ ${t('trackMap')}</h2><small class="muted">OpenF1</small></header><div id="track">${loading()}</div></section>` : ''}
        <section class="card"><header><h2>${esc(c?.type?.abbreviation || t('results'))}</h2>${liveBadge(c?.status?.type?.state, c?.status?.type?.state === 'pre' ? `${fmtDay(c.date, { weekday: 'short' })} ${fmtTime(c.date)}` : c?.status?.type?.shortDetail)}</header>
          ${classification(c)}</section>
      </div>`;
    root.querySelector('.tabs').addEventListener('click', e => {
      const b = e.target.closest('[data-tab]'); if (!b) return;
      sel = Number(b.dataset.tab); map?.destroy(); map = null; draw();
    });
    const tr = root.querySelector('#track');
    if (tr) { map?.destroy(); map = trackMap(tr, c); }
  }
  draw();
  return { refresh: async () => { await load(); if (!map) draw(); }, isLive: () => live, interval: 30000, destroy: () => map?.destroy() };
}

function classification(c) {
  const cs = [...(c?.competitors || [])].sort((a, b) => (a.order || 99) - (b.order || 99));
  if (!cs.length) return empty(t('noData'));
  return `<div class="table-wrap"><table class="table"><thead><tr><th>${t('pos')}</th><th class="l">${t('driver')}</th><th>${t('team')}</th></tr></thead><tbody>
    ${cs.map(x => `<tr class="${x.winner ? 'hl' : ''}"><td class="b">${x.order ?? ''}</td><td class="l">${logo(x.athlete?.flag?.href, '', 'flag-img')}${esc(x.athlete?.displayName)}</td><td class="muted">${esc(x.team?.displayName || x.vehicle?.manufacturer || '')}</td></tr>`).join('')}
  </tbody></table></div>`;
}

/* ── Carte animée OpenF1 ── */
function trackMap(el, comp) {
  let alive = true, raf = 0;
  const destroy = () => { alive = false; cancelAnimationFrame(raf); };
  (async () => {
    const d0 = new Date(comp.date);
    const iso = x => new Date(x).toISOString().slice(0, 19);
    const sessions = await openf1.get('sessions', { 'date_start>': iso(d0.getTime() - 4 * 3600e3), 'date_start<': iso(d0.getTime() + 4 * 3600e3) });
    const s = sessions[0];
    if (!s) { el.innerHTML = empty(t('noData')); return; }
    const drivers = await openf1.get('drivers', { session_key: s.session_key });
    const start = new Date(s.date_start).getTime(), end = new Date(s.date_end).getTime();
    // Tracé : un tour complet du premier pilote, 15 min après le départ
    const ref = drivers[0].driver_number;
    const lap = await openf1.get('location', { session_key: s.session_key, driver_number: ref, 'date>': iso(start + 15 * 60e3), 'date<': iso(start + 17.5 * 60e3) });
    const pts = lap.filter(p => p.x || p.y);
    if (pts.length < 20) { el.innerHTML = empty(t('noData')); return; }
    const positions = await openf1.get('position', { session_key: s.session_key }).catch(() => []);

    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    el.innerHTML = `<div class="f1">
      <canvas width="900" height="560"></canvas>
      <ol class="f1-board"></ol>
      <div class="f1-bar"><button class="btn sm" data-p>⏸</button>
        <select data-s>${[1, 2, 5, 10, 20].map(v => `<option ${v === 5 ? 'selected' : ''} value="${v}">×${v}</option>`).join('')}</select>
        <input type="range" min="0" max="1000" value="0" data-r aria-label="time"><span class="mono" data-c></span></div>
      <p class="note">ℹ️ ${t('f1Replay')} — ${esc(s.session_name)} ${esc(s.location || '')}</p></div>`;
    const cv = el.querySelector('canvas'), g = cv.getContext('2d');
    const board = el.querySelector('.f1-board'), clock = el.querySelector('[data-c]'), range = el.querySelector('[data-r]');
    const pad = 30, sc = Math.min((cv.width - 2 * pad) / (maxX - minX), (cv.height - 2 * pad) / (maxY - minY));
    const ox = (cv.width - (maxX - minX) * sc) / 2, oy = (cv.height - (maxY - minY) * sc) / 2;
    const P = (x, y) => [ox + (x - minX) * sc, cv.height - (oy + (y - minY) * sc)];
    const info = new Map(drivers.map(d => [d.driver_number, d]));

    // Positions des voitures : chargement par tranches de 20 s
    const CH = 20e3; const chunks = new Map();
    const loadChunk = k => {
      if (chunks.has(k)) return chunks.get(k);
      const p = openf1.get('location', { session_key: s.session_key, 'date>': iso(start + k * CH), 'date<': iso(start + (k + 1) * CH) })
        .then(rows => { const m = new Map(); rows.forEach(r => { const tt = new Date(r.date).getTime(); if (!m.has(r.driver_number)) m.set(r.driver_number, []); m.get(r.driver_number).push([tt, r.x, r.y]); }); return m; })
        .catch(() => { chunks.delete(k); return null; }); // nouvel essai plus tard
      chunks.set(k, p);
      p.then(v => { p.value = v; });
      return p;
    };
    let time = start + 5 * 60e3, speed = 5, playing = true, last = performance.now();
    el.querySelector('[data-p]').onclick = e => { playing = !playing; e.target.textContent = playing ? '⏸' : '▶'; };
    el.querySelector('[data-s]').onchange = e => { speed = Number(e.target.value); };
    range.oninput = () => { time = start + (range.value / 1000) * (end - start); };

    const posAt = (num, tt) => {
      let p = null;
      for (const r of positions) { if (r.driver_number !== num) continue; if (new Date(r.date).getTime() <= tt) p = r.position; else break; }
      return p;
    };
    let boardT = 0;
    function frame(now) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      if (playing) time += (now - last) * speed;
      last = now;
      if (time > end) time = end;
      const k = Math.floor((time - start) / CH);
      loadChunk(k + 1);
      const m = loadChunk(k).value;
      g.clearRect(0, 0, cv.width, cv.height);
      g.lineWidth = 14; g.strokeStyle = '#2b3448'; g.lineJoin = 'round';
      g.beginPath(); pts.forEach((p, i) => { const [x, y] = P(p.x, p.y); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
      g.lineWidth = 2; g.strokeStyle = '#56607a'; g.stroke();
      if (m) {
        for (const [num, arr] of m) {
          let i = arr.findIndex(r => r[0] > time); if (i <= 0) i = i < 0 ? arr.length - 1 : 1;
          const a = arr[i - 1] || arr[0], b = arr[i] || a;
          const f = b[0] > a[0] ? Math.min(1, Math.max(0, (time - a[0]) / (b[0] - a[0]))) : 0;
          if (!a[1] && !a[2]) continue;
          const [x, y] = P(a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f);
          const d = info.get(num);
          g.fillStyle = '#' + (d?.team_colour || 'ffffff');
          g.beginPath(); g.arc(x, y, 7, 0, Math.PI * 2); g.fill();
          g.strokeStyle = '#000'; g.lineWidth = 1.5; g.stroke();
          g.fillStyle = '#fff'; g.font = '600 13px Inter, sans-serif'; g.fillText(d?.name_acronym || num, x + 9, y - 8);
        }
      }
      const el2 = Math.max(0, time - start);
      clock.textContent = `${String(Math.floor(el2 / 3600e3)).padStart(1, '0')}:${String(Math.floor(el2 / 60e3) % 60).padStart(2, '0')}:${String(Math.floor(el2 / 1e3) % 60).padStart(2, '0')}`;
      if (document.activeElement !== range) range.value = Math.round(((time - start) / (end - start)) * 1000);
      if (now - boardT > 1000 && positions.length) {
        boardT = now;
        const rows = drivers.map(d => ({ d, p: posAt(d.driver_number, time) })).filter(r => r.p).sort((a, b) => a.p - b.p);
        board.innerHTML = rows.map(r => `<li><b>${r.p}</b><i style="background:#${r.d.team_colour}"></i>${esc(r.d.name_acronym)}<small>${esc(r.d.team_name || '')}</small></li>`).join('');
      }
    }
    raf = requestAnimationFrame(frame);
  })().catch(e => { if (alive) el.innerHTML = errorBox(e, false); });
  return { destroy };
}

SL.views['racing'] = { render };
})();

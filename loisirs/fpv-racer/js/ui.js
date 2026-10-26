'use strict';
/* Menu : onglets, réglages liés à Settings, mapping manette avec apprentissage, courbe des rates. */

const UI = (() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const S = () => Settings.get();
  const menu = $('#menu');
  let onStart = () => {}, onChange = () => {};
  const CH = [['thr', 'Gaz'], ['yaw', 'Lacet'], ['pitch', 'Tangage'], ['roll', 'Roulis'], ['arm', 'Armement'], ['reset', 'Reset']];

  function save() { Settings.save(); onChange(); }

  // ── Onglets ──
  $$('.tab').forEach(t => t.addEventListener('click', () => {
    $$('.tab').forEach(x => x.classList.toggle('on', x === t));
    $$('.pane').forEach(p => p.classList.toggle('on', p.dataset.pane === t.dataset.tab));
    if (t.dataset.tab === 'rates') drawRates();
  }));

  // ── Mode & drone ──
  function refreshCards() {
    $$('#modeCards .card').forEach(c => c.classList.toggle('on', c.dataset.mode === S().mode));
    $$('#quadCards .card').forEach(c => c.classList.toggle('on', c.dataset.quad === S().quad));
    $$('#fmodeSeg button').forEach(b => b.classList.toggle('on', b.dataset.v === S().flightMode));
  }
  $$('#modeCards .card').forEach(c => c.addEventListener('click', () => { S().mode = c.dataset.mode; refreshCards(); save(); }));
  $('#quadCards').innerHTML = Object.entries(QUADS).map(([k, q]) => `<button class="card" data-quad="${k}"><b>${q.name}</b><span class="spec">${q.spec}</span></button>`).join('');
  $$('#quadCards .card').forEach(c => c.addEventListener('click', () => { S().quad = c.dataset.quad; refreshCards(); save(); }));
  $$('#fmodeSeg button').forEach(b => b.addEventListener('click', () => { S().flightMode = b.dataset.v; refreshCards(); save(); }));
  $('#goBtn').addEventListener('click', () => onStart());
  $('#pauseBtn').addEventListener('click', () => open());

  // ── Champs simples ──
  const fmt = {
    deadband: v => Math.round(v * 100) + ' %', kbSens: v => Math.round(v * 100) + ' %', thrExpo: v => v.toFixed(2), thrLimit: v => Math.round(v * 100) + ' %',
    angleMax: v => v + '°', uptilt: v => v + '°', fov: v => v + '°', wind: v => v + ' m/s', propwash: v => Math.round(v * 100) + ' %', vib: v => Math.round(v * 100) + ' %',
    distort: v => v.toFixed(2), scale: v => Math.round(v * 100) + ' %', volume: v => Math.round(v * 100) + ' %',
  };
  const outs = { deadband: 'dbOut', kbSens: 'kbOut', thrExpo: 'teOut', thrLimit: 'tlOut', angleMax: 'amOut', uptilt: 'upOut', fov: 'fovOut', wind: 'windOut', propwash: 'pwOut', vib: 'vibOut', distort: 'disOut', scale: 'scOut', volume: 'volOut' };
  Object.keys(outs).forEach(k => {
    const el = document.getElementById(k);
    el.value = S()[k];
    const upd = () => { document.getElementById(outs[k]).textContent = fmt[k](+el.value); };
    upd();
    el.addEventListener('input', () => { S()[k] = +el.value; upd(); save(); });
  });
  const selects = { crash: 'crash', battery: 'battery', video: 'video', airmode: 'airmode', signalLoss: 'signalLoss', shadows: 'shadows', osdOn: 'osd', touchMode: 'touch' };
  Object.entries(selects).forEach(([id, k]) => {
    const el = document.getElementById(id);
    el.value = String(S()[k]);
    el.addEventListener('change', () => { const v = el.value; S()[k] = /^\d+$/.test(v) ? +v : v; save(); });
  });

  // ── Rates ──
  const rp = $('#ratePreset');
  rp.value = S().ratePreset;
  rp.addEventListener('change', () => {
    S().ratePreset = rp.value;
    if (RATE_PRESETS[rp.value]) S().rates = Settings.clone(RATE_PRESETS[rp.value]);
    buildRateGrid(); drawRates(); save();
  });
  function buildRateGrid() {
    const g = $('#rateGrid');
    g.innerHTML = '<span class="h">Axe</span><span class="h">RC rate</span><span class="h">Super rate</span><span class="h">Expo</span><span class="h" style="text-align:right">Max</span>' +
      [['roll', 'Roulis'], ['pitch', 'Tangage'], ['yaw', 'Lacet']].map(([a, n]) =>
        `<span class="ax">${n}</span>` + ['rc', 'sr', 'ex'].map(f => `<input type="number" step="0.01" min="0" max="${f === 'rc' ? 2.55 : f === 'sr' ? 0.95 : 1}" data-a="${a}" data-f="${f}" value="${S().rates[a][f]}">`).join('') +
        `<span class="max" data-max="${a}"></span>`).join('');
    g.querySelectorAll('input').forEach(inp => inp.addEventListener('input', () => {
      const v = Math.max(0, Math.min(+inp.max, +inp.value || 0));
      S().rates[inp.dataset.a][inp.dataset.f] = v;
      S().ratePreset = 'custom'; rp.value = 'custom';
      drawRates(); save();
    }));
  }
  function drawRates() {
    const c = $('#rateCurve'), g = c.getContext('2d'), W = c.width, H = c.height, pad = 30;
    g.clearRect(0, 0, W, H);
    const top = 1800;
    g.strokeStyle = 'rgba(255,255,255,.07)'; g.fillStyle = '#8892a4'; g.font = '11px JetBrains Mono, monospace';
    for (let v = 0; v <= top; v += 300) { const y = H - pad - (v / top) * (H - pad * 1.5); g.beginPath(); g.moveTo(pad, y); g.lineTo(W - 8, y); g.stroke(); g.fillText(v, 2, y + 4); }
    const cols = { roll: '#4ade80', pitch: '#60a5fa', yaw: '#f59e0b' };
    for (const a of ['roll', 'pitch', 'yaw']) {
      g.strokeStyle = cols[a]; g.lineWidth = 2; g.beginPath();
      for (let i = 0; i <= 100; i++) { const x = pad + (i / 100) * (W - pad - 8), y = H - pad - (bfRate(i / 100, S().rates[a]) / top) * (H - pad * 1.5); i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
      const el = document.querySelector(`[data-max="${a}"]`); if (el) el.textContent = Math.round(bfRate(1, S().rates[a])) + '°/s';
    }
    g.fillStyle = '#8892a4'; g.fillText('stick →', W - 64, H - 8);
  }
  buildRateGrid();

  // ── Manette ──
  const pp = $('#padPreset');
  pp.value = S().padPreset;
  pp.addEventListener('change', () => { S().padPreset = pp.value; S().map = Settings.clone(PAD_PRESETS[pp.value]); buildChannels(); save(); });
  function buildChannels() {
    const m = S().map;
    $('#chanTable').innerHTML = CH.map(([k, n]) => {
      const c = m[k] || {};
      const isSw = k === 'arm' || k === 'reset';
      const idx = isSw ? c.idx : c.axis;
      const kindSel = isSw ? `<select data-kind="${k}"><option value="axis"${c.kind === 'axis' ? ' selected' : ''}>Axe</option><option value="button"${c.kind === 'button' ? ' selected' : ''}>Bouton</option></select>` : '';
      return `<div class="chan" data-ch="${k}"><b>${n}</b><div class="bar"><i></i></div>
        <label>${kindSel}<select data-idx="${k}">${[-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => `<option value="${i}"${i === idx ? ' selected' : ''}>${i < 0 ? '—' : (isSw && c.kind === 'button' ? 'Btn ' : 'Axe ') + i}</option>`).join('')}</select></label>
        <label><input type="checkbox" data-inv="${k}"${c.inv ? ' checked' : ''}> inv.</label>
        <button class="btn" data-learn="${k}">Apprendre</button></div>`;
    }).join('');
    $$('#chanTable [data-idx]').forEach(el => el.addEventListener('change', () => {
      const k = el.dataset.idx, c = S().map[k];
      if (k === 'arm' || k === 'reset') c.idx = +el.value; else c.axis = +el.value;
      save();
    }));
    $$('#chanTable [data-kind]').forEach(el => el.addEventListener('change', () => { S().map[el.dataset.kind].kind = el.value; buildChannels(); save(); }));
    $$('#chanTable [data-inv]').forEach(el => el.addEventListener('change', () => { S().map[el.dataset.inv].inv = el.checked; save(); }));
    $$('#chanTable [data-learn]').forEach(el => el.addEventListener('click', () => {
      const k = el.dataset.learn;
      el.classList.add('learn'); el.textContent = k === 'thr' ? 'Gaz en haut…' : k === 'arm' || k === 'reset' ? 'Bascule…' : k === 'pitch' ? 'Vers l\'avant…' : 'Vers la droite…';
      Input.learn(k, (ok, msg) => { el.classList.remove('learn'); el.textContent = ok ? '✓ ' + msg : msg; save(); setTimeout(buildChannels, 900); });
    }));
  }
  buildChannels();
  let calOn = false;
  $('#calBtn').addEventListener('click', () => {
    calOn = !calOn; Input.calibrate(calOn);
    $('#calBtn').classList.toggle('on', calOn);
    $('#calBtn').textContent = calOn ? 'Terminer le calibrage' : 'Calibrer les axes';
    if (!calOn) save();
  });

  // Barres en direct (axes bruts) + état de la manette
  function live() {
    if (!menu.hidden) {
      const pad = Input.pad();
      const st = $('#padStatus');
      st.textContent = pad ? '🎮 ' + pad.id.replace(/\s*\(.*\)\s*/g, ' ').trim().slice(0, 48) : 'Aucune manette · clavier';
      st.classList.toggle('on', !!pad);
      if (pad) {
        const m = S().map;
        $$('#chanTable .chan').forEach(row => {
          const k = row.dataset.ch, c = m[k];
          let v = 0;
          if (k === 'arm' || k === 'reset') {
            if (c.kind === 'button') v = c.idx >= 0 && pad.buttons[c.idx] && pad.buttons[c.idx].pressed ? 1 : -1;
            else v = c.idx >= 0 ? (pad.axes[c.idx] || 0) * (c.inv ? -1 : 1) : -1;
          } else v = Input.rawAxis(c.axis) * (c.inv ? -1 : 1);
          const i = row.querySelector('.bar i');
          if (k === 'thr') { i.style.left = '0'; i.style.width = ((v + 1) * 50) + '%'; }
          else { i.style.left = (v < 0 ? 50 + v * 50 : 50) + '%'; i.style.width = Math.abs(v) * 50 + '%'; }
        });
      }
      $('#goHint').textContent = pad ? 'Radio détectée : arme avec ton interrupteur (gaz en bas).' : 'Au clavier : Espace pour armer, Z pour monter les gaz.';
    }
    requestAnimationFrame(live);
  }
  requestAnimationFrame(live);

  function open() { menu.hidden = false; refreshCards(); document.body.classList.add('paused'); }
  function close() { menu.hidden = true; Input.cancelLearn(); if (calOn) $('#calBtn').click(); document.body.classList.remove('paused'); }

  refreshCards();
  return {
    init(o) { onStart = o.onStart; onChange = o.onChange || onChange; },
    open, close,
    get isOpen() { return !menu.hidden; },
  };
})();

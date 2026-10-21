/* Lecteur 3D : terrain + contrôles (lecture, vitesse, frise, caméras, direct). */
(() => {
'use strict';
const { t } = SL;
const { esc } = SL;

const fmt = s => { s = Math.max(0, Math.floor(s)); return `${Math.floor(s / 60)}'${String(s % 60).padStart(2, '0')}`; };

/** el : conteneur ; director : EspnDirector | StatsBombDirector ; names : [domicile, extérieur] */
async function mountViewer(el, director, names) {
  const Pitch3D = await SL.loadPitch3D();
  el.innerHTML = `
    <div class="v3d">
      <div class="v3d-stage">
        <div class="v3d-hud">
          <div class="v3d-score"><span class="sw" style="background:${director.teams[0].color}"></span><b>${esc(names[0])}</b>
            <strong class="v3d-sc">0 - 0</strong><b>${esc(names[1])}</b><span class="sw" style="background:${director.teams[1].color}"></span></div>
          <div class="v3d-clock">0'00</div>
        </div>
        <div class="v3d-event" hidden></div>
        <button class="v3d-full" title="${t('fullscreen')}">⛶</button>
      </div>
      <div class="v3d-bar">
        <button class="btn v3d-play" aria-label="${t('play')}">⏸</button>
        <select class="v3d-speed" aria-label="${t('speed')}">
          ${[1, 2, 4, 8, 16, 32].map(s => `<option value="${s}" ${s === 4 ? 'selected' : ''}>×${s}</option>`).join('')}
        </select>
        <div class="v3d-tl"><input type="range" min="0" max="1000" value="0" class="v3d-range" aria-label="${t('minute')}"><div class="v3d-marks"></div></div>
        <button class="btn v3d-live" ${director.live ? '' : 'hidden'}>● ${t('live')}</button>
        <div class="v3d-cams seg">
          ${['tv', 'top', 'goal', 'follow', 'free'].map(c => `<button data-cam="${c}" class="${c === 'tv' ? 'on' : ''}">${t('cam' + c[0].toUpperCase() + c.slice(1))}</button>`).join('')}
        </div>
      </div>
    </div>`;
  const stage = el.querySelector('.v3d-stage');
  const pitch = new Pitch3D(stage);
  pitch.setTeams(director.teams);

  const $ = s => el.querySelector(s);
  const range = $('.v3d-range'), clockEl = $('.v3d-clock'), scoreEl = $('.v3d-sc'), evEl = $('.v3d-event');
  let playing = true, speed = 4, time = director.live ? Math.max(0, director.duration - 40) : 0, follow = director.live;
  let lastEv = null, evTimer = 0;

  function marks() {
    $('.v3d-marks').innerHTML = director.events.filter(e => e.score || e.kind === 'card' || /card/.test(e.type || ''))
      .map(e => `<i class="${e.score ? 'g' : 'c'}" style="left:${(e.t / director.duration) * 100}%" title="${esc(e.clock + ' ' + e.short)}"></i>`).join('');
  }
  marks();

  $('.v3d-play').onclick = () => { playing = !playing; $('.v3d-play').textContent = playing ? '⏸' : '▶'; };
  $('.v3d-speed').onchange = e => { speed = Number(e.target.value); };
  range.oninput = () => { time = (range.value / 1000) * director.duration; follow = false; snap = true; };
  $('.v3d-live').onclick = () => { follow = true; time = Math.max(0, director.duration - 40); speed = 1; $('.v3d-speed').value = '1'; snap = true; };
  el.querySelectorAll('[data-cam]').forEach(b => b.onclick = () => setCam(b.dataset.cam));
  function setCam(c) {
    pitch.setCamera(c);
    el.querySelectorAll('[data-cam]').forEach(x => x.classList.toggle('on', x.dataset.cam === c));
  }
  pitch.onCamChange = c => el.querySelectorAll('[data-cam]').forEach(x => x.classList.toggle('on', x.dataset.cam === c));
  $('.v3d-full').onclick = () => {
    const box = el.querySelector('.v3d');
    if (document.fullscreenElement) document.exitFullscreen(); else box.requestFullscreen?.();
  };

  let snap = true, last = performance.now(), alive = true;
  function tick(now) {
    if (!alive) return;
    requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.1); last = now;
    if (playing) time += dt * speed;
    // en direct, on ne dépasse pas le dernier instant connu
    if (follow && director.live) time = Math.min(time, director.duration);
    if (time > director.duration) { time = director.duration; playing = false; $('.v3d-play').textContent = '▶'; }
    const st = director.stateAt(time);
    pitch.setState(st, snap); snap = false;
    clockEl.textContent = fmt(time);
    scoreEl.textContent = `${st.score[0]} - ${st.score[1]}`;
    if (document.activeElement !== range) range.value = Math.round((time / director.duration) * 1000);
    if (st.event && st.event !== lastEv && time - st.event.t < 8) {
      lastEv = st.event;
      evEl.hidden = false;
      evEl.className = 'v3d-event' + (st.event.score ? ' goal' : '');
      evEl.textContent = `${st.event.clock} · ${st.event.text}`;
      evTimer = now;
    }
    if (!evEl.hidden && now - evTimer > 5000) evEl.hidden = true;
  }
  requestAnimationFrame(tick);

  return {
    update(d) { director = d; marks(); $('.v3d-live').hidden = !d.live; },
    seek(sec) { time = sec; snap = true; follow = false; playing = true; $('.v3d-play').textContent = '⏸'; el.scrollIntoView({ behavior: 'smooth', block: 'center' }); },
    destroy() { alive = false; pitch.dispose(); },
  };
}

Object.assign(SL, { mountViewer });
})();

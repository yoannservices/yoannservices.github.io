/* ═══════════════════════════════════════════════════════════
   SIMULATEUR TRAIN — BOUCLE PRINCIPALE ET ENTRÉES
   ═══════════════════════════════════════════════════════════ */
'use strict';

TS.Main = (function () {
  const $ = s => document.querySelector(s);
  let cfg, route, running = false, paused = false, mode = 'cab', last = 0, raf = 0;
  const M = {};
  const keys = {};

  M.start = function (config) {
    cfg = config;
    $('#game').hidden = false;
    $('#loading').hidden = false;
    TS.Audio.resume();
    setTimeout(() => {
      route = TS.buildRoute(cfg);
      TS.Sim.init(cfg, route);
      TS.World.init($('#view'), route, cfg);
      TS.Cab.init(cfg, route);
      TS.Sim.onFinish = () => TS.Cab.report();
      mode = 'cab'; paused = false;
      TS.World.preload(TS.Sim.P.s, () => {
        $('#loading').hidden = true;
        running = true; last = performance.now();
        cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
        setTimeout(() => TS.Sim.say('Commencez par la visite au sol, puis suivez la check-list (Tab pour la replier).', 'info'), 600);
      });
    }, 30);
  };

  function loop(now) {
    raf = requestAnimationFrame(loop);
    let dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (!running) return;
    const P = TS.Sim.P;
    if (!paused) {
      const sim = dt * TS.Sim.timeScale;
      const n = Math.max(1, Math.ceil(sim / 0.05));
      for (let i = 0; i < n; i++) TS.Sim.step(sim / n);
      // passage des trains en sens inverse
      slowDownCheck(P);
      TS.Sim.opp.forEach(o => { if (!o.wh && o.s - P.s < 60 && o.s - P.s > -40) { o.wh = true; TS.Audio.fx('whoosh', Math.min(1, (o.v + P.v) / 60)); } });
    }
    TS.World.update(dt, mode);
    TS.Cab.update(dt);
    TS.Audio.update(dt, P, cfg, TS.Sim.timeScale);
  }

  /* ── Retour automatique à ×1 à l'approche d'une limitation de vitesse ── */
  let lastSlow = null;
  function slowDownCheck(P) {
    const S = TS.Sim;
    if (S.timeScale <= 1 || P.v < 2) return;
    const vk = P.v * 3.6;
    const back = (key, txt) => {
      if (lastSlow === key) return;
      lastSlow = key;
      TS.Cab.setScale(1);
      S.say('Retour à ×1 : ' + txt, 'warn');
    };
    // limitation (TIV, entrée en gare, fin de LGV) plus basse que la vitesse actuelle
    const cur = Math.max(P.lineLimit || 0, vk);
    const nl = route.nextLimit(P.s, Math.min(cur, vk + 1), 6000);
    if (nl && nl.v < vk) {
      const vl = nl.v / 3.6;
      const brake = (P.v * P.v - vl * vl) / (2 * 0.5);
      const d = nl.s0 - P.s;
      if (d < brake + P.v * 40 + 300) back('lim' + Math.round(nl.s0), 'limitation à ' + nl.v + ' km/h dans ' + TS.fmtDist(d) + '.');
    }
    // signalisation de cabine TVM : baisse du code
    if (P.inTVM && P.tvmCode != null && P.tvmCode < vk - 5) back('tvm' + P.nextSig, 'TVM ' + P.tvmCode + ' km/h, ralentissez.');
  }

  M.slowDownCheck = slowDownCheck;
  M.setPaused = p => { paused = p; };
  M.toggleView = () => { mode = mode === 'cab' ? 'ext' : 'cab'; TS.Sim.say(mode === 'cab' ? 'Vue cabine.' : 'Vue extérieure (glisser pour tourner, molette pour zoomer).'); };
  M.quit = function () {
    running = false; cancelAnimationFrame(raf);
    TS.World.dispose();
    $('#game').hidden = true;
    TS.Setup.show();
  };
  M.restart = function () {
    running = false; cancelAnimationFrame(raf);
    TS.World.dispose();
    cfg.seed = Math.floor(Math.random() * 1e9);
    M.start(cfg);
  };

  /* ── Clavier ── */
  window.addEventListener('keydown', e => {
    if (!running || $('#game').hidden) return;
    if (e.target.matches('input, select, textarea')) return;
    if (TS.Cab.modalOpen()) { if (e.key === 'Escape') TS.Cab.closeModal(); return; }
    const k = e.key.toLowerCase();
    const S = TS.Sim;
    TS.Audio.resume();
    let handled = true;
    switch (k) {
      case 'z': case 'arrowup': S.cmd('manipStep', 0.1); break;
      case 's': case 'arrowdown': S.cmd('manipStep', -0.1); break;
      case 'd': case 'arrowleft': S.cmd('brakeStep', -1); break;
      case 'f': case 'arrowright': S.cmd('brakeStep', 1); break;
      case ' ': if (!keys.space) { keys.space = true; S.cmd('vacma'); } break;
      case 'enter': S.cmd('acq'); break;
      case 'k': if (!e.repeat) S.cmd('horn', 1.2); break;
      case 'u': S.cmd('urg'); break;
      case 'p': {
        const P = S.P;
        if (cfg.loco.cat !== 'pax') break;
        if (P.doorsOpen) S.cmd('doorsClose');
        else if (P.stopK >= 0 && !P.flags.opened) S.cmd(route.stations[P.stopK].ourPlatSide < 0 ? 'doorsL' : 'doorsR');
        else S.cmd('doorsClose');
        break;
      }
      case 'c': M.toggleView(); break;
      case 'h': $('#game').classList.toggle('nopup'); break;
      case 'tab': $('#checklist').classList.toggle('min'); break;
      case 'm': TS.Cab.docs(); break;
      case 'escape': TS.Cab.pause(); break;
      case '+': case '=': { const L = [1, 2, 5, 10]; TS.Cab.setScale(L[Math.min(3, L.indexOf(S.timeScale) + 1)]); break; }
      case '-': case '6': { const L = [1, 2, 5, 10]; TS.Cab.setScale(L[Math.max(0, L.indexOf(S.timeScale) - 1)]); break; }
      case 'r': TS.World.resetLook(); break;
      default: handled = false;
    }
    if (handled) e.preventDefault();
  });
  window.addEventListener('keyup', e => { if (e.key === ' ') keys.space = false; });

  /* ── Souris : regarder autour ── */
  let drag = null;
  document.addEventListener('pointerdown', e => {
    if (!running) return;
    const c = TS.World.canvas();
    if (e.target !== c) return;
    drag = { x: e.clientX, y: e.clientY };
    TS.Audio.resume();
  });
  window.addEventListener('pointermove', e => {
    if (!drag) return;
    TS.World.look(e.clientX - drag.x, e.clientY - drag.y, mode);
    drag.x = e.clientX; drag.y = e.clientY;
  });
  window.addEventListener('pointerup', () => { drag = null; });
  window.addEventListener('wheel', e => { if (running && e.target === TS.World.canvas()) TS.World.zoom(e.deltaY); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) last = performance.now(); });

  TS.Setup.init();     // scripts en fin de <body> : le DOM est prêt
  return M;
})();

// HUD en DOM + canvas : position, tour, tableau des temps, feux, drapeaux, vitesse/rapport/régime, pneus, dégâts, minicarte, chronos, radio.
(function () {
  const A = (globalThis.MGP = globalThis.MGP || {});
  const clamp = A.clamp;
  const el = (tag, cls, parent, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (parent) parent.appendChild(e); return e; };
  const put = (e, t) => { t = String(t); if (e._t !== t) { e._t = t; e.textContent = t; } };
  const hex = c => '#' + c.toString(16).padStart(6, '0');
  const abbr = n => n.replace(/[^A-Za-zÀ-ÿ' ]/g, '').split(' ').pop().slice(0, 3).toUpperCase();
  const health = v => (v > 0.7 ? '#3ddc5a' : v > 0.4 ? '#f2c230' : '#e8402a');
  const SEC = { purple: '#b44cf0', green: '#3ddc5a', yellow: '#f2c230' };

  A.Hud = class Hud {
    constructor(container) {
      const r = (this.root = el('div', 'hud', container));
      // haut gauche : position, tour
      const tl = el('div', 'hud-tl', r); this.pos = el('div', 'big', tl); this.lap = el('div', 'mid', tl); this.mode = el('div', 'small', tl);
      this.tower = el('div', 'hud-tower', r); this.rows = [];
      for (let i = 0; i < 11; i++) { const row = el('div', 'trow', this.tower); this.rows.push({ row, p: el('span', 'p', row), bar: el('span', 'bar', row), n: el('span', 'n', row), g: el('span', 'g', row), t: el('span', 't', row) }); }
      // haut centre : feux + bandeau
      this.lights = el('div', 'hud-lights', r); this.lamps = [0, 1, 2, 3, 4].map(() => el('i', '', this.lights));
      this.banner = el('div', 'hud-banner', r);
      this.toasts = el('div', 'hud-toasts', r);
      // haut droite : chronos
      const tr = el('div', 'hud-tr', r);
      this.cur = el('div', 'timer', tr); this.last = el('div', 'small', tr); this.best = el('div', 'small', tr);
      this.secs = el('div', 'secs', tr); this.secEl = [0, 1, 2].map(() => el('span', '', this.secs));
      this.delta = el('div', 'delta', tr); this.adapt = el('div', 'adapt', tr); this.cam = el('div', 'small', tr);
      // bas centre : vitesse, rapport, régime
      const bc = el('div', 'hud-bc', r);
      this.leds = el('div', 'leds', bc); this.led = []; for (let i = 0; i < 15; i++) this.led.push(el('i', '', this.leds));
      const mid = el('div', 'dash', bc);
      this.leanC = el('canvas', 'leanc', mid); this.leanC.width = 250; this.leanC.height = 118;
      this.gear = el('div', 'gear', mid); const sp = el('div', 'spd', mid); this.kmh = el('b', '', sp); el('small', '', sp, 'km/h');
      const bars = el('div', 'pedals', bc); this.thr = el('div', 'pbar thr', bars); this.thrI = el('i', '', this.thr); this.brk = el('div', 'pbar brk', bars); this.brkI = el('i', '', this.brk);
      this.badges = el('div', 'badges', bc); this.bDrs = el('span', '', this.badges, 'ABS'); this.bTc = el('span', '', this.badges, 'TC'); this.bWh = el('span', '', this.badges, 'ANTI-WHEELIE'); this.bLim = el('span', '', this.badges, 'LIMITEUR'); this.bEco = el('span', '', this.badges, 'ÉCO'); this.bPit = el('span', '', this.badges, 'STAND'); this.bAuto = el('span', '', this.badges, '');
      this.fuel = el('div', 'small', bc);
      this.radio = el('div', 'hud-radio', r); this.radioTxt = el('div', '', this.radio); this.radioQ = el('div', 'q', this.radio, '[Y] Oui   [N] Non');
      // bas gauche : pneus + dégâts
      const bl = el('div', 'hud-bl', r);
      this.tires = el('div', 'tires', bl); this.tw = [0, 1].map(w => { const t = el('div', 'tire', this.tires); el('small', '', t, w ? 'ARRIÈRE' : 'AVANT'); return { t, temp: el('span', '', t), wear: el('i', '', t) }; });
      this.comp = el('div', 'comp', bl);
      this.dmg = el('canvas', 'dmg', bl); this.dmg.width = 84; this.dmg.height = 120;
      // bas droite : minicarte
      this.map = el('canvas', 'hud-map', r); this.map.width = this.map.height = 200; this.mapBg = document.createElement('canvas'); this.mapBg.width = this.mapBg.height = 200;
      this.key = el('div', 'hud-keys', r, 'Z gaz · S frein · Q/D pencher · Espace frein arrière · E/F vitesses · X stand · C caméra · V derrière · G éco · T radio · Y/N répondre · R replacer · Échap pause');
      this.acc = 0; this.secCol = [null, null, null]; this.secT = [0, 0, 0]; this.toastT = [];
    }

    show(v) { this.root.style.display = v ? '' : 'none'; }

    attach(race, set) {
      this.race = race; this.set = set; this.rowsT = 0; this.dmgT = 0;
      this.secCol = [null, null, null]; this.secT = [0, 0, 0]; this.toasts.innerHTML = ''; this.radioClear();
      put(this.mode, { race: 'COURSE', quali: 'QUALIFICATIONS', practice: race.cfg.bots === 0 ? 'CONTRE-LA-MONTRE' : 'ESSAIS LIBRES' }[race.mode]);
      this.tower.style.display = race.cars.length > 1 ? '' : 'none';
      this.lights.style.display = race.mode === 'race' && !race.cfg.rolling ? '' : 'none';
      this._mapBg(race.tr);
    }

    _mapBg(tr) {
      const c = this.mapBg.getContext('2d'), S = 200, N = tr.N;
      let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
      for (let i = 0; i < N; i += 4) { x0 = Math.min(x0, tr.px[i]); x1 = Math.max(x1, tr.px[i]); z0 = Math.min(z0, tr.pz[i]); z1 = Math.max(z1, tr.pz[i]); }
      const k = (S - 24) / Math.max(x1 - x0, z1 - z0), ox = (S - (x1 - x0) * k) / 2, oz = (S - (z1 - z0) * k) / 2;
      this.mp = { x0, z0, k, ox, oz };
      c.clearRect(0, 0, S, S); c.lineJoin = c.lineCap = 'round';
      const path = () => { c.beginPath(); for (let i = 0; i <= N; i += 3) { const j = i % N; c[i ? 'lineTo' : 'moveTo']((tr.px[j] - x0) * k + ox, (tr.pz[j] - z0) * k + oz); } c.closePath(); };
      c.strokeStyle = 'rgba(0,0,0,.65)'; c.lineWidth = 9; path(); c.stroke();
      c.strokeStyle = '#d6d9de'; c.lineWidth = 5; path(); c.stroke();
      const p = tr.at(0, 0); c.fillStyle = '#fff'; c.fillRect((p.x - x0) * k + ox - 4, (p.z - z0) * k + oz - 1.5, 8, 3);
    }

    toast(text, cls, secs) {
      const d = el('div', 'toast ' + (cls || ''), this.toasts, text);
      this.toastT.push([d, secs || 3.5]);
      while (this.toasts.children.length > 4) this.toasts.removeChild(this.toasts.firstChild);
    }

    radioSay(text, q) { this.radio.style.display = 'block'; put(this.radioTxt, '📻 ' + text); this.radioQ.style.display = q ? 'block' : 'none'; }
    radioClear() { this.radio.style.display = 'none'; }

    // événements de course destinés à l'affichage
    onEvent(type, d, race) {
      const p = race.player, mine = d.car === p;
      if (type === 'sector' && mine) { this.secCol[d.i] = d.color; this.secT[d.i] = d.t; }
      else if (type === 'lap' && mine) {
        this.secCol = [null, null, null]; this.secT = [0, 0, 0];
        this.toast((d.valid ? 'Tour ' : 'Tour invalide ') + A.fmt(d.t) + (d.fastest ? ' — MEILLEUR DE LA COURSE' : d.pb ? ' — record perso' : ''), d.fastest ? 'purple' : d.pb ? 'green' : d.valid ? '' : 'warn');
      } else if (type === 'penalty' && mine) this.toast(`Pénalité +${d.secs} s — ${A.PEN_WHY[d.why] || d.why}`, 'warn', 5);
      else if (type === 'blackwarn' && mine) this.toast("ATTENTION : encore une faute et c'est le drapeau noir", 'warn', 6);
      else if (type === 'dsq') this.toast(mine ? 'DRAPEAU NOIR — vous êtes exclu de la course' : `${d.car.name} est exclu (drapeau noir)`, 'warn', mine ? 8 : 4);
      else if (type === 'limits' && mine) this.toast('Limites de piste — avertissement', 'warn');
      else if (type === 'puncture' && mine) this.toast('CREVAISON', 'warn', 5);
      else if (type === 'detach' && mine) this.toast('Pièce arrachée', 'warn');
      else if (type === 'pitreq' && mine) this.toast(d.want ? `Stand ce tour — ${A.COMPOUNDS[p.pit.tire].name}` : 'Arrêt annulé');
      else if (type === 'missed' && mine) this.toast('Stand manqué', 'warn');
      else if (type === 'bikecrash' && mine) this.toast('CHUTE !', 'warn', 4);
    }

    update(dt, race, ex) {
      const c = race.player; if (!c) return;
      this.toastT = this.toastT.filter(t => { t[1] -= dt; if (t[1] <= 0) { t[0].remove(); return false; } return true; });
      const sc = race.rules.sc.mode > 0, p = race.phase;

      // position / tour
      put(this.pos, race.mode === 'race' ? 'P' + c.pos + '/' + race.cars.length : '');
      put(this.lap, race.laps === Infinity ? 'TOUR ' + Math.max(1, c.lap) : 'TOUR ' + clamp(c.lap, 1, race.laps) + '/' + race.laps);

      // feux
      if (p === 'lights') this.lamps.forEach((l, i) => l.classList.toggle('on', i < race.nLights));
      this.lights.style.opacity = p === 'intro' || p === 'lights' ? 1 : p === 'race' && race.clock - race.startT < 1.2 ? 0.0 : 0;
      if (p === 'race' && race.clock - race.startT < 1.2) this.lamps.forEach(l => l.classList.remove('on'));

      // bandeau
      let bn = '', bc = '';
      if (race.rules.sc.mode === 1) { bn = 'SAFETY CAR'; bc = 'sc'; } else if (race.rules.sc.mode === 2) { bn = 'SAFETY CAR RENTRE'; bc = 'sc'; }
      else if (race.rules.blue && !sc) { bn = 'DRAPEAU BLEU — laisse passer'; bc = 'blue'; }
      else { const s = Math.min(2, Math.floor((c.s / race.tr.L) * 3)); if (race.rules.yellow.some(Boolean)) { bn = 'DRAPEAU JAUNE' + (race.rules.yellow[s] ? ' — ton secteur' : ''); bc = 'yellow'; } }
      if (c.finished) { bn = 'ARRIVÉE'; bc = 'fin'; }
      put(this.banner, bn); this.banner.className = 'hud-banner ' + (bn ? bc : 'off');

      // chronos
      put(this.cur, A.fmt(Math.max(0, c.lapT)));
      put(this.last, 'Dernier ' + (c.last ? A.fmt(c.last) : '--'));
      put(this.best, 'Meilleur ' + (c.best ? A.fmt(c.best) : '--'));
      this.secEl.forEach((e, i) => {
        const t = this.secT[i]; put(e, t ? t.toFixed(1) : 'S' + (i + 1));
        e.style.background = this.secCol[i] ? SEC[this.secCol[i]] : i === c.secIdx ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.1)'; e.style.color = this.secCol[i] === 'yellow' ? '#111' : '#fff';
      });
      const dl = ex.delta;
      put(this.delta, dl == null ? '' : (dl > 0 ? '+' : '−') + Math.abs(dl).toFixed(2)); this.delta.style.color = dl > 0 ? '#ff5a4a' : '#3ddc5a';
      const ad = race.adaptive;
      put(this.adapt, ad && ad.on ? `IA ${ad.label} ${ad.dir > 0 ? '▲' : ad.dir < 0 ? '▼' : '●'} ${ad.delta >= 0 ? '+' : ''}${ad.delta.toFixed(1)}` : '');
      put(this.cam, 'Caméra : ' + ex.rig.label);

      // vitesse, rapport, régime
      put(this.kmh, Math.round(c.kmh)); put(this.gear, c.u < -0.5 ? 'R' : c.gear);
      const f = clamp((c.rpm - 5000) / 12500, 0, 1);
      this.led.forEach((l, i) => { const on = f > 0.3 + i * 0.047; l.style.background = on ? (i < 6 ? '#3ddc5a' : i < 11 ? '#ff3b2f' : '#3aa0ff') : '#222'; l.style.opacity = f > 0.97 && Math.floor(race.clock * 14) % 2 ? 0.3 : 1; });
      this.thrI.style.height = Math.round(c.in.thr * 100) + '%'; this.brkI.style.height = Math.round(c.in.brk * 100) + '%';
      const rd = A.RIDING.arcade, aid = rd.forceAids;
      this.bDrs.className = c.locked > 0 ? 'rdy' : c.assists.abs || aid ? 'on' : ''; this.bTc.className = c.spun > 0 ? 'rdy' : c.assists.tc || aid ? 'on' : ''; this.bWh.className = c.wheelie > 0.1 ? 'rdy' : c.assists.wheelie || aid ? 'on' : ''; this.bLim.className = c.limiter ? 'on' : ''; this.bEco.className = c.fuelSave ? 'on' : '';
      this.bPit.className = c.pit.state ? 'on' : c.pit.want ? 'rdy' : ''; put(this.bPit, c.pit.want && !c.pit.state ? 'STAND ' + c.pit.tire : 'STAND');
      put(this.bAuto, c.auto ? 'AUTO' : 'MANUEL'); this.bAuto.className = c.auto ? '' : 'on';
      put(this.fuel, `Essence ${c.fuel.toFixed(1)} kg · ${c.compound ? A.COMPOUNDS[c.compound].name : ''}`);

      // pneus
      const cm = c.tires[0].c, order = [0, 1];
      order.forEach(w => {
        const t = c.tires[w], e = this.tw[w], dT = t.temp - cm.opt, col = Math.abs(dT) < cm.win * 0.55 ? '#3ddc5a' : Math.abs(dT) < cm.win ? '#f2c230' : dT > 0 ? '#e8402a' : '#4aa8ff';
        put(e.temp, Math.round(t.temp) + '°'); e.t.style.borderColor = col; e.t.style.background = `linear-gradient(to top, ${col}55 ${Math.round((1 - t.wear) * 100)}%, transparent 0)`;
        e.wear.style.width = Math.round((1 - t.wear) * 100) + '%'; e.wear.style.background = health(1 - t.wear);
      });
      put(this.comp, cm.id); this.comp.style.background = hex(cm.color); this.comp.style.color = cm.id === 'H' || cm.id === 'M' ? '#111' : '#fff';

      // dégâts + minicarte (5 Hz / chaque image)
      if ((this.dmgT -= dt) <= 0) { this.dmgT = 0.2; this._damage(c); }
      this._map(race); this._lean(c);

      // tableau des temps
      if ((this.rowsT -= dt) <= 0) { this.rowsT = 0.25; this._tower(race, c); }
    }

    _tower(race, me) {
      const list = race.byPos(), lead = list[0], L = race.tr.L;
      const show = list.slice(0, 10);
      if (me.pos > 10) show.push(me); else if (list[10]) show.push(list[10]);
      this.rows.forEach((r, i) => {
        const c = show[i];
        r.row.style.display = c ? '' : 'none';
        if (!c) return;
        const down = Math.floor((lead.dist - c.dist) / L + 0.02);
        put(r.p, c.pos); put(r.n, abbr(c.name)); r.bar.style.background = hex(c.team.color);
        put(r.g, c === lead ? (race.laps === Infinity ? '' : 'T' + clamp(c.lap, 1, race.laps)) : c.dnf ? 'DNF' : c.finished ? 'FIN' : down > 0 ? '+' + down + ' T' : '+' + race.gap(c, lead).toFixed(1));
        put(r.t, c.pit.state ? 'PIT' : c.compound);
        r.row.className = 'trow' + (c === me ? ' me' : '') + (c.dnf ? ' dnf' : '');
        r.t.style.color = c.pit.state ? '#ffb020' : hex(A.COMPOUNDS[c.compound].color);
      });
    }

    _damage(c) {
      const g = this.dmg.getContext('2d'), d = c.d, W = 84, H = 120;
      g.clearRect(0, 0, W, H); g.lineWidth = 1.5; g.strokeStyle = 'rgba(0,0,0,.6)';
      const rect = (x, y, w, h, v, off) => { if (off) { g.strokeStyle = '#555'; g.setLineDash([3, 3]); g.strokeRect(x, y, w, h); g.setLineDash([]); g.strokeStyle = 'rgba(0,0,0,.6)'; return; } g.fillStyle = health(v); g.fillRect(x, y, w, h); g.strokeRect(x, y, w, h); };
      rect(30, 8, 24, 16, d.fw, d.fwOff);              // carénage avant
      rect(36, 28, 12, 40, Math.min(d.floor, d.engine), false); // moteur / réservoir
      rect(32, 72, 20, 12, d.rw, d.rwOff);             // queue
      rect(36, 2, 12, 5, d.wheel[0] ? d.susp[0] : 0, !d.wheel[0]);   // roue avant
      rect(34, 100, 16, 16, d.wheel[1] ? d.susp[1] : 0, !d.wheel[1]); // roue arrière
      g.fillStyle = d.mirL ? '#aaa' : '#444'; g.fillRect(22, 20, 7, 4); g.fillStyle = d.mirR ? '#aaa' : '#444'; g.fillRect(55, 20, 7, 4);
      g.fillStyle = health(d.engine); g.beginPath(); g.arc(42, 90, 5, 0, 7); g.fill();
    }

    // Cadran d'inclinaison : angle actuel, silhouette de la moto vue de l'arrière, maxima du tour et de la session pour chaque côté.
    _lean(c) {
      const g = this.leanC.getContext('2d'), W = 250, H = 118, cx = 66, cy = 104, R = 58, D2R = Math.PI / 180;
      g.clearRect(0, 0, W, H);
      const deg = c.lean / D2R, a = Math.abs(deg), phi = -deg * D2R;
      const col = a < 38 ? '#3ddc5a' : a < 50 ? '#f2c230' : a < 57 ? '#ff8a1f' : '#ff3b2f';
      const P = (ang, r) => [cx + Math.sin(ang * D2R) * r, cy - Math.cos(ang * D2R) * r];
      // graduations -70..70 (gauche à gauche)
      g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.28)';
      for (let t = -70; t <= 70; t += 10) {
        const long = t % 30 === 0, p0 = P(t, R + (long ? -2 : 1)), p1 = P(t, R + 7);
        g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke();
      }
      g.fillStyle = 'rgba(255,255,255,.45)'; g.font = '9px Inter, sans-serif'; g.textAlign = 'center';
      [[-60, '60'], [-30, '30'], [0, '0'], [30, '30'], [60, '60']].forEach(([t, s]) => { const p = P(t, R + 15); g.fillText(s, p[0], p[1] + 3); });
      // arc de l'angle actuel
      g.lineWidth = 6; g.lineCap = 'round'; g.strokeStyle = col;
      g.beginPath(); g.arc(cx, cy, R - 4, -Math.PI / 2, -Math.PI / 2 + phi, phi < 0); g.stroke();
      // repères des maxima du tour (blancs) et de la session (gris) ; gauche = angle négatif à l'écran
      const mark = (val, color, size) => {
        if (val < 1) return;
        const p = P(val, R + 9), q = P(val, R + 9 + size);
        g.fillStyle = color; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0] - 3, q[1]); g.lineTo(q[0] + 3, q[1]); g.closePath(); g.fill();
      };
      mark(-c.leanMaxL, 'rgba(255,255,255,.4)', 7); mark(c.leanMaxR, 'rgba(255,255,255,.4)', 7);
      mark(-c.leanLapL, '#fff', 8); mark(c.leanLapR, '#fff', 8);
      // moto vue de l'arrière, inclinée autour du point de contact
      g.save(); g.translate(cx, cy); g.rotate(phi);
      g.fillStyle = '#1a1a1c'; g.strokeStyle = '#aab'; g.lineWidth = 1.5;
      g.beginPath(); g.roundRect(-4.5, -36, 9, 36, 4); g.fill(); g.stroke();
      g.fillStyle = hex(c.team.color); g.beginPath(); g.roundRect(-6, -50, 12, 18, 5); g.fill();
      g.fillStyle = '#2b2d33'; g.beginPath(); g.ellipse(0, -40, 9, 5, 0, 0, 7); g.fill();
      g.fillStyle = hex(c.team.color2); g.beginPath(); g.arc(Math.sin(-phi) * 0, -58, 6.5, 0, 7); g.fill();
      g.restore();
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - 40, cy); g.lineTo(cx + 40, cy); g.stroke();
      // colonne de texte
      g.textAlign = 'left'; g.fillStyle = col; g.font = '800 34px Inter, sans-serif';
      g.fillText(Math.round(a) + '°', 136, 40);
      g.fillStyle = 'rgba(255,255,255,.6)'; g.font = '700 11px Inter, sans-serif';
      g.fillText(a < 1 ? 'DROIT' : deg > 0 ? '◀ GAUCHE' : 'DROITE ▶', 136, 56);
      g.font = '600 12px Inter, sans-serif'; g.fillStyle = '#fff';
      g.fillText('Max G  ' + Math.round(c.leanLapL) + '°', 136, 78); g.fillText('Max D  ' + Math.round(c.leanLapR) + '°', 136, 95);
      g.fillStyle = 'rgba(255,255,255,.4)'; g.font = '10px Inter, sans-serif';
      g.fillText('record ' + Math.round(c.leanMaxL) + '° / ' + Math.round(c.leanMaxR) + '°', 136, 110);
    }

    _map(race) {
      const g = this.map.getContext('2d'), m = this.mp; if (!m) return;
      g.clearRect(0, 0, 200, 200); g.drawImage(this.mapBg, 0, 0);
      const dot = (c, r, col) => { g.fillStyle = col; g.beginPath(); g.arc((c.x - m.x0) * m.k + m.ox, (c.z - m.z0) * m.k + m.oz, r, 0, 7); g.fill(); };
      for (const c of race.all) if (!c.hidden && !c.isPlayer && c.idx >= 0) dot(c, 3, c.isSC ? '#ffa000' : c.dnf ? '#666' : hex(c.team.color));
      const p = race.player; g.strokeStyle = '#fff'; g.lineWidth = 2; dot(p, 4.5, hex(p.team.color)); g.beginPath(); g.arc((p.x - m.x0) * m.k + m.ox, (p.z - m.z0) * m.k + m.oz, 5.5, 0, 7); g.stroke();
    }
  };
})();

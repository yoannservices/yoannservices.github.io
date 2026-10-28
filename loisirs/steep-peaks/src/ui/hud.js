import { DISC } from '../core/config.js';
import { data } from '../core/save.js';
import { CATALOG, prog, progress } from '../gameplay/progression.js';
import { MEDALS } from '../gameplay/challenges.js';
import { WEATHER } from '../world/weather.js';

const $ = (s, r = document) => r.querySelector(s);
const SNOW = ['Poudreuse', 'Neige damée', 'Glace'];

export class HUD {
  constructor() {
    this.root = $('#ui');
    this.root.innerHTML = `
      <div id="top"><div id="disc" class="pill"></div><canvas id="compass" width="420" height="34"></canvas><div id="wx" class="pill"></div></div>
      <div id="toasts"></div>
      <div id="chal" class="card hidden"></div>
      <div id="bl"><div id="spd"><b>0</b> km/h</div><div id="alt"></div><div id="info"></div></div>
      <div id="br"><div id="score">0</div><div id="combo"></div><div id="lvl"><span></span><div class="bar"><i></i></div></div></div>
      <div id="live"></div><div id="popups"></div>
      <div id="crash" class="hidden"></div>
      <div id="hint">ZQSD diriger · Espace (maintenir) sauter · A/E/F/G grabs · Tab (maintenir) roue des disciplines · Échap menu · M carte</div>
      <div id="wheel"><svg></svg><div class="wcenter"></div></div>
      <div id="menu" class="hidden"></div>
      <div id="loading"><div><h1>Steep Peaks</h1><p>Génération du massif…</p></div></div>`;
    this.el = Object.fromEntries(['disc', 'compass', 'wx', 'toasts', 'chal', 'spd', 'alt', 'info', 'score', 'combo', 'lvl', 'live', 'popups', 'crash', 'menu', 'loading', 'hint'].map((k) => [k, $('#' + k)]));
    this.g = this.el.compass.getContext('2d');
    this.tab = 'equip'; this.open = false;
    this.hooks = {};
    setTimeout(() => this.el.hint.classList.add('fade'), 9000);
  }

  toast(t) {
    const d = document.createElement('div');
    d.className = 'toast'; d.textContent = t;
    this.el.toasts.append(d);
    while (this.el.toasts.children.length > 4) this.el.toasts.firstChild.remove();
    setTimeout(() => d.remove(), 3800);
  }
  popup(text, score, mult) {
    const d = document.createElement('div');
    d.className = 'popup'; d.innerHTML = `<span>${text}</span><b>+${score}${mult > 1 ? ' ×' + mult.toFixed(1) : ''}</b>`;
    this.el.popups.append(d);
    setTimeout(() => d.remove(), 2600);
  }
  crash(reason) { this.el.crash.innerHTML = `<h2>Chute</h2><p>${reason}</p><small>Espace / R : relancer</small>`; this.el.crash.classList.remove('hidden'); }
  hideCrash() { this.el.crash.classList.add('hidden'); }
  result(d, v, m, unit, better) {
    const t = d.type === 'chrono' || d.type === 'free' ? v.toFixed(1) : Math.round(v);
    const el = document.createElement('div');
    el.className = 'result';
    el.innerHTML = `<small>Défi réussi</small><h2>${d.name}</h2><div class="medal">${MEDALS[m]}</div><p>${t}${unit}${better ? ' · record !' : ''}</p>`;
    this.root.append(el); setTimeout(() => el.remove(), 4200);
  }
  ready() { this.el.loading.classList.add('gone'); setTimeout(() => this.el.loading.remove(), 800); }

  compass(bearing) {
    const g = this.g, W = 420, H = 34, ppd = 3;
    g.clearRect(0, 0, W, H);
    g.fillStyle = 'rgba(15,15,19,0.55)'; g.fillRect(0, 0, W, H);
    g.font = '600 13px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const b = ((bearing * 180) / Math.PI + 360) % 360;
    for (let a = -70; a <= 70; a++) {
      const deg = Math.round(b + a), x = W / 2 + (deg - b) * ppd;
      if (deg % 15 === 0) {
        const dd = ((deg % 360) + 360) % 360;
        g.fillStyle = '#8892a4'; g.fillRect(x, dd % 45 === 0 ? 2 : 5, 1, dd % 45 === 0 ? 8 : 5);
        if (dd % 45 === 0) { g.fillStyle = dd % 90 === 0 ? '#e2e8f0' : '#8892a4'; g.fillText({ 0: 'N', 90: 'E', 180: 'S', 270: 'O' }[dd] || { 45: 'NE', 135: 'SE', 225: 'SO', 315: 'NO' }[dd], x, 23); }
      }
    }
    g.fillStyle = '#22c55e'; g.beginPath(); g.moveTo(W / 2 - 5, 0); g.lineTo(W / 2 + 5, 0); g.lineTo(W / 2, 7); g.fill();
  }

  update(s) {
    const { p, tricks, sky, weather, chal, bearing, risk } = s, e = this.el;
    const D = DISC[p.disc];
    e.disc.innerHTML = `<span style="color:${D.col}">${D.icon}</span> ${D.label}`;
    e.disc.style.borderColor = D.col;
    const w = WEATHER[weather.state];
    e.wx.textContent = `${w.icon} ${w.label} · ${sky.label}`;
    e.spd.innerHTML = `<b>${Math.round(p.speed * 3.6)}</b> km/h`;
    const agl = p.mode === 'wing' ? ` · sol ${Math.max(0, p.agl).toFixed(0)} m` : '';
    e.alt.textContent = `${Math.round(p.pos.y)} m${agl}`;
    const rk = risk < 0.35 ? 'faible' : risk < 0.7 ? 'modéré' : 'élevé';
    e.info.textContent = `${p.grounded ? SNOW[p.snow] + ' · ' : ''}pente ${Math.round(Math.atan(p.slope) * 57.3)}° · avalanche ${rk}`;
    e.score.textContent = tricks.total.toLocaleString('fr-FR');
    const cur = tricks.cur;
    e.combo.innerHTML = tricks.chain > 0 ? `Combo ×${tricks.mult.toFixed(1)} <i style="width:${Math.min(100, tricks.timer / 4.5 * 100)}%"></i>` : '';
    const live = tricks.liveText(p) || (cur.grindPts > 0 && p.mode === 'grind' ? `Grind ${Math.round(cur.grindPts)}` : cur.drift > 40 ? `Drift ${Math.round(cur.drift)}` : cur.prox > 50 ? `Vol rasant ${Math.round(cur.prox)}` : '');
    e.live.textContent = live;
    const pr = progress();
    e.lvl.firstChild.textContent = `Niv. ${pr.level}`; e.lvl.querySelector('i').style.width = (pr.into / pr.span) * 100 + '%';
    this.compass(bearing);
    const d = chal.describe();
    if (d) { e.chal.classList.remove('hidden'); e.chal.innerHTML = `<h3>${d.title}</h3><p>${d.line}</p><small>${d.hint}</small>`; } else e.chal.classList.add('hidden');
  }

  // ----- Menu pause -----
  show(tab) { this.open = true; if (tab) this.tab = tab; this.render(); this.el.menu.classList.remove('hidden'); }
  hide() { this.open = false; this.el.menu.classList.add('hidden'); }
  toggle() { this.open ? this.hide() : this.show(); }

  render() {
    const tabs = [['equip', 'Équipement'], ['chal', 'Défis'], ['stats', 'Stats'], ['help', 'Commandes']];
    let body = '';
    if (this.tab === 'equip') body = this.equipHtml();
    else if (this.tab === 'chal') body = this.chalHtml();
    else if (this.tab === 'stats') body = this.statsHtml();
    else body = this.helpHtml();
    this.el.menu.innerHTML = `<div class="panel"><header><h2>Steep Peaks</h2><span>Niveau ${prog.level}</span>
      <nav>${tabs.map(([k, n]) => `<button data-tab="${k}" class="${k === this.tab ? 'on' : ''}">${n}</button>`).join('')}</nav>
      <button data-act="close">Reprendre</button></header><section>${body}</section></div>`;
    this.el.menu.onclick = (ev) => {
      const t = ev.target.closest('[data-tab],[data-act],[data-eq]');
      if (!t) return;
      if (t.dataset.tab) { this.tab = t.dataset.tab; this.render(); }
      else if (t.dataset.act === 'close') this.hide();
      else if (t.dataset.act === 'goto') this.hooks.goto?.(t.dataset.id);
      else if (t.dataset.eq) { const [k, id] = t.dataset.eq.split(':'); if (prog.equip(k, id)) { this.hooks.equip?.(); this.render(); } }
    };
  }
  equipHtml() {
    const st = { snowboard: (i) => `Vitesse ${i.speed} · Grip ${i.grip} · Pop ${i.pop} · Agilité ${i.agi}`, ski: (i) => `Vitesse ${i.speed} · Grip ${i.grip} · Pop ${i.pop} · Agilité ${i.agi}`, wingsuit: (i) => `Portance ${i.lift} · Traînée ${i.drag} · Virage ${i.turn}`, outfit: (i) => `<span class="sw" style="background:${i.jacket}"></span><span class="sw" style="background:${i.pants}"></span><span class="sw" style="background:${i.helmet}"></span> motif ${i.pattern}` };
    const names = { snowboard: '🏂 Planches', ski: '⛷️ Skis', wingsuit: '🪂 Combinaisons', outfit: '🧥 Tenues' };
    return Object.entries(CATALOG).map(([k, list]) => `<h3>${names[k]}</h3><div class="grid">${list.map((i) => {
      const lock = i.lvl > prog.level, on = prog.equipped(k).id === i.id;
      return `<button class="item ${on ? 'on' : ''} ${lock ? 'lock' : ''}" data-eq="${k}:${i.id}" ${lock ? 'disabled' : ''}><b>${i.name}</b><small>${lock ? '🔒 Niveau ' + i.lvl : st[k](i)}</small></button>`;
    }).join('')}</div>`).join('');
  }
  chalHtml() {
    const ch = this.hooks.defs?.() || [];
    return `<div class="grid">${ch.map((d) => {
      const b = data.challenges[d.id], u = d.type === 'chrono' || d.type === 'free' ? ' s' : d.type === 'tricks' || d.type === 'prox' ? ' pts' : ' m';
      return `<div class="item"><b>${DISC[d.disc].icon} ${d.name}</b><small>${DISC[d.disc].label} · ${b ? MEDALS[b.medal] + ' ' + (d.type === 'chrono' || d.type === 'free' ? b.best.toFixed(1) : Math.round(b.best)) + u : 'non réussi'}</small>
      <button class="mini" data-act="goto" data-id="${d.id}">Y aller</button></div>`;
    }).join('')}</div><h3>Points d'intérêt : ${data.pois.length} / ${this.hooks.poiCount?.() || 0}</h3>`;
  }
  statsHtml() {
    const s = data.stats, h = (s.time / 3600).toFixed(1);
    const rows = [['Distance parcourue', (s.dist / 1000).toFixed(1) + ' km'], ['Vitesse max', Math.round(s.topSpeed) + ' km/h'], ['Meilleur trick', s.bestTrick], ['Plus long saut', s.bestJump.toFixed(0) + ' m'], ['Temps en l\'air', s.airTime.toFixed(0) + ' s'], ['Chutes', s.crashes], ['Temps de jeu', h + ' h'], ['XP', data.xp]];
    return `<div class="grid">${rows.map(([a, b]) => `<div class="item"><small>${a}</small><b>${b}</b></div>`).join('')}</div>`;
  }
  helpHtml() {
    return `<div class="help">
      <p><b>Diriger</b> Z Q S D (ou W A S D / flèches / stick gauche) · <b>S</b> freine · <b>Maj</b> dérape (drift) · <b>Z</b> en descente = position tuck</p>
      <p><b>Sauter</b> maintenir Espace pour charger, relâcher pour sauter · en l'air : Q/D = spins, Z/S = flips · <b>E F G</b> = grabs</p>
      <p><b>Discipline</b> maintenir Tab = roue (relâcher pour choisir) · 1 Snowboard · 2 Ski · 3 Wingsuit (saute d'une falaise) · en vol : Espace = parachute</p>
      <p><b>Wingsuit</b> Z pique (vitesse) · S cabre (finesse) · Q/D inclinent. Frôle le relief pour marquer des points.</p>
      <p><b>Autres</b> M carte (clic = téléportation) · T départ suivant · C caméra · R relancer · X déclencher une avalanche · B météo · N heure · V abandonner un défi · Échap menu</p>
      <p><b>Manette</b> stick = diriger · A saut · B/X/Y grabs · LB/RB discipline (ou stick dans la roue) · LT frein · Start menu · Back carte</p></div>`;
  }
}

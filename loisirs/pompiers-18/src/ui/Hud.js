// HUD : grade et argent, bandeau de mission + flèche, jauges (eau, air ARI, santé, tuyau), binôme, vitesse, invite, messages,
// voile de fumée et de chaleur, mini-carte et carte complète (M), bilan d'intervention.
import { G, coord, HYDRANTS, CASERNE, HOSPITAL } from '../city/grid.js';
import { fmt } from '../mission/Mission.js';

const $ = (id) => document.getElementById(id);
const TASK = { ride: 'dans l\'engin', follow: 'vous suit', idle: 'en attente', 'hose-go': 'établit une lance', hose: 'à la lance', search: 'reconnaissance', vent: 'ventilation' };

export class Hud {
  constructor(game) {
    this.g = game; this.mapOpen = false;
    this.mini = $('minimap').getContext('2d'); this.full = $('mapfull').getContext('2d');
  }
  toast(msg, kind = '') {
    const el = document.createElement('div'); el.className = `toast ${kind}`; el.textContent = msg;
    $('toasts').prepend(el);
    while ($('toasts').children.length > 4) $('toasts').lastChild.remove();
    setTimeout(() => el.classList.add('out'), 4200); setTimeout(() => el.remove(), 4800);
  }
  toggleMap() { this.mapOpen = !this.mapOpen; $('maparea').style.display = this.mapOpen ? 'flex' : 'none'; }
  toggleHelp() { $('help').classList.toggle('hidden'); }

  showResult(r) {
    document.exitPointerLock?.();   // sinon le bouton du bilan n'est pas cliquable
    const pct = (v) => `${Math.round(v * 100)} %`;
    const fire = r.type === 'feu';
    $('result').innerHTML = `<div class="panel res"><div class="head"><h1>${fire ? 'Feu éteint' : 'Victime aux urgences'} · ${r.address}</h1></div><div class="body">
      <p class="hint">${fire ? `Départ de feu : ${r.start}` : 'Secours à personne'}${r.n ? ` · victimes : ${r.saved} sauvée${r.saved > 1 ? 's' : ''}${r.dead ? `, ${r.dead} décès` : ''}` : ''}</p>
      <div class="stats"><div><b>${fmt(r.arrival)}</b><small>Délai d'arrivée</small></div><div><b>${fmt(r.total)}</b><small>Intervention</small></div>
      ${fire ? `<div><b>${pct(r.damage)}</b><small>Dégâts</small></div><div><b>${Math.round(r.used)} L</b><small>Eau utilisée</small></div>` : `<div><b>${r.dead ? '—' : 'Vivante'}</b><small>Victime</small></div><div><b>${r.fines} €</b><small>Infractions</small></div>`}</div>
      <div class="stats">${fire ? `<div><b>${r.fines} €</b><small>Infractions</small></div>` : ''}<div><b>+${r.pay} €</b><small>Prime</small></div><div><b>+${r.xp}</b><small>XP</small></div><div><b>${this.g.economy.grade}</b><small>Grade</small></div></div>
      <button class="go" id="resOk">Retour caserne</button></div></div>`;
    $('result').style.display = 'flex';
    $('resOk').onclick = () => { $('result').style.display = 'none'; };
  }

  update(info) {
    const g = this.g, e = g.economy, m = g.mission, p = g.player, tr = g.truck, veh = g.driving;
    $('money').textContent = `${Math.round(e.d.money)} €`; $('grade').textContent = e.grade;
    $('xpbar').style.width = `${e.xpProgress() * 100}%`;
    const [t1, t2] = m.title(); $('mTitle').textContent = t1; $('mText').textContent = t2;
    $('mission').className = `hud ${m.state === 'alerte' ? 'alert' : ''}`;
    // GPS : flèche vers le point du trajet 25 m devant (suit les routes), prochain virage, distance restante
    const tgt = m.target, fx = g.focus, look = tgt && g.route.active ? g.route.lookPoint(fx) : tgt, gm = window.GameSettings?.guide;
    $('gps').style.display = tgt && gm !== 'none' ? 'flex' : 'none';
    if (tgt) {
      const d = Math.hypot(tgt.x - fx.x, tgt.z - fx.z), ang = Math.atan2(look.x - fx.x, look.z - fx.z) - info.yaw;
      window.GameSettings?.arrow(d >= 15 ? ang : null, d >= 15 ? (d > 1000 ? (d / 1000).toFixed(1) + ' km' : Math.round(d) + ' m') : ''); // flèche commune en haut de l'écran
      const t = g.route.active ? g.route.turn() : null;
      $('turn').textContent = d < 15 ? 'Vous êtes arrivé' : t?.turn && t.dist < 250 ? `${t.turn === 'droite' ? '↱ À droite' : '↰ À gauche'} dans ${Math.max(10, Math.round(t.dist / 10) * 10)} m` : (gm === 'haut' ? 'Suivez la flèche' : 'Suivez le tracé au sol');
      $('dist').textContent = d >= 15 ? `Destination à ${d > 1000 ? (d / 1000).toFixed(1) + ' km' : Math.round(d) + ' m'}` : '';
    }

    const water = tr.water, bar = (id, v) => { $(id).style.width = `${Math.max(0, Math.min(1, v)) * 100}%`; };
    $('wLabel').textContent = `Citerne FPT ${Math.round(water.level)} L${water.hydrant ? ' · poteau' : ''}`; bar('wBar', water.ratio);
    $('aLabel').textContent = `Air ARI ${Math.floor(p.air / 60)}:${String(Math.floor(p.air % 60)).padStart(2, '0')}`; bar('aBar', p.air / p.airMax);
    $('aBar').className = p.air / p.airMax < 0.25 ? 'low' : '';
    $('hLabel').textContent = `Santé ${Math.round(p.hp)} %`; bar('hBar', p.hp / 100); $('hBar').className = p.hp < 35 ? 'low' : '';
    $('hoseRow').style.display = p.hose || g.carried ? 'flex' : 'none';
    $('hoseLabel').textContent = g.carried ? `Victime portée (${Math.round(g.carried.hp)} %)` : p.hose ? `Tuyau ${Math.round(p.hoseLength())} / ${p.hose.max} m · ${p.mode === 'jet' ? 'Jet droit' : 'Diffusé'}` : '';
    const vic = m.victims.filter((v) => v.state !== 'saved');
    $('crew').innerHTML = g.crew.m.map((c) => `<div><b>${c.name}</b> ${c.carry ? 'évacue une victime' : TASK[c.task] ?? c.task}</div>`).join('')
      + (vic.length ? `<div class="vic">${vic.map((v) => (v.state === 'dead' ? '✖' : `🧍 ${Math.round(v.hp)} %`)).join(' · ')}</div>` : '')
      + '<small>1 lance · 2 reco · 3 ventiler · 4 regroupement</small>';

    $('drive').style.display = veh ? 'block' : 'none';
    if (veh) {
      $('kmh').textContent = Math.round(Math.abs(veh.phys.speed) * 3.6);
      $('siren').classList.toggle('off', !veh.siren); $('limit').textContent = g.rules.limit;
      $('view').textContent = `${veh.s.name} · ${g.rig.name}`;
    }
    $('cross').style.display = veh || g.ladderOp ? 'none' : 'block';
    $('prompt').textContent = info.prompt; $('prompt').style.opacity = info.prompt ? 1 : 0;
    $('smoke').style.opacity = info.smoke; $('heat').style.opacity = info.heat;
    $('nozzle').textContent = !veh && p.hose ? (p.mode === 'jet' ? '◉ Jet' : '◎ Diffusé') : '';

    this.drawMap(this.mini, 220, 260, false);
    if (this.mapOpen) this.drawMap(this.full, 760, 1100, true);
  }

  drawMap(c, size, span, full) {
    const g = this.g, f = full ? { x: 0, z: 0 } : g.focus, k = size / span;
    const X = (x) => size / 2 + (x - f.x) * k, Z = (z) => size / 2 + (z - f.z) * k;
    c.clearRect(0, 0, size, size);
    c.fillStyle = '#0d1219e6'; c.beginPath(); full ? c.rect(0, 0, size, size) : c.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); c.fill();
    c.save(); if (!full) { c.beginPath(); c.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2); c.clip(); }
    c.strokeStyle = '#4a5566'; c.lineWidth = Math.max(2, 12 * k);
    for (let i = 0; i < G; i++) {
      c.beginPath(); c.moveTo(X(coord(0)), Z(coord(i))); c.lineTo(X(coord(G - 1)), Z(coord(i))); c.stroke();
      c.beginPath(); c.moveTo(X(coord(i)), Z(coord(0))); c.lineTo(X(coord(i)), Z(coord(G - 1))); c.stroke();
    }
    c.fillStyle = '#c8161d';
    if (full || k > 0.5) for (const h of HYDRANTS) { const hx = X(h.x), hz = Z(h.z); if (hx > 0 && hx < size && hz > 0 && hz < size) c.fillRect(hx - 1.5, hz - 1.5, 3, 3); }
    c.font = 'bold 10px sans-serif'; c.textAlign = 'center';
    c.fillStyle = '#ff5a5f'; c.fillRect(X(CASERNE.x) - 7, Z(CASERNE.z) - 7, 14, 14); c.fillStyle = '#fff'; c.fillText('CS', X(CASERNE.x), Z(CASERNE.z) + 4);
    c.fillStyle = '#2f80ed'; c.fillRect(X(HOSPITAL.x) - 7, Z(HOSPITAL.z) - 7, 14, 14); c.fillStyle = '#fff'; c.fillText('H', X(HOSPITAL.x), Z(HOSPITAL.z) + 4);
    const t = g.mission.target;
    if (t) { c.fillStyle = g.mission.state === 'retour' || g.mission.state === 'transport' ? '#7fd1ff' : '#ff8a00'; c.beginPath(); c.arc(X(t.x), Z(t.z), 7, 0, Math.PI * 2); c.fill(); if (g.mission.fire && g.mission.lot && g.mission.state !== 'retour') { c.font = '16px sans-serif'; c.fillText('🔥', X(g.mission.lot.x), Z(g.mission.lot.z) - 8); } }
    for (const v of g.mission.victims) if (v.found && v.state === 'waiting') { c.fillStyle = '#ffd60a'; c.fillRect(X(v.x) - 3, Z(v.z) - 3, 6, 6); }
    for (const veh of g.vehicles) {
      const p = veh.phys; c.save(); c.translate(X(p.x), Z(p.z)); c.rotate(-p.heading);
      c.fillStyle = veh === g.truck ? '#ff3b30' : '#f2f2f2'; c.fillRect(-4, -8, 8, 16); c.restore();
    }
    for (const m of g.crew.m) if (m.task !== 'ride') { c.fillStyle = '#9be15d'; c.beginPath(); c.arc(X(m.x), Z(m.z), 3, 0, Math.PI * 2); c.fill(); }
    if (!g.driving) { c.fillStyle = '#ffd60a'; c.beginPath(); c.arc(X(g.player.x), Z(g.player.z), 4, 0, Math.PI * 2); c.fill(); }
    c.restore();
  }
}

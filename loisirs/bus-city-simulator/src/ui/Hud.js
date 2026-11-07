import * as THREE from 'three';
import { drawMinimap, drawFullMap } from './Minimap.js';
import { WEATHER_LABEL } from '../world/Environment.js';
import { LEVEL_XP } from '../economy/Economy.js';

const $ = (id) => document.getElementById(id);
const el = Object.fromEntries(['clock', 'weather', 'money', 'level', 'xpbar', 'nsName', 'nsDist', 'nsDelta', 'arrow', 'nextstop', 'prompt', 'pax', 'sat', 'satbar', 'enbar', 'enlabel', 'limit',
  'kmh', 'gear', 'hb', 'lights', 'indL', 'indR', 'view', 'help', 'dial', 'toasts', 'event', 'minimap', 'mapfull', 'maparea', 'door', 'ramp'].map((i) => [i, $(i)]));
const dg = el.dial.getContext('2d');
const stopEdge = (s) => s.stop.edgeIndex;

function drawDial(kmh) {
  const MAX = 100, a0 = Math.PI * 0.8, a1 = Math.PI * 2.2, cx = 120, cy = 130, r = 100;
  dg.clearRect(0, 0, 240, 240);
  dg.fillStyle = '#0b0d11e6'; dg.beginPath(); dg.arc(cx, cy, r + 12, 0, 7); dg.fill();
  dg.strokeStyle = '#cfd6df'; dg.fillStyle = '#cfd6df'; dg.font = '12px system-ui'; dg.textAlign = 'center';
  for (let v = 0; v <= MAX; v += 10) {
    const a = a0 + (v / MAX) * (a1 - a0), c = Math.cos(a), s = Math.sin(a);
    dg.lineWidth = 2; dg.beginPath(); dg.moveTo(cx + c * (r - 10), cy + s * (r - 10)); dg.lineTo(cx + c * r, cy + s * r); dg.stroke();
    dg.fillText(v, cx + c * (r - 24), cy + s * (r - 24) + 4);
  }
  const a = a0 + (Math.min(Math.abs(kmh), MAX) / MAX) * (a1 - a0);
  dg.strokeStyle = '#ff5a3c'; dg.lineWidth = 3; dg.beginPath(); dg.moveTo(cx, cy); dg.lineTo(cx + Math.cos(a) * (r - 14), cy + Math.sin(a) * (r - 14)); dg.stroke();
  dg.fillStyle = '#fff'; dg.font = 'bold 22px system-ui'; dg.fillText(Math.round(Math.abs(kmh)), cx, cy + 50);
}

export class Hud {
  constructor(game) {
    this.g = game; this.mapOpen = false;
    this.frame = 0;
  }
  toggleHelp() { el.help.classList.toggle('hidden'); }
  toggleMap() { this.mapOpen = !this.mapOpen; el.maparea.style.display = this.mapOpen ? 'flex' : 'none'; }

  toast(msg, kind = 'info') {
    const d = document.createElement('div');
    d.className = `toast ${kind}`; d.textContent = msg;
    el.toasts.appendChild(d);
    while (el.toasts.children.length > 5) el.toasts.firstChild.remove();
    setTimeout(() => d.classList.add('out'), 5200); setTimeout(() => d.remove(), 5800);
  }

  update(ctl) {
    const g = this.g, v = g.vehicle, p = v.phys, s = g.service, e = g.economy;
    const kmh = p.speed * 3.6;
    el.kmh.textContent = Math.round(Math.abs(kmh));
    el.gear.textContent = p.speed > 0.3 ? 'D' : p.speed < -0.3 ? 'R' : 'N';
    el.hb.classList.toggle('off', !ctl.handbrake);
    el.lights.classList.toggle('off', !v.lights);
    el.indL.classList.toggle('off', ctl.indicator <= 0);
    el.indR.classList.toggle('off', ctl.indicator >= 0);
    el.door.classList.toggle('off', !s.doorsOpen);
    el.ramp.classList.toggle('off', !s.rampOn);
    el.view.textContent = g.rig.name;
    el.dial.style.display = 'none'; // le combiné 3D de la cabine remplace ce cadran 2D
    if (g.rig.cabin) drawDial(kmh);

    el.clock.textContent = g.env.clock;
    el.weather.textContent = WEATHER_LABEL[g.env.weather];
    el.money.textContent = `${Math.round(e.d.money).toLocaleString('fr-FR')} €`;
    el.money.classList.toggle('neg', e.d.money < 0);
    el.level.textContent = `Niveau ${e.level}`;
    el.xpbar.style.width = `${Math.round(e.xpProgress() * 100)}%`;
    el.pax.textContent = `${s.onboard} / ${s.capacity}`;
    el.sat.textContent = `${Math.round(s.satisfaction)}%`;
    el.satbar.style.width = `${s.satisfaction}%`;
    el.satbar.style.background = s.satisfaction > 60 ? '#3ddc84' : s.satisfaction > 30 ? '#ffb000' : '#ff453a';
    el.enbar.style.width = `${v.energy * 100}%`;
    el.enbar.style.background = v.energy > 0.2 ? '#4aa3ff' : '#ff453a';
    el.enlabel.textContent = v.stats.electric ? '⚡ Batterie' : '⛽ Carburant';
    el.limit.textContent = g.rules.limit;

    el.event.textContent = g.events.label;
    el.event.style.display = g.events.label ? 'block' : 'none';
    const stop = s.stop;
    el.nextstop.style.display = s.active ? 'flex' : 'none';
    if (!s.active) { window.GameSettings?.arrow(null); this.gg?.update(null); }
    if (s.active) {
      const r = p.refPoint(), dx = stop.x - r.x, dz = stop.z - r.z;
      el.nsName.textContent = `${s.stopIdx + 1}/${s.line.stops.length} · ${stop.name}`;
      el.nsDist.textContent = `${Math.round(Math.hypot(dx, dz))} m`;
      const late = Math.round(s.delay);
      el.nsDelta.textContent = late > 20 ? `+${late} s de retard` : late < -20 ? `${-late} s d'avance` : 'à l\'heure';
      el.nsDelta.className = late > 60 ? 'bad' : late > 20 ? 'warn' : 'ok';
      let rel = Math.atan2(dx, dz) - p.heading; rel = Math.atan2(Math.sin(rel), Math.cos(rel));
      const GS = window.GameSettings; // guidage commun (assets/quality.js) : flèche en haut + chevrons au sol sur le trajet de la ligne jusqu'au prochain arrêt
      if (GS) {
        GS.arrow(Math.hypot(dx, dz) < 30 ? null : rel, `${Math.round(Math.hypot(dx, dz))} m`);
        if (!this.gg) this.gg = GS.ground(THREE, g.scene);
        const path = s.line.path, E = path.length, pts = [{ x: r.x, y: 0, z: r.z }];
        let bi = 0, bd = Infinity;
        for (let k = 0; k < E; k++) { const d = (path[k].x - r.x) ** 2 + (path[k].z - r.z) ** 2; if (d < bd) { bd = d; bi = k; } }
        const ahead = (q) => (q.x - r.x) * Math.sin(p.heading) + (q.z - r.z) * Math.cos(p.heading) > 0; // jamais de chevron vers l'arrière
        if (!ahead(path[bi])) bi = (bi + 1) % E;
        const n = (((stopEdge(s) - bi) % E) + E) % E;
        for (let k = 0; k <= Math.min(n, 14); k++) pts.push({ x: path[(bi + k) % E].x, y: 0, z: path[(bi + k) % E].z });
        if (ahead(stop)) pts.push({ x: stop.x, y: 0, z: stop.z });
        if (Math.hypot(dx, dz) < 30) pts.length = 0; // arrivé à l'arrêt : plus de tracé
        this.gg.update(pts.length > 1 ? pts : null, performance.now() / 1000);
      }
    }
    el.prompt.textContent = ctl.prompt || s.promptText;
    el.prompt.style.opacity = el.prompt.textContent ? 1 : 0;

    if ((this.frame++ & 1) === 0) drawMinimap(el.minimap, g);
    if (this.mapOpen) drawFullMap(el.mapfull, g);
  }
}

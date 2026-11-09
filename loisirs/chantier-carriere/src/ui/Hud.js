// HUD : argent et grade, horloge/météo, commandes clients, concasseur, flotte (1-5), jauges de l'engin actif, invite d'action,
// messages, mini-carte et carte complète (M), aide (I).
import { SPECS } from '../machines/Machine.js';
import { PLANT } from '../world/Plant.js';
import { ZONES } from '../world/Site.js';
import { N, CELL, HALF, tonnes } from '../core/terrain.js';
import { WEATHER_LABEL } from '../world/Environment.js';

const $ = (id) => document.getElementById(id);
const fmtT = (s) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.floor(Math.max(0, s) % 60)).padStart(2, '0')}`;
const ICON = { loader: '🚜', excavator: '🏗', dumper: '🚛', dozer: '🚧', truck: '🚚' };

export class Hud {
  constructor(game) {
    this.g = game; this.mapOpen = false;
    $('hud').innerHTML = `
    <div id="topbar" class="hud"><b id="money">0 €</b><span id="grade"></span><div class="bar"><i id="xpbar"></i></div><span id="clock"></span></div>
    <div id="orders" class="hud"></div>
    <div id="plant" class="hud"></div>
    <div id="fleet" class="hud"></div>
    <div id="prompt" class="hud"></div>
    <div id="toasts"></div>
    <div id="side" class="hud">
      <div class="row"><b id="mName"></b><span id="mView"></span></div>
      <div class="row"><span>Carburant</span><span id="fuelTxt"></span></div><div class="bar"><i id="fuelBar"></i></div>
      <div class="row"><span>État</span><span id="dmgTxt"></span></div><div class="bar"><i id="dmgBar"></i></div>
      <div class="row"><span id="cargoLabel">Charge</span><span id="cargoTxt"></span></div><div class="bar"><i id="cargoBar"></i></div>
      <div class="row small" id="toolTxt"></div>
    </div>
    <div id="drive" class="hud"><div id="status"><span id="lightS" class="off">💡 Phares</span><span id="beaconS" class="off">🟠 Gyrophare</span><span id="handS" class="off">⛔ Frein</span></div><div id="speed"><span id="kmh">0</span><small>km/h</small></div></div>
    <canvas id="minimap" class="hud" width="200" height="200"></canvas>
    <div id="help" class="hud hidden"></div>
    <div id="maparea"><canvas id="mapfull" width="760" height="760"></canvas></div>`;
    this.mini = $('minimap').getContext('2d'); this.full = $('mapfull').getContext('2d');
    this.terr = document.createElement('canvas'); this.terr.width = this.terr.height = N; this.terrCtx = this.terr.getContext('2d'); this.terrT = 0; this.terrVer = -1;
    $('fleet').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) this.g.switchTo(b.dataset.id); });
    $('fleet').style.pointerEvents = 'auto';
  }
  toast(msg, kind = '') {
    const el = document.createElement('div'); el.className = `toast ${kind}`; el.textContent = msg;
    $('toasts').prepend(el); while ($('toasts').children.length > 4) $('toasts').lastChild.remove();
    setTimeout(() => el.classList.add('out'), 4200); setTimeout(() => el.remove(), 4800);
  }
  toggleMap() { this.mapOpen = !this.mapOpen; $('maparea').style.display = this.mapOpen ? 'flex' : 'none'; }
  toggleHelp() { $('help').classList.toggle('hidden'); }
  helpHtml() {
    const id = this.g.active.id;
    const per = {
      loader: '<b>A / E</b> abaisser / lever les bras · <b>X / V</b> cavage / déversement du godet<br>Godet au ras du tas, avance : il se remplit. Relève et va vider (camion client, tombereau, trémie).',
      excavator: '<b>← →</b> pivoter · <b>↑ ↓</b> balancier · <b>A / E</b> flèche · <b>X / V</b> godet<br>Plonge le godet dans l’éboulis et ferme-le (X) : il se remplit. Roche en place : elle ne cède que très lentement, fais un tir de mine.',
      dozer: '<b>A / E</b> baisser / lever la lame<br>Lame basse, avance : tu pousses l’éboulis devant toi. Regroupe les tas pour la pelle et la chargeuse.',
      dumper: '<b>A / E</b> baisser / lever la benne<br>Recule jusqu’à la trémie, lève la benne : la roche tombe dans le concasseur.',
      truck: '<b>A / E</b> baisser / lever la benne<br>Charge du gravier au tas, roule jusqu’au pont-bascule et appuie sur <b>F</b> pour vendre.',
    }[id];
    return `<b>${this.g.active.s.name}</b><br><b>Z S Q D</b> conduire · <b>Espace</b> frein à main · <b>H</b> klaxon · <b>L</b> phares · <b>G</b> gyrophare<br><b>C</b> vue (poursuite, éloignée, cabine) · <b>R</b> replacer · <b>1-5</b> changer d’engin · <b>F</b> action (carburant, atelier, pesée, tir)<br>${per}<br><b>Clic + glisser</b> tourner la caméra · <b>molette</b> zoom · <b>M</b> carte · <b>Échap</b> menu · <b>I</b> aide<br><b>Chaîne</b> : roche → trémie → concasseur → tas de gravier → camion client → pesée.`;
  }
  terrainMap() {
    const t = this.g.terrain, id = this.terrCtx.createImageData(N, N), d = id.data;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const k = j * N + i, h = t.H[k] + t.L[k], s = 0.45 + h * 0.045, o = k * 4, L = t.L[k] > 0.2;
      d[o] = (L ? (t.G[k] > 0.5 ? 205 : 110) : 150) * s; d[o + 1] = (L ? (t.G[k] > 0.5 ? 190 : 100) : 145) * s; d[o + 2] = (L ? (t.G[k] > 0.5 ? 140 : 90) : 125) * s; d[o + 3] = 255;
    }
    this.terrCtx.putImageData(id, 0, 0);
  }
  drawMap(ctx, size, full) {
    const g = this.g, a = g.active, S = size / (N * CELL);
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    if (!full) { ctx.translate(size / 2, size / 2); ctx.scale(2.2, 2.2); ctx.translate(-(a.x + HALF) * S, -(a.z + HALF) * S); }
    ctx.imageSmoothingEnabled = false; ctx.drawImage(this.terr, 0, 0, size, size);
    const P = (x, z) => [(x + HALF) * S, (z + HALF) * S];
    const dot = (x, z, c, r, sq) => { const [px, pz] = P(x, z); ctx.fillStyle = c; if (sq) ctx.fillRect(px - r, pz - r, r * 2, r * 2); else { ctx.beginPath(); ctx.arc(px, pz, r, 0, 7); ctx.fill(); } };
    const hp = PLANT.hopper; dot((hp.x0 + hp.x1) / 2, 0, '#3b82f6', 4.5 * (full ? 1 : 0.5), true); dot(PLANT.stock.x, PLANT.stock.z, '#facc15', 4 * (full ? 1 : 0.5), true);
    dot(ZONES.fuel.x, ZONES.fuel.z, '#ef4444', 4, true); dot(ZONES.workshop.x, ZONES.workshop.z + 6, '#22c55e', 4, true); dot(ZONES.weigh.x, ZONES.weigh.z, '#a3a3a3', 4, true); dot(ZONES.kiosk.x, ZONES.kiosk.z, '#fb923c', 4, true);
    for (const m of g.world.machines) if (m !== a) dot(m.x, m.z, m.ai ? '#ffffff' : '#f2b705', full ? 4 : 2.2);
    const [px, pz] = P(a.x, a.z); ctx.translate(px, pz); ctx.rotate(-a.h); ctx.fillStyle = '#22c55e'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, 7 * (full ? 1 : 0.5)); ctx.lineTo(-5 * (full ? 1 : 0.5), -6 * (full ? 1 : 0.5)); ctx.lineTo(5 * (full ? 1 : 0.5), -6 * (full ? 1 : 0.5)); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  update(info) {
    const g = this.g, e = g.economy, a = g.active, mods = g.mods, env = g.env;
    $('money').textContent = `${Math.round(e.d.money).toLocaleString('fr-FR')} €`; $('grade').textContent = e.grade; $('xpbar').style.width = `${e.xpProgress() * 100}%`;
    $('clock').textContent = `${env.clock} · ${WEATHER_LABEL[env.weather]}`;
    $('orders').innerHTML = g.orders.list.length ? g.orders.list.map((o) => `<div class="ord ${o.late ? 'late' : ''}"><b>${o.client}</b><span>${Math.round(o.done)} / ${o.qty} t · +${o.bonus} %</span><div class="bar"><i style="width:${o.done / o.qty * 100}%"></i></div><small>${o.late ? 'En retard : prime réduite' : fmtT(o.left)}</small></div>`).join('') : '<div class="ord"><small>Pas de commande : un client appellera bientôt.</small></div>';
    const pl = g.plant, sh = g.terrain.height(PLANT.stock.x, PLANT.stock.z);
    $('plant').innerHTML = `<b>Concasseur</b> <span class="${pl.running ? 'on' : ''}">${pl.running ? 'EN MARCHE' : pl.full ? 'STOCK PLEIN' : 'ARRÊTÉ'}</span><div class="row"><span>Trémie</span><span>${(pl.hopper).toFixed(0)} / ${PLANT.hopper.cap} m³</span></div><div class="bar"><i style="width:${pl.hopper / PLANT.hopper.cap * 100}%"></i></div><div class="row"><span>Tas de gravier</span><span>${sh.toFixed(1)} m</span></div><div class="bar"><i style="width:${Math.min(1, sh / PLANT.stockMax) * 100}%"></i></div>`;
    $('fleet').innerHTML = g.world.machines.filter((m) => !m.ai).map((m) => `<button data-id="${m.id}" class="${m === a ? 'sel' : ''}${m.running ? '' : ' dead'}"><span>${ICON[m.id]}</span><kbd>${m.s.key}</kbd></button>`).join('');
    $('mName').textContent = a.s.short; $('mView').textContent = g.rig.name;
    const fm = a.fuelMax(mods); $('fuelTxt').textContent = `${Math.round(a.fuel)} / ${Math.round(fm)} L`; $('fuelBar').style.width = `${a.fuel / fm * 100}%`; $('fuelBar').className = a.fuel / fm < 0.15 ? 'low' : '';
    $('dmgTxt').textContent = `${Math.round((1 - a.damage) * 100)} %`; $('dmgBar').style.width = `${(1 - a.damage) * 100}%`; $('dmgBar').className = a.damage > 0.6 ? 'low' : '';
    const cap = a.capacity(mods);
    $('cargoLabel').textContent = a.s.bed ? 'Benne' : a.id === 'dozer' ? 'Lame' : 'Godet';
    if (cap) { $('cargoTxt').textContent = `${a.cargo.vol.toFixed(1)} / ${cap.toFixed(1)} m³ · ${tonnes(a.cargo.vol, a.cargo.g).toFixed(1)} t ${a.cargo.vol > 0.05 ? (a.cargo.g > 0.5 ? '(gravier)' : '(roche)') : ''}`; $('cargoBar').style.width = `${a.cargo.vol / cap * 100}%`; }
    else { $('cargoTxt').textContent = a.tool.blade < 0.55 ? 'Basse : pousse' : 'Relevée'; $('cargoBar').style.width = `${(1 - a.tool.blade) * 100}%`; }
    $('toolTxt').textContent = a.dead ? a.dead : !a.running ? (a.fuel <= 0 ? 'Panne sèche : va à la station-service (F)' : 'Hors service : atelier (F)') : '';
    $('kmh').textContent = Math.round(Math.abs(a.speed) * 3.6);
    $('lightS').className = a.lights ? '' : 'off'; $('beaconS').className = a.beacon ? '' : 'off'; $('handS').className = info.hand ? '' : 'off';
    const pr = $('prompt'); pr.textContent = info.prompt || ''; pr.style.opacity = info.prompt ? 1 : 0;
    if (!$('help').classList.contains('hidden')) { const h = this.helpHtml(); if ($('help').dataset.k !== h) { $('help').dataset.k = h; $('help').innerHTML = h; } }
    this.terrT -= info.dt;
    if (this.terrT <= 0) { this.terrT = 1.2; if (this.terrVer !== g.terrain.version || this.mapOpen) { this.terrVer = g.terrain.version; this.terrainMap(); } }
    this.drawMap(this.mini, 200, false); if (this.mapOpen) this.drawMap(this.full, 760, true);
  }
}

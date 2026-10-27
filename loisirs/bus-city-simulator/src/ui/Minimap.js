// Minimap (cap en haut, rognée en disque) et grande carte (nord en haut).
import { G, P, ROAD, coord, nodes, CHARGERS, blockZone } from '../city/grid.js';
import { LINES } from '../lines/Lines.js';

const S = 0.5, OFF = 520, SIZE = 1040 * S;   // px par m, décalage monde, taille de la base
const ZONE_COLOR = { gare: '#2d3a55', centre: '#3b3442', commerce: '#403b2a', peripherie: '#223426' };
const TAU = Math.PI * 2;

const base = Object.assign(document.createElement('canvas'), { width: SIZE, height: SIZE });
{
  const g = base.getContext('2d');
  g.fillStyle = '#16301f'; g.fillRect(0, 0, SIZE, SIZE);
  const bx = (x) => (x + OFF) * S;
  for (let bi = 0; bi < G - 1; bi++) for (let bj = 0; bj < G - 1; bj++) {
    g.fillStyle = ZONE_COLOR[blockZone(bi, bj)];
    const w = (P - ROAD) * S;
    g.fillRect(bx((bi - 4) * P) - w / 2, bx((bj - 4) * P) - w / 2, w, w);
  }
  g.strokeStyle = '#8590a0'; g.lineWidth = ROAD * S; g.lineCap = 'butt';
  for (let k = 0; k < G; k++) {
    g.beginPath(); g.moveTo(bx(coord(0) - 20), bx(coord(k))); g.lineTo(bx(coord(G - 1) + 20), bx(coord(k))); g.stroke();
    g.beginPath(); g.moveTo(bx(coord(k)), bx(coord(0) - 20)); g.lineTo(bx(coord(k)), bx(coord(G - 1) + 20)); g.stroke();
  }
  g.fillStyle = '#4d7f3f';
  for (const n of nodes) if (n.type === 'round') { g.beginPath(); g.arc(bx(n.x), bx(n.z), 5.5 * S, 0, TAU); g.fill(); }
}

function overlays(g, game, scale, lines) {
  const bx = (x) => (x + OFF) * S;
  g.lineJoin = 'round';
  for (const l of lines) {
    g.strokeStyle = l.color; g.globalAlpha = l === game.service.line ? 1 : 0.55; g.lineWidth = 3 / scale;
    g.beginPath();
    l.path.forEach((n, i) => (i ? g.lineTo(bx(n.x), bx(n.z)) : g.moveTo(bx(n.x), bx(n.z))));
    g.closePath(); g.stroke();
  }
  g.globalAlpha = 1;
  const cur = game.service.line, pulse = 1 + 0.25 * Math.sin(game.time * 6);
  for (const l of lines) for (const s of l.stops) {
    const next = cur === l && game.service.stopIdx === s.k;
    g.fillStyle = next ? '#fff' : l.color; g.strokeStyle = '#000'; g.lineWidth = 1 / scale;
    g.beginPath(); g.arc(bx(s.x), bx(s.z), (next ? 6 * pulse : 3.2) / scale, 0, TAU); g.fill(); g.stroke();
  }
  g.fillStyle = '#1fe0b0';
  for (const c of CHARGERS) { g.beginPath(); g.arc(bx(c.x), bx(c.z), 3 / scale, 0, TAU); g.fill(); }
  g.strokeStyle = '#ff3b30'; g.lineWidth = 4 / scale;
  for (const e of game.events.closed) { g.beginPath(); g.moveTo(bx(e.ax), bx(e.az)); g.lineTo(bx(e.bx), bx(e.bz)); g.stroke(); }
}

export function drawMinimap(canvas, game) {
  const g = canvas.getContext('2d'), c = canvas.width / 2, p = game.vehicle.phys, zoom = 1.4;
  g.clearRect(0, 0, canvas.width, canvas.width);
  g.save();
  g.beginPath(); g.arc(c, c, c - 2, 0, TAU); g.clip();
  g.fillStyle = '#0d1219'; g.fillRect(0, 0, canvas.width, canvas.width);
  g.translate(c, c); g.rotate(p.heading - Math.PI); g.scale(zoom, zoom); g.translate(-(p.x + OFF) * S, -(p.z + OFF) * S);
  g.drawImage(base, 0, 0);
  overlays(g, game, zoom, game.service.line ? [game.service.line] : []);
  g.restore();
  g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(c, c - 9); g.lineTo(c + 6, c + 7); g.lineTo(c - 6, c + 7); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = '#ffffff55'; g.lineWidth = 3; g.beginPath(); g.arc(c, c, c - 2, 0, TAU); g.stroke();
}

export function drawFullMap(canvas, game) {
  const g = canvas.getContext('2d'), k = canvas.width / SIZE, p = game.vehicle.phys;
  g.clearRect(0, 0, canvas.width, canvas.height);
  g.save(); g.scale(k, k);
  g.drawImage(base, 0, 0);
  overlays(g, game, k, LINES.filter((l) => game.economy.ownsLine(l.id) || l === game.service.line));
  g.translate((p.x + OFF) * S, (p.z + OFF) * S); g.rotate(Math.atan2(Math.cos(p.heading), Math.sin(p.heading)));
  g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(9, 0); g.lineTo(-6, 5); g.lineTo(-6, -5); g.closePath(); g.fill(); g.stroke();
  g.restore();
}

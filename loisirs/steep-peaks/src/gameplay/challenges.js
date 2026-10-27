import * as THREE from 'three';
import { DISC } from '../core/config.js';
import { data, save } from '../core/save.js';
import { prog } from './progression.js';
import { PARK, summits, pois, descend, heightAt, planeY } from '../world/heightmap.js';

const MEDALS = ['—', '🥉', '🥈', '🥇'], XP = [0, 200, 400, 700];
const COL = { snowboard: 0x22c55e, ski: 0x3b82f6, wingsuit: 0xf97316 };

function label(text, color = '#e2e8f0') {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 96;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(15,15,19,0.75)'; g.beginPath(); g.roundRect(0, 8, 512, 80, 18); g.fill();
  g.fillStyle = color; g.font = '600 40px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, 256, 50);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  s.scale.set(36, 6.75, 1);
  return s;
}

// Construction des défis : positions de départ / arrivée dérivées du relief
function buildDefs() {
  const defs = [], S = summits, P = (dx, dz) => ({ x: PARK.x + dx, z: PARK.z + dz });
  const at = (o) => ({ ...o, y: heightAt(o.x, o.z) });
  // le portillon de départ est 28 m en aval du point de départ : on le franchit en skiant
  const gate = (s) => { const g = descend(s.x, s.z, 28); return { x: g.x, z: g.z }; };
  const chrono = (id, disc, name, s, L, speeds) => {
    const g = gate(s), d = descend(g.x, g.z, L), end = { x: d.x, z: d.z };
    defs.push({ id, disc, type: 'chrono', name, start: at(g), finish: at(end), len: d.len, medals: speeds.map((v) => d.len / v) });
  };
  chrono('c-board', 'snowboard', 'Descente chrono', S[0], 900, [9, 13, 18]);
  chrono('c-ski', 'ski', 'Slalom chrono', S[1], 800, [9, 13, 18]);
  chrono('c-wing', 'wingsuit', 'Vol vers la vallée', S[2], 1800, [26, 33, 40]);
  defs.push({ id: 'f-board', disc: 'snowboard', type: 'free', name: 'Descente libre 250 m', start: at(gate(S[3])), drop: 250, medals: [70, 45, 32] });
  defs.push({ id: 'f-ski', disc: 'ski', type: 'free', name: 'Descente libre 250 m', start: at(gate(S[4])), drop: 250, medals: [70, 45, 32] });
  defs.push({ id: 't-board', disc: 'snowboard', type: 'tricks', name: 'Park : score en 60 s', start: { ...P(-30, 14), y: planeY(PARK.z + 14) }, time: 60, medals: [900, 1800, 3000] });
  defs.push({ id: 't-ski', disc: 'ski', type: 'tricks', name: 'Park : score en 60 s', start: { ...P(30, 14), y: planeY(PARK.z + 14) }, time: 60, medals: [900, 1800, 3000] });
  defs.push({ id: 'j-board', disc: 'snowboard', type: 'jump', name: 'Saut géant', start: { ...P(-14, 125), y: planeY(PARK.z + 125) }, time: 40, medals: [14, 20, 28] });
  const w = at({ x: S[5].x, z: S[5].z });
  defs.push({ id: 'w-prox', disc: 'wingsuit', type: 'prox', name: 'Vol rasant', start: w, medals: [800, 1800, 3200] });
  defs.push({ id: 'w-dist', disc: 'wingsuit', type: 'dist', name: 'Distance de vol', start: at({ x: w.x + 36, z: w.z - 20 }), medals: [700, 1200, 1800] });
  return defs;
}

export class Challenges {
  constructor(scene, player, tricks, hud, audio) {
    Object.assign(this, { player, tricks, hud, audio, active: null, cool: 0 });
    this.defs = buildDefs();
    for (const d of this.defs) {
      d.col = COL[d.disc];
      this.mark(scene, d.start, d.col, d.name, 70);
      if (d.finish) this.mark(scene, d.finish, 0xffffff, 'Arrivée', 50, d.disc === 'wingsuit');
    }
    this.pois = pois;
    for (const p of pois) this.mark(scene, p, 0xfacc15, '✦ ' + p.name, 36, false, true);
  }

  mark(scene, pt, color, text, h, ring = false, small = false) {
    const g = new THREE.Group(); g.position.set(pt.x, pt.y, pt.z);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(small ? 0.6 : 1.4, small ? 0.6 : 1.4, h, 10, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }));
    beam.position.y = h / 2; g.add(beam);
    const base = new THREE.Mesh(new THREE.TorusGeometry(small ? 2 : 6, 0.25, 6, 24), new THREE.MeshBasicMaterial({ color }));
    base.rotation.x = Math.PI / 2; base.position.y = 0.6; g.add(base);
    if (ring) { const r = new THREE.Mesh(new THREE.TorusGeometry(30, 0.8, 8, 36), new THREE.MeshBasicMaterial({ color })); r.position.y = 14; g.add(r); }
    const l = label(text); l.position.y = h + 5; g.add(l);
    scene.add(g);
  }

  best(id) { return data.challenges[id]; }
  medalFor(d, v) {
    const m = d.medals, better = d.type === 'chrono' || d.type === 'free' ? (a, b) => a <= b : (a, b) => a >= b;
    return better(v, m[2]) ? 3 : better(v, m[1]) ? 2 : better(v, m[0]) ? 1 : 0;
  }
  unit(d) { return d.type === 'chrono' || d.type === 'free' ? 's' : d.type === 'jump' || d.type === 'dist' ? ' m' : ' pts'; }

  start(d) {
    const p = this.player;
    this.active = { d, t: 0, score0: this.tricks.total, prox0: this.tricks.proxTotal, y0: p.pos.y, x0: p.pos.x, z0: p.pos.z, dist: 0 };
    this.hud.toast(`Défi lancé : ${d.name}`);
    this.audio?.ding(3);
  }
  cancel(msg) {
    if (!this.active) return;
    if (msg) this.hud.toast(msg);
    this.active = null;
  }
  finish(v) {
    const a = this.active, d = a.d, m = this.medalFor(d, v);
    this.active = null;
    const prev = data.challenges[d.id], better = !prev || (d.type === 'chrono' || d.type === 'free' ? v < prev.best : v > prev.best);
    if (better) data.challenges[d.id] = { best: v, medal: Math.max(m, prev?.medal || 0) };
    if (m > (prev?.medal || 0)) prog.addXp(XP[m] - XP[prev?.medal || 0]);
    save();
    this.hud.result(d, v, m, this.unit(d), better);
    this.audio?.ding(m + 4);
  }
  onCrash(reason) {
    if (this.active) { this.hud.toast('Défi raté : ' + reason); this.active = null; }
  }
  onLand(info, p) {
    const a = this.active;
    if (!a) return;
    const d = a.d;
    if (d.type === 'jump' && info.air > 0.8) { if (info.dist >= d.medals[0]) this.finish(info.dist); else this.cancel(`Saut trop court (${info.dist.toFixed(0)} m)`); }
    if ((d.type === 'prox' || d.type === 'dist') && info.wing) {
      const v = d.type === 'prox' ? this.tricks.proxTotal - a.prox0 : a.dist;
      if (v >= d.medals[0]) this.finish(Math.round(v)); else this.cancel('Objectif non atteint');
    }
  }

  // texte du panneau de défi
  describe() {
    const a = this.active;
    if (!a) return null;
    const d = a.d, t = a.t;
    let line = '';
    if (d.type === 'chrono') line = `${t.toFixed(1)} s · arrivée ${Math.hypot(this.player.pos.x - d.finish.x, this.player.pos.z - d.finish.z).toFixed(0)} m`;
    if (d.type === 'free') line = `${t.toFixed(1)} s · ${Math.max(0, a.y0 - this.player.pos.y).toFixed(0)} / ${d.drop} m`;
    if (d.type === 'tricks') line = `${Math.max(0, d.time - t).toFixed(0)} s · ${this.tricks.total - a.score0} pts`;
    if (d.type === 'jump') line = `${Math.max(0, d.time - t).toFixed(0)} s · objectif ${d.medals[0]} m`;
    if (d.type === 'prox') line = `${Math.round(this.tricks.proxTotal - a.prox0)} pts de proximité`;
    if (d.type === 'dist') line = `${a.dist.toFixed(0)} m parcourus`;
    return { title: d.name, line, hint: 'C : abandonner' };
  }

  update(dt) {
    const p = this.player, a = this.active;
    this.cool -= dt;
    // points d'intérêt
    for (const o of this.pois) {
      if (!data.pois.includes(o.id) && Math.hypot(p.pos.x - o.x, p.pos.z - o.z) < 45 && Math.abs(p.pos.y - o.y) < 60) {
        data.pois.push(o.id); prog.addXp(150); save();
        this.hud.toast(`Découvert : ${o.name}  (+150 XP)`); this.audio?.ding(5);
      }
    }
    if (p.mode === 'ragdoll') return;
    if (a) {
      a.t += dt; const d = a.d;
      if (d.type === 'chrono') {
        const dist = Math.hypot(p.pos.x - d.finish.x, p.pos.z - d.finish.z), wing = d.disc === 'wingsuit';
        if (dist < (wing ? 40 : 12) && (!wing || Math.abs(p.pos.y - d.finish.y - 14) < 45)) this.finish(a.t);
        else if (a.t > 400) this.cancel('Temps écoulé');
      } else if (d.type === 'free') { if (p.pos.y <= a.y0 - d.drop) this.finish(a.t); else if (a.t > 240) this.cancel('Temps écoulé'); }
      else if (d.type === 'tricks') { if (a.t >= d.time) { const v = this.tricks.total - a.score0; if (v >= d.medals[0]) this.finish(v); else this.cancel(`Score insuffisant (${v})`); } }
      else if (d.type === 'jump') { if (a.t >= d.time) this.cancel('Temps écoulé'); }
      else if (d.type === 'dist') a.dist = Math.max(a.dist, Math.hypot(p.pos.x - a.x0, p.pos.z - a.z0));
      return;
    }
    for (const d of this.defs) {
      if (Math.hypot(p.pos.x - d.start.x, p.pos.z - d.start.z) > 16 || Math.abs(p.pos.y - d.start.y) > 30) continue;
      if (d.disc === 'wingsuit') { if (p.mode === 'wing') this.start(d); else if (this.cool < 0) { this.hud.toast(`${d.name} : saute en wingsuit (touche 3)`); this.cool = 6; } }
      else if (p.disc === d.disc && p.mode !== 'wing' && p.mode !== 'chute') { if (p.speed > 2) this.start(d); }
      else if (this.cool < 0 && p.disc !== d.disc) { this.hud.toast(`${d.name} : passe en ${DISC[d.disc].label}`); this.cool = 6; }
    }
  }
}
export { MEDALS };

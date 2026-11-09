// Équipiers IA (le binôme du chef d'agrès). Ordres : 1 établir une 2e lance, 2 reconnaissance et sauvetage,
// 3 ventiler (ouvrir les fenêtres enfumées), 4 regroupement. Ils se déplacent sur le graphe pièces / portes / escalier
// de la maison (Building.path), en ligne droite dehors. Modèle statique : la marche est simulée par un balancement.
import * as THREE from 'three';
import { loadGLB } from '../../../../assets/glb.js';
import { groundY } from '../city/grid.js';

const SPEED = 2.3, HOSE_LPM = 400;
const NAMES = ['Équipier 1', 'Équipier 2'];

// personnage déjà utilisé sur le site (proportional_low_poly_man, Robin Butler, CC-BY) habillé en sapeur-pompier :
// tenue F1 bleu nuit, bandes jaunes réfléchissantes, casque chromé, bouteille d'ARI dans le dos
let kit = null;
const loadKit = () => (kit ??= loadGLB(new URL('../../assets/models/proportional_low_poly_man__free_download.glb', location.href).href).then((s) => {
  const b = new THREE.Box3().setFromObject(s, true), size = b.getSize(new THREE.Vector3()), k = 1.8 / size.y;
  s.scale.setScalar(k); s.position.set(-((b.min.x + b.max.x) / 2) * k, -b.min.y * k, -((b.min.z + b.max.z) / 2) * k);
  const suit = new THREE.MeshStandardMaterial({ color: '#1c2738', roughness: 0.8 });
  s.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.material = suit; } });
  const g = new THREE.Group(); g.add(s);
  const band = new THREE.MeshStandardMaterial({ color: '#d8ff3a', emissive: '#556b00', roughness: 0.4 });
  for (const y of [1.02, 1.32]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16, 1, true), band); t.position.y = y; t.scale.z = 0.7; g.add(t); }
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 10, 0, Math.PI * 2, 0, Math.PI / 1.7), new THREE.MeshStandardMaterial({ color: '#c9ccd1', metalness: 0.85, roughness: 0.25 }));
  helmet.position.y = size.y * k - 0.1; g.add(helmet);
  const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.55, 12), new THREE.MeshStandardMaterial({ color: '#c8161d', metalness: 0.3, roughness: 0.5 }));
  bottle.position.set(0, 1.18, -0.2); g.add(bottle);
  return g;
}));

class Member {
  constructor(scene, i) {
    this.i = i; this.name = NAMES[i]; this.x = 0; this.z = 0; this.y = 0; this.floor = 0; this.yaw = 0;
    this.task = 'ride'; this.path = []; this.t = 0; this.phase = Math.random() * 6; this.moving = false;
    this.root = new THREE.Group(); this.root.visible = false; scene.add(this.root);
    this.body = new THREE.Group(); this.root.add(this.body);
    loadKit().then((g) => this.body.add(g.clone()));
    // lance de l'équipier : tuyau tiré depuis le FPT le long du chemin parcouru
    this.hose = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: '#d8d2c4', roughness: 0.7 }));
    this.hose.frustumCulled = false; this.hose.visible = false; scene.add(this.hose); this.trail = [];
  }
  setPath(p) { this.path = p.map((n) => ({ ...n })); }
}

export class Crew {
  constructor(scene, game) { this.g = game; this.m = [new Member(scene, 0), new Member(scene, 1)]; }

  // descente du véhicule à côté de l'arrière
  dismount(veh) {
    const r = veh.rearPoint();
    for (const m of this.m) if (m.task === 'ride') { m.x = r.x + (m.i ? 1.2 : -1.2); m.z = r.z; m.y = 0; m.floor = 0; m.task = 'follow'; m.root.visible = true; }
  }
  board() { for (const m of this.m) if (m.task === 'follow' || m.task === 'idle') { m.task = 'ride'; m.root.visible = false; this.stopHose(m); } }
  recallAll() { for (const m of this.m) { this.stopHose(m); m.carry?.drop(m.x, m.z, m.y, m.floor); m.carry = null; m.task = 'ride'; m.root.visible = false; } }
  say(m, txt, kind = '') { this.g.toast(`📻 ${m.name} : ${txt}`, kind); }

  order(n) {
    const g = this.g, b = g.mission.building, out = this.m.filter((m) => m.task !== 'ride');
    if (!out.length) { g.toast('Le binôme est dans le véhicule : descends d\'abord (F)', 'warn'); return; }
    const free = () => out.find((m) => m.task === 'follow' || m.task === 'idle') ?? out[out.length - 1];
    if (n === 4) { for (const m of out) { this.stopHose(m); m.task = 'follow'; } this.say(out[0], 'Regroupement, on vous suit.'); return; }
    if (!b?.sim || !g.mission.fire) { g.toast('Pas d\'incendie en cours : ordre sans objet', 'warn'); return; }
    const m = n === 1 ? (out.find((q) => q.i === 0) ?? free()) : n === 2 ? (out.find((q) => q.i === 1) ?? free()) : free();
    this.stopHose(m); m.carry?.drop(m.x, m.z, m.y, m.floor); m.carry = null;
    if (n === 1) {
      if (Math.hypot(g.truck.phys.x - b.ox, g.truck.phys.z - b.oz) > 70) { this.say(m, 'Le FPT est trop loin pour établir une lance.', 'warn'); return; }
      m.task = 'hose-go'; m.path = [{ ...g.truck.rearPoint(), floor: 0 }]; this.say(m, 'Reçu, j\'établis une deuxième lance.');
    }
    if (n === 2) { m.task = 'search'; m.visited = new Set(); m.path = []; this.say(m, 'Reçu, reconnaissance et recherche de victimes.'); }
    if (n === 3) { m.task = 'vent'; m.path = b.path(m, -1); m.ventT = 0; this.say(m, 'Reçu, je ventile les pièces enfumées.'); }
  }

  stopHose(m) { if (m.task?.startsWith('hose')) { m.hose.visible = false; m.trail = []; } m.spraying = false; }

  // avance sur le chemin ; renvoie vrai une fois arrivé
  walk(m, dt, b) {
    m.moving = false;
    if (!m.path.length) return true;
    const w = m.path[0], dx = w.x - m.x, dz = w.z - m.z, d = Math.hypot(dx, dz);
    if (w.door && !w.door.open) this.g.mission.building?.setDoor(w.door, true);
    if (d < 0.25) { m.path.shift(); if (w.floor !== undefined) m.floor = w.floor; return !m.path.length; }
    const k = Math.min(1, (SPEED * (m.carry ? 0.6 : 1) * dt) / d);
    m.x += dx * k; m.z += dz * k; m.yaw = Math.atan2(dx, dz); m.moving = true;
    if (b) { m.y += (b.groundY(m.x, m.z, m.y) - m.y) * Math.min(1, dt * 12); m.floor = Math.round(m.y / 3); } else m.y = 0;
    if (m.task?.startsWith('hose')) { const last = m.trail[m.trail.length - 1]; if (!last || Math.hypot(last.x - m.x, last.z - m.z) > 0.8) { m.trail.push({ x: m.x, y: m.y + 0.08, z: m.z }); this.drawHose(m); } }
    return false;
  }
  drawHose(m) {
    if (m.trail.length < 2) return;
    m.hose.geometry.dispose();
    m.hose.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(m.trail.map((p) => new THREE.Vector3(p.x, p.y, p.z))), Math.min(300, m.trail.length * 3), 0.045, 6, false);
    m.hose.visible = true;
  }

  update(dt, time) {
    const g = this.g, b = g.mission.building, sim = b?.sim, pl = g.player;
    for (const m of this.m) {
      if (m.task === 'ride') continue;
      const nearB = b && b.near(m.x, m.z, 3) ? b : null;
      switch (m.task) {
        case 'follow': {
          const tx = pl.x - Math.sin(pl.yaw) * 2.2 + (m.i ? 1 : -1) * Math.cos(pl.yaw) * 0.9, tz = pl.z - Math.cos(pl.yaw) * 2.2 - (m.i ? 1 : -1) * Math.sin(pl.yaw) * 0.9;
          if (Math.hypot(tx - m.x, tz - m.z) > 1.2) {
            m.t -= dt;
            if (m.t <= 0 || !m.path.length) {
              m.t = 0.8;
              const inB = b && (b.inside(m.x, m.z) || b.inside(pl.x, pl.z));
              m.path = inB ? [...b.path(m, b.roomAt(pl.x, pl.z, pl.floor)).slice(1), { x: tx, z: tz, floor: pl.floor }] : [{ x: tx, z: tz, floor: 0 }];
            }
            this.walk(m, dt, nearB);
          } else { m.path = []; m.moving = false; m.yaw = pl.yaw; }
          break;
        }
        case 'hose-go':
          if (this.walk(m, dt, null)) {
            m.trail = [{ ...g.truck.rearPoint(), y: 0.08 }];
            const target = this.hoseTarget(b);
            if (target < 0) { this.say(m, 'Plus de feu visible, je reste en réserve.'); m.task = 'follow'; break; }
            m.room = target; m.path = b.path({ x: b.ox, z: b.oz + 7, floor: 0 }, target); m.path.pop();   // s'arrête à la porte de la pièce
            m.task = 'hose';
          }
          break;
        case 'hose': {
          const there = this.walk(m, dt, b);
          const r = sim.rooms[m.room];
          if (there) {
            const rm = b.rooms[m.room]; m.yaw = Math.atan2(b.ox + rm.cx - m.x, b.oz + rm.cz - m.z);
            const litres = g.truck.water.draw(HOSE_LPM, dt); m.spraying = litres > 0;
            if (litres > 0) sim.applyWater(m.room, litres, r.fire > 0 ? 'jet' : 'diffuse');
            if (r.fire === 0 && r.T < 140) {
              const next = this.hoseTarget(b);
              if (next < 0 || Math.hypot(b.ox + b.rooms[next].cx - m.x, b.oz + b.rooms[next].cz - m.z) > 30) { this.say(m, `${rm.name} éteinte, plus d'autre foyer à portée.`, 'ok'); m.spraying = false; m.task = 'idle'; }
              else { this.say(m, `${rm.name} éteinte, je progresse vers ${b.rooms[next].name}.`, 'ok'); m.room = next; m.path = b.path(m, next); m.path.pop(); }
            }
          } else m.spraying = false;
          break;
        }
        case 'search': {
          if (m.carry) { if (this.walk(m, dt, nearB)) this.deliver(m); break; }
          if (this.walk(m, dt, nearB)) {
            const here = b.roomAt(m.x, m.z, m.floor);
            if (here >= 0) {
              m.visited.add(here);
              const v = g.mission.victims.find((q) => q.state === 'waiting' && !q.standing && q.building === b && b.roomAt(q.x, q.z, q.floor) === here);
              if (v) {
                v.carry(); m.carry = v; this.say(m, `Victime trouvée dans ${b.rooms[here].name}, je l'évacue !`, 'ok');
                m.path = [...b.path(m, -1), g.mission.safePoint()]; break;
              }
            }
            // pièce suivante non visitée la plus proche, assez froide pour y entrer
            const left = b.rooms.filter((r) => !m.visited.has(r.id));
            const ok = left.filter((r) => sim.rooms[r.id].T < 300);
            if (!left.length) { this.say(m, 'Reconnaissance terminée, toutes les pièces sont vues.', 'ok'); m.task = 'follow'; break; }
            if (!ok.length) { this.say(m, `Trop chaud pour entrer dans ${left.map((r) => r.name).join(', ')} : il faut attaquer d'abord.`, 'warn'); m.task = 'idle'; break; }
            const next = ok.sort((p, q) => Math.hypot(b.ox + p.cx - m.x, b.oz + p.cz - m.z) + Math.abs(p.floor - m.floor) * 6 - Math.hypot(b.ox + q.cx - m.x, b.oz + q.cz - m.z) - Math.abs(q.floor - m.floor) * 6)[0];
            m.path = b.path(m, next.id).slice(1);
          }
          break;
        }
        case 'vent':
          if (this.walk(m, dt, nearB)) {
            m.ventT -= dt;
            if (m.ventT <= 0) {
              m.ventT = 1.2;
              const w = b.windows.find((q) => !sim.links[q.link].open && sim.rooms[q.room].smoke > 0.15 && sim.rooms[q.room].fire === 0);
              const front = b.doors.find((d) => d.exterior);
              if (front && !front.open) b.setDoor(front, true);
              else if (w) { b.openWindow(w); this.say(m, `Fenêtre ${b.rooms[w.room].name} ouverte.`); }
              else { this.say(m, 'Ventilation faite. Attention : l\'air frais attise les pièces encore en feu.', 'ok'); m.task = 'follow'; }
            }
          }
          break;
      }
      // pose et balancement de marche
      m.phase += dt * (m.moving ? 9 : 0);
      m.root.position.set(m.x, m.y + (m.y < 0.1 ? groundY(m.x, m.z) : 0) + (m.moving ? Math.abs(Math.sin(m.phase)) * 0.05 : 0), m.z);
      m.root.rotation.y = m.yaw; m.body.rotation.z = m.moving ? Math.sin(m.phase) * 0.05 : 0;
      if (m.carry) { m.carry.x = m.x; m.carry.z = m.z; m.carry.y = m.y; m.carry.floor = m.floor; }
      if (m.spraying) {
        const d = { x: Math.sin(m.yaw), y: -0.05, z: Math.cos(m.yaw) };
        g.fx.emit({ x: m.x + d.x * 0.6, y: m.y + 1.2, z: m.z + d.z * 0.6 }, d, 8, false, dt);
      }
    }
  }

  // pièce en feu la plus proche de l'entrée (rez-de-chaussée d'abord)
  hoseTarget(b) {
    const s = b.sim, burning = b.rooms.filter((r) => (s.rooms[r.id].fire > 0 || s.rooms[r.id].T > 200));
    if (!burning.length) return -1;
    return burning.sort((p, q) => p.floor - q.floor || Math.hypot(p.cx, p.cz - 5) - Math.hypot(q.cx, q.cz - 5))[0].id;
  }
  deliver(m) {
    const v = m.carry; m.carry = null;
    v.drop(m.x, m.z, 0, 0);
    this.g.mission.trySave(v, m.name);
    m.task = 'search'; m.path = this.g.mission.building ? this.g.mission.building.path(m, -1).slice(-1) : [];
  }
  get spraying() { return this.m.some((m) => m.spraying); }
}

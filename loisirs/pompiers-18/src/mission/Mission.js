// Alertes 18 et déroulé : caserne -> alerte -> route -> sur place -> (bilan, brancard, transport) -> retour.
// Deux types : « feu » (maison en feu, parfois des victimes, ambulance du SAMU sur place) et « sap » (secours à personne :
// bilan, brancard, transport en VSAV jusqu'aux urgences).
import * as THREE from 'three';
import { MISSION_LOTS, IMMEUBLE_LOTS, CASERNE, SAP_SPOTS, HOSPITAL } from '../city/grid.js';
import { Victim, CONDITIONS } from './Victims.js';
import { loadGLB, fitGLB } from '../../../../assets/glb.js';
import { fixMaterials } from '../truck/Truck.js';

const CAUSES = ['Feu de cuisine signalé par un voisin', 'Fumée sortant des fenêtres de l\'étage', 'Départ de feu, alarme incendie déclenchée', 'Odeur de brûlé et fumée noire', 'Feu de chambre signalé par les occupants'];
const SAP = ['Personne tombée sur le trottoir', 'Malaise sur la voie publique', 'Personne âgée chutée, ne peut se relever', 'Cycliste blessé après une chute'];

import { missionPay } from './pay.js';
export { missionPay };

export class Mission {
  constructor(game) {
    this.g = game; this.state = 'caserne'; this.timer = 8; this.lot = null; this.t = 0; this.type = 'feu';
    this.fines = 0; this.arrival = 0; this.victims = []; this.bilanT = 0;
    this.amb = new THREE.Group(); this.amb.visible = false; game.scene.add(this.amb);
    loadGLB(new URL('../../assets/models/npc/veh-ambulance.glb', location.href).href).then((s) => { fixMaterials(s); const f = fitGLB(s, 6.2, 0); f.traverse((o) => { if (o.isMesh) o.castShadow = true; }); this.amb.add(f); });
    this.ambPos = null;
  }
  get fire() { return this.type === 'feu' || this.type === 'immeuble'; }
  get building() { return this.fire ? this.bld : null; }
  get target() {
    const s = this.state;
    if (s === 'alerte' || s === 'route') return this.lot.park;
    if (s === 'sur place') return this.lot;
    if (s === 'transport') return HOSPITAL.drop;
    if (s === 'retour') return { x: CASERNE.x, z: CASERNE.z + 24 };
    return null;
  }
  // point de dépose des victimes (ambulance du SAMU)
  safePoint() { return { x: this.ambPos?.x ?? this.lot.x, z: (this.ambPos?.z ?? this.lot.z + 14) - 2.5, floor: 0 }; }
  alive() { return this.victims.filter((v) => v.state === 'waiting' || v.state === 'carried'); }

  title() {
    const n = this.alive().length, vic = n ? ` ${n} victime${n > 1 ? 's' : ''} à évacuer (portée : F).` : '';
    switch (this.state) {
      case 'caserne': return ['En attente à la caserne', 'Reste près des engins, l\'alerte peut tomber à tout moment. 1 à 4 : ordres au binôme.'];
      case 'alerte': return this.type === 'immeuble' ? ['ALERTE · Feu d\'immeuble', `${this.lot.address} — ${this.cause}. Départ FPT + EPA (grande échelle, à gauche du FPT).`] : this.type === 'feu' ? ['ALERTE · Feu d\'habitation', `${this.lot.address} — ${this.cause}. Monte dans le FPT (F).`] : ['ALERTE · Secours à personne', `${this.lot.address} — ${this.cause}. Prends le VSAV (F), à droite du FPT.`];
      case 'route': return [`Départ · ${this.lot.address}`, 'Sirène et gyrophares : G. Les voitures se rangent, ralentis aux carrefours.'];
      case 'sur place': {
        if (this.type === 'sap') {
          const v = this.victims[0];
          if (!v.checked) return [`Sur place · ${this.lot.address}`, 'Approche de la victime et fais le bilan : maintiens F.'];
          return [`Bilan : ${v.condition}`, Math.hypot(this.g.vsav.phys.x - v.x, this.g.vsav.phys.z - v.z) > 25 ? 'Approche le VSAV à moins de 25 m pour sortir le brancard.' : 'Installe la victime sur le brancard (F), puis charge-la à l\'arrière du VSAV (F).'];
        }
        const b = this.building, f = b.sim.burningCount, bal = this.victims.filter((v) => v.standing && v.state === 'waiting').length;
        if (bal) return [`Sur place · ${this.lot.address}`, `${bal} victime${bal > 1 ? 's' : ''} au balcon : mets l'EPA en station devant la façade (F à l'arrière de l'EPA) puis va les chercher avec la nacelle. ${f} pièce${f > 1 ? 's' : ''} en feu.`];
        return [`Sur place · ${this.lot.address}`, (f ? `${f} pièce${f > 1 ? 's' : ''} en feu. Lance à l'arrière du FPT (F), ARI dans la maison.` : 'Plus de flammes : refroidis les pièces encore chaudes.') + vic];
      }
      case 'transport': return ['Transport vers les urgences', 'Conduis le VSAV jusqu\'à l\'hôpital (point bleu) et arrête-toi devant les urgences.'];
      case 'retour': return ['Intervention terminée · retour caserne', 'Ramène les engins à la caserne pour refaire le plein et attendre la prochaine alerte.'];
      default: return ['', ''];
    }
  }

  clearVictims() { for (const v of this.victims) v.dispose(); this.victims = []; this.amb.visible = false; this.ambPos = null; }

  alert() {
    this.clearVictims(); this.g.crew.recallAll();
    const r = Math.random(); this.type = r < 0.3 ? 'sap' : r < 0.55 ? 'immeuble' : 'feu';
    this.state = 'alerte'; this.t = 0; this.fines = 0; this.used0 = this.g.truck.water.used; this.bilanT = 0;
    if (this.type === 'immeuble') {
      this.lot = IMMEUBLE_LOTS[Math.floor(Math.random() * IMMEUBLE_LOTS.length)]; this.bld = this.g.immeubles[this.lot.k];
      this.start = this.bld.startFire(); this.cause = `Feu d'appartement au ${this.start.floor}e étage, fumée dans la cage d'escalier`;
      const front = this.bld.rooms.filter((r) => r.upper && r.row === 1 && r.floor >= this.start.floor - 1).sort(() => Math.random() - 0.5).slice(0, 1 + (Math.random() < 0.5 ? 1 : 0));
      for (const r of front) this.victims.push(new Victim(this.g.scene, { ...this.bld.balconySpot(r.id), building: this.bld, standing: true, condition: 'Réfugiée sur le balcon, fumée dense dans l\'appartement' }));
      this.cause += ` · ${front.length} personne${front.length > 1 ? 's' : ''} au balcon`;
    } else if (this.type === 'feu') {
      const free = MISSION_LOTS.filter((l) => l !== this.lastLot);
      this.lot = free[Math.floor(Math.random() * free.length)]; this.lastLot = this.lot; this.bld = this.g.houses[this.lot.k];
      this.cause = CAUSES[Math.floor(Math.random() * CAUSES.length)];
      const b = this.building; this.start = b.startFire();
      const nv = Math.random() < 0.3 ? 0 : Math.random() < 0.7 ? 1 : 2;
      const rooms = b.rooms.filter((r) => r.id !== this.start.id && !(r.col === 1 && r.row === 0)).sort(() => Math.random() - 0.5).slice(0, nv);
      for (const r of rooms) this.victims.push(new Victim(this.g.scene, { ...b.victimSpot(r.id), building: b, condition: CONDITIONS[Math.random() < 0.6 ? 0 : 1] }));
      if (nv) this.cause += ` · ${nv} personne${nv > 1 ? 's' : ''} signalée${nv > 1 ? 's' : ''} à l'intérieur`;
    } else {
      this.lot = SAP_SPOTS[Math.floor(Math.random() * SAP_SPOTS.length)];
      this.cause = SAP[Math.floor(Math.random() * SAP.length)];
      this.victims.push(new Victim(this.g.scene, { x: this.lot.x, z: this.lot.z, condition: CONDITIONS[2 + Math.floor(Math.random() * 3)] }));
    }
    this.g.audio.alarm(); this.g.toast(`🚨 Alerte 18 : ${this.lot.address}`, 'bad');
  }

  // le SAMU arrive avec l'ambulance quand des victimes sont signalées dans un feu
  callAmbulance() {
    if (this.ambPos || !this.victims.length || !this.fire) return;
    this.ambPos = { x: this.lot.park.x - 14, z: this.lot.park.z };
    this.amb.position.set(this.ambPos.x, 0.02, this.ambPos.z); this.amb.rotation.y = -Math.PI / 2; this.amb.visible = true;
    this.g.toast('🚑 Le SAMU est sur place : amène les victimes près de l\'ambulance.', 'ok');
  }
  // victime posée : sauvée si près de l'ambulance (feu) ; renvoie vrai si sauvée
  trySave(v, who = 'Tu', radius = 8) {
    if (v.state !== 'waiting' || !this.fire || !this.ambPos) return false;
    if (Math.hypot(v.x - this.ambPos.x, v.z - this.ambPos.z) > radius) return false;
    v.save(); this.g.toast(`✅ ${who === 'Tu' ? 'Victime' : `${who} :`} confiée au SAMU (${Math.round(v.hp)} % de santé)`, 'ok'); this.g.audio.chime();
    return true;
  }

  update(dt) {
    const g = this.g, veh = (g.driving ?? g.truck).phys;
    this.t += dt;
    const b = this.building, active = this.state !== 'caserne' && this.state !== 'retour';
    if (b?.sim && this.state !== 'caserne') b.sim.update(dt * (this.state === 'alerte' || this.state === 'route' ? 0.5 : 1));
    // santé des victimes
    for (const v of this.victims) {
      if (this.fire && b?.sim && v.state === 'waiting' && v.standing) {   // au balcon : fumée et chaleur de la pièce derrière, atténuées
        const r = b.sim.rooms[b.roomAt(v.x, v.z - 1.6, v.floor)];
        v.hurt(dt, r.smoke * 0.6, 20 + (r.T - 20) * 0.35);
      } else if (this.fire && b?.sim && v.state === 'waiting' && b.inside(v.x, v.z)) {
        const id = b.roomAt(v.x, v.z, v.floor), r = b.sim.rooms[id];
        v.hurt(dt, r.smoke, r.T * 0.8);
      } else if (this.type === 'sap' && active && this.state !== 'transport') v.hurt(dt, 0, 20);
      if (v.state === 'dead' && !v.reported) { v.reported = true; g.toast('✖ Une victime est décédée', 'bad'); }
    }
    const near = (p, d) => Math.hypot(veh.x - p.x, veh.z - p.z) < d && Math.abs(veh.speed) < 1;
    const onFoot = (p, d) => !g.driving && Math.hypot(g.player.x - p.x, g.player.z - p.z) < d;
    switch (this.state) {
      case 'caserne': if (Math.hypot(g.truck.phys.x - CASERNE.x, g.truck.phys.z - CASERNE.z - 20) < 40) this.timer -= dt; if (this.timer <= 0) this.alert(); break;
      case 'alerte': if (g.driving) this.state = 'route'; else if (onFoot(this.lot, 40)) this.arrive(); break;
      case 'route': if (near(this.lot.park, 30) || onFoot(this.lot, 40)) this.arrive(); break;
      case 'sur place':
        if (this.fire) { if (b.sim.out && !this.alive().some((v) => v.state === 'carried' || b.inside(v.x, v.z))) this.finish(); }
        else if (this.victims[0].state === 'dead') this.finish();
        break;
      case 'transport':
        if (g.driving === g.vsav && near(HOSPITAL.drop, 18)) { this.victims[0].save(); g.toast('🏥 Victime confiée aux urgences', 'ok'); this.finish(); }
        break;
      case 'retour':
        if (Math.hypot(g.truck.phys.x - CASERNE.x, g.truck.phys.z - CASERNE.z - 20) < 40 && Math.hypot(g.vsav.phys.x - CASERNE.x, g.vsav.phys.z - CASERNE.z - 20) < 40) {
          this.state = 'caserne'; this.timer = 15 + Math.random() * 20; this.clearVictims(); g.toast('Engins rentrés : citerne pleine, en attente d\'alerte.', 'ok');
        }
        break;
    }
    for (const v of this.victims) v.update(this.t);
  }

  arrive() {
    this.state = 'sur place'; this.arrival = this.t;
    this.g.toast(`Sur place en ${fmt(this.t)}. ${this.type === 'immeuble' ? 'Mets l\'EPA en station devant la façade (F à l\'arrière de l\'EPA) et établis une lance au FPT.' : this.fire ? 'Établis une lance : F à l\'arrière du FPT. Ordres au binôme : 1 à 4.' : 'Fais le bilan de la victime.'}`, 'ok');
    this.callAmbulance();
  }

  // bilan SAP : F maintenu près de la victime
  bilan(dt, holding) {
    const v = this.victims[0];
    if (!holding) { this.bilanT = 0; return 0; }
    this.bilanT += dt;
    if (this.bilanT >= 3 && !v.checked) { v.checked = true; this.g.toast(`🩺 Bilan transmis au SAMU : ${v.condition}. Transport aux urgences.`, 'ok'); }
    return Math.min(1, this.bilanT / 3);
  }
  loadVsav() { const v = this.victims[0]; v.save(); v.state = 'saved'; this.state = 'transport'; this.g.toast('Victime chargée dans le VSAV : direction les urgences.', 'ok'); }

  finish() {
    const g = this.g, e = g.economy, sim = this.building?.sim;
    if (this.fire) for (const v of this.victims) if (v.state === 'waiting' && (v.standing || !this.building.inside(v.x, v.z))) v.save();   // au balcon, évacuée par l'escalier une fois le feu éteint   // dehors : le SAMU les prend en charge
    const saved = this.victims.filter((v) => v.state === 'saved').length, dead = this.victims.filter((v) => v.state === 'dead').length;
    const damage = sim ? sim.damage() : 0, used = g.truck.water.used - this.used0;
    const res = missionPay({ type: this.fire ? 'feu' : 'sap', arrival: this.arrival, damage, used, fines: this.fines, burnedOut: damage > 0.9, saved: this.fire ? saved : 0, dead, hp: this.victims[0]?.hp ?? 100 });
    e.addMoney(res.pay); e.addXp(res.xp); e.d.missions++; e.d.fines += this.fines; e.d.saved += saved; e.save();
    this.state = 'retour';
    g.hud.showResult({ type: this.fire ? 'feu' : 'sap', address: this.lot.address, start: this.start?.name, arrival: this.arrival, total: this.t, damage, used, fines: this.fines, saved, dead, n: this.victims.length, ...res });
    g.audio.chime();
  }
}

export const fmt = (s) => `${Math.floor(s / 60)} min ${String(Math.floor(s % 60)).padStart(2, '0')} s`;

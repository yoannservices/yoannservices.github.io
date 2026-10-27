import * as THREE from 'three';
import { G, clamp, wrapPi } from '../core/config.js';
import { heightAt, normalAt, snowAt, downhillHeading } from '../world/heightmap.js';
import { rails } from '../world/park.js';
import { prog } from '../gameplay/progression.js';
import { data } from '../core/save.js';
import { snowboard } from './snowboard.js';
import { ski } from './ski.js';
import { enterWing, wingStep, chuteStep } from './wingsuit.js';

const TAU = Math.PI * 2, DISCS = { snowboard, ski };
const MU = [0.09, 0.04, 0.018]; // frottement : poudreuse, damée, glace
const f = new THREE.Vector3(), left = new THREE.Vector3(), gt = new THREE.Vector3(), n2 = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);

// État + physique des trois disciplines (sol, air, grind, vol, parachute, chute)
export class Player {
  constructor(ctx) {
    this.ctx = ctx; // { terrain, character, tricks, audio, hud, challenges, avalanche }
    this.pos = new THREE.Vector3(); this.vel = new THREE.Vector3();
    this.up = new THREE.Vector3(0, 1, 0); this.n = new THREE.Vector3(0, 1, 0);
    this.wing = { alpha: 0.17, pitch: 0, roll: 0 };
    this.groundDisc = 'snowboard'; this.disc = 'snowboard'; this.D = snowboard;
    this.safe = []; this.safeT = 0; this.prev = new THREE.Vector3(); this.t = 0;
    this.refreshStats();
    this.spawn(0, 0, 0);
  }

  refreshStats() {
    this.stats = { snowboard: prog.equipped('snowboard'), ski: prog.equipped('ski'), wingsuit: prog.equipped('wingsuit') };
    this.ctx.character?.applyLook();
  }
  get st() { return this.stats[this.disc === 'wingsuit' ? 'wingsuit' : this.disc]; }

  spawn(x, z, heading, disc) {
    if (this.mode === 'ragdoll') this.ctx.character.endRagdoll();
    if (disc) { this.groundDisc = disc; this.disc = disc; this.D = DISCS[disc]; }
    this.pos.set(x, heightAt(x, z), z); this.prev.copy(this.pos); this.vel.set(0, 0, 0);
    this.heading = heading; this.mode = 'ground'; this.grounded = true;
    this.edge = 0; this.crouch = 0; this.spin = 0; this.flip = 0; this.spinV = 0; this.flipV = 0;
    this.airT = 0; this.grab = 0; this.speed = 0; this.agl = 0; this.snow = 0; this.slope = 0; this.safe = []; this.safeT = 0;
    this.up.set(0, 1, 0); this.takeoffPos = this.pos.clone(); this.pending = null; this.drifting = false; this.grindT = 0;
    this.ctx.tricks?.reset();
  }

  switchTo(d) {
    if (d === this.disc || this.mode === 'ragdoll') return;
    if (d === 'wingsuit') {
      if (this.mode === 'ground' || this.mode === 'air' || this.mode === 'grind') { enterWing(this); this.ctx.audio?.whoosh(1); this.ctx.hud?.toast('Wingsuit déployée'); }
      return;
    }
    if (this.mode === 'wing') { this.pending = d; this.ctx.hud?.toast('Parachute : atterris pour passer en ' + DISCS[d].label); this.openChute(); return; }
    this.disc = this.groundDisc = d; this.D = DISCS[d];
    this.ctx.audio?.whoosh(0.5);
  }
  openChute() {
    this.mode = 'chute'; this.disc = this.pending || this.groundDisc; this.D = DISCS[this.disc]; this.groundDisc = this.disc; this.pending = null;
    this.ctx.audio?.whoosh(0.7);
  }

  update(dt, inp) {
    const { terrain } = this.ctx;
    this.t += dt; data.stats.time += dt;
    this.prev.copy(this.pos);
    if (this.mode === 'ground') this.ground(dt, inp);
    else if (this.mode === 'air') this.air(dt, inp);
    else if (this.mode === 'grind') this.grind(dt, inp);
    else if (this.mode === 'wing' || this.mode === 'chute') this.fly(dt, inp);
    else this.ragdoll(dt, inp);
    this.inp = inp;
    this.speed = this.vel.length();
    this.hSpeed = Math.hypot(this.vel.x, this.vel.z);
    if (this.mode !== 'ragdoll') {
      const gy = heightAt(this.pos.x, this.pos.z);
      this.agl = this.pos.y - gy;
      if (this.mode === 'wing') { // proximité du relief : sol sous soi et 12 m devant
        const ahead = heightAt(this.pos.x + this.vel.x * 0.35, this.pos.z + this.vel.z * 0.35);
        this.agl = Math.min(this.agl, this.pos.y + this.vel.y * 0.35 - ahead);
      }
      // obstacles (arbres / rochers)
      if (this.mode !== 'chute') {
        const r = terrain.hitObstacle(this.pos.x, this.pos.y, this.pos.z);
        if (r && this.mode !== 'wing' && this.speed > 3.5) this.crash('obstacle');
        else if (r && this.mode === 'wing') this.crash('obstacle');
      }
      // réorientation douce du corps
      const target = this.mode === 'ground' || this.mode === 'grind' ? this.n : UP;
      this.up.lerp(target, Math.min(1, dt * (this.grounded ? 12 : 2))).normalize();
      // statistiques
      const sp = this.speed * 3.6;
      if (sp > data.stats.topSpeed) data.stats.topSpeed = sp;
      data.stats.dist += this.pos.distanceTo(this.prev);
      // point de repli pour la relance
      if (this.grounded && this.speed > 1.5 && this.mode === 'ground') {
        this.safeT += dt;
        if (this.safeT > 1.5) { this.safeT = 0; this.safe.push(this.pos.clone()); if (this.safe.length > 3) this.safe.shift(); }
      }
      // traces dans la neige
      if (this.grounded && this.mode === 'ground' && this.speed > 0.8) this.stamp();
    }
    // visuel : le spin/flip résiduel à l'atterrissage se résorbe
    if (this.grounded) {
      this.spin -= Math.sign(this.spin) * Math.min(Math.abs(this.spin), 10 * dt);
      this.flip -= Math.sign(this.flip) * Math.min(Math.abs(this.flip), 10 * dt);
    }
  }

  stamp() {
    const { terrain } = this.ctx, d = this.disc, px = this.prev.x, pz = this.prev.z, x = this.pos.x, z = this.pos.z;
    const a = [0.5, 0.4, 0.15][this.snow], col = this.snow === 2 ? '230,240,255' : this.snow === 0 ? '120,140,175' : '150,165,190';
    if (d === 'snowboard') terrain.stamp(px, pz, x, z, this.drifting ? 0.9 : 0.5, a, col);
    else {
      const c = Math.cos(this.heading), s = Math.sin(this.heading), o = 0.17;
      terrain.stamp(px + c * o, pz - s * o, x + c * o, z - s * o, 0.13, a + 0.1, col);
      terrain.stamp(px - c * o, pz + s * o, x - c * o, z + s * o, 0.13, a + 0.1, col);
    }
  }

  ground(dt, inp) {
    const D = this.D, st = this.st, v = this.vel, pos = this.pos, n = this.n;
    normalAt(pos.x, pos.z, n);
    const h = heightAt(pos.x, pos.z);
    this.slope = Math.hypot(n.x, n.z) / n.y;
    this.snow = snowAt(pos.x, pos.z, h, this.slope);
    // saut chargé : maintenir espace puis relâcher
    if (inp.jump) this.crouch = Math.min(1, this.crouch + dt * 2.5);
    if (inp.jumpUp && this.grounded) {
      const j = (D.jump + 3.8 * this.crouch) * st.pop;
      v.addScaledVector(n, j); v.y += 0.5;
      this.ctx.audio?.jump(j);
      this.crouch = 0; this.takeoff(); return;
    }
    if (!inp.jump) this.crouch = Math.max(0, this.crouch - dt * 6);
    // direction (carre)
    this.drifting = inp.drift && this.speed > 4;
    const speed = v.length();
    this.edge += (inp.x - this.edge) * Math.min(1, D.edgeRate * dt);
    let turn = D.turn * st.agi / (1 + speed * D.turnDamp) * (inp.brake ? 1.4 : 1) * (this.drifting ? 1.5 : 1);
    this.heading -= this.edge * turn * dt;
    f.set(Math.sin(this.heading), 0, Math.cos(this.heading)); f.addScaledVector(n, -f.dot(n)).normalize();
    left.crossVectors(n, f);
    v.addScaledVector(n, -v.dot(n));
    gt.set(0, -G, 0).addScaledVector(n, G * n.y);
    v.addScaledVector(gt, dt);
    let vf = v.dot(f), vl = v.dot(left);
    // adhérence latérale : chute en glace, en dérapage, à vitesse élevée sur la carre
    let k = D.grip * st.grip * D.snowGrip[this.snow] * (1 - 0.25 * Math.abs(this.edge) * clamp(speed / 40, 0, 1));
    if (this.drifting) k *= 0.2;
    if (inp.brake) k *= D.brakeSkid;
    vl *= Math.exp(-k * dt);
    const mu = MU[this.snow] / st.speed;
    let dec = (mu * G * n.y + (inp.brake ? 6 : 0) + (this.drifting ? 1.5 : 0)) * dt;
    vf = vf > 0 ? Math.max(0, vf - dec) : Math.min(0, vf + dec);
    vf -= D.drag * D.snowDrag[this.snow] / st.speed * (inp.tuck ? 0.6 : 1) * vf * Math.abs(vf) * dt;
    if (inp.tuck && speed < D.pushMax) vf += D.push * dt; // poussée (bâtons / appuis)
    v.copy(f).multiplyScalar(vf).addScaledVector(left, vl);
    if (this.slope < 0.1 && v.lengthSq() < 0.04) v.set(0, 0, 0);
    pos.addScaledVector(v, dt);
    // ouverture : le terrain s'est dérobé -> en l'air
    const gy = heightAt(pos.x, pos.z), dy = pos.y - gy;
    if (this.tryGrind(inp)) return;
    normalAt(pos.x, pos.z, n2);
    // la vitesse s'éloigne de la surface (crête, lèvre de kicker) : décollage balistique
    if (dy > 0.35 + this.slope * 0.1 || (v.dot(n2) > 1.6 && dy > -0.02)) { this.takeoff(); return; }
    pos.y = gy;
    const sp = v.length();
    v.addScaledVector(n2, -v.dot(n2));
    if (sp > 0 && v.lengthSq() > 1e-6) v.setLength(sp);
    if (n2.y < 0.3 && sp > 14) this.crash('falaise');
    if (this.drifting) this.ctx.tricks.drift(dt, sp);
    this.ctx.audio?.setGlide(sp, this.snow, true);
  }

  takeoff() {
    this.grounded = false; this.mode = 'air'; this.airT = 0; this.takeoffPos = this.pos.clone();
    this.spin = 0; this.flip = 0; this.spinV = 0; this.flipV = 0;
    this.ctx.tricks.takeoff(this);
  }

  air(dt, inp) {
    const D = this.D, v = this.vel, pos = this.pos;
    v.y -= G * dt; v.multiplyScalar(1 - 0.012 * dt);
    this.airT += dt; this.grab = inp.grab;
    this.crouch = 0;
    this.spinV += (-inp.x * D.spinRate - this.spinV) * Math.min(1, 7 * dt);
    this.flipV += (inp.y * D.flipRate * (this.airT > 0.2 ? 1 : 0) - this.flipV) * Math.min(1, 7 * dt);
    this.spin += this.spinV * dt; this.flip += this.flipV * dt;
    this.edge *= 0.9;
    pos.addScaledVector(v, dt);
    this.ctx.tricks.air(dt, this);
    if (this.tryGrind(inp)) return;
    const gy = heightAt(pos.x, pos.z);
    if (pos.y <= gy) this.land(gy);
  }

  land(gy) {
    const v = this.vel, n = this.n, pos = this.pos;
    normalAt(pos.x, pos.z, n); pos.y = gy;
    const impact = -v.dot(n), sp = v.length();
    const sR = Math.abs(this.spin - Math.round(this.spin / Math.PI) * Math.PI), fR = Math.abs(this.flip - Math.round(this.flip / TAU) * TAU);
    const info = {
      air: this.airT, spin: this.spin, flip: this.flip, grabT: this.ctx.tricks.cur.grabT, grabId: this.ctx.tricks.cur.grabId,
      dist: Math.hypot(pos.x - this.takeoffPos.x, pos.z - this.takeoffPos.z), impact, disc: this.disc,
    };
    if (impact > 21 || fR > 0.9 || sR > 1.15 || (n.y < 0.35 && sp > 12)) return this.crash(fR > 0.9 ? 'réception ratée' : sR > 1.15 ? 'réception de travers' : 'impact');
    v.addScaledVector(n, -impact);
    v.multiplyScalar(this.snow === 0 ? 0.97 : 0.995);
    this.spin = wrapPi(this.spin); this.flip = wrapPi(this.flip); this.spinV = this.flipV = 0;
    this.mode = 'ground'; this.grounded = true; this.grab = 0; this.airT = 0;
    this.ctx.audio?.thump(impact);
    this.ctx.tricks.land(info, this);
    this.ctx.challenges?.onLand(info, this);
  }

  tryGrind(inp) {
    if (this.vel.y > 2 || this.disc === 'wingsuit') return false;
    for (const r of rails) {
      const dx = this.pos.x - r.a.x, dy = this.pos.y - r.a.y, dz = this.pos.z - r.a.z;
      const t = dx * r.dir.x + dy * r.dir.y + dz * r.dir.z;
      if (t < -0.5 || t > r.len) continue;
      const cx = r.a.x + r.dir.x * t, cy = r.a.y + r.dir.y * t, cz = r.a.z + r.dir.z * t;
      if (Math.hypot(this.pos.x - cx, this.pos.z - cz) > r.r) continue;
      const hy = this.pos.y - cy;
      if (hy > -0.25 && hy < 0.6) {
        const wasAir = this.mode === 'air';
        this.mode = 'grind'; this.rail = r; this.gt = Math.max(0, t); this.gspeed = Math.max(this.vel.dot(r.dir), 6);
        this.grindT = 0; this.grounded = true; this.grab = 0; this.ctx.tricks.grindStart(r.kind, this, wasAir);
        this.ctx.audio?.thump(4);
        return true;
      }
    }
    return false;
  }

  grind(dt, inp) {
    const r = this.rail;
    this.grindT += dt;
    this.gt += this.gspeed * dt;
    this.gspeed = Math.max(4, this.gspeed - 0.4 * dt);
    this.pos.copy(r.a).addScaledVector(r.dir, Math.min(this.gt, r.len));
    this.heading = Math.atan2(r.dir.x, r.dir.z);
    this.spin += (inp.x * -1.4 - this.spin) * Math.min(1, 8 * dt);
    this.vel.copy(r.dir).multiplyScalar(this.gspeed);
    this.n.copy(UP); this.edge = 0;
    this.ctx.tricks.grind(dt, this);
    this.ctx.audio?.setGlide(this.gspeed, 2, true);
    const out = () => { this.mode = 'air'; this.grounded = false; this.airT = 0.1; this.takeoffPos = this.pos.clone(); this.spin = 0; this.flip = 0; this.spinV = this.flipV = 0; this.ctx.tricks.grindEnd(this); };
    if (inp.jump && this.grindT > 0.25) { this.vel.y += 5.5; out(); return; }
    if (this.gt >= r.len) { this.vel.y += 1; out(); }
  }

  fly(dt, inp) {
    const v = this.vel, pos = this.pos;
    if (this.mode === 'wing') {
      wingStep(this, inp, dt, this.stats.wingsuit);
      if (inp.jump && this.t - (this.wingT || 0) > 0.5) { this.openChute(); this.wingT = this.t; }
      this.ctx.tricks.wing(dt, this);
    } else chuteStep(this, inp, dt);
    const gy = heightAt(pos.x, pos.z);
    if (pos.y > gy + 0.2) return;
    pos.y = gy; normalAt(pos.x, pos.z, this.n);
    const impact = -v.dot(this.n);
    if (this.mode === 'wing' && impact > 13) return this.crash('crash en wingsuit');
    // atterrissage : on glisse dans la discipline choisie
    const wasWing = this.mode === 'wing';
    v.addScaledVector(this.n, -v.dot(this.n));
    this.disc = this.pending || this.groundDisc; this.D = DISCS[this.disc]; this.pending = null;
    this.mode = 'ground'; this.grounded = true; this.edge = 0; this.spin = this.flip = 0;
    if (wasWing) { this.heading = Math.atan2(v.x, v.z) || this.heading; this.ctx.tricks.wingEnd(this); }
    this.ctx.audio?.thump(impact);
    this.ctx.challenges?.onLand({ air: 0, dist: 0, wing: wasWing }, this);
  }

  crash(reason) {
    if (this.mode === 'ragdoll') return;
    const wasWing = this.mode === 'wing';
    this.mode = 'ragdoll'; this.ragT = 0; this.grounded = false; this.grab = 0; this.reason = reason;
    this.ctx.character.startRagdoll(this.vel);
    data.stats.crashes++;
    this.ctx.audio?.crash();
    this.ctx.tricks.crash(wasWing);
    this.ctx.challenges?.onCrash(reason, this);
    this.ctx.hud?.crash(reason);
  }

  ragdoll(dt, inp) {
    this.ragT += dt;
    const c = this.ctx.character.center;
    this.pos.copy(c); this.vel.multiplyScalar(0.98);
    this.pos.y = Math.max(this.pos.y, heightAt(c.x, c.z));
    this.speed = 0;
    if ((this.ragT > 0.8 && (inp.jumpUp || this.respawnReq)) || this.ragT > 3.2) this.respawn();
  }

  respawn() {
    this.respawnReq = false;
    const s = this.safe[0] || this.safe[this.safe.length - 1] || this.pos;
    const x = s.x, z = s.z;
    this.spawn(x, z, downhillHeading(x, z));
    this.ctx.hud?.hideCrash();
  }
}

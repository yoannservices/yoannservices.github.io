// Effets : jets des lances (plusieurs à la fois), brume d'eau, braises qui montent des pièces en feu,
// colonne de fumée au-dessus de la maison, lumières des flammes. Quantités selon le réglage « Flammes, fumée, eau ».
import * as THREE from 'three';
import { get } from '../settings.js';

const N = 1600, E = 400;
const soft = () => {
  const c = Object.assign(document.createElement('canvas'), { width: 64, height: 64 }), x = c.getContext('2d');
  const gr = x.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
};

export class Effects {
  constructor(scene) {
    this.scene = scene; const tex = soft();
    // eau
    this.pos = new Float32Array(N * 3); this.vel = new Float32Array(N * 3); this.life = new Float32Array(N); this.next = 0;
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.water = new THREE.Points(g, new THREE.PointsMaterial({ color: '#d8ecff', size: 0.09, map: tex, transparent: true, opacity: 0.8, depthWrite: false }));
    this.water.frustumCulled = false; scene.add(this.water);
    // braises
    this.epos = new Float32Array(E * 3); this.evel = new Float32Array(E * 3); this.elife = new Float32Array(E); this.enext = 0;
    const eg = new THREE.BufferGeometry(); eg.setAttribute('position', new THREE.BufferAttribute(this.epos, 3));
    this.embers = new THREE.Points(eg, new THREE.PointsMaterial({ color: '#ffb347', size: 0.07, map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.embers.frustumCulled = false; scene.add(this.embers);
    // fumée extérieure
    this.puffs = [];
    for (let i = 0; i < 110; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: '#2a2826', transparent: true, opacity: 0, depthWrite: false }));
      sp.visible = false; scene.add(sp); this.puffs.push({ sp, life: 0 });
    }
    this.lights = [0, 1, 2, 3].map(() => { const l = new THREE.PointLight('#ff7a1a', 0, 14, 1.5); scene.add(l); return l; });
  }

  // une lance : origine, direction, portée (m), diffusé
  emit(o, d, range, diffuse, dt) {
    const n = Math.ceil(dt * (diffuse ? 900 : 650) * [0.4, 0.7, 1][get('effects')]), v = Math.sqrt(range * 9.81) * (diffuse ? 0.55 : 1);
    for (let k = 0; k < n; k++) {
      const i = this.next = (this.next + 1) % N, s = diffuse ? 0.34 : 0.035;
      this.pos[i * 3] = o.x; this.pos[i * 3 + 1] = o.y; this.pos[i * 3 + 2] = o.z;
      this.vel[i * 3] = (d.x + (Math.random() - 0.5) * s) * v; this.vel[i * 3 + 1] = (d.y + 0.08 + (Math.random() - 0.5) * s) * v; this.vel[i * 3 + 2] = (d.z + (Math.random() - 0.5) * s) * v;
      this.life[i] = diffuse ? 0.45 : 1.2;
    }
  }

  // b : maison en intervention (ou null), cam : position caméra
  update(dt, b, cam) {
    for (let i = 0; i < N; i++) {
      if (this.life[i] <= 0) { this.pos[i * 3 + 1] = -50; continue; }
      this.life[i] -= dt; this.vel[i * 3 + 1] -= 9.81 * dt;
      this.pos[i * 3] += this.vel[i * 3] * dt; this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt; this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      if (this.pos[i * 3 + 1] < 0) this.life[i] = 0;
    }
    this.water.geometry.attributes.position.needsUpdate = true;

    const sim = b?.sim, fxLevel = get('effects');
    // braises : depuis les pièces en feu, montent en tourbillonnant
    if (sim && fxLevel > 0) for (const r of b.rooms) {
      const f = sim.rooms[r.id].fire;
      if (f <= 0) continue;
      const n = Math.random() < f * dt * 30 * fxLevel ? 1 : 0;
      for (let k = 0; k < n; k++) {
        const i = this.enext = (this.enext + 1) % E;
        this.epos[i * 3] = b.ox + r.cx + (Math.random() - 0.5) * 3; this.epos[i * 3 + 1] = r.floor * 3 + 0.5; this.epos[i * 3 + 2] = b.oz + r.cz + (Math.random() - 0.5) * 3;
        this.evel[i * 3] = (Math.random() - 0.5) * 0.6; this.evel[i * 3 + 1] = 0.8 + Math.random(); this.evel[i * 3 + 2] = (Math.random() - 0.5) * 0.6; this.elife[i] = 1.5 + Math.random() * 1.5;
      }
    }
    for (let i = 0; i < E; i++) {
      if (this.elife[i] <= 0) { this.epos[i * 3 + 1] = -50; continue; }
      this.elife[i] -= dt;
      this.epos[i * 3] += (this.evel[i * 3] + Math.sin(i + this.elife[i] * 3) * 0.4) * dt; this.epos[i * 3 + 1] += this.evel[i * 3 + 1] * dt; this.epos[i * 3 + 2] += this.evel[i * 3 + 2] * dt;
    }
    this.embers.geometry.attributes.position.needsUpdate = true;

    // colonne de fumée : du toit et des fenêtres éclatées
    let amount = 0;
    if (sim) for (const r of sim.rooms) amount = Math.max(amount, r.fire, r.smoke * 0.6);
    const vents = sim ? b.windows.filter((w) => sim.links[w.link].open && sim.rooms[w.room].smoke > 0.1) : [];
    const maxPuffs = [40, 75, 110][fxLevel];
    this.puffs.forEach((p, idx) => {
      p.life -= dt;
      if (p.life <= 0) {
        if (amount < 0.05 || idx >= maxPuffs) { p.sp.visible = false; return; }
        p.life = 6 + Math.random() * 4; p.age = 0; p.sp.visible = true; p.dark = amount;
        const w = vents.length && Math.random() < 0.5 ? vents[Math.floor(Math.random() * vents.length)] : null;
        if (w) { w.mesh.getWorldPosition(p.v ??= new THREE.Vector3()); p.x = p.v.x; p.y = p.v.y + 0.4; p.z = p.v.z; }
        else { p.x = b.ox + (Math.random() - 0.5) * 8; p.z = b.oz + (Math.random() - 0.5) * 6; p.y = 6.5 + Math.random() * 2; }
      }
      p.age += dt; p.y += dt * 2.4; p.x += dt * 0.8;
      const s = 2.5 + p.age * 1.7;
      p.sp.position.set(p.x, p.y, p.z); p.sp.scale.set(s, s, 1);
      p.sp.material.opacity = Math.min(0.6, p.dark * 0.75) * Math.min(1, p.age) * Math.min(1, p.life / 2);
    });

    // lumières de flammes sur les pièces en feu les plus proches de la caméra
    const on = get('lights');
    const burning = sim && on ? b.rooms.filter((r) => sim.rooms[r.id].fire > 0).map((r) => ({ r, d: Math.hypot(b.ox + r.cx - cam.x, b.oz + r.cz - cam.z) })).sort((p, q) => p.d - q.d) : [];
    this.lights.forEach((l, i) => {
      const it = burning[i];
      if (!it) { l.intensity = 0; return; }
      const f = sim.rooms[it.r.id].fire;
      l.position.set(b.ox + it.r.cx, it.r.floor * 3 + 1.2, b.oz + it.r.cz);
      l.intensity = (25 + 30 * f) * (0.75 + 0.5 * Math.random());
    });
  }
}

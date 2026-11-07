// Vue cabine : poste de conduite en primitives (planche de bord, combiné en CanvasTexture redessiné à 10 Hz,
// volant qui tourne avec le braquage). Visible seulement en vue cabine.
import * as THREE from 'three';

export class Cockpit {
  constructor(truck) {
    const s = truck.s, zf = s.wheelbase + s.frontOverhang;
    this.truck = truck; this.t = 0;
    this.eye = new THREE.Object3D(); this.eye.position.set(0.5, s.cabH - 1.05, zf - 1.3); truck.tilt.add(this.eye);
    this.root = new THREE.Group(); this.root.visible = false; truck.tilt.add(this.root);
    const dark = new THREE.MeshStandardMaterial({ color: '#1d2126', roughness: 0.8 });
    const dash = new THREE.Mesh(new THREE.BoxGeometry(s.width - 0.3, 0.32, 0.55), dark);
    dash.position.set(0, this.eye.position.y - 0.66, this.eye.position.z + 1.0); dash.rotation.x = -0.25; this.root.add(dash);
    // combiné d'instruments
    this.canvas = Object.assign(document.createElement('canvas'), { width: 512, height: 192 });
    this.tex = new THREE.CanvasTexture(this.canvas); this.tex.colorSpace = THREE.SRGBColorSpace;
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.17), new THREE.MeshBasicMaterial({ map: this.tex, polygonOffset: true, polygonOffsetFactor: -1 }));
    panel.position.set(this.eye.position.x, this.eye.position.y - 0.46, this.eye.position.z + 0.82); panel.rotation.set(-0.35, Math.PI, 0); this.root.add(panel);
    // volant
    this.wheel = new THREE.Group(); this.wheel.position.set(this.eye.position.x, this.eye.position.y - 0.55, this.eye.position.z + 0.55); this.wheel.rotation.x = -0.45 + Math.PI; this.root.add(this.wheel);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.025, 8, 32), dark); this.wheel.add(rim);
    for (const a of [0, 2.1, 4.2]) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.2, 0.02), dark); sp.position.set(Math.sin(a) * 0.1, Math.cos(a) * 0.1, 0); sp.rotation.z = -a; this.wheel.add(sp); }
    // montants de pare-brise
    for (const x of [-(s.width / 2 - 0.12), s.width / 2 - 0.12]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.1, 0.06), dark); p.position.set(x, this.eye.position.y - 0.05, this.eye.position.z + 0.85); p.rotation.x = 0.25; this.root.add(p); }
  }

  draw(water) {
    const g = this.canvas.getContext('2d'), p = this.truck.phys, kmh = Math.round(Math.abs(p.speed) * 3.6);
    g.fillStyle = '#05070a'; g.fillRect(0, 0, 512, 192);
    g.strokeStyle = '#2a2f36'; g.lineWidth = 6; g.strokeRect(3, 3, 506, 186);
    g.fillStyle = '#e8ecf2'; g.font = 'bold 84px sans-serif'; g.textAlign = 'center'; g.fillText(kmh, 150, 112);
    g.font = '24px sans-serif'; g.fillStyle = '#8a95a3'; g.fillText('km/h', 150, 150);
    g.fillStyle = this.truck.siren && Math.floor(performance.now() / 250) % 2 ? '#3b7bff' : '#1a2a4a'; g.beginPath(); g.arc(330, 60, 22, 0, 7); g.fill();
    g.fillStyle = '#8a95a3'; g.font = '20px sans-serif'; g.fillText('SIRÈNE', 330, 108);
    if (water) {
      g.fillStyle = '#1b2533'; g.fillRect(400, 30, 40, 130); g.fillStyle = water.ratio < 0.2 ? '#ff453a' : '#2f9bff'; g.fillRect(400, 30 + 130 * (1 - water.ratio), 40, 130 * water.ratio);
      g.fillStyle = '#8a95a3'; g.fillText('EAU', 420, 182);
    }
    g.fillStyle = '#e8ecf2'; g.font = 'bold 26px sans-serif'; g.fillText(this.truck.s.name, 330, 160);
    this.tex.needsUpdate = true;
  }

  update(dt, on) {
    this.root.visible = on;
    for (const b of this.truck.bar.slice(0, 2)) b.visible = !on;   // la rampe du toit masquerait la route
    if (!on) return;
    this.wheel.rotation.z = this.truck.phys.steer * 6;
    this.t -= dt; if (this.t <= 0) { this.t = 0.1; this.draw(this.truck.water); }
  }
}

// Choix de l'engin à pied : grande flèche 3D qui rebondit au-dessus du véhicule visé (ou de l'engin conseillé
// pour l'alerte en cours), avec son nom. Le joueur regarde un engin proche et appuie sur F pour y monter.
import * as THREE from 'three';

function label(text, color) {
  const c = Object.assign(document.createElement('canvas'), { width: 256, height: 80 }), g = c.getContext('2d');
  g.fillStyle = 'rgba(10,14,20,0.82)'; g.beginPath(); g.roundRect(4, 4, 248, 72, 18); g.fill();
  g.strokeStyle = color; g.lineWidth = 5; g.stroke();
  g.fillStyle = '#fff'; g.font = 'bold 44px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 128, 42);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export class Picker {
  constructor(scene) {
    this.root = new THREE.Group(); this.root.visible = false; this.root.userData.noLod = true; scene.add(this.root);
    this.mat = new THREE.MeshStandardMaterial({ color: '#22c55e', emissive: '#22c55e', emissiveIntensity: 0.9, roughness: 0.4 });
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.9, 24).rotateX(Math.PI), this.mat); head.position.y = 0.45;
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1, 16), this.mat); shaft.position.y = 1.4;
    this.arrow = new THREE.Group(); this.arrow.add(head, shaft); this.root.add(this.arrow);
    this.tag = new THREE.Sprite(new THREE.SpriteMaterial({ depthTest: false, transparent: true })); this.tag.scale.set(2.4, 0.75, 1); this.tag.position.y = 2.6; this.tag.renderOrder = 5; this.root.add(this.tag);
    this.key = '';
  }

  // vehicles : engins ; pl : joueur ; hint : engin conseillé (ou null). Renvoie l'engin visé à portée de F (ou null).
  update(time, vehicles, pl, hint, enabled) {
    let target = null, best = Infinity;
    if (enabled) for (const v of vehicles) {
      const d = v.boxDist(pl.x, pl.z);
      if (d > 4.5) continue;
      const c = v.center(), ang = Math.abs(Math.atan2(Math.sin(Math.atan2(c.x - pl.x, c.z - pl.z) - pl.yaw), Math.cos(Math.atan2(c.x - pl.x, c.z - pl.z) - pl.yaw)));
      const score = (ang < 1.0 ? ang : 3 + ang) + d * 0.15;   // d'abord l'engin regardé, sinon le plus proche
      if (score < best) { best = score; target = v; }
    }
    const show = target ?? (enabled ? hint : null);
    this.root.visible = !!show;
    if (!show) return null;
    const near = show === target, color = near ? '#22c55e' : '#ff8a1a', key = show.s.name + color;
    if (key !== this.key) { this.key = key; this.tag.material.map?.dispose(); this.tag.material.map = label(near ? `F : ${show.s.name}` : show.s.name, color); this.tag.material.needsUpdate = true; this.mat.color.set(color); this.mat.emissive.set(color); }
    const c = show.center();
    this.root.position.set(c.x, show.box.top + 0.8 + Math.abs(Math.sin(time * 3)) * 0.5, c.z);
    this.arrow.rotation.y = time * 1.5;
    const k = near ? 1 : 1.6; this.root.scale.setScalar(k);
    return target;
  }
}

// Victimes : allongées au sol (maison en feu ou rue), santé qui baisse dans la fumée et la chaleur, portées par le joueur
// ou un équipier, mises en sécurité près de l'ambulance. Modèle : proportional_low_poly_man (Robin Butler, CC-BY).
import * as THREE from 'three';
import { loadGLB } from '../../../../assets/glb.js';
import { groundY } from '../city/grid.js';

let kit = null;
function loadKit() {
  kit ??= loadGLB(new URL('../../assets/models/proportional_low_poly_man__free_download.glb', location.href).href).then((s) => {
    const b = new THREE.Box3().setFromObject(s), size = b.getSize(new THREE.Vector3()), k = 1.72 / size.y;
    s.scale.setScalar(k); s.position.set(-((b.min.x + b.max.x) / 2) * k, -b.min.y * k, -((b.min.z + b.max.z) / 2) * k);
    s.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.material = o.material.clone(); } });
    return s;
  });
  return kit;
}

export const CONDITIONS = [
  'Inconsciente, respire, intoxication aux fumées probable',
  'Consciente, désorientée, brûlures légères aux mains',
  'Chute, douleur à la jambe, ne peut pas se relever',
  'Malaise, pâle et en sueur, douleur à la poitrine',
  'Chute sur le trottoir, plaie au cuir chevelu',
];

export class Victim {
  constructor(scene, { x, z, y = 0, floor = 0, building = null, condition, standing = false }) {
    this.standing = standing;   // debout sur un balcon : appelle à l'aide, sauvée par la nacelle de l'EPA
    this.scene = scene; this.x = x; this.z = z; this.y = y; this.floor = floor; this.building = building;
    this.hp = 100; this.state = 'waiting';   // waiting | carried | saved | dead
    this.condition = condition ?? CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
    this.found = false; this.checked = false;
    this.root = new THREE.Group(); scene.add(this.root);
    this.body = new THREE.Group(); this.body.rotation.x = standing ? 0 : -Math.PI / 2; this.root.rotation.y = standing ? 0 : Math.random() * 6; this.root.add(this.body);
    // repère visible de loin dans la fumée (bandes réfléchissantes de couverture de survie quand trouvée)
    this.mark = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.7, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffd60a', transparent: true, opacity: 0.8, depthWrite: false }));
    this.mark.position.y = 0.04; this.mark.visible = false; this.root.add(this.mark);
    loadKit().then((s) => { const m = s.clone(); m.userData.y0 = m.position.y; if (!this.standing) m.position.y -= 0.86; this.body.add(m); this.model = m; });   // centré sur le bassin
    this.sync();
  }
  sync() { this.root.position.set(this.x, this.y + (this.y < 0.1 ? groundY(this.x, this.z) : 0) + (this.standing ? 0 : 0.15), this.z);   // rez-de-chaussée et dehors : posée sur le trottoir ou le parquet
    this.root.visible = this.state !== 'carried' && this.state !== 'saved'; }

  // fumée 0..1 et température au sol de la pièce
  hurt(dt, smoke, T) {
    if (this.state !== 'waiting' && this.state !== 'carried') return;
    const k = this.state === 'carried' ? 0.4 : 1;
    this.hp -= dt * k * (smoke * 0.35 + Math.max(0, T - 70) / 160 + 0.05);
    if (this.hp <= 0) { this.hp = 0; this.state = 'dead'; this.model?.traverse((o) => { if (o.isMesh) o.material.color?.multiplyScalar(0.5); }); }
  }
  carry() { this.state = 'carried'; this.found = true; this.standing = false; this.body.rotation.set(-Math.PI / 2, 0, 0); this.model && (this.model.position.y = this.model.userData.y0 - 0.86); this.sync(); }
  drop(x, z, y = 0, floor = 0) { this.x = x; this.z = z; this.y = y; this.floor = floor; if (this.state === 'carried') this.state = 'waiting'; this.sync(); }
  save() { this.state = 'saved'; this.sync(); }
  update(time) {
    if (this.standing && this.state === 'waiting') this.body.rotation.z = Math.sin(time * 6 + this.x) * 0.12;   // s'agite pour appeler à l'aide
    this.mark.visible = this.found && this.state === 'waiting'; this.mark.material.opacity = 0.5 + 0.3 * Math.sin(time * 5); }
  dispose() { this.scene.remove(this.root); }
}

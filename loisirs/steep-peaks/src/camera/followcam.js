import * as THREE from 'three';
import { clamp, wrapPi } from '../core/config.js';
import { heightAt } from '../world/heightmap.js';
import { held } from '../core/input.js';

const v = new THREE.Vector3(), tgt = new THREE.Vector3(), look = new THREE.Vector3(), q = new THREE.Quaternion(), Yq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

// Caméra : 0 = 3e personne (retard + zoom selon la vitesse), 1 = subjective, 2 = libre (debug terrain)
export class FollowCam {
  constructor(camera, character) {
    this.cam = camera; this.char = character; this.mode = 0; this.yaw = 0; this.fov = 66;
    this.free = { yaw: 0, pitch: -0.3, drag: false };
    camera.position.set(0, 400, 0);
    addEventListener('mousedown', (e) => { if (this.mode === 2) this.free.drag = true; });
    addEventListener('mouseup', () => (this.free.drag = false));
    addEventListener('mousemove', (e) => {
      if (this.mode !== 2 || !this.free.drag) return;
      this.free.yaw -= e.movementX * 0.004; this.free.pitch = clamp(this.free.pitch - e.movementY * 0.004, -1.5, 1.5);
    });
  }
  cycle() {
    this.mode = (this.mode + 1) % 3;
    if (this.mode === 2) { this.cam.getWorldDirection(v); this.free.yaw = Math.atan2(-v.x, -v.z); this.free.pitch = Math.asin(v.y); }
    return ['Vue 3e personne', 'Vue subjective', 'Caméra libre (ZQSD, Espace/Maj, glisser = regarder)'][this.mode];
  }

  update(dt, p) {
    const cam = this.cam, s = p.speed;
    if (this.mode === 2) {
      const f = this.free, sp = (held('shift') ? 160 : 45) * dt;
      cam.rotation.set(f.pitch, f.yaw, 0, 'YXZ');
      cam.getWorldDirection(v);
      const fw = (held('z') || held('w') ? 1 : 0) - (held('s') ? 1 : 0), rt = (held('d') ? 1 : 0) - (held('q') || held('a') ? 1 : 0);
      cam.position.addScaledVector(v, fw * sp);
      v.crossVectors(v, cam.up).normalize(); cam.position.addScaledVector(v, rt * sp);
      if (held('space')) cam.position.y += sp;
      cam.position.y = Math.max(cam.position.y, heightAt(cam.position.x, cam.position.z) + 1.5);
      return;
    }
    if (this.mode === 1 && p.mode !== 'ragdoll') {
      this.char.head.getWorldPosition(cam.position);
      cam.position.addScaledVector(v.set(0, 0.1, 0.16).applyQuaternion(this.char.root.quaternion), 1);
      cam.quaternion.copy(this.char.root.quaternion).multiply(Yq);
      this.setFov(dt, 78 + Math.min(25, s * 0.35));
      return;
    }
    // 3e personne : le cap suit la vitesse, la caméra traîne d'autant plus qu'on va vite
    const want = s > 4 && p.mode !== 'ragdoll' ? Math.atan2(p.vel.x, p.vel.z) : p.mode === 'ragdoll' ? this.yaw : p.heading;
    this.yaw += wrapPi(want - this.yaw) * Math.min(1, dt * (p.mode === 'wing' ? 3 : 2.4));
    const wing = p.mode === 'wing' || p.mode === 'chute';
    const dist = (wing ? 11 : 6.3) + Math.min(5, s * 0.06), h = (wing ? 2.8 : 2.2) + s * 0.012;
    tgt.set(p.pos.x - Math.sin(this.yaw) * dist, p.pos.y + h + (wing ? 1 : 0), p.pos.z - Math.cos(this.yaw) * dist);
    const k = 1 - Math.exp(-dt * Math.max(2.5, 9 - s * 0.08));
    cam.position.lerp(tgt, k);
    cam.position.y = Math.max(cam.position.y, heightAt(cam.position.x, cam.position.z) + 1.6);
    look.set(p.pos.x + Math.sin(this.yaw) * 4, p.pos.y + 1.1, p.pos.z + Math.cos(this.yaw) * 4);
    cam.lookAt(look);
    this.setFov(dt, 64 + Math.min(32, s * 0.45) + (wing ? 8 : 0));
  }
  setFov(dt, t) {
    this.fov += (t - this.fov) * Math.min(1, dt * 3);
    if (Math.abs(this.cam.fov - this.fov) > 0.05) { this.cam.fov = this.fov; this.cam.updateProjectionMatrix(); }
  }
}

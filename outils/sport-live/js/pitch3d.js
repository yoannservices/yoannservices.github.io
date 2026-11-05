/* Terrain de foot 3D (Three.js).
   Repère : x le long du terrain (-52.5 → 52.5, l'équipe domicile attaque vers +x),
   y en largeur (-34 → 34), z la hauteur. Le moteur ne fait qu'afficher :
   un « director » (sim.js) lui donne à chaque image où sont le ballon et les joueurs. */
(() => {
'use strict';
const PITCH_L = 105, PITCH_W = 68;
Object.assign(SL, { PITCH_L, PITCH_W });

/* Three.js est chargé depuis le CDN au premier affichage 3D (import dynamique :
   fonctionne aussi en ouvrant la page directement depuis le disque). */
let ready = null;
SL.loadPitch3D = () => ready || (ready = Promise.all([
  import('three'),
  import('three/addons/controls/OrbitControls.js'),
]).then(([THREE, { OrbitControls }]) => {

function pitchTexture() {
  const S = 10; // px par mètre
  const W = (PITCH_L + 10) * S, H = (PITCH_W + 10) * S;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  // Bandes de tonte
  for (let i = 0; i < 23; i++) {
    g.fillStyle = i % 2 ? '#2f8f3a' : '#2a8234';
    g.fillRect(i * W / 23, 0, W / 23 + 1, H);
  }
  g.strokeStyle = 'rgba(255,255,255,.9)';
  g.lineWidth = 0.12 * S;
  const X = m => (m + PITCH_L / 2 + 5) * S, Y = m => (m + PITCH_W / 2 + 5) * S;
  const rect = (x1, y1, x2, y2) => g.strokeRect(X(x1), Y(y1), (x2 - x1) * S, (y2 - y1) * S);
  rect(-PITCH_L / 2, -PITCH_W / 2, PITCH_L / 2, PITCH_W / 2);
  g.beginPath(); g.moveTo(X(0), Y(-PITCH_W / 2)); g.lineTo(X(0), Y(PITCH_W / 2)); g.stroke();
  g.beginPath(); g.arc(X(0), Y(0), 9.15 * S, 0, Math.PI * 2); g.stroke();
  for (const s of [-1, 1]) {
    const gx = s * PITCH_L / 2;
    rect(Math.min(gx, gx - s * 16.5), -20.16, Math.max(gx, gx - s * 16.5), 20.16);
    rect(Math.min(gx, gx - s * 5.5), -9.16, Math.max(gx, gx - s * 5.5), 9.16);
    g.beginPath(); g.arc(X(gx - s * 11), Y(0), 0.25 * S, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
    g.beginPath();
    const a = Math.acos(5.5 / 9.15);
    if (s > 0) g.arc(X(gx - 11), Y(0), 9.15 * S, Math.PI - a, Math.PI + a);
    else g.arc(X(gx + 11), Y(0), 9.15 * S, -a, a);
    g.stroke();
  }
  g.beginPath(); g.arc(X(0), Y(0), 0.25 * S, 0, Math.PI * 2); g.fill();
  for (const [cx, cy, a0] of [[-1, -1, 0], [1, -1, Math.PI / 2], [1, 1, Math.PI], [-1, 1, -Math.PI / 2]]) {
    g.beginPath(); g.arc(X(cx * PITCH_L / 2), Y(cy * PITCH_W / 2), 1 * S, a0, a0 + Math.PI / 2); g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function labelSprite(text, bg = 'rgba(0,0,0,.65)', fg = '#fff') {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const g = c.getContext('2d');
  g.font = '600 34px Inter, system-ui, sans-serif';
  const w = Math.min(250, g.measureText(text).width + 28);
  g.fillStyle = bg;
  g.beginPath(); g.roundRect((256 - w) / 2, 6, w, 52, 26); g.fill();
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, 128, 33, 230);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  sp.scale.set(4.4, 1.1, 1);
  sp.renderOrder = 10;
  return sp;
}

function contrast(hex) {
  const c = new THREE.Color(hex);
  return c.r * 0.3 + c.g * 0.59 + c.b * 0.11 > 0.55 ? '#111' : '#fff';
}

class Pitch3D {
  constructor(container) {
    this.el = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    const scene = this.scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b1020');
    scene.fog = new THREE.Fog('#0b1020', 140, 260);

    this.camera = new THREE.PerspectiveCamera(40, 1, 0.5, 600);
    this.camera.position.set(0, 45, 62);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.maxPolarAngle = Math.PI / 2.05;
    this.controls.minDistance = 8; this.controls.maxDistance = 180;
    this.controls.addEventListener('start', () => { if (this.camMode !== 'free') this.setCamera('free'); this.onCamChange?.('free'); });
    this.camMode = 'tv';

    scene.add(new THREE.HemisphereLight('#cfe3ff', '#1d3b1f', 0.9));
    const sun = new THREE.DirectionalLight('#ffffff', 1.6);
    sun.position.set(-30, 80, 40);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 50, bottom: -50, near: 10, far: 200 });
    scene.add(sun);

    // Pelouse + terrain (le plan est dans XZ de Three : on mappe y terrain → z Three)
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(PITCH_L + 10, PITCH_W + 10), new THREE.MeshStandardMaterial({ map: pitchTexture(), roughness: 0.95 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    const apron = new THREE.Mesh(new THREE.PlaneGeometry(180, 130), new THREE.MeshStandardMaterial({ color: '#1f5f28', roughness: 1 }));
    apron.rotation.x = -Math.PI / 2; apron.position.y = -0.02;
    scene.add(apron);

    this.buildGoals();
    this.buildStands();

    // Ballon + ombre
    this.ball = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 14), new THREE.MeshStandardMaterial({ color: '#fafafa', roughness: 0.4, emissive: '#333' }));
    this.ball.castShadow = true;
    scene.add(this.ball);
    this.ballShadow = new THREE.Mesh(new THREE.CircleGeometry(0.5, 16), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.35 }));
    this.ballShadow.rotation.x = -Math.PI / 2;
    scene.add(this.ballShadow);
    // Halo au sol sous le porteur
    this.ring = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.45, 32), new THREE.MeshBasicMaterial({ color: '#facc15', transparent: true, opacity: 0.9 }));
    this.ring.rotation.x = -Math.PI / 2; this.ring.position.y = 0.03;
    scene.add(this.ring);
    this.carrierLabel = labelSprite('');
    scene.add(this.carrierLabel);

    this.players = [];
    this.ballPos = new THREE.Vector3();
    this.target = new THREE.Vector3();

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);
    this.resize();
    this.clock = new THREE.Clock();
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(loop);
      this.frame(Math.min(this.clock.getDelta(), 0.1));
    };
    loop();
  }

  buildGoals() {
    const post = new THREE.MeshStandardMaterial({ color: '#ffffff' });
    const net = new THREE.MeshBasicMaterial({ color: '#ffffff', wireframe: true, transparent: true, opacity: 0.25 });
    for (const s of [-1, 1]) {
      const g = new THREE.Group();
      const r = 0.07;
      const pL = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 2.44), post); pL.position.set(0, 1.22, -3.66);
      const pR = pL.clone(); pR.position.z = 3.66;
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 7.32), post); bar.rotation.x = Math.PI / 2; bar.position.y = 2.44;
      const box = new THREE.Mesh(new THREE.BoxGeometry(2, 2.44, 7.32, 4, 4, 8), net); box.position.set(s * 1, 1.22, 0);
      g.add(pL, pR, bar, box);
      g.position.x = s * PITCH_L / 2;
      g.traverse(o => { if (o.isMesh) o.castShadow = true; });
      this.scene.add(g);
    }
  }

  buildStands() {
    const mat = new THREE.MeshStandardMaterial({ color: '#1e2433', roughness: 0.9 });
    const seats = new THREE.MeshStandardMaterial({ color: '#2b3448', roughness: 0.9 });
    const mk = (w, d, x, z, ry) => {
      const g = new THREE.Group();
      for (let i = 0; i < 6; i++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(w, 1.2, 2.2), i % 2 ? mat : seats);
        step.position.set(0, 0.6 + i * 1.2, i * 2.2);
        g.add(step);
      }
      g.position.set(x, 0, z); g.rotation.y = ry;
      this.scene.add(g);
    };
    mk(120, 14, 0, PITCH_W / 2 + 9, 0);
    mk(120, 14, 0, -PITCH_W / 2 - 9, Math.PI);
    mk(80, 14, PITCH_L / 2 + 10, 0, Math.PI / 2);
    mk(80, 14, -PITCH_L / 2 - 10, 0, -Math.PI / 2);
  }

  /** teams = [{ color, color2, players: [{ num, name }] }, …] (domicile puis extérieur) */
  setTeams(teams) {
    this.players.forEach(p => this.scene.remove(p.group));
    this.players = [];
    teams.forEach((team, ti) => {
      const body = new THREE.MeshStandardMaterial({ color: team.color, roughness: 0.6 });
      const shorts = new THREE.MeshStandardMaterial({ color: team.color2 || '#111827', roughness: 0.7 });
      const gk = new THREE.MeshStandardMaterial({ color: ti ? '#22d3ee' : '#facc15', roughness: 0.6 });
      const skin = new THREE.MeshStandardMaterial({ color: '#e0b48f', roughness: 0.8 });
      const n = Math.max(team.players.length, 11);
      for (let i = 0; i < n; i++) {
        const info = team.players[i] || {};
        const g = new THREE.Group();
        const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 0.75, 4, 10), i === 0 ? gk : body);
        torso.position.y = 1.25; torso.castShadow = true;
        const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.24, 0.8, 10), shorts);
        legs.position.y = 0.45; legs.castShadow = true;
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 10), skin);
        head.position.y = 2.0; head.castShadow = true;
        g.add(torso, legs, head);
        let tag = null;
        if (info.num != null) {
          tag = labelSprite(String(info.num), team.color, contrast(team.color));
          tag.scale.set(2.6, 0.65, 1);
          tag.position.y = 2.9;
          g.add(tag);
        }
        g.scale.setScalar(1.35); // un peu plus grands que nature pour rester lisibles de loin
        g.position.set(ti ? 20 : -20, 0, (i - 5) * 4);
        g.visible = false;
        this.scene.add(g);
        this.players.push({ group: g, team: ti, idx: i, tag, info, target: new THREE.Vector3(g.position.x, 0, g.position.z), seen: true, mats: [torso.material, legs.material] });
      }
    });
  }

  /** state = { ball: {x,y,z}, players: [{ team, idx, x, y, seen }], carrier: { team, idx, label } } */
  setState(state, snap = false) {
    if (state.ball) this.target.set(state.ball.x, state.ball.z || 0, -state.ball.y); // y terrain (gauche +) → -z Three
    if (snap) this.ballPos.copy(this.target);
    for (const p of state.players || []) {
      const pl = this.players.find(q => q.team === p.team && q.idx === p.idx);
      if (!pl) continue;
      pl.target.set(p.x, 0, -p.y);
      pl.group.visible = true;
      if (snap) pl.group.position.copy(pl.target);
      if (pl.seen !== (p.seen !== false)) {
        pl.seen = p.seen !== false;
        pl.group.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = !pl.seen; o.material.opacity = pl.seen ? 1 : 0.35; } });
      }
    }
    this.carrier = state.carrier || null;
    if (this.carrier?.label !== this._label) {
      this._label = this.carrier?.label;
      this.scene.remove(this.carrierLabel);
      this.carrierLabel = labelSprite(this._label || '');
      this.carrierLabel.visible = !!this._label;
      this.scene.add(this.carrierLabel);
    }
  }

  setCamera(mode) {
    this.camMode = mode;
    this.controls.enabled = true;
  }

  frame(dt) {
    const k = 1 - Math.exp(-dt * 9);
    this.ballPos.lerp(this.target, k);
    this.ball.position.set(this.ballPos.x, this.ballPos.y + 0.42, this.ballPos.z);
    this.ball.rotation.x += dt * 4; this.ball.rotation.z += dt * 3;
    this.ballShadow.position.set(this.ballPos.x, 0.02, this.ballPos.z);
    this.ballShadow.material.opacity = 0.35 / (1 + this.ballPos.y * 0.3);

    const kp = 1 - Math.exp(-dt * 5);
    for (const p of this.players) {
      const g = p.group;
      const prev = g.position.clone();
      g.position.lerp(p.target, kp);
      const v = g.position.clone().sub(prev);
      if (v.lengthSq() > 1e-5) g.rotation.y = Math.atan2(v.x, v.z);
      else g.lookAt(this.ballPos.x, 0, this.ballPos.z);
      // petit balancier de course
      g.children[0].rotation.z = Math.min(v.length() * 3, 0.25) * Math.sin(performance.now() / 90);
    }
    const c = this.carrier && this.players.find(q => q.team === this.carrier.team && q.idx === this.carrier.idx);
    this.ring.visible = !!c;
    if (c) {
      this.ring.position.set(c.group.position.x, 0.03, c.group.position.z);
      this.carrierLabel.position.set(c.group.position.x, 3.9, c.group.position.z);
    }

    this.updateCamera(dt);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  updateCamera(dt) {
    if (this.camMode === 'free') return;
    const b = this.ballPos;
    const want = new THREE.Vector3(), look = new THREE.Vector3(b.x, 0, b.z);
    if (this.camMode === 'tv') { want.set(b.x * 0.75, 34, PITCH_W / 2 + 40); look.set(b.x * 0.85, 0, b.z * 0.5); }
    else if (this.camMode === 'top') { want.set(0, 118, 0.01); look.set(0, 0, 0); }
    else if (this.camMode === 'goal') { want.set(-PITCH_L / 2 - 22, 16, 0); look.set(b.x * 0.5, 0, b.z * 0.4); }
    else if (this.camMode === 'follow') { want.set(b.x - 18, 10, b.z + 14); }
    const k = 1 - Math.exp(-dt * 2.5);
    this.camera.position.lerp(want, k);
    this.controls.target.lerp(look, k);
  }

  resize() {
    const w = this.el.clientWidth || 600, h = this.el.clientHeight || 400;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.controls.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

return Pitch3D;
}).catch(e => { ready = null; throw e; }));
})();

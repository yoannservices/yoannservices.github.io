import * as THREE from 'three';
import { patch } from '../../../assets/perf.js';
import { advanceAutomation, AUTOMATION_INTERVAL, AUTOMATION_UNLOCK_DELIVERIES, recordDelivery } from './progression.js';
import { boxCollider, circleCollider, deepestContact, vehicleBox } from './collision.js';

patch(THREE);

const canvas = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#a9c5c6');
scene.fog = new THREE.Fog('#a9c5c6', 45, 115);
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 180);
const groundMaterial = new THREE.MeshLambertMaterial({ color: '#b5a77e' });
const rockMaterial = new THREE.MeshLambertMaterial({ color: '#777a70', flatShading: true });
const keys = new Set();
const rocks = [];
const colliders = [];
const loader = { x: -3, z: 14, heading: -2.18, speed: 0, lift: 0, loaded: false, view: 0 };
const saveKey = 'chantier-carriere.prototype.v1';
let actionQueued = false;
let toastTimer = 0;
let beltTimer = 0;
let beltProgress = 0;
let beltRock;
let paused = false;
let delivered = 0;
let money = 0;
let automationUnlocked = false;

try {
  const save = JSON.parse(localStorage.getItem(saveKey) || '{}');
  delivered = Math.max(0, Number(save.delivered) || 0);
  money = Math.max(0, Number(save.money) || 0);
  automationUnlocked = delivered >= AUTOMATION_UNLOCK_DELIVERIES;
} catch { /* Une sauvegarde absente ou invalide repart de zéro. */ }

scene.add(new THREE.HemisphereLight('#e4f0e5', '#625a43', 2.15));
const sun = new THREE.DirectionalLight('#fff0d4', 2.1);
sun.position.set(-25, 45, 20);
scene.add(sun);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(150, 110), groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.16;
scene.add(ground);

const grid = new THREE.GridHelper(120, 60, '#8e8b6d', '#a69d79');
grid.position.y = -0.145;
grid.material.transparent = true;
grid.material.opacity = 0.18;
scene.add(grid);

function box(parent, size, color, position, materialOptions = {}) {
  const material = new THREE.MeshLambertMaterial({ color, ...materialOptions });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
}

function makeLoader() {
  const root = new THREE.Group();
  scene.add(root);
  box(root, [2.4, 0.5, 3.15], '#d89527', [0, 0.82, -0.1]);
  box(root, [2.15, 0.64, 1.45], '#e5a52f', [0, 1.12, -0.82]);
  box(root, [1.32, 1.12, 1.18], '#38484a', [0, 1.76, -0.86]);
  box(root, [1.18, 0.9, 0.08], '#9ec3c5', [0, 1.78, -0.25], { transparent: true, opacity: 0.72 });
  box(root, [0.08, 0.92, 0.9], '#263638', [-0.66, 1.77, -0.86]);
  box(root, [0.08, 0.92, 0.9], '#263638', [0.66, 1.77, -0.86]);
  box(root, [1.38, 0.12, 1.32], '#d89527', [0, 2.36, -0.86]);
  box(root, [1.55, 0.16, 0.24], '#262b29', [0, 1.16, 1.45]);
  const wheels = [];
  for (const x of [-1.12, 1.12]) {
    for (const z of [-1.02, 1.02]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.34, 10), new THREE.MeshLambertMaterial({ color: '#282b29', flatShading: true }));
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.49, z);
      root.add(wheel);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.36, 8), new THREE.MeshLambertMaterial({ color: '#d3a542' }));
      hub.rotation.z = Math.PI / 2;
      hub.position.set(x, 0.49, z);
      root.add(hub);
      wheels.push(wheel);
    }
  }
  const armPivot = new THREE.Group();
  armPivot.position.set(0, 1.35, 0.5);
  root.add(armPivot);
  for (const x of [-0.82, 0.82]) {
    const arm = box(armPivot, [0.2, 0.22, 2.15], '#c98222', [x, 0.06, 1.05]);
    arm.rotation.x = -0.08;
    box(armPivot, [0.24, 0.25, 0.3], '#4c4c40', [x, 0.02, 2.03]);
  }
  const bucket = new THREE.Group();
  bucket.position.set(0, -0.08, 2.12);
  armPivot.add(bucket);
  box(bucket, [1.68, 0.2, 0.88], '#555951', [0, -0.22, 0.15]);
  box(bucket, [1.68, 0.66, 0.16], '#656961', [0, 0.02, 0.55]);
  box(bucket, [0.16, 0.54, 0.72], '#656961', [-0.76, 0.06, 0.2]);
  box(bucket, [0.16, 0.54, 0.72], '#656961', [0.76, 0.06, 0.2]);
  const cargo = new THREE.Mesh(new THREE.DodecahedronGeometry(0.39, 0), new THREE.MeshLambertMaterial({ color: '#777a70', flatShading: true }));
  cargo.position.set(0, 0.22, 0.18);
  cargo.visible = false;
  bucket.add(cargo);
  return { root, wheels, armPivot, bucket, cargo };
}

const machine = makeLoader();

function makeRock(x, z, scale = 1) {
  const group = new THREE.Group();
  group.position.set(x, 0.1, z);
  const count = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry((0.42 + Math.random() * 0.24) * scale, 0), rockMaterial);
    mesh.position.set((Math.random() - 0.5) * 1.1 * scale, Math.random() * 0.32, (Math.random() - 0.5) * 1.1 * scale);
    mesh.rotation.set(Math.random(), Math.random(), Math.random());
    group.add(mesh);
  }
  group.userData.taken = false;
  group.userData.collider = circleCollider(x, z, 1.15 * scale);
  colliders.push(group.userData.collider);
  scene.add(group);
  rocks.push(group);
}

[[-13, 7], [-14, 0], [-11, -7], [-20, 2], [-19, -8], [-7, -13]].forEach(([x, z], index) => makeRock(x, z, index % 2 ? 0.9 : 1.1));

function makeSite() {
  box(scene, [10, 0.3, 10], '#66765a', [14, -0.02, -8]);
  const pad = box(scene, [7, 0.08, 7], '#d4bd58', [14, 0.18, -8]);
  pad.material.color.set('#d4bd58');
  for (let i = -3; i <= 3; i += 2) {
    box(scene, [0.1, 0.04, 7], '#eee0a1', [14 + i, 0.25, -8]);
    box(scene, [7, 0.04, 0.1], '#eee0a1', [14, 0.25, -8 + i]);
  }
  box(scene, [4.5, 1.2, 0.6], '#56594f', [14, 0.82, -11.3]);
  box(scene, [4.7, 0.14, 0.85], '#e3b834', [14, 1.48, -11.2]);
  box(scene, [2.2, 3, 0.35], '#716e5b', [14, 1.5, -12.1]);
  colliders.push(boxCollider(14, -11.3, 2.25, 0.3), boxCollider(14, -12.1, 1.1, 0.18));
  box(scene, [0.2, 1.4, 0.45], '#d7ed78', [11.4, 0.9, -5.4]);
  box(scene, [0.2, 1.4, 0.45], '#d7ed78', [16.6, 0.9, -5.4]);
  box(scene, [8, 0.15, 0.5], '#4e594d', [5.8, 0.62, -6.8]);
  box(scene, [8, 0.15, 0.5], '#4e594d', [5.8, 1.75, -6.8]);
  colliders.push(boxCollider(5.8, -6.8, 4, 0.32));
  for (let i = 0; i < 4; i++) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.1, 6), new THREE.MeshLambertMaterial({ color: '#60665a' }));
    post.position.set(2.4 + i * 2.2, 1.1, -6.8);
    scene.add(post);
  }
  beltRock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3, 0), rockMaterial);
  beltRock.position.set(2.1, 0.9, -6.8);
  beltRock.visible = false;
  scene.add(beltRock);
  const warehouse = new THREE.Group();
  box(warehouse, [12, 6, 0.7], '#747665', [-31, 2.8, -15]);
  box(warehouse, [12.4, 0.45, 1], '#4d574b', [-31, 5.95, -15]);
  box(warehouse, [3, 3.8, 0.08], '#34403b', [-31, 2, -14.62]);
  scene.add(warehouse);
  box(scene, [45, 0.25, 1.2], '#8f7955', [-9, 0.02, 20]);
  box(scene, [45, 0.25, 1.2], '#8f7955', [-9, 0.02, -20]);
  box(scene, [1.2, 0.25, 41], '#8f7955', [-31, 0.02, 0]);
  box(scene, [1.2, 0.25, 41], '#8f7955', [23, 0.02, 0]);
  colliders.push(
    boxCollider(-9, 20, 22.5, 0.6), boxCollider(-9, -20, 22.5, 0.6),
    boxCollider(-31, 0, 0.6, 20.5), boxCollider(23, 0, 0.6, 20.5),
  );
}
makeSite();

const ui = {
  money: document.querySelector('#money'),
  deliveries: document.querySelector('#deliveries'),
  progress: document.querySelector('#progress'),
  automation: document.querySelector('#automation-status'),
  load: document.querySelector('#load-state'),
  arm: document.querySelector('#arm-state'),
  prompt: document.querySelector('#prompt'),
  waypoint: document.querySelector('#waypoint'),
  toast: document.querySelector('#toast'),
  speed: document.querySelector('#speed'),
  viewButton: document.querySelector('#view-button'),
};
const pauseMenu = document.querySelector('#pause-menu');

function setPaused(value) {
  paused = value;
  pauseMenu.hidden = !paused;
  keys.clear();
}
window.__pauseGame = () => setPaused(!paused);
document.querySelector('#resume-button').addEventListener('click', () => setPaused(false));

function saveProgress() {
  localStorage.setItem(saveKey, JSON.stringify({ delivered, money }));
}

function showToast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.add('visible');
  toastTimer = 2.6;
}

function bucketWorldPosition() {
  return new THREE.Vector3(0, 0.65, 3.35).applyAxisAngle(new THREE.Vector3(0, 1, 0), loader.heading).add(new THREE.Vector3(loader.x, 0, loader.z));
}

function nearestRock() {
  const bucketPosition = bucketWorldPosition();
  let nearest = null;
  let nearestDistance = Infinity;
  for (const rock of rocks) {
    if (rock.userData.taken) continue;
    const distance = bucketPosition.distanceTo(rock.position);
    if (distance < nearestDistance) { nearest = rock; nearestDistance = distance; }
  }
  return { rock: nearest, distance: nearestDistance };
}

function doAction() {
  if (loader.loaded) {
    if (Math.hypot(loader.x - 14, loader.z + 8) < 6.2) {
      loader.loaded = false;
      machine.cargo.visible = false;
      const progress = recordDelivery(delivered, money);
      delivered = progress.deliveries;
      money = progress.money;
      if (progress.unlocked) {
        automationUnlocked = true;
        beltRock.visible = true;
        showToast('Convoyeur débloqué : la trémie produit automatiquement !');
      } else {
        showToast('Gravier livré · +40 €');
      }
      saveProgress();
      updateUI();
    } else {
      showToast('Approche la trémie jaune pour décharger.');
    }
    return;
  }
  const { rock, distance } = nearestRock();
  if (rock && distance < 2.8 && loader.lift < 0.34) {
    rock.userData.taken = true;
    rock.userData.collider.active = false;
    rock.visible = false;
    loader.loaded = true;
    machine.cargo.visible = true;
    updateUI();
    showToast('Godet chargé. Relève-le et va à la trémie.');
  } else if (loader.lift >= 0.34) {
    showToast('Abaisse le godet avant de ramasser.');
  } else {
    showToast('Place le godet au ras d’un tas de gravier.');
  }
}

function updateUI() {
  ui.money.textContent = `${money.toLocaleString('fr-FR')} €`;
  ui.deliveries.textContent = automationUnlocked ? `${delivered} livraisons · convoyeur actif` : `${delivered} / 3 livraisons`;
  ui.progress.style.width = `${Math.min(delivered / 3, 1) * 100}%`;
  ui.automation.textContent = automationUnlocked ? 'CONVOYEUR · ACTIF · +20 € / 10 s' : `CONVOYEUR · verrouillé à ${Math.max(3 - delivered, 0)} livraison${3 - delivered > 1 ? 's' : ''}`;
  ui.automation.classList.toggle('on', automationUnlocked);
  ui.load.textContent = loader.loaded ? 'CHARGÉ' : 'VIDE';
  ui.load.classList.toggle('full', loader.loaded);
  ui.arm.textContent = loader.lift > 0.42 ? 'Position haute' : loader.lift > 0.12 ? 'Mi-hauteur' : 'Position basse';
  document.querySelector('#contract-number').textContent = String(Math.floor(delivered / 3) + 1).padStart(2, '0');
}
updateUI();

function updateWaypoint() {
  const dx = 14 - loader.x;
  const dz = -8 - loader.z;
  const targetHeading = Math.atan2(dx, dz);
  const difference = Math.atan2(Math.sin(targetHeading - loader.heading), Math.cos(targetHeading - loader.heading));
  const direction = Math.abs(difference) < 0.3 ? 'DEVANT' : difference > 0 ? 'À DROITE' : 'À GAUCHE';
  ui.waypoint.textContent = `TRÉMIE · ${Math.round(Math.hypot(dx, dz))} m · ${direction}`;
}
updateWaypoint();

function onKeyDown(event) {
  if (event.code === 'Escape') {
    event.preventDefault();
    if (!event.repeat) setPaused(!paused);
    return;
  }
  if (paused) return;
  const handled = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'Space', 'KeyC', 'KeyR', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'];
  if (handled.includes(event.code)) event.preventDefault();
  if (event.code === 'Space' && !event.repeat) actionQueued = true;
  if (event.code === 'KeyC' && !event.repeat) loader.view = (loader.view + 1) % 2;
  if (event.code === 'KeyR' && !event.repeat) {
    loader.x = -3; loader.z = 14; loader.heading = -2.18; loader.speed = 0;
    showToast('Chargeuse replacée au départ.');
  }
  keys.add(event.code);
}
function onKeyUp(event) { keys.delete(event.code); }
addEventListener('keydown', onKeyDown);
addEventListener('keyup', onKeyUp);
addEventListener('blur', () => keys.clear());
ui.viewButton.addEventListener('click', () => { loader.view = (loader.view + 1) % 2; });

for (const button of document.querySelectorAll('#touch-controls button')) {
  const code = button.dataset.code;
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    if (button.dataset.action) actionQueued = true;
    else if (code) keys.add(code);
  });
  const release = () => { if (code) keys.delete(code); };
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('pointerleave', release);
}

function updatePrompt() {
  if (loader.loaded) {
    const close = Math.hypot(loader.x - 14, loader.z + 8) < 6.2;
    ui.prompt.textContent = close ? 'ESPACE · Déverser le gravier' : 'Godet chargé · Rejoins la trémie jaune';
    ui.prompt.classList.toggle('visible', close);
    return;
  }
  const { rock, distance } = nearestRock();
  const near = rock && distance < 3.1;
  ui.prompt.textContent = near ? (loader.lift < 0.34 ? 'ESPACE · Ramasser le gravier' : 'A · Abaisser le godet') : 'Approche d’un tas de gravier';
  ui.prompt.classList.toggle('visible', Boolean(near));
}

function update(dt) {
  if (paused) return;
  const forward = keys.has('KeyW') || keys.has('ArrowUp');
  const reverse = keys.has('KeyS') || keys.has('ArrowDown');
  const left = keys.has('KeyA') || keys.has('ArrowLeft');
  const right = keys.has('KeyD') || keys.has('ArrowRight');
  const lower = keys.has('KeyQ');
  const raise = keys.has('KeyE');
  if (forward) loader.speed += 7 * dt;
  if (reverse) loader.speed -= 6 * dt;
  loader.speed *= Math.exp(-1.6 * dt);
  loader.speed = THREE.MathUtils.clamp(loader.speed, -4.5, 7.5);
  if (Math.abs(loader.speed) > 0.08) loader.heading += (right ? 1 : 0) * dt * Math.sign(loader.speed) * 1.45 - (left ? 1 : 0) * dt * Math.sign(loader.speed) * 1.45;
  loader.x += Math.sin(loader.heading) * loader.speed * dt;
  loader.z += Math.cos(loader.heading) * loader.speed * dt;
  loader.x = THREE.MathUtils.clamp(loader.x, -29, 21);
  loader.z = THREE.MathUtils.clamp(loader.z, -19, 19);
  for (let iteration = 0; iteration < 4; iteration++) {
    const body = vehicleBox(loader.x, loader.z, loader.heading, 1.65, 1.2);
    const contact = deepestContact(body, colliders);
    if (!contact) break;
    loader.x += contact.nx * (contact.depth + 0.005);
    loader.z += contact.nz * (contact.depth + 0.005);
    const forwardDot = Math.sin(loader.heading) * contact.nx + Math.cos(loader.heading) * contact.nz;
    if (loader.speed * forwardDot < 0) loader.speed *= 1 - forwardDot * forwardDot;
  }
  loader.lift = THREE.MathUtils.clamp(loader.lift + (raise ? 0.75 : 0) * dt - (lower ? 0.75 : 0) * dt, 0, 0.8);
  machine.root.position.set(loader.x, 0, loader.z);
  machine.root.rotation.y = loader.heading;
  machine.armPivot.rotation.x = -loader.lift;
  machine.bucket.rotation.x = loader.lift * 0.52;
  for (const wheel of machine.wheels) wheel.rotation.x -= loader.speed * dt * 1.4;
  if (actionQueued) { doAction(); actionQueued = false; }
  if (automationUnlocked) {
    const payout = advanceAutomation(beltTimer, dt);
    beltTimer = payout.elapsed;
    beltProgress = beltTimer / AUTOMATION_INTERVAL;
    beltRock.position.x = 2.1 + beltProgress * 7.4;
    beltRock.position.y = 0.9 + Math.sin(beltProgress * Math.PI) * 0.15;
    beltRock.visible = true;
    if (payout.reward > 0) {
      money += payout.reward;
      saveProgress();
      updateUI();
    }
  }
  if (toastTimer > 0) {
    toastTimer -= dt;
    if (toastTimer <= 0) ui.toast.classList.remove('visible');
  }
  const armLabel = loader.lift > 0.42 ? 'Position haute' : loader.lift > 0.12 ? 'Mi-hauteur' : 'Position basse';
  if (ui.arm.textContent !== armLabel) ui.arm.textContent = armLabel;
  ui.speed.textContent = String(Math.round(Math.abs(loader.speed) * 3.6));
  updatePrompt();
  updateWaypoint();
}

const target = new THREE.Vector3();
const desiredCamera = new THREE.Vector3();
function render() {
  const forwardX = Math.sin(loader.heading);
  const forwardZ = Math.cos(loader.heading);
  if (loader.view === 0) {
    desiredCamera.set(loader.x - forwardX * 11, 7, loader.z - forwardZ * 11);
    target.set(loader.x + forwardX * 1.5, 1.2, loader.z + forwardZ * 1.5);
  } else {
    desiredCamera.set(loader.x + forwardX * 0.25, 2.2, loader.z + forwardZ * 0.25);
    target.set(loader.x + forwardX * 12, 1.6, loader.z + forwardZ * 12);
  }
  camera.position.lerp(desiredCamera, 0.1);
  camera.lookAt(target);
  renderer.render(scene, camera);
}

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
let lastFrame = performance.now();
renderer.setAnimationLoop(() => {
  const now = performance.now();
  const dt = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;
  update(dt);
  render();
});
window.GameLoader?.ready();

import * as THREE from 'three';

const C_BG = 0x1a1a1f;
const C_FLOOR = 0x26262e;
const C_ACCENT = 0xff5a36;
const C_LIGHT = 0xe8e8e8;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(C_BG);
const VIEW = 60;
const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
cam.position.set(0, 50, 0);
cam.up.set(0, 0, -1);
cam.lookAt(0, 0, 0);

function resize() {
  const aspect = innerWidth / innerHeight;
  cam.left = -VIEW * aspect / 2;
  cam.right = VIEW * aspect / 2;
  cam.top = VIEW / 2;
  cam.bottom = -VIEW / 2;
  cam.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}

addEventListener('resize', resize);
resize();
scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(10, 30, 5);
scene.add(directionalLight);

const walls = [];
function ring(points) {
  return points.map((point, index) => ({
    a: new THREE.Vector2(...point),
    b: new THREE.Vector2(...points[(index + 1) % points.length])
  }));
}

const outer = [[-70, -40], [-30, -55], [40, -55], [80, -30], [85, 20], [50, 50], [-10, 55], [-60, 45], [-85, 10]];
const inner = [[-45, -15], [-15, -28], [35, -28], [55, -8], [55, 12], [30, 28], [-10, 30], [-40, 22], [-55, 5]];
walls.push(...ring(outer), ...ring(inner));

const wallMaterial = new THREE.MeshLambertMaterial({ color: C_LIGHT, flatShading: true });
for (const wall of walls) {
  const direction = wall.b.clone().sub(wall.a);
  const length = direction.length();
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(length, 1.5, 1), wallMaterial);
  mesh.position.set((wall.a.x + wall.b.x) / 2, 0.75, (wall.a.y + wall.b.y) / 2);
  mesh.rotation.y = -Math.atan2(direction.y, direction.x);
  scene.add(mesh);
}

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(400, 300),
  new THREE.MeshLambertMaterial({ color: C_FLOOR, flatShading: true })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const startLine = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 28),
  new THREE.MeshBasicMaterial({ color: C_LIGHT })
);
startLine.rotation.x = -Math.PI / 2;
startLine.position.set(0, 0.02, -41);
startLine.rotation.z = Math.PI / 2;
scene.add(startLine);

const car = new THREE.Group();
const body = new THREE.Mesh(
  new THREE.BoxGeometry(4.4, 0.9, 2.2),
  new THREE.MeshLambertMaterial({ color: C_ACCENT, flatShading: true })
);
body.position.y = 0.7;
car.add(body);
const cab = new THREE.Mesh(
  new THREE.BoxGeometry(2, 0.7, 1.8),
  new THREE.MeshLambertMaterial({ color: C_LIGHT, flatShading: true })
);
cab.position.set(-0.3, 1.4, 0);
car.add(cab);
scene.add(car);

const P = {
  mass: 1400,
  I: 2600,
  a: 1.4,
  b: 1.4,
  engine: 11000,
  brake: 14000,
  drag: 0.45,
  roll: 12,
  maxSteer: 0.5,
  steerSpeed: 3.2,
  muLong: 0.9,
  Cf: 5.0,
  Cr: 3.4,
  gripRear: 7500,
  gripFront: 11000,
  slideThresh: 0.22,
  slideLoss: 0.45,
  powerSlip: 0.85,
  wallRestitution: 0.15
};

const S = {
  pos: new THREE.Vector2(0, -41),
  ang: 0,
  v: new THREE.Vector2(),
  w: 0,
  steer: 0
};

function fwd() {
  return new THREE.Vector2(Math.cos(S.ang), Math.sin(S.ang));
}

function rgt() {
  return new THREE.Vector2(-Math.sin(S.ang), Math.cos(S.ang));
}

const keys = {};
addEventListener('keydown', event => {
  keys[event.code] = true;
  if (event.code === 'KeyR') reset();
});
addEventListener('keyup', event => {
  keys[event.code] = false;
});
const K = (...codes) => codes.some(code => keys[code]);

function reset() {
  S.pos.set(0, -41);
  S.ang = 0;
  S.v.set(0, 0);
  S.w = 0;
  S.steer = 0;
  endCombo(false);
}

const MAXT = 3000;
const trailGeometry = new THREE.PlaneGeometry(0.45, 0.9);
trailGeometry.rotateX(-Math.PI / 2);
const trails = new THREE.InstancedMesh(
  trailGeometry,
  new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.55 }),
  MAXT
);
trails.count = 0;
scene.add(trails);
let trailIndex = 0;
const dummy = new THREE.Object3D();

function addTrail(position, angle) {
  dummy.position.set(position.x, 0.03, position.y);
  dummy.rotation.set(0, -angle, 0);
  dummy.updateMatrix();
  trails.setMatrixAt(trailIndex % MAXT, dummy.matrix);
  trailIndex++;
  trails.count = Math.min(trailIndex, MAXT);
  trails.instanceMatrix.needsUpdate = true;
}

const smoke = [];
const smokeGeometry = new THREE.IcosahedronGeometry(0.5, 0);
function addSmoke(position, velocity) {
  const mesh = new THREE.Mesh(
    smokeGeometry,
    new THREE.MeshBasicMaterial({ color: C_LIGHT, transparent: true, opacity: 0.5 })
  );
  mesh.position.set(position.x, 0.6, position.y);
  scene.add(mesh);
  smoke.push({
    m: mesh,
    vx: velocity.x * 0.2 + (Math.random() - 0.5) * 2,
    vz: velocity.y * 0.2 + (Math.random() - 0.5) * 2,
    life: 1
  });
}

let score = 0;
let best = +localStorage.getItem('driftBest') || 0;
let combo = 0;
let comboT = 0;
let drifting = false;
const elScore = document.getElementById('score');
const elBest = document.getElementById('best');
const elCombo = document.getElementById('combo');
elBest.textContent = best;

function endCombo(bank) {
  if (bank && combo > 0) {
    score += Math.floor(combo * (1 + comboT * 0.1));
  }
  combo = 0;
  comboT = 0;
  drifting = false;
  score = Math.floor(score);
  elScore.textContent = score;
  if (score > best) {
    best = score;
    localStorage.setItem('driftBest', best);
    elBest.textContent = best;
  }
  elCombo.textContent = '';
}

let shake = 0;
const RAD = 1.4;
function collide() {
  let hit = false;
  for (const wall of walls) {
    const ab = wall.b.clone().sub(wall.a);
    const t = Math.max(0, Math.min(1, S.pos.clone().sub(wall.a).dot(ab) / ab.lengthSq()));
    const closestPoint = wall.a.clone().add(ab.multiplyScalar(t));
    const delta = S.pos.clone().sub(closestPoint);
    const distance = delta.length();
    if (distance < RAD + 0.5) {
      const normal = delta.normalize();
      S.pos.add(normal.clone().multiplyScalar(RAD + 0.5 - distance));
      const normalSpeed = S.v.dot(normal);
      if (normalSpeed < 0) {
        S.v.sub(normal.clone().multiplyScalar((1 + P.wallRestitution) * normalSpeed));
        S.v.multiplyScalar(0.7);
        S.w *= 0.6;
        if (-normalSpeed > 2) {
          hit = true;
          shake = Math.min(1.2, shake + (-normalSpeed) * 0.05);
        }
      }
    }
  }
  if (hit) endCombo(false);
}

const STEPS = 4;
function step(dt) {
  const target = (K('KeyA', 'KeyQ', 'ArrowLeft') ? -1 : 0)
    + (K('KeyD', 'ArrowRight') ? 1 : 0);
  const speedFactor = 1 / (1 + S.v.length() * 0.025);
  S.steer += (target * P.maxSteer * speedFactor - S.steer)
    * Math.min(1, P.steerSpeed * dt);

  const forward = fwd();
  const right = rgt();
  const vx = S.v.dot(forward);
  const vy = S.v.dot(right);
  const vF = vy + S.w * P.a;
  const vR = vy - S.w * P.b;
  const vxs = Math.max(Math.abs(vx), 1.5) * Math.sign(vx || 1);
  const sF = Math.atan2(vF, Math.abs(vxs));
  const sR = Math.atan2(vR, Math.abs(vxs));
  const slipF = sF - S.steer * (vx >= 0 ? 1 : -1);

  const throttle = K('KeyW', 'KeyZ', 'ArrowUp') ? 1 : 0;
  const braking = K('KeyS', 'ArrowDown') ? 1 : 0;
  let Fx = 0;
  if (throttle) Fx += P.engine;
  if (braking) Fx += vx > 1 ? -P.brake : -P.engine * 0.5;
  Fx -= P.drag * vx * Math.abs(vx) + P.roll * vx;
  const FxMax = P.muLong * P.mass * 9.8;
  const FxRear = Math.max(-FxMax, Math.min(FxMax, Fx));

  function lateralForce(slip, stiffness, grip, usage) {
    const force = -stiffness * slip * P.mass * 2.2;
    let cap = grip;
    if (Math.abs(slip) > P.slideThresh) {
      cap *= P.slideLoss
        + (1 - P.slideLoss) * Math.exp(-(Math.abs(slip) - P.slideThresh) * 4);
    }
    cap *= Math.sqrt(Math.max(0.15, 1 - usage * usage));
    return Math.max(-cap, Math.min(cap, force));
  }

  const usage = Math.min(1, Math.abs(FxRear) / FxMax * P.powerSlip);
  const FyF = lateralForce(slipF, P.Cf, P.gripFront, 0);
  const FyR = lateralForce(sR, P.Cr, P.gripRear, usage);
  const cF = Math.cos(S.steer);
  const ax = (FxRear - FyF * Math.sin(S.steer)) / P.mass + S.w * vy;
  const ay = (FyR + FyF * cF) / P.mass - S.w * vx;
  const torque = P.a * FyF * cF - P.b * FyR;
  S.w += torque / P.I * dt;
  S.w *= Math.exp(-0.35 * dt);

  const nvx = vx + ax * dt;
  const nvy = vy + ay * dt;
  S.ang += S.w * dt;
  const forwardAfterTurn = fwd();
  const rightAfterTurn = rgt();
  S.v.copy(forwardAfterTurn.multiplyScalar(nvx).add(rightAfterTurn.multiplyScalar(nvy)));
  S.pos.add(S.v.clone().multiplyScalar(dt));
  collide();
}

const clock = new THREE.Clock();
const camPos = new THREE.Vector2();
let trailAccumulator = 0;

function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  for (let i = 0; i < STEPS; i++) step(dt / STEPS);

  const speed = S.v.length();
  let driftAngle = 0;
  if (speed > 3) {
    const velocityAngle = Math.atan2(S.v.y, S.v.x);
    driftAngle = Math.abs(Math.atan2(
      Math.sin(velocityAngle - S.ang),
      Math.cos(velocityAngle - S.ang)
    ));
    if (driftAngle > Math.PI / 2) driftAngle = Math.PI - driftAngle;
  }

  const isDrift = driftAngle > 0.2 && speed > 8;
  if (isDrift) {
    drifting = true;
    comboT += dt;
    combo += driftAngle * speed * dt * 10;
    elCombo.textContent = `DRIFT x${(1 + comboT * 0.1).toFixed(1)}\n${Math.floor(combo)}`;
  } else if (drifting) {
    endCombo(true);
  }

  const back = S.pos.clone().sub(fwd().multiplyScalar(1.3));
  const right = rgt();
  if (isDrift || (K('KeyW', 'KeyZ', 'ArrowUp') && speed < 6 && Math.abs(S.v.dot(right)) > 2)) {
    trailAccumulator += dt;
    if (trailAccumulator > 0.02) {
      trailAccumulator = 0;
      const velocityAngle = Math.atan2(S.v.y, S.v.x);
      addTrail(back.clone().add(right.clone().multiplyScalar(0.9)), velocityAngle);
      addTrail(back.clone().sub(right.clone().multiplyScalar(0.9)), velocityAngle);
      if (Math.random() < 0.7) addSmoke(back, S.v);
    }
  }

  for (let i = smoke.length - 1; i >= 0; i--) {
    const puff = smoke[i];
    puff.life -= dt * 0.9;
    puff.m.position.x += puff.vx * dt;
    puff.m.position.z += puff.vz * dt;
    puff.m.position.y += dt * 1.5;
    puff.m.scale.setScalar(1 + (1 - puff.life) * 2.5);
    puff.m.material.opacity = Math.max(0, puff.life * 0.45);
    if (puff.life <= 0) {
      scene.remove(puff.m);
      puff.m.material.dispose();
      smoke.splice(i, 1);
    }
  }

  car.position.set(S.pos.x, 0, S.pos.y);
  car.rotation.y = -S.ang;
  elScore.textContent = Math.floor(score);

  camPos.lerp(S.pos, 1 - Math.exp(-5 * dt));
  shake *= Math.exp(-8 * dt);
  const sx = (Math.random() - 0.5) * shake * 2;
  const sz = (Math.random() - 0.5) * shake * 2;
  cam.position.set(camPos.x + sx, 50, camPos.y + sz);
  cam.lookAt(camPos.x + sx, 0, camPos.y + sz);

  renderer.render(scene, cam);
  requestAnimationFrame(frame);
}

camPos.copy(S.pos);
frame();

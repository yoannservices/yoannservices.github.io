/* Tests de la logique (sans rendu) : node test/logic.mjs */
import assert from 'node:assert/strict';
import { CarPhysics, VMAX, VMAX_REV } from '../src/car/physics.js';
import { box, circle, carBox, collide, worstContact, insideSpot } from '../src/gameplay/collision.js';
import { LEVELS, starsFor } from '../src/levels/levels.js';

const dim = { length: 4.5, width: 1.8, wheelbase: 2.7, rearBehind: 1.3 };
const run = (p, inp, secs) => { for (let t = 0; t < secs; t += 1 / 60) p.step(1 / 60, inp); };
const NONE = { throttle: 0, brake: 0, steer: 0, hand: false };

// accélération puis arrêt
let p = new CarPhysics(dim); p.place(0, 0, 0);
run(p, { ...NONE, throttle: 1 }, 6);
assert.ok(p.v > 8 && p.v <= VMAX + 1e-9, 'vitesse après 6 s : ' + p.v);
run(p, { ...NONE, brake: 1 }, 1.4);
assert.ok(Math.abs(p.v) < 1.6, 'le frein arrête la voiture : ' + p.v);
run(p, { ...NONE, brake: 1 }, 4);
assert.ok(p.v < -1 && p.v >= -VMAX_REV - 1e-9, 'marche arrière : ' + p.v);
run(p, NONE, 4);
assert.equal(p.v, 0, 'sans touche, la voiture finit par s\'arrêter');

// cercle de braquage : rayon ≈ empattement / tan(braquage) à basse vitesse
p = new CarPhysics(dim); p.place(0, 0, 0);
run(p, { ...NONE, throttle: 1 }, 1.2);
const y0 = p.yaw; let dist = 0, last = [p.rx, p.rz];
for (let t = 0; t < 2; t += 1 / 60) { p.step(1 / 60, { ...NONE, steer: 1, throttle: p.v < 2.5 ? 1 : 0 }); dist += Math.hypot(p.rx - last[0], p.rz - last[1]); last = [p.rx, p.rz]; }
assert.ok(p.yaw > y0, 'steer > 0 tourne à gauche (yaw croissant)');
const R = dist / (p.yaw - y0);
assert.ok(R > 3 && R < 8, 'rayon de braquage plausible : ' + R.toFixed(2) + ' m');

// la voiture avance bien vers (sin yaw, cos yaw)
p = new CarPhysics(dim); p.place(10, 5, Math.PI / 2);
run(p, { ...NONE, throttle: 1 }, 1);
assert.ok(p.x > 10.5 && Math.abs(p.z - 5) < 0.01, 'cap yaw = pi/2 -> +x');

// collisions
let c = carBox(0, 0, 0, 2.25, 0.9);
assert.equal(collide(c, circle(0, 5, 0.4)), null, 'cercle loin');
let r = collide(c, circle(0, 2.5, 0.4));
assert.ok(r && Math.abs(r.nz + 1) < 1e-9 && r.depth > 0.14 && r.depth < 0.16, 'cercle devant : normale -z, profondeur 0,15 : ' + JSON.stringify(r));
r = collide(c, circle(1.2, 0, 0.4));
assert.ok(r && r.nx < -0.99 && Math.abs(r.depth - 0.1) < 1e-9, 'cercle sur le côté : ' + JSON.stringify(r));
r = collide(c, box(0, 3.0, 3, 1, 0));
assert.ok(r && r.nz < -0.99 && Math.abs(r.depth - 0.25) < 1e-9, 'mur devant : ' + JSON.stringify(r));
assert.equal(collide(c, box(0, 4, 3, 1, 0)), null, 'mur à distance');
assert.ok(collide(carBox(0, 0, Math.PI / 4, 2.25, 0.9), box(2.2, 0.8, 0.5, 0.5, 0.3)), 'boîte tournée');
assert.equal(worstContact(c, [circle(0, 9, 1), box(30, 30, 1, 1)]), null);

// choc : push retire la vitesse entrante
p = new CarPhysics(dim); p.place(0, 0, 0); p.v = 5;
p.push(0, -1, 0.2);
assert.ok(Math.abs(p.v) < 1e-9, 'choc frontal : vitesse annulée');
p = new CarPhysics(dim); p.place(0, 0, 0); p.v = 5;
p.push(-1, 0, 0.1);
assert.equal(p.v, 5, 'frottement latéral : la vitesse vers l\'avant reste');

// place de stationnement
const spot = { x: 0, z: 0, yaw: 0, len: 6, wid: 2.4 };
assert.ok(insideSpot(carBox(0, 0, 0, 2.25, 0.9), spot), 'voiture centrée');
assert.ok(!insideSpot(carBox(0, 1.5, 0, 2.25, 0.9), spot), 'voiture qui dépasse en avant');
assert.ok(!insideSpot(carBox(0, 0, 0.5, 2.25, 0.9), spot), 'voiture de travers');
assert.ok(insideSpot(carBox(0.2, 0, 0.02, 2.25, 0.9), spot), 'petit écart accepté');

// niveaux
assert.equal(LEVELS.length, 20, '5 niveaux par chapitre');
for (const ch of ['Ville', 'Campagne', 'Forêt', 'Montagne']) assert.equal(LEVELS.filter((l) => l.chapter === ch).length, 5, ch);
assert.deepEqual(LEVELS.filter((l) => l.id.endsWith('-1')).map((l) => l.stars), [[20, 30], [20, 30], [20, 30], [20, 30]], '3 étoiles avant 20 s, 2 avant 30 s au premier niveau');
assert.equal(new Set(LEVELS.map((l) => l.id)).size, 20, 'identifiants uniques');
for (const L of LEVELS) {
  assert.ok(L.route.length >= 3 && L.spot.len > 0 && L.stars[0] < L.stars[1], L.id);
  assert.equal(starsFor(L, L.stars[0] - 1), 3); assert.equal(starsFor(L, L.stars[0] + 1), 2); assert.equal(starsFor(L, L.stars[1] + 1), 1);
}
console.log('logic.mjs : tous les tests passent');

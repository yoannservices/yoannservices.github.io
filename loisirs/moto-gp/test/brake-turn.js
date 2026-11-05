// Freinage + virage : pour chaque vitesse et braquage plein, freinage plein 3 s. Affiche décélération, G latéral, glissement, lacet (|v| = dérapage), pic de lean.
const path = require('path');
globalThis.THREE = require('../../apex-gp/vendor/three.min.js');
['util.js', 'config.js', 'tires.js', 'carPhysics.js', 'damage.js', 'car.js'].forEach(f => require(path.join('..', 'src', f)));
const A = globalThis.MGP;
for (const kmh of [100, 200, 280]) for (const [st, bk] of [[0, 1], [1, 1], [1, 0.5], [0.5, 1], [1, 0]]) {
  const car = new A.Car(1, { name: 't', number: 7, team: 0, isPlayer: true, riding: 'arcade', tire: 'M' });
  car.reset({ x: 0, z: 0, h: 0 }, 10); car.u = kmh / 3.6; car.gear = 6; for (let w = 0; w < 2; w++) car.tires[w].temp = 96;
  const env = { wet: 0, air: 24 }; let t = 0, amax = 0, ayM = 0, vM = 0, slipM = 0, rM = 0, u0 = car.u, lockN = 0;
  for (let i = 0; i < 240 * 3; i++) {
    t = i / 240; car.in.steer = st; car.in.thr = 0; car.in.brk = bk;
    A.stepCar(car, 1 / 240, env);
    amax = Math.max(amax, -car.axL); ayM = Math.max(ayM, Math.abs(car.u * car.r)); vM = Math.max(vM, Math.abs(car.v)); slipM = Math.max(slipM, car.slip); rM = Math.max(rM, Math.abs(car.r)); if (car.locked) lockN++;
  }
  console.log((kmh + 'km/h').padEnd(8), 'steer', st, 'brk', bk, '| décél max', (amax / 9.81).toFixed(2) + 'G', 'ay max', (ayM / 9.81).toFixed(2) + 'G', '|v| max', vM.toFixed(1), 'slip max', slipM.toFixed(2), 'lacet max', rM.toFixed(2), 'blocages', lockN, 'u fin', (car.u * 3.6).toFixed(0), 'lean', (car.lean * 57.3).toFixed(0) + '°');
}

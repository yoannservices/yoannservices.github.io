// Virage à régime constant : pour chaque vitesse, braquage plein (clavier) -> accélération latérale, inclinaison, glissement, chute ?
const path = require('path');
globalThis.THREE = require('../../apex-gp/vendor/three.min.js');
['util.js', 'config.js', 'tires.js', 'carPhysics.js', 'damage.js', 'car.js'].forEach(f => require(path.join('..', 'src', f)));
const A = globalThis.MGP;
for (const mode of ['arcade']) for (const kmh of [60, 120, 200, 280]) for (const st of [0.3, 0.6, 1]) {
  const car = new A.Car(1, { name: 't', number: 7, team: 0, isPlayer: true, riding: mode, tire: 'M' });
  car.reset({ x: 0, z: 0, h: 0 }, 10); car.u = kmh / 3.6; car.gear = 6; for (let w = 0; w < 2; w++) car.tires[w].temp = 96;
  const env = { wet: 0, air: 24 }; let crashT = null, t = 0, maxlean = 0, ay = 0;
  for (let i = 0; i < 240 * 6; i++) {
    t = i / 240; car.in.steer = st; car.in.thr = car.u * 3.6 < kmh ? 0.6 : 0.1; car.in.brk = 0;
    A.stepCar(car, 1 / 240, env); ay = car.u * car.r; maxlean = Math.max(maxlean, Math.abs(car.lean));
    if (car.crash > 0 && crashT === null) crashT = t;
  }
  console.log(mode.padEnd(6), kmh + 'km/h', 'steer', st, '| ay', (ay / 9.81).toFixed(2) + 'G', 'lean', (car.lean * 57.3).toFixed(0) + '°', 'max', (maxlean * 57.3).toFixed(0) + '°', 'alF', car.alF.toFixed(3), 'alR', car.alR.toFixed(3), crashT !== null ? 'CHUTE à ' + crashT.toFixed(1) + 's' : 'ok');
}

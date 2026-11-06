// Freinage droit plein frein depuis plusieurs vitesses : décélération moyenne (G), chute, stoppie
const path = require('path');
globalThis.THREE = require('../../apex-gp/vendor/three.min.js');
['util.js', 'config.js', 'tires.js', 'carPhysics.js', 'damage.js', 'car.js'].forEach(f => require(path.join('..', 'src', f)));
const A = globalThis.MGP;
for (const kmh of [100, 200, 300]) {
  const car = new A.Car(1, { name: 't', number: 7, team: 0, isPlayer: true, riding: 'arcade', tire: 'M' });
  car.reset({ x: 0, z: 0, h: 0 }, 10); car.u = kmh / 3.6; car.gear = 6; for (let w = 0; w < 2; w++) car.tires[w].temp = 96;
  const env = { wet: 0, air: 24 }; let peak = 0, crash = false, t = 0;
  while (car.u > 5 && t < 12) { car.in.steer = 0; car.in.thr = 0; car.in.brk = 1; A.stepCar(car, 1 / 240, env); t += 1 / 240; peak = Math.max(peak, -car.ax / 9.81); if (car.crash > 0) crash = true; }
  console.log(kmh + 'km/h -> 5 m/s en', t.toFixed(2) + 's', 'decel moy', ((kmh / 3.6 - 5) / t / 9.81).toFixed(2) + 'G', 'pic', peak.toFixed(2) + 'G', crash ? 'CHUTE' : '');
}

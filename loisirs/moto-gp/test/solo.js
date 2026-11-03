// Moto seule en auto-pilote : tour complet, vitesse, inclinaison max, chutes. Usage : node solo.js [circuit] [tours] [niveau]
const path = require('path');
globalThis.THREE = require('../../apex-gp/vendor/three.min.js');
['util.js', 'config.js', 'tires.js', 'carPhysics.js', 'damage.js', 'car.js', 'tracks.js', 'track.js', 'racingLine.js', 'driver.js', 'collision.js', 'debris.js', 'rules.js', 'pitStop.js', 'adaptive.js', 'race.js'].forEach(f => require(path.join('..', 'src', f)));
const A = globalThis.MGP;
const id = process.argv[2] || 'mugello', laps = +process.argv[3] || 2, lv = +(process.argv[4] ?? 2);
const tr = new A.Track(A.TRACK_DEFS.find(d => d.id === id));
const set = Object.assign({}, A.DEFAULT_SETTINGS, { diff: lv, adaptive: false });
const race = new A.Race({ tr, settings: set, mode: 'practice', laps, bots: 0 });
const p = race.player; p.auto_ap = true; p.crashK = 2.2;
race.on((t, d) => { if (t === 'bikecrash' || t === 'crash' && d.sev > 3) console.log(`  [${race.clock.toFixed(1)}s] ${t} s=${p.s.toFixed(0)} u=${(p.u * 3.6).toFixed(0)}km/h alF=${p.alF.toFixed(3)} alR=${p.alR.toFixed(3)} lean=${(p.lean * 57.3).toFixed(0)} vmax=${(race.line.vmax[p.idx] * 3.6).toFixed(0)} why=${d.why}`); if (t === 'lap') console.log(`LAP ${d.lap} ${A.fmt(d.t)} valid=${d.valid} maxL=${p.leanPrevL.toFixed(0)} maxR=${p.leanPrevR.toFixed(0)}`); });
let t = 0, vmaxSeen = 0; const H = 1 / 60;
while (t < 400 && race.clock < 60 * 8) { race.update(H); t += H; vmaxSeen = Math.max(vmaxSeen, p.u * 3.6); if (p.lap > laps) break; }
console.log('vmax', vmaxSeen.toFixed(0), 'km/h, crashes', p.crashes || 0, 'lap', p.lap, 'recoveries');

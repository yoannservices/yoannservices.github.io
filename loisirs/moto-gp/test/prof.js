const path = require('path');
globalThis.THREE = require('../../apex-gp/vendor/three.min.js');
['util.js', 'config.js', 'tires.js', 'carPhysics.js', 'damage.js', 'car.js', 'tracks.js', 'track.js', 'racingLine.js'].forEach(f => require(path.join('..', 'src', f)));
const A = globalThis.MGP; const id = process.argv[2] || 'mugello';
const tr = new A.Track(A.TRACK_DEFS.find(d => d.id === id)); const L = A.buildRacingLine(tr);
let line = ''; for (let i = 0; i < tr.N; i += Math.round(tr.N / 60)) line += `${(i * tr.ds).toFixed(0)}:${(L.vmax[i] * 3.6).toFixed(0)}(k${(1 / Math.max(1e-6, Math.abs(L.k[i]))).toFixed(0)}) `;
console.log('L', tr.L.toFixed(0), 'N', tr.N); console.log(line);
let t = 0, vm = 0; for (let i = 0; i < tr.N; i++) { t += tr.ds / L.vmax[i]; vm += L.vmax[i]; } console.log('tour idéal (vmax)', t.toFixed(1), 's, vitesse moy', (tr.L / t * 3.6).toFixed(0), 'km/h');

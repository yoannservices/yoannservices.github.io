// Définition des circuits en mode « tortue » : droites + arcs (angle > 0 = virage à droite).
// Deux droites inconnues ('?A' toujours en dernier avant la ligne, '?B') sont résolues pour fermer la boucle.
(function () {
  const A = (globalThis.MGP = globalThis.MGP || {});
  const d2r = Math.PI / 180;

  // ops : ['S', len] | ['A', rayon, angleDeg] | ['?A'] | ['?B']
  A.TRACK_DEFS = [
    {
      id: 'mugello', name: 'Autodromo del Mugello', country: 'Italie', width: 14, gap: 14, grass: 'forest', bank: 0.06, startBack: 3985, ref: 105,
      ops: [
        ['S', 1000], ['A', 70, 95], ['S', 130], ['A', 110, -60], ['S', 60], ['A', 90, 80], ['S', 90],
        ['A', 140, -50], ['A', 120, 60], ['S', 120], ['A', 160, -45], ['A', 140, 65], ['S', 90], ['A', 180, 55],
        ['A', 130, 50], ['?B'], ['S', 60], ['A', 120, -50], ['A', 100, -40], ['S', 140], ['A', 70, 55],
        ['A', 60, -20], ['A', 55, 20], ['S', 200], ['A', 65, 145], ['?A'],
      ],
    },
    {
      id: 'assen', name: 'TT Circuit Assen', country: 'Pays-Bas', width: 13, gap: 12, grass: 'plain', bank: 0.03, startBack: 410, ref: 92,
      ops: [
        ['S', 650], ['A', 50, -90], ['S', 90], ['A', 60, 70], ['A', 90, 70], ['S', 140], ['A', 100, 110],
        ['S', 220], ['A', 130, -45], ['A', 110, 55], ['S', 100], ['A', 120, -60], ['A', 90, 60], ['S', 120],
        ['A', 70, -45], ['A', 70, 45], ['S', 100], ['A', 90, -35], ['A', 90, 75], ['?B'], ['A', 80, 80],
        ['S', 80], ['A', 50, 70], ['?A'],
      ],
    },
    {
      id: 'phillip', name: 'Phillip Island', country: 'Australie', width: 14, gap: 16, grass: 'plain', bank: 0.07, startBack: 3979, ref: 88,
      ops: [
        ['S', 770], ['A', 130, 85], ['S', 140], ['A', 250, 55], ['S', 160], ['A', 70, -85], ['S', 160],
        ['A', 160, 145], ['?B'], ['S', 70], ['A', 90, 75], ['S', 340], ['A', 150, -80], ['S', 80],
        ['A', 110, -40], ['A', 140, 30], ['S', 280], ['A', 90, 70], ['A', 150, 50], ['S', 60], ['A', 180, 55],
        ['?A'],
      ],
    },
    {
      id: 'jerez', name: 'Circuito de Jerez', country: 'Espagne', width: 12, gap: 7, grass: 'plain', bank: 0.03, startBack: 3667, ref: 96,
      ops: [
        ['S', 820], ['A', 33, 162], ['S', 192], ['A', 64, -66], ['S', 112], ['A', 45, 85], ['S', 70],
        ['A', 84, -49], ['S', 77], ['A', 37, -62], ['S', 101], ['A', 87, 131], ['?B'], ['S', 371],
        ['A', 74, -32], ['A', 63, 59], ['S', 114], ['A', 45, 92], ['S', 160], ['A', 101, 40], ['?A'],
      ],
    },
    {
      id: 'lemans', name: 'Circuit Bugatti du Mans', country: 'France', width: 13, gap: 10, grass: 'forest', bank: 0.03, startBack: 2788, ref: 91,
      ops: [
        ['S', 570], ['A', 55, 110], ['?B'], ['S', 110], ['A', 70, 95], ['S', 100], ['A', 50, -40],
        ['A', 50, 40], ['S', 120], ['A', 90, 80], ['S', 150], ['A', 80, -90], ['S', 60], ['A', 70, 90],
        ['S', 140], ['A', 40, -85], ['S', 130], ['A', 130, 60], ['A', 70, 40], ['A', 60, -40], ['S', 110],
        ['A', 65, 100], ['?A'],
      ],
    },
    {
      id: 'sachsen', name: 'Sachsenring', country: 'Allemagne', width: 12, gap: 8, grass: 'forest', bank: 0.05, startBack: 1437, ref: 80,
      ops: [
        ['S', 520], ['A', 55, -100], ['S', 90], ['A', 90, -30], ['A', 110, 45], ['S', 80], ['A', 70, -70],
        ['A', 65, 50], ['S', 110], ['A', 90, -90], ['?B'], ['S', 100], ['A', 55, -60], ['A', 50, 50],
        ['A', 60, -70], ['S', 90], ['A', 120, 40], ['A', 95, -80], ['A', 70, -45], ['S', 70], ['A', 65, 0],
        ['?A'],
      ],
    },
    {
      id: 'silverstone', name: 'Silverstone Circuit', country: 'Royaume-Uni', width: 14, gap: 16, grass: 'plain', bank: 0.03, startBack: 2737, ref: 118,
      ops: [
        ['S', 470], ['A', 90, 25], ['A', 140, -70], ['S', 100], ['A', 200, 115], ['A', 160, -35], ['S', 650],
        ['A', 90, 95], ['S', 290], ['A', 70, 55], ['?B'], ['S', 190], ['A', 55, 100], ['S', 110],
        ['A', 80, -100], ['S', 90], ['A', 150, 40], ['A', 100, -70], ['S', 150], ['A', 120, 110], ['A', 70, -35],
        ['A', 80, 40], ['S', 100], ['A', 120, 90], ['?A'],
      ],
    },
    {
      id: 'cota', name: 'Circuit of the Americas', country: 'États-Unis', width: 15, gap: 16, grass: 'plain', bank: 0.04, startBack: 481, ref: 123,
      ops: [
        ['S', 260], ['A', 45, -140], ['?B'], ['S', 160], ['A', 100, 70], ['A', 80, -60], ['A', 85, 55],
        ['A', 90, -70], ['S', 100], ['A', 110, 80], ['S', 90], ['A', 130, -90], ['S', 780], ['A', 40, -170],
        ['S', 280], ['A', 150, 70], ['A', 120, 55], ['S', 100], ['A', 90, -60], ['A', 60, 55], ['S', 120],
        ['A', 130, -90], ['S', 160], ['A', 100, 90], ['A', 140, -155], ['?A'],
      ],
    },
  ];

  // Retourne { pts:[[x,z]...], len, startIdx } — pts espacés d'environ 4 m.
  A.expandOps = def => {
    const walk = (LA, LB, emit) => {
      let x = 0, z = 0, h = 0;
      const seg = (len, dh, r) => {
        const n = Math.max(1, Math.ceil(len / 3));
        for (let i = 0; i < n; i++) {
          if (r) { const h2 = h + dh / n; const hm = (h + h2) / 2; const cl = 2 * r * Math.sin(dh / n / 2) * Math.sign(dh); x += Math.cos(hm) * Math.abs(cl); z += Math.sin(hm) * Math.abs(cl); h = h2; }
          else { x += (Math.cos(h) * len) / n; z += (Math.sin(h) * len) / n; }
          emit && emit(x, z);
        }
      };
      const hd = {};
      for (const op of def.ops) {
        if (op[0] === 'S') seg(op[1]);
        else if (op[0] === 'A') seg(Math.abs(op[1] * op[2] * d2r), op[2] * d2r, op[1]);
        else { hd[op[0]] = h; seg(op[0] === '?A' ? LA : LB); }
      }
      return { x, z, h, hd };
    };
    // 1) déplacement hors droites inconnues, 2) résolution 2x2
    const base = walk(0, 0);
    const hA = base.hd['?A'], hB = base.hd['?B'];
    const det = Math.cos(hA) * Math.sin(hB) - Math.sin(hA) * Math.cos(hB);
    const LA = (-base.x * Math.sin(hB) + base.z * Math.cos(hB)) / det;
    const LB = (-Math.cos(hA) * base.z + Math.sin(hA) * base.x) / det;
    if (!(LA > 0 && LB > 0 && LA < 6000 && LB < 6000)) throw new Error(def.id + ' : fermeture impossible (LA=' + LA.toFixed(0) + ' LB=' + LB.toFixed(0) + ')');
    const pts = [[0, 0]];
    walk(LA, LB, (x, z) => pts.push([x, z]));
    pts.pop(); // dernier point == premier
    return { pts, LA, LB };
  };
})();

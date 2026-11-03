// Données de jeu : écuries, gommes, difficultés, pilotes, réglages par défaut.
(function () {
  const A = (globalThis.MGP = globalThis.MGP || {});

  A.G = 9.81;
  A.PIT_LIMIT = 16.7; // 60 km/h

  // perf : multiplicateurs autour de 1 (puissance, appui, adhérence, ménagement des pneus)
  A.TEAMS = [
    { id: 'ros', name: 'Rosso Corsa Racing', color: 0xd8101a, color2: 0xffffff, perf: { power: 1.02, aero: 1.0, grip: 1.0, care: 0.95 } },
    { id: 'sil', name: 'Silver Arrow Moto', color: 0xc9ced4, color2: 0x00b5a5, perf: { power: 1.03, aero: 1.02, grip: 1.01, care: 1.0 } },
    { id: 'azu', name: 'Azure Speed Team', color: 0x1747d6, color2: 0xff8a00, perf: { power: 1.0, aero: 1.03, grip: 1.0, care: 1.02 } },
    { id: 'pap', name: 'Papaya Factory', color: 0xff7a00, color2: 0x111111, perf: { power: 0.99, aero: 0.99, grip: 1.0, care: 0.98 } },
    { id: 'ver', name: 'Verde Racing', color: 0x0c8f4a, color2: 0xf2f2f2, perf: { power: 0.97, aero: 0.97, grip: 0.98, care: 1.04 } },
    { id: 'vio', name: 'Violet Storm GP', color: 0x7a2bd0, color2: 0xf4d000, perf: { power: 0.96, aero: 0.96, grip: 0.97, care: 1.0 } },
    { id: 'jau', name: 'Solaris Racing', color: 0xf2c200, color2: 0x111111, perf: { power: 0.98, aero: 0.98, grip: 0.99, care: 1.0 } },
    { id: 'noi', name: 'Noir Absolu', color: 0x1a1c20, color2: 0xe8232c, perf: { power: 1.0, aero: 1.0, grip: 0.99, care: 0.97 } },
    { id: 'cya', name: 'Cyan Wave', color: 0x12b5d6, color2: 0xffffff, perf: { power: 0.95, aero: 0.96, grip: 0.97, care: 1.03 } },
    { id: 'ros2', name: 'Rose Quartz Moto', color: 0xe84a8c, color2: 0x2a2a2a, perf: { power: 0.94, aero: 0.95, grip: 0.96, care: 1.02 } },
    { id: 'blc', name: 'Blanc Polaire', color: 0xf2f4f7, color2: 0x1f5fbf, perf: { power: 0.95, aero: 0.95, grip: 0.97, care: 1.0 } },
  ];

  // mu : adhérence relative ; wear : usure relative ; opt/win : température idéale et demi-fenêtre (°C)
  A.COMPOUNDS = {
    S: { id: 'S', name: 'Tendre', color: 0xe02020, mu: 1.0, wear: 1.0, opt: 92, win: 28, type: 'slick' },
    M: { id: 'M', name: 'Medium', color: 0xf2d21b, mu: 0.965, wear: 0.62, opt: 96, win: 30, type: 'slick' },
    H: { id: 'H', name: 'Dur', color: 0xf2f2f2, mu: 0.93, wear: 0.4, opt: 100, win: 32, type: 'slick' },
    W: { id: 'W', name: 'Pluie', color: 0x2a6fe0, mu: 0.85, wear: 0.8, opt: 68, win: 38, type: 'wet' },
  };

  // Facteur d'adhérence selon la piste mouillée w∈[0,1]
  A.wetGrip = (type, w) => {
    const s = A.smooth;
    if (type === 'slick') return 1 - 0.62 * Math.pow(w, 0.8);
    if (type === 'inter') return 0.82 + 0.17 * s(0, 0.45, w) - 0.2 * s(0.6, 1, w);
    return 0.68 + 0.22 * s(0, 0.7, w);
  };

  // pace : fraction de la limite ; err : fautes par minute ; noise : irrégularité ; agg : agressivité (0..1)
  A.DIFFS = [
    { name: 'Débutant', pace: 0.8, noise: 0.05, err: 0.35, agg: 0.15 },
    { name: 'Amateur', pace: 0.87, noise: 0.035, err: 0.18, agg: 0.3 },
    { name: 'Pro', pace: 0.93, noise: 0.022, err: 0.08, agg: 0.5 },
    { name: 'Champion', pace: 0.99, noise: 0.008, err: 0.015, agg: 0.7 },
    { name: 'Légende', pace: 1.0, noise: 0.0025, err: 0.003, agg: 0.9 },
  ];
  // Interpole les paramètres pour un niveau continu 0..4
  A.diffAt = lv => {
    lv = A.clamp(lv, 0, 4);
    const i = Math.min(3, Math.floor(lv)), f = lv - i, a = A.DIFFS[i], b = A.DIFFS[i + 1];
    const o = { name: A.DIFFS[Math.round(lv)].name };
    for (const k of ['pace', 'noise', 'err', 'agg']) o[k] = A.lerp(a[k], b[k], f);
    return o;
  };

  // team : index d'écurie ; style : prudent | agressif | regulier | cannibale
  A.DRIVERS = [
    ['L. Marchand', 'regulier'], ['K. Brandt', 'agressif'], ['T. Okada', 'prudent'], ['M. Ferrer', 'cannibale'],
    ['J. Whitfield', 'regulier'], ['A. Kovacs', 'agressif'], ['R. Dubois', 'prudent'], ['S. Lindqvist', 'regulier'],
    ['D. Moretti', 'cannibale'], ['E. Santos', 'agressif'], ['P. Novak', 'prudent'], ['H. Tanaka', 'regulier'],
    ['G. Leclair', 'agressif'], ['N. Petrov', 'cannibale'], ['C. Alvarez', 'prudent'], ['B. O’Neill', 'regulier'],
    ['F. Rossi', 'agressif'], ['V. Hartmann', 'prudent'], ['Y. Benali', 'cannibale'], ['I. Sato', 'regulier'],
    ['O. Nilsen', 'prudent'],
  ].map((d, i) => ({ name: d[0], style: d[1], team: (i + 1) % 11, skill: 0.97 + ((i * 37) % 7) / 100 }));

  // motifs de sanction (affichés à l'écran, dits par la radio et listés dans les résultats)
  A.PEN_WHY = {
    limits: 'limites de piste', collision: 'collision', contact: 'contact', rearend: 'tamponnement', weave: 'zigzag devant un concurrent', sidehit: 'contact latéral',
    incident: 'accrochage', forced: 'a poussé un concurrent hors piste', scpass: 'dépassement sous safety car', yellowpass: 'dépassement sous drapeau jaune', pitspeed: 'excès de vitesse aux stands',
  };
  A.POINTS = [25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

  A.DEFAULT_SETTINGS = {
    name: 'Toi',
    team: 0,
    number: 7,
    laps: 5,
    leanReset: 'lap', // lap | session
    diff: 2,
    adaptive: true,
    weather: 'sun', // sun | cloud | rain | dynamic
    night: false,
    start: 'grid', // grid | rolling
    qualif: false,
    tire: 'M',
    riding: 'arcade',
    shadows: true,
    mirrors: true,
    assists: { line: true, abs: true, tc: true, auto: true, limiter: true, wheelie: true },
    audio: { master: 0.7, engine: 0.7, radio: 0.8, voice: '', freq: 'normal', radioOn: true },
    setup: { wing: 0.5, bias: 0.62, pF: 21, pR: 20.5 },
  };
})();

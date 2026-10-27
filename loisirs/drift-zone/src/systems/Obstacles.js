
/** Quatre murs autour de la zone [w, h]. */
function arenaWalls([w, h]) {
  const t = 40;
  return [
    { type: 'wall', x: w / 2, y: -t / 2, w: w + 2 * t, h: t },
    { type: 'wall', x: w / 2, y: h + t / 2, w: w + 2 * t, h: t },
    { type: 'wall', x: -t / 2, y: h / 2, w: t, h },
    { type: 'wall', x: w + t / 2, y: h / 2, w: t, h },
  ];
}

/** def : { type, x, y, angle?, w?, h?, r? } -> objet runtime (données seulement, sans rendu). */
function createObstacle(def) {
  const spec = OBSTACLE_TYPES[def.type];
  if (!spec) throw new Error(`Type d'obstacle inconnu : ${def.type}`);
  const o = { ...spec, ...def, angle: def.angle ?? 0, vx: 0, vy: 0, av: 0, stamp: 0 };
  o.home = { x: o.x, y: o.y, angle: o.angle };
  o.br = o.shape === 'circle' ? o.r : Math.hypot(o.w, o.h) / 2;
  return o;
}

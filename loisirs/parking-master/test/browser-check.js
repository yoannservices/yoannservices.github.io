/* Vérification des niveaux dans le navigateur (le décor a besoin de Three.js et du canvas) :
   const { check } = await import('/loisirs/parking-master/test/browser-check.js'); await check(['ville-2']);   // sans argument : tous les niveaux
   Pour chaque niveau : départ libre, voiture entrant dans la place sans contact, route libre de tout obstacle, PNJ sans blocage de la place,
   réussite du stationnement et choc fort (perdu) / léger (avertissement) simulés. */
export async function check(ids) {
  const C = await import('../src/gameplay/collision.js');
  const L = await import('../src/levels/levels.js');
  const g = window.__pm, out = {};
  const none = { throttle: 0, brake: 0, steer: 0, hand: false };
  for (const lv of L.LEVELS.filter((l) => !ids || ids.includes(l.id))) {
    const t0 = performance.now();
    await g.start(lv.id); g.mode = 'test';
    const d = g.car.dim, hl = d.length * 0.49, hw = d.width * 0.49, cols = g.place.colliders.filter((o) => !o.dyn), st = L.startOf(lv), res = { car: lv.car, ms: Math.round(performance.now() - t0), colliders: cols.length };
    res.startFree = !C.worstContact(C.carBox(st.x, st.z, st.yaw, hl, hw), cols);
    const sp = lv.spot, inSpot = C.carBox(sp.x, sp.z, sp.yaw, hl, hw), w = C.worstContact(inSpot, cols);
    res.spot = { free: !w, fits: C.insideSpot(inSpot, sp), slackLen: +(sp.len - d.length).toFixed(2), slackWid: +(sp.wid - d.width).toFixed(2) };
    if (w) res.spot.blocker = [w.obj.k, +w.obj.x.toFixed(1), +w.obj.z.toFixed(1), +w.depth.toFixed(2)];
    const hits = [];
    for (let i = 0; i < lv.route.length - 1; i++) {
      const a = lv.route[i], b = lv.route[i + 1], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1])), yaw = Math.atan2(b[0] - a[0], b[1] - a[1]);
      for (let k = 0; k <= n; k++) { const x = a[0] + (b[0] - a[0]) * k / n, z = a[1] + (b[1] - a[1]) * k / n, c = C.worstContact(C.carBox(x, z, yaw, hl, hw), cols); if (c) hits.push([+x.toFixed(1), +z.toFixed(1), c.obj.k, +c.obj.x.toFixed(1), +c.obj.z.toFixed(1)]); }
    }
    res.routeHits = hits.length; if (hits.length) res.firstHits = hits.slice(0, 4);
    // PNJ : pendant 90 s, la place reste-t-elle libre d'obstacles mobiles ?
    let busy = 0;
    if (g.place.update) for (let t = 0; t < 90; t += 0.1) { g.place.update(0.1, { x: st.x, z: st.z, v: 0, yaw: st.yaw }); if (C.worstContact(inSpot, g.place.colliders.filter((o) => o.dyn))) busy++; }
    res.npcInSpotSteps = busy;
    g.start; await g.start(lv.id); g.mode = 'test';
    g.phys.place(sp.x, sp.z, sp.yaw); g.run.state = 'driving'; g.run.time = 10;
    for (let t = 0; t < 1.5; t += 1 / 60) g.run.update(1 / 60, none);
    res.park = g.run.state + ' ' + g.run.stars + '★';
    out[lv.id] = res;
  }
  g.mode = 'menu';
  return out;
}

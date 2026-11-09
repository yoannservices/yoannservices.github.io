// Aide de test dans le navigateur (non chargée par le jeu). Dans la console de la page du jeu :
//   const src = await (await fetch('test/scene-sirene.js')).text(); await (async () => {}).constructor(src)();
//   sireneTest(30, 'epa')   // n pas de 1/30 s, engin 'fpt' | 'epa' | 'vsav'
// L'engin roule sirène allumée, sur le tracé GPS sirène (1,5 m de la ligne médiane), vers une file de 5 voitures et un carrefour à feux avec passages piétons.
// Renvoie minCar (écart engin / voitures, m, doit rester >= 0), minPed (piéton sur un passage le plus proche), vitesse, z.
const g = window.game, { nodes } = await import(new URL('src/city/grid.js', document.baseURI).href);
let cur = null;
const key = (k, type) => dispatchEvent(new KeyboardEvent(type, { key: k }));
function setup(name) {
  const veh = { fpt: g.truck, epa: g.epa, vsav: g.vsav }[name];
  g.menu.toggle(false); g.started = true;
  for (const v of g.vehicles) v.setSiren(false);
  g.driving = veh; g.crew.board();
  veh.place(48.5, -215, 0); veh.setSiren(true);
  g.traffic.gather(nodes[5 * 10 + 3], 1, 5, veh.phys); g.traffic.jam.clear();   // file vers le sud après le carrefour (x 50, z -150)
  for (const c of g.traffic.cars) if (c.active && c.leg.type === 'edge' && c.leg.a === nodes[53] && c.leg.k === 1) c.v = 6;
  cur = name;
}
window.sireneTest = (n = 60, name = 'fpt') => {
  if (cur !== name) setup(name);
  key('z', 'keydown');
  let minCar = Infinity, minPed = Infinity, minSpeed = Infinity;
  const veh = g.driving;
  for (let i = 0; i < n; i++) {
    g.step(1 / 30);
    for (const c of g.traffic.cars) if (c.active) for (const q of g.traffic.footprint(c)) minCar = Math.min(minCar, veh.boxDist(q.x, q.z) - q.r);
    for (const p of g.peds.list) if (p.state === 'cross') minPed = Math.min(minPed, veh.boxDist(p.x, p.z));
    minSpeed = Math.min(minSpeed, veh.phys.speed);
  }
  key('z', 'keyup');
  return { minCar: +minCar.toFixed(2), minPed: +minPed.toFixed(2), minSpeed: +minSpeed.toFixed(1), speed: +veh.phys.speed.toFixed(1), z: +veh.phys.z.toFixed(1) };
};

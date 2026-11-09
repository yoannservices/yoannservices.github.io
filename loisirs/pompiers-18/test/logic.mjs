// Tests de logique sans navigateur : node test/logic.mjs
import assert from 'node:assert/strict';
import { FireSim, IGNITE_T } from '../src/fire/FireSim.js';
import { WaterSupply, pathLength, LANCE } from '../src/firefighter/water.js';
import { ruleFine } from '../src/economy/fines.js';

const run = (sim, s, dt = 0.05) => { for (let t = 0; t < s; t += dt) sim.update(dt); };
const two = (open) => new FireSim([{ name: 'A' }, { name: 'B' }], [{ a: 0, b: 1, kind: 'door', open }]);

// 1. le feu passe une porte ouverte, pas une porte fermée
{
  const o = two(true); o.ignite(0); run(o, 150);
  assert.ok(o.rooms[1].fire > 0, 'porte ouverte : la pièce voisine doit s\'embraser');
  const c = two(false); c.ignite(0); run(c, 150);
  assert.equal(c.rooms[1].fire, 0, 'porte fermée : la voisine ne doit pas brûler');
  assert.ok(c.rooms[1].T < IGNITE_T);
  assert.ok(o.rooms[1].smoke > c.rooms[1].smoke, 'la fumée passe mieux par une porte ouverte');
}

// 2. la lance éteint et refroidit ; feu « éteint » seulement une fois refroidi
{
  const s = new FireSim([{ name: 'Salon' }], []); s.ignite(0); run(s, 60);
  assert.equal(s.rooms[0].fire, 1);
  const T0 = s.rooms[0].T;
  for (let t = 0; t < 40; t += 0.05) { s.applyWater(0, (LANCE.jet.flow / 60) * 0.05, 'jet'); s.update(0.05); }
  assert.equal(s.rooms[0].fire, 0, 'le jet doit éteindre en moins de 40 s');
  assert.ok(s.rooms[0].T < T0);
  for (let t = 0; t < 20; t += 0.05) { s.applyWater(0, (LANCE.diffuse.flow / 60) * 0.05, 'diffuse'); s.update(0.05); }
  assert.ok(s.out, 'refroidi au diffusé : feu éteint');
  assert.ok(s.damage() > 0 && s.damage() < 1);
}

// 3. la citerne se vide au débit de la lance, le poteau la remplit
{
  const w = new WaterSupply(3000);
  for (let t = 0; t < 60; t += 0.1) w.draw(500, 0.1);
  assert.ok(Math.abs(w.level - 2500) < 1, `500 L/min pendant 1 min : ${w.level}`);
  for (let t = 0; t < 400; t += 0.1) w.draw(500, 0.1);
  assert.equal(w.level, 0); assert.equal(w.draw(500, 1), 0, 'citerne vide : plus d\'eau');
  w.refill(1000, 60); assert.ok(Math.abs(w.level - 1000) < 1e-6);
}

// 4. longueur du tuyau
assert.equal(pathLength([{ x: 0, z: 0 }, { x: 3, z: 4 }, { x: 3, z: 14 }]), 15);

// 5. sirène : pas d'amende au feu rouge ni pour la vitesse ; collision toujours comptée
assert.equal(ruleFine('red', { siren: true }), 0);
assert.ok(ruleFine('red', { siren: false }) > 0);
assert.equal(ruleFine('speed', { siren: true, kmh: 90, limit: 50 }), 0);
assert.ok(ruleFine('speed', { siren: false, kmh: 90, limit: 50 }) > 0);
assert.equal(ruleFine('speed', { siren: false, kmh: 55, limit: 50 }), 0);
assert.ok(ruleFine('collision', { siren: true }) > 0);

console.log('logic.mjs : tous les tests passent');

// 6. bilan : victimes sauvées et décès comptent, rapidité récompensée
import { missionPay } from '../src/mission/pay.js';
{
  const base = { arrival: 100, damage: 0.2, used: 1000 };
  assert.ok(missionPay({ ...base, saved: 1 }).pay > missionPay(base).pay);
  assert.ok(missionPay({ ...base, dead: 1 }).pay < missionPay(base).pay);
  assert.ok(missionPay({ ...base, arrival: 400 }).pay < missionPay(base).pay);
  assert.ok(missionPay({ type: 'sap', arrival: 100, hp: 90 }).pay > missionPay({ type: 'sap', arrival: 100, hp: 30 }).pay);
  assert.ok(missionPay({ ...base, burnedOut: true }).pay <= 120);
  console.log('bilan : OK');
}

// 7. itinéraire : suit les routes, finit sur la cible, annonce le bon virage
import { routePoints, nextTurn } from '../src/nav/path.js';
{
  const pts = routePoints({ x: -300, z: 24 }, { x: 200, z: 147 });   // caserne -> hôpital
  const end = pts[pts.length - 1];
  assert.ok(end.x === 200 && end.z === 147);
  const L = pts.reduce((a, p, i) => (i ? a + Math.abs(p.x - pts[i - 1].x) + Math.abs(p.z - pts[i - 1].z) : 0), 0);
  assert.ok(L < 500 + 147 + 60, `trajet trop long : ${L}`);
  // vers l'est puis vers le sud : virage à droite
  assert.equal(nextTurn([{ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 100, z: 0 }, { x: 100, z: 100 }, { x: 100, z: 110 }, { x: 105, z: 110 }]).turn, 'droite');
  assert.equal(nextTurn([{ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 100, z: 0 }, { x: 100, z: -100 }, { x: 100, z: -110 }, { x: 105, z: -110 }]).turn, 'gauche');
  console.log('itinéraire : OK');
}

// 8. escalier en lacets : chaque volée monte d'un étage, deux volées ne se superposent pas, hors volée = null
import { stairY, LANES } from '../src/fire/stairs.js';
{
  const A = LANES[0], B = LANES[1], za = (A.z0 + A.z1) / 2, zb = (B.z0 + B.z1) / 2;
  assert.ok(Math.abs(stairY(A.x0, za, 0, 4) - 0) < 0.01 && Math.abs(stairY(A.x1, za, 3, 4) - 3) < 0.01);     // volée 0 : 0 -> 3 vers +x
  assert.ok(Math.abs(stairY(B.x1, zb, 3, 4) - 3) < 0.01 && Math.abs(stairY(B.x0, zb, 6, 4) - 6) < 0.01);     // volée 1 : 3 -> 6 vers -x
  assert.ok(Math.abs(stairY(A.x0, za, 6, 4) - 6) < 0.01 && Math.abs(stairY(A.x1, za, 9, 4) - 9) < 0.01);     // volée 2 sur la voie A, 6 m au-dessus de la 0
  assert.equal(stairY(0, zb, 0, 4), null);                                                                    // rez-de-chaussée, voie B : rien
  assert.equal(stairY(0, -1, 3, 4), null);
  assert.equal(stairY(0, za, 0, 1), stairY(0, za, 0, 4));                                                     // maison R+1 : une seule volée
  console.log('escalier : OK');
}

// 12. laisser passer la sirène : voiture collée au trottoir, détection devant l'engin, piétons qui s'écartent, hauteur du sol
{
  const { curbLat, sirenAhead, pedFlee } = await import('../src/traffic/yield.js');
  const { groundY, HALF, LANE } = await import('../src/city/grid.js');
  for (const wid of [1.7, 1.9, 2.1]) {
    const lat = curbLat(wid);
    assert.ok(LANE + lat + wid / 2 <= HALF, 'la voiture rangée reste sur la chaussée');
    assert.ok(LANE + lat - wid / 2 >= LANE + 0.3, 'la voiture rangée libère le côté gauche de sa voie');
  }
  const s = { x: 0, z: 0, h: 0 };                                       // engin vers +z
  assert.ok(sirenAhead(s, 0, 30));                                     // devant
  assert.ok(!sirenAhead(s, 0, -20));                                   // derrière
  assert.ok(!sirenAhead(s, 0, 80));                                    // trop loin
  assert.ok(!sirenAhead(null, 0, 10));                                 // pas de sirène
  const a = { t: 0.2, side: 0, back: false };                          // engagé avant le milieu : demi-tour
  const u0 = a.side === 0 ? a.t : 1 - a.t;
  assert.ok(pedFlee(a) > 1 && a.back && a.side === 1);
  assert.ok(Math.abs((a.side === 0 ? a.t : 1 - a.t) - u0) < 1e-9, 'demi-tour sans sauter de place');
  const b = { t: 0.7, side: 0, back: false }; pedFlee(b);                // après le milieu : continue en pressant le pas
  assert.ok(b.side === 0 && b.t === 0.7);
  assert.equal(groundY(50, 0), 0.02);                                  // rue nord-sud
  assert.equal(groundY(0, 0), 0.15);                                   // trottoir d'un îlot
  assert.equal(groundY(-300, 20), 0.18);                               // cour de la caserne
  console.log('sirène et sol : OK');
}

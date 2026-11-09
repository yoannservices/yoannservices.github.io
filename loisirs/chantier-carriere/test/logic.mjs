// Tests de logique sans navigateur : node test/logic.mjs
import assert from 'node:assert/strict';
import { Terrain, N, CELL, tonnes, baseHeight } from '../src/core/terrain.js';
import { boxCollider, circleCollider, collideVehicle, deepestContact, vehicleBox } from '../src/collision.js';
import { Machine, SPECS } from '../src/machines/Machine.js';
import { pourAt, work } from '../src/machines/ops.js';
import { Plant, PLANT } from '../src/world/Plant.js';
import { Economy, UPGRADES } from '../src/economy/Economy.js';
import { Orders } from '../src/economy/Orders.js';

const mem = () => { const s = {}; return { getItem: (k) => s[k] ?? null, setItem: (k, v) => { s[k] = String(v); }, removeItem: (k) => { delete s[k]; } }; };
const volume = (t) => { let v = 0; for (let k = 0; k < N * N; k++) v += (t.H[k] + t.L[k]) * CELL * CELL; return v; };

// 1. collisions (reprises du prototype)
{
  const loader = vehicleBox(0, 0, 0, 1.65, 1.2);
  assert.equal(collideVehicle(loader, circleCollider(0, 4, 0.5)), null);
  const c = collideVehicle(loader, boxCollider(0, 2, 2, 0.5)); assert.ok(c && c.nz < -0.99 && c.depth > 0);
  const off = circleCollider(0, 0, 0.6); off.active = false; assert.equal(deepestContact(loader, [off]), null);
}

// 2. terrain : plateau plat, gradins, front de taille
{
  const t = new Terrain();
  assert.equal(t.height(-40, 0), 0); assert.ok(Math.abs(t.height(35, 0) - 5) < 0.05); assert.ok(Math.abs(t.height(70, 0) - 10) < 0.05);
  assert.ok(t.height(14, -60) < 0.05 && t.height(60, -60) > 7, 'rampe qui monte');
}

// 3. creuser / déposer conserve le volume ; la chargeuse ne creuse pas la roche en place
{
  const t = new Terrain(); const before = volume(t);
  t.add(0, 0, 4, 100, 0);
  assert.ok(Math.abs(volume(t) - before - 100) < 1e-3, 'add : +100 m³');
  assert.ok(t.height(0, 0) > 0.5);
  const d = t.dig(0, 0, 3, 0, 30, 0);
  assert.ok(Math.abs(d.vol - 30) < 0.5, `dig ~30 m³ (obtenu ${d.vol})`);
  assert.ok(Math.abs(volume(t) - before - 70) < 0.5, 'volume conservé');
  assert.equal(d.g, 0);
  const wall = new Terrain(), w0 = volume(wall);
  assert.equal(wall.dig(26, 0, 2, 0, 50, 0).vol, 0, 'roche en place intacte sans « solid »');
  assert.ok(wall.dig(26, 0, 2, 0, 50, 0.3).vol > 0, 'la pelle entame la roche');
  assert.ok(volume(wall) < w0);
}

// 4. éboulement : un tas trop raide s'étale sans perdre de matière, pente <= angle de talus
{
  const t = new Terrain(); t.add(-30, 20, 1.6, 120, 0); const v0 = t.total(-80, 80, -80, 80);
  for (let i = 0; i < 600; i++) if (!t.relax(5000)) break;
  assert.equal(t.active.size, 0, 'le tas se stabilise');
  assert.ok(Math.abs(t.total(-80, 80, -80, 80) - v0) < 0.2, 'éboulement : matière conservée');
  assert.ok(t.height(-30, 20) < 7, 'tas aplati');
}

// 5. gravier : la fraction G suit la matière
{
  const t = new Terrain(); t.add(0, 0, 3, 50, 1); t.add(0, 0, 3, 50, 0);
  const d = t.dig(0, 0, 4, 0, 40, 0); assert.ok(d.g > 0.3 && d.g < 0.7, `mélange ~50 % (obtenu ${d.g.toFixed(2)})`);
  assert.ok(tonnes(10, 1) > tonnes(10, 0));
}

// 6. tir de mine : la roche du front tombe au pied, volume foisonné
{
  const t = new Terrain(); const site = { x0: 24.5, cz: 0, halfW: 15, floor: 0, depth: 4 };
  const vol = t.blast(site);
  assert.ok(vol > 100, `tir : ${vol.toFixed(0)} m³ détachés`);
  assert.ok(t.total(0, 30, -20, 20) > vol, 'roche abattue au pied du front');
  assert.equal(site.x0, 28.5, 'le front recule');
}

// 7. sauvegarde du terrain
{
  const t = new Terrain(); t.add(5, 5, 3, 40, 0.5); const u = new Terrain(); assert.ok(u.decode(t.encode()));
  assert.ok(Math.abs(u.height(5, 5) - t.height(5, 5)) < 0.05);
}

// 8. concasseur : trémie -> tas de gravier
{
  const t = new Terrain(), p = new Plant(), v0 = t.total(-80, 80, -80, 80);
  assert.equal(p.feed(100), PLANT.hopper.cap, 'trémie limitée à sa capacité');
  for (let i = 0; i < 4000; i++) p.update(0.05, t);
  assert.ok(p.crushed > 30, 'tout est concassé'); assert.ok(p.hopper < 1e-6);
  assert.ok(t.total(-80, 80, -80, 80) - v0 > 30 * 0.9, 'le gravier forme un tas');
  assert.ok(t.G[Math.round((PLANT.stock.z + 80) / CELL) * N + Math.round((PLANT.stock.x + 80) / CELL)] > 0.9);
}

// 9. engins : conduite, pente, collisions, carburant
{
  const t = new Terrain(), world = { terrain: t, plant: new Plant(), machines: [], obstacles: () => [] };
  const m = new Machine(SPECS.loader, -40, 0, 0);
  for (let i = 0; i < 300; i++) m.update(1 / 60, { drive: 1, steer: 0, brake: 0, hand: false, t1: 0, t2: 0 }, world);
  assert.ok(m.z > 10 && m.speed > 5, 'la chargeuse avance'); assert.ok(m.fuel < SPECS.loader.fuel);
  for (let i = 0; i < 300; i++) m.update(1 / 60, { drive: 0, steer: 0, brake: 1, hand: true, t1: 0, t2: 0 }, world);
  assert.ok(Math.abs(m.speed) < 0.05, 'frein à main');
  const w = new Machine(SPECS.dumper, 20, 0, Math.PI / 2);   // contre le front de taille (mur de 5 m)
  for (let i = 0; i < 600; i++) w.update(1 / 60, { drive: 1, steer: 0, brake: 0, hand: false, t1: 0 }, world);
  assert.ok(w.x < 27, `le tombereau ne grimpe pas le mur (x = ${w.x.toFixed(1)})`);
  const x = new Machine(SPECS.truck, 0, 0, 0), wall = { terrain: t, plant: world.plant, machines: [], obstacles: () => [boxCollider(0, 8, 6, 0.5)] };
  for (let i = 0; i < 400; i++) x.update(1 / 60, { drive: 1, steer: 0, brake: 0, hand: false, t1: 0 }, wall);
  assert.ok(x.z < 8 && x.damage > 0, 'choc : dégâts');
  const f = new Machine(SPECS.loader, 0, 0, 0); f.fuel = 0;
  for (let i = 0; i < 60; i++) f.update(1 / 60, { drive: 1, steer: 0, brake: 0, hand: false, t1: 0, t2: 0 }, world);
  assert.ok(!f.running && f.z < 0.5, 'panne sèche : immobile');
}

// 10. chaîne complète : godet -> tombereau -> trémie
{
  const t = new Terrain(), plant = new Plant(), mods = {};
  const world = { terrain: t, plant, machines: [], obstacles: () => [] };
  const loader = new Machine(SPECS.loader, 0, 0, 0), dumper = new Machine(SPECS.dumper, 3, 0, 0), exc = new Machine(SPECS.excavator, 0, 8, 0);
  world.machines.push(loader, dumper, exc);
  t.add(0, 12, 2.5, 20, 0);
  // godet : creuse le tas quand la pointe est dans la matière et que la chargeuse avance
  loader.speed = 2; const tip = { x: 0, y: 0.03, z: 11.5 }, pour = { x: 3, y: 3, z: -2 };
  const dv = []; for (let i = 0; i < 100; i++) { loader.speed = 2; dv.push(work(world, loader, tip, pour, 1 / 60, mods).dig); }
  assert.ok(loader.cargo.vol > 1 && loader.cargo.vol <= 3.5 + 1e-9, `godet rempli (${loader.cargo.vol.toFixed(2)} m³)`);
  loader.speed = 0; loader.tool.tilt = 0.1;   // godet ouvert au-dessus de la benne du tombereau (point local x=0, z=-2.4)
  const above = { x: 3, y: 4, z: -2.4 }; for (let i = 0; i < 200; i++) work(world, loader, tip, above, 1 / 60, mods);
  assert.ok(dumper.cargo.vol > 1, 'benne chargée par le godet'); assert.ok(loader.cargo.vol < 0.05);
  // tombereau : benne levée au-dessus de la trémie
  dumper.cargo = { vol: 10, g: 0 }; dumper.x = PLANT.hopper.x0 + 2; dumper.z = 0; dumper.h = Math.PI / 2; dumper.tool.bed = 1;
  // le point arrière de la benne (z0 - 0.6 = -5.5 le long de h) doit tomber dans la trémie
  dumper.x = -40; dumper.h = Math.PI / 2;   // face à l est, cul vers la trémie à l ouest
  for (let i = 0; i < 300; i++) work(world, dumper, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, 1 / 60, mods);
  assert.ok(plant.hopper > 5, `roche versée dans la trémie (${plant.hopper.toFixed(1)} m³)`);
}

// 11. économie et commandes
{
  const e = new Economy(mem()); assert.equal(e.grade, 'Manœuvre');
  e.addXp(250); assert.equal(e.grade, 'Conducteur d\'engins');
  const m = e.d.money; assert.equal(e.buy('bucket'), null); assert.equal(e.d.money, m - UPGRADES.bucket.price);
  assert.ok(e.buy('crusher')); e.d.money = 99999; e.d.xp = 700; assert.equal(e.buy('crusher'), null);
  e.save(); assert.equal(new Economy(e.storage).d.up.crusher, 1);
  const o = new Orders(); const ord = o.make(0); o.list.push(ord);
  assert.equal(o.pick(), ord);
  const r = o.deliver(ord, ord.qty); assert.ok(r.finished && r.bonus > 0 && o.list.length === 0);
  assert.equal(o.pick(), null);
  const l = new Orders([{ id: 1, client: 'x', qty: 10, done: 0, left: 1, bonus: 10, late: false }]); assert.equal(l.update(2).length, 1, 'commande en retard détectée');
}
console.log('Chantier & Carrière : tous les tests passent.');

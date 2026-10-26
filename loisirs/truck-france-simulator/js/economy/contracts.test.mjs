// node js/economy/contracts.test.mjs
import assert from 'node:assert/strict';
import { generateContracts, settle } from './contracts.js';

const cs = generateContracts('reefer');
assert.equal(cs.length, 5);
for (const c of cs) assert.ok(c.from !== c.to && c.km >= 150 && c.pay > c.km && c.deadline > 1);

const c = { pay: 1000, deadline: 10 };
assert.equal(settle(c, { hours: 9, cargoDmg: 0, truckDmg: 0 }).net, 1100);          // à l'heure : +10 %
assert.equal(settle(c, { hours: 12, cargoDmg: 0, truckDmg: 0 }).net, 800);          // 2 h de retard : -20 %
assert.equal(settle(c, { hours: 9, cargoDmg: 20, truckDmg: 10 }).net, 1000 - 200 - 400); // pas de bonus si cargaison ≥ 5 %
assert.equal(settle(c, { hours: 99, cargoDmg: 0, truckDmg: 0 }).net, 500);          // retard plafonné à 50 %
assert.equal(settle(c, { failed: true }).net, -2000);
console.log('OK');

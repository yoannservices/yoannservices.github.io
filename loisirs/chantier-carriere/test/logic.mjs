import assert from 'node:assert/strict';
import { advanceAutomation, recordDelivery } from '../src/progression.js';
import { boxCollider, circleCollider, collideVehicle, deepestContact, vehicleBox } from '../src/collision.js';

let deliveries = 0;
let money = 0;
for (let index = 0; index < 2; index++) {
	const result = recordDelivery(deliveries, money);
	deliveries = result.deliveries;
	money = result.money;
	assert.equal(result.unlocked, false);
}
const unlock = recordDelivery(deliveries, money);
assert.deepEqual(unlock, { deliveries: 3, money: 120, unlocked: true });
assert.deepEqual(advanceAutomation(0, 9.5), { elapsed: 9.5, reward: 0 });
assert.deepEqual(advanceAutomation(9.5, 1), { elapsed: 0.5, reward: 20 });
assert.deepEqual(advanceAutomation(0, 25), { elapsed: 5, reward: 40 });

const loader = vehicleBox(0, 0, 0, 1.65, 1.2);
assert.equal(collideVehicle(loader, circleCollider(0, 4, 0.5)), null);
const pileContact = collideVehicle(loader, circleCollider(0, 2.1, 0.6));
assert.ok(pileContact && pileContact.nz < -0.99 && pileContact.depth > 0);
const wallContact = collideVehicle(loader, boxCollider(0, 2, 2, 0.5));
assert.ok(wallContact && wallContact.nz < -0.99 && wallContact.depth > 0);
assert.ok(collideVehicle(vehicleBox(0, 0, Math.PI / 4, 1.65, 1.2), boxCollider(2, 1, 0.5, 0.5, 0.2)));
const inactive = circleCollider(0, 0, 0.6);
inactive.active = false;
assert.equal(deepestContact(loader, [inactive]), null);
console.log('Prototype progression checks passed.');

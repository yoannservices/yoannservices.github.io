export const AUTOMATION_UNLOCK_DELIVERIES = 3;
export const AUTOMATION_INTERVAL = 10;
const DELIVERY_REWARD = 40;
const AUTOMATION_REWARD = 20;

export function recordDelivery(deliveries, money) {
  const nextDeliveries = deliveries + 1;
  return {
    deliveries: nextDeliveries,
    money: money + DELIVERY_REWARD,
    unlocked: deliveries < AUTOMATION_UNLOCK_DELIVERIES && nextDeliveries >= AUTOMATION_UNLOCK_DELIVERIES,
  };
}

export function advanceAutomation(elapsed, deltaSeconds) {
  const total = elapsed + deltaSeconds;
  const cycles = Math.floor(total / AUTOMATION_INTERVAL);
  return {
    elapsed: total - cycles * AUTOMATION_INTERVAL,
    reward: cycles * AUTOMATION_REWARD,
  };
}

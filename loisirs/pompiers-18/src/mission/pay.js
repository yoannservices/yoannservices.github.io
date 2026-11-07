// Bilan chiffré d'une intervention (logique pure, testée dans test/logic.mjs).
export function missionPay({ arrival, damage = 0, used = 0, fines = 0, burnedOut = false, saved = 0, dead = 0, type = 'feu', hp = 100 }) {
  let pay = type === 'sap' ? 350 : 500;
  pay += Math.round(300 * Math.max(0, Math.min(1, (360 - arrival) / 240)));   // arrivé en moins de 2 min = bonus plein
  if (type === 'feu') { pay -= Math.round(damage * 500); pay += Math.round(100 * Math.max(0, 1 - used / 3000)); }
  else pay += Math.round(hp * 2);
  pay += saved * 250 - dead * 400 - fines;
  if (burnedOut) pay = Math.min(pay, 120);
  pay = Math.max(50, pay);
  return { pay, xp: Math.round(40 + pay / 6) };
}

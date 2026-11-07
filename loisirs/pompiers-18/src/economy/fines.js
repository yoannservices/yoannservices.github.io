// Code de la route du FPT, logique pure (testée dans test/logic.mjs).
// Pénalité (€) d'une infraction, 0 si le véhicule est prioritaire (logique pure, testée).
export function ruleFine(kind, { siren = false, kmh = 0, limit = 50 } = {}) {
  if (kind === 'collision') return 150;
  if (siren) return 0;
  if (kind === 'red') return 135;
  if (kind === 'stop') return 90;
  if (kind === 'speed') return kmh > limit + 10 ? 45 + Math.round(kmh - limit - 10) * 2 : 0;
  return 0;
}

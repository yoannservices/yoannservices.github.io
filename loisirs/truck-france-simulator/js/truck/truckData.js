// Données des cabines et remorques (unités SI : kW, kg, L, m, €)
export const CABS = {
  regional: { id: 'regional', name: 'Régionale', powerKw: 243, mass: 7500, tank: 300, price: 60000, cabH: 2.1, color: 0x3b82f6, steer: 1.0, sleeper: false },
  long:     { id: 'long', name: 'Longue distance', powerKw: 338, mass: 8500, tank: 600, price: 95000, cabH: 2.8, color: 0xa855f7, steer: 0.92, sleeper: false },
  sleeper:  { id: 'sleeper', name: 'Couchette', powerKw: 382, mass: 9200, tank: 800, price: 130000, cabH: 3.1, color: 0xf97316, steer: 0.88, sleeper: true },
};

// axleDist : distance sellette -> essieux remorque ; sway : réactivité de l'articulation ;
// brake : efficacité de freinage ; steerPenalty : perte d'angle de braquage
export const TRAILERS = {
  tarp:      { id: 'tarp', name: 'Bâchée', empty: 6500, maxLoad: 24000, length: 13.6, axleDist: 9.5, sway: 1.0, brake: 1.0, steerPenalty: 1.0, price: 25000 },
  reefer:    { id: 'reefer', name: 'Frigorifique', empty: 8000, maxLoad: 22000, length: 13.6, axleDist: 9.5, sway: 0.95, brake: 0.95, steerPenalty: 1.0, price: 48000 },
  tanker:    { id: 'tanker', name: 'Citerne', empty: 7000, maxLoad: 26000, length: 12.0, axleDist: 8.4, sway: 1.25, brake: 0.85, steerPenalty: 0.95, price: 42000 },
  flatbed:   { id: 'flatbed', name: 'Plateau', empty: 5500, maxLoad: 25000, length: 13.6, axleDist: 9.5, sway: 1.05, brake: 1.0, steerPenalty: 1.0, price: 22000 },
  container: { id: 'container', name: 'Porte-conteneur', empty: 4500, maxLoad: 28000, length: 12.6, axleDist: 9.0, sway: 1.1, brake: 0.95, steerPenalty: 0.97, price: 30000 },
};

export const WHEELBASE = 3.8;
export const HITCH_OFFSET = -0.3; // sellette derrière l'essieu moteur

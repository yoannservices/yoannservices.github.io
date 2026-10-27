// Distances en m, masse en kg, puissance en kW, vitesse en m/s.
// wheelbase = empattement (essieu avant -> essieu arrière de l'unité motrice) ; frontOverhang = essieu avant -> pare-chocs.
// Le jeu accélère la consommation x10 pour que carburant et autonomie comptent en quelques minutes de jeu.
export const BUS_TYPES = {
  minibus: {
    id: 'minibus', kind: 'mini', name: 'Minibus', length: 7, width: 2.2, height: 2.7, wheelbase: 3.6, frontOverhang: 1.2,
    mass: 5500, power: 110, maxSpeed: 25, maxAccel: 2.0, brake: 8, turnRadius: 6.5, rollGain: 0.012,
    seats: 20, doors: 1, price: 0, level: 1, consumption: 14, color: '#2a7fd4',
  },
  standard: {
    id: 'standard', kind: 'std', name: 'Bus standard', length: 12, width: 2.55, height: 3.2, wheelbase: 5.9, frontOverhang: 2.7,
    mass: 14000, power: 210, maxSpeed: 22, maxAccel: 1.5, brake: 7, turnRadius: 10.5, rollGain: 0.010,
    seats: 80, doors: 2, price: 6000, level: 1, consumption: 38, color: '#f2b01e',
  },
  electric: {
    id: 'electric', kind: 'std', name: 'Bus électrique', length: 12, width: 2.55, height: 3.2, wheelbase: 5.9, frontOverhang: 2.7,
    mass: 15500, power: 180, maxSpeed: 20, maxAccel: 1.8, brake: 7, turnRadius: 10.5, rollGain: 0.010,
    seats: 75, doors: 2, price: 12000, level: 2, electric: true, range: 250, color: '#1fb6a5',
  },
  doubleDecker: {
    id: 'doubleDecker', kind: 'double', name: 'Double étage', length: 10.5, width: 2.55, height: 4.3, wheelbase: 5.6, frontOverhang: 2.5,
    mass: 16500, power: 190, maxSpeed: 20, maxAccel: 1.2, brake: 6.5, turnRadius: 10.5, rollGain: 0.032,
    seats: 85, doors: 2, price: 14000, level: 3, consumption: 45, color: '#d11a2a',
  },
  articulated: {
    id: 'articulated', kind: 'artic', name: 'Bus articulé', length: 18, width: 2.55, height: 3.2, wheelbase: 5.9, frontOverhang: 2.7,
    mass: 24000, power: 260, maxSpeed: 20, maxAccel: 1.1, brake: 6.5, turnRadius: 11.5, rollGain: 0.010,
    seats: 130, doors: 3, price: 18000, level: 4, consumption: 52, color: '#2e9b5a',
    // unité avant : de hingeZ+0.3 à l'avant ; soufflet 0.6 m ; unité arrière rearLen m, essieu à axleDist derrière la rotule
    artic: { frontLen: 9.3, hingeZ: -1.0, rearLen: 8.1, axleDist: 6.3 },
  },
};
export const BUS_ORDER = ['minibus', 'standard', 'electric', 'doubleDecker', 'articulated'];

// fraction de réservoir / batterie consommée par mètre
export const energyPerMeter = (s) => (s.electric ? 10 / (s.range * 1000) : ((s.consumption / 100000) * 10) / 200);

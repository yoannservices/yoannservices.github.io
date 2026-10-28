/* Biomes : ambiance (ciel, brouillard, lumière), couleurs du sol, surface de la piste, végétation. */
import { SURF } from '../core/config.js';

export const BIOMES = {
  forest: {
    name: 'Forêt', desc: 'Sous-bois, racines et feuillage dense.', surf: SURF.dirt,
    sky: ['#6fb1e8', '#cfe6d6'], fog: ['#b9d3c2', 0.0075], sun: ['#fff1d0', 1.7], hemi: ['#cfe9ff', '#3b5a2c', 0.9],
    trail: [0.52, 0.36, 0.22], ground: [[0.2, 0.42, 0.16], [0.3, 0.5, 0.2]], rock: [0.45, 0.44, 0.4],
    veg: [{ kind: 'pine', d: 0.09 }, { kind: 'oak', d: 0.07 }, { kind: 'bush', d: 0.1 }, { kind: 'rock', d: 0.025 }],
  },
  mountain: {
    name: 'Montagne', desc: 'Éboulis, pins et vue dégagée.', surf: SURF.dirt,
    sky: ['#4f8ed8', '#dfeaf5'], fog: ['#c8d6e6', 0.006], sun: ['#fff6e6', 1.9], hemi: ['#d6e6ff', '#6b6458', 0.95],
    trail: [0.55, 0.47, 0.38], ground: [[0.42, 0.44, 0.34], [0.5, 0.5, 0.46]], rock: [0.52, 0.52, 0.55],
    veg: [{ kind: 'pine', d: 0.05 }, { kind: 'rock', d: 0.07 }, { kind: 'bush', d: 0.04 }],
  },
  desert: {
    name: 'Désert', desc: 'Sable, canyons rouges et cactus.', surf: SURF.sand,
    sky: ['#4aa8f0', '#f6dfb4'], fog: ['#ecd3a3', 0.0085], sun: ['#fff0c4', 2.1], hemi: ['#ffe9c0', '#9c6a3a', 1],
    trail: [0.86, 0.68, 0.44], ground: [[0.82, 0.58, 0.34], [0.72, 0.42, 0.24]], rock: [0.7, 0.4, 0.25],
    veg: [{ kind: 'cactus', d: 0.04 }, { kind: 'rock', d: 0.06 }, { kind: 'dead', d: 0.015 }],
  },
  snow: {
    name: 'Neige', desc: 'Pente glacée, pins enneigés, peu d\'adhérence.', surf: SURF.snow,
    sky: ['#7aa6d6', '#eef4fa'], fog: ['#dfe8f2', 0.0095], sun: ['#fff', 1.6], hemi: ['#e6f0ff', '#8fa0b8', 1.05],
    trail: [0.86, 0.9, 0.95], ground: [[0.92, 0.95, 0.98], [0.8, 0.86, 0.94]], rock: [0.5, 0.56, 0.64],
    veg: [{ kind: 'snowpine', d: 0.08 }, { kind: 'rock', d: 0.04 }],
  },
  volcano: {
    name: 'Volcan', desc: 'Cendres, roches noires et fissures de lave.', surf: SURF.ash,
    sky: ['#2a1a22', '#c7552a'], fog: ['#4a2a24', 0.011], sun: ['#ff9a55', 1.25], hemi: ['#ff9966', '#2a1410', 0.8],
    trail: [0.24, 0.22, 0.22], ground: [[0.14, 0.13, 0.14], [0.22, 0.14, 0.1]], rock: [0.16, 0.14, 0.15],
    veg: [{ kind: 'dead', d: 0.045 }, { kind: 'lava', d: 0.06 }, { kind: 'rock', d: 0.05 }],
  },
};
export const BIOME_IDS = Object.keys(BIOMES);

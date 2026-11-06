/* Ville 2 : rue Pasteur, créneau le long du trottoir de droite entre deux voitures, circulation en sens inverse et piétons. */
import { build as street } from '../ville.js';

const E = [['sedan', -22], ['wagon', -12], ['hatchback', -3.5], ['sedan', 4.27], ['sport', 15.73], ['compact', 21.6], ['suv', 28], ['wagon', 35]];
export const build = (ctx) => street(ctx, {
  bays: false,
  eastCars: E.map(([type, z]) => ({ type, z })),
  npc: {
    cars: [
      { type: 'hatchback', path: [[-1.6, -95], [-1.6, 95]], speed: 5.5, start: 0.12, color: 0xc1272d },
      { type: 'wagon', path: [[-1.6, -95], [-1.6, 95]], speed: 4.5, start: 0.42, color: 0xf1f1ee },
      { type: 'sport', path: [[-1.6, -95], [-1.6, 95]], speed: 5, start: 0.72, color: 0x2d4f8a },
    ],
    peds: [
      { path: [[-8, 50], [-8, -50]], speed: 1.2, start: 0.2 }, { path: [[-12, 30], [-12, -30]], speed: 1.0, start: 0.6 },
      { path: [[12, 45], [12, -40]], speed: 1.1, start: 0.5 }, { path: [[13, 8], [13, -25]], speed: 1.3, start: 0.1 },
      { path: [[-7.2, 34], [7.2, 34]], speed: 1.2, start: 0.05 },
    ],
  },
});

// Snowboard : prise de carre progressive, grand rayon de courbe, dérapage (drift) possible
export const snowboard = {
  id: 'snowboard', label: 'Snowboard',
  turn: 2.0, turnDamp: 0.018, edgeRate: 4.5, grip: 5.5, drag: 0.0016,
  push: 1.5, pushMax: 4, spinRate: 7.5, flipRate: 6, jump: 5.2,
  snowGrip: [0.85, 1, 0.45], snowDrag: [1.35, 1, 0.9], brakeSkid: 0.55,
  grabs: ['Mute', 'Nose', 'Indy'], spinNames: ['Frontside', 'Backside'], jumpName: 'Ollie',
};

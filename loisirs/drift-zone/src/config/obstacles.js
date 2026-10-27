// Types d'obstacles. Dimensions de collision en px (plan), height/color pour le rendu 3D.
// movable = se déplace à l'impact (destructible).
const OBSTACLE_TYPES = {
  cone:    { shape: 'circle', r: 9,  movable: true, mass: 0.12, restitution: 0.4, comboBreak: false, height: 18, color: 0xe8363b },
  tire:    { shape: 'circle', r: 14, restitution: 0.5, height: 22, color: 0xe8363b },
  pillar:  { shape: 'circle', r: 22, restitution: 0.25, height: 90, color: 0xf5f2ec },
  barrier: { shape: 'box', w: 120, h: 14, restitution: 0.3, height: 28, color: 0xe8363b },
  wall:    { shape: 'box', w: 200, h: 30, restitution: 0.2, nearMiss: false, height: 40, color: 0xeee6d6 },
  block:   { shape: 'box', w: 400, h: 260, restitution: 0.2, height: 150, color: 0xf5f2ec },
  crate:   { shape: 'box', w: 36, h: 36, movable: true, mass: 0.6, restitution: 0.3, height: 34, color: 0xf5f2ec },
};

const CRASH = {
  minEvent: 40,        // vitesse d'impact (px/s) minimale pour émettre un événement
  tangentLoss: 0.12,   // part de la vitesse tangentielle perdue au contact
  yawKick: 0.0006,     // rotation (rad) ajoutée par px/s d'impact et px de bras de levier
  maxYawKick: 0.25,
  moveFriction: 500,   // freinage des objets déplacés (px/s²)
  moveSpin: 2.5,       // amortissement de leur rotation (1/s)
};

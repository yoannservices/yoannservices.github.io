/* Entrées : clavier (mêmes touches que Trottinette Freestyle, AZERTY par positions physiques) + manette.
   Z/S/Q/D = KeyW/KeyS/KeyA/KeyD. En l'air : Z frontflip, S backflip, Q/D rotations 180/360. */
const MAP = {
  KeyW: 'pedal', ArrowUp: 'pedal', KeyS: 'brakeR', ArrowDown: 'brakeR', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
  Space: 'jump', ShiftLeft: 'manual', ShiftRight: 'manual', KeyF: 'brakeF', KeyE: 'revert',
  KeyJ: 'whipL', KeyU: 'whipR', KeyK: 'bar', KeyI: 'barB', KeyL: 'grab', KeyT: 'nohand',
  KeyC: 'camera', KeyR: 'reset', KeyH: 'help', KeyB: 'book', KeyM: 'map', KeyP: 'pause', Escape: 'pause',
};
const down = new Set(), edge = new Set(), pad = new Set();
let padAxes = { x: 0, y: 0, rx: 0, ry: 0 }, padPrev = new Set();

addEventListener('keydown', (e) => {
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  const a = MAP[e.code]; if (!a) return;
  if (!e.repeat && !down.has(a)) edge.add(a);
  down.add(a);
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
});
addEventListener('keyup', (e) => { const a = MAP[e.code]; if (!a) return; const still = Object.keys(MAP).some((c) => c !== e.code && MAP[c] === a && heldCodes.has(c)); if (!still) down.delete(a); });
const heldCodes = new Set();
addEventListener('keydown', (e) => heldCodes.add(e.code));
addEventListener('keyup', (e) => heldCodes.delete(e.code));
addEventListener('blur', () => { down.clear(); heldCodes.clear(); });

// boutons de manette -> actions : A saut, B frein arrière, X grab, Y no-hander, LB/RB whips, LT frein avant, RT pédale, Start pause, Back carte
const PAD_BTN = { 0: 'jump', 1: 'brakeR', 2: 'grab', 3: 'nohand', 4: 'whipL', 5: 'whipR', 6: 'brakeF', 7: 'pedal', 8: 'map', 9: 'pause', 10: 'bar', 11: 'barB', 12: 'manual', 13: 'revert', 14: 'camera', 15: 'reset' };

export const Input = {
  update() {
    pad.clear();
    const gp = (navigator.getGamepads?.() ?? []).find(Boolean);
    if (!gp) { padAxes = { x: 0, y: 0, rx: 0, ry: 0 }; padPrev = new Set(); return; }
    const dz = (v) => (Math.abs(v) < 0.15 ? 0 : v);
    padAxes = { x: dz(gp.axes[0] || 0), y: dz(gp.axes[1] || 0), rx: dz(gp.axes[2] || 0), ry: dz(gp.axes[3] || 0) };
    gp.buttons.forEach((b, i) => { const a = PAD_BTN[i]; if (a && b.pressed) { pad.add(a); if (!padPrev.has(a)) edge.add(a); } });
    padPrev = new Set(pad);
  },
  down: (a) => down.has(a) || pad.has(a),
  /* appui unique depuis le dernier endFrame */
  pressed: (a) => edge.has(a),
  endFrame() { edge.clear(); },
  steer: () => (down.has('right') || pad.has('right') ? 1 : 0) - (down.has('left') || pad.has('left') ? 1 : 0) + padAxes.x,
  /* >0 frontflip, <0 backflip (Z / S en l'air, ou stick droit) */
  flip: () => (down.has('pedal') ? 1 : 0) - (down.has('brakeR') ? 1 : 0) - padAxes.ry,
  spin: () => (down.has('right') ? 1 : 0) - (down.has('left') ? 1 : 0) + padAxes.rx + padAxes.x,
  clear() { down.clear(); edge.clear(); },
};

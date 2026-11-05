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

// boutons de manette -> actions : A saut, B caméra, croix gauche frein arrière, X grab, Y no-hander, LB/RB whips, LT frein avant, RT pédale, Start pause, Back carte
const PAD_BTN = { 0: 'jump', 1: 'nohand', 2: 'reset', 3: 'camera', 4: 'revert', 5: 'manual', 6: 'brakeF', 7: 'pedal', 8: 'map', 9: 'pause', 12: 'grab', 13: ['grab', 'manual'] };

export const Input = {
  air: false, // posé par main.js : vrai quand le vélo est en l'air
  update() {
    pad.clear();
    const gp = (navigator.getGamepads?.() ?? []).find(Boolean);
    if (!gp) { padAxes = { x: 0, y: 0, rx: 0, ry: 0 }; padPrev = new Set(); return; }
    const dz = (v) => (Math.abs(v) < 0.15 ? 0 : v);
    padAxes = { x: dz(gp.axes[0] || 0), y: dz(gp.axes[1] || 0), rx: dz(gp.axes[2] || 0), ry: dz(gp.axes[3] || 0) };
    // en l'air : seuls les sticks comptent (gâchettes ignorées) ; stick gauche = rotations + flips, stick droit x = barre, y = whips
    gp.buttons.forEach((b, i) => { const v = PAD_BTN[i]; if (!v || !b.pressed || (Input.air && (i === 6 || i === 7))) return; for (const a of [].concat(v)) pad.add(a); });
    if (Input.air) {
      if (padAxes.rx > 0.5) pad.add('bar'); else if (padAxes.rx < -0.5) pad.add('barB');
      if (padAxes.ry < -0.5) pad.add('whipL'); else if (padAxes.ry > 0.5) pad.add('whipR');
    }
    for (const a of pad) if (!padPrev.has(a)) edge.add(a);
    padPrev = new Set(pad);
  },
  down: (a) => down.has(a) || pad.has(a),
  /* appui unique depuis le dernier endFrame */
  pressed: (a) => edge.has(a),
  endFrame() { edge.clear(); },
  steer: () => (down.has('right') || pad.has('right') ? 1 : 0) - (down.has('left') || pad.has('left') ? 1 : 0) + padAxes.x,
  /* >0 frontflip, <0 backflip (Z / S en l'air, ou stick droit) */
  flip: () => (down.has('pedal') ? 1 : 0) - (down.has('brakeR') ? 1 : 0) - (Input.air ? padAxes.y : 0),
  spin: () => (down.has('right') ? 1 : 0) - (down.has('left') ? 1 : 0) + (Input.air ? padAxes.x : 0),
  clear() { down.clear(); edge.clear(); },
};

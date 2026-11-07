// Clavier (par caractère : ZQSD sur AZERTY), souris (verrouillage du pointeur à pied) et manette.
// Les touches « une fois » sont consommées à chaque lecture. Braquage > 0 = vers la gauche (convention de la physique).
const down = new Set(), hit = new Set(), codes = new Set();
const PREVENT = new Set([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'tab']);
addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (!down.has(k)) { hit.add(k); codes.add(e.code); }
  down.add(k);
  if (PREVENT.has(k)) e.preventDefault();
});
addEventListener('keyup', (e) => down.delete(e.key.toLowerCase()));
addEventListener('blur', () => { down.clear(); mouse.l = mouse.r = false; });

const mouse = { dx: 0, dy: 0, l: false, r: false, rHit: false, locked: false };
export function bindMouse(el) {
  el.addEventListener('mousedown', (e) => {
    if (e.button === 0) mouse.l = true;
    if (e.button === 2) { mouse.r = true; mouse.rHit = true; }
  });
  addEventListener('mouseup', (e) => { if (e.button === 0) mouse.l = false; if (e.button === 2) mouse.r = false; });
  el.addEventListener('contextmenu', (e) => e.preventDefault());
  addEventListener('mousemove', (e) => {
    if (mouse.locked || mouse.drag) { mouse.dx += e.movementX || 0; mouse.dy += e.movementY || 0; }
  });
  // sans verrouillage (aperçu, mobile) : clic droit maintenu + glisser pour regarder
  el.addEventListener('pointerdown', (e) => { if (e.button === 1) mouse.drag = true; });
  addEventListener('pointerup', () => { mouse.drag = false; });
  document.addEventListener('pointerlockchange', () => { mouse.locked = document.pointerLockElement === el; });
}
export const pointer = mouse;

let padPrev = [];
const dead = (v) => (Math.abs(v) < 0.14 ? 0 : v);

export function readInput() {
  const pad = (navigator.getGamepads?.() ?? []).find(Boolean);
  const pb = (i) => !!pad?.buttons[i]?.pressed;
  const padHit = (i) => pb(i) && !padPrev[i];
  const key = (...ks) => ks.some((k) => down.has(k));
  const once = (...ks) => ks.some((k) => hit.has(k));
  const ax = (i) => dead(pad?.axes[i] ?? 0);

  const out = {
    // conduite
    throttle: Math.max(key('z', 'arrowup') ? 1 : 0, pad?.buttons[7]?.value ?? 0),
    brake: Math.max(key('s', 'arrowdown') ? 1 : 0, pad?.buttons[6]?.value ?? 0),
    steer: (key('q', 'arrowleft') ? 1 : 0) - (key('d', 'arrowright') ? 1 : 0) || -ax(0),
    handbrake: key(' ') || pb(0),
    horn: key('h'),
    siren: once('g') || padHit(4),
    toggleView: once('c') || padHit(3),
    reset: once('r'),
    // à pied
    fwd: (key('z', 'arrowup') ? 1 : 0) - (key('s', 'arrowdown') ? 1 : 0) || -ax(1),
    strafe: (key('d') ? 1 : 0) - (key('q') ? 1 : 0) || ax(0),
    turn: (key('arrowright') ? 1 : 0) - (key('arrowleft') ? 1 : 0),
    lookX: mouse.dx + ax(2) * 14, lookY: mouse.dy + ax(3) * 10,
    run: key('shift') || pb(10),
    extend: (key('e') ? 1 : 0) - (key('a') ? 1 : 0) || (pad?.buttons[7]?.value ?? 0) - (pad?.buttons[6]?.value ?? 0),
    crouch: once('x') || padHit(11),
    spray: mouse.l || key('enter') || (pad?.buttons[7]?.value ?? 0) > 0.3,
    mode: mouse.rHit || once('v') || padHit(1),
    // communs
    interact: once('f') || padHit(2),
    interactHeld: key('f') || pb(2),
    order: [1, 2, 3, 4].find((n) => codes.has(`Digit${n}`) || codes.has(`Numpad${n}`)) ?? (padHit(14) ? 1 : padHit(15) ? 2 : padHit(12) ? 3 : padHit(13) ? 4 : 0),
    help: once('i'),
    map: once('m') || padHit(8),
    menu: once('tab', 'escape') || padHit(9),
  };
  mouse.dx = mouse.dy = 0; mouse.rHit = false;
  padPrev = pad ? pad.buttons.map((b) => b.pressed) : [];
  hit.clear(); codes.clear();
  return out;
}

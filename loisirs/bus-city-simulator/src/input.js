// Clavier (par caractère : ZQSD marche sur AZERTY) + manette. Les touches "une fois" sont consommées à chaque lecture.
// Braquage : > 0 = vers la gauche (convention de la physique).
const down = new Set(), hit = new Set();
const PREVENT = new Set([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'tab']);
addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (!down.has(k)) hit.add(k);
  down.add(k);
  if (PREVENT.has(k)) e.preventDefault();
});
addEventListener('keyup', (e) => down.delete(e.key.toLowerCase()));
addEventListener('blur', () => down.clear());

let padPrev = [];
const dead = (v) => (Math.abs(v) < 0.12 ? 0 : v);

export function readInput() {
  const pad = (navigator.getGamepads?.() ?? []).find(Boolean);
  const pb = (i) => !!pad?.buttons[i]?.pressed;
  const padHit = (i) => pb(i) && !padPrev[i];
  const key = (...ks) => ks.some((k) => down.has(k));
  const once = (...ks) => ks.some((k) => hit.has(k));

  const out = {
    throttle: Math.max(key('z', 'arrowup') ? 1 : 0, pad?.buttons[7]?.value ?? 0),
    brake: Math.max(key('s', 'arrowdown') ? 1 : 0, pad?.buttons[6]?.value ?? 0),
    steer: (key('q', 'arrowleft') ? 1 : 0) - (key('d', 'arrowright') ? 1 : 0) || -dead(pad?.axes[0] ?? 0),
    handbrake: key(' ') || pb(0),
    horn: key('h') || pb(1),
    toggleView: once('v') || padHit(3),
    toggleLights: once('l') || padHit(2),
    toggleHelp: once('i'),
    indicatorLeft: once('a') || padHit(4),
    indicatorRight: once('e') || padHit(5),
    doors: once('o') || padHit(14),
    ramp: once('r') || padHit(15),
    skip: once('n'),
    map: once('m') || padHit(12),
    menu: once('tab', 'escape') || padHit(9),
  };
  padPrev = pad ? pad.buttons.map((b) => b.pressed) : [];
  hit.clear();
  return out;
}

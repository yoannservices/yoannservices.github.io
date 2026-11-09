// Entrées : clavier par caractère (ZQSD sur AZERTY, comme les autres jeux), manette Xbox native, tactile.
// Les touches « une fois » (hit) sont consommées à chaque lecture. steer > 0 = vers la gauche. Axes d'outils : t1..t4 (selon l'engin).
const down = new Set(), hit = new Set(), codes = new Set();
const PREVENT = new Set([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'tab']);
const touch = new Set();
addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (!down.has(k)) { hit.add(k); codes.add(e.code); }
  down.add(k);
  if (PREVENT.has(k)) e.preventDefault();
});
addEventListener('keyup', (e) => down.delete(e.key.toLowerCase()));
addEventListener('blur', () => { down.clear(); touch.clear(); });

export const press = (k, on = true) => { if (on) { if (!touch.has(k)) hit.add(k); touch.add(k); } else touch.delete(k); };
let padPrev = [];
const dead = (v) => (Math.abs(v) < 0.16 ? 0 : v);

export function readInput(id) {
  const pad = (navigator.getGamepads?.() ?? []).find(Boolean);
  const pb = (i) => !!pad?.buttons[i]?.pressed, padHit = (i) => pb(i) && !padPrev[i];
  const key = (...ks) => ks.some((k) => down.has(k) || touch.has(k)), once = (...ks) => ks.some((k) => hit.has(k));
  const ax = (i) => dead(pad?.axes[i] ?? 0), rt = pad?.buttons[7]?.value ?? 0, lt = pad?.buttons[6]?.value ?? 0;
  const k = (p, n) => (key(p) ? 1 : 0) - (key(n) ? 1 : 0);
  const exc = id === 'excavator';
  // conduite : ZQSD ; sur la pelle les flèches commandent le bras (←→ rotation, ↑↓ balancier), sur les autres elles conduisent aussi
  const drive = (key('z') || (!exc && key('arrowup')) ? 1 : 0) - (key('s') || (!exc && key('arrowdown')) ? 1 : 0);
  const steer = (key('q') || (!exc && key('arrowleft')) ? 1 : 0) - (key('d') || (!exc && key('arrowright')) ? 1 : 0);
  const out = {
    drive: drive || rt - lt, steer: steer || -ax(0), brake: 0, hand: key(' ') || pb(0),
    t1: 0, t2: 0, t3: 0, t4: 0,
    horn: key('h') || pb(10), lights: once('l') || padHit(13), beacon: once('g') || padHit(12), view: once('c') || padHit(3), reset: once('r'),
    interact: once('f') || padHit(2), next: once('n') || padHit(1), map: once('m') || padHit(8), menu: once('tab', 'escape') || padHit(9), help: once('i'),
    camX: ax(2), switch: [1, 2, 3, 4, 5].find((n) => codes.has(`Digit${n}`) || codes.has(`Numpad${n}`)) ?? (padHit(15) ? 99 : padHit(14) ? -99 : 0),
  };
  const axL = -ax(3);   // stick droit vertical : haut = positif
  const rbLb = (pb(5) ? 1 : 0) - (pb(4) ? 1 : 0);
  if (id === 'loader') { out.t1 = k('e', 'a') || axL; out.t2 = k('x', 'v') || rbLb; }
  else if (exc) { out.t1 = k('arrowleft', 'arrowright') || -ax(2); out.t2 = k('e', 'a') || (pb(1) ? 1 : 0) - (pb(0) ? 1 : 0); out.t3 = k('arrowup', 'arrowdown') || axL; out.t4 = k('x', 'v') || rbLb; out.hand = key(' '); }
  else out.t1 = k('e', 'a') || axL;
  if (exc) out.camX = 0;
  padPrev = pad ? pad.buttons.map((b) => b.pressed) : [];
  hit.clear(); codes.clear();
  return out;
}

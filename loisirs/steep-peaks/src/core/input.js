const keys = new Set(), hit = new Set();
const PAD_KEYS = { 0: 'space', 1: 'e', 2: 'f', 3: 'g', 4: 'prevdisc', 5: 'nextdisc', 8: 'm', 9: 'escape', 10: 'v', 12: 't', 13: 'b' };
const norm = (e) => {
  if (e.code.startsWith('Digit')) return e.code.slice(5);
  if (/^Numpad\d$/.test(e.code)) return e.code.slice(6);
  if (e.code === 'Space') return 'space';
  return e.key.toLowerCase();
};
addEventListener('keydown', (e) => {
  const k = norm(e);
  if (['space', 'tab', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
  if (!keys.has(k)) hit.add(k);
  keys.add(k);
});
addEventListener('keyup', (e) => keys.delete(norm(e)));
addEventListener('blur', () => keys.clear());

const any = (...ks) => ks.some((k) => keys.has(k));
const padDown = {};
let prevJump = false;
export const inp = { x: 0, y: 0, jump: false, jumpUp: false, grab: 0, drift: false, brake: false, tuck: false, pad: false };
export const pressed = (k) => hit.has(k);
export const held = (k) => keys.has(k);

export function poll() {
  let x = (any('d', 'arrowright') ? 1 : 0) - (any('q', 'a', 'arrowleft') ? 1 : 0);
  let y = (any('z', 'w', 'arrowup') ? 1 : 0) - (any('s', 'arrowdown') ? 1 : 0);
  let padBrake = 0;
  const gp = (navigator.getGamepads && [...navigator.getGamepads()].find(Boolean)) || null;
  inp.pad = !!gp;
  if (gp) {
    const dz = (v) => (Math.abs(v) < 0.15 ? 0 : v);
    x += dz(gp.axes[0]) + dz(gp.axes[2] || 0);
    y += -dz(gp.axes[1]) - dz(gp.axes[3] || 0);
    padBrake = gp.buttons[6]?.value || 0;
    gp.buttons.forEach((b, i) => {
      const name = PAD_KEYS[i];
      if (!name) return;
      if (b.pressed && !padDown[i]) hit.add(name);
      if (b.pressed) keys.add(name); else if (padDown[i]) keys.delete(name);
      padDown[i] = b.pressed;
    });
    if (gp.buttons[7]?.value > 0.4) y = Math.max(y, 0.6);
  }
  inp.x = Math.max(-1, Math.min(1, x));
  inp.y = Math.max(-1, Math.min(1, y));
  inp.jump = keys.has('space');
  inp.jumpUp = prevJump && !inp.jump;
  prevJump = inp.jump;
  inp.grab = keys.has('e') ? 1 : keys.has('f') ? 2 : keys.has('g') ? 3 : 0;
  inp.drift = keys.has('shift');
  inp.brake = inp.y < -0.35 || padBrake > 0.4;
  inp.tuck = inp.y > 0.35;
}
export const endFrame = () => hit.clear();

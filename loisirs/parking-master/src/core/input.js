/* Clavier (event.code : KeyW = Z et KeyA = Q sur AZERTY) et manette. `poll()` met à jour `inp` ; `pressed(code)` vaut une fois par appui. */
const down = new Set(), hit = new Set();

addEventListener('keydown', (e) => {
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
  if (!e.repeat) hit.add(e.code);
  down.add(e.code);
});
addEventListener('keyup', (e) => down.delete(e.code));
addEventListener('blur', () => down.clear());

const any = (...c) => c.some((k) => down.has(k));
export const inp = { throttle: 0, brake: 0, steer: 0, hand: false, pad: false };
export const pressed = (c) => hit.has(c);
export const endFrame = () => hit.clear();

export function poll() {
  let steer = (any('KeyA', 'ArrowLeft') ? 1 : 0) - (any('KeyD', 'ArrowRight') ? 1 : 0);
  let throttle = any('KeyW', 'ArrowUp') ? 1 : 0, brake = any('KeyS', 'ArrowDown') ? 1 : 0, hand = down.has('Space');
  const gp = (navigator.getGamepads && [...navigator.getGamepads()].find(Boolean)) || null;
  inp.pad = !!gp;
  if (gp) {
    const dz = (v) => (Math.abs(v) < 0.12 ? 0 : v);
    steer -= dz(gp.axes[0] || 0);
    throttle = Math.max(throttle, gp.buttons[7]?.value || 0);
    brake = Math.max(brake, gp.buttons[6]?.value || 0);
    hand = hand || !!gp.buttons[0]?.pressed;
    const map = { 2: 'KeyR', 3: 'KeyC', 9: 'Escape' };
    gp.buttons.forEach((b, i) => { if (map[i] && b.pressed && !gp._h?.[i]) hit.add(map[i]); (gp._h = gp._h || {})[i] = b.pressed; });
  }
  inp.steer = Math.max(-1, Math.min(1, steer));
  inp.throttle = throttle; inp.brake = brake; inp.hand = hand;
}

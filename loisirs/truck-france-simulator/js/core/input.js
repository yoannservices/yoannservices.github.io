// Clavier (ZQSD/flèches/WASD) + manette/volant via Gamepad API
const keys = new Set();
const once = new Set();
addEventListener('keydown', (e) => {
  if (!keys.has(e.code)) once.add(e.code);
  keys.add(e.code);
  if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
});
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('blur', () => keys.clear());

const dz = (v) => (Math.abs(v) < 0.12 ? 0 : v);

export function readInput() {
  const k = (...c) => c.some((x) => keys.has(x));
  let throttle = k('KeyW', 'ArrowUp') ? 1 : 0; // KeyW = Z en AZERTY
  let brake = k('KeyS', 'ArrowDown') ? 1 : 0;
  let steer = (k('KeyA', 'ArrowLeft') ? 1 : 0) - (k('KeyD', 'ArrowRight') ? 1 : 0); // + = gauche
  let handbrake = k('Space');
  const gp = (navigator.getGamepads?.() || []).find(Boolean);
  if (gp) {
    steer = steer || -dz(gp.axes[0] || 0);
    throttle = Math.max(throttle, gp.buttons[7]?.value || 0);
    brake = Math.max(brake, gp.buttons[6]?.value || 0);
    handbrake = handbrake || !!gp.buttons[0]?.pressed;
  }
  return { throttle, brake, steer, handbrake };
}

/** Vrai une seule fois par appui. */
export const pressed = (code) => once.delete(code);

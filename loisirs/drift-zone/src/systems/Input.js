const DEADZONE = 0.15;
const PREVENT = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

/**
 * Clavier + manette. Les codes sont physiques : W/A/S/D correspondent à Z/Q/S/D sur AZERTY.
 * read() -> { throttle, brake, steer, handbrake, restart, toggleDebug, any }
 */
class Input {
  constructor() {
    this.down = new Set();
    this.pressed = new Set();
    this.padRestartWas = false;
    addEventListener('keydown', (e) => {
      if (PREVENT.has(e.code)) e.preventDefault();
      if (!e.repeat) this.pressed.add(e.code);
      this.down.add(e.code);
    });
    addEventListener('keyup', (e) => this.down.delete(e.code));
    addEventListener('blur', () => this.down.clear());
  }

  read() {
    const d = (...codes) => codes.some((c) => this.down.has(c));
    let throttle = d('ArrowUp', 'KeyW') ? 1 : 0;
    let brake = d('ArrowDown', 'KeyS') ? 1 : 0;
    let steer = (d('ArrowRight', 'KeyD') ? 1 : 0) - (d('ArrowLeft', 'KeyA') ? 1 : 0);
    let handbrake = d('Space');
    let restart = this.pressed.has('KeyR');
    const toggleDebug = this.pressed.has('KeyG');
    const anyKey = this.pressed.size > 0;
    this.pressed.clear();

    const pad = Array.from(navigator.getGamepads?.() ?? []).find((p) => p && p.connected);
    let padActive = false;
    if (pad) {
      const ax = pad.axes[0] ?? 0;
      if (Math.abs(ax) > DEADZONE) steer = ax;
      throttle = Math.max(throttle, pad.buttons[7]?.value ?? 0);
      brake = Math.max(brake, pad.buttons[6]?.value ?? 0);
      handbrake = handbrake || !!(pad.buttons[0]?.pressed || pad.buttons[5]?.pressed);
      const start = !!pad.buttons[9]?.pressed;
      restart = restart || (start && !this.padRestartWas);
      this.padRestartWas = start;
      padActive = Math.abs(ax) > DEADZONE || throttle > 0 || brake > 0 || handbrake || start;
    }
    return { throttle, brake, steer, handbrake, restart, toggleDebug, any: anyKey || padActive };
  }
}

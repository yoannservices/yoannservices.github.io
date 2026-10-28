/* Entrées : clavier AZERTY (event.code : Z/Q/S/D = KeyW/KeyA/KeyS/KeyD), flèches, manette et volant (API Gamepad). */
const MAP = {
  KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
  Space: 'hand', KeyC: 'view', KeyR: 'restart', KeyT: 'rescue', KeyL: 'lights', KeyM: 'map', KeyH: 'help', KeyV: 'voice',
  Escape: 'pause', Tab: 'pause', KeyP: 'pause', Enter: 'ok',
};
const down = new Set(), edge = new Set(), held = new Set();
let pad = { steer: 0, throttle: 0, brake: 0, hand: false, on: false, id: '' };
const padBtn = new Set(); let padPrev = new Set();
let rest = null; // position de repos des pédales d'un volant (axes), relevée au premier relevé

addEventListener('keydown', (e) => {
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  const a = MAP[e.code]; if (!a) return;
  if (!e.repeat && !held.has(e.code)) edge.add(a);
  held.add(e.code); down.add(a);
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
});
addEventListener('keyup', (e) => {
  held.delete(e.code); const a = MAP[e.code]; if (!a) return;
  if (!Object.keys(MAP).some((c) => MAP[c] === a && held.has(c))) down.delete(a);
});
addEventListener('blur', () => { down.clear(); held.clear(); });

// boutons de manette -> actions : A frein à main, Y vue, X relance, B remise en piste, Start pause, Back carte, LB phares
const PAD_BTN = { 0: 'hand', 1: 'rescue', 2: 'restart', 3: 'view', 4: 'lights', 8: 'map', 9: 'pause', 5: 'voice' };
const dz = (v, d = 0.08) => (Math.abs(v) < d ? 0 : (v - Math.sign(v) * d) / (1 - d));

export const Input = {
  steerKeys: 0,
  /* à appeler une fois par image : relève la manette ou le volant */
  poll() {
    padBtn.clear();
    const gp = (navigator.getGamepads?.() ?? []).find(Boolean);
    if (!gp) { pad.on = false; padPrev = new Set(); rest = null; return; }
    pad.on = true; pad.id = gp.id;
    const wheel = /wheel|volant|g29|g920|g27|t300|t150|momo|driving|racing/i.test(gp.id) || (gp.axes.length >= 4 && gp.buttons.length >= 12 && !/xbox|dualshock|dualsense|standard/i.test(gp.id) && gp.mapping !== 'standard');
    if (wheel) {
      // volant : axe 0 = direction ; pédales sur des axes qui reposent à +1 (appuyé = −1), relevé au premier passage
      if (!rest) rest = gp.axes.map((v) => v);
      const pedal = (i) => { const r = rest[i] ?? 1, v = gp.axes[i] ?? r; return Math.abs(r) < 0.5 ? 0 : Math.max(0, Math.min(1, (r - v) / (Math.abs(r) + 1))); };
      pad.steer = dz(gp.axes[0] || 0, 0.02);
      pad.throttle = Math.max(pedal(2), gp.buttons[7]?.value || 0);
      pad.brake = Math.max(pedal(3), pedal(5), gp.buttons[6]?.value || 0);
    } else {
      pad.steer = dz(gp.axes[0] || 0, 0.12);
      pad.throttle = gp.buttons[7]?.value || 0;
      pad.brake = gp.buttons[6]?.value || 0;
    }
    pad.hand = !!gp.buttons[0]?.pressed;
    const dpadL = gp.buttons[14]?.pressed, dpadR = gp.buttons[15]?.pressed;
    if (dpadL) pad.steer = -1; if (dpadR) pad.steer = 1;
    gp.buttons.forEach((b, i) => { const a = PAD_BTN[i]; if (a && b.pressed) { padBtn.add(a); if (!padPrev.has(a)) edge.add(a); } });
    padPrev = new Set(padBtn);
  },
  down: (a) => down.has(a) || padBtn.has(a),
  pressed: (a) => edge.has(a),
  endFrame() { edge.clear(); },
  /* commandes de conduite normalisées : steer −1 (gauche) .. +1 (droite) */
  drive(dt) {
    const k = (down.has('right') ? 1 : 0) - (down.has('left') ? 1 : 0);
    // lissage clavier : montée progressive, retour plus vif
    const rate = k === 0 || Math.sign(k) !== Math.sign(Input.steerKeys) ? 9 : 5;
    Input.steerKeys += Math.sign(k - Input.steerKeys) * Math.min(Math.abs(k - Input.steerKeys), rate * dt);
    const steer = Math.abs(pad.steer) > 0.001 ? pad.steer : Input.steerKeys;
    return {
      steer,
      throttle: Math.max(down.has('up') ? 1 : 0, pad.throttle),
      brake: Math.max(down.has('down') ? 1 : 0, pad.brake),
      hand: down.has('hand') || pad.hand,
    };
  },
  pad: () => pad,
};

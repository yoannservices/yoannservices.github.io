'use strict';
/* Réglages persistants + préréglages (drones, rates, manettes) */

const QUADS = {
  five: {
    name: '5" Freestyle', spec: '680 g · 6S · TWR 9', mass: 0.68, twr: 9, cells: 6, mah: 1300, imax: 120,
    motorTau: 0.022, rateTau: 0.028, angAcc: 230, yawAcc: 70, vPitch: 72,
    cd: [0.0085, 0.032, 0.008], hLin: 0.11, radius: 0.13, size: 1, crash: 8.5,
    tone: [95, 560], prop: 0.127,
  },
  cine: {
    name: '3" Cinewhoop', spec: '380 g · 4S · conduits', mass: 0.38, twr: 4.6, cells: 4, mah: 850, imax: 48,
    motorTau: 0.03, rateTau: 0.045, angAcc: 120, yawAcc: 40, vPitch: 34,
    cd: [0.013, 0.03, 0.012], hLin: 0.12, radius: 0.1, size: 0.62, crash: 6,
    tone: [150, 820], prop: 0.076, ducts: true,
  },
  lr: {
    name: '7" Long Range', spec: '950 g · 6S · TWR 5.5', mass: 0.95, twr: 5.5, cells: 6, mah: 4000, imax: 85,
    motorTau: 0.035, rateTau: 0.04, angAcc: 140, yawAcc: 35, vPitch: 58,
    cd: [0.011, 0.04, 0.010], hLin: 0.14, radius: 0.18, size: 1.35, crash: 9,
    tone: [70, 380], prop: 0.178,
  },
  whoop: {
    name: 'Tiny Whoop 65 mm', spec: '30 g · 1S · intérieur', mass: 0.032, twr: 3.4, cells: 1, mah: 450, imax: 9,
    motorTau: 0.045, rateTau: 0.05, angAcc: 90, yawAcc: 30, vPitch: 15,
    cd: [0.0012, 0.0022, 0.0012], hLin: 0.012, radius: 0.04, size: 0.3, crash: 99,
    tone: [380, 1500], prop: 0.031, ducts: true,
  },
};

const RATE_PRESETS = {
  bf:   { roll: { rc: 1.0, sr: 0.7, ex: 0 },    pitch: { rc: 1.0, sr: 0.7, ex: 0 },    yaw: { rc: 1.0, sr: 0.7, ex: 0 } },
  free: { roll: { rc: 1.1, sr: 0.74, ex: 0.15 }, pitch: { rc: 1.1, sr: 0.74, ex: 0.15 }, yaw: { rc: 1.0, sr: 0.62, ex: 0.1 } },
  race: { roll: { rc: 2.2, sr: 0.37, ex: 0 },   pitch: { rc: 2.2, sr: 0.37, ex: 0 },   yaw: { rc: 2.0, sr: 0.3, ex: 0 } },
  cine: { roll: { rc: 0.8, sr: 0.5, ex: 0.3 },  pitch: { rc: 0.8, sr: 0.5, ex: 0.3 },  yaw: { rc: 0.8, sr: 0.4, ex: 0.3 } },
};

const PAD_PRESETS = {
  // EdgeTX/OpenTX en joystick USB : voie 1 roulis (X), 2 tangage (Y), 3 gaz (Z), 4 lacet (rX), 5 = interrupteur
  radio: {
    thr: { axis: 2, inv: false }, yaw: { axis: 3, inv: false }, pitch: { axis: 1, inv: false }, roll: { axis: 0, inv: false },
    arm: { kind: 'axis', idx: 4, inv: false }, reset: { kind: 'button', idx: -1, inv: false },
  },
  // Manette standard : stick gauche gaz/lacet (gaz centré = 50 %), stick droit tangage/roulis
  xbox: {
    thr: { axis: 1, inv: true }, yaw: { axis: 0, inv: false }, pitch: { axis: 3, inv: true }, roll: { axis: 2, inv: false },
    arm: { kind: 'button', idx: 0, inv: false }, reset: { kind: 'button', idx: 3, inv: false },
  },
};

const Settings = (() => {
  const KEY = 'fpvsim:settings';
  const clone = o => JSON.parse(JSON.stringify(o));
  const DEFAULTS = {
    mode: 'free', quad: 'five', flightMode: 'acro',
    padPreset: 'radio', map: clone(PAD_PRESETS.radio), cal: {}, deadband: 0.02, kbSens: 0.55, touch: 'auto',
    ratePreset: 'bf', rates: clone(RATE_PRESETS.bf), thrExpo: 0, thrLimit: 1, angleMax: 55,
    uptilt: 25, fov: 118, crash: 'real', battery: 'real', wind: 2.5, propwash: 1, vib: 1, airmode: 1,
    video: 'analog', distort: 0.3, signalLoss: 1, shadows: 1, scale: 1, osd: 1, volume: 0.6,
  };
  let s = clone(DEFAULTS);
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && typeof saved === 'object') s = Object.assign(s, saved);
  } catch (e) { /* stockage indisponible */ }
  if (!QUADS[s.quad]) s.quad = 'five';
  return {
    get: () => s,
    save() { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* ignore */ } },
    clone,
  };
})();

/* Courbe de rates Betaflight : stick [-1,1] → °/s */
function bfRate(stick, r) {
  const a = Math.abs(stick);
  let rc = stick;
  if (r.ex) rc = stick * a * a * a * r.ex + stick * (1 - r.ex);
  let rcRate = r.rc;
  if (rcRate > 2) rcRate += 14.54 * (rcRate - 2);
  let rate = 200 * rcRate * rc;
  if (r.sr) rate *= 1 / Math.min(1, Math.max(0.01, 1 - Math.abs(rc) * r.sr));
  return Math.max(-1998, Math.min(1998, rate));
}

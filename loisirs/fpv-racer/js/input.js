'use strict';
/* Entrées : radiocommande / manette (Gamepad API), clavier, sticks tactiles.
   Sortie normalisée : thr 0..1, yaw/pitch/roll -1..1 (droite / avant = positif). */

const Input = (() => {
  const keys = Object.create(null);
  const pressed = [];               // touches appuyées cette frame (actions)
  const kb = { thr: 0, yaw: 0, pitch: 0, roll: 0 };
  const touch = { thr: 0, yaw: 0, pitch: 0, roll: 0, active: false };
  const out = { thr: 0, yaw: 0, pitch: 0, roll: 0, src: 'kb', armLevel: null, armToggle: false, reset: false };
  let lastPadButtons = [];
  let learning = null;              // { ch, base:[], baseBtn:[], until, cb }
  let calibrating = null;           // { axis: {i: [min,max]} }
  let padName = '';
  let padRef = null;               // position des gaz manette quand le clavier a pris la main

  addEventListener('keydown', e => {
    if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    if (!keys[e.code]) pressed.push(e.code);
    keys[e.code] = true;
    if (/^(Arrow|Space)/.test(e.code)) e.preventDefault();
  });
  addEventListener('keyup', e => { keys[e.code] = false; });
  addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

  function getPad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) if (p && p.connected) return p;
    return null;
  }

  function rawAxis(pad, i) {
    if (!pad || i < 0 || i >= pad.axes.length) return 0;
    let v = pad.axes[i];
    const c = Settings.get().cal[i];
    if (c && c[1] - c[0] > 0.2) v = ((v - c[0]) / (c[1] - c[0])) * 2 - 1;
    return Math.max(-1, Math.min(1, v));
  }

  function chan(pad, m) {
    let v = rawAxis(pad, m.axis);
    if (m.inv) v = -v;
    return v;
  }

  function dead(v, d) {
    const a = Math.abs(v);
    return a < d ? 0 : Math.sign(v) * (a - d) / (1 - d);
  }

  function ramp(cur, target, rate, dt) {
    const d = target - cur, m = rate * dt;
    return cur + Math.max(-m, Math.min(m, d));
  }

  function poll(dt) {
    const S = Settings.get();
    const pad = getPad();
    padName = pad ? pad.id : '';
    out.armToggle = false; out.reset = false;

    // ── Clavier (codes physiques : W = Z en AZERTY) ──
    const k = c => keys[c] ? 1 : 0;
    kb.thr = Math.max(0, Math.min(1, kb.thr + (k('KeyW') - k('KeyS')) * 0.7 * dt));
    if (keys['ShiftLeft'] && keys['KeyS']) kb.thr = 0;
    const ks = S.kbSens;
    kb.yaw = ramp(kb.yaw, (k('KeyD') - k('KeyA')) * ks, 5, dt);
    kb.pitch = ramp(kb.pitch, (k('ArrowUp') - k('ArrowDown')) * ks, 5, dt);
    kb.roll = ramp(kb.roll, (k('ArrowRight') - k('ArrowLeft')) * ks, 5, dt);
    const kbActive = keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD'] || keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight'];

    // ── Calibrage / apprentissage ──
    if (pad && calibrating) {
      pad.axes.forEach((v, i) => {
        const c = calibrating[i] || (calibrating[i] = [v, v]);
        c[0] = Math.min(c[0], v); c[1] = Math.max(c[1], v);
      });
    }
    if (pad && learning) doLearn(pad);

    // ── Manette ──
    let pv = null;
    if (pad && !learning) {
      const m = S.map, db = S.deadband;
      let thr = (chan(pad, m.thr) + 1) / 2;
      thr = Math.max(0, Math.min(1, (thr - db / 2) / (1 - db)));
      pv = { thr, yaw: dead(chan(pad, m.yaw), db), pitch: dead(chan(pad, m.pitch), db), roll: dead(chan(pad, m.roll), db) };
      if (out.src !== 'pad' && (Math.abs(pv.yaw) + Math.abs(pv.pitch) + Math.abs(pv.roll) > 0.3 || (padRef !== null && Math.abs(thr - padRef) > 0.08))) out.src = 'pad';
      if (padRef === null) padRef = thr;
      // Armement
      const a = m.arm;
      if (a.kind === 'axis' && a.idx >= 0 && a.idx < pad.axes.length) {
        let v = pad.axes[a.idx]; if (a.inv) v = -v;
        out.armLevel = v > 0.3;
      } else {
        out.armLevel = null;
        const b = a.idx >= 0 && pad.buttons[a.idx];
        if (b && b.pressed && !lastPadButtons[a.idx]) out.armToggle = true;
      }
      const r = m.reset;
      if (r && r.kind === 'button' && r.idx >= 0) {
        const b = pad.buttons[r.idx];
        if (b && b.pressed && !lastPadButtons[r.idx]) out.reset = true;
      } else if (r && r.kind === 'axis' && r.idx >= 0) {
        let v = pad.axes[r.idx] || 0; if (r.inv) v = -v;
        if (v > 0.5 && !lastPadButtons['a' + r.idx]) out.reset = true;
        lastPadButtons['a' + r.idx] = v > 0.5;
      }
      pad.buttons.forEach((b, i) => { lastPadButtons[i] = b.pressed; });
    } else {
      out.armLevel = null;
      padRef = null;
      if (out.src === 'pad') out.src = 'kb';
    }

    if (touch.active) out.src = 'touch';
    else if (kbActive) { out.src = 'kb'; padRef = pv ? pv.thr : null; }
    const v = out.src === 'touch' ? touch : out.src === 'pad' && pv ? pv : kb;
    out.thr = v.thr; out.yaw = v.yaw; out.pitch = v.pitch; out.roll = v.roll;

    // Courbe des gaz (expo + limite)
    const te = S.thrExpo;
    let t = out.thr;
    t = t * (1 - te) + t * t * t * te;
    out.thrCmd = t * S.thrLimit;
    return out;
  }

  // Remet le gaz clavier à zéro (reset)
  function zeroKb() { kb.thr = 0; touch.thr = 0; }

  function takeKeys() { return pressed.splice(0, pressed.length); }

  /* Apprentissage : on mémorise l'état de repos puis on prend l'axe qui bouge le plus */
  function learn(ch, cb) {
    const pad = getPad();
    if (!pad) { cb(false, 'Aucune manette détectée'); return; }
    learning = { ch, base: pad.axes.slice(), baseBtn: pad.buttons.map(b => b.pressed), until: performance.now() + 6000, cb };
  }
  function doLearn(pad) {
    const L = learning, S = Settings.get();
    if (performance.now() > L.until) { learning = null; L.cb(false, 'Rien détecté'); return; }
    if (L.ch === 'arm' || L.ch === 'reset') {
      for (let i = 0; i < pad.buttons.length; i++) {
        if (pad.buttons[i].pressed && !L.baseBtn[i]) {
          S.map[L.ch] = { kind: 'button', idx: i, inv: false };
          learning = null; L.cb(true, 'Bouton ' + i); return;
        }
      }
    }
    let best = -1, bd = 0;
    pad.axes.forEach((v, i) => { const d = v - L.base[i]; if (Math.abs(d) > Math.abs(bd)) { bd = d; best = i; } });
    if (best >= 0 && Math.abs(bd) > 0.6) {
      if (L.ch === 'arm' || L.ch === 'reset') {
        S.map[L.ch] = { kind: 'axis', idx: best, inv: bd < 0 };
      } else {
        S.map[L.ch] = { axis: best, inv: bd < 0 };
      }
      learning = null; L.cb(true, 'Axe ' + best + (bd < 0 ? ' (inversé)' : ''));
    }
  }
  function cancelLearn() { learning = null; }

  function calibrate(on) {
    if (on) { calibrating = {}; return; }
    if (calibrating) {
      const S = Settings.get();
      for (const i in calibrating) if (calibrating[i][1] - calibrating[i][0] > 0.4) S.cal[i] = calibrating[i];
    }
    calibrating = null;
  }

  // ── Sticks tactiles ──
  function bindTouch(elL, elR) {
    const knob = el => el.querySelector('i');
    function setup(el, left) {
      let id = null;
      const upd = (e) => {
        const r = el.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
        const y = Math.max(-1, Math.min(1, -(((e.clientY - r.top) / r.height) * 2 - 1)));
        if (left) { touch.yaw = dead(x, 0.08); touch.thr = (y + 1) / 2; }
        else { touch.roll = dead(x, 0.06); touch.pitch = dead(y, 0.06); }
        knob(el).style.left = (33 + x * 33) + '%';
        knob(el).style.top = (33 - y * 33) + '%';
      };
      el.addEventListener('pointerdown', e => { id = e.pointerId; el.setPointerCapture(id); touch.active = true; upd(e); });
      el.addEventListener('pointermove', e => { if (e.pointerId === id) upd(e); });
      const end = e => {
        if (e.pointerId !== id) return; id = null;
        if (left) { touch.yaw = 0; knob(el).style.left = '33%'; }
        else { touch.roll = 0; touch.pitch = 0; knob(el).style.left = '33%'; knob(el).style.top = '33%'; }
      };
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
    }
    setup(elL, true); setup(elR, false);
    knob(elL).style.top = '66%';
  }

  return {
    poll, takeKeys, learn, cancelLearn, calibrate, zeroKb, bindTouch, keys, out,
    rawAxis: i => rawAxis(getPad(), i),
    pad: getPad,
    get padName() { return padName; },
    get isLearning() { return !!learning; },
  };
})();

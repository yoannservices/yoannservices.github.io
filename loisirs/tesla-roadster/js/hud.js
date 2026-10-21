'use strict';
/* ===== Interface : compteur de vitesse, réservoir de liquide propulseur, mini-carte ===== */
window.createHUD = function () {
  const $ = id => document.getElementById(id);
  const sp = $('speedo'), tk = $('tank'), mn = $('mini');
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  function prep(c) {
    const w = c.width, h = c.height;
    c.style.width = w + 'px'; c.style.height = h + 'px';
    c.width = w * DPR; c.height = h * DPR;
    const g = c.getContext('2d'); g.scale(DPR, DPR);
    return { g, w, h };
  }
  const S = prep(sp), T = prep(tk), Mi = prep(mn);
  const FONT = "'Barlow Condensed','Arial Narrow',sans-serif";
  const MAXK = 500;
  const A0 = Math.PI * 0.75, A1 = Math.PI * 2.25;

  // Fond statique du compteur, dessiné une fois
  const bg = document.createElement('canvas'); bg.width = S.w * DPR; bg.height = S.h * DPR;
  {
    const g = bg.getContext('2d'); g.scale(DPR, DPR);
    const cx = S.w / 2, cy = S.h / 2, r = S.w / 2 - 8;
    const rg = g.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
    rg.addColorStop(0, 'rgba(14,18,26,.92)'); rg.addColorStop(1, 'rgba(6,8,12,.88)');
    g.fillStyle = rg; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 2; g.stroke();
    // zone rouge
    g.strokeStyle = 'rgba(255,40,60,.55)'; g.lineWidth = 6;
    g.beginPath(); g.arc(cx, cy, r - 14, A0 + (A1 - A0) * 420 / MAXK, A1); g.stroke();
    for (let k = 0; k <= MAXK; k += 10) {
      const a = A0 + (A1 - A0) * k / MAXK, big = k % 50 === 0;
      const r0 = r - (big ? 26 : 19), r1 = r - 11;
      g.strokeStyle = big ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.35)';
      g.lineWidth = big ? 2.5 : 1.2;
      g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); g.stroke();
      if (big && k % 100 === 0) {
        g.fillStyle = 'rgba(235,240,248,.85)'; g.font = `600 17px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(String(k), cx + Math.cos(a) * (r - 42), cy + Math.sin(a) * (r - 42));
      }
    }
  }

  let shownK = 0;
  function speedo(kmh, boost, mode, alt, dt) {
    shownK += (kmh - shownK) * Math.min(1, dt * 12);
    const { g, w, h } = S, cx = w / 2, cy = h / 2, r = w / 2 - 8;
    g.clearRect(0, 0, w, h);
    g.drawImage(bg, 0, 0, w, h);
    const f = Math.min(1, shownK / MAXK), a = A0 + (A1 - A0) * f;
    // arc de progression
    const grad = g.createLinearGradient(0, h, w, 0);
    grad.addColorStop(0, '#22d3ff'); grad.addColorStop(0.6, boost ? '#a855f7' : '#3b82f6'); grad.addColorStop(1, '#ff2bd6');
    g.strokeStyle = grad; g.lineWidth = 7; g.lineCap = 'round';
    g.shadowColor = boost ? '#c084fc' : '#22d3ff'; g.shadowBlur = 14;
    g.beginPath(); g.arc(cx, cy, r - 4, A0, Math.max(A0 + 0.001, a)); g.stroke();
    g.shadowBlur = 0;
    // aiguille
    g.save(); g.translate(cx, cy); g.rotate(a);
    g.fillStyle = '#ff3b4e'; g.shadowColor = '#ff3b4e'; g.shadowBlur = 10;
    g.beginPath(); g.moveTo(-14, -3); g.lineTo(r - 20, -1); g.lineTo(r - 20, 1); g.lineTo(-14, 3); g.closePath(); g.fill();
    g.restore(); g.shadowBlur = 0;
    g.fillStyle = '#0d1118'; g.beginPath(); g.arc(cx, cy, 52, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1.5; g.stroke();
    // valeur numérique
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#f2f5f9'; g.font = `800 50px ${FONT}`;
    g.fillText(String(Math.round(Math.max(0, kmh))), cx, cy - 4);
    g.fillStyle = '#8d97a3'; g.font = `600 13px ${FONT}`;
    g.fillText('KM/H', cx, cy + 28);
    // mode de surface
    const colors = { SOL: '#4ade80', MUR: '#fbbf24', PLAFOND: '#ff2bd6', VOL: '#22d3ff' };
    g.font = `700 17px ${FONT}`; g.fillStyle = colors[mode] || '#fff';
    g.fillText(mode, cx, cy + 74);
    if (mode === 'VOL') { g.font = `600 14px ${FONT}`; g.fillStyle = '#b6c2cf'; g.fillText(`ALT ${Math.round(alt)} m`, cx, cy + 94); }
    if (boost) { g.font = `800 15px ${FONT}`; g.fillStyle = '#c084fc'; g.fillText('BOOST', cx, cy - 76); }
  }

  // Réservoir de liquide propulseur
  const bubbles = Array.from({ length: 14 }, () => ({ x: Math.random(), y: Math.random(), s: 1 + Math.random() * 2.5, v: 0.2 + Math.random() * 0.5 }));
  let slosh = 0, sloshV = 0, shownF = 100;
  function tank(fuel, using, recharging, accel, t, dt) {
    shownF += (fuel - shownF) * Math.min(1, dt * 10);
    sloshV += (-accel * 0.015 - slosh * 40) * dt; sloshV *= Math.exp(-dt * 2.5); slosh += sloshV * dt * 10;
    slosh = Math.max(-0.35, Math.min(0.35, slosh));
    const { g, w, h } = T;
    g.clearRect(0, 0, w, h);
    const x0 = 30, y0 = 24, tw = w - 46, th = h - 64, rad = tw / 2;
    // tube de verre
    const path = () => { g.beginPath(); g.moveTo(x0, y0 + rad); g.arc(x0 + rad, y0 + rad, rad, Math.PI, 0); g.lineTo(x0 + tw, y0 + th - rad); g.arc(x0 + rad, y0 + th - rad, rad, 0, Math.PI); g.closePath(); };
    g.fillStyle = 'rgba(8,11,16,.85)'; path(); g.fill();
    g.save(); path(); g.clip();
    const low = shownF < 20;
    const level = y0 + th - (th * shownF / 100);
    const c1 = low ? '#ff7a1a' : '#22d3ff', c2 = low ? '#ff2b4e' : '#2b6cff';
    const lg = g.createLinearGradient(0, level, 0, y0 + th);
    lg.addColorStop(0, c1); lg.addColorStop(1, c2);
    g.fillStyle = lg;
    g.beginPath(); g.moveTo(x0, y0 + th);
    const amp = 2 + (using ? 3.5 : 1) ;
    for (let x = 0; x <= tw; x += 2) {
      const yy = level + Math.sin(x * 0.18 + t * (using ? 9 : 4)) * amp * 0.5 + Math.sin(x * 0.07 - t * 3) * amp * 0.5 + (x - tw / 2) * slosh * 0.6;
      g.lineTo(x0 + x, yy);
    }
    g.lineTo(x0 + tw, y0 + th); g.closePath();
    g.shadowColor = c1; g.shadowBlur = 18; g.fill(); g.shadowBlur = 0;
    // bulles (montent quand la jauge se recharge)
    g.fillStyle = 'rgba(255,255,255,.55)';
    for (const b of bubbles) {
      b.y -= b.v * dt * (recharging ? 1.6 : 0.4);
      if (b.y < 0) { b.y = 1; b.x = Math.random(); }
      const by = level + (y0 + th - level) * b.y;
      if (by > level + 4) { g.beginPath(); g.arc(x0 + 5 + b.x * (tw - 10), by, b.s, 0, Math.PI * 2); g.fill(); }
    }
    // reflet
    const rg = g.createLinearGradient(x0, 0, x0 + tw, 0);
    rg.addColorStop(0, 'rgba(255,255,255,.18)'); rg.addColorStop(0.3, 'rgba(255,255,255,.03)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = rg; g.fillRect(x0, y0, tw, th);
    g.restore();
    g.strokeStyle = low && (t * 4 % 1 < 0.5) ? 'rgba(255,80,80,.9)' : 'rgba(255,255,255,.3)'; g.lineWidth = 2; path(); g.stroke();
    // graduations
    g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 1; g.fillStyle = 'rgba(220,228,236,.75)';
    g.font = `600 11px ${FONT}`; g.textAlign = 'right'; g.textBaseline = 'middle';
    for (let p = 0; p <= 100; p += 25) {
      const y = y0 + th - th * p / 100;
      g.beginPath(); g.moveTo(x0 - 6, y); g.lineTo(x0 - 1, y); g.stroke();
      g.fillText(String(p), x0 - 9, y);
    }
    g.textAlign = 'center'; g.font = `700 13px ${FONT}`; g.fillStyle = '#d6dee8';
    g.fillText('PROPULSION', w / 2 + 6, h - 26);
    g.font = `800 17px ${FONT}`; g.fillStyle = low ? '#ff7a6a' : '#22d3ff';
    g.fillText(Math.round(shownF) + ' %', w / 2 + 6, h - 9);
  }

  // Mini-carte orientée selon le cap
  function minimap(mapCanvas, MAP, x, z, heading, traffic) {
    const { g, w, h } = Mi;
    g.clearRect(0, 0, w, h);
    g.save();
    g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2); g.clip();
    g.fillStyle = '#0c1a10'; g.fillRect(0, 0, w, h);
    const scale = 0.45; // px par mètre
    g.translate(w / 2, h / 2);
    g.rotate(-heading);
    g.scale(scale / MAP.ppm, scale / MAP.ppm);
    g.drawImage(mapCanvas, -(x - MAP.x0) * MAP.ppm, -(z - MAP.z0) * MAP.ppm);
    g.fillStyle = '#e5e7eb';
    for (const c of traffic) { g.beginPath(); g.arc((c.x - x) * MAP.ppm, (c.z - z) * MAP.ppm, 5, 0, Math.PI * 2); g.fill(); }
    g.restore();
    // voiture au centre
    g.save(); g.translate(w / 2, h / 2);
    g.fillStyle = '#ff3b4e'; g.shadowColor = '#ff3b4e'; g.shadowBlur = 8;
    g.beginPath(); g.moveTo(0, -9); g.lineTo(6, 7); g.lineTo(0, 3); g.lineTo(-6, 7); g.closePath(); g.fill();
    g.restore();
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2;
    g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2); g.stroke();
    // nord
    const na = -heading - Math.PI / 2;
    g.fillStyle = '#fbbf24'; g.font = `700 13px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('N', w / 2 + Math.cos(na) * (w / 2 - 14), h / 2 + Math.sin(na) * (h / 2 - 14));
  }

  return { speedo, tank, minimap };
};

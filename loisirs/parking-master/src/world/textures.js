/* Textures réalistes générées par code (canvas) : asphalte, trottoir, gravier, terre, herbe, écorce, roche, neige, bois, façades...
   Toutes se répètent sans raccord visible (bruit périodique). Chaque texture sert aussi de bump map pour donner du relief. */
import * as THREE from 'three';
import { hash2, rng, lerp } from '../core/util.js';

/* Bruit de valeur périodique de période p (cellules), pour des textures qui se raccordent. */
function pn(x, y, p, s) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const h = (a, b) => hash2(((a % p) + p) % p, ((b % p) + p) % p, s);
  return lerp(lerp(h(i, j), h(i + 1, j), u), lerp(h(i, j + 1), h(i + 1, j + 1), u), v);
}
/* fbm périodique sur [0,1)² : `base` cellules au premier octave. */
function tf(u, v, base, oct, s = 0) {
  let a = 0.5, sum = 0, norm = 0, f = base;
  for (let o = 0; o < oct; o++) { sum += a * pn(u * f, v * f, f, s + o * 7); norm += a; a *= 0.5; f *= 2; }
  return sum / norm;
}

function paint(size, w, h, fn) {
  const c = document.createElement('canvas'); c.width = w || size; c.height = h || size;
  const g = c.getContext('2d'), img = g.createImageData(c.width, c.height), d = img.data;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    const px = fn(x / c.width, y / c.height, x, y), k = (y * c.width + x) * 4;
    d[k] = px[0]; d[k + 1] = px[1]; d[k + 2] = px[2]; d[k + 3] = px.length > 3 ? px[3] : 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}
const cl = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);
const tex = (canvas, rep = 1, srgb = true) => {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
};
const spots = (c, n, seed, draw) => { const g = c.getContext('2d'), r = rng(seed); for (let i = 0; i < n; i++) draw(g, r, c.width, c.height); return c; };

const cache = {};
const once = (k, f) => cache[k] || (cache[k] = f());

export const T = {
  asphalt: () => once('asphalt', () => {
    const c = paint(512, 512, 512, (u, v, x, y) => {
      const n = tf(u, v, 6, 5, 3), g = hash2(x, y, 9);
      const b = 52 + 34 * n + (g > 0.97 ? 38 : 0) + (g < 0.04 ? -16 : 0) + (g - 0.5) * 12;
      return [cl(b * 1.0), cl(b * 1.02), cl(b * 1.06)];
    });
    spots(c, 5, 71, (g, r, w, h) => { g.strokeStyle = 'rgba(15,15,18,.55)'; g.lineWidth = 1 + r(); g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let i = 0; i < 9; i++) { x += (r() - 0.5) * 60; y += (r() - 0.5) * 60; g.lineTo(x, y); } g.stroke(); });
    return tex(c);
  }),
  sidewalk: () => once('sidewalk', () => {
    const c = paint(512, 512, 512, (u, v, x, y) => {
      const sx = Math.floor(x / 64), sy = Math.floor(y / 64), slab = hash2(sx, sy, 5);
      const edge = (x % 64 < 2 || y % 64 < 2) ? -42 : 0;
      const b = 168 + 26 * tf(u, v, 8, 4, 11) + (slab - 0.5) * 26 + edge + (hash2(x, y, 3) - 0.5) * 14;
      return [cl(b), cl(b * 0.99), cl(b * 0.95)];
    });
    return tex(c);
  }),
  concrete: () => once('concrete', () => tex(paint(256, 256, 256, (u, v, x, y) => {
    const b = 150 + 40 * tf(u, v, 4, 5, 21) + (hash2(x, y, 4) - 0.5) * 16;
    return [cl(b), cl(b), cl(b * 0.97)];
  }))),
  gravel: () => once('gravel', () => {
    const c = paint(512, 512, 512, (u, v, x, y) => {
      const b = 128 + 36 * tf(u, v, 8, 4, 31) + (hash2(x, y, 6) - 0.5) * 28;
      return [cl(b * 1.04), cl(b * 0.99), cl(b * 0.9)];
    });
    spots(c, 1800, 33, (g, r, w, h) => {
      const x = r() * w, y = r() * h, s = 1.5 + r() * 3.5, t = 90 + r() * 110;
      g.fillStyle = `rgba(${t * 1.05},${t},${t * 0.88},.85)`; g.beginPath(); g.ellipse(x, y, s, s * (0.6 + r() * 0.4), r() * 3, 0, 7); g.fill();
      g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(x + s * 0.3, y + s * 0.3, s * 0.8, s * 0.5, 0, 0, 7); g.fill();
    });
    return tex(c);
  }),
  dirt: () => once('dirt', () => {
    const c = paint(512, 512, 512, (u, v, x, y) => {
      const n = tf(u, v, 6, 5, 41), b = 0.62 + 0.55 * n + (hash2(x, y, 8) - 0.5) * 0.18;
      return [cl(118 * b), cl(90 * b), cl(60 * b)];
    });
    spots(c, 400, 43, (g, r, w, h) => { const x = r() * w, y = r() * h, s = 1 + r() * 2.2; g.fillStyle = `rgba(${150 + r() * 40},${130 + r() * 30},${100 + r() * 30},.7)`; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); });
    return tex(c);
  }),
  /* piste de terre : u en travers (deux ornières), v en long ; se répète en v */
  dirtRoad: () => once('dirtRoad', () => {
    const c = paint(512, 512, 512, (u, v, x, y) => {
      const rut = Math.exp(-Math.pow((u - 0.3) / 0.07, 2)) + Math.exp(-Math.pow((u - 0.7) / 0.07, 2));
      const mid = Math.exp(-Math.pow((u - 0.5) / 0.1, 2));
      const n = tf(u * 0.99, v, 6, 5, 51), b = 0.7 + 0.5 * n - 0.22 * rut + 0.05 * mid + (hash2(x, y, 2) - 0.5) * 0.16;
      const edge = Math.min(1, Math.min(u, 1 - u) / 0.12);
      return [cl(122 * b), cl(96 * b), cl(66 * b), 255 * edge];
    });
    const t = tex(c); t.wrapS = THREE.ClampToEdgeWrapping; return t;
  }),
  grass: () => once('grass', () => {
    const c = paint(512, 512, 512, (u, v, x, y) => {
      const n = tf(u, v, 5, 5, 61), m = tf(u, v, 14, 3, 62), b = 0.62 + 0.7 * n;
      return [cl((62 + 26 * m) * b), cl((104 + 30 * m) * b), cl((40 + 12 * m) * b)];
    });
    spots(c, 5200, 63, (g, r, w, h) => {
      const x = r() * w, y = r() * h, l = 4 + r() * 9, a = -Math.PI / 2 + (r() - 0.5) * 1.1, k = 0.55 + r() * 0.8;
      g.strokeStyle = `rgba(${55 * k + 20},${100 * k + 30},${34 * k},.55)`; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    });
    return tex(c);
  }),
  bark: () => once('bark', () => tex(paint(256, 256, 256, (u, v, x, y) => {
    const n = pn(u * 18, v * 3, 18, 71) * 0.6 + pn(u * 36, v * 6, 36, 72) * 0.4, b = 0.4 + n * 0.9;
    return [cl(96 * b), cl(72 * b), cl(54 * b)];
  }))),
  rock: () => once('rock', () => {
    const c = paint(512, 512, 512, (u, v, x, y) => {
      const w = tf(u, v, 4, 3, 81), band = Math.sin((v + 0.18 * w) * Math.PI * 2 * 7) * 0.5 + 0.5;
      const n = tf(u, v, 10, 5, 82), b = 0.55 + 0.55 * n + 0.18 * band + (hash2(x, y, 7) - 0.5) * 0.12;
      return [cl(122 * b), cl(114 * b), cl(104 * b)];
    });
    spots(c, 28, 83, (g, r, w, h) => { g.strokeStyle = 'rgba(20,18,16,.5)'; g.lineWidth = 1 + r() * 1.5; g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let i = 0; i < 7; i++) { x += (r() - 0.5) * 50; y += (r() - 0.2) * 50; g.lineTo(x, y); } g.stroke(); });
    return tex(c);
  }),
  snow: () => once('snow', () => tex(paint(256, 256, 256, (u, v, x, y) => {
    const b = 232 + 18 * tf(u, v, 6, 4, 91) + (hash2(x, y, 1) - 0.5) * 8;
    return [cl(b * 0.97), cl(b * 0.99), cl(b)];
  }))),
  wood: () => once('wood', () => {
    const c = paint(256, 256, 256, (u, v, x, y) => {
      const plank = Math.floor(y / 32), tone = hash2(plank, 1, 12), seam = y % 32 < 1.5 ? 0.45 : 1;
      const grain = pn(u * 4, v * 60 + plank * 7, 64, 13), b = (0.62 + tone * 0.35 + grain * 0.28) * seam;
      return [cl(140 * b), cl(98 * b), cl(60 * b)];
    });
    return tex(c);
  }),
  planks: () => once('planks', () => tex(paint(256, 256, 256, (u, v, x, y) => {  // planches verticales de grange, patinées
    const plank = Math.floor(x / 32), tone = hash2(plank, 4, 14), seam = x % 32 < 1.5 ? 0.4 : 1;
    const grain = pn(u * 60 + plank * 5, v * 3, 60, 15), b = (0.5 + tone * 0.4 + grain * 0.3) * seam;
    return [cl(150 * b), cl(60 * b), cl(48 * b)];
  }))),
  straw: () => once('straw', () => tex(paint(256, 256, 256, (u, v, x, y) => {
    const n = pn(u * 6, v * 90, 90, 17) * 0.6 + pn(u * 20, v * 40, 40, 18) * 0.4, b = 0.62 + n * 0.55;
    return [cl(205 * b), cl(170 * b), cl(86 * b)];
  }))),
  crops: () => once('crops', () => tex(paint(256, 256, 256, (u, v, x, y) => {
    const row = Math.sin(u * Math.PI * 2 * 8) * 0.5 + 0.5, n = tf(u, v, 8, 4, 19), b = 0.55 + 0.45 * row + 0.3 * n;
    return [cl((150 - 60 * row) * b), cl((150 + 20 * row) * b), cl(52 * b)];
  }))),
  leaves: () => once('leaves', () => {
    const c = paint(256, 256, 256, (u, v) => { const n = tf(u, v, 8, 4, 22), b = 0.55 + 0.7 * n; return [cl(60 * b), cl(104 * b), cl(34 * b)]; });
    spots(c, 900, 23, (g, r, w, h) => { const x = r() * w, y = r() * h, k = 0.5 + r() * 0.9; g.fillStyle = `rgba(${52 * k},${100 * k},${28 * k},.8)`; g.beginPath(); g.ellipse(x, y, 3 + r() * 4, 1.5 + r() * 2, r() * 3, 0, 7); g.fill(); });
    return tex(c);
  }),
  needles: () => once('needles', () => tex(paint(256, 256, 256, (u, v, x, y) => {
    const n = pn(u * 30, v * 30, 30, 24) * 0.6 + tf(u, v, 6, 3, 25) * 0.6, b = 0.5 + n * 0.8;
    return [cl(34 * b), cl(72 * b), cl(48 * b)];
  }))),
  metal: () => once('metal', () => tex(paint(256, 256, 256, (u, v, x, y) => {
    const rib = Math.sin(u * Math.PI * 2 * 10) * 0.5 + 0.5, b = 0.7 + 0.2 * rib + (hash2(x, y, 26) - 0.5) * 0.1;
    return [cl(170 * b), cl(176 * b), cl(182 * b)];
  }))),
  roofTin: () => once('roofTin', () => tex(paint(256, 256, 256, (u, v, x, y) => {
    const rib = Math.sin(u * Math.PI * 2 * 12) * 0.5 + 0.5, n = tf(u, v, 6, 4, 27), b = 0.55 + 0.25 * rib + 0.3 * n;
    return [cl(150 * b), cl(60 * b), cl(50 * b)];
  }))),
  /* façade d'immeuble : 4 colonnes x 6 étages (12,8 m x 20,4 m) ; couleur du mur en paramètre */
  facade: (wall = '#c9b8a2', key = 'f', style = {}) => once('facade' + key, () => {
    const W = 256, H = 384, c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.fillStyle = wall; g.fillRect(0, 0, W, H);
    if (style.logs) for (let y = 0; y < H; y += 16) { g.fillStyle = `rgba(0,0,0,${0.12 + 0.12 * hash2(y, 3, 9)})`; g.fillRect(0, y, W, 2); g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(0, y + 2, W, 3); }
    if (style.stone) for (let y = 0; y < H; y += 24) for (let x = (y / 24 % 2) * 20; x < W; x += 40) { g.fillStyle = `rgba(${hash2(x, y, 4) > 0.5 ? '255,255,255' : '0,0,0'},${0.05 + 0.07 * hash2(x, y, 5)})`; g.fillRect(x + 1, y + 1, 38, 22); }
    const img = g.getImageData(0, 0, W, H), d = img.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const k = (y * W + x) * 4, n = (tf(x / W, y / H, 8, 4, 28) - 0.5) * 36 + (hash2(x, y, 3) - 0.5) * 10; d[k] = cl(d[k] + n); d[k + 1] = cl(d[k + 1] + n); d[k + 2] = cl(d[k + 2] + n); }
    g.putImageData(img, 0, 0);
    const r = rng(29);
    for (let row = 0; row < 6; row++) for (let col = 0; col < 4; col++) {
      const x = col * 64 + 12, y = row * 64 + 12, w = 40, h = 44;
      g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(x - 3, y - 3, w + 6, h + 6);                 // encadrement
      const sky = g.createLinearGradient(0, y, 0, y + h); sky.addColorStop(0, '#6f8ba3'); sky.addColorStop(1, '#2c3b4a');
      g.fillStyle = sky; g.fillRect(x, y, w, h);
      if (r() > 0.55) { g.fillStyle = `rgba(${200 + r() * 40},${190 + r() * 30},${150 + r() * 30},.55)`; g.fillRect(x, y, w, h * (0.3 + r() * 0.5)); } // rideau
      g.fillStyle = '#e9e4da'; g.fillRect(x + w / 2 - 1.2, y, 2.4, h); g.fillRect(x, y + h * 0.42, w, 2.4);  // montants
      g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(x, y + h); g.lineTo(x + w * 0.5, y); g.lineTo(x + w * 0.75, y); g.lineTo(x + w * 0.25, y + h); g.fill(); // reflet
      g.fillStyle = '#b9b2a6'; g.fillRect(x - 5, y + h + 3, w + 10, 4);                       // appui
      if (style.shutters) { g.fillStyle = style.shutters; g.fillRect(x - 12, y - 2, 11, h + 4); g.fillRect(x + w + 1, y - 2, 11, h + 4); g.fillStyle = 'rgba(0,0,0,.25)'; for (let k = 0; k < 6; k++) { g.fillRect(x - 12, y + k * 8, 11, 1); g.fillRect(x + w + 1, y + k * 8, 11, 1); } }
    }
    g.fillStyle = 'rgba(0,0,0,.25)'; for (let row = 1; row < 6; row++) g.fillRect(0, row * 64 - 1, W, 2); // bandeaux
    return tex(c);
  }),
  storefront: () => once('storefront', () => {
    const W = 512, H = 128, c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.fillStyle = '#2a2d31'; g.fillRect(0, 0, W, H);
    const cols = ['#b4423c', '#3d6aa5', '#4a8a5a', '#d49a3a'];
    for (let i = 0; i < 4; i++) {
      const x = i * 128 + 8;
      g.fillStyle = cols[i]; g.fillRect(x, 6, 112, 26);                                  // enseigne
      g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(x + 12, 15, 88, 6);
      const gl = g.createLinearGradient(0, 40, 0, 120); gl.addColorStop(0, '#43586b'); gl.addColorStop(1, '#1e2a35');
      g.fillStyle = gl; g.fillRect(x, 40, 112, 80);                                      // vitrine
      g.fillStyle = 'rgba(255,230,180,.28)'; g.fillRect(x + 6, 70, 100, 40);
      g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.moveTo(x + 10, 120); g.lineTo(x + 50, 40); g.lineTo(x + 66, 40); g.lineTo(x + 26, 120); g.fill();
    }
    return tex(c);
  }),
  /* brin d'herbe avec transparence, pour les touffes */
  tuft: () => once('tuft', () => {
    const c = document.createElement('canvas'); c.width = 128; c.height = 128;
    const g = c.getContext('2d'), r = rng(31);
    for (let i = 0; i < 34; i++) {
      const x = 64 + (r() - 0.5) * 90, tip = (r() - 0.5) * 40, h = 40 + r() * 80, k = 0.6 + r() * 0.7;
      g.strokeStyle = `rgb(${58 * k + 22},${108 * k + 24},${34 * k})`; g.lineWidth = 2 + r() * 1.5; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x, 128); g.quadraticCurveTo(x + tip * 0.3, 128 - h * 0.6, x + tip, 128 - h); g.stroke();
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  }),

  cobble: () => once('cobble', () => {
    const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), r = rng(101);
    g.fillStyle = '#5b5851'; g.fillRect(0, 0, 512, 512);
    for (let y = 0, row = 0; y < 512; y += 32, row++) {
      const n = 11 + (row % 3), w = 512 / n;
      for (let i = 0; i < n; i++) {
        const x = i * w + (row % 2) * w * 0.3, t = 118 + r() * 60;
        g.fillStyle = `rgb(${t * 1.02},${t},${t * 0.93})`; g.beginPath(); g.roundRect((x % 512) + 2, y + 2, w - 4, 28, 7); g.fill();
        if (x + w > 512) { g.beginPath(); g.roundRect(x - 512 + 2, y + 2, w - 4, 28, 7); g.fill(); }
        g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect((x % 512) + 5, y + 4, w - 10, 3);
      }
    }
    return tex(c);
  }),
  stone: () => once('stone', () => {
    const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), r = rng(103);
    g.fillStyle = '#8c8880'; g.fillRect(0, 0, 512, 512);
    for (let y = 0, row = 0; y < 512; y += 32, row++) for (let x = (row % 2) * 30; x < 560; x += 60 + Math.floor(r() * 3) * 20) {
      const w = 56 + r() * 18, t = 110 + r() * 70; g.fillStyle = `rgb(${t * 1.03},${t},${t * 0.92})`; g.beginPath(); g.roundRect(x + 2, y + 2, w - 3, 28, 4); g.fill();
      g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(x + 4, y + 22, w - 7, 6);
    }
    return tex(c);
  }),
  roofTile: () => once('roofTile', () => {
    const c = paint(256, 256, 256, (u, v, x, y) => { const row = Math.floor(y / 16), col = Math.floor((x + (row % 2) * 12) / 24), t = hash2(col, row, 7), sh = (y % 16) / 16; const b = (0.7 + 0.45 * t) * (0.7 + 0.3 * sh); return [cl(150 * b), cl(68 * b), cl(48 * b)]; });
    return tex(c);
  }),
  roofSlate: () => once('roofSlate', () => tex(paint(256, 256, 256, (u, v, x, y) => { const row = Math.floor(y / 14), col = Math.floor((x + (row % 2) * 10) / 20), t = hash2(col, row, 8), sh = (y % 14) / 14; const b = (0.6 + 0.4 * t) * (0.65 + 0.35 * sh); return [cl(84 * b), cl(90 * b), cl(98 * b)]; }))),
  garageFloor: () => once('garageFloor', () => {
    const c = paint(512, 512, 512, (u, v, x, y) => { const b = 112 + 26 * tf(u, v, 6, 5, 111) + (hash2(x, y, 12) - 0.5) * 14; return [cl(b), cl(b), cl(b * 1.03)]; });
    spots(c, 36, 113, (g, r, w, h) => { g.fillStyle = `rgba(20,20,24,${0.12 + r() * 0.22})`; g.beginPath(); g.ellipse(r() * w, r() * h, 6 + r() * 22, 4 + r() * 14, r() * 3, 0, 7); g.fill(); });
    return tex(c);
  }),
  garageWall: () => once('garageWall', () => {
    const c = paint(256, 256, 256, (u, v, x, y) => { const low = v > 0.72; const b = (low ? 74 : 168) + 22 * tf(u, v, 6, 4, 115) + (hash2(x, y, 13) - 0.5) * 10; return [cl(b), cl(b), cl(b * 1.02)]; });
    return tex(c);
  }),
  water: () => once('water', () => tex(paint(256, 256, 256, (u, v, x, y) => { const n = tf(u, v, 6, 4, 121), s = Math.sin((u * 8 + n * 3) * Math.PI * 2) * 0.5 + 0.5; return [cl(52 + 30 * n + 14 * s), cl(104 + 36 * n + 20 * s), cl(120 + 34 * n + 20 * s)]; }))),
  plank: () => once('plank', () => tex(paint(256, 256, 256, (u, v, x, y) => { const p = Math.floor(x / 32), t = hash2(p, 2, 17), seam = x % 32 < 1.5 ? 0.45 : 1, g = pn(u * 5 + p, v * 40, 40, 18); const b = (0.6 + t * 0.35 + g * 0.3) * seam; return [cl(150 * b), cl(112 * b), cl(72 * b)]; }))),
};

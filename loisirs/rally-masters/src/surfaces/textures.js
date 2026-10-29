/* Textures procédurales (CanvasTexture) : aucun fichier externe. */
import * as THREE from 'three';
import { mulberry32 } from '../core/util.js';

const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const tex = (c, srgb = true) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const gray = (v, a = 1) => { const n = Math.round(Math.max(0, Math.min(1, v)) * 255); return `rgba(${n},${n},${n},${a})`; };

/* Atlas du terrain : [0..¼] piste de terre (ornières), [¼..½] asphalte (lignes), [½..1] bas-côté. Niveaux de gris, teintés par couleur de sommet. */
export function terrainAtlas() {
  const W = 512, H = 1024, c = cv(W, H), g = c.getContext('2d'), r = mulberry32(7);
  g.fillStyle = gray(0.85); g.fillRect(0, 0, W, H);
  const speckle = (x0, w, n, base, amp) => { for (let i = 0; i < n; i++) { g.fillStyle = gray(base + (r() - 0.5) * amp, 0.5); g.fillRect(x0 + r() * w, r() * H, 1 + r() * 3, 1 + r() * 4); } };
  // piste de terre : base, grain, ornières sinueuses, crête centrale
  g.fillStyle = gray(0.82); g.fillRect(0, 0, 128, H);
  speckle(0, 128, 5000, 0.8, 0.5);
  for (const [cx, wd, v] of [[0.27, 0.1, 0.62], [0.73, 0.1, 0.62], [0.5, 0.08, 0.96]]) {
    for (let y = 0; y < H; y += 6) { const wob = Math.sin(y * 0.013 + cx * 9) * 4 + Math.sin(y * 0.041 + cx) * 1.5; g.fillStyle = gray(v + (r() - 0.5) * 0.12, 0.8); g.fillRect(128 * cx + wob - 128 * wd / 2, y, 128 * wd, 7); }
  }
  g.fillStyle = gray(0.55); g.fillRect(0, 0, 8, H); g.fillRect(120, 0, 8, H);
  // asphalte : grain fin, fissures, lignes de rive blanches, axe discontinu
  g.fillStyle = gray(0.5); g.fillRect(128, 0, 128, H);
  speckle(128, 128, 7000, 0.5, 0.35);
  g.strokeStyle = gray(0.3, 0.7); g.lineWidth = 1;
  for (let i = 0; i < 14; i++) { let x = 128 + r() * 128, y = r() * H; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 8; k++) { x += (r() - 0.5) * 14; y += 6 + r() * 14; g.lineTo(x, y); } g.stroke(); }
  g.fillStyle = gray(1); g.fillRect(128 + 6, 0, 4, H); g.fillRect(128 + 118, 0, 4, H);
  for (let y = 0; y < H; y += 256) g.fillRect(128 + 62, y, 4, 128);
  // bas-côté : bruit multi-échelle
  g.fillStyle = gray(0.8); g.fillRect(256, 0, 256, H);
  for (let s = 0; s < 3; s++) { const sz = [60, 18, 5][s]; for (let i = 0; i < 700 * (s + 1); i++) { g.fillStyle = gray(0.8 + (r() - 0.5) * (0.4 - s * 0.08), 0.35); g.fillRect(256 + r() * 256, r() * H, sz * (0.4 + r()), sz * (0.4 + r())); } }
  const t = tex(c); t.wrapS = THREE.ClampToEdgeWrapping; t.wrapT = THREE.RepeatWrapping; return t;
}

/* Planche de chevrons (virage à gauche / à droite) */
export function chevronTexture(dir) {
  const c = cv(128, 256), g = c.getContext('2d');
  g.fillStyle = '#ffd23f'; g.fillRect(0, 0, 128, 256); g.strokeStyle = '#111'; g.lineWidth = 7; g.strokeRect(4, 4, 120, 248);
  g.lineWidth = 16; g.lineCap = 'round'; g.lineJoin = 'round';
  for (let k = 0; k < 3; k++) { const y = 60 + k * 64; g.beginPath(); g.moveTo(dir > 0 ? 36 : 92, y - 26); g.lineTo(dir > 0 ? 92 : 36, y); g.lineTo(dir > 0 ? 36 : 92, y + 26); g.stroke(); }
  return tex(c);
}

/* Banderole de départ / arrivée / point de passage */
export function bannerTexture(text, bg = '#d90429', checker = false) {
  const c = cv(1024, 192), g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, 1024, 192);
  if (checker) { for (let y = 0; y < 192; y += 24) for (let x = 0; x < 1024; x += 24) { g.fillStyle = ((x / 24 + y / 24) & 1) ? '#fff' : '#111'; if (y < 24 || y >= 168) g.fillRect(x, y, 24, 24); } }
  g.fillStyle = '#fff'; g.font = '800 104px Inter, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 512, 98);
  return tex(c);
}

/* Bande de pare-brise / lunette (dégradé) non utilisée par la carrosserie, réservée aux feux */
export function glowTexture() {
  const c = cv(64, 64), g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return tex(c);
}

/* Eau d'un gué : motif d'ondes en niveaux de gris */
export function waterTexture() {
  const c = cv(256, 256), g = c.getContext('2d'), r = mulberry32(3);
  g.fillStyle = gray(0.7); g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 160; i++) { g.strokeStyle = gray(0.85 + r() * 0.15, 0.5); g.lineWidth = 1 + r() * 2; const x = r() * 256, y = r() * 256, w = 12 + r() * 40; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y - 5, x + w, y); g.stroke(); }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

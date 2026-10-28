/* Textures procédurales (CanvasTexture), aucune image externe. */
import * as THREE from 'three';
import { mulberry32 } from '../core/rng.js';

function tex(w, h, draw, rep = 1) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; t.repeat.set(rep, rep);
  return t;
}
const cache = {};
const once = (k, f) => cache[k] || (cache[k] = f());

/* grain de terre en niveaux de gris : se multiplie avec les couleurs de sommet */
export const groundTex = () => once('ground', () => tex(256, 256, (g, w, h) => {
  const r = mulberry32(7);
  g.fillStyle = '#d4d4d4'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) { const v = 150 + r() * 105; g.fillStyle = `rgba(${v},${v},${v},${0.25 + r() * 0.35})`; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3); }
  for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(90,90,90,${0.08 + r() * 0.1})`; g.beginPath(); const x = r() * w, y = r() * h; g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 40, y + (r() - 0.5) * 40); g.stroke(); }
}));

export const plankTex = () => once('plank', () => tex(128, 128, (g, w, h) => {
  const r = mulberry32(3);
  for (let y = 0; y < h; y += 16) {
    const l = 38 + r() * 14; g.fillStyle = `hsl(28,42%,${l}%)`; g.fillRect(0, y, w, 15);
    g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, y + 15, w, 1);
    for (let k = 0; k < 6; k++) { g.strokeStyle = `rgba(60,30,10,${0.15 + r() * 0.2})`; g.beginPath(); g.moveTo(0, y + r() * 14); g.lineTo(w, y + r() * 14); g.stroke(); }
  }
}));

export const bannerTex = (text, bg = '#16181c', fg = '#ffd23f') => tex(512, 128, (g, w, h) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = fg; g.font = 'bold 64px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 4);
  g.fillStyle = fg; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 16, 8);
});

export const checkerTex = () => once('check', () => tex(64, 64, (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#fff' : '#111'; g.fillRect(x * 16, y * 16, 16, 16); } }));

export const skyTex = (top, bottom) => tex(8, 256, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, 0, w, h);
});

// Textures dessinées au canvas pour les maisons (aucun fichier) : enduit, peinture, parquet, carrelage, tuiles.
// Taille selon le réglage « Textures des maisons » (0 = couleurs unies). UV en mètres via worldUV (1 répétition = 2 m).
import * as THREE from 'three';

const cache = new Map();
const rnd = (s) => () => { s = (s * 16807) % 2147483647; return s / 2147483647; };

function make(kind, size) {
  const c = Object.assign(document.createElement('canvas'), { width: size, height: size }), g = c.getContext('2d'), r = rnd(kind.length * 97 + size);
  const noise = (n, a) => { for (let i = 0; i < n; i++) { const v = r() < 0.5 ? 0 : 255; g.fillStyle = `rgba(${v},${v},${v},${a * r()})`; const s = 1 + r() * size / 128; g.fillRect(r() * size, r() * size, s, s); } };
  if (kind === 'plaster') { g.fillStyle = '#fff'; g.fillRect(0, 0, size, size); noise(size * 30, 0.08); for (let i = 0; i < 18; i++) { g.fillStyle = `rgba(90,80,70,${0.03 * r()})`; g.beginPath(); g.arc(r() * size, r() * size, r() * size / 4, 0, 7); g.fill(); } }
  if (kind === 'paint') { g.fillStyle = '#fff'; g.fillRect(0, 0, size, size); noise(size * 10, 0.035); }
  if (kind === 'parquet') {
    const pw = size / 8;
    for (let x = 0; x < 8; x++) for (let y = 0, o = r() * size; y < 3; y++) {
      const l = 0.75 + r() * 0.25; g.fillStyle = `rgb(${150 * l | 0},${108 * l | 0},${70 * l | 0})`;
      g.fillRect(x * pw, ((o + y * size / 2.2) % size) - size / 2.2, pw - 1, size / 2.2 - 1); g.fillRect(x * pw, ((o + y * size / 2.2) % size), pw - 1, size / 2.2 - 1);
    }
    for (let i = 0; i < size * 2; i++) { g.strokeStyle = `rgba(60,35,15,${0.08 * r()})`; const x = r() * size; g.beginPath(); g.moveTo(x, r() * size); g.lineTo(x + (r() - 0.5) * 2, r() * size); g.stroke(); }
  }
  if (kind === 'tiles') {
    g.fillStyle = '#9a9a96'; g.fillRect(0, 0, size, size); const n = 6, t = size / n;
    for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) { const l = 225 + r() * 25 | 0; g.fillStyle = `rgb(${l},${l},${l - 6})`; g.fillRect(x * t + 1.5, y * t + 1.5, t - 3, t - 3); }
  }
  if (kind === 'roof') {
    const rows = 10, cols = 7, h = size / rows, w = size / cols;
    g.fillStyle = '#5a2a1e'; g.fillRect(0, 0, size, size);
    for (let y = 0; y < rows; y++) for (let x = -1; x < cols + 1; x++) {
      const l = 0.8 + r() * 0.3, ox = y % 2 ? w / 2 : 0;
      const gr = g.createLinearGradient(0, y * h, 0, y * h + h); gr.addColorStop(0, `rgb(${170 * l | 0},${78 * l | 0},${55 * l | 0})`); gr.addColorStop(1, `rgb(${110 * l | 0},${48 * l | 0},${34 * l | 0})`);
      g.fillStyle = gr; g.beginPath(); g.roundRect(x * w + ox + 1, y * h + 1, w - 2, h - 2, w / 3); g.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.anisotropy = 4;
  return tex;
}

// level : 0 rien, 1 = 256 px, 2 = 512 px
export function tex(kind, level) {
  if (!level) return null;
  const key = kind + level;
  if (!cache.has(key)) cache.set(key, make(kind, level === 2 ? 512 : 256));
  return cache.get(key);
}

// UV d'une BoxGeometry en mètres (une répétition tous les `m` mètres) : faces +x -x +y -y +z -z
export function worldUV(geo, w, h, d, m = 2) {
  const uv = geo.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i; uv.setXY(k, uv.getX(k) * dims[f][0] / m, uv.getY(k) * dims[f][1] / m); }
  uv.needsUpdate = true;
  return geo;
}

/* Copilote : notes de pace annoncées en avance (« gauche 3 serré, 50, droite 5 »), voix par Web Speech API,
   anticipation et niveau de détail réglables. Les notes viennent de l'analyse du tracé (stage.notes). */
import { DS } from '../stage/spline.js';

const MOD_TXT = { serre: 'serre', ouvre: 'ouvre', long: 'long', attention: 'attention' };

/* distance en mètres arrondie à la dizaine (puis à 50) : « 30 », « 100 », « 150 » */
function distText(g) {
  if (g < 25) return 'enchaîné';
  const r = g < 100 ? Math.round(g / 10) * 10 : Math.round(g / 50) * 50;
  return String(r);
}

export function noteText(n, withGap = true) {
  let t;
  if (n.type === 'corner') {
    const dir = n.dir === 'L' ? 'gauche' : 'droite';
    t = n.sev === 1 ? `épingle ${dir}` : `${dir} ${n.sev}`;
    const m = n.mods.filter((x) => MOD_TXT[x]).map((x) => MOD_TXT[x]);
    if (m.includes('attention')) t = 'attention, ' + t;
    t += m.filter((x) => x !== 'attention').map((x) => ' ' + x).join('');
  } else if (n.type === 'jump') t = 'attention saut';
  else if (n.type === 'bridge') t = 'pont';
  else if (n.type === 'ford') t = 'gué';
  else t = 'arrivée';
  if (withGap && n.gap != null && n.type !== 'finish') t += ', ' + distText(n.gap);
  return t;
}

/* icône SVG d'une note : route qui tourne selon la gravité, plus la distance */
export function noteIcon(n) {
  if (n.type === 'jump') return '<svg viewBox="0 0 40 40"><path d="M6 30 L20 12 L34 30" fill="none" stroke="#ffd23f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="20" cy="30" r="3" fill="#ffd23f"/></svg>';
  if (n.type === 'bridge') return '<svg viewBox="0 0 40 40"><path d="M4 22 Q20 6 36 22" fill="none" stroke="#38bdf8" stroke-width="4"/><path d="M8 24 V32 M20 17 V32 M32 24 V32" stroke="#38bdf8" stroke-width="3"/></svg>';
  if (n.type === 'ford') return '<svg viewBox="0 0 40 40"><path d="M4 20 q4 -5 8 0 t8 0 t8 0 t8 0 M4 28 q4 -5 8 0 t8 0 t8 0 t8 0" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/></svg>';
  if (n.type !== 'corner') return '<svg viewBox="0 0 40 40"><rect x="8" y="8" width="24" height="24" fill="none" stroke="#fff" stroke-width="3"/><path d="M8 20 H32" stroke="#fff" stroke-width="3"/></svg>';
  // tracé : tronc droit puis arc dont l'angle dépend de la gravité (1 = épingle)
  const turn = [0, 3.0, 2.0, 1.4, 0.9, 0.55, 0.3][n.sev] * (n.dir === 'L' ? 1 : -1), pts = [];
  let x = 20, y = 36, h = 0;     // h : cap (0 = vers le haut)
  pts.push([x, y]); y -= 10; pts.push([x, y]);
  const steps = 10, rad = n.sev === 1 ? 7 : 6 + n.sev * 2, total = Math.abs(turn);
  for (let i = 0; i < steps; i++) { h += turn / steps; x += Math.sin(h) * rad * total / steps * 1.4; y -= Math.cos(h) * rad * total / steps * 1.4; pts.push([x, y]); }
  const col = n.sev <= 2 ? '#ff6b6b' : n.sev <= 4 ? '#ffb347' : '#7be37b';
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const ex = n.mods.includes('serre') ? '<circle cx="34" cy="6" r="3" fill="#ff6b6b"/>' : n.mods.includes('ouvre') ? '<circle cx="34" cy="6" r="3" fill="#7be37b"/>' : '';
  return `<svg viewBox="0 0 40 40"><path d="${d}" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>${ex}</svg>`;
}

export class CoDriver {
  constructor(stage, settings, onSay) {
    this.st = stage; this.cfg = settings; this.onSay = onSay || (() => {});
    this.notes = stage.notes.slice(); this.notes.push({ type: 'finish', s0: stage.length - 40, s1: stage.length, gap: 0, mods: [] });
    this.next = 0; this.speaking = false; this.voice = null; this.queue = [];
    this.synth = typeof speechSynthesis !== 'undefined' ? speechSynthesis : null;
    this._voices();
  }
  _voices() {
    if (!this.synth) return;
    const pick = () => { const v = this.synth.getVoices(); this.voice = v.find((x) => /fr-FR/i.test(x.lang) && /(google|microsoft|natural|online)/i.test(x.name)) || v.find((x) => /^fr/i.test(x.lang)) || null; };
    pick(); this.synth.addEventListener?.('voiceschanged', pick);
  }
  reset() { this.next = 0; this.queue.length = 0; this.speaking = false; try { this.synth?.cancel(); } catch (e) { /* ignoré */ } }
  /* niveau de détail : 1 = dangers seulement, 2 = tout sauf les courbes rapides, 3 = tout */
  wanted(n) {
    const d = this.cfg.detail;
    if (n.type !== 'corner') return true;
    return d >= 3 || (d === 2 && n.sev <= 5) || (d <= 1 && n.sev <= 3);
  }
  /* appelé à chaque image : dist = distance parcourue (m), speed = m/s */
  update(dist, speed) {
    const look = Math.max(70, speed * this.cfg.anticipation);
    const batch = [];
    while (this.next < this.notes.length && this.notes[this.next].s0 <= dist + look) {
      const n = this.notes[this.next++];
      if (n.s0 < dist - 10 || !this.wanted(n)) continue;      // note déjà dépassée ou masquée par le niveau de détail
      batch.push(n);
    }
    if (batch.length) {
      // plusieurs notes proches sont dites d'une seule phrase
      this.say(batch.map((n, i) => noteText(n, i < batch.length - 1 || n.type !== 'finish')).join(', '));
    }
  }
  say(text) {
    this.onSay(text);
    if (!this.cfg.voice || !this.synth || this.cfg.voiceVolume <= 0) return;
    if (this.queue.length > 1) this.queue.shift();     // retard : on abandonne la plus ancienne
    this.queue.push(text); this._pump();
  }
  _pump() {
    if (this.speaking || !this.queue.length) return;
    const text = this.queue.shift(), u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-FR'; if (this.voice) u.voice = this.voice; u.rate = this.cfg.voiceRate; u.volume = this.cfg.voiceVolume; u.pitch = 0.95;
    const done = () => { this.speaking = false; this._pump(); };
    u.onend = done; u.onerror = done; this.speaking = true;
    try { this.synth.speak(u); } catch (e) { this.speaking = false; }
  }
  /* notes à venir pour le HUD : [{note, dist}] */
  ahead(dist, n = 4) {
    const out = [];
    for (const x of this.notes) { if (x.s1 < dist - 5) continue; if (!this.wanted(x) && x.type === 'corner' && x.sev > 3) continue; out.push({ note: x, dist: Math.max(0, x.s0 - dist) }); if (out.length >= n) break; }
    return out;
  }
  say_countdown() { this.say('Départ imminent, bonne chance'); }
  stop() { try { this.synth?.cancel(); } catch (e) { /* ignoré */ } this.queue.length = 0; this.speaking = false; }
}
export { DS };

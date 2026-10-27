const $ = (id) => document.getElementById(id);
const fmt = (n) => Math.round(n).toLocaleString('fr-FR');
const fmtTime = (s) => { const m = Math.floor(s / 60); return `${m}:${String(Math.floor(s - m * 60)).padStart(2, '0')}`; };

/** HUD en HTML : score, chaîne en cours, temps, vitesse, messages et écrans de début/fin. */
class Hud {
  constructor() {
    this.el = { score: $('score'), chain: $('chain'), time: $('time'), speed: $('speed'), angle: $('angle'), popups: $('popups'), overlay: $('overlay'), card: $('card') };
    this.last = {};
  }

  set(key, text) { // n'écrit dans le DOM que si la valeur change
    if (this.last[key] !== text) { this.last[key] = text; this.el[key].textContent = text; }
  }

  update({ score, car, timeLeft }) {
    this.set('score', fmt(score.banked));
    this.set('time', fmtTime(Math.max(timeLeft, 0)));
    this.set('speed', String(Math.round(car.speed / 10)));
    this.set('angle', String(Math.round(Math.abs(car.driftAngle) * 57.2958)));
    const chain = score.pending >= 1;
    this.el.chain.style.display = chain ? 'block' : 'none';
    if (chain) this.set('chain', `+${fmt(score.pending)}  ×${score.combo.toFixed(1)}${score.inGrace ? '  …' : ''}`);
  }

  popup({ text, kind }) {
    const d = document.createElement('div');
    d.className = `popup ${kind}`;
    d.textContent = text;
    this.el.popups.appendChild(d);
    setTimeout(() => d.remove(), 1200);
  }

  showStart(best) {
    this.el.card.innerHTML = `<h1>DRIFT ZONE</h1><p>Dérape, enchaîne, frôle les obstacles.<br>Un choc valide tes points mais remet le combo à zéro.</p>
      <p>Meilleur score : <b>${fmt(best)}</b></p><p class="cta">Appuie sur une touche pour démarrer</p>`;
    this.el.overlay.classList.remove('hidden');
  }

  showEnd(total, best, isBest) {
    this.el.card.innerHTML = `<h1>TEMPS ÉCOULÉ</h1><p class="big">${fmt(total)}</p><p>${isBest ? '<b>Nouveau record !</b>' : `Meilleur score : ${fmt(best)}`}</p>
      <p class="cta">R pour rejouer</p>`;
    this.el.overlay.classList.remove('hidden');
  }

  showPause() {
    this.el.card.innerHTML = '<h1>PAUSE</h1><p class="cta">Échap pour reprendre</p><p style="font-size:12px">M : couper / remettre le son</p>';
    this.el.overlay.classList.remove('hidden');
  }

  hideOverlay() {
    this.el.overlay.classList.add('hidden');
  }
}

// Tutoriel guidé du début de partie : une étape à la fois, validée automatiquement quand le joueur fait l'action.
// Étapes « info » : bouton Suivant ou touche N. Terminé ou passé : enregistré dans la carrière (economy.d.tuto).
const STEPS = [
  { t: 'Conduire la chargeuse', x: 'Avance avec <b>Z</b>, recule avec <b>S</b>, tourne avec <b>Q</b> et <b>D</b>. <b>Espace</b> = frein à main.', ok: (g, s) => g.active.moveDist - s.d0 > 10 },
  { t: 'Changer de vue', x: 'Appuie sur <b>C</b> : poursuite, éloignée, cabine. Clic + glisser tourne la caméra, la molette zoome.', ok: (g, s) => g.rig.view !== s.v0 },
  { t: 'Baisser le godet', x: 'Maintiens <b>A</b> pour baisser les bras jusqu’au sol. <b>E</b> les relève.', ok: (g) => g.active.tool.arm < 0.06 },
  { t: 'Ramasser du gravier', x: 'Le tas jaune clair est devant toi, à l’ouest. Godet au sol, <b>avance</b> dans le tas : le godet se remplit tout seul. Lis la jauge « Godet » en bas à gauche.', ok: (g) => g.active.cargo.vol > 1.5 },
  { t: 'Lever le godet', x: 'Pour rouler chargé, lève les bras avec <b>E</b>. Recule avec <b>S</b> pour sortir du tas.', ok: (g) => g.active.tool.arm > 0.45 && g.active.cargo.vol > 1 },
  { t: 'Charger un camion client', x: 'Un camion arrive sur la route à l’ouest (zone de chargement, voir la carte <b>M</b>). Place le godet <b>au-dessus de la benne</b>, puis maintiens <b>V</b> pour déverser. <b>X</b> referme le godet. Il faut environ 4 godets pour remplir un camion.', enter: (g) => { g.customers.timer = 0; }, ok: (g) => g.customers.list.some((t) => t.m.cargo.vol > 1) },
  { t: 'Camion plein : pesée et paiement', x: 'Continue de charger. Quand la benne est pleine, le camion passe à la pesée et tu es payé à la tonne (voir la commande en haut de l’écran).', ok: (g, s) => g.economy.d.trucks > s.trucks0 },
  { t: 'Changer d’engin', x: 'Appuie sur <b>2</b> (pelle), <b>3</b> (tombereau), <b>4</b> (bouteur), <b>5</b> (camion benne) ou clique l’icône en bas à droite. <b>F</b> près d’un autre engin y monte aussi.', ok: (g) => g.active.id !== 'loader' },
  { info: true, t: 'Creuser et transporter', x: '<b>Pelle</b> : ← → pivoter, ↑ ↓ balancier, A E flèche, X V godet : plonge le godet dans l’éboulis et ferme-le (X). Verse dans le <b>tombereau</b> (benne : A E). Le <b>bouteur</b> (lame A E) pousse les tas.' },
  { info: true, t: 'Le concasseur', x: 'Recule le tombereau jusqu’à la <b>trémie</b> bleue (ouverte vers l’est), lève la benne : la roche tombe dans le concasseur et ressort en gravier au bout du convoyeur. La roche brute est trop dure à creuser en place : il faut un tir de mine.' },
  { info: true, t: 'Tir de mine, carburant, atelier', x: '<b>F</b> à la cabine orange : tir de mine (250 €, tous les engins à plus de 35 m du front). <b>F</b> à la station-service : plein. <b>F</b> à l’atelier : réparation. <b>F</b> au pont-bascule avec le camion benne : vente directe.' },
  { info: true, t: 'À toi de jouer !', x: 'Remplis les commandes avant la fin du chrono pour toucher les primes, achète des améliorations dans le menu (Échap) et monte en grade. <b>I</b> affiche l’aide de l’engin actif.' },
];

export class Tutorial {
  constructor(game) {
    this.g = game; this.i = -1;
    this.el = document.createElement('div'); this.el.id = 'tuto'; document.getElementById('hud').append(this.el);
    this.el.addEventListener('click', (e) => { const a = e.target.closest('button')?.dataset.a; if (a === 'next') this.next(); if (a === 'skip') this.finish(); });
    if (!game.economy.d.tuto) this.start();
  }
  start() { this.i = -1; this.next(); }
  next() {
    this.i++; const s = STEPS[this.i], g = this.g;
    if (!s) return this.finish();
    this.s = { d0: g.active.moveDist, v0: g.rig.view, trucks0: g.economy.d.trucks }; s.enter?.(g); this.render(); g.audio.click();
  }
  finish() { this.i = -1; this.g.economy.d.tuto = true; this.g.economy.save(); this.el.style.display = 'none'; }
  render() {
    const s = STEPS[this.i]; this.el.style.display = 'block';
    this.el.innerHTML = `<div class="tk">Tutoriel · ${this.i + 1} / ${STEPS.length}</div><b>${s.t}</b><p>${s.x}</p><div class="tb">${s.info ? '<button data-a="next">Suivant (N)</button>' : '<small>Fais l’action pour continuer</small>'}<button data-a="skip" class="ghost">Passer le tutoriel</button></div>`;
  }
  update(inp) {
    if (this.i < 0) return;
    const s = STEPS[this.i];
    if (s.info ? inp.next : s.ok(this.g, this.s)) this.next();
  }
}

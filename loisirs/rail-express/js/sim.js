/* ═══════════════════════════════════════════════════════════
   SIMULATEUR TRAIN — SIMULATION
   Dynamique du train, frein pneumatique (RP / CG / CF),
   commandes et verrouillages, procédures, signalisation BAL,
   KVB, TVM, VACMA, répétition des signaux, trains bots.
   ═══════════════════════════════════════════════════════════ */
'use strict';

TS.Sim = (function () {
  const G = 9.81;
  let R, cfg, P, bots, opp, sigCache = {}, sigFrame = -1;
  const S = {};               // API publique
  let msgs = [];

  /* ══════════ Procédures par type d'engin ══════════ */
  function family() {
    const l = cfg.loco;
    if (l.kind === 'tgv') return 'tgv';
    if (l.kind === 'emu') return l.trac === 'diesel' ? 'emuD' : 'emuE';
    return l.trac === 'diesel' ? 'locoD' : 'locoE';
  }
  S.family = family;

  function buildProcedure() {
    const f = family(), pax = cfg.loco.cat === 'pax';
    const elec = cfg.loco.trac === 'elec';
    const lineKV = () => (R.voltAt(P.s) === 25000 ? '25' : '1,5');
    const st = [];
    const add = (ph, id, t, d, ok, ctl, opt) => st.push({ ph, id, t, d, ok, ctl, opt });
    const sticky = (key, fn) => () => P.flags[key] || (fn() && (P.flags[key] = true));

    add('Visite au sol', 'visite', 'Visite de préparation autour du train',
      'Roues, freins, suspensions, attelages et accouplements, absence d\'obstacle.', () => P.visite, 'visite');

    add('Prise de service', 'bat', 'Enclencher la batterie (BA)', 'Alimente les circuits de commande en 72 V.', () => P.bat, 'bat');
    add('Prise de service', 'key', f === 'tgv' ? 'Clé de commande : activer la cabine' : 'Insérer et tourner la clé de commande (BL)',
      'Déverrouille le pupitre de conduite.', () => P.key, 'key');
    if (f === 'emuE' || f === 'emuD') add('Prise de service', 'eas', 'Sélectionner le mode de conduite EAS', 'Équipement à agent seul : le conducteur gère les portes.', () => P.eas, 'eas');

    if (elec) {
      add('Mise sous tension', 'volt', () => 'Sélecteur de tension sur ' + lineKV() + ' kV', 'Doit correspondre à la caténaire (voltmètre ligne).',
        () => P.voltSel === R.voltAt(P.s), 'volt');
      add('Mise sous tension', 'panto', f === 'tgv' ? 'Lever le pantographe (motrice arrière)' : 'Lever le pantographe',
        'Le pantographe capte le courant de la caténaire.', () => P.panto >= 1, 'panto');
      add('Mise sous tension', 'dj', 'Fermer le disjoncteur principal (DJ)', 'Le voyant DJ s\'éteint quand il est fermé.', () => P.dj, 'dj');
      add('Mise sous tension', 'aux', f === 'tgv' ? 'Auxiliaires : convertisseurs et climatisation' : 'Ventilation des moteurs et auxiliaires',
        'Refroidissement des moteurs de traction.', () => P.aux, 'aux');
    } else {
      add('Mise en route moteur', 'fuel', 'Pompe à combustible (gazole) en service', 'Alimente l\'injection du moteur.', () => P.fuel, 'fuel');
      add('Mise en route moteur', 'pregr', 'Pré-graissage du moteur', 'Maintenir la pompe jusqu\'à pression d\'huile (6 s).', sticky('pregr', () => P.pregr >= 1), 'pregr');
      add('Mise en route moteur', 'start', f === 'emuD' ? 'Démarrer les groupes motopropulseurs' : 'Lancer le moteur diesel', 'Démarreur jusqu\'au ralenti.', () => P.engine === 'run', 'start');
      add('Mise en route moteur', 'oil', 'Contrôler la pression d\'huile (≥ 2 bar)', 'Manomètre huile moteur.', sticky('oil', () => P.engine === 'run' && P.oilP >= 2), null);
      if (f === 'locoD') add('Mise en route moteur', 'exc', 'Excitation de la génératrice principale', 'Autorise la traction électrique.', () => P.exc, 'exc');
      add('Mise en route moteur', 'warm', 'Chauffe moteur : eau ≥ 40 °C', 'Ne pas solliciter la puissance à froid.', sticky('warm', () => P.water >= 40), null);
    }
    const ph2 = elec ? 'Mise sous tension' : 'Mise en route moteur';
    add(ph2, 'cp', 'Mettre en marche les compresseurs (CP)', 'Remplit le réservoir principal.', () => P.cp, 'cp');
    add(ph2, 'rp', 'Attendre la pression RP ≥ 8 bar', 'Réservoir principal : air pour le freinage.', sticky('rp', () => P.rp >= 8), null);
    add(ph2, 'feux', 'Allumer les feux de tête', 'Feux blancs à l\'avant, feu rouge en queue.', () => P.feux, 'feux');

    add('Essais', 'cg', 'Robinet sur « Marche » : CG à 5 bar', 'Charge la conduite générale, freins desserrés.', sticky('cg', () => P.cg >= 4.85), 'brake');
    add('Essais', 'bt1', 'Essai de frein : serrage (CG ≤ 3,6 bar)', 'Robinet en serrage, contrôler la chute de CG et la montée des CF.', () => P.flags.bt1, 'brake');
    add('Essais', 'bt2', 'Essai de frein : desserrage (CG 5 bar)', 'Robinet sur Marche, contrôler le desserrage.', () => P.flags.bt2, 'brake');
    if (!pax) add('Essais', 'bt3', 'Essai complet : « Frein OK » de l\'agent de visite', 'L\'agent vérifie le serrage en queue de train.', () => P.flags.bt3, null);
    add('Essais', 'vacma', 'Essai de la veille automatique (VACMA)', 'Bouton Essai, puis appuyer sur la pédale (Espace) à l\'alarme.', () => P.flags.vacma, 'vacmatest');
    if (f === 'tgv') add('Essais', 'tvm', 'Essai de la signalisation de cabine TVM', 'Test de l\'afficheur et des codes.', () => P.flags.tvm, 'tvmtest');
    add('Essais', 'kvb', f === 'tgv' ? 'Saisie des données train (KVB)' : 'Saisie des paramètres KVB',
      'Type, vitesse limite et longueur : voir le bulletin de composition.', () => !!P.kvb, 'kvb');
    add('Essais', 'radio', 'Enregistrement radio GSM-R', 'Saisir le numéro du train.', () => P.radio, 'radio');

    add('Départ', 'rev', 'Inverseur sur « Avant »', 'Sens de marche.', () => P.rev === 1, 'rev');
    if (pax) {
      add('Départ', 'doors', f === 'emuE' || f === 'emuD' ? 'Fermer les portes depuis la cabine (EAS)' : 'Fermeture des portes : voyant fixité',
        'Toutes les portes fermées et verrouillées.', () => P.doorsLocked, 'doorsClose');
      if (f === 'emuE' || f === 'emuD') add('Départ', 'retro', 'Contrôler la rétrovision (caméras de quai)', 'Aucun voyageur engagé dans les portes.', () => P.retro, 'retro');
    }
    add('Départ', 'sig', 'Signal de sortie ouvert', 'Le carré doit présenter un feu permissif.', () => S.nextSigOpen(), null);
    add('Départ', 'auth', pax ? (f === 'emuE' || f === 'emuD' ? 'Heure de départ atteinte' : f === 'tgv' ? 'Signal de départ de l\'agent de quai (DA)' : 'Départ donné par le chef de bord (DA)') : 'Autorisation du régulateur (radio)',
      'Le voyant DA s\'allume.', () => P.auth, null);
    add('Départ', 'park', f === 'tgv' || f.startsWith('emu') ? 'Desserrer le frein de stationnement' : 'Desserrer le frein d\'immobilisation', 'Voyant frein de parc éteint.', () => !P.park, 'park');
    add('Départ', 'horn', 'Avertisseur sonore', 'Facultatif : prévenir avant la mise en mouvement.', () => P.flags.horn, 'horn', true);
    add('Départ', 'trac', 'Manipulateur de traction : démarrer en douceur', 'Augmenter progressivement la traction.', () => P.departed, 'manip');
    return st;
  }

  function stationProcedure() {
    const pax = cfg.loco.cat === 'pax', eas = family().startsWith('emu');
    const k = P.stopK;
    const St = k >= 0 ? R.stations[k] : null;
    const st = [];
    const add = (id, t, ok, ctl, opt) => st.push({ ph: St ? 'Arrêt à ' + St.name : 'Arrêt', id, t, ok, ctl, opt });
    add('arr', 'Arrêt au repère de la voie ' + (St ? St.ourNo : ''), () => P.stopK >= 0, null);
    if (pax) {
      add('open', 'Déverrouiller les portes côté quai (' + (St && St.ourPlatSide < 0 ? 'gauche' : 'droite') + ')', () => P.flags.opened, St && St.ourPlatSide < 0 ? 'doorsL' : 'doorsR');
      add('board', 'Échange des voyageurs', () => P.flags.opened && S.time >= P.boardEnd, null);
      add('close', 'Fermer les portes : voyant fixité', () => P.doorsLocked && P.flags.opened, 'doorsClose');
      if (eas) add('retro', 'Contrôler la rétrovision', () => P.retro, 'retro');
    }
    add('sig', 'Signal de sortie ouvert', () => S.nextSigOpen(), null);
    add('auth', 'Autorisation de départ', () => P.auth, null);
    add('trac', 'Traction : repartir', () => false, 'manip');
    return st;
  }

  /* ══════════ Initialisation ══════════ */
  S.init = function (config, route) {
    cfg = config; R = route; msgs = [];
    const St0 = R.stations[0];
    const elec = cfg.loco.trac === 'elec';
    P = S.P = {
      s: St0.headStop, v: 0, a: 0, len: cfg.trainLen, mass: cfg.mass * 1000,
      path: { side: -1, pick: R.stations.map(x => x.our) },
      cg: 0, cf: 0, rp: 0.4, bat: false, key: false, eas: false, rev: 0,
      voltSel: R.voltAt(St0.headStop) === 25000 ? 1500 : 25000,
      pantoCmd: false, panto: 0, dj: false, cp: false, aux: false, feux: false, park: true,
      manip: 0, brake: 1, fu: false, fuReason: '',
      fuel: false, pregr: 0, pregrOn: false, engine: 'off', crank: 0, rpm: 0, oilP: 0, water: 16, exc: false,
      visite: false, kvb: null, radio: false, flags: {}, retro: false,
      doorsOpen: cfg.loco.cat === 'pax', doorSide: St0.ourPlatSide, doorsLocked: cfg.loco.cat !== 'pax', doorT: 0,
      auth: false, authT: 0, departed: false,
      vacT: 0, vacAlarm: false, vacTest: 0, vacTestT: 0, tvmTest: 0,
      rs: 0, kvbCurve: null, tvmCode: null, tvmPrev: null,
      stopK: 0, nextStop: 1, boardEnd: St0.dep - 120, exitOpen: {}, arrived: {},
      nextSig: 0, overT: 0, slip: false, amps: 0, tracForce: 0,
      score: 1000, log: [], stats: { dist: 0, maxV: 0, stops: [], fu: 0, sigs: 0 },
      finished: false, shortWarn: 0, lastLimit: 0,
    };
    // pas de courant si diesel
    if (!elec) P.voltSel = 0;
    S.time = cfg.startTime;
    S.timeScale = 1;
    S.proc = buildProcedure();
    // index du prochain signal
    while (P.nextSig < R.signals.length && R.signals[P.nextSig].s < P.s) P.nextSig++;
    initBots();
    say('Prise de service à ' + St0.name + ' — départ prévu à ' + TS.fmtTime(St0.dep) + ', voie ' + St0.ourNo + '.', 'info');
  };

  function say(t, kind) { msgs.push({ t, kind: kind || 'info', at: S.time }); if (msgs.length > 40) msgs.shift(); S.onMsg && S.onMsg(t, kind || 'info'); }
  S.say = say;
  S.messages = () => msgs;
  function penal(pts, t) {
    P.score -= pts;
    P.log.push({ t: S.time, txt: t, pts: -pts });
    say(t + (pts ? ' (−' + pts + ')' : ''), 'bad');
  }
  function bonus(pts, t) { P.score += pts; P.log.push({ t: S.time, txt: t, pts }); }
  function sound(n, a) { TS.Audio && TS.Audio.fx(n, a); }

  /* ══════════ Commandes ══════════ */
  const need = (c, m) => { if (!c) { say(m, 'warn'); sound('refus'); } return c; };
  S.cmd = function (id, val) {
    const elec = cfg.loco.trac === 'elec';
    switch (id) {
      case 'bat': P.bat = !P.bat; if (!P.bat) { P.key = false; P.dj = false; P.pantoCmd = false; P.cp = false; P.feux = false; P.aux = false; if (P.engine !== 'off') P.engine = 'off'; } sound('switch'); break;
      case 'key': if (need(P.bat, 'Batterie hors service : clé sans effet.')) { P.key = !P.key; if (!P.key) { P.rev = 0; } sound('key'); } break;
      case 'eas': if (need(P.key, 'Clé de commande non activée.')) { P.eas = !P.eas; sound('switch'); } break;
      case 'volt':
        if (!need(P.key, 'Clé de commande non activée.')) break;
        if (!need(!P.dj, 'Ouvrir le DJ avant de changer de tension.')) break;
        P.voltSel = P.voltSel === 25000 ? 1500 : 25000; sound('switch'); break;
      case 'panto':
        if (!need(P.key, 'Clé de commande non activée.')) break;
        P.pantoCmd = !P.pantoCmd; if (!P.pantoCmd && P.dj) { P.dj = false; say('Pantographe baissé : DJ ouvert.', 'warn'); } sound('switch'); break;
      case 'dj':
        if (!need(P.key, 'Clé de commande non activée.')) break;
        if (P.dj) { P.dj = false; sound('dj'); break; }
        if (!need(P.panto >= 1, 'Pantographe non levé : pas de tension ligne.')) break;
        if (!need(!R.inNeutral(P.s), 'Section de séparation : fermeture du DJ impossible.')) break;
        if (!need(P.voltSel === R.voltAt(P.s), 'Tension sélectionnée incorrecte : le DJ refuse de fermer.')) break;
        P.dj = true; sound('dj'); break;
      case 'cp':
        if (!need(P.key, 'Clé de commande non activée.')) break;
        if (!P.cp && !need(elec ? P.dj : P.engine === 'run', elec ? 'DJ ouvert : compresseurs non alimentés.' : 'Moteur arrêté : compresseur non entraîné.')) break;
        P.cp = !P.cp; sound('switch'); break;
      case 'aux':
        if (!need(P.key, 'Clé de commande non activée.')) break;
        if (!P.aux && !need(P.dj, 'DJ ouvert : auxiliaires non alimentés.')) break;
        P.aux = !P.aux; sound('switch'); break;
      case 'feux': if (need(P.bat, 'Batterie hors service.')) { P.feux = !P.feux; sound('switch'); } break;
      case 'fuel': if (need(P.key, 'Clé de commande non activée.')) { P.fuel = !P.fuel; if (!P.fuel && P.engine === 'run') { P.engine = 'off'; say('Pompe à gazole coupée : moteur calé.', 'warn'); } sound('switch'); } break;
      case 'pregr': if (need(P.key, 'Clé de commande non activée.')) { P.pregrOn = !!val; } break;
      case 'start':
        if (P.engine === 'run') { P.engine = 'off'; sound('switch'); say('Moteur arrêté.'); break; }
        if (!need(P.key, 'Clé de commande non activée.')) break;
        if (!need(P.fuel, 'Pompe à combustible arrêtée.')) break;
        if (!need(P.flags.pregr || P.pregr >= 1, 'Pré-graissage non effectué : démarrage refusé.')) break;
        P.engine = 'crank'; P.crank = 0; sound('crank'); break;
      case 'exc': if (need(P.engine === 'run', 'Moteur arrêté.')) { P.exc = !P.exc; sound('switch'); } break;
      case 'rev':
        if (!need(P.key, 'Clé de commande non activée.')) break;
        if (!need(P.v < 0.3, 'Inverseur : arrêt complet obligatoire.')) break;
        P.rev = val !== undefined ? val : (P.rev === 1 ? 0 : 1); sound('switch'); break;
      case 'manip': P.manip = TS.clamp(val, (cfg.loco.eb ? -1 : 0), 1); break;
      case 'manipStep': P.manip = TS.clamp(Math.round((P.manip + val) * 10) / 10, (cfg.loco.eb ? -1 : 0), 1); sound('notch'); break;
      case 'brake': {
        const nb = TS.clamp(val, 0, TS.BRAKE_POS.length - 1);
        if (nb !== P.brake) { P.brake = nb; sound('notch'); }
        break;
      }
      case 'brakeStep': S.cmd('brake', P.brake + val); break;
      case 'park': P.park = !P.park; sound('park'); break;
      case 'horn': if (need(P.rp > 3, 'Pression d\'air insuffisante pour l\'avertisseur.')) { sound('horn', val); P.flags.horn = true; } break;
      case 'acq':
        if (P.rs > 0) { P.rs = 0; sound('acq'); }
        break;
      case 'vacma':
        P.vacT = 0;
        if (P.vacAlarm) P.vacAlarm = false;
        if (P.vacTest === 2) { P.vacTest = 0; P.flags.vacma = true; say('Essai VACMA satisfaisant.', 'ok'); }
        break;
      case 'vacmatest':
        if (!need(P.key, 'Clé de commande non activée.')) break;
        if (!need(P.v < 0.1, 'Essai VACMA à l\'arrêt uniquement.')) break;
        P.vacTest = 1; P.vacTestT = 0; say('Essai VACMA : relâchez la pédale, l\'alarme va retentir…'); sound('switch'); break;
      case 'tvmtest':
        if (!need(P.key, 'Clé de commande non activée.')) break;
        P.tvmTest = 3; sound('switch'); break;
      case 'urg': fu('Freinage d\'urgence commandé par le conducteur', 0); break;
      case 'rearm':
        if (!P.fu) break;
        if (!need(P.v < 0.1, 'Réarmement impossible en mouvement.')) break;
        P.fu = false; P.fuReason = ''; P.flags.afterFu = true; if (P.brake === TS.BRAKE_POS.length - 1) P.brake = 1;
        say('FU réarmé : robinet sur « Marche » (MAR), attendez CG 5 bar puis repartez.', 'ok'); sound('acq'); break;
      case 'doorsL': case 'doorsR': {
        if (cfg.loco.cat !== 'pax') break;
        const side = id === 'doorsL' ? -1 : 1;
        if (!need(P.v < 0.1, 'Train en mouvement : ouverture interdite.')) break;
        const k = P.stopK;
        if (!need(k >= 0, 'Hors quai : ouverture des portes interdite.')) break;
        if (P.doorsOpen) break;
        const St = R.stations[k];
        if (St.ourPlatSide !== side) { penal(40, 'Ouverture des portes côté voie !'); break; }
        P.doorsOpen = true; P.doorsLocked = false; P.doorSide = side; P.retro = false; P.flags.opened = true;
        P.auth = false;
        if (P.boardEnd < S.time) P.boardEnd = S.time + (St.big ? 55 : 35);
        sound('doorsopen');
        break;
      }
      case 'doorsClose':
        if (cfg.loco.cat !== 'pax' || !P.doorsOpen) break;
        if (!need(S.time >= P.boardEnd - 2, 'Échange voyageurs en cours : fermeture possible à ' + TS.fmtTime(P.boardEnd, true) +
          ' (dans ' + Math.ceil(P.boardEnd - S.time) + ' s). Attendez, ou accélérez le temps (×5 / ×10).')) break;
        P.doorsOpen = false; P.doorT = 3.5; sound('doorsclose'); break;
      case 'retro': if (need(!P.doorsOpen, 'Portes ouvertes.')) { P.retro = true; sound('switch'); say('Rétrovision : quai dégagé.', 'ok'); } break;
      case 'visite': P.visite = true; break;
      case 'kvb': P.kvb = val; say('KVB initialisé : ' + val.type + ' — V ' + val.v + ' km/h — L ' + val.len + ' m.', 'ok'); sound('bip'); break;
      case 'radio': P.radio = true; say('GSM-R : train ' + cfg.number + ' enregistré.', 'ok'); sound('bip'); break;
    }
  };

  function fu(reason, pts) {
    if (P.fu) return;
    P.fu = true; P.fuReason = reason; P.stats.fu++;
    sound('fu');
    if (pts) penal(pts, reason); else say(reason, 'bad');
  }

  /* ══════════ Signalisation ══════════ */
  // trains (joueur + bots) pour l'occupation des cantons
  function trainsFor() { return [P].concat(bots.filter(b => b.state !== 'gone')); }
  function trackAt(T, k) { return T === P ? P.path.pick[k] : (T.pick[k] || 0); }
  function blockFree(j, T) {
    const g = R.signals[j];
    const a = g.s, b = j + 1 < R.signals.length ? R.signals[j + 1].s : R.len + 100;
    for (const O of trainsFor()) {
      if (O === T) continue;
      const o1 = O.s, o0 = O.s - O.len;
      if (o1 < a || o0 > b) continue;
      // en gare : voies différentes ⇒ pas de conflit
      if (g.type === 'CE') {
        const k = g.st;
        if (trackAt(O, k) !== trackAt(T, k)) continue;
      }
      if (g.type === 'D' && o0 > R.stations[g.st].ceS) {
        const k = g.st;
        if (trackAt(O, k) !== trackAt(T, k)) continue;
      }
      return false;
    }
    // canton de sortie : le train arrêté sur une autre voie de la gare n'occupe pas
    return true;
  }
  function exitClosed(g, T) {
    const k = g.st;
    if (T === P) {
      const St = R.stations[k];
      if (!St.stop) return false;
      return !P.exitOpen[k];
    }
    if (T.stopAt && T.stopAt[k] && !(T.departed && T.departed[k])) return true;
    return false;
  }
  function aspect(j, T, depth) {
    const g = R.signals[j];
    if (!g) return 'VL';
    if (g.type === 'CS' && exitClosed(g, T)) return 'C';
    if (!blockFree(j, T)) return (g.type === 'CE' || g.type === 'CS') ? 'C' : 'S';
    let nx = 'VL';
    if (depth < 1) nx = j + 1 < R.signals.length ? aspect(j + 1, T, depth + 1) : 'C';
    else if (j + 1 >= R.signals.length) nx = 'C';
    else {
      const g2 = R.signals[j + 1];
      if (g2.type === 'CS' && exitClosed(g2, T)) nx = 'C';
      else if (!blockFree(j + 1, T)) nx = 'S';
    }
    let stopNext = nx === 'S' || nx === 'C';
    // préavertissement : canton suivant trop court pour freiner
    if (!stopNext && nx === 'A' && depth === 0 && j + 2 < R.signals.length && R.signals[j + 2].s - R.signals[j + 1].s < 1300) stopNext = true;
    if (T === P) {
      const dev = g.st !== undefined && P.path.pick[g.st] > 0;
      if (g.type === 'CE' && dev) return stopNext ? 'A_RR' : 'RR';
      if (g.type === 'D' && dev && !stopNext) return 'R';
    }
    // butoir du terminus
    if (g.type === 'CE' && R.stations[g.st].last) return dev2(T, g) ? 'A_RR' : 'A';
    return stopNext ? 'A' : 'VL';
  }
  function dev2(T, g) { return T === P && P.path.pick[g.st] > 0; }
  S.aspect = function (j) {
    if (sigFrame !== S.frame) { sigCache = {}; sigFrame = S.frame; }
    if (sigCache[j] === undefined) sigCache[j] = aspect(j, P, 0);
    return sigCache[j];
  };
  S.isStop = a => a === 'S' || a === 'C';
  S.nextSigOpen = function () {
    const j = P.nextSig;
    if (j >= R.signals.length) return true;
    return !S.isStop(S.aspect(j));
  };
  // codes TVM : nombre de cantons libres devant
  function tvmCode() {
    let j = P.nextSig, free = 0;
    const vmax = (R.lgv.find(z => P.s >= z.s0 && P.s <= z.s1) || { v: 300 }).v;
    for (let k = 0; k < 6 && j + k < R.signals.length; k++) {
      const g = R.signals[j + k];
      if (S.isStop(S.aspect(j + k)) || !g.tvm && k > 0 && g.type !== 'B') break;
      free++;
    }
    const codes = [0, 80, 160, 220, 270, vmax];
    return codes[Math.min(free, 5)];
  }

  /* ══════════ Bots ══════════ */
  function initBots() {
    bots = []; opp = [];
    const rnd = TS.rng(cfg.seed + 77);
    const pax = cfg.loco.cat === 'pax';
    const St = R.stations;
    const pickSide = (k, used) => {
      const nl = St[k].left.length;
      const ours = P.path.pick[k];
      const cand = []; for (let t = 0; t < nl; t++) if (t !== ours && !used.includes(t)) cand.push(t);
      return cand.length ? cand[Math.floor(rnd() * cand.length)] : null;
    };
    const used = St.map(() => []);
    const mkBot = (k0, tDep, typeId) => {
      const ty = TS.BOT_TYPES[typeId];
      const t0 = pickSide(k0, used[k0]);
      if (t0 === null) return;
      // gare d'arrivée du bot : une gare suivante avec une voie libre
      let kEnd = -1;
      for (let k = k0 + 1; k < St.length - 1; k++) {
        if (St[k].s - St[k0].s < 15000) continue;
        if (St[k].left.length > 1 && (rnd() < 0.7 || St[k].s - St[k0].s > 80000)) { kEnd = k; break; }
      }
      if (kEnd < 0) return;
      const pick = [], stopAt = {};
      for (let k = 0; k < St.length; k++) pick[k] = 0;
      pick[k0] = t0; used[k0].push(t0);
      const te = pickSide(kEnd, used[kEnd]); if (te === null) return;
      pick[kEnd] = te; used[kEnd].push(te); stopAt[kEnd] = true;
      for (let k = k0 + 1; k < kEnd; k++) if (ty.stops && St[k].stop) { const t = pickSide(k, used[k]); pick[k] = t === null ? 0 : t; stopAt[k] = true; }
      const b = {
        id: bots.length, type: typeId, ty, len: ty.len, vmax: ty.vmax, s: St[k0].headStop, v: 0,
        pick, stopAt, departed: {}, k0, kEnd, tDep, state: 'wait', dwellUntil: 0, curStop: k0,
        number: (typeId.startsWith('fret') ? 'Fret ' : ty.name + ' ') + (40000 + Math.floor(rnd() * 9000)),
      };
      b.stopAt[k0] = true;
      b.path = { side: -1, pick };
      bots.push(b);
    };
    // un train part juste avant nous
    const t0 = St[0].dep - (180 + rnd() * 240);
    mkBot(0, t0, pax ? (cfg.loco.kind === 'tgv' ? 'tgv' : rnd() < 0.5 ? 'ter' : 'fret') : 'fretc');
    // trains rencontrés plus loin
    const total = R.len;
    for (let k = 1; k < St.length - 1; k++) {
      if (St[k].left.length < 2) continue;
      if (rnd() > Math.min(0.85, (St[k].s - St[k - 1].s) / 140000 + 0.25)) continue;
      const eta = St[k].arr || St[k].dep;
      const types = R.isLGV(St[k].s + 8000) ? ['tgv'] : pax ? ['ter', 'ic', 'fret'] : ['fret', 'fretc', 'ter'];
      mkBot(k, eta - (200 + rnd() * 420), types[Math.floor(rnd() * types.length)]);
    }
    S.bots = bots; S.opp = opp;
    S.oppT = 30;
  }

  function botStep(b, dt) {
    if (b.state === 'parked' || b.state === 'gone') return;
    const St = R.stations;
    if (b.state === 'wait' || b.state === 'dwell') {
      if (b.state === 'dwell' && S.time < b.dwellUntil) return;
      if (b.state === 'wait' && S.time < b.tDep) return;
      // départ sur signal ouvert
      b.departed[b.curStop] = true;
      const j = sigIndexAfter(b.s);
      if (j < R.signals.length && S.isStop(aspect(j, b, 0)) && R.signals[j].s - b.s < 60) { b.departed[b.curStop] = false; return; }
      b.state = 'run';
    }
    // cible d'arrêt
    let target = Infinity, isStation = false;
    for (let k = b.curStop + 1; k <= b.kEnd; k++) if (b.stopAt[k]) { target = St[k].headStop; isStation = k; break; }
    const j = sigIndexAfter(b.s + 0.5);
    if (j < R.signals.length) {
      const g = R.signals[j];
      if (g.s < target && S.isStop(aspect(j, b, 0))) { target = g.s - 20; isStation = false; }
    }
    const lim = Math.min(b.vmax, R.limitAt(b.s)) / 3.6;
    const d = target - b.s;
    const vAllow = Math.sqrt(2 * 0.45 * Math.max(0, d - 1));
    const vt = Math.min(lim, vAllow);
    if (b.v < vt) b.v = Math.min(vt, b.v + (b.ty.vmax > 200 ? 0.45 : b.type.startsWith('fret') ? 0.18 : 0.35) * dt);
    else b.v = Math.max(vt, b.v - 0.9 * dt);
    b.s += b.v * dt;
    if (d < 3 && b.v < 0.2) {
      b.v = 0;
      if (isStation !== false) {
        b.curStop = isStation;
        if (isStation === b.kEnd) b.state = 'parked';
        else { b.state = 'dwell'; b.dwellUntil = S.time + 50; }
      }
    }
  }
  function sigIndexAfter(q) {
    let lo = 0, hi = R.signals.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (R.signals[m].s < q) lo = m + 1; else hi = m; }
    return lo;
  }

  function oppStep(dt) {
    S.oppT -= dt;
    if (S.oppT <= 0 && opp.length < 3) {
      const r = Math.random();
      const pax = cfg.loco.cat === 'pax';
      const ids = ['ter', 'ic', 'fret', 'fretc', 'tgv'];
      let t = ids[Math.floor(Math.random() * ids.length)];
      if (t === 'tgv' && !R.isLGV(P.s + 5000)) t = 'ic';
      const ty = TS.BOT_TYPES[t];
      opp.push({ type: t, ty, len: ty.len, s: P.s + 3500 + r * 4000, v: (ty.vmax * (0.6 + Math.random() * 0.35)) / 3.6, id: 'o' + Math.random() });
      S.oppT = 90 + Math.random() * 300;
    }
    for (const o of opp) {
      const lim = Math.min(o.ty.vmax, R.limitAt(o.s)) / 3.6;
      o.v += TS.clamp(lim - o.v, -0.8 * dt, 0.3 * dt);
      o.s -= o.v * dt;
    }
    for (let i = opp.length - 1; i >= 0; i--) if (opp[i].s + opp[i].len < P.s - 1500 || opp[i].s < 0) opp.splice(i, 1);
  }

  /* ══════════ Pas de simulation ══════════ */
  S.step = function (dt) {
    if (P.finished) return;
    S.time += dt;
    const elec = cfg.loco.trac === 'elec';
    const pax = cfg.loco.cat === 'pax';
    const St = R.stations;

    /* ── Équipements ── */
    // pantographe
    const pTarget = P.pantoCmd && P.key && P.bat ? 1 : 0;
    P.panto += TS.clamp(pTarget - P.panto, -dt / 1.5, dt / 5);
    const lineV = elec && P.panto >= 1 && !R.inNeutral(P.s) ? R.voltAt(P.s) : 0;
    P.lineV = elec && P.panto >= 0.98 ? (R.inNeutral(P.s) ? 0 : R.voltAt(P.s)) : 0;
    if (P.dj && elec) {
      if (P.panto < 1) { P.dj = false; }
      else if (R.inNeutral(P.s)) {
        P.dj = false;
        penal(60, 'Section de séparation franchie DJ fermé : disjonction');
        sound('dj');
      } else if (P.voltSel !== R.voltAt(P.s)) { P.dj = false; penal(40, 'Tension ligne incompatible : DJ déclenché'); }
    }
    if (!P.dj && elec) { if (P.aux) P.aux = false; }
    // diesel
    if (!elec) {
      if (P.pregrOn && P.key) P.pregr = Math.min(1, P.pregr + dt / 6);
      else if (P.engine !== 'run') P.pregr = Math.max(0, P.pregr - dt / 60);
      if (P.engine === 'crank') {
        P.crank += dt; P.rpm = 150 + P.crank * 160;
        if (P.crank > 3.2) { P.engine = 'run'; say('Moteur au ralenti.', 'ok'); }
      } else if (P.engine === 'run') {
        if (!P.fuel || !P.key) { P.engine = 'off'; }
        const tgt = 600 + Math.max(0, P.manip) * 900 * (P.rev ? 1 : 0.3);
        P.rpm += (tgt - P.rpm) * Math.min(1, dt * 0.8);
        P.water = Math.min(78, P.water + dt * (0.55 + Math.max(0, P.manip) * 0.4));
      } else { P.rpm = Math.max(0, P.rpm - dt * 400); P.water = Math.max(16, P.water - dt * 0.02); }
      P.oilP = P.engine === 'run' ? 2 + P.rpm / 600 : P.engine === 'crank' ? 1 : P.pregr * 1.2;
      if (P.engine !== 'run') P.exc = false;
    }
    const power = elec ? P.dj && lineV > 0 : P.engine === 'run';
    if (P.cp && !power) { P.cp = elec ? false : P.cp; }

    /* ── Air : RP, CG, CF ── */
    if (P.cp && power) {
      if (P.rp < 9 && !(P.cpIdle)) P.rp = Math.min(9, P.rp + dt * 0.24);
      if (P.rp >= 9) P.cpIdle = true;
      if (P.rp < 8) P.cpIdle = false;
      P.cpRun = !P.cpIdle;
    } else P.cpRun = false;
    const pos = TS.BRAKE_POS[P.brake];
    let tgt = pos.cg;
    if (P.fu) tgt = 0;
    if (tgt > P.rp - 0.3) tgt = Math.max(0, P.rp - 0.3);
    const lenF = TS.clamp(420 / P.len, 0.25, 1.4);
    const prevCg = P.cg;
    if (P.cg < tgt) {
      const rate = (pos.k === 'DES' ? 0.9 : 0.32) * lenF;
      const dcg = Math.min(tgt - P.cg, rate * dt);
      P.cg += dcg; P.rp -= dcg * 0.35;
    } else if (P.cg > tgt) {
      const rate = (pos.k === 'URG' || P.fu) ? 3 : 0.55;
      P.cg = Math.max(tgt, P.cg - rate * dt);
    }
    // surcharge : redescend lentement vers 5 bar en Marche
    if (pos.k === 'MAR' && P.cg > 5.02 && !P.fu) P.cg = Math.max(5, P.cg - dt * 0.03);
    P.cgDrop = (prevCg - P.cg) / dt;
    if (P.rp < 0) P.rp = 0;
    let cfT = TS.clamp((5 - P.cg) * 2.53, 0, 3.8);
    if (P.cg < 2.5) cfT = 3.8 * 1.08;
    cfT = Math.min(cfT, P.rp * 0.62 + (P.cf > 0 ? 0 : 0));
    const fret = cfg.loco.cat === 'fret';
    if (P.cf < cfT) P.cf = Math.min(cfT, P.cf + dt * (fret ? 0.18 : 0.9));
    else P.cf = Math.max(cfT, P.cf - dt * (fret ? 0.09 : 0.45));
    // essais de frein
    if (P.cg >= 4.85) { P.flags.cgCharged = true; P.flags.afterFu = false; }
    if (P.v < 0.1 && P.flags.cgCharged && P.cg <= 3.65 && !P.flags.bt1) { P.flags.bt1 = true; say('Essai de frein : serrage constaté, CF ' + P.cf.toFixed(1) + ' bar.', 'ok'); }
    if (P.flags.bt1 && !P.flags.bt2 && P.cg >= 4.85 && P.cf < 0.3) {
      P.flags.bt2 = true; say('Essai de frein : desserrage constaté.', 'ok');
      if (fret) setTimeout(() => { if (P) { P.flags.bt3 = true; say('Agent de visite (radio) : « Essai de frein complet satisfaisant, frein OK en queue. »', 'ok'); sound('bip'); } }, 4000 / Math.max(1, S.timeScale));
    }

    /* ── Portes ── */
    if (P.doorT > 0) { P.doorT -= dt; if (P.doorT <= 0) { P.doorsLocked = true; sound('lock'); } }

    /* ── Gare : ouverture du signal de sortie et autorisation ── */
    if (P.stopK >= 0) {
      const k = P.stopK, Sk = St[k];
      if (!Sk.last && !P.exitOpen[k]) {
        const boardOK = !pax || (P.flags.opened || k === 0) && S.time >= P.boardEnd;
        if (boardOK && S.time >= Sk.dep - 45) { P.exitOpen[k] = true; }
      }
      if (P.exitOpen[k] && !P.auth && S.nextSigOpen()) {
        const eas = family().startsWith('emu');
        const onTime = S.time >= Sk.dep - 10;
        if (!pax) {
          P.authT += dt;
          if (P.authT > 3 && onTime) { P.auth = true; say('Régulateur (GSM-R) : « Train ' + cfg.number + ', départ autorisé. »', 'ok'); sound('bip'); }
        } else if (P.doorsLocked && (!eas || P.retro)) {
          P.authT += dt;
          if (eas) { if (S.time >= Sk.dep - 5) { P.auth = true; say('Heure de départ : départ autorisé (EAS).', 'ok'); sound('bip'); } }
          else if (P.authT > 3.5 && onTime) { P.auth = true; sound('whistle'); say(cfg.loco.kind === 'tgv' ? 'Agent de quai : signal de départ (DA).' : 'Chef de bord : départ ! (DA)', 'ok'); }
        } else P.authT = 0;
      }
    }

    /* ── VACMA ── */
    // VACMA et répétition des signaux : minuteries en temps réel (indépendantes de l'accélération du temps)
    const rdt = dt / Math.max(1, S.timeScale);
    if (P.vacTest === 1) { P.vacTestT += rdt; if (P.vacTestT > 2.5) { P.vacTest = 2; P.vacTestT = 0; } }
    else if (P.vacTest === 2) { P.vacTestT += rdt; if (P.vacTestT > 4) { P.vacTest = 0; fu('Essai VACMA : pédale non actionnée', 0); } }
    if (P.key && P.v > 1) {
      P.vacT += rdt;
      if (P.vacT > 55 && !P.vacAlarm) { P.vacAlarm = true; }
      if (P.vacT > 59) { P.vacT = 0; P.vacAlarm = false; fu('VACMA : veille non acquittée', 50); }
    } else { P.vacT = 0; P.vacAlarm = false; }
    if (P.tvmTest > 0) { P.tvmTest -= dt; if (P.tvmTest <= 0) { P.flags.tvm = true; say('Essai TVM satisfaisant.', 'ok'); } }

    /* ── Traction ── */
    const L = cfg.loco;
    let trac = 0, ebrake = 0, why = '';
    const engineOK = elec ? (P.dj && lineV > 0 && P.aux) : (P.engine === 'run' && (L.kind !== 'loco' || P.exc));
    if (!engineOK) why = elec ? (!P.dj ? 'DJ ouvert' : !P.aux ? 'Auxiliaires hors service' : 'Pas de tension') : (P.engine !== 'run' ? 'Moteur arrêté' : 'Excitation coupée');
    else if (P.rev !== 1) why = 'Inverseur au neutre';
    else if (P.fu) why = 'FU actif';
    else if (P.cg < 4.6) why = 'Freins serrés (CG < 4,6 bar)';
    else if (P.park) why = 'Frein d\'immobilisation serré';
    else if (pax && !P.doorsLocked) why = 'Portes non verrouillées';
    else if (!P.kvb) why = 'KVB non initialisé';
    P.tracWhy = why;
    const v = P.v;
    if (P.manip > 0.01) {
      if (!why) {
        let pw = L.power * 1000 * P.manip;
        let fm = L.fmax * 1000 * P.manip;
        if (!elec) { const k = TS.clamp((P.rpm - 550) / 900, 0.1, 1); pw *= k; if (P.water < 40) pw *= 0.4; }
        trac = Math.min(fm, pw / Math.max(v, 0.5));
        // adhérence
        const adh = cfg.adhMass * 1000 * G * (0.3 - Math.min(0.1, v / 400));
        P.slip = trac > adh;
        if (P.slip) trac = adh * 0.75;
      } else if ((P.lastWhy !== why) && S.time - (P.whyT || -99) > 6) { P.whyT = S.time; say('Traction impossible : ' + why + '.', 'warn'); }
    } else P.slip = false;
    P.lastWhy = P.manip > 0.01 ? why : '';
    if (P.manip < -0.01 && L.eb && v > 1.5 && (elec ? P.dj : true)) {
      ebrake = Math.min(L.eb * 1000, (L.power * 800) / v) * -P.manip;
    }
    P.tracForce = trac; P.ebForce = ebrake;
    P.amps = elec ? (trac * v + ebrake * v * 0.6) / Math.max(1, lineV || 1500) * (lineV === 25000 ? 1 : 0.9) : 0;
    if (elec && lineV === 25000) P.amps *= 3;

    /* ── Dynamique ── */
    const M = P.mass;
    const vk = v * 3.6;
    const resist = M / 1000 * 10 * (fret ? 1.2 + vk * vk / 2600 : 1.5 + vk * vk / 4500);
    const grade = R.grade(P.s - P.len / 2);
    const gF = M * G * grade;
    const decel = cfg.brakeDecel;
    let bF = P.cf / 3.8 * M * decel;
    if (P.park) bF += M * 0.5;
    let F = trac - gF;
    const opp_ = resist + bF + ebrake;
    let acc;
    if (v < 0.01 && Math.abs(F) <= opp_) { acc = 0; P.v = 0; }
    else {
      acc = (F - Math.sign(v > 0.01 ? 1 : Math.sign(F)) * opp_) / (M * 1.06);
      P.v += acc * dt;
      if (P.v < 0) P.v = 0;
    }
    P.a = acc;
    const ds = P.v * dt;
    P.s += ds;
    P.stats.dist += ds;
    if (P.v * 3.6 > P.stats.maxV) P.stats.maxV = P.v * 3.6;
    if (P.park && P.v > 1) { if (!P.flags.parkWarn) { P.flags.parkWarn = true; penal(30, 'Circulation frein d\'immobilisation serré'); } }

    // butoir
    if (P.s > R.end) {
      P.s = R.end; if (P.v > 1.5) penal(200, 'Heurt du butoir à ' + Math.round(P.v * 3.6) + ' km/h'); P.v = 0;
    }

    /* ── Départ ── */
    if (P.v > 0.3 && P.stopK >= 0 && !St[P.stopK].last) {
      const k = P.stopK, Sk = St[k];
      if (!P.auth) penal(80, 'Départ sans autorisation');
      if (S.time < Sk.dep - 20) penal(30, 'Départ anticipé de ' + Math.round(Sk.dep - S.time) + ' s');
      if (pax && k > 0 && !P.flags.opened) penal(60, 'Voyageurs non desservis à ' + Sk.name);
      if (!P.departed) {
        P.departed = true;
        if (!P.flags.bt2) penal(80, 'Départ sans essai de frein');
        if (!P.flags.vacma) penal(30, 'Essai VACMA non réalisé');
        if (!P.radio) penal(20, 'Train non enregistré en radio GSM-R');
        if (!P.feux) penal(20, 'Feux de tête éteints');
        if (!P.visite) penal(40, 'Visite au sol non réalisée');
        if (cfg.loco.kind === 'tgv' && !P.flags.tvm) penal(20, 'Essai TVM non réalisé');
      }
      S.proc = null;
      const late = S.time - Sk.dep;
      P.stats.stops.push({ name: Sk.name, kind: 'dep', delay: late });
      P.stopK = -1; P.auth = false; P.authT = 0; P.retro = false;
      P.flags.opened = false;
      say('Départ de ' + Sk.name + (Math.abs(late) > 60 ? ' (' + (late > 0 ? '+' : '') + Math.round(late / 60) + ' min)' : ' à l\'heure') + '.', 'info');
    }

    /* ── Arrivée en gare ── */
    const nk = P.nextStop;
    if (nk < St.length) {
      const Sk = St[nk];
      if (!Sk.stop) { if (P.s > Sk.zoneEnd) P.nextStop++; }
      else {
        const d = P.s - Sk.headStop;
        if (P.v < 0.05 && d > -45 && P.stopK < 0 && P.s > Sk.zoneStart + P.len - 5) {
          P.stopK = nk; P.nextStop++;
          const delay = S.time - Sk.arr;
          const prec = d;
          P.stats.stops.push({ name: Sk.name, kind: 'arr', delay, prec });
          if (d > 8) penal(Math.min(80, Math.round(d * 2)), 'Repère d\'arrêt dépassé de ' + Math.round(d) + ' m');
          else if (Math.abs(d) <= 3) bonus(25, 'Arrêt précis au repère (' + d.toFixed(1) + ' m)');
          else bonus(10, 'Arrêt correct');
          if (Math.abs(delay) <= 60) bonus(30, 'Arrivée à l\'heure à ' + Sk.name);
          else if (delay > 180) penal(Math.min(80, Math.round(delay / 60) * 8), 'Retard de ' + Math.round(delay / 60) + ' min à ' + Sk.name);
          say('Arrêt à ' + Sk.name + ', voie ' + Sk.ourNo + (Math.abs(delay) > 60 ? ' — ' + (delay > 0 ? 'retard ' : 'avance ') + Math.round(Math.abs(delay) / 60) + ' min' : ' — à l\'heure') + '.', 'ok');
          if (TS.Audio) TS.Audio.fx('chime');
          P.exitOpen[nk] = false;
          if (pax) { P.doorsLocked = true; P.flags.opened = false; P.boardEnd = S.time + (Sk.big ? 55 : 35); }
          else P.boardEnd = S.time + 30;
          if (Sk.last) {
            if (!pax) finish();
          } else S.proc = stationProcedure();
        } else if (P.v < 0.05 && d <= -45 && P.s > Sk.zoneStart - 50) {
          P.shortWarn += dt;
          if (P.shortWarn > 4 && P.shortWarn - dt <= 4) say('Arrêt avant le repère : avancez jusqu\'au panneau d\'arrêt (' + Math.round(-d) + ' m).', 'warn');
        } else P.shortWarn = 0;
        if (P.s > Sk.zoneEnd + 20 && P.stopK !== nk && !Sk.last) {
          penal(150, 'Arrêt non marqué à ' + Sk.name); P.nextStop++;
        }
      }
    }
    if (P.stopK >= 0 && St[P.stopK].last && pax && P.flags.opened && !P.finished && S.time > P.boardEnd - 25) finish();

    /* ── Signaux franchis ── */
    while (P.nextSig < R.signals.length && R.signals[P.nextSig].s <= P.s) {
      const j = P.nextSig, g = R.signals[j];
      const asp = S.aspect(j);
      P.nextSig++;
      sigFrame = -1;
      if (!P.kvbCurve || P.kvbCurve.j <= j) P.kvbCurve = null;
      if (g.tvm) {
        if (S.isStop(asp)) { P.stats.sigs++; fu('Franchissement d’un repère TVM à 000', 150); }
        P.tvmPrev = P.tvmCode; continue;
      }
      if (S.isStop(asp)) { P.stats.sigs++; fu('Franchissement d\'un signal fermé (' + (asp === 'C' ? 'carré' : 'sémaphore') + ')', 150); }
      else if (asp === 'A' || asp === 'A_RR' || asp === 'R') {
        P.rs = 5; sound('rs');
        let tk = j + 1;
        if (asp !== 'R') for (let k = j + 1; k < Math.min(R.signals.length, j + 4); k++) if (S.isStop(aspect(k, P, 0))) { tk = k; break; }
        const nx = R.signals[tk];
        if (nx) P.kvbCurve = { s: nx.s, vt: asp === 'R' ? 60 : 0, asp, j: tk };
      }
    }
    if (P.rs > 0) { P.rs -= dt / Math.max(1, S.timeScale); if (P.rs <= 0) { P.rs = 0; fu('Répétition des signaux non acquittée', 40); } }

    /* ── Contrôle de vitesse (KVB / TVM) ── */
    const kv = P.kvb ? P.kvb.v : cfg.vmax;
    let lim = Math.min(R.limitWin(P.s - P.len, P.s), cfg.vmax, kv);
    P.lineLimit = lim;
    const inLGV = cfg.loco.kind === 'tgv' && R.isLGV(P.s);
    P.inTVM = inLGV;
    if (inLGV) {
      P.tvmCode = tvmCode();
      // courbe de freinage du canton : vitesse « but » en fin de canton
      const prev = P.tvmPrev == null ? Math.max(P.tvmCode, 80) : Math.max(P.tvmPrev, P.tvmCode);
      const g = R.signals[P.nextSig];
      const d = g ? g.s - P.s : 2000;
      const vt = Math.max(P.tvmCode, 30) / 3.6;
      lim = Math.min(lim, prev, Math.sqrt(vt * vt + 2 * 0.6 * Math.max(0, d)) * 3.6);
    } else { P.tvmCode = null; P.tvmPrev = null; }
    let ctl = lim;
    if (P.kvbCurve) {
      const d = P.kvbCurve.s - P.s;
      const b = cfg.loco.cat === 'fret' ? 0.42 : cfg.loco.kind === 'tgv' ? 0.75 : 0.7;
      const vt = Math.max(P.kvbCurve.vt, 30) / 3.6;
      const vc = Math.sqrt(vt * vt + 2 * b * Math.max(0, d)) * 3.6;
      ctl = Math.min(ctl, vc);
    }
    P.ctl = ctl;
    const over = P.v * 3.6 - ctl;
    if (P.kvb || inLGV) {
      if (over > 10) { fu('Survitesse : ' + Math.round(P.v * 3.6) + ' km/h pour ' + Math.round(ctl) + ' km/h autorisés', 60); }
      P.overWarn = over > 5;
    } else if (P.v * 3.6 > 10 && P.departed && !P.kvb) {
      fu('KVB non initialisé : vitesse limitée', 30);
    }

    /* ── Étapes de procédure à mémoriser (évaluées même sans affichage) ── */
    if (S.proc && Math.floor(S.time) !== Math.floor(S.time - dt)) S.proc.forEach(p => p.ok());
    if (P.pregr >= 1) P.flags.pregr = true;

    /* ── Bots ── */
    for (const b of bots) botStep(b, dt);
    oppStep(dt);
    S.frame++;
  };
  S.frame = 0;

  function finish() {
    if (P.finished) return;
    P.finished = true;
    if (!P.flags.vacma) {}
    S.onFinish && setTimeout(() => S.onFinish(), 2500);
  }

  /* procédure affichée */
  S.currentProcedure = function () { return S.proc; };
  S.route = () => R;
  S.cfg = () => cfg;
  return S;
})();

/* « Directors » : transforment des données de match en positions (ballon + joueurs)
   pour un instant t (en secondes de jeu) que le moteur 3D affiche.
   - EspnDirector : matchs en direct/récents. Le ballon passe par les vraies
     coordonnées des actions ESPN ; entre deux actions on simule des passes, et
     les joueurs sont placés selon la compo puis déplacés en bloc.
   - StatsBombDirector : replays avec le vrai tracking 360 (positions de tous
     les joueurs visibles à chaque action) et le vrai trajet du ballon. */
(() => {
'use strict';
const { PITCH_L, PITCH_W } = SL;

const HL = PITCH_L / 2, HW = PITCH_W / 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** Série temporelle interpolée linéairement. */
class Track {
  constructor() { this.t = []; this.v = []; }
  add(t, v) {
    const n = this.t.length;
    if (n && t < this.t[n - 1]) t = this.t[n - 1]; // garde l'ordre
    this.t.push(t); this.v.push(v);
  }
  index(t) {
    let lo = 0, hi = this.t.length - 1;
    if (hi < 0 || t < this.t[0]) return -1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (this.t[m] <= t) lo = m; else hi = m - 1; }
    return lo;
  }
  sample(t) {
    const n = this.t.length;
    if (!n) return null;
    const i = this.index(t);
    if (i < 0) return { ...this.v[0] };
    if (i >= n - 1) return { ...this.v[n - 1] };
    const a = this.v[i], b = this.v[i + 1], dt = this.t[i + 1] - this.t[i];
    const f = dt > 0 ? (t - this.t[i]) / dt : 1;
    const out = {};
    for (const k in a) out[k] = typeof a[k] === 'number' ? a[k] + (b[k] - a[k]) * f : a[k];
    if (a.arc) out.z = (out.z || 0) + Math.sin(f * Math.PI) * a.arc; // passe en l'air
    out.f = f; out.i = i;
    return out;
  }
}

/** Générateur pseudo-aléatoire reproductible (même match → même simulation). */
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = Math.imul(s ^ (s >>> 15), 1 | s) + 0x6d2b79f5 >>> 0) / 4294967296);
}

/* ── Placement selon la compo ── */
const DEPTH = { G: 0, GK: 0, CD: 1, 'CD-L': 1, 'CD-R': 1, CB: 1, LB: 1, RB: 1, LWB: 1.5, RWB: 1.5, D: 1, DM: 2, 'DM-L': 2, 'DM-R': 2, CM: 3, 'CM-L': 3, 'CM-R': 3, LM: 3, RM: 3, M: 3, AM: 4, 'AM-L': 4, 'AM-R': 4, LW: 4.5, RW: 4.5, SS: 4.5, F: 5, 'CF-L': 5, 'CF-R': 5, CF: 5, ST: 5 };
function lateral(a = '') {
  if (/^L|-L$/.test(a)) return /^L/.test(a) ? 2 : 1;
  if (/^R|-R$/.test(a)) return /^R/.test(a) ? -2 : -1;
  return 0;
}

/** Positions de base (équipe qui attaque vers +x, gauche = +y) pour 11 joueurs. */
function formationSlots(formation, players) {
  const lines = String(formation || '4-4-2').split('-').map(Number).filter(n => n > 0);
  if (lines.reduce((a, b) => a + b, 0) !== 10) lines.splice(0, lines.length, 4, 4, 2);
  const gk = players.find(p => DEPTH[p.pos] === 0) || players[0];
  const rest = players.filter(p => p !== gk)
    .sort((a, b) => (DEPTH[a.pos] ?? 3) - (DEPTH[b.pos] ?? 3) || (a.place || 0) - (b.place || 0));
  const out = new Map([[gk, { x: -47, y: 0 }]]);
  let k = 0;
  lines.forEach((n, li) => {
    const grp = rest.slice(k, k + n).sort((a, b) => lateral(b.pos) - lateral(a.pos) || (a.place || 0) - (b.place || 0));
    k += n;
    const x = -36 + (li * 31) / Math.max(1, lines.length - 1);
    const span = n === 1 ? 0 : Math.min(25, 8.5 * (n - 1));
    grp.forEach((p, i) => out.set(p, { x, y: n === 1 ? 0 : span - (2 * span * i) / (n - 1) }));
  });
  return players.map(p => out.get(p) || { x: -20, y: 0 });
}

/** Déplacement collectif d'une équipe selon le ballon (repère de l'équipe). */
function shapeAt(base, ball, attacking, t, seed) {
  // ballon dans le repère de l'équipe
  const shiftX = clamp(ball.x * 0.55 + (attacking ? 10 : -4), -8, 30);
  const squeeze = attacking ? 1 : 0.78;
  return base.map((b, i) => {
    if (i === 0) return { x: clamp(-47 + Math.max(0, ball.x + 30) * 0.12, -50, -38), y: clamp(ball.y * 0.18, -6, 6) };
    const wob = Math.sin(t * 0.3 + i * 1.7 + seed) * 1.2;
    return {
      x: clamp(b.x + shiftX + (b.x > -10 && attacking ? 6 : 0) + wob, -48, 50),
      y: clamp(b.y * squeeze + ball.y * 0.32 + Math.cos(t * 0.25 + i) * 1, -HW + 1, HW - 1),
    };
  });
}

/* ═══════════════ ESPN : direct reconstitué ═══════════════ */
class EspnDirector {
  /** summary = réponse /summary ESPN */
  constructor(summary) {
    const comp = summary.header?.competitions?.[0] || {};
    const cs = comp.competitors || [];
    const home = cs.find(c => c.homeAway === 'home') || cs[0];
    const away = cs.find(c => c.homeAway === 'away') || cs[1];
    this.teamIds = [home?.team?.id, away?.team?.id].map(String);
    this.teamNames = [home?.team?.displayName, away?.team?.displayName];
    this.seed = Number(comp.id || 1) % 100000;
    this.teams = [home, away].map((c, ti) => {
      const r = (summary.rosters || []).find(x => String(x.team?.id) === this.teamIds[ti]) || summary.rosters?.[ti] || {};
      let starters = (r.roster || []).filter(p => p.starter).slice(0, 11)
        .map(p => ({ num: p.jersey, name: p.athlete?.shortName || p.athlete?.displayName, pos: p.position?.abbreviation, place: Number(p.formationPlace) || 0, id: String(p.athlete?.id || '') }));
      if (starters.length < 11) starters = Array.from({ length: 11 }, (_, i) => starters[i] || { num: null, name: '', pos: i ? 'M' : 'G', place: i + 1 });
      const color = '#' + (c?.team?.color || (ti ? 'e5e7eb' : '2563eb'));
      let alt = '#' + (c?.team?.alternateColor || '111827');
      return { color, color2: alt, players: starters, formation: r.formation, base: formationSlots(r.formation, starters) };
    });
    // maillots trop proches : l'extérieur passe à sa 2e couleur, sinon blanc
    if (colorDist(this.teams[0].color, this.teams[1].color) < 140) {
      const alt = this.teams[1].color2;
      this.teams[1].color = colorDist(this.teams[0].color, alt) >= 140 ? alt : '#f8fafc';
      this.teams[1].color2 = '#111827';
    }
    this.update(summary);
  }

  /** Recalcule la trajectoire à partir du fil du match (appelé à chaque rafraîchissement). */
  update(summary) {
    const raw = (summary.commentary || []).map(c => c.play).filter(Boolean);
    const seen = new Set();
    const plays = [];
    for (const p of raw) {
      if (seen.has(p.id)) continue; seen.add(p.id);
      const period = p.period?.number || 1;
      const clock = p.clock?.value ?? 0;
      const t = clock; // ESPN donne le temps de match cumulé (secondes)
      const ti = this.teamOf(p);
      const toField = (X, Y) => {
        const x = (X / 100 - 0.5) * PITCH_L, y = (Y / 100 - 0.5) * PITCH_W;
        return ti === 1 ? { x: -x, y: -y } : { x, y };
      };
      const ev = { t, period, ti, type: p.type?.type || '', text: p.text || p.shortText || '', short: p.shortText || p.type?.text || '', score: !!p.scoringPlay, clock: p.clock?.displayValue || '' };
      if (p.fieldPositionX != null) {
        ev.a = toField(p.fieldPositionX, p.fieldPositionY);
        if (p.fieldPosition2X != null) ev.b = toField(p.fieldPosition2X, p.fieldPosition2Y);
        ev.who = p.participants?.[0]?.athlete?.displayName;
        ev.whoId = String(p.participants?.[0]?.athlete?.id || '');
      }
      plays.push(ev);
    }
    plays.sort((a, b) => a.t - b.t);
    this.events = plays;
    this.geo = plays.filter(p => p.a);
    // Score cumulé
    let s = [0, 0];
    for (const p of plays) { if (p.score && p.ti >= 0) { s = [...s]; s[p.ti]++; } p.scoreAfter = s; }
    const comp = summary.header?.competitions?.[0];
    const status = comp?.status;
    this.live = status?.type?.state === 'in';
    const last = plays.at(-1)?.t || 0;
    this.duration = Math.max(last + (this.live ? 30 : 0), status?.type?.state === 'post' ? 95 * 60 : 0, 60);
    this.buildBall();
  }

  teamOf(p) {
    const id = String(p.team?.id || '');
    if (id && this.teamIds.includes(id)) return this.teamIds.indexOf(id);
    const n = p.team?.displayName;
    if (n) { const i = this.teamNames.indexOf(n); if (i >= 0) return i; }
    return -1;
  }

  /** Trajet du ballon : vraies coordonnées + passes simulées entre deux actions. */
  buildBall() {
    const R = rng(this.seed);
    const tr = new Track();
    const pos = new Track(); // équipe en possession
    let cur = { x: 0, y: 0 }, t = 0, team = 0;
    tr.add(0, { x: 0, y: 0, z: 0 }); pos.add(0, { team: 0 });
    for (const ev of this.geo) {
      if (ev.t <= t) { // plusieurs actions dans la même seconde
        cur = ev.b || ev.a;
        continue;
      }
      // remplissage : passes de l'équipe qui va mener l'action suivante vers sa position
      const gap = ev.t - t;
      const n = Math.min(Math.floor(gap / 5), 40);
      const atk = ev.ti >= 0 ? ev.ti : team;
      for (let i = 1; i <= n; i++) {
        const f = i / (n + 1);
        const tt = t + gap * f;
        // dérive aléatoire autour du chemin, plus large au milieu
        const spread = Math.sin(f * Math.PI);
        const px = clamp(cur.x + (ev.a.x - cur.x) * f + (R() - 0.5) * 34 * spread, -HL + 3, HL - 3);
        const py = clamp(cur.y + (ev.a.y - cur.y) * f + (R() - 0.5) * 46 * spread, -HW + 2, HW - 2);
        const prev = tr.v.at(-1);
        const d = Math.hypot(px - prev.x, py - prev.y);
        prev.arc = d > 28 ? Math.min(9, d / 5) : 0;
        tr.add(tt - 0.8, { x: px, y: py, z: 0 });
        tr.add(tt + 0.6 + R() * 1.6, { x: px + (R() - 0.5) * 3, y: py + (R() - 0.5) * 3, z: 0 }); // conduite
        pos.add(tt, { team: R() < 0.82 ? atk : 1 - atk });
      }
      const prev = tr.v.at(-1);
      prev.arc = Math.hypot(ev.a.x - prev.x, ev.a.y - prev.y) > 28 ? 6 : 0;
      tr.add(ev.t, { x: ev.a.x, y: ev.a.y, z: 0 });
      pos.add(ev.t - 2, { team: atk });
      if (ev.b) {
        const shot = /shot|goal/.test(ev.type);
        tr.v.at(-1).arc = shot ? (/header/.test(ev.type) ? 1.5 : 1.2) : 4;
        tr.add(ev.t + (shot ? 0.9 : 1.6), { x: ev.b.x, y: ev.b.y, z: 0 });
        cur = ev.b;
      } else cur = ev.a;
      if (ev.score) { // retour au rond central
        tr.add(ev.t + 25, { x: cur.x, y: cur.y, z: 0 });
        tr.add(ev.t + 45, { x: 0, y: 0, z: 0 });
        cur = { x: 0, y: 0 };
        pos.add(ev.t + 45, { team: 1 - atk });
      }
      t = Math.max(ev.t, tr.t.at(-1));
      team = atk;
    }
    this.ballTrack = tr;
    this.possTrack = pos;
  }

  eventAt(t) {
    let e = null;
    for (const ev of this.events) { if (ev.t <= t) e = ev; else break; }
    return e;
  }

  stateAt(t) {
    const b = this.ballTrack.sample(t) || { x: 0, y: 0, z: 0 };
    const team = (this.possTrack.sample(t) || { team: 0 }).team;
    const players = [];
    let carrier = null, best = 1e9;
    this.teams.forEach((tm, ti) => {
      const local = ti === 0 ? b : { x: -b.x, y: -b.y };
      const pts = shapeAt(tm.base, local, team === ti, t, this.seed + ti * 7);
      // le joueur le plus proche va au ballon
      let ni = -1, nd = 1e9;
      pts.forEach((p, i) => { if (i) { const d = Math.hypot(p.x - local.x, p.y - local.y); if (d < nd) { nd = d; ni = i; } } });
      if (ni > 0) {
        const go = team === ti ? 1 : 0.7;
        pts[ni] = { x: pts[ni].x + (local.x - pts[ni].x - 0.8) * go, y: pts[ni].y + (local.y - pts[ni].y) * go };
        if (team === ti && nd < best) { best = nd; carrier = { team: ti, idx: ni }; }
      }
      pts.forEach((p, i) => players.push({ team: ti, idx: i, x: ti === 0 ? p.x : -p.x, y: ti === 0 ? p.y : -p.y }));
    });
    const ev = this.eventAt(t);
    if (carrier) {
      const pl = this.teams[carrier.team].players[carrier.idx];
      // si l'action en cours nomme un joueur, on l'affiche
      const recent = ev && ev.who && t - ev.t < 4 && ev.ti === carrier.team ? ev.who : null;
      carrier.label = recent || (pl?.name ? `${pl.num ?? ''} ${pl.name}`.trim() : '');
    }
    return { ball: { x: b.x, y: b.y, z: b.z || 0 }, players, carrier, event: ev, score: ev?.scoreAfter || [0, 0] };
  }
}

/* ═══════════════ StatsBomb : replay tracking réel ═══════════════ */
const PERIOD_OFFSET = { 1: 0, 2: 45 * 60, 3: 90 * 60, 4: 105 * 60, 5: 120 * 60 };

function sbTime(e) {
  const [h, m, s] = e.timestamp.split(':').map(Number);
  return PERIOD_OFFSET[e.period] + h * 3600 + m * 60 + s;
}

class StatsBombDirector {
  /** events + frames (360) + lineups ; homeName = équipe domicile */
  constructor(events, frames, lineups, meta) {
    this.meta = meta;
    const homeName = meta.home;
    const toField = (loc, isHome) => {
      const x = (loc[0] / 120 - 0.5) * PITCH_L, y = (0.5 - loc[1] / 80) * PITCH_W;
      return isHome ? { x, y } : { x: -x, y: -y };
    };
    const jersey = new Map();
    const lineup = [[], []];
    const nick = new Map(); // « Lionel Messi » plutôt que « Lionel Andrés Messi Cuccittini »
    for (const l of lineups) for (const p of l.lineup) { jersey.set(p.player_id, p.jersey_number); if (p.player_nickname) nick.set(p.player_name, p.player_nickname); }
    const shortName = n => shortNameOf(nick.get(n) || n);
    // Compos de départ (avec postes) depuis l'événement « Starting XI »
    const xi = events.filter(e => e.type.name === 'Starting XI');
    const teamColors = meta.colors || ['#60a5fa', '#f8fafc'];
    this.teams = [0, 1].map(ti => {
      const e = xi.find(x => (x.team.name === homeName) === (ti === 0));
      const ps = (e?.tactics?.lineup || []).map(p => ({ num: p.jersey_number, name: p.player.name, pos: p.position.name, id: p.player.id }));
      lineup[ti] = ps;
      return { color: teamColors[ti], color2: meta.shorts?.[ti] || '#111827', players: ps.map(p => ({ num: p.num, name: shortName(p.name) })), formation: e?.tactics?.formation };
    });

    const frameById = new Map(frames.map(f => [f.event_uuid, f.freeze_frame]));
    const ball = new Track();
    this.events = [];
    let score = [0, 0];
    const slots = [0, 1].map(() => Array.from({ length: 11 }, () => new Track()));
    const lastPos = [0, 1].map(ti => formationGuess(lineup[ti], ti));
    lastPos.forEach((arr, ti) => arr.forEach((p, i) => slots[ti][i].add(0, { ...p })));
    this.carriers = new Track();

    for (const e of events) {
      if (!e.location) continue;
      const t = sbTime(e);
      const isHome = e.team.name === homeName;
      const ti = isHome ? 0 : 1;
      const a = toField(e.location, isHome);
      ball.add(t, { x: a.x, y: a.y, z: 0 });
      const end = e.pass?.end_location || e.carry?.end_location || e.shot?.end_location;
      if (end) {
        const b = toField(end, isHome);
        const dur = Math.max(0.3, e.duration || 0.8);
        const lob = e.pass?.height?.name === 'High Pass' ? Math.min(14, Math.hypot(b.x - a.x, b.y - a.y) / 3.5)
          : e.pass?.height?.name === 'Low Pass' ? 1.5 : 0;
        ball.v.at(-1).arc = lob;
        ball.add(t + dur, { x: b.x, y: b.y, z: e.shot ? (end[2] || 0) * 0.9 : 0 });
      }
      // Porteur
      const pid = e.player?.id;
      if (pid) this.carriers.add(t, { team: ti, pid, label: `${jersey.get(pid) ?? ''} ${shortName(e.player.name)}`.trim() });

      // Positions des 22 joueurs (360)
      const ff = frameById.get(e.id);
      if (ff) {
        const vis = [[], []];
        for (const p of ff) {
          const pti = p.teammate ? ti : 1 - ti;
          const pos = toField(p.location, isHome);
          vis[pti].push({ ...pos, keeper: p.keeper, actor: p.actor });
        }
        for (const k of [0, 1]) assign(vis[k], lastPos[k], slots[k], t);
      }

      // Événements notables pour la frise
      let kind = null, label = '';
      const who = e.player ? shortName(e.player.name) : '';
      if (e.type.name === 'Shot') {
        kind = e.shot.outcome.name === 'Goal' ? 'goal' : 'shot';
        if (kind === 'goal' && e.period < 5) { score = [...score]; score[ti]++; }
        label = `${kind === 'goal' ? '⚽ ' : ''}${who} – ${e.shot.outcome.name}`;
      } else if (e.type.name === 'Own Goal Against') {
        kind = 'goal'; score = [...score]; score[1 - ti]++; label = `⚽ CSC ${who}`;
      } else if (e.foul_committed?.card || e.bad_behaviour?.card) {
        const c = (e.foul_committed || e.bad_behaviour).card.name;
        kind = 'card'; label = `${/Red/.test(c) ? '🟥' : '🟨'} ${who}`;
      } else if (e.type.name === 'Substitution') {
        kind = 'sub'; label = `🔁 ${who} → ${shortName(e.substitution.replacement.name)}`;
      }
      if (kind) this.events.push({ t, ti, kind, text: label, short: label, score: kind === 'goal', clock: `${e.minute}'` });
      if (kind === 'goal') this.events.at(-1).scoreAfter = score;
    }
    let s = [0, 0];
    for (const ev of this.events) { if (ev.scoreAfter) s = ev.scoreAfter; ev.scoreAfter = s; }
    this.ballTrack = ball;
    this.slots = slots;
    this.duration = ball.t.at(-1) || 95 * 60;
    this.live = false;
  }

  stateAt(t) {
    const b = this.ballTrack.sample(t) || { x: 0, y: 0, z: 0 };
    const players = [];
    this.slots.forEach((arr, ti) => arr.forEach((tr, i) => {
      const p = tr.sample(t);
      if (!p) return;
      // « vu » si une image 360 récente le contient
      const j = tr.index(t);
      const seen = j >= 0 && (t - tr.t[j] < 6 || (tr.t[j + 1] ?? 1e9) - t < 6);
      players.push({ team: ti, idx: i, x: p.x, y: p.y, seen });
    }));
    const c = this.carriers.sample(t);
    let carrier = null;
    if (c) {
      // joueur de l'équipe porteuse le plus proche du ballon
      let best = 1e9;
      players.filter(p => p.team === c.team).forEach(p => {
        const d = Math.hypot(p.x - b.x, p.y - b.y);
        if (d < best) { best = d; carrier = { team: c.team, idx: p.idx, label: c.label }; }
      });
      if (best > 6) carrier = null;
    }
    let ev = null;
    for (const e of this.events) { if (e.t <= t) ev = e; else break; }
    return { ball: { x: b.x, y: b.y, z: b.z || 0 }, players, carrier, event: ev, score: ev?.scoreAfter || [0, 0] };
  }
}

function colorDist(a, b) {
  const p = h => { const n = parseInt(String(h).replace('#', '').padEnd(6, '0').slice(0, 6), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const [x, y] = [p(a), p(b)];
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}

function shortNameOf(n = '') {
  const p = n.split(' ');
  return p.length > 1 ? `${p[0][0]}. ${p.at(-1)}` : n;
}

/** Position de départ approximative depuis les postes StatsBomb. */
function formationGuess(lineup, ti) {
  const D = n => /Goalkeeper/.test(n) ? 0 : /Back/.test(n) ? 1 : /Defensive/.test(n) ? 2 : /Center Midfield|Left Midfield|Right Midfield/.test(n) ? 3 : /Attacking|Wing/.test(n) ? 4 : 5;
  const L = n => /Left/.test(n) ? (/Center/.test(n) ? 1 : 2) : /Right/.test(n) ? (/Center/.test(n) ? -1 : -2) : 0;
  const pos = Array.from({ length: 11 }, (_, i) => {
    const p = lineup[i];
    const d = p ? D(p.pos) : (i ? 3 : 0);
    const l = p ? L(p.pos) : 0;
    const x = d === 0 ? -47 : -38 + d * 7.5, y = l * 11;
    return { x: ti ? -x : x, y: ti ? -y : y };
  });
  // le gardien en slot 0
  return pos;
}

/** Associe les joueurs vus dans une image 360 aux 11 « slots » d'une équipe (plus proche voisin). */
function assign(vis, last, slots, t) {
  if (!vis.length) return;
  const free = new Set(last.map((_, i) => i));
  const keeper = vis.find(v => v.keeper);
  if (keeper) { last[0] = { x: keeper.x, y: keeper.y }; slots[0].add(t, { ...last[0] }); free.delete(0); }
  const pairs = [];
  vis.filter(v => !v.keeper).forEach((v, vi) => free.forEach(si => {
    if (si === 0 && keeper) return;
    pairs.push({ d: Math.hypot(v.x - last[si].x, v.y - last[si].y), vi, si });
  }));
  pairs.sort((a, b) => a.d - b.d);
  const usedV = new Set();
  for (const p of pairs) {
    if (usedV.has(p.vi) || !free.has(p.si)) continue;
    if (p.si === 0 && p.d > 12) continue; // n'utilise le slot gardien que si c'est proche
    usedV.add(p.vi); free.delete(p.si);
    const v = vis.filter(x => !x.keeper)[p.vi];
    last[p.si] = { x: v.x, y: v.y };
    slots[p.si].add(t, { ...last[p.si] });
  }
}

Object.assign(SL, { formationSlots, EspnDirector, StatsBombDirector });
})();

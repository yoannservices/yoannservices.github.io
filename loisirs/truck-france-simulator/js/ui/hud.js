const $ = (id) => document.getElementById(id);
const el = Object.fromEntries(['spd', 'gear', 'rpm', 'fuel', 'fuelbar', 'clock', 'drive', 'mass', 'odo', 'rig', 'msg', 'help', 'remain', 'deadline', 'weather', 'dmgT', 'dmgC', 'money'].map((i) => [i, $(i)]));
const hm = (h) => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.floor((h % 1) * 60)).padStart(2, '0')}`;
let acc = 0;

export function updateHUD(dt, p, game, state) {
  acc += dt;
  if (acc < 0.066) return; // ~15 Hz suffit
  acc = 0;
  el.spd.textContent = Math.round(Math.abs(p.v) * 3.6);
  el.gear.textContent = p.gear === -1 ? 'R' : p.gear === 0 ? 'N' : p.gear;
  el.rpm.style.width = `${p.rpm * 100}%`;
  const pct = p.fuel / p.cab.tank;
  el.fuel.textContent = `${Math.round(p.fuel)} / ${p.cab.tank} L`;
  el.fuelbar.style.width = `${pct * 100}%`;
  el.fuelbar.className = pct < 0.1 ? 'crit' : pct < 0.25 ? 'low' : 'ok';
  el.clock.textContent = hm(game.hours % 24);
  const d = game.driveHours;
  el.drive.textContent = `${Math.floor(d)}h${String(Math.floor((d % 1) * 60)).padStart(2, '0')} / 4h30`;
  el.mass.textContent = `${(p.mass / 1000).toFixed(1)} t`;
  el.odo.textContent = `${(p.odo / 1000).toFixed(1)} km`;
  el.rig.textContent = `${p.cab.name} + ${p.trailer.name}`;
  el.remain.textContent = `${Math.round(game.remainingKm)} km`;
  const left = game.deadline - (game.hours - game.startHours);
  el.deadline.textContent = `${left < 0 ? '−' : ''}${Math.floor(Math.abs(left))} h ${String(Math.floor((Math.abs(left) % 1) * 60)).padStart(2, '0')}`;
  el.deadline.className = left < 0 ? 'neg' : '';
  el.weather.textContent = game.weather;
  el.dmgT.textContent = `${Math.round(game.truckDmg)} %`;
  el.dmgC.textContent = `${Math.round(game.cargoDmg)} %`;
  el.money.textContent = `${Math.round(state.money).toLocaleString('fr-FR')} €`;
  setMsg(game.message, game.messageLevel);
}

export function setMsg(text, level = '') {
  el.msg.textContent = text || '';
  el.msg.className = level;
}

export const hideHelp = () => { el.help.style.display = 'none'; };

import * as L from 'leaflet';
import { CITIES, EDGES } from './cities.js';
import { byId } from './graph.js';
import { planAll, modeInfo } from './routing.js';

const hm = (h) => `${Math.floor(h)} h ${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;
const eur = (n) => `${Math.round(n).toLocaleString('fr-FR')} €`;
const ll = (id) => [byId[id].lat, byId[id].lon];

/** Écran carte : départ, arrivée, étapes ; 3 itinéraires comparés. onStart(route) lance la conduite. */
export function createMapScreen(onStart, onBack) {
  const root = document.getElementById('map-screen');
  const $ = (s) => root.querySelector(s);
  let map, markers = {}, lines = [], stops = [], preset = [], routes = [], sel = 0, truck = { consumption: 35 };

  function init() {
    map = L.map('leaflet', { center: [46.6, 2.5], zoom: 6, minZoom: 5, zoomSnap: 0.5 });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 10,
    }).addTo(map);
    for (const e of EDGES) {
      L.polyline([ll(e.a), ll(e.b)], { color: e.t === 'A' ? '#f59e0b' : '#6b7280', weight: e.t === 'A' ? 2 : 1.5, opacity: 0.35, interactive: false }).addTo(map);
    }
    for (const c of CITIES) {
      const m = L.circleMarker([c.lat, c.lon], { radius: 6, weight: 2, color: '#0f0f13', fillOpacity: 1 }).addTo(map);
      m.bindTooltip(c.name, { direction: 'top' });
      m.on('click', () => pick(c.id));
      markers[c.id] = m;
    }
    $('#m-back').onclick = onBack;
    $('#m-back').textContent = 'Contrats';
    $('#m-clear').onclick = () => { stops = [...preset]; refresh(); };
    $('#m-go').onclick = () => onStart(routes[sel]);
  }

  // 1er clic départ, 2e arrivée, suivants = étapes insérées avant l'arrivée
  function pick(id) {
    if (stops.includes(id)) return;
    if (stops.length < 2) stops.push(id);
    else stops.splice(stops.length - 1, 0, id);
    refresh();
  }

  function refresh() {
    for (const id in markers) markers[id].setStyle({ fillColor: '#8892a4', radius: 6 });
    stops.forEach((id, i) => {
      const last = i === stops.length - 1 && stops.length > 1;
      markers[id].setStyle({ fillColor: i === 0 ? '#22c55e' : last ? '#ef4444' : '#eab308', radius: 9 }).bringToFront();
    });
    $('#m-stops').innerHTML = stops.map((id, i) => {
      const role = i === 0 ? 'Départ' : i === stops.length - 1 ? 'Arrivée' : `Étape ${i}`;
      const mid = i > 0 && i < stops.length - 1; // départ et arrivée du contrat non modifiables
      return `<div class="item static"><span>${role}</span><b>${byId[id].name}</b>${mid ? `<button data-i="${i}" title="Retirer">×</button>` : ''}</div>`;
    }).join('') || '<small>Cliquez une ville pour le départ, puis l\'arrivée, puis des étapes.</small>';
    $('#m-stops').querySelectorAll('button').forEach((b) => { b.onclick = () => { stops.splice(+b.dataset.i, 1); refresh(); }; });

    lines.forEach((l) => l.remove());
    lines = [];
    routes = stops.length > 1 ? planAll(stops, truck).filter(Boolean) : [];
    sel = Math.min(sel, Math.max(routes.length - 1, 0));
    $('#m-routes').innerHTML = routes.map((r, i) => {
      const m = modeInfo(r.mode);
      return `<button class="item route${i === sel ? ' on' : ''}" data-i="${i}" style="--c:${m.color}">
        <b>${m.label}</b><span>${Math.round(r.km)} km · ${hm(r.hours)}</span>
        <small>Carburant ${eur(r.fuelCost)} · Péages ${eur(r.tolls)} · Difficulté ${'★'.repeat(r.difficulty)}${'☆'.repeat(5 - r.difficulty)}</small></button>`;
    }).join('');
    $('#m-routes').querySelectorAll('button').forEach((b) => { b.onclick = () => { sel = +b.dataset.i; refresh(); }; });
    routes.forEach((r, i) => { // sélectionné en dernier pour rester au-dessus
      if (i !== sel) lines.push(L.polyline(r.path.map(ll), { color: modeInfo(r.mode).color, weight: 3, opacity: 0.5, dashArray: '6 6', interactive: false }).addTo(map));
    });
    if (routes[sel]) lines.push(L.polyline(routes[sel].path.map(ll), { color: modeInfo(routes[sel].mode).color, weight: 6, opacity: 0.95, interactive: false }).addTo(map));
    $('#m-go').disabled = !routes.length;
  }

  return {
    /** contract : [départ, arrivée] imposés ; le joueur ajoute des étapes. */
    show(t, contract = []) {
      truck = t;
      preset = contract;
      stops = [...contract];
      root.hidden = false;
      if (!map) init();
      map.invalidateSize();
      refresh();
    },
    hide() { root.hidden = true; },
  };
}

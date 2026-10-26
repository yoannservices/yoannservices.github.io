import * as THREE from 'three';
import { CABS, TRAILERS } from '../truck/truckData.js';
import { buildTruck } from '../truck/truckModel.js';
import { consumption } from '../truck/truckPhysics.js';
import { state, save } from '../core/state.js';

const euro = (n) => `${n.toLocaleString('fr-FR')} €`;
const LOAD = 0.7; // charge de référence pour les stats

/** Valeurs de la fiche technique, chacune normalisée 0-1 pour sa barre. */
export function computeStats(cab, trailer) {
  const mass = cab.mass + trailer.empty + trailer.maxLoad * LOAD;
  const handling = cab.steer * trailer.steerPenalty * (1 - 0.25 * LOAD) * (13.6 / (trailer.length + 6)) ** 0.3;
  return [
    { label: 'Puissance', text: `${Math.round(cab.powerKw * 1.36)} ch`, v: cab.powerKw / 400 },
    { label: 'Poids à vide', text: `${((cab.mass + trailer.empty) / 1000).toFixed(1)} t`, v: (cab.mass + trailer.empty) / 18000 },
    { label: 'Charge max', text: `${trailer.maxLoad / 1000} t`, v: trailer.maxLoad / 28000 },
    { label: 'Réservoir', text: `${cab.tank} L`, v: cab.tank / 800 },
    { label: 'Consommation', text: `${consumption(mass, 80).toFixed(1)} L/100`, v: consumption(mass, 80) / 60, bad: true },
    { label: 'Maniabilité', text: `${Math.round(handling * 100)} %`, v: handling },
  ];
}

/** Garage : scène 3D séparée avec plateau tournant + panneaux DOM. */
export function createGarage(onDrive) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x13131b);
  scene.add(new THREE.HemisphereLight(0xdbe9ff, 0x2a2a38, 1.3));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(15, 25, 10);
  scene.add(key);
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 0.2, 48), new THREE.MeshStandardMaterial({ color: 0x232331, roughness: 0.8 }));
  floor.position.y = -0.1;
  scene.add(floor);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 200);

  let sel = { cab: state.cab, trailer: state.trailer }, model, angle = 0.6, drag = null;
  const pose = { x: 0, z: 0, h: 0, th: 0, steer: 0, accel: 0, lat: 0, wheelAngle: 0, hitch: { x: 0, z: -0.3 } };

  const root = document.getElementById('garage');
  const $ = (s) => root.querySelector(s);

  function rebuild() {
    if (model) scene.remove(model.root);
    model = buildTruck(CABS[sel.cab], TRAILERS[sel.trailer]);
    model.root.position.z = 5; // centre l'ensemble (≈ 18 m) sur le plateau
    model.update(pose);
    model.setLights(false);
    scene.add(model.root);
    render();
  }

  function card(item, kind) {
    const owned = state[kind === 'cab' ? 'cabs' : 'trailers'].includes(item.id);
    const on = sel[kind] === item.id;
    const b = document.createElement('button');
    b.className = `item${on ? ' on' : ''}`;
    b.innerHTML = `<b>${item.name}</b><span>${owned ? 'Possédé' : euro(item.price)}</span>`;
    b.onclick = () => { sel[kind] = item.id; rebuild(); };
    return b;
  }

  function render() {
    const cab = CABS[sel.cab], tr = TRAILERS[sel.trailer];
    $('#g-cabs').replaceChildren(...Object.values(CABS).map((c) => card(c, 'cab')));
    $('#g-trailers').replaceChildren(...Object.values(TRAILERS).map((t) => card(t, 'trailer')));
    $('#g-money').textContent = euro(state.money);
    $('#g-title').textContent = `${cab.name} + ${tr.name}`;
    $('#g-stats').innerHTML = computeStats(cab, tr).map((s) =>
      `<div class="stat"><div class="row"><span>${s.label}</span><b>${s.text}</b></div><div class="bar"><i class="${s.bad ? 'low' : 'ok'}" style="width:${Math.min(100, s.v * 100)}%"></i></div></div>`).join('');

    const missing = [['cabs', cab], ['trailers', tr]].filter(([k, it]) => !state[k].includes(it.id));
    const cost = missing.reduce((n, [, it]) => n + it.price, 0);
    const btn = $('#g-action');
    if (missing.length) {
      btn.textContent = `Acheter (${euro(cost)})`;
      btn.disabled = cost > state.money;
      btn.onclick = () => { missing.forEach(([k, it]) => state[k].push(it.id)); state.money -= cost; save(); render(); };
    } else {
      btn.textContent = 'Choisir un contrat';
      btn.disabled = false;
      btn.onclick = () => { state.cab = sel.cab; state.trailer = sel.trailer; save(); onDrive(); };
    }
  }

  const el = document.getElementById('game');
  el.addEventListener('pointerdown', (e) => { if (!root.hidden) drag = e.clientX; });
  addEventListener('pointerup', () => { drag = null; });
  addEventListener('pointermove', (e) => { if (drag !== null) { angle -= (e.clientX - drag) * 0.01; drag = e.clientX; } });

  return {
    show() { sel = { cab: state.cab, trailer: state.trailer }; root.hidden = false; rebuild(); },
    hide() { root.hidden = true; },
    frame(renderer, dt, aspect) {
      if (drag === null) angle += dt * 0.4;
      camera.aspect = aspect * (aspect < 1 ? 1 : 1);
      camera.updateProjectionMatrix();
      const r = aspect < 1 ? 48 : 36;
      camera.position.set(Math.sin(angle) * r, 11, Math.cos(angle) * r);
      camera.lookAt(0, 2, 0);
      renderer.render(scene, camera);
    },
  };
}

/* ── Unit Converter ── */

const CATEGORIES = {
  longueur: {
    icon: 'fa-ruler',
    label: 'Longueur',
    base: 'm',
    units: {
      mm: { name: 'Millimètre', factor: 0.001 },
      cm: { name: 'Centimètre', factor: 0.01 },
      m:  { name: 'Mètre', factor: 1 },
      km: { name: 'Kilomètre', factor: 1000 },
      in: { name: 'Pouce (inch)', factor: 0.0254 },
      ft: { name: 'Pied (foot)', factor: 0.3048 },
      yd: { name: 'Yard', factor: 0.9144 },
      mi: { name: 'Mile', factor: 1609.344 },
      nm: { name: 'Mille marin', factor: 1852 }
    }
  },
  masse: {
    icon: 'fa-weight-hanging',
    label: 'Masse',
    base: 'kg',
    units: {
      mg:  { name: 'Milligramme', factor: 0.000001 },
      g:   { name: 'Gramme', factor: 0.001 },
      kg:  { name: 'Kilogramme', factor: 1 },
      t:   { name: 'Tonne', factor: 1000 },
      oz:  { name: 'Once (oz)', factor: 0.0283495 },
      lb:  { name: 'Livre (lb)', factor: 0.453592 },
      st:  { name: 'Stone', factor: 6.35029 }
    }
  },
  temperature: {
    icon: 'fa-temperature-half',
    label: 'Température',
    base: 'special',
    units: {
      C: { name: 'Celsius' },
      F: { name: 'Fahrenheit' },
      K: { name: 'Kelvin' }
    }
  },
  volume: {
    icon: 'fa-flask',
    label: 'Volume',
    base: 'L',
    units: {
      mL:  { name: 'Millilitre', factor: 0.001 },
      cL:  { name: 'Centilitre', factor: 0.01 },
      L:   { name: 'Litre', factor: 1 },
      m3:  { name: 'Mètre cube', factor: 1000 },
      gal: { name: 'Gallon US', factor: 3.78541 },
      qt:  { name: 'Quart US', factor: 0.946353 },
      pt:  { name: 'Pinte US', factor: 0.473176 },
      cup: { name: 'Tasse US', factor: 0.236588 },
      floz:{ name: 'Fl. oz US', factor: 0.0295735 }
    }
  },
  vitesse: {
    icon: 'fa-gauge-high',
    label: 'Vitesse',
    base: 'ms',
    units: {
      ms:   { name: 'm/s', factor: 1 },
      kmh:  { name: 'km/h', factor: 0.277778 },
      mph:  { name: 'mph', factor: 0.44704 },
      kn:   { name: 'Nœud', factor: 0.514444 },
      mach: { name: 'Mach', factor: 343 }
    }
  },
  donnees: {
    icon: 'fa-database',
    label: 'Données',
    base: 'B',
    units: {
      bit: { name: 'Bit', factor: 0.125 },
      B:   { name: 'Octet (Byte)', factor: 1 },
      KB:  { name: 'Kilooctet', factor: 1024 },
      MB:  { name: 'Mégaoctet', factor: 1048576 },
      GB:  { name: 'Gigaoctet', factor: 1073741824 },
      TB:  { name: 'Téraoctet', factor: 1099511627776 }
    }
  },
  temps: {
    icon: 'fa-clock',
    label: 'Temps',
    base: 's',
    units: {
      ms:  { name: 'Milliseconde', factor: 0.001 },
      s:   { name: 'Seconde', factor: 1 },
      min: { name: 'Minute', factor: 60 },
      h:   { name: 'Heure', factor: 3600 },
      j:   { name: 'Jour', factor: 86400 },
      sem: { name: 'Semaine', factor: 604800 },
      mois:{ name: 'Mois (30j)', factor: 2592000 },
      an:  { name: 'Année (365j)', factor: 31536000 }
    }
  },
  surface: {
    icon: 'fa-vector-square',
    label: 'Surface',
    base: 'm2',
    units: {
      mm2: { name: 'mm²', factor: 0.000001 },
      cm2: { name: 'cm²', factor: 0.0001 },
      m2:  { name: 'm²', factor: 1 },
      ha:  { name: 'Hectare', factor: 10000 },
      km2: { name: 'km²', factor: 1000000 },
      ft2: { name: 'ft²', factor: 0.092903 },
      ac:  { name: 'Acre', factor: 4046.86 }
    }
  },
  devises: {
    icon: 'fa-coins',
    label: 'Devises',
    base: 'EUR',
    dynamic: true,    // rates fetched from API
    units: {
      EUR: { name: 'Euro', flag: '🇪🇺', factor: 1 },
      USD: { name: 'Dollar US', flag: '🇺🇸', factor: null },
      GBP: { name: 'Livre sterling', flag: '🇬🇧', factor: null },
      JPY: { name: 'Yen japonais', flag: '🇯🇵', factor: null },
      CHF: { name: 'Franc suisse', flag: '🇨🇭', factor: null },
      CAD: { name: 'Dollar canadien', flag: '🇨🇦', factor: null },
      AUD: { name: 'Dollar australien', flag: '🇦🇺', factor: null },
      CNY: { name: 'Yuan chinois', flag: '🇨🇳', factor: null },
      MXN: { name: 'Peso mexicain', flag: '🇲🇽', factor: null },
      BRL: { name: 'Réal brésilien', flag: '🇧🇷', factor: null },
      INR: { name: 'Roupie indienne', flag: '🇮🇳', factor: null },
      KRW: { name: 'Won coréen', flag: '🇰🇷', factor: null },
      MAD: { name: 'Dirham marocain', flag: '🇲🇦', factor: null },
    }
  },
  energie: {
    icon: 'fa-bolt',
    label: 'Énergie',
    base: 'J',
    units: {
      J:    { name: 'Joule', factor: 1 },
      kJ:   { name: 'Kilojoule', factor: 1000 },
      cal:  { name: 'Calorie', factor: 4.184 },
      kcal: { name: 'Kilocalorie (kcal)', factor: 4184 },
      Wh:   { name: 'Watt-heure', factor: 3600 },
      kWh:  { name: 'Kilowatt-heure', factor: 3600000 },
      MWh:  { name: 'Mégawatt-heure', factor: 3.6e9 },
      BTU:  { name: 'BTU', factor: 1055.06 },
      eV:   { name: 'Électronvolt', factor: 1.602e-19 }
    }
  },
  pression: {
    icon: 'fa-gauge',
    label: 'Pression',
    base: 'Pa',
    units: {
      Pa:   { name: 'Pascal', factor: 1 },
      kPa:  { name: 'Kilopascal', factor: 1000 },
      MPa:  { name: 'Mégapascal', factor: 1000000 },
      bar:  { name: 'Bar', factor: 100000 },
      mbar: { name: 'Millibar', factor: 100 },
      atm:  { name: 'Atmosphère', factor: 101325 },
      psi:  { name: 'PSI (lb/in²)', factor: 6894.76 },
      torr: { name: 'Torr (mmHg)', factor: 133.322 }
    }
  },
  angle: {
    icon: 'fa-circle-notch',
    label: 'Angle',
    base: 'deg',
    units: {
      deg:  { name: 'Degré (°)', factor: 1 },
      rad:  { name: 'Radian', factor: 180 / Math.PI },
      grad: { name: 'Gradian', factor: 0.9 },
      turn: { name: 'Tour', factor: 360 },
      arcmin:{ name: 'Minute d\'arc', factor: 1/60 },
      arcsec:{ name: 'Seconde d\'arc', factor: 1/3600 }
    }
  }
};

let currentCat = 'longueur';
let history = JSON.parse(localStorage.getItem('uc-history') || '[]');

/* ── Forex: fetch live rates (EUR base) ── */
const FX_CACHE_KEY = 'uc-fx-cache';
const FX_TTL = 3 * 3600 * 1000; // 3 hours

async function loadForexRates() {
  const cached = (() => { try { return JSON.parse(localStorage.getItem(FX_CACHE_KEY)); } catch { return null; } })();
  if (cached && (Date.now() - cached.ts < FX_TTL)) {
    applyForexRates(cached.rates);
    return;
  }
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/EUR');
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (data.result !== 'success') throw new Error();
    const rates = data.rates;
    localStorage.setItem(FX_CACHE_KEY, JSON.stringify({ ts: Date.now(), rates }));
    applyForexRates(rates);
  } catch {
    // Fallback: approximate rates if API unavailable
    applyForexRates({ USD:1.08, GBP:0.86, JPY:163, CHF:0.97, CAD:1.47, AUD:1.65, CNY:7.80, MXN:19.5, BRL:5.5, INR:90, KRW:1450, MAD:10.8 });
    console.warn('FX API indisponible – taux approximatifs utilisés.');
  }
}

function applyForexRates(rates) {
  const devises = CATEGORIES.devises.units;
  for (const [code, unit] of Object.entries(devises)) {
    if (code === 'EUR') { unit.factor = 1; continue; }
    if (rates[code]) unit.factor = rates[code];
  }
  // Refresh UI if on devises tab
  if (currentCat === 'devises') loadCategory('devises');
}

const $catBar = document.getElementById('cat-bar');
const $from = document.getElementById('unit-from');
const $to = document.getElementById('unit-to');
const $input = document.getElementById('input-val');
const $resultVal = document.getElementById('result-value');
const $resultLabel = document.getElementById('result-label');
const $allConv = document.getElementById('all-conversions');
const $historyList = document.getElementById('history-list');

/* ── Init ── */
function init() {
  buildCatBar();
  loadCategory(currentCat);
  $input.addEventListener('input', convert);
  $from.addEventListener('change', convert);
  $to.addEventListener('change', convert);
  document.getElementById('btn-swap').addEventListener('click', swap);
  document.getElementById('btn-clear-history').addEventListener('click', clearHistory);
  renderHistory();
  loadForexRates();
}

function buildCatBar() {
  $catBar.innerHTML = '';
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (key === currentCat ? ' active' : '');
    btn.innerHTML = `<i class="fas ${cat.icon}"></i> ${cat.label}`;
    btn.addEventListener('click', () => {
      currentCat = key;
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadCategory(key);
    });
    $catBar.appendChild(btn);
  }
}

function loadCategory(key) {
  const cat = CATEGORIES[key];
  const keys = Object.keys(cat.units);
  populateSelect($from, cat.units, keys[0]);
  populateSelect($to, cat.units, keys.length > 1 ? keys[1] : keys[0]);
  convert();
}

function populateSelect(sel, units, defaultVal) {
  sel.innerHTML = '';
  for (const [k, u] of Object.entries(units)) {
    if (u.factor === null) continue; // skip currencies not yet loaded
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = u.flag ? `${u.flag} ${u.name} (${k})` : `${u.name} (${k})`;
    sel.appendChild(opt);
  }
  if ([...sel.options].some(o => o.value === defaultVal)) sel.value = defaultVal;
  else if (sel.options.length) sel.value = sel.options[0].value;
}

/* ── Conversion ── */
function convertTemperature(val, from, to) {
  let celsius;
  if (from === 'C') celsius = val;
  else if (from === 'F') celsius = (val - 32) * 5 / 9;
  else celsius = val - 273.15;

  if (to === 'C') return celsius;
  if (to === 'F') return celsius * 9 / 5 + 32;
  return celsius + 273.15;
}

function convertValue(val, from, to) {
  const cat = CATEGORIES[currentCat];
  if (cat.base === 'special') return convertTemperature(val, from, to);
  // For currencies: factor = how many [unit] per EUR
  if (cat.dynamic) {
    const inEur = val / cat.units[from].factor;
    return inEur * cat.units[to].factor;
  }
  const baseVal = val * cat.units[from].factor;
  return baseVal / cat.units[to].factor;
}

function formatNum(n) {
  if (Math.abs(n) >= 1e9 || (Math.abs(n) < 0.0001 && n !== 0)) return n.toExponential(4);
  if (Number.isInteger(n)) return n.toLocaleString('fr-FR');
  const s = n.toPrecision(8);
  return parseFloat(s).toLocaleString('fr-FR', { maximumFractionDigits: 6 });
}

function convert() {
  const val = parseFloat($input.value);
  if (isNaN(val)) { $resultVal.textContent = '—'; $resultLabel.textContent = ''; $allConv.innerHTML = ''; return; }

  const from = $from.value;
  const to = $to.value;
  const result = convertValue(val, from, to);
  const cat = CATEGORIES[currentCat];

  $resultVal.textContent = formatNum(result);
  $resultLabel.textContent = `${val} ${cat.units[from].name} = ${formatNum(result)} ${cat.units[to].name}`;

  // All conversions
  $allConv.innerHTML = '';
  for (const [k, u] of Object.entries(cat.units)) {
    if (k === from) continue;
    const r = convertValue(val, from, k);
    const div = document.createElement('div');
    div.className = 'conv-item';
    div.innerHTML = `<span class="val">${formatNum(r)}</span><span class="unit">${u.name}</span>`;
    $allConv.appendChild(div);
  }

  // Save to history
  addHistory(val, from, result, to);
}

function swap() {
  const tmp = $from.value;
  $from.value = $to.value;
  $to.value = tmp;
  convert();
}

/* ── History ── */
function addHistory(val, from, result, to) {
  const cat = CATEGORIES[currentCat];
  const entry = {
    cat: cat.label,
    from: `${formatNum(val)} ${from}`,
    to: `${formatNum(result)} ${to}`,
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  };
  history.unshift(entry);
  if (history.length > 50) history.pop();
  localStorage.setItem('uc-history', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  if (!history.length) {
    $historyList.innerHTML = '<p class="empty">Aucune conversion enregistrée</p>';
    return;
  }
  $historyList.innerHTML = history.slice(0, 20).map(h =>
    `<div class="history-entry">
      <div><span class="from">${h.from}</span><span class="arrow">→</span><span class="to">${h.to}</span></div>
      <span class="time">${h.time}</span>
    </div>`
  ).join('');
}

function clearHistory() {
  history = [];
  localStorage.removeItem('uc-history');
  renderHistory();
}

init();

/* ── API Dashboard ── */

const WEATHER_ICONS = {
  0: 'fa-sun', 1: 'fa-cloud-sun', 2: 'fa-cloud', 3: 'fa-cloud',
  45: 'fa-smog', 48: 'fa-smog',
  51: 'fa-cloud-rain', 53: 'fa-cloud-rain', 55: 'fa-cloud-showers-heavy',
  61: 'fa-cloud-rain', 63: 'fa-cloud-showers-heavy', 65: 'fa-cloud-showers-heavy',
  71: 'fa-snowflake', 73: 'fa-snowflake', 75: 'fa-snowflake',
  80: 'fa-cloud-rain', 81: 'fa-cloud-showers-heavy', 82: 'fa-cloud-showers-heavy',
  95: 'fa-bolt', 96: 'fa-cloud-bolt', 99: 'fa-cloud-bolt'
};

const WEATHER_DESC = {
  0: 'Ciel dégagé', 1: 'Principalement dégagé', 2: 'Partiellement nuageux', 3: 'Couvert',
  45: 'Brouillard', 48: 'Brouillard givrant',
  51: 'Bruine légère', 53: 'Bruine modérée', 55: 'Bruine dense',
  61: 'Pluie légère', 63: 'Pluie modérée', 65: 'Forte pluie',
  71: 'Neige légère', 73: 'Neige modérée', 75: 'Forte neige',
  80: 'Averses légères', 81: 'Averses modérées', 82: 'Averses violentes',
  95: 'Orage', 96: 'Orage avec grêle légère', 99: 'Orage avec forte grêle'
};

let forecastChart = null;

/* ── Init ── */
function init() {
  document.getElementById('btn-refresh').addEventListener('click', refreshAll);
  document.getElementById('city-select').addEventListener('change', () => { fetchWeather(); fetchForecast(); fetchAirQuality(); });
  startClock();
  startWorldClocks();
  refreshAll();
}

async function refreshAll() {
  const dot = document.getElementById('status-dot');
  const txt = document.getElementById('status-text');
  dot.classList.remove('error');
  txt.textContent = 'Actualisation…';

  try {
    await Promise.allSettled([fetchWeather(), fetchForecast(), fetchCrypto(), fetchQuote(), fetchIP(), fetchNASA(), fetchISS(), loadRandomFact(), loadGitHub(), fetchCurrencyRates(), fetchAirQuality()]);
    dot.classList.remove('error');
    txt.textContent = 'Connecté — ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    dot.classList.add('error');
    txt.textContent = 'Erreur de connexion';
  }
}

/* ── Clock ── */
function startClock() {
  function tick() {
    const now = new Date();
    document.getElementById('clock-time').textContent = now.toLocaleTimeString('fr-FR');
    document.getElementById('clock-date').textContent = now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - startOfYear) / 86400000);
    document.getElementById('clock-day').textContent = dayOfYear;
    const startOfWeek = new Date(now.getFullYear(), 0, 1);
    document.getElementById('clock-week').textContent = Math.ceil(((now - startOfWeek) / 86400000 + startOfWeek.getDay() + 1) / 7);
  }
  tick();
  setInterval(tick, 1000);
}

/* ── Weather ── */
async function fetchWeather() {
  const [lat, lon] = document.getElementById('city-select').value.split(',');
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature&timezone=auto`;
  const res = await fetch(url);
  const data = await res.json();
  const c = data.current;

  const icon = WEATHER_ICONS[c.weather_code] || 'fa-cloud';
  const desc = WEATHER_DESC[c.weather_code] || 'Inconnu';

  document.getElementById('weather-content').innerHTML = `
    <div class="weather-main">
      <i class="fas ${icon} weather-icon" style="color:var(--accent2)"></i>
      <div>
        <div class="weather-temp">${Math.round(c.temperature_2m)}°</div>
        <div class="weather-desc">${desc}</div>
      </div>
    </div>
    <div class="weather-details">
      <div class="weather-detail"><span class="label">Ressenti</span><span class="val">${Math.round(c.apparent_temperature)}°C</span></div>
      <div class="weather-detail"><span class="label">Humidité</span><span class="val">${c.relative_humidity_2m}%</span></div>
      <div class="weather-detail"><span class="label">Vent</span><span class="val">${Math.round(c.wind_speed_10m)} km/h</span></div>
      <div class="weather-detail"><span class="label">Code météo</span><span class="val">${c.weather_code}</span></div>
    </div>
  `;
}

/* ── Forecast ── */
async function fetchForecast() {
  const [lat, lon] = document.getElementById('city-select').value.split(',');
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;
  const res = await fetch(url);
  const data = await res.json();
  const d = data.daily;

  const labels = d.time.map(t => {
    const date = new Date(t);
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
  });

  const ctx = document.getElementById('forecast-chart').getContext('2d');
  if (forecastChart) forecastChart.destroy();
  forecastChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Max °C', data: d.temperature_2m_max, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.1)', fill: true, tension: .4, pointRadius: 4 },
        { label: 'Min °C', data: d.temperature_2m_min, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,.1)', fill: true, tension: .4, pointRadius: 4 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#6b7a90', font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: '#6b7a90' }, grid: { color: 'rgba(255,255,255,.04)' } },
        y: { ticks: { color: '#6b7a90', callback: v => v + '°' }, grid: { color: 'rgba(255,255,255,.04)' } }
      }
    }
  });
}

/* ── Crypto ── */
async function fetchCrypto() {
  const coins = ['bitcoin', 'ethereum', 'solana', 'cardano', 'dogecoin'];
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&ids=${coins.join(',')}&order=market_cap_desc`;
  try {
    const res = await fetch(url);
    const data = await res.json();

    document.getElementById('crypto-grid').innerHTML = data.map(c => {
      const up = c.price_change_percentage_24h >= 0;
      return `<div class="crypto-row">
        <div class="crypto-left">
          <img class="crypto-icon" src="${c.image}" alt="${c.name}" />
          <div><div class="crypto-name">${c.name}</div><div class="crypto-symbol">${c.symbol}</div></div>
        </div>
        <div style="text-align:right">
          <div class="crypto-price">${c.current_price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</div>
          <span class="crypto-change ${up ? 'up' : 'down'}">${up ? '+' : ''}${c.price_change_percentage_24h.toFixed(2)}%</span>
        </div>
      </div>`;
    }).join('');
    document.getElementById('crypto-update').textContent = 'MàJ ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    document.getElementById('crypto-grid').innerHTML = '<p style="color:var(--muted);text-align:center;padding:20px">API Crypto indisponible (limite de requêtes)</p>';
  }
}

/* ── Quote ── */
async function fetchQuote() {
  // Quotes locales (offline-friendly)
  const quotes = [
    { text: "La vie, c'est comme une bicyclette, il faut avancer pour ne pas perdre l'équilibre.", author: "Albert Einstein" },
    { text: "Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme.", author: "Winston Churchill" },
    { text: "La seule façon de faire du bon travail est d'aimer ce que vous faites.", author: "Steve Jobs" },
    { text: "L'imagination est plus importante que le savoir.", author: "Albert Einstein" },
    { text: "Ce n'est pas parce que les choses sont difficiles que nous n'osons pas, c'est parce que nous n'osons pas qu'elles sont difficiles.", author: "Sénèque" },
    { text: "Le meilleur moment pour planter un arbre était il y a 20 ans. Le deuxième meilleur moment est maintenant.", author: "Proverbe chinois" },
    { text: "La simplicité est la sophistication suprême.", author: "Léonard de Vinci" },
    { text: "Celui qui n'a pas d'objectifs ne risque pas de les atteindre.", author: "Sun Tzu" },
    { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
    { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
    { text: "La persévérance n'est pas une longue course, c'est plusieurs petites courses les unes après les autres.", author: "Walter Elliot" }
  ];
  const today = new Date();
  const idx = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % quotes.length;
  const q = quotes[idx];
  document.getElementById('quote-content').innerHTML = `
    <blockquote>"${q.text}"</blockquote>
    <div class="author">— ${q.author}</div>
  `;
}

/* ── IP ── */
async function fetchIP() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    document.getElementById('ip-content').innerHTML = `
      <div class="ip-addr">${data.ip}</div>
      <div class="ip-details">
        <div class="ip-detail"><span class="label">Ville</span> ${data.city || '—'}</div>
        <div class="ip-detail"><span class="label">Région</span> ${data.region || '—'}</div>
        <div class="ip-detail"><span class="label">Pays</span> ${data.country_name || '—'}</div>
        <div class="ip-detail"><span class="label">FAI</span> ${data.org || '—'}</div>
      </div>
    `;
  } catch {
    document.getElementById('ip-content').innerHTML = '<p style="color:var(--muted);text-align:center">Impossible de récupérer l\'IP</p>';
  }
}

/* ── NASA APOD ── */
async function fetchNASA() {
  try {
    // L'API NASA peut rester sans réponse : on abandonne après 8 s
    const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const isVideo = data.media_type === 'video';
    document.getElementById('nasa-content').innerHTML = `
      ${isVideo
        ? `<iframe src="${data.url}" style="width:100%;height:280px;border-radius:12px;border:none" allowfullscreen></iframe>`
        : `<img src="${data.url}" alt="${data.title}" style="width:100%;height:280px;object-fit:cover;border-radius:12px" />`
      }
      <div style="margin-top:12px">
        <strong>${data.title}</strong>
        <p style="font-size:.85rem;color:var(--muted);margin-top:6px;line-height:1.5">${data.explanation.substring(0, 200)}…</p>
        <small style="color:var(--muted)">${data.date}</small>
      </div>
    `;
  } catch {
    document.getElementById('nasa-content').innerHTML = '<p style="color:var(--muted);text-align:center">API NASA momentanément indisponible (quota ou panne) – réessaie avec « Actualiser »</p>';
  }
}

/* ── ISS Tracker ── */
async function fetchISS() {
  try {
    const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const pos = await res.json();
    document.getElementById('iss-content').innerHTML = `
      <div style="text-align:center;padding:10px 0">
        <div style="font-size:2.5rem;margin-bottom:8px">🛸</div>
        <div style="font-size:.9rem;color:var(--muted);margin-bottom:12px">Position en temps réel</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="background:rgba(255,255,255,.04);padding:12px;border-radius:10px">
            <div style="font-size:.75rem;color:var(--muted)">Latitude</div>
            <div style="font-size:1.2rem;font-weight:700">${parseFloat(pos.latitude).toFixed(4)}°</div>
          </div>
          <div style="background:rgba(255,255,255,.04);padding:12px;border-radius:10px">
            <div style="font-size:.75rem;color:var(--muted)">Longitude</div>
            <div style="font-size:1.2rem;font-weight:700">${parseFloat(pos.longitude).toFixed(4)}°</div>
          </div>
        </div>
        <div style="margin-top:10px;font-size:.75rem;color:var(--muted)">Vitesse : ${Math.round(pos.velocity).toLocaleString('fr-FR')} km/h • Altitude : ${Math.round(pos.altitude)} km</div>
      </div>
    `;
  } catch {
    document.getElementById('iss-content').innerHTML = '<p style="color:var(--muted);text-align:center">API ISS indisponible</p>';
  }
}

/* ── Random Fact ── */
const FACTS = [
  "Le miel ne périme jamais. On a retrouvé du miel vieux de 3000 ans dans des tombes égyptiennes, encore comestible.",
  "Les poulpes ont trois cœurs et du sang bleu.",
  "Un photon met 8 minutes pour aller du Soleil à la Terre.",
  "Les bananes sont légèrement radioactives à cause du potassium-40.",
  "Il pleut des diamants sur Neptune et Uranus.",
  "Le cerveau humain consomme environ 20 watts d'énergie — autant qu'une ampoule faible.",
  "L'empreinte de langue de chaque personne est unique, comme les empreintes digitales.",
  "La lumière du Soleil qui nous éclaire a été créée dans le noyau solaire il y a environ 100 000 ans.",
  "Les girafes n'ont que 7 vertèbres cervicales, comme les humains.",
  "Un nuage pèse en moyenne 500 tonnes.",
  "Les requins existaient avant les arbres (450 millions vs 350 millions d'années).",
  "Cléopâtre vivait plus proche dans le temps de la création de Pizza Hut que de la construction des pyramides.",
  "Il y a plus de façons d'ordonner un jeu de 52 cartes qu'il n'y a d'atomes sur Terre."
];

async function loadRandomFact() {
  const fact = FACTS[Math.floor(Math.random() * FACTS.length)];
  const el = document.getElementById('fact-content');
  if (el) el.innerHTML = `<div style="padding:8px 0;line-height:1.7;font-size:.95rem">${fact}</div>`;
}

/* ── GitHub Stats ── */
async function loadGitHub() {
  const username = document.getElementById('github-user')?.value?.trim() || 'slayzbs';
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
    if (!res.ok) throw new Error('not found');
    const u = await res.json();
    const reposRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=5&sort=updated`);
    const repos = await reposRes.json();
    document.getElementById('github-content').innerHTML = `
      <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px">
        <img src="${u.avatar_url}" style="width:56px;height:56px;border-radius:50%;border:2px solid rgba(255,255,255,.1)" />
        <div>
          <div style="font-weight:700;font-size:1.1rem">${u.name || u.login}</div>
          <div style="font-size:.8rem;color:var(--muted)">${u.bio || ''}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
        <div style="text-align:center;background:rgba(255,255,255,.04);padding:10px;border-radius:10px">
          <div style="font-size:1.2rem;font-weight:700">${u.public_repos}</div><div style="font-size:.7rem;color:var(--muted)">Repos</div>
        </div>
        <div style="text-align:center;background:rgba(255,255,255,.04);padding:10px;border-radius:10px">
          <div style="font-size:1.2rem;font-weight:700">${u.followers}</div><div style="font-size:.7rem;color:var(--muted)">Followers</div>
        </div>
        <div style="text-align:center;background:rgba(255,255,255,.04);padding:10px;border-radius:10px">
          <div style="font-size:1.2rem;font-weight:700">${u.following}</div><div style="font-size:.7rem;color:var(--muted)">Following</div>
        </div>
      </div>
      <div style="font-size:.8rem;color:var(--muted);margin-bottom:8px">Derniers repos :</div>
      ${repos.map(r => `<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:.85rem">
        <a href="${r.html_url}" target="_blank" rel="noreferrer" style="color:var(--accent);text-decoration:none;font-weight:600">${r.name}</a>
        ${r.language ? `<span style="margin-left:8px;font-size:.7rem;padding:2px 8px;border-radius:99px;background:rgba(255,255,255,.06);color:var(--muted)">${r.language}</span>` : ''}
        <span style="float:right;color:var(--muted);font-size:.75rem">⭐ ${r.stargazers_count}</span>
      </div>`).join('')}
    `;
  } catch {
    document.getElementById('github-content').innerHTML = `<p style="color:var(--muted);text-align:center">Utilisateur "${username}" introuvable</p>`;
  }
}


/* ── Currency Converter ── */
let currencyRates = {};

const CURRENCY_LIST = ['EUR','USD','GBP','JPY','CAD','AUD','CHF','CNY','INR','BRL','MXN','RUB','KRW','TRY','NOK','SEK','DKK','PLN','HUF','CZK','ZAR','AED','SAR','SGD','HKD','NZD','THB','IDR','MYR','PHP'];

async function fetchCurrencyRates() {
  try {
    // Taux de référence en EUR ; les autres paires sont calculées par taux croisé
    const res = await fetch('https://api.frankfurter.dev/v1/latest?base=EUR');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    currencyRates = { ...data.rates, [data.base]: 1 };

    // Remplit les listes avec les seules devises fournies par l'API
    const fromSel = document.getElementById('currency-from');
    const toSel = document.getElementById('currency-to');
    if (fromSel && fromSel.options.length === 0) {
      CURRENCY_LIST.filter(c => currencyRates[c]).forEach(c => {
        fromSel.add(new Option(c, c));
        toSel.add(new Option(c, c));
      });
      fromSel.value = 'EUR';
      toSel.value = 'USD';
    }

    renderPopularRates();

    const upEl = document.getElementById('currency-update');
    if (upEl) upEl.textContent = 'MàJ ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    convertCurrency();
  } catch {
    const el = document.getElementById('currency-result');
    if (el) el.textContent = 'API devises indisponible';
  }
}

function crossRate(from, to) {
  if (!currencyRates[from] || !currencyRates[to]) return null;
  return currencyRates[to] / currencyRates[from];
}

function renderPopularRates() {
  const from = document.getElementById('currency-from')?.value || 'EUR';
  const popular = ['USD','GBP','JPY','CHF','CAD','AUD','EUR'].filter(c => c !== from).slice(0, 6);
  const ratesEl = document.getElementById('currency-rates');
  if (!ratesEl) return;
  ratesEl.innerHTML = popular.map(cur => {
    const rate = crossRate(from, cur);
    return rate ? `<div style="background:rgba(255,255,255,.04);padding:8px;border-radius:8px;text-align:center">
      <div style="font-weight:700;font-size:1rem;color:var(--accent)">${rate.toFixed(cur === 'JPY' ? 2 : 4)}</div>
      <div style="font-size:.7rem;color:var(--muted);margin-top:2px">${from}→${cur}</div>
    </div>` : '';
  }).join('');
}

function convertCurrency() {
  const amount = parseFloat(document.getElementById('currency-amount')?.value) || 0;
  const from   = document.getElementById('currency-from')?.value || 'EUR';
  const to     = document.getElementById('currency-to')?.value   || 'USD';
  const el     = document.getElementById('currency-result');
  if (!el) return;

  renderPopularRates();
  if (from === to) { el.textContent = `${amount.toLocaleString('fr-FR')} ${from}`; return; }

  const rate = crossRate(from, to);
  if (rate === null) { el.textContent = 'Taux indisponible pour cette paire'; return; }

  const result = amount * rate;
  el.textContent = `${amount.toLocaleString('fr-FR')} ${from} = ${result.toLocaleString('fr-FR', { maximumFractionDigits: 4 })} ${to}`;
}

// Add live conversion events after DOM load
document.addEventListener('DOMContentLoaded', () => {
  ['currency-amount','currency-from','currency-to'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', convertCurrency);
    if (el && el.tagName === 'INPUT') el.addEventListener('input', convertCurrency);
  });
});

/* ── Air Quality ── */
const AQI_LABELS = ['Excellent','Bon','Acceptable','Mauvais','Très mauvais','Dangereux'];
const AQI_COLORS = ['#22c55e','#84cc16','#facc15','#f97316','#ef4444','#7c3aed'];

async function fetchAirQuality() {
  try {
    const [lat, lon] = document.getElementById('city-select').value.split(',');
    const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm2_5,pm10,carbon_dioxide,ozone`);
    const data = await res.json();
    const c = data.current;
    const aqi = c.european_aqi;
    const level = Math.min(5, Math.floor(aqi / 20));
    const color = AQI_COLORS[level];
    const label = AQI_LABELS[level];

    document.getElementById('air-content').innerHTML = `
      <div style="text-align:center;padding:8px 0">
        <div style="font-size:2.5rem;font-weight:800;color:${color};margin-bottom:4px">${aqi}</div>
        <div style="font-size:1rem;font-weight:600;color:${color};margin-bottom:12px">${label}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="background:rgba(255,255,255,.04);padding:10px;border-radius:10px">
            <div style="font-size:.7rem;color:var(--muted)">PM2.5</div>
            <div style="font-weight:700">${c.pm2_5?.toFixed(1) ?? '—'} μg/m³</div>
          </div>
          <div style="background:rgba(255,255,255,.04);padding:10px;border-radius:10px">
            <div style="font-size:.7rem;color:var(--muted)">PM10</div>
            <div style="font-weight:700">${c.pm10?.toFixed(1) ?? '—'} μg/m³</div>
          </div>
          <div style="background:rgba(255,255,255,.04);padding:10px;border-radius:10px">
            <div style="font-size:.7rem;color:var(--muted)">Ozone</div>
            <div style="font-weight:700">${c.ozone?.toFixed(0) ?? '—'} μg/m³</div>
          </div>
          <div style="background:rgba(255,255,255,.04);padding:10px;border-radius:10px">
            <div style="font-size:.7rem;color:var(--muted)">CO₂</div>
            <div style="font-weight:700">${c.carbon_dioxide?.toFixed(0) ?? '—'} ppm</div>
          </div>
        </div>
      </div>
    `;
  } catch {
    document.getElementById('air-content').innerHTML = '<p style="color:var(--muted);text-align:center">Qualité de l\'air indisponible</p>';
  }
}

/* ── World Clocks ── */
const WORLD_ZONES = [
  { city: 'New York',   tz: 'America/New_York',    flag: '🇺🇸' },
  { city: 'Los Angeles',tz: 'America/Los_Angeles',  flag: '🇺🇸' },
  { city: 'London',     tz: 'Europe/London',        flag: '🇬🇧' },
  { city: 'Paris',      tz: 'Europe/Paris',         flag: '🇫🇷' },
  { city: 'Tokyo',      tz: 'Asia/Tokyo',           flag: '🇯🇵' },
  { city: 'Sydney',     tz: 'Australia/Sydney',     flag: '🇦🇺' },
  { city: 'Dubaï',      tz: 'Asia/Dubai',           flag: '🇦🇪' },
  { city: 'Pékin',      tz: 'Asia/Shanghai',        flag: '🇨🇳' },
  { city: 'São Paulo',  tz: 'America/Sao_Paulo',    flag: '🇧🇷' },
  { city: 'Moscou',     tz: 'Europe/Moscow',        flag: '🇷🇺' },
];

function startWorldClocks() {
  const el = document.getElementById('worldclock-content');
  if (!el) return;

  function tick() {
    const now = new Date();
    el.innerHTML = WORLD_ZONES.map(z => {
      const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: z.tz });
      const date = now.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: z.tz });
      return `<div style="background:rgba(255,255,255,.04);padding:10px;border-radius:10px;text-align:center">
        <div style="font-size:1.4rem">${z.flag}</div>
        <div style="font-size:.75rem;color:var(--muted);margin:2px 0">${z.city}</div>
        <div style="font-size:1.05rem;font-weight:700;font-variant-numeric:tabular-nums">${time}</div>
        <div style="font-size:.65rem;color:var(--muted)">${date}</div>
      </div>`;
    }).join('');
  }
  tick();
  setInterval(tick, 1000);
}

// Lancement une fois toutes les constantes déclarées
init();

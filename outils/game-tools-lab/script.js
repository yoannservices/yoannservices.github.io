const state = {
  timers: {},
  mic: null,
  micAnim: null,
  fpsAnim: null
};

const toolTitles = {
  cps: "Test CPS",
  rcps: "Test CPS clic droit",
  apm: "Test APM",
  spacebar: "Spacebar Clicker",
  keyclicker: "Keyboard Clicker",
  reaction: "Test de reaction",
  areaction: "Reaction auditive",
  scroll: "Test scroll souris",
  polling: "Mouse Polling Rate",
  dblclick: "Test double clic",
  drag: "Test glisser souris",
  fps: "Moniteur FPS",
  screen: "Infos ecran",
  ping: "Ping test local",
  mic: "Test microphone",
  edpi: "Calculateur eDPI",
  sens: "Convertisseur sensibilite",
  ppi: "Calculateur PPI",
  ram: "Latence RAM",
  wpm: "Test WPM",
  jitter: "Jitter Test",
  metro: "Métronome",
  frametime: "Frame Time"
};

const templateMap = {
  cps: "tpl-cps",
  rcps: "tpl-cps",
  apm: "tpl-apm",
  spacebar: "tpl-apm",
  keyclicker: "tpl-apm",
  reaction: "tpl-reaction",
  areaction: "tpl-areaction",
  scroll: "tpl-scroll",
  polling: "tpl-polling",
  dblclick: "tpl-dblclick",
  drag: "tpl-drag",
  fps: "tpl-fps",
  screen: "tpl-screen",
  ping: "tpl-ping",
  mic: "tpl-mic",
  edpi: "tpl-edpi",
  sens: "tpl-sens",
  ppi: "tpl-ppi",
  ram: "tpl-ram",
  wpm: "tpl-wpm",
  jitter: "tpl-jitter",
  metro: "tpl-metro",
  frametime: "tpl-frametime"
};

const dialog = document.getElementById("toolDialog");
const dialogTitle = document.getElementById("dialogTitle");
const dialogBody = document.getElementById("dialogBody");

document.getElementById("closeDialog").addEventListener("click", closeTool);
dialog.addEventListener("close", cleanupTool);

for (const btn of document.querySelectorAll(".tool-card button")) {
  btn.addEventListener("click", () => openTool(btn.dataset.tool));
}

for (const btn of document.querySelectorAll(".filter-btn")) {
  btn.addEventListener("click", () => filterBy(btn.dataset.filter, btn));
}

document.getElementById("searchTool").addEventListener("input", filterBySearch);

function filterBy(category, activeBtn) {
  for (const b of document.querySelectorAll(".filter-btn")) b.classList.remove("active");
  activeBtn.classList.add("active");

  const cards = document.querySelectorAll(".tool-card");
  cards.forEach((card) => {
    if (category === "all") card.style.display = "block";
    else card.style.display = card.dataset.cat.includes(category) ? "block" : "none";
  });
}

function filterBySearch(event) {
  const query = event.target.value.trim().toLowerCase();
  const cards = document.querySelectorAll(".tool-card");
  cards.forEach((card) => {
    const raw = `${card.querySelector("h3").textContent} ${card.dataset.key}`.toLowerCase();
    card.style.display = raw.includes(query) ? "block" : "none";
  });
}

function openTool(tool) {
  cleanupTool();
  dialogTitle.textContent = toolTitles[tool] || "Outil";

  const tpl = document.getElementById(templateMap[tool]);
  dialogBody.innerHTML = "";
  dialogBody.appendChild(tpl.content.cloneNode(true));

  bindTool(tool);
  dialog.showModal();
}

function closeTool() {
  dialog.close();
}

function cleanupTool() {
  Object.values(state.timers).forEach(clearTimeout);
  state.timers = {};

  if (state.fpsAnim) cancelAnimationFrame(state.fpsAnim);
  state.fpsAnim = null;

  if (state.micAnim) cancelAnimationFrame(state.micAnim);
  state.micAnim = null;

  if (state.mic && state.mic.stream) {
    state.mic.stream.getTracks().forEach((t) => t.stop());
  }
  state.mic = null;
}

function bindTool(tool) {
  switch (tool) {
    case "cps":
    case "rcps":
      initCps(tool === "rcps");
      break;
    case "apm":
      initApm("all");
      break;
    case "spacebar":
      initApm("space");
      break;
    case "keyclicker":
      initApm("all", true);
      break;
    case "reaction":
      initReaction();
      break;
    case "areaction":
      initAuditoryReaction();
      break;
    case "scroll":
      initScroll();
      break;
    case "polling":
      initPolling();
      break;
    case "dblclick":
      initDoubleClick();
      break;
    case "drag":
      initDrag();
      break;
    case "fps":
      initFps();
      break;
    case "screen":
      initScreenInfo();
      break;
    case "ping":
      initPing();
      break;
    case "mic":
      initMic();
      break;
    case "edpi":
      initEdpi();
      break;
    case "sens":
      initSens();
      break;
    case "ppi":
      initPpi();
      break;
    case "ram":
      initRam();
      break;
    case "wpm":
      initWpm();
      break;
    case "jitter":
      initJitter();
      break;
    case "metro":
      initMetro();
      break;
    case "frametime":
      initFrameTime();
      break;
    default:
      dialogBody.innerHTML = "<p>Outil indisponible</p>";
  }
}

function initCps(rightClickMode) {
  const countOut = dialogBody.querySelector('[data-out="count"]');
  const cpsOut = dialogBody.querySelector('[data-out="cps"]');
  const zone = dialogBody.querySelector('[data-act="clickzone"]');
  const start = dialogBody.querySelector('[data-act="start"]');
  const reset = dialogBody.querySelector('[data-act="reset"]');

  let count = 0;
  let running = false;
  let startedAt = 0;

  const clickHandler = (event) => {
    if (!running) return;
    if (rightClickMode && event.button !== 2) return;
    if (!rightClickMode && event.button !== 0) return;
    event.preventDefault();
    count += 1;
    const elapsed = (Date.now() - startedAt) / 1000;
    countOut.textContent = String(count);
    cpsOut.textContent = elapsed > 0 ? (count / elapsed).toFixed(2) : "0.00";
  };

  if (rightClickMode) {
    zone.addEventListener("contextmenu", (e) => e.preventDefault());
    zone.addEventListener("mousedown", clickHandler);
  } else {
    zone.addEventListener("mousedown", clickHandler);
  }

  start.addEventListener("click", () => {
    count = 0;
    running = true;
    startedAt = Date.now();
    countOut.textContent = "0";
    cpsOut.textContent = "0.00";
    state.timers.cpsStop = setTimeout(() => {
      running = false;
      const elapsed = (Date.now() - startedAt) / 1000;
      const cps = elapsed > 0 ? (count / elapsed).toFixed(2) : "0.00";
      saveResult(rightClickMode ? "rcps" : "cps", `${count} clics — ${cps} CPS`);
    }, 10000);
  });

  reset.addEventListener("click", () => {
    running = false;
    count = 0;
    countOut.textContent = "0";
    cpsOut.textContent = "0.00";
  });
}

function initApm(mode, endless) {
  const keysOut = dialogBody.querySelector('[data-out="keys"]');
  const apmOut = dialogBody.querySelector('[data-out="apm"]');
  const start = dialogBody.querySelector('[data-act="start"]');
  const reset = dialogBody.querySelector('[data-act="reset"]');

  let keyCount = 0;
  let running = false;
  let startedAt = 0;

  const keyHandler = (e) => {
    if (!running) return;
    if (mode === "space" && e.code !== "Space") return;
    keyCount += 1;
    keysOut.textContent = String(keyCount);

    const mins = Math.max((Date.now() - startedAt) / 60000, 1 / 60);
    apmOut.textContent = String(Math.round(keyCount / mins));
  };

  window.addEventListener("keydown", keyHandler);

  start.addEventListener("click", () => {
    keyCount = 0;
    keysOut.textContent = "0";
    apmOut.textContent = "0";
    running = true;
    startedAt = Date.now();

    if (!endless) {
      state.timers.apmStop = setTimeout(() => {
        running = false;
      }, 30000);
    }
  });

  reset.addEventListener("click", () => {
    running = false;
    keyCount = 0;
    keysOut.textContent = "0";
    apmOut.textContent = "0";
  });

  dialog.addEventListener("close", () => window.removeEventListener("keydown", keyHandler), { once: true });
}

function initReaction() {
  const out = dialogBody.querySelector('[data-out="ms"]');
  const start = dialogBody.querySelector('[data-act="start"]');
  const hit = dialogBody.querySelector('[data-act="hit"]');
  let canHit = false;
  let t0 = 0;

  start.addEventListener("click", () => {
    canHit = false;
    hit.classList.remove("ready");
    hit.classList.add("waiting");
    hit.textContent = "Attends...";
    const delay = 1200 + Math.random() * 2200;
    state.timers.react = setTimeout(() => {
      canHit = true;
      t0 = performance.now();
      hit.classList.remove("waiting");
      hit.classList.add("ready");
      hit.textContent = "CLIQUE MAINTENANT";
    }, delay);
  });

  hit.addEventListener("click", () => {
    if (!canHit) {
      out.textContent = "Trop tot";
      return;
    }
    const ms = Math.round(performance.now() - t0);
    out.textContent = ms;
    saveResult("reaction", `${ms} ms`);
    canHit = false;
    hit.classList.remove("ready");
    hit.textContent = "Relance un test";
  });
}

function initAuditoryReaction() {
  const out = dialogBody.querySelector('[data-out="ms"]');
  const start = dialogBody.querySelector('[data-act="start"]');
  const hit = dialogBody.querySelector('[data-act="hit"]');
  let startMs = 0;
  let active = false;

  const beep = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 720;
    gain.gain.value = 0.03;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  };

  start.addEventListener("click", () => {
    active = false;
    out.textContent = "-";
    const delay = 900 + Math.random() * 2400;
    state.timers.areact = setTimeout(() => {
      beep();
      startMs = performance.now();
      active = true;
    }, delay);
  });

  hit.addEventListener("click", () => {
    if (!active) {
      out.textContent = "Trop tot";
      return;
    }
    out.textContent = Math.round(performance.now() - startMs);
    active = false;
  });
}

function initScroll() {
  const out = dialogBody.querySelector('[data-out="wheel"]');
  const zone = dialogBody.querySelector('[data-act="zone"]');
  let count = 0;

  zone.addEventListener("wheel", () => {
    count += 1;
    out.textContent = String(count);
  });
}

function initPolling() {
  const out = dialogBody.querySelector('[data-out="hz"]');
  const zone = dialogBody.querySelector('[data-act="zone"]');
  const start = dialogBody.querySelector('[data-act="start"]');

  let collecting = false;
  let events = 0;

  zone.addEventListener("mousemove", () => {
    if (!collecting) return;
    events += 1;
  });

  start.addEventListener("click", () => {
    events = 0;
    collecting = true;
    out.textContent = "...";
    const t0 = performance.now();
    state.timers.poll = setTimeout(() => {
      collecting = false;
      const secs = (performance.now() - t0) / 1000;
      out.textContent = String(Math.round(events / secs));
    }, 3000);
  });
}

function initDoubleClick() {
  const out = dialogBody.querySelector('[data-out="dbl"]');
  const zone = dialogBody.querySelector('[data-act="zone"]');
  let c = 0;
  zone.addEventListener("dblclick", () => {
    c += 1;
    out.textContent = String(c);
  });
}

function initDrag() {
  const dot = dialogBody.querySelector('[data-act="dot"]');
  const wrap = dialogBody.querySelector(".drag-wrap");
  const out = dialogBody.querySelector('[data-out="dist"]');

  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let dist = 0;

  const down = (e) => {
    dragging = true;
    const r = dot.getBoundingClientRect();
    lastX = e.clientX;
    lastY = e.clientY;
    dot.style.cursor = "grabbing";
    e.preventDefault();
  };

  const move = (e) => {
    if (!dragging) return;

    const w = wrap.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - w.left - 18, w.width - 36));
    const y = Math.max(0, Math.min(e.clientY - w.top - 18, w.height - 36));

    dist += Math.hypot(e.clientX - lastX, e.clientY - lastY);
    out.textContent = Math.round(dist);

    lastX = e.clientX;
    lastY = e.clientY;

    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
  };

  const up = () => {
    dragging = false;
    dot.style.cursor = "grab";
  };

  dot.addEventListener("pointerdown", down);
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);

  dialog.addEventListener("close", () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  }, { once: true });
}

function initFps() {
  const out = dialogBody.querySelector('[data-out="fps"]');
  const start = dialogBody.querySelector('[data-act="start"]');
  const stop = dialogBody.querySelector('[data-act="stop"]');

  let running = false;
  let last = 0;
  let frames = 0;
  let sumFps = 0;

  const loop = (ts) => {
    if (!running) return;
    if (last) {
      const fps = 1000 / (ts - last);
      sumFps += fps;
      frames += 1;
      out.textContent = (sumFps / frames).toFixed(1);
    }
    last = ts;
    state.fpsAnim = requestAnimationFrame(loop);
  };

  start.addEventListener("click", () => {
    running = true;
    last = 0;
    frames = 0;
    sumFps = 0;
    state.fpsAnim = requestAnimationFrame(loop);
  });

  stop.addEventListener("click", () => {
    running = false;
    if (state.fpsAnim) cancelAnimationFrame(state.fpsAnim);
  });
}

function initScreenInfo() {
  const res = dialogBody.querySelector('[data-out="res"]');
  const vp = dialogBody.querySelector('[data-out="vp"]');
  const dpr = dialogBody.querySelector('[data-out="dpr"]');
  const ori = dialogBody.querySelector('[data-out="ori"]');

  const refresh = () => {
    res.textContent = `${screen.width} x ${screen.height}`;
    vp.textContent = `${window.innerWidth} x ${window.innerHeight}`;
    dpr.textContent = String(window.devicePixelRatio || 1);
    ori.textContent = screen.orientation ? screen.orientation.type : "non disponible";
  };

  refresh();
  window.addEventListener("resize", refresh);
  dialog.addEventListener("close", () => window.removeEventListener("resize", refresh), { once: true });
}

function initPing() {
  const urlInput = dialogBody.querySelector('[data-in="url"]');
  const run = dialogBody.querySelector('[data-act="run"]');
  const out = dialogBody.querySelector('[data-out="ms"]');

  run.addEventListener("click", async () => {
    const url = urlInput.value.trim();
    if (!url) return;

    try {
      const t0 = performance.now();
      await fetch(`${url}${url.includes("?") ? "&" : "?"}ts=${Date.now()}`, { method: "GET", mode: "no-cors", cache: "no-store" });
      out.textContent = String(Math.round(performance.now() - t0));
    } catch (_e) {
      out.textContent = "Echec";
    }
  });
}

function initMic() {
  const start = dialogBody.querySelector('[data-act="start"]');
  const stop = dialogBody.querySelector('[data-act="stop"]');
  const lvlOut = dialogBody.querySelector('[data-out="lvl"]');
  const bar = dialogBody.querySelector('[data-out="bar"]');

  start.addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      state.mic = { stream, ctx, analyser };

      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const pct = Math.round((avg / 255) * 100);
        bar.style.width = `${pct}%`;
        lvlOut.textContent = String(pct);
        state.micAnim = requestAnimationFrame(tick);
      };

      state.micAnim = requestAnimationFrame(tick);
    } catch (_e) {
      lvlOut.textContent = "permission refusee";
    }
  });

  stop.addEventListener("click", cleanupTool);
}

function initEdpi() {
  const dpi = dialogBody.querySelector('[data-in="dpi"]');
  const sens = dialogBody.querySelector('[data-in="sens"]');
  const out = dialogBody.querySelector('[data-out="edpi"]');
  const calc = dialogBody.querySelector('[data-act="calc"]');

  calc.addEventListener("click", () => {
    const v = Number(dpi.value) * Number(sens.value);
    out.textContent = v.toFixed(2);
  });
}

function initSens() {
  const base = dialogBody.querySelector('[data-in="base"]');
  const from = dialogBody.querySelector('[data-in="from"]');
  const to = dialogBody.querySelector('[data-in="to"]');
  const out = dialogBody.querySelector('[data-out="result"]');
  const convert = dialogBody.querySelector('[data-act="convert"]');

  convert.addEventListener("click", () => {
    const result = Number(base.value) * (Number(to.value) / Number(from.value));
    out.textContent = result.toFixed(4);
  });
}

function initPpi() {
  const w = dialogBody.querySelector('[data-in="w"]');
  const h = dialogBody.querySelector('[data-in="h"]');
  const inch = dialogBody.querySelector('[data-in="inch"]');
  const out = dialogBody.querySelector('[data-out="ppi"]');
  const calc = dialogBody.querySelector('[data-act="calc"]');

  calc.addEventListener("click", () => {
    const pxDiag = Math.hypot(Number(w.value), Number(h.value));
    out.textContent = (pxDiag / Number(inch.value)).toFixed(2);
  });
}

function initRam() {
  const freq = dialogBody.querySelector('[data-in="freq"]');
  const cl = dialogBody.querySelector('[data-in="cl"]');
  const out = dialogBody.querySelector('[data-out="ns"]');
  const calc = dialogBody.querySelector('[data-act="calc"]');

  calc.addEventListener("click", () => {
    const ns = (Number(cl.value) * 2000) / Number(freq.value);
    out.textContent = ns.toFixed(2);
    saveResult("ram", `Latence: ${ns.toFixed(2)} ns`);
  });
}

/* ── HISTORY SYSTEM (localStorage) ── */
function getHistory() {
  return JSON.parse(localStorage.getItem("xbit-history") || "[]");
}

function saveResult(tool, result) {
  const history = getHistory();
  history.unshift({
    tool: toolTitles[tool] || tool,
    result,
    date: new Date().toISOString()
  });
  if (history.length > 50) history.length = 50;
  localStorage.setItem("xbit-history", JSON.stringify(history));
  updateHistoryBadge();
}

function updateHistoryBadge() {
  const badge = document.getElementById("history-count");
  if (badge) badge.textContent = getHistory().length;
}

function showHistory() {
  const history = getHistory();
  dialogTitle.textContent = "📊 Historique des résultats";
  dialogBody.innerHTML = history.length === 0
    ? `<p style="text-align:center;color:#888;padding:20px">Aucun résultat enregistré.</p>`
    : `<div style="max-height:400px;overflow-y:auto">
        <table style="width:100%;border-collapse:collapse;font-size:.88rem">
          <thead><tr style="border-bottom:1px solid rgba(255,255,255,.1)">
            <th style="text-align:left;padding:8px;color:#888">Outil</th>
            <th style="text-align:left;padding:8px;color:#888">Résultat</th>
            <th style="text-align:left;padding:8px;color:#888">Date</th>
          </tr></thead>
          <tbody>${history.map(h => {
            const d = new Date(h.date);
            return `<tr style="border-bottom:1px solid rgba(255,255,255,.05)">
              <td style="padding:8px;font-weight:600">${h.tool}</td>
              <td style="padding:8px">${h.result}</td>
              <td style="padding:8px;color:#888;font-size:.8rem">${d.toLocaleDateString("fr-FR")} ${d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</td>
            </tr>`;
          }).join("")}</tbody>
        </table>
      </div>
      <div style="margin-top:12px;display:flex;gap:8px;justify-content:center">
        <button onclick="copyHistory()" style="padding:8px 16px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:#fff;cursor:pointer;font-size:.85rem">📋 Copier tout</button>
        <button onclick="clearHistory()" style="padding:8px 16px;border-radius:8px;border:1px solid rgba(239,68,68,.3);background:rgba(239,68,68,.1);color:#ef4444;cursor:pointer;font-size:.85rem">🗑️ Effacer</button>
      </div>`;
  dialog.showModal();
}

function copyHistory() {
  const history = getHistory();
  const text = history.map(h => `${h.tool}: ${h.result} (${new Date(h.date).toLocaleString("fr-FR")})`).join("\n");
  navigator.clipboard.writeText(text).then(() => {
    alert("Historique copié !");
  });
}

function clearHistory() {
  if (confirm("Effacer tout l'historique ?")) {
    localStorage.removeItem("xbit-history");
    updateHistoryBadge();
    closeTool();
  }
}

function shareResult(tool, result) {
  const text = `🎮 XbitToolsLab — ${toolTitles[tool] || tool}\n${result}`;
  if (navigator.share) {
    navigator.share({ title: "XbitToolsLab", text });
  } else {
    navigator.clipboard.writeText(text).then(() => alert("Résultat copié !"));
  }
}

// Init history badge on load
updateHistoryBadge();

/* ── WPM Test ── */
const WPM_TEXTS = [
  "Le renard brun saute par-dessus le chien paresseux. La rapidité et la précision sont essentielles pour progresser.",
  "Chaque joueur cherche à optimiser sa vitesse de frappe afin de dominer ses adversaires dans les parties compétitives.",
  "La pratique régulière permet d'atteindre une vitesse de frappe impressionnante sans sacrifier la précision du texte.",
  "Un clavier mécanique offre une réponse tactile supérieure qui améliore la vitesse et le confort lors des sessions prolongées.",
];

function initWpm() {
  const textOut   = dialogBody.querySelector('[data-out="text"]');
  const typedIn   = dialogBody.querySelector('[data-in="typed"]');
  const wpmOut    = dialogBody.querySelector('[data-out="wpm"]');
  const accOut    = dialogBody.querySelector('[data-out="acc"]');
  const startBtn  = dialogBody.querySelector('[data-act="start"]');
  const resetBtn  = dialogBody.querySelector('[data-act="reset"]');

  let target = '';
  let startedAt = 0;
  let timerEnd = null;
  let running = false;

  const pick = () => WPM_TEXTS[Math.floor(Math.random() * WPM_TEXTS.length)];

  const reset = () => {
    running = false;
    clearTimeout(timerEnd);
    target = pick();
    textOut.textContent = target;
    typedIn.value = '';
    typedIn.disabled = true;
    wpmOut.textContent = '—';
    accOut.textContent = '—';
  };

  const finish = () => {
    running = false;
    typedIn.disabled = true;
    const typed = typedIn.value.trim();
    const elapsed = (Date.now() - startedAt) / 60000;
    const words = typed.split(/\s+/).filter(Boolean).length;
    const wpm = Math.round(words / elapsed);
    const correct = [...typed].filter((c, i) => c === target[i]).length;
    const acc = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 0;
    wpmOut.textContent = wpm;
    accOut.textContent = acc;
    saveResult('wpm', `${wpm} WPM, précision ${acc}%`);
  };

  startBtn.addEventListener('click', () => {
    reset();
    running = true;
    startedAt = Date.now();
    typedIn.disabled = false;
    typedIn.focus();
    timerEnd = setTimeout(finish, 60000);
  });

  resetBtn.addEventListener('click', reset);

  typedIn.addEventListener('input', () => {
    if (!running) return;
    if (typedIn.value.length >= target.length) finish();
  });

  reset();
}

/* ── Jitter Test ── */
function initJitter() {
  const zone      = dialogBody.querySelector('[data-act="zone"]');
  const startBtn  = dialogBody.querySelector('[data-act="start"]');
  const jitterOut = dialogBody.querySelector('[data-out="jitter"]');
  const movesOut  = dialogBody.querySelector('[data-out="moves"]');

  let collecting = false;
  let moves = 0;
  let totalDist = 0;
  let lastX = null, lastY = null;

  zone.addEventListener('mousemove', e => {
    if (!collecting) return;
    const rect = zone.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (lastX !== null) {
      totalDist += Math.hypot(x - lastX, y - lastY);
      moves++;
      movesOut.textContent = moves;

      // Draw trail
      const dot = document.createElement('div');
      dot.style.cssText = `position:absolute;width:3px;height:3px;border-radius:50%;background:rgba(59,130,246,.6);left:${x}px;top:${y}px;pointer-events:none`;
      zone.appendChild(dot);
    }
    lastX = x; lastY = y;
  });

  startBtn.addEventListener('click', () => {
    collecting = false;
    moves = 0; totalDist = 0;
    lastX = null; lastY = null;
    movesOut.textContent = 0;
    jitterOut.textContent = '—';
    zone.textContent = 'Bouge ta souris ici';
    // remove trail dots
    zone.querySelectorAll('div').forEach(d => d.remove());

    collecting = true;
    state.timers.jitter = setTimeout(() => {
      collecting = false;
      const avg = moves > 0 ? (totalDist / moves).toFixed(2) : 0;
      jitterOut.textContent = avg;
      saveResult('jitter', `Jitter moyen: ${avg} px/move`);
    }, 5000);
  });
}

/* ── Metronome ── */
function initMetro() {
  const beatDot  = dialogBody.querySelector('[data-out="beat"]');
  const bpmOut   = dialogBody.querySelector('[data-out="bpm"]');
  const bpmRange = dialogBody.querySelector('[data-in="bpm-range"]');
  const startBtn = dialogBody.querySelector('[data-act="start"]');
  const stopBtn  = dialogBody.querySelector('[data-act="stop"]');
  const slowerBtn= dialogBody.querySelector('[data-act="slower"]');
  const fasterBtn= dialogBody.querySelector('[data-act="faster"]');

  let bpm = 120;
  let ticker = null;
  let beat = false;
  let audioCtx = null;

  const updateBpm = (val) => {
    bpm = Math.max(40, Math.min(240, val));
    bpmOut.textContent = bpm;
    bpmRange.value = bpm;
    if (ticker) { clearInterval(ticker); startTicking(); }
  };

  const beep = () => {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const g   = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = beat ? 880 : 660;
    g.gain.value = 0.05;
    osc.connect(g); g.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.04);
    beatDot.style.transform = 'scale(1.4)';
    setTimeout(() => { beatDot.style.transform = 'scale(1)'; }, 80);
    beat = !beat;
  };

  const startTicking = () => {
    ticker = setInterval(beep, 60000 / bpm);
  };

  startBtn.addEventListener('click', () => {
    if (ticker) clearInterval(ticker);
    beat = false;
    startTicking();
    beep();
  });

  stopBtn.addEventListener('click', () => {
    clearInterval(ticker);
    ticker = null;
  });

  slowerBtn.addEventListener('click', () => updateBpm(bpm - 10));
  fasterBtn.addEventListener('click', () => updateBpm(bpm + 10));
  bpmRange.addEventListener('input', () => updateBpm(parseInt(bpmRange.value)));

  dialog.addEventListener('close', () => {
    clearInterval(ticker);
    ticker = null;
  }, { once: true });
}

/* ── Frame Time Calculator ── */
function initFrameTime() {
  const fpsIn  = dialogBody.querySelector('[data-in="fps"]');
  const calcBtn= dialogBody.querySelector('[data-act="calc"]');
  const ftOut  = dialogBody.querySelector('[data-out="ft"]');
  const exOut  = dialogBody.querySelector('[data-out="examples"]');

  calcBtn.addEventListener('click', () => {
    const fps = parseFloat(fpsIn.value);
    if (!fps || fps <= 0) return;
    const ft = (1000 / fps).toFixed(3);
    ftOut.textContent = ft;
    const targets = [30, 60, 120, 144, 165, 240, 360];
    exOut.innerHTML = targets.map(f => `${f} FPS → ${(1000/f).toFixed(2)} ms`).join(' &nbsp;|&nbsp; ');
  });
}

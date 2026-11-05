/* ── WavePlayer — Music Player ── */

let tracks = [];
let currentIdx = -1;
let isPlaying = false;
let isShuffle = false;
let repeatMode = 0; // 0=off, 1=all, 2=one
let favorites = new Set(JSON.parse(localStorage.getItem('wp-fav') || '[]'));
let currentView = 'playlist';

const audio = document.getElementById('audio');
let audioCtx, analyser, source, dataArray;
let eqFilters = [];
const EQ_FREQS = [60, 250, 1000, 4000, 16000];
const EQ_KEY = 'mp-eq-v1';
const EQ_PRESETS = {
  flat:  [0, 0, 0, 0, 0],
  bass:  [8, 5, 0, -2, -3],
  rock:  [5, 3, -2, 4, 6],
  jazz:  [4, 2, -2, 2, 4],
  vocal: [-3, 0, 4, 3, -1]
};

const $trackList = document.getElementById('track-list');
const $progress = document.getElementById('progress');
const $timeCur = document.getElementById('time-current');
const $timeTotal = document.getElementById('time-total');
const $playBtn = document.getElementById('btn-play');
const $npTitle = document.getElementById('np-title');
const $npArtist = document.getElementById('np-artist');
const $volume = document.getElementById('volume');
const $search = document.getElementById('search');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

/* ── Init ── */
function init() {
  // File input
  document.getElementById('file-input').addEventListener('change', e => loadFiles(e.target.files));

  // Drag & drop
  const dz = document.getElementById('drop-zone');
  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('over'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('over'));
  dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('over'); loadFiles(e.dataTransfer.files); });

  // Controls
  $playBtn.addEventListener('click', togglePlay);
  document.getElementById('btn-prev').addEventListener('click', prevTrack);
  document.getElementById('btn-next').addEventListener('click', nextTrack);
  document.getElementById('btn-shuffle').addEventListener('click', toggleShuffle);
  document.getElementById('btn-repeat').addEventListener('click', toggleRepeat);
  $volume.addEventListener('input', () => { audio.volume = parseFloat($volume.value); updateVolIcon(); });
  document.getElementById('btn-vol').addEventListener('click', toggleMute);

  // Progress
  $progress.addEventListener('input', () => {
    if (audio.duration) audio.currentTime = ($progress.value / 100) * audio.duration;
  });
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('ended', onTrackEnd);
  audio.addEventListener('loadedmetadata', () => { $timeTotal.textContent = fmtTime(audio.duration); });

  // Search
  $search.addEventListener('input', renderTrackList);

  // EQ toggle
  document.getElementById('btn-eq-toggle').addEventListener('click', () => {
    const panel = document.getElementById('eq-panel');
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
  });

  // EQ sliders
  document.querySelectorAll('.eq-slider').forEach((slider, i) => {
    slider.addEventListener('input', () => {
      const val = parseFloat(slider.value);
      document.getElementById(`eq-db-${i}`).textContent = (val >= 0 ? '+' : '') + val + 'dB';
      if (eqFilters[i]) eqFilters[i].gain.value = val;
      saveEQ();
    });
  });

  // EQ presets
  document.querySelectorAll('.eq-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const gains = EQ_PRESETS[btn.dataset.preset] || [0,0,0,0,0];
      applyEQGains(gains);
    });
  });

  // Sidebar views
  document.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentView = btn.dataset.view;
      renderTrackList();
    });
  });

  audio.volume = 0.8;
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

/* ── File Loading ── */
function loadFiles(fileList) {
  for (const file of fileList) {
    if (!file.type.startsWith('audio/')) continue;
    const url = URL.createObjectURL(file);
    const name = file.name.replace(/\.[^.]+$/, '');
    tracks.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, url, duration: 0, file });
  }
  // Get durations
  tracks.forEach((t, i) => {
    if (t.duration) return;
    const a = new Audio(t.url);
    a.addEventListener('loadedmetadata', () => {
      t.duration = a.duration;
      renderTrackList();
    });
  });
  document.getElementById('track-count').textContent = tracks.length + ' piste' + (tracks.length > 1 ? 's' : '');
  renderTrackList();
  if (currentIdx < 0 && tracks.length) playTrack(0);
}

/* ── Playback ── */
function playTrack(idx) {
  if (idx < 0 || idx >= getViewTracks().length) return;
  const viewTracks = getViewTracks();
  const track = viewTracks[idx];
  const realIdx = tracks.indexOf(track);
  currentIdx = realIdx;
  audio.src = track.url;
  audio.play();
  isPlaying = true;
  $playBtn.innerHTML = '<i class="fas fa-pause"></i>';
  $npTitle.textContent = track.name;
  $npArtist.textContent = `Piste ${realIdx + 1} / ${tracks.length}`;
  renderTrackList();
  initAudioContext();
  drawVisualizer();
}

function togglePlay() {
  if (!tracks.length) return;
  if (currentIdx < 0) { playTrack(0); return; }
  if (isPlaying) { audio.pause(); isPlaying = false; $playBtn.innerHTML = '<i class="fas fa-play"></i>'; }
  else { audio.play(); isPlaying = true; $playBtn.innerHTML = '<i class="fas fa-pause"></i>'; drawVisualizer(); }
}

function nextTrack() {
  if (!tracks.length) return;
  let next;
  if (isShuffle) { next = Math.floor(Math.random() * tracks.length); }
  else { next = (currentIdx + 1) % tracks.length; }
  currentIdx = next;
  audio.src = tracks[next].url;
  audio.play();
  isPlaying = true;
  $playBtn.innerHTML = '<i class="fas fa-pause"></i>';
  $npTitle.textContent = tracks[next].name;
  $npArtist.textContent = `Piste ${next + 1} / ${tracks.length}`;
  renderTrackList();
}

function prevTrack() {
  if (!tracks.length) return;
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  let prev = (currentIdx - 1 + tracks.length) % tracks.length;
  currentIdx = prev;
  audio.src = tracks[prev].url;
  audio.play();
  isPlaying = true;
  $playBtn.innerHTML = '<i class="fas fa-pause"></i>';
  $npTitle.textContent = tracks[prev].name;
  $npArtist.textContent = `Piste ${prev + 1} / ${tracks.length}`;
  renderTrackList();
}

function onTrackEnd() {
  if (repeatMode === 2) { audio.currentTime = 0; audio.play(); return; }
  if (repeatMode === 1 || currentIdx < tracks.length - 1) nextTrack();
  else { isPlaying = false; $playBtn.innerHTML = '<i class="fas fa-play"></i>'; }
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  document.getElementById('btn-shuffle').classList.toggle('active', isShuffle);
}

function toggleRepeat() {
  repeatMode = (repeatMode + 1) % 3;
  const btn = document.getElementById('btn-repeat');
  btn.classList.toggle('active', repeatMode > 0);
  btn.innerHTML = repeatMode === 2 ? '<i class="fas fa-repeat"></i><small style="font-size:.5rem;position:absolute;margin-top:8px">1</small>' : '<i class="fas fa-repeat"></i>';
}

function toggleMute() {
  audio.muted = !audio.muted;
  updateVolIcon();
}

function updateVolIcon() {
  const v = audio.muted ? 0 : audio.volume;
  const icon = v === 0 ? 'fa-volume-xmark' : v < 0.5 ? 'fa-volume-low' : 'fa-volume-high';
  document.getElementById('btn-vol').innerHTML = `<i class="fas ${icon}"></i>`;
}

/* ── Progress ── */
function updateProgress() {
  if (!audio.duration) return;
  $progress.value = (audio.currentTime / audio.duration) * 100;
  $timeCur.textContent = fmtTime(audio.currentTime);
}

function fmtTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

/* ── Visualizer ── */
function initAudioContext() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  source = audioCtx.createMediaElementSource(audio);

  // Create EQ filter chain
  eqFilters = EQ_FREQS.map((freq, i) => {
    const filter = audioCtx.createBiquadFilter();
    filter.type = i === 0 ? 'lowshelf' : i === EQ_FREQS.length - 1 ? 'highshelf' : 'peaking';
    filter.frequency.value = freq;
    filter.gain.value = 0;
    return filter;
  });

  // Connect chain: source → filter[0] → ... → filter[n] → analyser → destination
  source.connect(eqFilters[0]);
  for (let i = 0; i < eqFilters.length - 1; i++) eqFilters[i].connect(eqFilters[i+1]);
  eqFilters[eqFilters.length - 1].connect(analyser);
  analyser.connect(audioCtx.destination);
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  // Restore saved EQ
  loadEQ();
}

function resizeCanvas() {
  canvas.width = canvas.offsetWidth * window.devicePixelRatio;
  canvas.height = canvas.offsetHeight * window.devicePixelRatio;
}

function drawVisualizer() {
  if (!isPlaying || !analyser) return;
  requestAnimationFrame(drawVisualizer);
  analyser.getByteFrequencyData(dataArray);
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const bars = analyser.frequencyBinCount;
  const barW = w / bars;
  for (let i = 0; i < bars; i++) {
    const v = dataArray[i] / 255;
    const barH = v * h * 0.8;
    const hue = 260 + (i / bars) * 60;
    ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${0.3 + v * 0.5})`;
    ctx.fillRect(i * barW, h - barH, barW - 1, barH);
  }
}

/* ── Track List Render ── */
function getViewTracks() {
  let list = currentView === 'favorites' ? tracks.filter(t => favorites.has(t.id)) : tracks;
  const q = $search.value.toLowerCase().trim();
  if (q) list = list.filter(t => t.name.toLowerCase().includes(q));
  return list;
}

function renderTrackList() {
  const view = getViewTracks();
  if (!view.length) {
    $trackList.innerHTML = `<p class="empty-msg">${currentView === 'favorites' ? 'Aucun favori' : 'Importez des fichiers audio pour commencer'}</p>`;
    return;
  }
  $trackList.innerHTML = view.map((t, i) => {
    const realIdx = tracks.indexOf(t);
    const playing = realIdx === currentIdx;
    const faved = favorites.has(t.id);
    return `<div class="track-item ${playing ? 'playing' : ''}" onclick="playTrackByRealIdx(${realIdx})">
      <span class="track-num">${playing && isPlaying ? '<i class="fas fa-volume-high"></i>' : i + 1}</span>
      <div class="track-info">
        <div class="track-name">${t.name}</div>
      </div>
      <span class="track-dur">${t.duration ? fmtTime(t.duration) : '--:--'}</span>
      <button class="btn-fav ${faved ? 'faved' : ''}" onclick="event.stopPropagation(); toggleFav('${t.id}')">
        <i class="fas fa-heart"></i>
      </button>
    </div>`;
  }).join('');
}

function playTrackByRealIdx(realIdx) {
  currentIdx = realIdx;
  audio.src = tracks[realIdx].url;
  audio.play();
  isPlaying = true;
  $playBtn.innerHTML = '<i class="fas fa-pause"></i>';
  $npTitle.textContent = tracks[realIdx].name;
  $npArtist.textContent = `Piste ${realIdx + 1} / ${tracks.length}`;
  renderTrackList();
  initAudioContext();
  drawVisualizer();
}

function toggleFav(id) {
  if (favorites.has(id)) favorites.delete(id);
  else favorites.add(id);
  localStorage.setItem('wp-fav', JSON.stringify([...favorites]));
  renderTrackList();
}

function saveEQ() {
  const gains = document.querySelectorAll('.eq-slider');
  localStorage.setItem(EQ_KEY, JSON.stringify([...gains].map(s => parseFloat(s.value))));
}

function loadEQ() {
  const saved = JSON.parse(localStorage.getItem(EQ_KEY) || 'null');
  if (saved) applyEQGains(saved);
}

function applyEQGains(gains) {
  gains.forEach((val, i) => {
    const slider = document.getElementById(`eq-${i}`);
    if (slider) {
      slider.value = val;
      document.getElementById(`eq-db-${i}`).textContent = (val >= 0 ? '+' : '') + val + 'dB';
    }
    if (eqFilters[i]) eqFilters[i].gain.value = val;
  });
  saveEQ();
}

init();

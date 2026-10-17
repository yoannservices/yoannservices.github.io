/* ── Révision Éducation Nationale — script.js ── */

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const COLLEGE_LEVELS = ['6eme', '5eme', '4eme', '3eme'];
const LYCEE_LEVELS   = ['seconde', 'premiere', 'bac_francais'];

let currentLevel = Object.keys(PROGRAMME)[0];
let currentSubject = null;
let currentMode = 'fiches';

// ── Stats (localStorage) ──
function getStats() { return JSON.parse(localStorage.getItem('rev_unified_stats') || '{}'); }
function saveStats(s) { localStorage.setItem('rev_unified_stats', JSON.stringify(s)); }

function recordQuiz(level, subject, correct, total) {
  const s = getStats();
  const key = `${level}_${subject}`;
  if (!s[key]) s[key] = { quizDone: 0, quizCorrect: 0, quizTotal: 0, flashSeen: 0 };
  s[key].quizDone++;
  s[key].quizCorrect += correct;
  s[key].quizTotal += total;
  saveStats(s);
  renderStats();
}

function recordFlash(level, subject, count) {
  const s = getStats();
  const key = `${level}_${subject}`;
  if (!s[key]) s[key] = { quizDone: 0, quizCorrect: 0, quizTotal: 0, flashSeen: 0 };
  s[key].flashSeen += count;
  saveStats(s);
}

// ── Level groups bar ──
function renderLevels() {
  const container = $('#level-groups');
  container.innerHTML = '';

  const groups = [
    { label: '🏫 Collège', keys: COLLEGE_LEVELS },
    { label: '🎓 Lycée',   keys: LYCEE_LEVELS }
  ];

  groups.forEach(group => {
    const groupEl = document.createElement('div');
    groupEl.className = 'level-group';

    const groupLabel = document.createElement('span');
    groupLabel.className = 'level-group-label';
    groupLabel.textContent = group.label;
    groupEl.appendChild(groupLabel);

    const btnRow = document.createElement('div');
    btnRow.className = 'level-btn-row';
    group.keys.forEach(key => {
      if (!PROGRAMME[key]) return;
      const btn = document.createElement('button');
      btn.className = 'sel-btn' + (key === currentLevel ? ' active' : '');
      btn.textContent = PROGRAMME[key].label;
      btn.addEventListener('click', () => { currentLevel = key; currentSubject = null; renderAll(); });
      btnRow.appendChild(btn);
    });
    groupEl.appendChild(btnRow);
    container.appendChild(groupEl);
  });
}

// ── Subject bar ──
function renderSubjects() {
  const bar = $('#subject-bar');
  bar.innerHTML = '';
  const subjects = PROGRAMME[currentLevel].subjects;
  const keys = Object.keys(subjects);
  if (!currentSubject || !subjects[currentSubject]) currentSubject = keys[0];
  keys.forEach(key => {
    const sub = subjects[key];
    const btn = document.createElement('button');
    btn.className = 'sel-btn' + (key === currentSubject ? ' active' : '');
    btn.innerHTML = `<i class="fas ${sub.icon}"></i> ${sub.label}`;
    btn.addEventListener('click', () => { currentSubject = key; renderAll(); });
    bar.appendChild(btn);
  });
}

// ── Stats banner ──
function renderStats() {
  const banner = $('#stats-banner');
  const s = getStats();
  const key = `${currentLevel}_${currentSubject}`;
  const st = s[key] || { quizDone: 0, quizCorrect: 0, quizTotal: 0, flashSeen: 0 };
  const pct = st.quizTotal > 0 ? Math.round(st.quizCorrect / st.quizTotal * 100) : 0;
  banner.innerHTML = `
    <div class="stat-chip"><i class="fas fa-brain"></i> Quiz effectués : <span class="val">${st.quizDone}</span></div>
    <div class="stat-chip"><i class="fas fa-check"></i> Taux de réussite : <span class="val">${pct}%</span></div>
    <div class="stat-chip"><i class="fas fa-clone"></i> Flashcards vues : <span class="val">${st.flashSeen}</span></div>
  `;
}

// ── Mode tabs ──
$$('.mode-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    $$('.mode-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentMode = tab.dataset.mode;
    renderContent();
  });
});

// ── Content rendering ──
function renderContent() {
  const area = $('#content-area');
  const subData = PROGRAMME[currentLevel].subjects[currentSubject];
  if (!subData) { area.innerHTML = '<p style="color:var(--muted);text-align:center">Aucun contenu disponible.</p>'; return; }

  if (currentMode === 'fiches') renderFiches(area, subData);
  else if (currentMode === 'quiz') renderQuiz(area, subData);
  else if (currentMode === 'flashcards') renderFlashcards(area, subData);
}

// ── FICHES ──
function renderFiches(area, subData) {
  if (!subData.fiches || !subData.fiches.length) {
    area.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px">Pas de fiches pour cette matière.</p>';
    return;
  }
  area.innerHTML = '<div class="fiche-list" id="fiche-list"></div>';
  const list = $('#fiche-list');
  subData.fiches.forEach((f, i) => {
    const card = document.createElement('div');
    card.className = 'fiche-card';
    card.innerHTML = `
      <div class="fiche-header" data-i="${i}">
        <h3>${f.title}</h3>
        <div style="display:flex;align-items:center;gap:10px">
          <span class="fiche-tag">${f.tag}</span>
          <i class="fas fa-chevron-down chevron"></i>
        </div>
      </div>
      <div class="fiche-body"><div class="fiche-content">${f.content}</div></div>
    `;
    card.querySelector('.fiche-header').addEventListener('click', () => card.classList.toggle('open'));
    list.appendChild(card);
  });
}

// ── QUIZ ──
function renderQuiz(area, subData) {
  if (!subData.quiz || !subData.quiz.length) {
    area.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px">Pas de quiz pour cette matière.</p>';
    return;
  }

  const questions = shuffle([...subData.quiz]);
  let idx = 0, score = 0;
  area.innerHTML = '<div class="quiz-container" id="quiz-ctn"></div>';

  function showQuestion() {
    const ctn = $('#quiz-ctn');
    if (idx >= questions.length) {
      recordQuiz(currentLevel, currentSubject, score, questions.length);
      const pct = Math.round(score / questions.length * 100);
      const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪';
      ctn.innerHTML = `
        <div class="quiz-result">
          <div class="score">${score}/${questions.length}</div>
          <div class="score-label">${emoji} ${pct}% de bonnes réponses</div>
          <div class="score-detail">Continue à réviser pour améliorer ton score !</div>
          <button class="quiz-btn-next" id="btn-restart" style="margin-top:24px"><i class="fas fa-redo"></i> Recommencer</button>
        </div>
      `;
      $('#btn-restart').addEventListener('click', () => { idx = 0; score = 0; renderQuiz(area, subData); });
      return;
    }

    const q = questions[idx];
    const letters = ['A', 'B', 'C', 'D'];
    ctn.innerHTML = `
      <div class="quiz-progress">
        <span>Question ${idx + 1}/${questions.length}</span>
        <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${(idx/questions.length)*100}%"></div></div>
        <span>${score} ✓</span>
      </div>
      <div class="quiz-card">
        <div class="question">${q.q}</div>
        <div class="quiz-options" id="quiz-options">
          ${q.options.map((o, i) => `
            <div class="quiz-option" data-i="${i}">
              <span class="opt-letter">${letters[i]}</span>
              <span>${o}</span>
            </div>
          `).join('')}
        </div>
        <div class="quiz-explanation" id="quiz-expl" style="display:none"></div>
      </div>
      <button class="quiz-btn-next" id="btn-next" style="display:none"><i class="fas fa-arrow-right"></i> Suivante</button>
    `;

    $$('#quiz-options .quiz-option').forEach(opt => {
      opt.addEventListener('click', () => {
        if (opt.classList.contains('disabled')) return;
        const chosen = +opt.dataset.i;
        $$('#quiz-options .quiz-option').forEach(o => o.classList.add('disabled'));
        if (chosen === q.correct) {
          opt.classList.add('correct');
          score++;
        } else {
          opt.classList.add('wrong');
          $$('#quiz-options .quiz-option')[q.correct].classList.add('correct');
        }
        const expl = $('#quiz-expl');
        expl.innerHTML = q.expl;
        expl.style.display = 'block';
        $('#btn-next').style.display = 'flex';
      });
    });

    $('#btn-next').addEventListener('click', () => { idx++; showQuestion(); });
  }

  showQuestion();
}

// ── FLASHCARDS ──
function renderFlashcards(area, subData) {
  if (!subData.flashcards || !subData.flashcards.length) {
    area.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px">Pas de flashcards pour cette matière.</p>';
    return;
  }

  const cards = shuffle([...subData.flashcards]);
  let idx = 0;
  let seen = 0;
  area.innerHTML = '<div class="flashcard-area" id="fc-area"></div>';

  function showCard() {
    const fc = cards[idx];
    const fcArea = $('#fc-area');
    fcArea.innerHTML = `
      <div class="flashcard-counter">${idx + 1} / ${cards.length}</div>
      <div class="flashcard" id="flashcard">
        <div class="flashcard-inner">
          <div class="flashcard-front">
            <span class="fc-label">Question</span>
            <span class="fc-question">${fc.front}</span>
            <span class="fc-hint">Clique pour voir la réponse</span>
          </div>
          <div class="flashcard-back">
            <span class="fc-label" style="color:var(--accent2)">Réponse</span>
            <span class="fc-answer">${fc.back}</span>
          </div>
        </div>
      </div>
      <div class="fc-nav">
        <button id="fc-prev" ${idx === 0 ? 'disabled style="opacity:.3;cursor:default"' : ''}><i class="fas fa-arrow-left"></i> Précédente</button>
        <button id="fc-next" class="primary">${idx < cards.length - 1 ? 'Suivante <i class="fas fa-arrow-right"></i>' : 'Terminer <i class="fas fa-check"></i>'}</button>
      </div>
    `;

    $('#flashcard').addEventListener('click', () => {
      $('#flashcard').classList.toggle('flipped');
      seen++;
    });

    if (idx > 0) {
      $('#fc-prev').addEventListener('click', () => { idx--; showCard(); });
    }

    $('#fc-next').addEventListener('click', () => {
      if (idx < cards.length - 1) { idx++; showCard(); }
      else {
        recordFlash(currentLevel, currentSubject, seen);
        $('#fc-area').innerHTML = `
          <div class="quiz-result">
            <div class="score">✓</div>
            <div class="score-label">Toutes les flashcards revues !</div>
            <button class="quiz-btn-next" id="fc-restart" style="margin-top:20px"><i class="fas fa-redo"></i> Recommencer</button>
          </div>
        `;
        $('#fc-restart').addEventListener('click', () => { idx = 0; seen = 0; renderFlashcards(area, subData); });
      }
    });
  }

  showCard();
}

// ── Utils ──
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Render all ──
function renderAll() {
  renderLevels();
  renderSubjects();
  renderStats();
  renderContent();
}

renderAll();

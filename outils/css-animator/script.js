'use strict';

/* ── Presets ── */
const PRESETS = {
  fadeIn:    [{ pct: 0, props: [{ p: 'opacity', v: '0' }] }, { pct: 100, props: [{ p: 'opacity', v: '1' }] }],
  slideUp:   [{ pct: 0, props: [{ p: 'transform', v: 'translateY(60px)' }, { p: 'opacity', v: '0' }] }, { pct: 100, props: [{ p: 'transform', v: 'translateY(0)' }, { p: 'opacity', v: '1' }] }],
  slideLeft: [{ pct: 0, props: [{ p: 'transform', v: 'translateX(-60px)' }, { p: 'opacity', v: '0' }] }, { pct: 100, props: [{ p: 'transform', v: 'translateX(0)' }, { p: 'opacity', v: '1' }] }],
  zoomIn:    [{ pct: 0, props: [{ p: 'transform', v: 'scale(0.3)' }, { p: 'opacity', v: '0' }] }, { pct: 100, props: [{ p: 'transform', v: 'scale(1)' }, { p: 'opacity', v: '1' }] }],
  bounce:    [{ pct: 0, props: [{ p: 'transform', v: 'translateY(0)' }] }, { pct: 40, props: [{ p: 'transform', v: 'translateY(-30px)' }] }, { pct: 60, props: [{ p: 'transform', v: 'translateY(-15px)' }] }, { pct: 100, props: [{ p: 'transform', v: 'translateY(0)' }] }],
  shake:     [{ pct: 0, props: [{ p: 'transform', v: 'translateX(0)' }] }, { pct: 20, props: [{ p: 'transform', v: 'translateX(-10px)' }] }, { pct: 40, props: [{ p: 'transform', v: 'translateX(10px)' }] }, { pct: 60, props: [{ p: 'transform', v: 'translateX(-10px)' }] }, { pct: 80, props: [{ p: 'transform', v: 'translateX(10px)' }] }, { pct: 100, props: [{ p: 'transform', v: 'translateX(0)' }] }],
  spin:      [{ pct: 0, props: [{ p: 'transform', v: 'rotate(0deg)' }] }, { pct: 100, props: [{ p: 'transform', v: 'rotate(360deg)' }] }],
  pulse:     [{ pct: 0, props: [{ p: 'transform', v: 'scale(1)' }] }, { pct: 50, props: [{ p: 'transform', v: 'scale(1.1)' }] }, { pct: 100, props: [{ p: 'transform', v: 'scale(1)' }] }],
  flip:      [{ pct: 0, props: [{ p: 'transform', v: 'perspective(400px) rotateY(0)' }] }, { pct: 50, props: [{ p: 'transform', v: 'perspective(400px) rotateY(90deg)' }] }, { pct: 100, props: [{ p: 'transform', v: 'perspective(400px) rotateY(0)' }] }],
  rubber:    [{ pct: 0, props: [{ p: 'transform', v: 'scale(1,1)' }] }, { pct: 30, props: [{ p: 'transform', v: 'scale(1.25,.75)' }] }, { pct: 60, props: [{ p: 'transform', v: 'scale(.75,1.25)' }] }, { pct: 80, props: [{ p: 'transform', v: 'scale(1.05,.95)' }] }, { pct: 100, props: [{ p: 'transform', v: 'scale(1,1)' }] }],
};

const CSS_PROPS = [
  'opacity','transform','background-color','color','border-radius',
  'width','height','top','left','right','bottom',
  'font-size','letter-spacing','box-shadow','filter','clip-path'
];

/* ── State ── */
let keyframes = [];
let styleTag = null;
let animPlaying = false;

/* ── DOM ── */
const previewEl    = document.getElementById('preview-el');
const kfList       = document.getElementById('kf-list');
const cssOutput    = document.getElementById('css-output');
const animNameInp  = document.getElementById('anim-name');
const animDurInp   = document.getElementById('anim-dur');
const animDelayInp = document.getElementById('anim-delay');
const animIterN    = document.getElementById('anim-iter-n');
const animIterInf  = document.getElementById('anim-iter-inf');
const animDir      = document.getElementById('anim-direction');
const animFill     = document.getElementById('anim-fill');
const animTiming   = document.getElementById('anim-timing');
const elType       = document.getElementById('el-type');
const elBg         = document.getElementById('el-bg');
const elW          = document.getElementById('el-w');
const elH          = document.getElementById('el-h');
const elText       = document.getElementById('el-text');
const elImgUrl     = document.getElementById('el-img-url');

/* ── Init ── */
styleTag = document.createElement('style');
document.head.appendChild(styleTag);
loadPreset('fadeIn');
bindAll();

/* ── Bind all events ── */
function bindAll() {
  // Preview element
  [elBg, elW, elH, elType, elText, elImgUrl].forEach(el => el.addEventListener('input', updatePreviewEl));

  // Animation settings → regenerate CSS
  [animNameInp, animDurInp, animDelayInp, animIterN, animIterInf, animDir, animFill, animTiming].forEach(el => {
    el.addEventListener('input', () => { generateCSS(); applyAnim(); });
    el.addEventListener('change', () => { generateCSS(); applyAnim(); });
  });

  // Add keyframe
  document.getElementById('btn-add-kf').addEventListener('click', () => {
    const lastPct = keyframes.length ? keyframes[keyframes.length - 1].pct : 0;
    const newPct  = Math.min(lastPct + 25, 100);
    keyframes.push({ pct: newPct, props: [{ p: 'transform', v: 'scale(1)' }] });
    renderKfList();
    generateCSS();
  });

  // Play/pause/reset
  document.getElementById('btn-play-anim').addEventListener('click', () => { animPlaying = true; applyAnim(); });
  document.getElementById('btn-pause-anim').addEventListener('click', () => {
    previewEl.style.animationPlayState = 'paused';
  });
  document.getElementById('btn-reset-anim').addEventListener('click', () => {
    animPlaying = false;
    previewEl.style.animation = 'none';
    previewEl.offsetHeight; // reflow
    applyAnim();
  });

  // Copy CSS
  document.getElementById('btn-copy-css').addEventListener('click', () => {
    navigator.clipboard.writeText(cssOutput.textContent).then(() => showToast('CSS copié !'));
  });

  // Download CSS
  document.getElementById('btn-dl-css').addEventListener('click', () => {
    const blob = new Blob([cssOutput.textContent], { type: 'text/css' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (animNameInp.value || 'animation') + '.css';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  // Presets
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => loadPreset(btn.dataset.preset));
  });
}

/* ── Update preview element type/style ── */
function updatePreviewEl() {
  const type = elType.value;
  previewEl.style.width  = elW.value + 'px';
  previewEl.style.height = elH.value + 'px';
  previewEl.style.background = elBg.value;
  previewEl.style.borderRadius = type === 'circle' ? '50%' : (type === 'text' ? '0' : '8px');
  previewEl.innerHTML = '';

  const txtRow = document.getElementById('text-content-row');
  const imgRow = document.getElementById('img-url-row');
  txtRow.style.display = type === 'text' ? 'flex' : 'none';
  imgRow.style.display = type === 'image' ? 'flex' : 'none';

  if (type === 'text') {
    previewEl.textContent = elText.value || 'Hello!';
    previewEl.style.background = 'transparent';
    previewEl.style.color = elBg.value;
    previewEl.style.fontSize = '1.4rem';
    previewEl.style.fontWeight = '800';
  } else if (type === 'image' && elImgUrl.value) {
    const img = document.createElement('img');
    img.src = elImgUrl.value;
    img.alt = '';
    previewEl.appendChild(img);
  }
}

/* ── Render keyframe cards ── */
function renderKfList() {
  kfList.innerHTML = '';
  keyframes.forEach((kf, i) => {
    const card = document.createElement('div');
    card.className = 'kf-card';
    card.innerHTML = `
      <div class="kf-card-header">
        <span class="kf-pct-label">%</span>
        <input class="kf-pct-input" type="number" min="0" max="100" value="${kf.pct}" data-ki="${i}" data-field="pct" />
        <button class="kf-del-btn" data-del="${i}" title="Supprimer keyframe"><i class="fas fa-trash"></i></button>
      </div>
      <div class="kf-props" id="kf-props-${i}">
        ${kf.props.map((prop, j) => renderPropRow(i, j, prop)).join('')}
      </div>
      <button class="kf-add-prop" data-ki="${i}"><i class="fas fa-plus"></i> Propriété</button>
    `;
    kfList.appendChild(card);
  });

  // Events
  kfList.querySelectorAll('.kf-pct-input').forEach(inp => {
    inp.addEventListener('input', () => {
      const ki = +inp.dataset.ki;
      keyframes[ki].pct = Math.max(0, Math.min(100, parseInt(inp.value) || 0));
      generateCSS(); applyAnim();
    });
  });
  kfList.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      keyframes.splice(+btn.dataset.del, 1);
      renderKfList(); generateCSS(); applyAnim();
    });
  });
  kfList.querySelectorAll('[data-ki].kf-add-prop').forEach(btn => {
    btn.addEventListener('click', () => {
      const ki = +btn.dataset.ki;
      keyframes[ki].props.push({ p: 'opacity', v: '1' });
      renderKfList(); generateCSS(); applyAnim();
    });
  });
  bindPropEvents();
}

function renderPropRow(ki, j, prop) {
  const opts = CSS_PROPS.map(p => `<option value="${p}" ${p === prop.p ? 'selected' : ''}>${p}</option>`).join('');
  return `<div class="kf-prop-row">
    <select class="kf-prop-select" data-ki="${ki}" data-j="${j}">${opts}</select>
    <input class="kf-prop-val" type="text" value="${prop.v}" data-ki="${ki}" data-j="${j}" />
    <button class="kf-prop-del" data-ki="${ki}" data-j="${j}" title="Supprimer"><i class="fas fa-times"></i></button>
  </div>`;
}

function bindPropEvents() {
  kfList.querySelectorAll('.kf-prop-select').forEach(sel => {
    sel.addEventListener('change', () => {
      keyframes[+sel.dataset.ki].props[+sel.dataset.j].p = sel.value;
      generateCSS(); applyAnim();
    });
  });
  kfList.querySelectorAll('.kf-prop-val').forEach(inp => {
    inp.addEventListener('input', () => {
      keyframes[+inp.dataset.ki].props[+inp.dataset.j].v = inp.value;
      generateCSS(); applyAnim();
    });
  });
  kfList.querySelectorAll('.kf-prop-del').forEach(btn => {
    btn.addEventListener('click', () => {
      const ki = +btn.dataset.ki, j = +btn.dataset.j;
      keyframes[ki].props.splice(j, 1);
      renderKfList(); generateCSS(); applyAnim();
    });
  });
}

/* ── Generate CSS ── */
function generateCSS() {
  const name    = animNameInp.value.trim() || 'myAnimation';
  const dur     = animDurInp.value || '1';
  const delay   = animDelayInp.value || '0';
  const iter    = animIterInf.checked ? 'infinite' : (animIterN.value || '1');
  const dir     = animDir.value;
  const fill    = animFill.value;
  const timing  = animTiming.value;

  const sorted  = [...keyframes].sort((a, b) => a.pct - b.pct);
  let kfCSS = `@keyframes ${name} {\n`;
  sorted.forEach(kf => {
    const propLines = kf.props.map(p => `    ${p.p}: ${p.v};`).join('\n');
    kfCSS += `  ${kf.pct}% {\n${propLines}\n  }\n`;
  });
  kfCSS += `}\n`;

  const animRule = `.element {\n  animation: ${name} ${dur}s ${timing} ${delay}s ${iter} ${dir} ${fill};\n}\n`;

  cssOutput.textContent = kfCSS + '\n' + animRule;
  styleTag.textContent = kfCSS;
  return { name, dur, delay, iter, dir, fill, timing };
}

/* ── Apply animation to preview ── */
function applyAnim() {
  const { name, dur, delay, iter, dir, fill, timing } = generateCSS();
  // Force restart
  previewEl.style.animation = 'none';
  previewEl.offsetHeight;
  previewEl.style.animation = `${name} ${dur}s ${timing} ${delay}s ${iter} ${dir} ${fill}`;
  previewEl.style.animationPlayState = 'running';
}

/* ── Load preset ── */
function loadPreset(name) {
  if (!PRESETS[name]) return;
  keyframes = PRESETS[name].map(kf => ({
    pct:   kf.pct,
    props: kf.props.map(p => ({ p: p.p, v: p.v }))
  }));
  animNameInp.value = name + 'Anim';
  renderKfList();
  generateCSS();
  applyAnim();
}

/* ── Toast notification ── */
function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

updatePreviewEl();

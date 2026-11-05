/* Fiche d'une course cycliste : dates, compte à rebours, résumé Wikipédia, lien direct officiel. */
(() => {
'use strict';
const { CYCLING_RACES, raceState } = SL;
const { wikiSummary } = SL;
const { t, getLang } = SL;
const { esc, loading, errorBox, fmtDay, liveBadge } = SL;

async function render(root, { id }) {
  const r = CYCLING_RACES.find(x => x.id === id);
  if (!r) { root.innerHTML = errorBox('?', false); return; }
  const st = raceState(r);
  root.innerHTML = `
    <header class="page-h" style="--sc:#f59e0b">
      <button id="burger" class="burger" aria-label="Menu">☰</button>
      <a class="back" href="#/sport/cycling">←</a><span class="page-ico">🚴</span>
      <div><h1>${r.country} ${esc(r.name)}</h1><p>${esc(fmtDay(r.start))}${r.end !== r.start ? ' → ' + esc(fmtDay(r.end)) : ''} <em class="muted">(${t('datesApprox')})</em></p></div>
      ${liveBadge(st, st === 'pre' ? `${t('in')} ${Math.ceil((new Date(r.start) - new Date()) / 864e5)} ${t('days')}` : '')}
    </header>
    <div class="race-grid">
      <section class="card" id="wiki">${loading()}</section>
      <section class="card"><header><h2>${t('race')}</h2></header>
        <ul class="facts">
          <li><span>Type</span><b>${esc(r.type === 'grandtour' ? 'Grand Tour' : r.type === 'monument' ? 'Monument' : r.type === 'stage' ? (getLang() === 'fr' ? 'Course par étapes' : 'Stage race') : r.type === 'championship' ? 'UCI' : 'Classique')}</b></li>
          ${r.stages ? `<li><span>${t('stages')}</span><b>${r.stages}</b></li>` : ''}
        </ul>
        ${r.site ? `<a class="btn" href="${esc(r.site)}" target="_blank" rel="noopener">📡 ${t('officialSite')}</a>` : ''}
        <p class="note">ℹ️ ${t('cyclingNote')}</p>
      </section>
    </div>`;
  const w = await wikiSummary(r.wiki[getLang()]) || await wikiSummary(r.wiki[getLang()].replace(/ \d{4}$|^\d{4} /, ''));
  const box = root.querySelector('#wiki');
  if (!box) return;
  box.innerHTML = w ? `<header><h2>${esc(w.title)}</h2></header>
    ${w.thumbnail ? `<img class="wiki-img" src="${esc(w.thumbnail.source)}" alt="">` : ''}
    <p>${esc(w.extract)}</p><a href="${esc(w.content_urls?.desktop?.page)}" target="_blank" rel="noopener" class="muted sm">Wikipédia →</a>`
    : `<p class="muted">${t('noData')}</p>`;
}

SL.views['cycling'] = { render };
})();

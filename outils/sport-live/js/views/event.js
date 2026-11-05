/* Page d'un événement : aiguille vers la bonne vue selon le sport. */
(() => {
'use strict';
const { sportOfPath } = SL;
const { errorBox } = SL;

async function render(root, params) {
  const sport = sportOfPath(params.path);
  if (!sport) { root.innerHTML = errorBox('?', false); return; }
  const mod = sport.kind === 'team' ? SL.views.match
    : sport.kind === 'tennis' ? SL.views.tennis
    : sport.kind === 'racing' ? SL.views.racing
    : SL.views.individual; // golf, mma
  return mod.render(root, { ...params, sport });
}

SL.views['event'] = { render };
})();

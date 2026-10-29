// Fabrique le HTML d'un bloc de code d'une réponse de NEXUS.
// Le bloc est emballé dans un conteneur qui contient une barre AU-DESSUS du code,
// avec le bouton "Copier le code", puis le <pre><code> d'origine (coloration et styles inchangés).
// Ce fichier ne dépend de rien d'autre : il est facile à tester seul.

// Libellés des boutons, fournis par l'appelant : ils viennent du dictionnaire, dans la langue choisie
export type LibellesBlocCode = {
  copierCode: string;
  previsualiser: string;
  previsualiserAria: string;
  voirCodeComplet: string;
  reduireCode: string;
};

// Attributs qui permettent de repérer les boutons dans la délégation d'événements
export const COPY_CODE_ATTRIBUTE = 'data-copier-code';
export const PREVIEW_CODE_ATTRIBUTE = 'data-preview-code';
export const TOGGLE_CODE_ATTRIBUTE = 'data-basculer-code';
// Classe du conteneur d'un bloc : c'est à partir d'elle qu'on retrouve le code à copier
export const CODE_BLOCK_CLASS = 'code-block';
// Classe d'un bloc long, réduit à une hauteur fixe : le bouton "Voir tout le code" l'enlève et la remet
export const CODE_REPLIE_CLASS = 'code-block-replie';
// Au-delà de ce nombre de lignes, un bloc de code est réduit pour ne pas prendre trop de place
export const LIGNES_AVANT_REDUCTION = 15;

// Vrai si le bloc contient une page HTML complète ou un fragment HTML marqué "html" :
// seuls ces blocs reçoivent le bouton "Prévisualiser"
export const isHtmlCode = (text: string, lang: string | undefined): boolean => {
  const language = (lang ?? '').trim().split(/\s+/)[0].toLowerCase();
  if (language === 'html') return true;
  // Sans langage indiqué, on regarde le début du texte (la casse n'a pas d'importance en HTML)
  const start = text.trimStart().toLowerCase();
  return start.startsWith('<!doctype') || start.startsWith('<html');
};

// Protège le texte pour qu'il s'affiche tel quel dans le HTML (sinon "<b>" deviendrait du gras)
export const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Construit le HTML d'un bloc de code à partir du texte renvoyé par marked
export const renderCodeBlockHtml = (
  text: string,
  lang: string | undefined,
  libelles: LibellesBlocCode,
  escaped = false,
): string => {
  // marked ajoute souvent un saut de ligne à la fin du bloc : on le retire pour que le texte copié soit exact
  const code = text.replace(/\n$/, '');
  const safeCode = escaped ? code : escapeHtml(code);
  // Le langage peut contenir plusieurs mots ("js title=..."), seul le premier nous intéresse
  const language = (lang ?? '').trim().split(/\s+/)[0];
  const classAttribute = language ? ` class="language-${escapeHtml(language)}"` : '';
  // Le bouton d'aperçu n'existe que pour le HTML ; il est placé avant "Copier le code" dans la même barre
  const previewButton = isHtmlCode(text, lang)
    ? `<button type="button" class="code-copy-button" ${PREVIEW_CODE_ATTRIBUTE} aria-label="${libelles.previsualiserAria}">${libelles.previsualiser}</button>`
    : '';
  // Un bloc long démarre replié, et le bouton permet de voir le reste
  const estLong = code.split('\n').length > LIGNES_AVANT_REDUCTION;
  const classeConteneur = estLong ? `${CODE_BLOCK_CLASS} ${CODE_REPLIE_CLASS}` : CODE_BLOCK_CLASS;
  const toggleButton = estLong
    ? `<button type="button" class="code-copy-button" ${TOGGLE_CODE_ATTRIBUTE} aria-expanded="false">${libelles.voirCodeComplet}</button>`
    : '';

  return (
    `<div class="${classeConteneur}">` +
    `<div class="code-block-bar">` +
    previewButton +
    toggleButton +
    `<button type="button" class="code-copy-button" ${COPY_CODE_ATTRIBUTE} aria-label="${libelles.copierCode}">${libelles.copierCode}</button>` +
    `</div>` +
    `<pre><code${classAttribute}>${safeCode}</code></pre>` +
    `</div>\n`
  );
};

// Copie un texte dans le presse-papiers. Renvoie true si la copie a réussi, false sinon.

// Méthode moderne : elle n'existe que sur un site "sécurisé" (https ou localhost).
// Un site servi en http sur le réseau local ne l'a pas, d'où le plan B ci-dessous.
const copyWithClipboardApi = async (text: string): Promise<boolean> => {
  if (!navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Le navigateur peut refuser (page pas active, permission) : on tente le plan B
    return false;
  }
};

// Plan B, plus ancien : on met le texte dans une zone de saisie cachée, on la sélectionne,
// puis on demande au navigateur de copier la sélection.
const copyWithTextarea = (text: string): boolean => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  // readonly : pas de clavier qui s'ouvre sur téléphone
  textarea.setAttribute('readonly', '');
  // Hors de l'écran : l'élève ne voit jamais cette zone, elle sert seulement à copier
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  try {
    textarea.select();
    // select() ne suffit pas sur iOS : il faut aussi fixer la plage de sélection
    textarea.setSelectionRange(0, text.length);
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    // On range toujours la zone cachée, même si la copie a échoué
    textarea.remove();
  }
};

export const copyText = async (text: string): Promise<boolean> => {
  const copiedWithApi = await copyWithClipboardApi(text);
  if (copiedWithApi) return true;
  return copyWithTextarea(text);
};

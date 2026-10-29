import { useEffect, useState } from 'react';

// Les trois tailles de texte proposées dans le panneau "Mon compte"
export type TextSize = 'petit' | 'moyen' | 'grand';

// Taille de la racine de la page (en pixels). Les tailles de l'interface étant en rem, tout suit ce réglage.
const FONT_SIZE_PX: Record<TextSize, string> = {
  petit: '14px',
  moyen: '16px',
  grand: '18px',
};

// Clé de la préférence dans localStorage
const STORAGE_KEY = 'taillePolice';

const DEFAULT_TEXT_SIZE: TextSize = 'moyen';

// Une valeur lue dans localStorage peut être n'importe quoi : on ne garde que les tailles connues
const toTextSize = (value: string | null): TextSize => {
  if (value === 'petit' || value === 'moyen' || value === 'grand') return value;
  return DEFAULT_TEXT_SIZE;
};

// Lit la taille mémorisée. Si le stockage est bloqué, on garde la taille par défaut.
const readStoredTextSize = (): TextSize => {
  try {
    return toTextSize(localStorage.getItem(STORAGE_KEY));
  } catch {
    return DEFAULT_TEXT_SIZE;
  }
};

// Mémorise la taille choisie. Si le stockage est bloqué, le choix vaut pour cette session seulement.
const writeStoredTextSize = (size: TextSize): void => {
  try {
    localStorage.setItem(STORAGE_KEY, size);
  } catch {
    // Volontairement ignoré : la taille reste appliquée jusqu'au rechargement
  }
};

// Gère la taille du texte : elle est appliquée à la racine de la page et gardée entre deux visites.
export const useTextSize = () => {
  const [textSize, setTextSize] = useState<TextSize>(readStoredTextSize);

  // Appliqué à chaque changement, et dès le démarrage avec la taille mémorisée
  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZE_PX[textSize];
  }, [textSize]);

  const changeTextSize = (size: TextSize): void => {
    setTextSize(size);
    writeStoredTextSize(size);
  };

  return { textSize, changeTextSize };
};

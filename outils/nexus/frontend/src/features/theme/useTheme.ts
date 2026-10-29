import { useLayoutEffect, useState } from 'react';

// Ajoute ou retire la classe "light-mode" sur <body> : c'est index.css qui change les couleurs
// selon cette classe, donc on la touche ici plutôt que dans chaque composant.
const applyThemeToBody = (isDark: boolean) => {
  if (isDark) {
    document.body.classList.remove('light-mode');
  } else {
    document.body.classList.add('light-mode');
  }
};

// Lit le thème sauvegardé. Si localStorage est bloqué (navigation privée, stockage désactivé), on garde le thème sombre.
const lireThemeSauvegarde = (): boolean => {
  try {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    return savedTheme === 'dark';
  } catch {
    return true;
  }
};

// Gère le thème sombre/clair. Le choix est gardé dans localStorage pour survivre à un rechargement.
export const useTheme = () => {
  // Lecture dès la première création de l'état : le bon thème est affiché sans passer par le sombre
  const [isDarkMode, setIsDarkMode] = useState<boolean>(lireThemeSauvegarde);

  // useLayoutEffect : la classe du <body> est mise à jour avant que le navigateur ne dessine la page (pas de flash)
  useLayoutEffect(() => {
    applyThemeToBody(isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    // Si l'écriture échoue, le thème change quand même pour cette visite : seul le souvenir est perdu
    try {
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch {
      // Stockage indisponible : on ignore l'erreur
    }
  };

  return { isDarkMode, toggleTheme };
};

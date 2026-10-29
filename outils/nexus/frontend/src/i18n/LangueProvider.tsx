import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getMessages } from './messages';
import type { Messages } from './messages';
import { lireLangueInitiale, sauvegarderLangue, setLangueCourante } from './langue';
import type { Langue } from './langue';

/**
 * LangueProvider : donne la langue choisie et les textes correspondants à toute l'application.
 * Les composants lisent les textes avec useI18n() : const { t } = useI18n(); puis t.interface.xxx.
 * Changer de langue (setLangue) met aussi à jour l'attribut lang de la page et l'en-tête envoyé au serveur.
 */

type I18nValue = {
  langue: Langue;
  setLangue: (langue: Langue) => void;
  t: Messages;
};

// Valeur par défaut : utilisée seulement si un composant est rendu hors du provider.
const LangueContext = createContext<I18nValue | null>(null);

export const LangueProvider = ({ children }: { children: ReactNode }) => {
  // La langue initiale est lue une seule fois, puis gardée dans l'état de React.
  const [langue, setLangueState] = useState<Langue>(() => {
    const initiale = lireLangueInitiale();
    setLangueCourante(initiale);
    return initiale;
  });

  useEffect(() => {
    document.documentElement.lang = langue;
  }, [langue]);

  const value = useMemo<I18nValue>(() => {
    const setLangue = (nouvelle: Langue) => {
      setLangueCourante(nouvelle);
      sauvegarderLangue(nouvelle);
      setLangueState(nouvelle);
    };
    return { langue, setLangue, t: getMessages(langue) };
  }, [langue]);

  return <LangueContext.Provider value={value}>{children}</LangueContext.Provider>;
};

export const useI18n = (): I18nValue => {
  const value = useContext(LangueContext);
  if (!value) throw new Error('useI18n doit être utilisé à l\'intérieur de LangueProvider.');
  return value;
};

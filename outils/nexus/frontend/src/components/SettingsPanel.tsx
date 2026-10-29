import { useRef, useState } from 'react';
import type { FormEvent, MouseEvent } from 'react';
import { minutesDattente } from '../features/auth/attente';
import type { DeleteFailure } from '../features/auth/useAuth';
import { useEscapeKey } from '../features/focus/useEscapeKey';
import { useFocusTrap } from '../features/focus/useFocusTrap';
import type { TextSize } from '../features/settings/useTextSize';
import { useI18n } from '../i18n/LangueProvider';
import type { Langue } from '../i18n/langue';
import BoutonAction from './BoutonAction';
import { IconeFermer } from './Icones';

/**
 * SettingsPanel : le panneau "Mon compte", une fenêtre au-dessus d'un fond sombre.
 * Il contient le choix de la langue, de la taille du texte, du thème, le bouton "Se déconnecter"
 * et la suppression du compte (avec une confirmation par mot de passe).
 * Il se ferme avec le bouton ×, la touche Échap, ou un clic sur le fond.
 * Props :
 * - isDarkMode : thème actuel, pour choisir les couleurs et savoir quel choix de thème est actif.
 * - username : nom de l'utilisateur connecté, ou null si personne n'est connecté.
 * - textSize : taille du texte actuelle.
 * - onChangeTextSize : appelé avec la taille choisie (petit, moyen ou grand).
 * - onToggleTheme : bascule le thème ; le panneau ne l'appelle que si le thème change.
 * - onLogout : déconnecte l'élève et referme les portes (et le panneau).
 * - onDeleteAccount : supprime le compte après vérification du mot de passe. Renvoie null si c'est fait,
 *   sinon la raison de l'échec. Quand ça réussit, le panneau appelle onLogout.
 * - onClose : ferme le panneau.
 * La langue ne passe pas par les props : elle vient directement de useI18n (setLangue change la langue partout).
 */

type SettingsPanelProps = {
  isDarkMode: boolean;
  username: string | null;
  textSize: TextSize;
  onChangeTextSize: (size: TextSize) => void;
  onToggleTheme: () => void;
  onLogout: () => void;
  onDeleteAccount: (password: string) => Promise<DeleteFailure | null>;
  onClose: () => void;
};

const SettingsPanel = ({
  isDarkMode,
  username,
  textSize,
  onChangeTextSize,
  onToggleTheme,
  onLogout,
  onDeleteAccount,
  onClose,
}: SettingsPanelProps) => {
  const { t, langue, setLangue } = useI18n();

  // Références utilisées par le piège à focus : le panneau, son bouton ×, et le bouton qui ouvre la suppression
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  // Suppression du compte : confirmation ouverte ou non, mot de passe saisi, erreur affichée, envoi en cours.
  // Le mot de passe vit seulement dans cet état : il n'est ni enregistré, ni journalisé.
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<DeleteFailure | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Les valeurs (petit, moyen, fr...) restent des codes ; seuls les libellés changent avec la langue
  const textSizeOptions: { value: TextSize; label: string }[] = [
    { value: 'petit', label: t.interface.parametres.petit },
    { value: 'moyen', label: t.interface.parametres.moyen },
    { value: 'grand', label: t.interface.parametres.grand },
  ];

  // Le thème est un booléen (sombre ou non) : le hook useTheme ne sait que basculer, on le laisse faire
  const themeOptions: { wantsDark: boolean; label: string }[] = [
    { wantsDark: true, label: t.interface.parametres.sombre },
    { wantsDark: false, label: t.interface.parametres.clair },
  ];

  // Choix de la langue : les noms sont écrits dans leur propre langue, pour qu'on les reconnaisse toujours
  const languageOptions: { value: Langue; label: string }[] = [
    { value: 'fr', label: t.interface.parametres.francais },
    { value: 'en', label: t.interface.parametres.anglais },
  ];

  // Annule la confirmation et efface le mot de passe. Le focus revient sur le bouton qui l'a ouverte.
  const cancelDelete = () => {
    setIsConfirmingDelete(false);
    setDeletePassword('');
    setDeleteError(null);
    deleteButtonRef.current?.focus();
  };

  // Échap : d'abord referme la confirmation si elle est ouverte, sinon ferme le panneau.
  // La phase de capture et stopPropagation (dans le hook) empêchent aussi useDoors de refermer les portes.
  useEscapeKey(() => {
    if (isConfirmingDelete) cancelDelete();
    else onClose();
  });

  // Le focus reste dans le panneau tant qu'il est ouvert, et commence sur le bouton ×
  useFocusTrap(dialogRef, true, closeButtonRef);

  const openDelete = () => {
    setDeleteError(null);
    setIsConfirmingDelete(true);
  };

  // Envoi de la suppression. Si le serveur accepte, onLogout efface la session et ferme le panneau.
  // Un mauvais mot de passe (403) reste sur le panneau : l'élève n'est pas déconnecté.
  const handleDeleteSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);
    const echec = await onDeleteAccount(deletePassword);
    setIsDeleting(false);

    if (echec === null) {
      setDeletePassword('');
      onLogout();
      return;
    }
    setDeleteError(echec);
  };

  // Un clic sur le fond sombre ferme le panneau, mais un clic sur le panneau lui-même non
  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const selectTheme = (wantsDark: boolean) => {
    if (wantsDark !== isDarkMode) onToggleTheme();
  };

  const optionClass = (isActive: boolean) =>
    `chip-btn flex-1 min-h-11 py-2.5 rounded-lg text-sm font-bold ${
      isActive
        ? 'bg-gradient-to-r from-blue-600 to-cyan-700 text-white'
        : isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
    }`;

  const deleteFieldClass = `w-full px-4 min-h-11 py-2.5 rounded-lg border-2 outline-none focus:ring-2 focus:ring-cyan-400 ${
    isDarkMode ? 'bg-[color:var(--champ)] border-cyan-400 text-white' : 'bg-[color:var(--champ)] border-cyan-300 text-gray-800'
  }`;

  // Le message d'erreur est choisi ici : un mauvais mot de passe a son propre texte
  // Trop d'essais avec un temps connu : on donne les minutes à attendre
  const deleteErrorMessage = (() => {
    if (deleteError?.reason === 'wrong-password') return t.interface.parametres.mauvaisMotDePasse;
    if (deleteError?.reason === 'too-many' && deleteError.attenteSecondes !== undefined) {
      return t.interface.parametres.tropEssaisAvec(minutesDattente(deleteError.attenteSecondes));
    }
    return t.interface.parametres.erreurSuppression;
  })();

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 flex overflow-y-auto p-4"
      onClick={handleBackdropClick}
    >
      {/* m-auto centre le panneau, et il défile si l'écran est trop bas (téléphone en paysage) */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-mon-compte"
        className={`neo-glow m-auto w-full max-w-md p-6 rounded-lg flex flex-col gap-6 bg-[color:var(--surface)]`}
      >
        <div className="flex items-center justify-between">
          <h2 id="titre-mon-compte" className="text-xl font-black neon-text">{t.interface.parametres.titre}</h2>
          <BoutonAction
            ref={closeButtonRef}
            icon={<IconeFermer />}
            label={t.interface.parametres.fermer}
            isDarkMode={isDarkMode}
            onClick={onClose}
          />
        </div>

        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {username ? (
            <>{t.interface.parametres.connecteEn} <strong>{username}</strong></>
          ) : (
            t.interface.parametres.aucunCompte
          )}
        </p>

        <section className="flex flex-col gap-2">
          <h3 className={`text-sm font-bold ${isDarkMode ? 'text-cyan-300' : 'text-blue-700'}`}>{t.interface.parametres.tailleTexte}</h3>
          <div className="flex gap-2" role="group" aria-label={t.interface.parametres.tailleTexte}>
            {textSizeOptions.map(option => (
              <button
                key={option.value}
                type="button"
                aria-pressed={option.value === textSize}
                onClick={() => onChangeTextSize(option.value)}
                className={optionClass(option.value === textSize)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className={`text-sm font-bold ${isDarkMode ? 'text-cyan-300' : 'text-blue-700'}`}>{t.interface.parametres.theme}</h3>
          <div className="flex gap-2" role="group" aria-label={t.interface.parametres.theme}>
            {themeOptions.map(option => (
              <button
                key={String(option.wantsDark)}
                type="button"
                aria-pressed={option.wantsDark === isDarkMode}
                onClick={() => selectTheme(option.wantsDark)}
                className={optionClass(option.wantsDark === isDarkMode)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className={`text-sm font-bold ${isDarkMode ? 'text-cyan-300' : 'text-blue-700'}`}>{t.interface.parametres.langue}</h3>
          <div className="flex gap-2" role="group" aria-label={t.interface.parametres.langue}>
            {languageOptions.map(option => (
              <button
                key={option.value}
                type="button"
                aria-pressed={option.value === langue}
                onClick={() => setLangue(option.value)}
                className={optionClass(option.value === langue)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {username && (
          <button
            type="button"
            onClick={onLogout}
            className="chip-btn w-full min-h-11 py-2.5 rounded-lg text-sm font-bold text-red-500 border border-red-500/60 hover:bg-red-500/20"
          >
            {t.interface.parametres.seDeconnecter}
          </button>
        )}

        {/* Suppression du compte : lien discret (danger sobre), puis confirmation par mot de passe */}
        {username && (
          <div className="flex flex-col gap-3">
            <button
              ref={deleteButtonRef}
              type="button"
              aria-expanded={isConfirmingDelete}
              onClick={openDelete}
              className="chip-btn self-center text-sm text-red-400 underline underline-offset-4 hover:text-red-300"
            >
              {t.interface.parametres.supprimerCompte}
            </button>

            {isConfirmingDelete && (
              <form
                onSubmit={handleDeleteSubmit}
                className={`flex flex-col gap-3 p-4 rounded-lg border ${
                  isDarkMode ? 'border-red-500/40 bg-red-900/10' : 'border-red-300 bg-red-50'
                }`}
              >
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.interface.parametres.supprimerExplication}
                </p>

                <div className="flex flex-col gap-2">
                  <label htmlFor="mot-de-passe-suppression" className={`text-sm ${isDarkMode ? 'text-cyan-300' : 'text-blue-700'}`}>
                    {t.interface.parametres.motDePasseConfirmation}
                  </label>
                  {/* autoFocus : le curseur arrive directement dans le champ quand la confirmation s'ouvre */}
                  <input
                    id="mot-de-passe-suppression"
                    type="password"
                    autoComplete="current-password"
                    autoFocus
                    value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)}
                    className={deleteFieldClass}
                  />
                </div>

                {deleteError && (
                  <p
                    role="alert"
                    className={`px-4 py-2 rounded-lg border text-sm ${
                      isDarkMode ? 'bg-red-900/30 border-red-500/60 text-red-300' : 'bg-red-100 border-red-400 text-red-700'
                    }`}
                  >
                    {deleteErrorMessage}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={cancelDelete}
                    disabled={isDeleting}
                    className={`chip-btn flex-1 min-h-11 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                    }`}
                  >
                    {t.interface.parametres.annuler}
                  </button>
                  <button
                    type="submit"
                    disabled={isDeleting || deletePassword === ''}
                    className="chip-btn flex-1 min-h-11 py-2.5 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t.interface.parametres.supprimerDefinitivement}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;

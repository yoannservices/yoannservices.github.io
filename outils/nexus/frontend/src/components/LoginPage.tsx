import { useState } from 'react';
import type { FormEvent } from 'react';
import { minutesDattente } from '../features/auth/attente';
import type { AuthFailure, AuthMode } from '../features/auth/useAuth';
import { useI18n } from '../i18n/LangueProvider';
import { IconeOeil, IconeOeilBarre } from './Icones';

/**
 * LoginPage : la page de connexion affichée à la place du chat tant que personne n'est connecté.
 * Elle propose de se connecter à un compte existant ou d'en créer un (pseudo + mot de passe),
 * puis affiche un message d'erreur fixe.
 * Props :
 * - isDarkMode : thème actuel, pour choisir les couleurs.
 * - sessionExpired : vrai si la session précédente a expiré, pour expliquer pourquoi on se retrouve ici.
 * - onAuthenticate : tente la connexion (ou l'inscription) et renvoie null si ça a réussi, sinon la raison de l'échec.
 */

type LoginPageProps = {
  isDarkMode: boolean;
  sessionExpired: boolean;
  onAuthenticate: (mode: AuthMode, username: string, password: string) => Promise<AuthFailure | null>;
};

const LoginPage = ({ isDarkMode, sessionExpired, onAuthenticate }: LoginPageProps) => {
  const { t } = useI18n();
  const [mode, setMode] = useState<AuthMode>('connexion');
  const [draft, setDraft] = useState('');
  const [password, setPassword] = useState('');
  // Erreur affichée sous le formulaire : la raison, et le temps d'attente quand le serveur l'a donné
  const [erreur, setErreur] = useState<AuthFailure | null>(null);
  const [isPending, setIsPending] = useState(false);
  // Vrai : le mot de passe est écrit en clair (bouton œil). Faux par défaut, pour ne pas l'afficher aux voisins
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Textes des deux modes ; le texte vient de la langue choisie (les valeurs restent les codes français)
  const MODE_OPTIONS: { value: AuthMode; label: string; submitLabel: string }[] = [
    { value: 'connexion', label: t.interface.connexion.modeConnexion, submitLabel: t.interface.connexion.boutonConnexion },
    { value: 'inscription', label: t.interface.connexion.modeInscription, submitLabel: t.interface.connexion.boutonInscription },
  ];

  const currentOption = MODE_OPTIONS.find(option => option.value === mode) ?? MODE_OPTIONS[0];

  // Changer de mode efface l'erreur précédente : elle ne concerne pas l'autre action
  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErreur(null);
  };

  // Texte de l'erreur : pour un trop-d'essais avec un temps connu, on donne les minutes à attendre
  const libelleErreur = (failure: AuthFailure): string =>
    failure.reason === 'too-many' && failure.attenteSecondes !== undefined
      ? t.interface.connexion.erreurs.tropEssaisAvec(minutesDattente(failure.attenteSecondes))
      : t.interface.connexion.erreurs[failure.reason];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    setIsPending(true);
    setErreur(null);
    const echec = await onAuthenticate(mode, draft, password);
    setIsPending(false);
    // En cas de succès, App affiche le chat et cette page disparaît (echec vaut null)
    setErreur(echec);
  };

  const fieldClass = `w-full px-4 py-3 rounded-lg border-2 outline-none focus:ring-2 focus:ring-cyan-400 ${
    isDarkMode
      ? 'bg-[color:var(--champ)] border-cyan-400 text-white placeholder-gray-400'
      : 'bg-[color:var(--champ)] border-cyan-300 text-gray-800 placeholder-gray-500'
  }`;

  const labelClass = `text-sm ${isDarkMode ? 'text-cyan-300' : 'text-blue-700'}`;

  return (
    // Marges de 16px sur téléphone. m-auto (et non justify-center) centre la carte sans la couper
    // quand elle est plus haute que l'écran (téléphone en paysage) : la page peut alors défiler.
    <div className="flex-1 min-h-0 overflow-y-auto flex p-4 sm:p-6">
      <div className="neo-glow m-auto w-full max-w-md p-6 sm:p-8 rounded-lg flex flex-col gap-6">
        {/* Bascule entre connexion et inscription */}
        <div className="grid grid-cols-2 gap-2" role="group" aria-label={t.interface.connexion.typeCompte}>
          {MODE_OPTIONS.map(option => {
            const isActive = option.value === mode;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => changeMode(option.value)}
                className={`chip-btn min-h-11 py-2.5 rounded-lg text-sm font-bold ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-700 text-white'
                    : isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Message de session expirée : il reste affiché tant que l'élève n'a pas tenté de se reconnecter */}
        {sessionExpired && (
          <p
            role="status"
            className={`px-4 py-2 rounded-lg border text-sm ${
              isDarkMode ? 'bg-amber-900/30 border-amber-500/60 text-amber-300' : 'bg-amber-100 border-amber-400 text-amber-800'
            }`}
          >
            {t.interface.connexion.sessionExpiree}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="nom-utilisateur" className={labelClass}>
              {t.interface.connexion.nomUtilisateur}
            </label>
            <input
              id="nom-utilisateur"
              type="text"
              autoComplete="username"
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={t.interface.connexion.pseudoPlaceholder}
              className={fieldClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="mot-de-passe" className={labelClass}>
              {t.interface.connexion.motDePasse}
            </label>
            {/* Le bouton œil est posé à droite, dans le champ. Le pr-12 du champ réserve la place pour que le texte passe à gauche du bouton */}
            <div className="relative">
              <input
                id="mot-de-passe"
                type={isPasswordVisible ? 'text' : 'password'}
                autoComplete={mode === 'connexion' ? 'current-password' : 'new-password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`${fieldClass} pr-12`}
              />
              {/* type="button" : ce bouton ne doit pas envoyer le formulaire. Il fait 40 px pour être facile à toucher sur téléphone */}
              <button
                type="button"
                aria-label={isPasswordVisible ? t.interface.connexion.masquerMotDePasse : t.interface.connexion.afficherMotDePasse}
                aria-pressed={isPasswordVisible}
                // Empêche le clic de déplacer le focus : l'élève reste dans le champ pour continuer à taper
                onMouseDown={e => e.preventDefault()}
                onClick={() => setIsPasswordVisible(visible => !visible)}
                className={`absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  isDarkMode ? 'text-cyan-300 hover:text-white' : 'text-blue-700 hover:text-blue-900'
                }`}
              >
                {isPasswordVisible ? <IconeOeilBarre /> : <IconeOeil />}
              </button>
            </div>
          </div>

          {erreur && (
            <p
              role="alert"
              className={`px-4 py-2 rounded-lg border text-sm ${
                isDarkMode ? 'bg-red-900/30 border-red-500/60 text-red-300' : 'bg-red-100 border-red-400 text-red-700'
              }`}
            >
              {libelleErreur(erreur)}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="chip-btn px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-700 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentOption.submitLabel}
          </button>
        </form>

        {/* Rappel RGPD : visible sous le formulaire, en texte discret pour ne pas faire concurrence aux boutons */}
        <p className={`text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {t.interface.connexion.avertissementRgpd}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

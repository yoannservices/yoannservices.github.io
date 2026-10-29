import BoutonAction from './BoutonAction';
import { IconeCompte, IconeConversation, IconeJeu, IconeLune, IconeSoleil } from './Icones';
import { useI18n } from '../i18n/LangueProvider';

/**
 * AppHeader : la barre du haut (logo NEXUS, bouton des conversations sur téléphone, bouton thème, bouton "Mon compte").
 * Props :
 * - isDarkMode : thème actuel, sert à choisir les couleurs et l'icône du bouton thème.
 * - onToggleTheme : bascule entre thème clair et sombre (la même fonction que dans "Mon compte").
 * - onOpenSettings : ouvre le panneau "Mon compte" (taille du texte, thème, déconnexion).
 * - onToggleChats : ouvre ou ferme le tiroir des conversations. Absent si personne n'est connecté,
 *   et le bouton n'apparaît alors pas. Il n'est visible que sur téléphone : sur les écrans plus grands,
 *   la liste a son propre bouton de repli.
 * - isChatsOpen : vrai quand le tiroir est ouvert, pour que le bouton annonce son état (aria-expanded).
 * - onOpenGames : ouvre la liste des jeux (bouton manette, visible pour tout le monde).
 */

type AppHeaderProps = {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onToggleChats?: () => void;
  isChatsOpen?: boolean;
  onOpenGames: () => void;
};

const AppHeader = ({ isDarkMode, onToggleTheme, onOpenSettings, onToggleChats, isChatsOpen = false, onOpenGames }: AppHeaderProps) => {
  const { t } = useI18n();
  // Le libellé annonce l'action : en thème sombre le bouton propose le clair, et inversement
  const libelleTheme = isDarkMode ? t.interface.entete.passerThemeClair : t.interface.entete.passerThemeSombre;

  return (
    // Sur téléphone la barre est plus serrée (px-3, texte plus petit) pour que le logo et les boutons tiennent sur une ligne
    <div className={`bg-gradient-to-r from-[color:var(--entete-debut)] to-[color:var(--entete-fin)] relative z-40 border-b border-cyan-500/30 px-3 py-2 sm:p-4 flex items-center justify-between gap-2`}>
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="logo-dot w-3 h-3 flex-shrink-0 bg-cyan-400 rounded-full"></div>
        <h2 className="text-xl sm:text-2xl font-black whitespace-nowrap" style={{ fontFamily: "'Urbanist', sans-serif" }}>
          <span className="neon-text">NEXUS</span>
        </h2>
        {/* "Assistant IA" est caché sur téléphone : il n'y a pas la place à côté des boutons */}
        <span className={`hidden sm:inline text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.interface.entete.assistantIa}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {onToggleChats && (
          /* Téléphone uniquement : ouvre le tiroir des conversations */
          <BoutonAction
            icon={<IconeConversation />}
            label={t.interface.liste.titreTiroir}
            isDarkMode={isDarkMode}
            onClick={onToggleChats}
            aria-expanded={isChatsOpen}
            title={t.interface.liste.listeConversations}
            className="sm:hidden"
          />
        )}
        {/* Bouton jeux : ouvre la liste des jeux (manette) */}
        <BoutonAction
          icon={<IconeJeu />}
          label={t.interface.entete.jeux}
          isDarkMode={isDarkMode}
          onClick={onOpenGames}
          title={t.interface.jeux.titre}
        />
        {/* Bouton thème : même bascule que le réglage "Mon compte". Soleil en sombre, lune en clair */}
        <BoutonAction
          icon={isDarkMode ? <IconeSoleil /> : <IconeLune />}
          label={libelleTheme}
          isDarkMode={isDarkMode}
          onClick={onToggleTheme}
          title={libelleTheme}
        />
        <BoutonAction
          icon={<IconeCompte />}
          label={t.interface.entete.compte}
          isDarkMode={isDarkMode}
          onClick={onOpenSettings}
          title={t.interface.entete.monCompte}
        />
      </div>
    </div>
  );
};

export default AppHeader;

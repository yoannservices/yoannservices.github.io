import type { ChangeEvent, DragEvent, FormEvent, KeyboardEvent, RefObject } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import MarkdownMessage from './MarkdownMessage';
import BoutonAction from './BoutonAction';
import { IconeArret, IconeEnvoi, IconeFermer, IconeTrombone } from './Icones';
import { ATTRIBUT_ACCEPT } from '../features/chats/fichierConfig';
import type { ChatFile, FileError } from '../features/chats/types';
import { useI18n } from '../i18n/LangueProvider';
import type { Messages } from '../i18n/messages';

// Hauteur maximale de la zone de saisie, en lignes : au-delà, la zone défile au lieu de grandir encore
const NB_LIGNES_MAX = 6;

/**
 * ChatInput : la zone de saisie en bas (bouton 📎, zone de texte, bouton d'envoi "➜").
 * Au-dessus de la saisie : les fichiers joints en attente, et l'erreur d'ajout de fichier s'il y en a une.
 * Props :
 * - inputMessage : texte actuellement tapé.
 * - onInputChange : appelé à chaque frappe avec le nouveau texte.
 * - onSubmit : appelé quand le message part (Entrée ou bouton "➜").
 * - isDisabled : désactive l'envoi sans chat ouvert (et pendant une réponse, où le bouton devient "Arrêter").
 * - isTyping : vrai pendant qu'une réponse de NEXUS s'écrit. Le bouton d'envoi devient alors "Arrêter".
 * - onStop : appelé quand l'élève clique sur "Arrêter" pendant la réponse.
 * - isDarkMode : thème actuel, pour choisir les couleurs.
 * - textareaRef : référence vers la zone de texte, pour lui donner le focus depuis App.
 * - pendingFiles : fichiers joints au chat et pas encore envoyés.
 * - onAttachFile : appelé avec le fichier choisi dans la boîte de dialogue.
 * - onRemoveFile : appelé avec l'identifiant d'un fichier retiré (bouton ✕).
 * - isUploading : vrai pendant l'analyse d'un fichier.
 * - fileError : erreur à montrer au-dessus de la saisie (fichier refusé, ou message trop long), ou null.
 *
 * Raccourcis : Entrée envoie, Ctrl+Entrée (ou Cmd+Entrée) va à la ligne,
 * Maj+Entrée va aussi à la ligne (comportement normal du navigateur).
 * La zone de saisie grandit avec le texte (jusqu'à NB_LIGNES_MAX lignes), et un fichier glissé sur la barre est joint comme avec le bouton 📎.
 */

type ChatInputProps = {
  inputMessage: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  isDisabled: boolean;
  isTyping: boolean;
  onStop: () => void;
  isDarkMode: boolean;
  textareaRef: RefObject<HTMLTextAreaElement>;
  pendingFiles: ChatFile[];
  onAttachFile: (file: File) => void;
  onRemoveFile: (fileId: string) => void;
  isUploading: boolean;
  fileError: FileError | null;
};

// Couleur du verdict d'analyse d'un fichier : vert pour sûr, orange pour à vérifier, rouge pour dangereux
const couleurVerdict = (verdict: ChatFile['verdict'], isDarkMode: boolean): string => {
  if (verdict === 'SÛR') return isDarkMode ? 'text-emerald-300' : 'text-emerald-700';
  if (verdict === 'À VÉRIFIER') return isDarkMode ? 'text-amber-300' : 'text-amber-700';
  return isDarkMode ? 'text-red-300' : 'text-red-700';
};

// Texte affiché pour un verdict : on compare toujours au code français (stable), puis on prend le texte de la langue choisie
const libelleVerdict = (verdict: ChatFile['verdict'], textes: Messages['interface']['verdict']): string => {
  if (verdict === 'SÛR') return textes.safe;
  if (verdict === 'À VÉRIFIER') return textes.toCheck;
  return textes.dangerous;
};

const ChatInput = ({
  inputMessage,
  onInputChange,
  onSubmit,
  isDisabled,
  isTyping,
  onStop,
  isDarkMode,
  textareaRef,
  pendingFiles,
  onAttachFile,
  onRemoveFile,
  isUploading,
  fileError,
}: ChatInputProps) => {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Vrai pendant qu'un fichier survole la barre : on la met en évidence
  const [isDragOver, setIsDragOver] = useState(false);
  // Nombre d'entrées dans la barre. En passant d'un élément enfant à un autre, le navigateur envoie "entrée" avant "sortie" : on ne retire la mise en évidence qu'à la vraie sortie (compteur à 0)
  const compteurDrag = useRef(0);
  // Un dépôt n'est possible que si l'envoi est possible (même règle que le bouton 📎)
  const peutDeposer = !isDisabled && !isUploading;

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Pendant qu'on compose un caractère (accents, IME), Entrée valide la composition : on n'envoie pas
    if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;

    // Entrée seule : on envoie le message via le formulaire, comme le bouton "➜"
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      if (!isDisabled) e.currentTarget.form?.requestSubmit();
      return;
    }

    // Ctrl+Entrée : on insère nous-mêmes le retour à la ligne, à la position du curseur
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const textarea = e.currentTarget;
      const { selectionStart, selectionEnd, value } = textarea;
      onInputChange(value.slice(0, selectionStart) + '\n' + value.slice(selectionEnd));
      // React réécrit la valeur après ce gestionnaire : on replace le curseur juste après le retour à la ligne
      const cursor = selectionStart + 1;
      requestAnimationFrame(() => textarea.setSelectionRange(cursor, cursor));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    // On vide l'input après avoir pris le fichier : choisir à nouveau le même fichier doit déclencher un changement
    e.currentTarget.value = '';
    if (file) onAttachFile(file);
  };

  // Hauteur de la zone de saisie : elle grandit avec le texte jusqu'à NB_LIGNES_MAX lignes, puis défile
  // useLayoutEffect : la hauteur est recalculée avant que le navigateur dessine, donc pas de saut visible en tapant
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    // On enlève la hauteur posée au tour précédent : la hauteur de la classe CSS redevient la base, ce qui fait redescendre la zone quand le texte est effacé
    textarea.style.height = '';
    const style = getComputedStyle(textarea);
    // Bordures et marges intérieures : scrollHeight ne les compte pas, alors que la hauteur de la zone (border-box) les inclut
    const bordures = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const marges = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const hauteurMax = NB_LIGNES_MAX * parseFloat(style.lineHeight) + marges + bordures;
    // scrollHeight ne descend jamais sous la hauteur actuelle : la hauteur minimale (h-20 sur téléphone, 3 lignes sur ordinateur) est donc gardée
    textarea.style.height = `${Math.min(textarea.scrollHeight + bordures, hauteurMax)}px`;
  }, [inputMessage, textareaRef]);

  // Un glisser-déposer peut contenir du texte sélectionné : on ne s'occupe que des fichiers, pour que le texte se déplace comme d'habitude
  const contientFichier = (e: DragEvent<HTMLDivElement>): boolean => Array.from(e.dataTransfer.types).includes('Files');

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    if (!contientFichier(e)) return;
    e.preventDefault();
    compteurDrag.current += 1;
    setIsDragOver(peutDeposer);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!contientFichier(e)) return;
    // Sans cet appel, le navigateur refuse le dépôt et ouvre le fichier dans l'onglet à la place
    e.preventDefault();
    // Curseur "interdit" quand l'envoi est bloqué : le dépôt n'aura alors pas lieu
    e.dataTransfer.dropEffect = peutDeposer ? 'copy' : 'none';
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!contientFichier(e)) return;
    compteurDrag.current = Math.max(0, compteurDrag.current - 1);
    if (compteurDrag.current === 0) setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    if (!contientFichier(e)) return;
    // Le fichier ne doit pas s'ouvrir dans l'onglet, même si l'envoi est bloqué
    e.preventDefault();
    compteurDrag.current = 0;
    setIsDragOver(false);
    if (!peutDeposer) return;
    // Comme le bouton 📎 : seul le premier fichier est pris, et onAttachFile vérifie son format et sa taille
    const file = e.dataTransfer.files[0];
    if (file) onAttachFile(file);
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-t border-cyan-500/30 p-3 sm:p-6 bg-gradient-to-t from-[color:var(--saisie-fond)]`}
    >
      {/* Mise en évidence pendant un glisser-déposer : elle recouvre la barre, avec pointer-events-none pour que la souris traverse et que la barre ne clignote pas */}
      {isDragOver && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-2 z-10 flex items-center justify-center rounded-lg border-2 border-dashed text-sm font-bold ${isDarkMode ? 'border-cyan-400 bg-[#0a0e27]/85 text-cyan-300' : 'border-cyan-500 bg-white/85 text-blue-700'}`}
        >
          {t.interface.saisie.deposerFichier}
        </div>
      )}
      {/* Erreur d'ajout de fichier : au-dessus de la saisie, avec l'analyse de NEXUS si le fichier a pu être lu */}
      {fileError && (
        <div role="alert" className={`mb-3 text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
          <p>{fileError.message}</p>
          {fileError.analyse && (
            // Zone qui défile : focalisable au clavier, pour lire l'analyse sans souris
            <div
              role="region"
              tabIndex={0}
              aria-label={t.interface.saisie.analyseFichier}
              className={`mt-2 max-h-40 overflow-y-auto rounded-lg border p-3 text-sm ${isDarkMode ? 'border-red-500/50 text-gray-200' : 'border-red-300 text-gray-800'}`}
            >
              <MarkdownMessage text={fileError.analyse} />
            </div>
          )}
        </div>
      )}

      {isUploading && (
        <p role="status" className={`mb-2 text-sm ${isDarkMode ? 'text-cyan-300' : 'text-blue-600'}`}>{t.interface.saisie.analyseEnCours}</p>
      )}

      {/* Fichiers joints en attente d'envoi : un "chip" par fichier, avec son verdict et un bouton pour le retirer */}
      {pendingFiles.length > 0 && (
        <ul aria-label={t.interface.saisie.fichiersJoints} className="mb-2 flex flex-wrap gap-2">
          {pendingFiles.map(file => (
            <li
              key={file.id}
              className={`flex items-center gap-2 pl-3 pr-1 rounded-full border text-sm ${isDarkMode ? 'border-cyan-500/50 bg-[color:var(--champ)]' : 'border-cyan-300 bg-[color:var(--champ)]'}`}
            >
              <span className="flex min-w-0 max-w-[12rem] items-center gap-1.5">
                <IconeTrombone width="14" height="14" className="shrink-0" />
                {/* Le nom est dans son propre span : c'est lui qui se coupe avec "…" quand il est trop long */}
                <span className="min-w-0 truncate">{file.name}</span>
              </span>
              <span className={`font-bold ${couleurVerdict(file.verdict, isDarkMode)}`}>{libelleVerdict(file.verdict, t.interface.verdict)}</span>
              {/* Bouton texte avec icône, 40px de haut pour une cible tactile confortable */}
              <button
                type="button"
                aria-label={`${t.interface.saisie.retirerFichier} : ${file.name}`}
                onClick={() => onRemoveFile(file.id)}
                className={`flex h-11 sm:h-10 items-center gap-1 rounded-full px-3 transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-red-500/20 hover:text-white' : 'text-gray-600 hover:bg-red-100 hover:text-gray-900'}`}
              >
                <IconeFermer width="14" height="14" />
                <span className="sr-only sm:not-sr-only">{t.interface.saisie.retirer}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* items-center : le trombone, la saisie et l'envoi sont centrés verticalement les uns par rapport aux autres */}
      <form onSubmit={onSubmit} className="flex items-center gap-2 sm:gap-3">
        {/* Le champ fichier est caché : le bouton 📎 ouvre la boîte de dialogue à sa place */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ATTRIBUT_ACCEPT}
          onChange={handleFileChange}
          hidden
        />
        {/* Désactivé pendant l'analyse d'un fichier et sans chat ouvert */}
        <BoutonAction
          icon={<IconeTrombone />}
          label={t.interface.saisie.joindre}
          isDarkMode={isDarkMode}
          title={t.interface.saisie.joindreFichier}
          disabled={isDisabled || isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0"
        />
        {/* min-w-0 : sans lui, la zone de texte garde sa largeur minimale et pousse le bouton hors de l'écran sur téléphone.
            h-20 sur téléphone (environ deux lignes) pour laisser de la place au chat ; sm:h-auto rend les trois lignes d'origine.
            Au-delà, la hauteur est ajustée au texte par l'effet useLayoutEffect plus haut. */}
        <textarea
          ref={textareaRef}
          value={inputMessage}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label={t.interface.saisie.placeholder}
          placeholder={t.interface.saisie.placeholder}
          className={`flex-1 min-w-0 h-20 sm:h-auto px-4 py-3 rounded-lg border-2 resize-none overflow-y-auto ${
            isDarkMode
              ? 'bg-[color:var(--champ)] border-cyan-400 text-white placeholder-gray-400'
              : 'bg-[color:var(--champ)] border-cyan-300 text-gray-800 placeholder-gray-500'
          } focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all`}
          rows={3}
        />
        {/* Pendant une réponse, ce bouton devient "Arrêter" : type="button" pour ne pas envoyer le formulaire, et il reste actif.
            Rouge pour que l'élève voie tout de suite que ce n'est plus un envoi. */}
        <button
          type={isTyping ? 'button' : 'submit'}
          onClick={isTyping ? onStop : undefined}
          disabled={!isTyping && isDisabled}
          className={`chip-btn flex items-center gap-2 rounded-lg px-3 py-3 font-bold text-white hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 ${
            isTyping
              ? 'bg-gradient-to-r from-red-600 to-rose-700 hover:shadow-red-500/50'
              : 'bg-gradient-to-r from-blue-600 to-cyan-700 hover:shadow-cyan-500/50'
          }`}
        >
          {isTyping ? <IconeArret /> : <IconeEnvoi />}
          {/* Le libellé n'apparaît qu'à partir de la tablette large : entre 640 et 767 px, la saisie garde sa largeur */}
          <span className="sr-only md:not-sr-only">{isTyping ? t.interface.saisie.arreter : t.interface.saisie.envoyer}</span>
        </button>
      </form>
    </div>
  );
};

export default ChatInput;

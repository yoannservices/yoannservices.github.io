// Textes de l'interface (en-tête, portes, connexion, paramètres, chats, saisie, aperçu HTML).
// Source de vérité : les clés de ce fichier servent de modèle à en/interface.ts (TypeScript vérifie).
export const interfaceFr = {
  // En-tête : bouton du compte, sous-titre à côté du logo
  entete: {
    assistantIa: 'Assistant IA',
    compte: 'Compte',
    monCompte: 'Mon compte',
    // Bouton manette : ouvre la liste des jeux
    jeux: 'Jeux',
    // Libellé du bouton soleil / lune : il annonce l'action (le thème vers lequel on bascule)
    passerThemeClair: 'Passer en thème clair',
    passerThemeSombre: 'Passer en thème sombre',
  },

  // Panneau "Jeux" : la liste, puis le jeu ouvert
  jeux: {
    titre: 'Jeux',
    fermer: 'Fermer',
    retourListe: 'Retour à la liste',
    jouer: 'Jouer',
  },

  // Écran d'accueil : les deux portes
  portes: {
    sousTitre: 'ASSISTANT IA',
    indice: 'CLIQUE POUR ENTRER',
    entrer: 'Entrer dans NEXUS',
  },

  // Page de connexion et d'inscription
  connexion: {
    typeCompte: 'Type de compte',
    modeConnexion: 'Connexion',
    modeInscription: 'Inscription',
    boutonConnexion: 'Se connecter',
    boutonInscription: "S'inscrire",
    sessionExpiree: 'Ta session a expiré, reconnecte-toi.',
    nomUtilisateur: "Nom d'utilisateur",
    pseudoPlaceholder: 'Ton pseudo, pas ton vrai nom',
    motDePasse: 'Mot de passe',
    afficherMotDePasse: 'Afficher le mot de passe',
    masquerMotDePasse: 'Masquer le mot de passe',
    avertissementRgpd: 'Utilise un pseudo, jamais ton vrai nom. N\'écris ni ton adresse, ni ton téléphone, ni ton e-mail.',
    // Un message fixe par raison d'échec renvoyée par useAuth
    erreurs: {
      'not-found': 'Ce nom n\'existe pas.',
      'wrong-password': 'Mot de passe incorrect.',
      taken: 'Ce nom est déjà pris.',
      invalid: 'Pseudo (3 à 20 caractères : lettres, chiffres, _ ou -) ou mot de passe (8 caractères minimum) invalide.',
      unreachable: 'Impossible de contacter le serveur.',
      'too-many': "Trop d'essais. Réessaie dans quelques minutes.",
      // Version avec le temps restant, quand le serveur l'indique (en-tête Retry-After)
      tropEssaisAvec: (minutes: number) => `Trop d'essais. Réessaie dans ${minutes} min.`,
    },
  },

  // Panneau "Mon compte"
  parametres: {
    titre: 'Mon compte',
    fermer: 'Fermer',
    connecteEn: 'Connecté en tant que',
    aucunCompte: 'Aucun compte connecté.',
    tailleTexte: 'Taille du texte',
    petit: 'Petit',
    moyen: 'Moyen',
    grand: 'Grand',
    theme: 'Thème',
    sombre: 'Sombre',
    clair: 'Claire',
    langue: 'Langue',
    francais: 'Français',
    anglais: 'English',
    seDeconnecter: 'Se déconnecter',
    supprimerCompte: 'Supprimer mon compte',
    supprimerExplication: 'Efface ton compte, tes conversations et tes fichiers joints. Cette action est définitive.',
    motDePasseConfirmation: 'Mot de passe pour confirmer',
    supprimerDefinitivement: 'Supprimer définitivement',
    annuler: 'Annuler',
    erreurSuppression: 'La suppression a échoué. Réessaie.',
    mauvaisMotDePasse: 'Mot de passe incorrect.',
    tropEssaisAvec: (minutes: number) => `Trop d'essais. Réessaie dans ${minutes} min.`,
  },

  // Liste des conversations (colonne à gauche, ou tiroir sur téléphone)
  liste: {
    listeConversations: 'Liste des conversations',
    titreTiroir: 'Conversations',
    fermerTiroir: 'Fermer la liste des conversations',
    fermer: 'Fermer',
    options: 'Options',
    labelReplier: 'Replier',
    labelAfficher: 'Afficher',
    replier: 'Replier la liste',
    afficher: 'Afficher la liste',
    nouveauChat: '+ Nouveau chat',
    optionsChat: 'Options de la conversation',
    renommer: 'Renommer',
    supprimer: 'Supprimer',
    confirmerSuppression: 'Supprimer cette conversation ?',
    annuler: 'Annuler',
    nouveauNom: 'Nouveau nom de la conversation',
    // Libellé affiché tant que le chat n'a pas de titre (le titre arrive après le premier échange)
    nouvelleConversation: 'Nouvelle conversation',
    aucuneConversation: "Aucune conversation pour l'instant",
    // Messages temporaires (toast) quand une action de la liste échoue
    erreurCreation: 'Impossible de créer la conversation. Réessaie.',
    erreurRenommage: 'Impossible de renommer la conversation. Réessaie.',
    erreurSuppression: 'Impossible de supprimer la conversation. Réessaie.',
    // Export : entrée du menu ⋯ et libellés écrits dans le fichier .md
    exporter: 'Exporter en Markdown',
    exportRoleEleve: 'Élève',
    exportRoleNexus: 'NEXUS',
  },

  // Écran d'accueil affiché quand aucun chat n'est ouvert
  accueil: {
    presentation: 'NEXUS est un assistant IA : tu décris ce que tu veux, et il te répond.',
    invitation: 'Crée un chat pour commencer à discuter.',
    nouveauChat: 'Nouveau chat',
  },

  // Zone des messages : réponses de NEXUS, copie, erreurs
  chat: {
    erreurEnvoi: 'NEXUS n\'a pas pu répondre. Réessaie.',
    copierReponse: 'Copier la réponse',
    copier: 'Copier',
    copie: 'Copié',
    copieImpossible: 'Copie impossible',
    nexusEcrit: "NEXUS est en train d'écrire...",
    nexusEcritAria: "NEXUS est en train d'écrire",
    erreurChargement: 'Impossible de charger tes conversations.',
    reessayer: 'Réessayer',
    // Annoncée aux lecteurs d'écran (zone aria-live) quand une réponse de NEXUS est terminée
    reponseTerminee: 'NEXUS a répondu.',
    // Bouton rond ↓ : libellé accessible et infobulle, affiché quand l'élève a remonté la conversation
    allerFinConversation: 'Aller à la fin de la conversation',
  },

  // Animation pendant que NEXUS prépare sa réponse : les phrases défilent
  reflexion: {
    phrases: ['NEXUS réfléchit…', 'Je rassemble les idées…', 'Je prépare une réponse claire…', 'Encore un instant…'],
  },

  // Zone de saisie en bas du chat
  saisie: {
    analyseFichier: 'Analyse du fichier',
    analyseEnCours: 'Analyse en cours…',
    fichiersJoints: 'Fichiers joints',
    retirerFichier: 'Retirer le fichier',
    joindreFichier: 'Joindre un fichier',
    joindre: 'Joindre',
    deposerFichier: 'Dépose ton fichier ici',
    retirer: 'Retirer',
    envoyer: 'Envoyer',
    // Remplace le bouton d'envoi pendant qu'une réponse s'écrit : il coupe la réponse
    arreter: 'Arrêter',
    placeholder: 'Écrivez votre message...',
  },

  // Verdict d'analyse d'un fichier. La couleur est choisie à partir du code français (SÛR, À VÉRIFIER, DANGEREUX)
  verdict: {
    safe: 'SÛR',
    toCheck: 'À VÉRIFIER',
    dangerous: 'DANGEREUX',
  },

  // Aperçu HTML (fenêtre qui affiche une page générée par NEXUS)
  apercu: {
    titre: 'Aperçu',
    fermer: "Fermer l'aperçu",
    fermerCourt: 'Fermer',
    iframeTitre: 'Aperçu du HTML',
  },
};

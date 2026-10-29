// Textes des fonctionnalités : connexion, fichiers joints, copie, blocs de code, verdicts, tailles de texte.
// Source de vérité : en/features.ts doit avoir exactement les mêmes clés (TypeScript vérifie).
export const featuresFr = {
  // Connexion : message pour chaque raison d'échec (AuthFailureReason) et message de session expirée
  auth: {
    raisons: {
      'not-found': "Ce nom n'existe pas.",
      'wrong-password': 'Mot de passe incorrect.',
      taken: 'Ce nom est déjà pris.',
      invalid: 'Pseudo (3 à 20 caractères : lettres, chiffres, _ ou -) ou mot de passe (8 caractères minimum) invalide.',
      unreachable: 'Impossible de contacter le serveur.',
    },
    sessionExpiree: 'Ta session a expiré, reconnecte-toi.',
  },

  // Fichiers joints à un chat : erreurs affichées sous la saisie, et verdict de l'analyse
  fichiers: {
    formatNonAccepte: (formats: string) => `Type de fichier non accepté. Formats : ${formats}`,
    // Le serveur n'accepte que ces caractères dans le nom (100 caractères maximum) : pas d'apostrophe, de virgule, de "+" ni de crochets
    nomInvalide: 'Nom de fichier refusé : seuls les lettres, chiffres, espaces et . _ - ( ) sont permis (100 caractères maximum). Renomme ton fichier.',
    tropLourd: (ko: number) => `Fichier trop lourd : ${ko} Ko maximum.`,
    nombreMax: (max: number) => `Tu peux joindre ${max} fichiers maximum avant d'envoyer ton message.`,
    analyseImpossible: "Le fichier n'a pas pu être analysé. Réessaie.",
    // Le verdict reste le code français (dans les données) ; seul son libellé affiché est traduit
    verdicts: {
      'SÛR': 'Sûr',
      'À VÉRIFIER': 'À vérifier',
      'DANGEREUX': 'Dangereux',
    },
  },

  // Message de la zone de saisie refusé à l'envoi (trop long) : le texte reste dans la saisie
  saisie: {
    messageTropLong: (actuel: number, max: number) => `Ton message fait ${actuel} caractères, ${max} maximum. Raccourcis-le pour l'envoyer.`,
  },

  // Bouton "Copier" d'un message : libellé normal, libellé après copie réussie, libellé après échec
  copie: {
    copier: '📋 Copier',
    reussie: '✓ Copié',
    echec: 'Copie impossible',
  },

  // Boutons ajoutés par NEXUS dans les blocs de code (générés en HTML, donc libellés passés en paramètre)
  blocCode: {
    copierCode: 'Copier le code',
    previsualiser: '▶ Prévisualiser',
    previsualiserAria: 'Prévisualiser le HTML',
    voirCodeComplet: 'Voir tout le code',
    reduireCode: 'Réduire le code',
  },

  // Libellés des tailles de texte du panneau "Mon compte"
  tailleTexte: {
    petit: 'Petit',
    moyen: 'Moyen',
    grand: 'Grand',
  },
};

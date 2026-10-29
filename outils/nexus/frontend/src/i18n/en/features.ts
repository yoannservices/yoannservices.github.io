// Feature texts in English. Must mirror fr/features.ts exactly (TypeScript checks it).
import type { featuresFr } from '../fr/features';

export const featuresEn: typeof featuresFr = {
  auth: {
    raisons: {
      'not-found': "This username doesn't exist.",
      'wrong-password': 'Incorrect password.',
      taken: 'This username is already taken.',
      invalid: 'Username (3 to 20 characters: letters, numbers, _ or -) or password (8 characters minimum) is invalid.',
      unreachable: 'Unable to reach the server.',
    },
    sessionExpiree: 'Your session has expired, please log in again.',
  },

  fichiers: {
    formatNonAccepte: (formats: string) => `File type not allowed. Formats: ${formats}`,
    nomInvalide: 'File name not allowed: only letters, numbers, spaces and . _ - ( ) are allowed (100 characters maximum). Rename your file.',
    tropLourd: (ko: number) => `File too large: ${ko} KB maximum.`,
    nombreMax: (max: number) => `You can attach up to ${max} files before sending your message.`,
    analyseImpossible: "The file could not be analyzed. Try again.",
    verdicts: {
      'SÛR': 'Safe',
      'À VÉRIFIER': 'To check',
      'DANGEREUX': 'Dangerous',
    },
  },

  saisie: {
    messageTropLong: (actuel: number, max: number) => `Your message is ${actuel} characters long, ${max} maximum. Shorten it to send it.`,
  },

  copie: {
    copier: '📋 Copy',
    reussie: '✓ Copied',
    echec: 'Copy failed',
  },

  blocCode: {
    copierCode: 'Copy code',
    previsualiser: '▶ Preview',
    previsualiserAria: 'Preview HTML',
    voirCodeComplet: 'Show full code',
    reduireCode: 'Collapse code',
  },

  tailleTexte: {
    petit: 'Small',
    moyen: 'Medium',
    grand: 'Large',
  },
};

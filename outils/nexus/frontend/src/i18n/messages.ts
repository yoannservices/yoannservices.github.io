// Assemble tous les dictionnaires. Chaque zone du site a son fichier dans fr/ et en/.
import { interfaceFr } from './fr/interface';
import { interfaceEn } from './en/interface';
import { featuresFr } from './fr/features';
import { featuresEn } from './en/features';
import type { Langue } from './langue';

export const messagesFr = { interface: interfaceFr, features: featuresFr };

// Le type vient de la version française : la version anglaise doit avoir exactement les mêmes clés.
export type Messages = typeof messagesFr;

export const messagesEn: Messages = { interface: interfaceEn, features: featuresEn };

export const getMessages = (langue: Langue): Messages => (langue === 'en' ? messagesEn : messagesFr);

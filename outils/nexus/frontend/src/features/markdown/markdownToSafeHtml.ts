import { Marked } from 'marked';
import DOMPurify from 'dompurify';
import { renderCodeBlockHtml } from './renderCodeBlock';
import type { LibellesBlocCode } from './renderCodeBlock';

// Notre propre "marked" : il sait dessiner les blocs de code avec leur barre "Copier le code".
// On n'utilise pas marked.parse global pour ne pas changer la façon de rendre les autres éléments.
// useNewRenderer : marked 13 passe alors le bloc de code sous forme d'objet ({ text, lang, escaped }),
// comme le décrivent ses types. Sans ce réglage, il passerait des arguments positionnels (ancien format).
// Les libellés dépendent de la langue : on crée le parseur à chaque appel, avec ceux de la langue courante.
const creerParseur = (libelles: LibellesBlocCode): Marked =>
  new Marked({
    breaks: true,
    useNewRenderer: true,
    renderer: {
      code({ text, lang, escaped }) {
        return renderCodeBlockHtml(text, lang, libelles, escaped);
      },
    },
  });

// Ce que DOMPurify doit garder en plus de son réglage par défaut.
// Les boutons "Copier le code" et "Prévisualiser" ont besoin de <button>, de leur type et de leurs attributs
// data-* : on les déclare ici pour que ce soit clair et qu'un futur changement par défaut ne les casse pas.
// Aucun attribut de gestionnaire (onclick...) n'est autorisé : les clics passent par la délégation d'événements.
// Les attributs "class" et "data-*" restent autorisés par défaut dans DOMPurify : les boutons continuent de marcher.
const SANITIZE_OPTIONS = {
  ADD_TAGS: ['button'],
  ADD_ATTR: ['type', 'aria-label', 'data-copier-code', 'data-preview-code'],
  // Balises interdites :
  // - form, input, textarea, select : un faux formulaire de connexion pourrait envoyer les données à un site externe ;
  // - style : une feuille de style injectée pourrait changer l'apparence de tout NEXUS ;
  // - img : une image charge une adresse externe, ce qui peut transmettre des données à un serveur tiers
  //   (par exemple dans l'URL), alors on retire les images des réponses par sécurité.
  FORBID_TAGS: ['style', 'form', 'input', 'textarea', 'select', 'img'],
  // L'attribut style est interdit lui aussi (il pourrait cacher ou recouvrir des éléments de l'interface)
  FORBID_ATTR: ['style'],
};

// Après le nettoyage, chaque lien s'ouvre dans un nouvel onglet : NEXUS reste ouvert et le brouillon n'est pas perdu.
// "noopener noreferrer" empêche la page ouverte de contrôler NEXUS et de savoir d'où vient le clic.
// Ce hook est enregistré une seule fois, ici, au chargement du fichier (pas à chaque appel de la fonction).
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

// Transforme le texte Markdown d'une réponse de NEXUS en HTML prêt à afficher.
// libelles : les boutons des blocs de code, dans la langue courante (t.features.blocCode).
export const markdownToSafeHtml = async (text: string, libelles: LibellesBlocCode): Promise<string> => {
  const result = await creerParseur(libelles).parse(text);
  // Nettoie le HTML généré : la réponse de l'IA ne doit jamais pouvoir exécuter du script
  return DOMPurify.sanitize(result, SANITIZE_OPTIONS);
};

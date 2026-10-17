const PROGRAMME = {
  "6eme": {
    "label": "6ème",
    "subjects": {
      "maths": {
        "label": "Mathématiques",
        "icon": "fa-calculator",
        "fiches": [
          {
            "title": "Nombres entiers et décimaux",
            "tag": "Numération",
            "content": "<h4>Les grands nombres</h4>\n<p>Un nombre entier s'écrit avec des <strong>chiffres de 0 à 9</strong>. Chaque chiffre a une valeur selon sa position (unités, dizaines, centaines…).</p>\n<div class=\"key-point\">📌 <strong>Rappel :</strong> Dans 3 457, le chiffre 4 est le chiffre des centaines, il vaut 400.</div>\n<h4>Les nombres décimaux</h4>\n<ul>\n  <li><strong>Partie entière</strong> : à gauche de la virgule</li>\n  <li><strong>Partie décimale</strong> : à droite de la virgule (dixièmes, centièmes, millièmes)</li>\n  <li>Exemple : 12,345 → 12 (entier) + 3 dixièmes + 4 centièmes + 5 millièmes</li>\n</ul>\n<h4>Comparer et ranger</h4>\n<p>On compare d'abord les <strong>parties entières</strong>, puis les décimales chiffre par chiffre de gauche à droite.</p>"
          },
          {
            "title": "Les fractions",
            "tag": "Numération",
            "content": "<h4>Qu'est-ce qu'une fraction ?</h4>\n<p>Une fraction représente une <strong>partie d'un tout</strong>. Elle s'écrit <strong>a/b</strong> (a = numérateur, b = dénominateur).</p>\n<div class=\"key-point\">📌 3/4 signifie 3 parts sur 4 parts égales.</div>\n<h4>Fractions et droite graduée</h4>\n<ul>\n  <li>Placer une fraction sur une droite : diviser l'unité en <strong>b parts égales</strong>, compter <strong>a parts</strong></li>\n  <li>Fractions supérieures à 1 : quand le numérateur > dénominateur (ex : 7/4 = 1 + 3/4)</li>\n</ul>\n<h4>Fractions égales</h4>\n<p>On peut multiplier ou diviser numérateur et dénominateur par le même nombre : <strong>1/2 = 2/4 = 3/6</strong></p>"
          },
          {
            "title": "Géométrie : droites et angles",
            "tag": "Géométrie",
            "content": "<h4>Vocabulaire de base</h4>\n<ul>\n  <li><strong>Point</strong> : position dans le plan, noté avec une lettre majuscule (A, B…)</li>\n  <li><strong>Droite</strong> : illimitée des deux côtés, notée (AB)</li>\n  <li><strong>Segment</strong> : portion de droite limitée, noté [AB]</li>\n  <li><strong>Demi-droite</strong> : limitée d'un côté, notée [AB)</li>\n</ul>\n<h4>Droites particulières</h4>\n<div class=\"key-point\">📌 <strong>Perpendiculaires</strong> : forment un angle de 90°. <strong>Parallèles</strong> : ne se croisent jamais.</div>\n<h4>Les angles</h4>\n<ul>\n  <li><strong>Angle droit</strong> = 90°</li>\n  <li><strong>Angle aigu</strong> : entre 0° et 90°</li>\n  <li><strong>Angle obtus</strong> : entre 90° et 180°</li>\n  <li><strong>Angle plat</strong> = 180°</li>\n</ul>"
          },
          {
            "title": "Périmètre et aire",
            "tag": "Mesures",
            "content": "<h4>Périmètre</h4>\n<p>Le périmètre est la <strong>longueur du contour</strong> d'une figure.</p>\n<ul>\n  <li>Carré : P = 4 × côté</li>\n  <li>Rectangle : P = 2 × (longueur + largeur)</li>\n  <li>Cercle : P = 2 × π × rayon</li>\n</ul>\n<h4>Aire</h4>\n<p>L'aire mesure la <strong>surface</strong> d'une figure.</p>\n<ul>\n  <li>Carré : A = côté × côté</li>\n  <li>Rectangle : A = longueur × largeur</li>\n  <li>Triangle : A = (base × hauteur) / 2</li>\n</ul>\n<div class=\"key-point\">📌 Ne pas confondre : le périmètre est en <strong>m, cm…</strong> et l'aire en <strong>m², cm²…</strong></div>"
          }
        ],
        "quiz": [
          {
            "q": "Quel est le chiffre des centaines dans 8 523 ?",
            "options": [
              "8",
              "5",
              "2",
              "3"
            ],
            "correct": 1,
            "expl": "Dans 8 523, en partant de la droite : 3 (unités), 2 (dizaines), <strong>5 (centaines)</strong>, 8 (milliers)."
          },
          {
            "q": "Combien vaut 3/4 en décimal ?",
            "options": [
              "0,34",
              "0,75",
              "0,43",
              "1,33"
            ],
            "correct": 1,
            "expl": "3 ÷ 4 = <strong>0,75</strong>. On divise le numérateur par le dénominateur."
          },
          {
            "q": "Quel est le périmètre d'un carré de côté 7 cm ?",
            "options": [
              "14 cm",
              "21 cm",
              "28 cm",
              "49 cm"
            ],
            "correct": 2,
            "expl": "P = 4 × côté = 4 × 7 = <strong>28 cm</strong>."
          },
          {
            "q": "Un angle de 120° est un angle :",
            "options": [
              "aigu",
              "droit",
              "obtus",
              "plat"
            ],
            "correct": 2,
            "expl": "Un <strong>angle obtus</strong> mesure entre 90° et 180°."
          },
          {
            "q": "Quelle fraction est égale à 2/3 ?",
            "options": [
              "4/6",
              "3/4",
              "2/6",
              "4/9"
            ],
            "correct": 0,
            "expl": "2/3 = <strong>4/6</strong> (on multiplie numérateur et dénominateur par 2)."
          },
          {
            "q": "Aire d'un rectangle de 8 cm par 5 cm ?",
            "options": [
              "26 cm²",
              "13 cm²",
              "40 cm²",
              "80 cm²"
            ],
            "correct": 2,
            "expl": "A = L × l = 8 × 5 = <strong>40 cm²</strong>."
          },
          {
            "q": "Deux droites qui ne se croisent jamais sont :",
            "options": [
              "perpendiculaires",
              "sécantes",
              "parallèles",
              "confondues"
            ],
            "correct": 2,
            "expl": "Des droites <strong>parallèles</strong> ont la même direction et ne se rencontrent jamais."
          },
          {
            "q": "Quel nombre est compris entre 3,5 et 3,6 ?",
            "options": [
              "3,45",
              "3,65",
              "3,55",
              "3,4"
            ],
            "correct": 2,
            "expl": "<strong>3,55</strong> est bien entre 3,5 et 3,6."
          }
        ],
        "flashcards": [
          {
            "front": "Qu'est-ce qu'un nombre décimal ?",
            "back": "Un nombre qui s'écrit avec une <strong>virgule</strong>. Il a une partie entière et une partie décimale (dixièmes, centièmes…)."
          },
          {
            "front": "Formule du périmètre d'un cercle ?",
            "back": "<strong>P = 2 × π × r</strong> (ou P = π × d), avec r = rayon et d = diamètre."
          },
          {
            "front": "Que signifie 5/8 ?",
            "back": "<strong>5 parts sur 8</strong> parts égales. Le numérateur (5) est en haut, le dénominateur (8) en bas."
          },
          {
            "front": "Angle droit = combien de degrés ?",
            "back": "<strong>90°</strong>. Il se note avec un petit carré."
          },
          {
            "front": "Comment reconnaître des droites perpendiculaires ?",
            "back": "Elles se coupent en formant un <strong>angle droit (90°)</strong>."
          }
        ]
      },
      "francais": {
        "label": "Français",
        "icon": "fa-feather",
        "fiches": [
          {
            "title": "Les classes grammaticales",
            "tag": "Grammaire",
            "content": "<h4>Les mots variables</h4>\n<ul>\n  <li><strong>Nom</strong> : désigne un être, une chose, une idée (chat, liberté)</li>\n  <li><strong>Déterminant</strong> : précède le nom (le, une, mon, ce, trois…)</li>\n  <li><strong>Adjectif</strong> : qualifie le nom (grand, bleu, intelligent)</li>\n  <li><strong>Pronom</strong> : remplace un nom (il, elle, celui-ci, qui…)</li>\n  <li><strong>Verbe</strong> : exprime une action ou un état (manger, être)</li>\n</ul>\n<h4>Les mots invariables</h4>\n<ul>\n  <li><strong>Adverbe</strong> : modifie un verbe, adjectif ou autre adverbe (vite, très, ne…pas)</li>\n  <li><strong>Préposition</strong> : relie des mots (à, de, pour, dans, sur…)</li>\n  <li><strong>Conjonction</strong> : relie des propositions (et, mais, car, quand, si…)</li>\n</ul>\n<div class=\"key-point\">📌 Moyen mnémotechnique des conjonctions de coordination : <strong>Mais Ou Et Donc Or Ni Car</strong></div>"
          },
          {
            "title": "Les temps de l'indicatif",
            "tag": "Conjugaison",
            "content": "<h4>Le présent</h4>\n<p>Action en cours. Terminaisons du 1er groupe : <strong>-e, -es, -e, -ons, -ez, -ent</strong></p>\n<h4>L'imparfait</h4>\n<p>Action passée qui dure ou se répète. Terminaisons : <strong>-ais, -ais, -ait, -ions, -iez, -aient</strong></p>\n<h4>Le passé simple</h4>\n<p>Action passée, courte et terminée. 1er groupe : <strong>-ai, -as, -a, -âmes, -âtes, -èrent</strong></p>\n<h4>Le futur simple</h4>\n<p>Action à venir. On ajoute au verbe à l'infinitif : <strong>-ai, -as, -a, -ons, -ez, -ont</strong></p>\n<div class=\"key-point\">📌 Astuce : au futur, on entend toujours le <strong>-r-</strong> de l'infinitif (je mangerai, tu finiras).</div>"
          },
          {
            "title": "Le récit : schéma narratif",
            "tag": "Littérature",
            "content": "<h4>Les 5 étapes du schéma narratif</h4>\n<ul>\n  <li><strong>1. Situation initiale</strong> : présentation du cadre et des personnages (équilibre)</li>\n  <li><strong>2. Élément perturbateur</strong> : un événement rompt l'équilibre (« un jour… »)</li>\n  <li><strong>3. Péripéties</strong> : les actions et aventures du personnage</li>\n  <li><strong>4. Élément de résolution</strong> : le problème est résolu</li>\n  <li><strong>5. Situation finale</strong> : nouvel équilibre</li>\n</ul>\n<div class=\"key-point\">📌 Le schéma narratif s'applique aux contes, nouvelles, romans… C'est la structure de base du récit.</div>"
          }
        ],
        "quiz": [
          {
            "q": "« Rapidement » est quel type de mot ?",
            "options": [
              "Adjectif",
              "Adverbe",
              "Préposition",
              "Nom"
            ],
            "correct": 1,
            "expl": "<strong>Rapidement</strong> est un adverbe. Il modifie un verbe et est invariable."
          },
          {
            "q": "Quelle est la terminaison du futur simple pour « je » (1er groupe) ?",
            "options": [
              "-ai",
              "-ais",
              "-é",
              "-e"
            ],
            "correct": 0,
            "expl": "Au futur simple : je manger<strong>ai</strong>, je chanter<strong>ai</strong>."
          },
          {
            "q": "L'élément perturbateur dans un récit, c'est :",
            "options": [
              "La fin de l'histoire",
              "Ce qui déclenche l'aventure",
              "La présentation des personnages",
              "Le dénouement"
            ],
            "correct": 1,
            "expl": "L'élément perturbateur est <strong>l'événement qui rompt l'équilibre initial</strong> et lance l'intrigue."
          },
          {
            "q": "« Mais, ou, et, donc, or, ni, car » sont des :",
            "options": [
              "Prépositions",
              "Adverbes",
              "Conjonctions de coordination",
              "Pronoms"
            ],
            "correct": 2,
            "expl": "Ce sont les 7 <strong>conjonctions de coordination</strong> (moyen mnémo : Mais Ou Et Donc Or Ni Car)."
          },
          {
            "q": "L'imparfait sert à exprimer :",
            "options": [
              "Une action brève au passé",
              "Une action qui dure ou se répète au passé",
              "Une action future",
              "Un ordre"
            ],
            "correct": 1,
            "expl": "L'imparfait décrit des actions <strong>duratives ou habituelles</strong> dans le passé."
          }
        ],
        "flashcards": [
          {
            "front": "Qu'est-ce qu'un déterminant ?",
            "back": "Un mot qui se place <strong>devant le nom</strong> pour le préciser : le, la, un, mon, ce, deux…"
          },
          {
            "front": "Citez les 7 conjonctions de coordination",
            "back": "<strong>Mais, Ou, Et, Donc, Or, Ni, Car</strong>"
          },
          {
            "front": "Quelles sont les terminaisons de l'imparfait ?",
            "back": "<strong>-ais, -ais, -ait, -ions, -iez, -aient</strong> (identiques pour tous les groupes)"
          },
          {
            "front": "Qu'est-ce que la situation initiale d'un récit ?",
            "back": "Le <strong>début du récit</strong> qui présente le cadre, les personnages, et l'état d'équilibre avant l'aventure."
          }
        ]
      },
      "histoire": {
        "label": "Histoire-Géo",
        "icon": "fa-landmark",
        "fiches": [
          {
            "title": "La Préhistoire et les premiers hommes",
            "tag": "Hist. - Antiquité",
            "content": "<h4>Les grandes périodes</h4>\n<ul>\n  <li><strong>Paléolithique</strong> (−3 millions à −10 000 ans) : nomades, chasseurs-cueilleurs, outils en pierre taillée</li>\n  <li><strong>Néolithique</strong> (−10 000 à −3 300 ans) : sédentarisation, agriculture, élevage, pottery</li>\n</ul>\n<h4>Les premiers hommes</h4>\n<ul>\n  <li><strong>Homo habilis</strong> : premiers outils (−2,5 millions d'années)</li>\n  <li><strong>Homo erectus</strong> : maîtrise du feu (−1,8 million)</li>\n  <li><strong>Homo sapiens</strong> : notre espèce (−300 000 ans), art rupestre (Lascaux ≈ −17 000 ans)</li>\n</ul>\n<div class=\"key-point\">📌 L'invention de l'<strong>écriture</strong> vers −3 300 marque la fin de la Préhistoire et le début de l'<strong>Histoire</strong>.</div>"
          },
          {
            "title": "Rome : de la République à l'Empire",
            "tag": "Hist. - Antiquité",
            "content": "<h4>La fondation</h4>\n<p>Selon la légende, <strong>Rome</strong> est fondée en <strong>−753</strong> par Romulus. Elle devient une République gouvernée par le Sénat.</p>\n<h4>La République romaine</h4>\n<ul>\n  <li><strong>Consuls</strong> : deux magistrats élus pour 1 an</li>\n  <li><strong>Sénat</strong> : assemblée de patriciens qui conseille</li>\n  <li>Conquêtes : Gaule, Grèce, Égypte…</li>\n</ul>\n<h4>L'Empire</h4>\n<p>En <strong>−27</strong>, <strong>Auguste</strong> (Octave) devient le premier empereur. L'Empire dure jusqu'en 476 (chute de Rome).</p>\n<div class=\"key-point\">📌 La <strong>Pax Romana</strong> (Ier-IIe siècle) est une période de paix et prospérité dans tout l'Empire.</div>"
          }
        ],
        "quiz": [
          {
            "q": "Quand l'écriture est-elle inventée environ ?",
            "options": [
              "−10 000",
              "−3 300",
              "−753",
              "476"
            ],
            "correct": 1,
            "expl": "L'écriture apparaît vers <strong>−3 300</strong> en Mésopotamie (écriture cunéiforme) et en Égypte (hiéroglyphes)."
          },
          {
            "q": "Qui a fondé Rome selon la légende ?",
            "options": [
              "César",
              "Auguste",
              "Romulus",
              "Rémus"
            ],
            "correct": 2,
            "expl": "<strong>Romulus</strong> aurait fondé Rome en −753 après avoir tué son frère Rémus."
          },
          {
            "q": "Le Néolithique est marqué par :",
            "options": [
              "La maîtrise du feu",
              "L'apparition de l'écriture",
              "La sédentarisation et l'agriculture",
              "La chute de Rome"
            ],
            "correct": 2,
            "expl": "Le Néolithique (« nouvelle pierre ») est la période de la <strong>sédentarisation</strong>, de l'agriculture et de l'élevage."
          },
          {
            "q": "Qui est le premier empereur romain ?",
            "options": [
              "Jules César",
              "Auguste",
              "Néron",
              "Trajan"
            ],
            "correct": 1,
            "expl": "<strong>Auguste</strong> (Octave) reçoit le titre en −27 et fonde le principat."
          }
        ],
        "flashcards": [
          {
            "front": "Quand commence l'Histoire ?",
            "back": "Vers <strong>−3 300</strong>, avec l'invention de l'<strong>écriture</strong>."
          },
          {
            "front": "Qu'est-ce que la Pax Romana ?",
            "back": "Période de <strong>paix et prospérité</strong> dans l'Empire romain (Ier-IIe siècle après J.-C.)."
          },
          {
            "front": "Différence Paléolithique / Néolithique ?",
            "back": "<strong>Paléolithique</strong> = nomades, chasse, pierre taillée. <strong>Néolithique</strong> = sédentaires, agriculture, pierre polie."
          }
        ]
      },
      "sciences": {
        "label": "Sciences",
        "icon": "fa-flask",
        "fiches": [
          {
            "title": "La matière : états et changements",
            "tag": "Physique-Chimie",
            "content": "<h4>Les 3 états de la matière</h4>\n<ul>\n  <li><strong>Solide</strong> : forme propre, volume propre (glaçon)</li>\n  <li><strong>Liquide</strong> : pas de forme propre, volume propre (eau)</li>\n  <li><strong>Gaz</strong> : ni forme ni volume propre, se répand (vapeur)</li>\n</ul>\n<h4>Les changements d'état</h4>\n<ul>\n  <li>Solide → Liquide : <strong>fusion</strong> (0°C pour l'eau)</li>\n  <li>Liquide → Gaz : <strong>vaporisation</strong> (100°C pour l'eau)</li>\n  <li>Gaz → Liquide : <strong>liquéfaction</strong></li>\n  <li>Liquide → Solide : <strong>solidification</strong></li>\n  <li>Solide → Gaz : <strong>sublimation</strong></li>\n</ul>\n<div class=\"key-point\">📌 Pendant un changement d'état, la <strong>température reste constante</strong> (palier de température).</div>"
          },
          {
            "title": "Le vivant : cellule et nutrition",
            "tag": "SVT",
            "content": "<h4>La cellule</h4>\n<p>Tous les êtres vivants sont constitués de <strong>cellules</strong>. C'est l'unité de base du vivant.</p>\n<ul>\n  <li><strong>Membrane</strong> : enveloppe de la cellule</li>\n  <li><strong>Cytoplasme</strong> : liquide à l'intérieur</li>\n  <li><strong>Noyau</strong> : contient l'ADN (information génétique)</li>\n</ul>\n<h4>Nutrition des végétaux</h4>\n<p>Les plantes fabriquent leur propre matière grâce à la <strong>photosynthèse</strong> :</p>\n<div class=\"key-point\">📌 Eau + CO₂ + lumière → glucose + O₂. Les plantes sont des <strong>producteurs primaires</strong>.</div>"
          }
        ],
        "quiz": [
          {
            "q": "Le passage de solide à liquide s'appelle :",
            "options": [
              "Vaporisation",
              "Fusion",
              "Solidification",
              "Sublimation"
            ],
            "correct": 1,
            "expl": "La <strong>fusion</strong> est le passage de l'état solide à l'état liquide (ex : la glace fond à 0°C)."
          },
          {
            "q": "Quel élément contient l'ADN dans une cellule ?",
            "options": [
              "La membrane",
              "Le cytoplasme",
              "Le noyau",
              "La vacuole"
            ],
            "correct": 2,
            "expl": "Le <strong>noyau</strong> contient l'ADN, qui porte l'information génétique."
          },
          {
            "q": "Que produit la photosynthèse ?",
            "options": [
              "CO₂ et eau",
              "Glucose et O₂",
              "Protéines",
              "Sels minéraux"
            ],
            "correct": 1,
            "expl": "La photosynthèse produit du <strong>glucose</strong> (sucre) et de l'<strong>oxygène</strong> (O₂)."
          },
          {
            "q": "À quelle température l'eau bout-elle ?",
            "options": [
              "0°C",
              "50°C",
              "100°C",
              "212°C"
            ],
            "correct": 2,
            "expl": "L'eau bout à <strong>100°C</strong> à pression atmosphérique normale."
          }
        ],
        "flashcards": [
          {
            "front": "Quels sont les 3 états de la matière ?",
            "back": "<strong>Solide</strong> (forme et volume propres), <strong>liquide</strong> (volume propre, pas de forme), <strong>gaz</strong> (ni forme ni volume propres)."
          },
          {
            "front": "Qu'est-ce que la photosynthèse ?",
            "back": "Processus par lequel les plantes transforment <strong>eau + CO₂ + lumière</strong> en <strong>glucose + O₂</strong>."
          },
          {
            "front": "Les 3 parties principales d'une cellule ?",
            "back": "<strong>Membrane</strong> (enveloppe), <strong>cytoplasme</strong> (contenu liquide), <strong>noyau</strong> (ADN)."
          }
        ]
      }
    }
  },
  "5eme": {
    "label": "5ème",
    "subjects": {
      "maths": {
        "label": "Mathématiques",
        "icon": "fa-calculator",
        "fiches": [
          {
            "title": "Calcul avec les nombres relatifs",
            "tag": "Nombres",
            "content": "<h4>Nombres positifs et négatifs</h4>\n<p>Un <strong>nombre relatif</strong> est un nombre muni d'un signe (+ ou −). Exemples : +3, −7, −2,5.</p>\n<h4>Addition de relatifs</h4>\n<ul>\n  <li>Même signe : on additionne et on garde le signe. (+3) + (+5) = <strong>+8</strong></li>\n  <li>Signes différents : on soustrait et on prend le signe du plus grand. (+3) + (−7) = <strong>−4</strong></li>\n</ul>\n<h4>Soustraction de relatifs</h4>\n<div class=\"key-point\">📌 Soustraire un nombre, c'est <strong>ajouter son opposé</strong>. (+5) − (−3) = (+5) + (+3) = <strong>+8</strong></div>"
          },
          {
            "title": "Proportionnalité",
            "tag": "Organisation de données",
            "content": "<h4>Reconnaître la proportionnalité</h4>\n<p>Deux grandeurs sont proportionnelles si on passe de l'une à l'autre en <strong>multipliant toujours par le même nombre</strong> (coefficient de proportionnalité).</p>\n<h4>Le produit en croix</h4>\n<p>Si a/b = c/d, alors <strong>a × d = b × c</strong>.</p>\n<h4>Pourcentages</h4>\n<ul>\n  <li>Calculer 25% de 80 : 80 × 25/100 = <strong>20</strong></li>\n  <li>Un pourcentage est une fraction de dénominateur 100</li>\n</ul>\n<div class=\"key-point\">📌 Tableau de proportionnalité : chaque colonne se déduit par le <strong>même coefficient</strong>.</div>"
          },
          {
            "title": "Symétrie centrale",
            "tag": "Géométrie",
            "content": "<h4>Définition</h4>\n<p>Le symétrique d'un point A par rapport à un centre O est le point A' tel que <strong>O est le milieu de [AA']</strong>.</p>\n<h4>Propriétés</h4>\n<ul>\n  <li>La symétrie centrale <strong>conserve les longueurs, les angles et les aires</strong></li>\n  <li>Une figure a un centre de symétrie si elle se superpose à elle-même après rotation de 180°</li>\n  <li>Exemples : le parallélogramme a un centre de symétrie (intersection des diagonales)</li>\n</ul>\n<div class=\"key-point\">📌 Ne pas confondre avec la symétrie axiale (miroir) ! La symétrie centrale = <strong>demi-tour</strong>.</div>"
          }
        ],
        "quiz": [
          {
            "q": "(+4) + (−9) = ?",
            "options": [
              "−5",
              "+5",
              "+13",
              "−13"
            ],
            "correct": 0,
            "expl": "Signes différents : 9 − 4 = 5, on garde le signe du plus grand (−). Résultat : <strong>−5</strong>."
          },
          {
            "q": "(+6) − (−3) = ?",
            "options": [
              "+3",
              "−3",
              "+9",
              "−9"
            ],
            "correct": 2,
            "expl": "Soustraire (−3) = ajouter (+3). Donc (+6) + (+3) = <strong>+9</strong>."
          },
          {
            "q": "35% de 200 = ?",
            "options": [
              "35",
              "70",
              "7",
              "170"
            ],
            "correct": 1,
            "expl": "200 × 35/100 = 200 × 0,35 = <strong>70</strong>."
          },
          {
            "q": "Le symétrique de A par rapport à O signifie que :",
            "options": [
              "O est au milieu de [AA']",
              "A et A' sont confondus",
              "O est perpendiculaire à [AA']",
              "A' est sur un axe"
            ],
            "correct": 0,
            "expl": "En symétrie centrale, <strong>O est le milieu du segment [AA']</strong>."
          }
        ],
        "flashcards": [
          {
            "front": "Règle pour soustraire un relatif ?",
            "back": "Soustraire un nombre = <strong>ajouter son opposé</strong>. Ex : 5 − (−3) = 5 + 3 = 8."
          },
          {
            "front": "Comment vérifier la proportionnalité ?",
            "back": "Vérifier que le <strong>coefficient multiplicateur</strong> est le même entre chaque paire de valeurs."
          },
          {
            "front": "La symétrie centrale conserve-t-elle les longueurs ?",
            "back": "<strong>Oui</strong>, elle conserve les longueurs, les angles et les aires."
          }
        ]
      },
      "francais": {
        "label": "Français",
        "icon": "fa-feather",
        "fiches": [
          {
            "title": "Le complément du verbe (COD, COI)",
            "tag": "Grammaire",
            "content": "<h4>Le COD (Complément d'Objet Direct)</h4>\n<p>Il complète le verbe <strong>directement</strong> (sans préposition). On le trouve avec la question <strong>« qui ? » ou « quoi ? »</strong> après le verbe.</p>\n<p>Exemple : Je mange <strong>une pomme</strong>. (Je mange quoi ? → une pomme = COD)</p>\n<h4>Le COI (Complément d'Objet Indirect)</h4>\n<p>Il est relié au verbe par une <strong>préposition</strong> (à, de). Question : <strong>« à qui ? », « de quoi ? »</strong></p>\n<p>Exemple : Je parle <strong>à mon ami</strong>. (Je parle à qui ? → à mon ami = COI)</p>\n<div class=\"key-point\">📌 Astuce : si on peut remplacer par <strong>le/la/les</strong> → COD. Par <strong>lui/leur</strong> → COI.</div>"
          }
        ],
        "quiz": [
          {
            "q": "Dans « Il regarde la télévision », quel est le COD ?",
            "options": [
              "Il",
              "regarde",
              "la télévision",
              "aucun"
            ],
            "correct": 2,
            "expl": "Il regarde quoi ? → <strong>la télévision</strong> = COD (complément direct du verbe)."
          },
          {
            "q": "Dans « Elle pense à ses vacances », « à ses vacances » est :",
            "options": [
              "COD",
              "COI",
              "Complément circonstanciel",
              "Sujet"
            ],
            "correct": 1,
            "expl": "« Elle pense à quoi ? » → relié par la préposition « à » = <strong>COI</strong>."
          }
        ],
        "flashcards": [
          {
            "front": "Comment trouver le COD ?",
            "back": "Poser la question <strong>« qui ? » ou « quoi ? »</strong> après le verbe, sans préposition."
          },
          {
            "front": "Comment différencier COD et COI ?",
            "back": "<strong>COD</strong> = sans préposition (quoi ?). <strong>COI</strong> = avec préposition à/de (à qui ? de quoi ?)."
          }
        ]
      },
      "histoire": {
        "label": "Histoire-Géo",
        "icon": "fa-landmark",
        "fiches": [
          {
            "title": "L'Islam et le monde musulman (VIIe-XIIIe s.)",
            "tag": "Hist. - Moyen Âge",
            "content": "<h4>Les débuts de l'Islam</h4>\n<ul>\n  <li><strong>622</strong> : l'Hégire — Mahomet quitte La Mecque pour Médine (début du calendrier musulman)</li>\n  <li><strong>632</strong> : mort de Mahomet. Ses successeurs (califes) étendent l'empire</li>\n  <li>Le <strong>Coran</strong> est le livre sacré de l'Islam</li>\n</ul>\n<h4>La civilisation musulmane</h4>\n<ul>\n  <li>Les 5 piliers : shahada, prière, aumône, jeûne du Ramadan, pèlerinage à La Mecque</li>\n  <li>Grandes avancées en <strong>mathématiques</strong> (algèbre, chiffres arabes), <strong>médecine</strong>, <strong>astronomie</strong></li>\n  <li>Villes : Bagdad, Cordoue, Le Caire — centres de savoir</li>\n</ul>\n<div class=\"key-point\">📌 Le mot « <strong>algèbre</strong> » vient de l'arabe « al-jabr » (Al-Khwarizmi, IXe s.).</div>"
          }
        ],
        "quiz": [
          {
            "q": "Qu'est-ce que l'Hégire (622) ?",
            "options": [
              "La mort de Mahomet",
              "Le départ de Mahomet pour Médine",
              "La prise de Jérusalem",
              "La construction de la Kaaba"
            ],
            "correct": 1,
            "expl": "L'<strong>Hégire</strong> est l'émigration de Mahomet de La Mecque vers Médine en 622, date de début du calendrier musulman."
          },
          {
            "q": "Combien y a-t-il de piliers de l'Islam ?",
            "options": [
              "3",
              "4",
              "5",
              "7"
            ],
            "correct": 2,
            "expl": "Les <strong>5 piliers</strong> : profession de foi, prière, aumône, jeûne, pèlerinage."
          }
        ],
        "flashcards": [
          {
            "front": "Qu'est-ce que l'Hégire ?",
            "back": "Le départ de <strong>Mahomet</strong> de La Mecque vers <strong>Médine</strong> en <strong>622</strong>. Marque le début du calendrier musulman."
          },
          {
            "front": "Citez les 5 piliers de l'Islam",
            "back": "1. <strong>Shahada</strong> (foi) 2. <strong>Salat</strong> (prière) 3. <strong>Zakat</strong> (aumône) 4. <strong>Sawm</strong> (jeûne) 5. <strong>Hajj</strong> (pèlerinage)"
          }
        ]
      },
      "sciences": {
        "label": "Sciences",
        "icon": "fa-flask",
        "fiches": [
          {
            "title": "Le mouvement et les vitesses",
            "tag": "Physique",
            "content": "<h4>Décrire un mouvement</h4>\n<ul>\n  <li>Un objet est en mouvement par rapport à un <strong>référentiel</strong> si sa position change</li>\n  <li><strong>Trajectoire</strong> : ensemble des positions successives (rectiligne, circulaire, curviligne)</li>\n</ul>\n<h4>La vitesse</h4>\n<div class=\"key-point\">📌 <strong>v = d / t</strong> (vitesse = distance / temps)</div>\n<ul>\n  <li>Unités : m/s ou km/h</li>\n  <li>Conversion : 1 m/s = 3,6 km/h</li>\n  <li>Exemple : 100 km en 2h → v = 100/2 = 50 km/h</li>\n</ul>"
          }
        ],
        "quiz": [
          {
            "q": "Formule de la vitesse ?",
            "options": [
              "v = d × t",
              "v = d / t",
              "v = t / d",
              "v = d + t"
            ],
            "correct": 1,
            "expl": "<strong>v = d / t</strong> : la vitesse est la distance divisée par le temps."
          },
          {
            "q": "54 km/h = combien en m/s ?",
            "options": [
              "15 m/s",
              "54 m/s",
              "5,4 m/s",
              "150 m/s"
            ],
            "correct": 0,
            "expl": "54 ÷ 3,6 = <strong>15 m/s</strong>."
          }
        ],
        "flashcards": [
          {
            "front": "Comment convertir km/h en m/s ?",
            "back": "Diviser par <strong>3,6</strong>. Ex : 72 km/h ÷ 3,6 = 20 m/s."
          },
          {
            "front": "Qu'est-ce qu'une trajectoire ?",
            "back": "L'ensemble des <strong>positions successives</strong> d'un objet en mouvement. Elle peut être rectiligne, circulaire ou curviligne."
          }
        ]
      }
    }
  },
  "4eme": {
    "label": "4ème",
    "subjects": {
      "maths": {
        "label": "Mathématiques",
        "icon": "fa-calculator",
        "fiches": [
          {
            "title": "Le théorème de Pythagore",
            "tag": "Géométrie",
            "content": "<h4>Énoncé</h4>\n<p>Dans un triangle <strong>rectangle</strong>, le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés.</p>\n<div class=\"key-point\">📌 Si ABC est rectangle en A : <strong>BC² = AB² + AC²</strong></div>\n<h4>Exemple</h4>\n<p>AB = 3, AC = 4, alors BC² = 9 + 16 = 25, donc BC = <strong>5</strong>.</p>\n<h4>Réciproque</h4>\n<p>Si BC² = AB² + AC², alors le triangle ABC est <strong>rectangle en A</strong>.</p>\n<h4>Contraposée</h4>\n<p>Si BC² ≠ AB² + AC², alors le triangle n'est <strong>pas rectangle</strong>.</p>"
          },
          {
            "title": "Calcul littéral et double distributivité",
            "tag": "Algèbre",
            "content": "<h4>Simple distributivité</h4>\n<p><strong>k(a + b) = ka + kb</strong></p>\n<p>Exemple : 3(x + 5) = 3x + 15</p>\n<h4>Double distributivité</h4>\n<p><strong>(a + b)(c + d) = ac + ad + bc + bd</strong></p>\n<p>Exemple : (x + 3)(x + 2) = x² + 2x + 3x + 6 = <strong>x² + 5x + 6</strong></p>\n<h4>Factoriser</h4>\n<p>C'est l'opération inverse : chercher un <strong>facteur commun</strong>.</p>\n<p>6x + 12 = 6(x + 2)</p>\n<div class=\"key-point\">📌 Développer = enlever les parenthèses. Factoriser = remettre des parenthèses.</div>"
          },
          {
            "title": "Équations du premier degré",
            "tag": "Algèbre",
            "content": "<h4>Résoudre une équation</h4>\n<p>Trouver la valeur de x qui rend l'égalité vraie.</p>\n<h4>Méthode</h4>\n<ul>\n  <li>1. Développer et réduire chaque membre</li>\n  <li>2. Regrouper les termes en x d'un côté, les nombres de l'autre</li>\n  <li>3. Diviser pour isoler x</li>\n</ul>\n<p>Exemple : 3x + 7 = 22 → 3x = 15 → <strong>x = 5</strong></p>\n<div class=\"key-point\">📌 Ce qu'on fait d'un côté, on le fait de l'autre ! (addition, soustraction, multiplication, division)</div>"
          }
        ],
        "quiz": [
          {
            "q": "Dans un triangle rectangle, AB=6 et AC=8. Que vaut BC (hypoténuse) ?",
            "options": [
              "10",
              "14",
              "48",
              "7"
            ],
            "correct": 0,
            "expl": "BC² = 36 + 64 = 100, donc BC = <strong>10</strong>."
          },
          {
            "q": "Développer (x+4)(x−2) :",
            "options": [
              "x²+2x−8",
              "x²−2x−8",
              "x²+6x−8",
              "x²−8"
            ],
            "correct": 0,
            "expl": "x² − 2x + 4x − 8 = <strong>x² + 2x − 8</strong>."
          },
          {
            "q": "Résoudre 5x − 3 = 17 :",
            "options": [
              "x = 4",
              "x = 2,8",
              "x = 20",
              "x = 3,4"
            ],
            "correct": 0,
            "expl": "5x = 20, donc x = 20/5 = <strong>4</strong>."
          },
          {
            "q": "Factoriser 8x − 12 :",
            "options": [
              "4(2x − 3)",
              "2(4x − 6)",
              "8(x − 12)",
              "4(2x + 3)"
            ],
            "correct": 0,
            "expl": "Le facteur commun est 4. 8x − 12 = <strong>4(2x − 3)</strong>."
          }
        ],
        "flashcards": [
          {
            "front": "Théorème de Pythagore",
            "back": "Dans un triangle rectangle : <strong>hypoténuse² = côté₁² + côté₂²</strong>. Ex : 3² + 4² = 5²."
          },
          {
            "front": "Double distributivité",
            "back": "<strong>(a+b)(c+d) = ac + ad + bc + bd</strong>. On multiplie chaque terme du premier par chaque terme du second."
          },
          {
            "front": "Comment résoudre une équation ?",
            "back": "1. Développer 2. <strong>Regrouper x d'un côté, nombres de l'autre</strong> 3. Diviser pour isoler x."
          }
        ]
      },
      "francais": {
        "label": "Français",
        "icon": "fa-feather",
        "fiches": [
          {
            "title": "Les figures de style",
            "tag": "Littérature",
            "content": "<h4>Figures d'analogie</h4>\n<ul>\n  <li><strong>Comparaison</strong> : rapprochement avec un outil (comme, tel, pareil à…). « Il est fort <em>comme</em> un lion. »</li>\n  <li><strong>Métaphore</strong> : comparaison sans outil. « Cet homme est <em>un lion</em>. »</li>\n  <li><strong>Personnification</strong> : donner des qualités humaines à un objet. « Le vent <em>hurlait</em>. »</li>\n</ul>\n<h4>Figures d'exagération</h4>\n<ul>\n  <li><strong>Hyperbole</strong> : exagération. « Je meurs de faim. »</li>\n  <li><strong>Litote</strong> : dire moins pour suggérer plus. « Ce n'est pas mauvais. » (= c'est bon)</li>\n  <li><strong>Euphémisme</strong> : atténuer une réalité dure. « Il nous a quittés. » (= il est mort)</li>\n</ul>\n<h4>Figures de construction</h4>\n<ul>\n  <li><strong>Anaphore</strong> : répétition en début de phrase/vers</li>\n  <li><strong>Antithèse</strong> : opposition de deux idées</li>\n</ul>\n<div class=\"key-point\">📌 Comparaison = avec outil. Métaphore = sans outil. C'est la différence la plus fréquente au Brevet !</div>"
          }
        ],
        "quiz": [
          {
            "q": "« La mer est un miroir » est une :",
            "options": [
              "Comparaison",
              "Métaphore",
              "Personnification",
              "Hyperbole"
            ],
            "correct": 1,
            "expl": "Pas d'outil de comparaison (comme, tel…), c'est une <strong>métaphore</strong>."
          },
          {
            "q": "« Ce n'est pas mal » pour dire « c'est bien » est une :",
            "options": [
              "Hyperbole",
              "Euphémisme",
              "Litote",
              "Antithèse"
            ],
            "correct": 2,
            "expl": "Dire moins pour suggérer plus = <strong>litote</strong>."
          },
          {
            "q": "Quelle figure répète un mot en début de vers ?",
            "options": [
              "Métaphore",
              "Anaphore",
              "Antithèse",
              "Oxymore"
            ],
            "correct": 1,
            "expl": "L'<strong>anaphore</strong> est la répétition d'un mot ou groupe en début de phrase ou vers."
          }
        ],
        "flashcards": [
          {
            "front": "Différence comparaison / métaphore ?",
            "back": "<strong>Comparaison</strong> = avec outil (comme, tel). <strong>Métaphore</strong> = sans outil de comparaison."
          },
          {
            "front": "Qu'est-ce qu'une hyperbole ?",
            "back": "Figure d'<strong>exagération</strong>. Ex : « J'ai mille choses à faire »."
          },
          {
            "front": "Qu'est-ce qu'un euphémisme ?",
            "back": "Atténuer une réalité <strong>dure ou choquante</strong>. Ex : « Il nous a quittés » pour « il est mort »."
          }
        ]
      },
      "physique": {
        "label": "Physique-Chimie",
        "icon": "fa-bolt",
        "fiches": [
          {
            "title": "Les lois de l'électricité",
            "tag": "Électricité",
            "content": "<h4>Loi d'Ohm</h4>\n<div class=\"key-point\">📌 <strong>U = R × I</strong> (tension = résistance × intensité)</div>\n<ul>\n  <li>U en <strong>volts</strong> (V)</li>\n  <li>R en <strong>ohms</strong> (Ω)</li>\n  <li>I en <strong>ampères</strong> (A)</li>\n</ul>\n<h4>Circuit en série</h4>\n<ul>\n  <li>L'intensité est la <strong>même</strong> en tout point : I = I₁ = I₂</li>\n  <li>Les tensions <strong>s'additionnent</strong> : U = U₁ + U₂</li>\n</ul>\n<h4>Circuit en dérivation</h4>\n<ul>\n  <li>La tension est la <strong>même</strong> aux bornes de chaque branche : U = U₁ = U₂</li>\n  <li>Les intensités <strong>s'additionnent</strong> : I = I₁ + I₂</li>\n</ul>"
          }
        ],
        "quiz": [
          {
            "q": "Quelle est la loi d'Ohm ?",
            "options": [
              "P = U × I",
              "U = R × I",
              "I = U × R",
              "R = U + I"
            ],
            "correct": 1,
            "expl": "<strong>U = R × I</strong>. La tension aux bornes d'un résistor est égale au produit de sa résistance par l'intensité."
          },
          {
            "q": "En série, l'intensité :",
            "options": [
              "S'additionne",
              "Est la même partout",
              "Vaut 0",
              "Dépend de la tension"
            ],
            "correct": 1,
            "expl": "En circuit série, l'intensité est <strong>la même en tout point</strong> du circuit."
          }
        ],
        "flashcards": [
          {
            "front": "Loi d'Ohm",
            "back": "<strong>U = R × I</strong>. U en volts, R en ohms, I en ampères."
          },
          {
            "front": "Tension en série vs en dérivation ?",
            "back": "<strong>Série</strong> : U = U₁ + U₂ (additive). <strong>Dérivation</strong> : U = U₁ = U₂ (identique)."
          }
        ]
      }
    }
  },
  "3eme": {
    "label": "3ème (Brevet)",
    "subjects": {
      "maths": {
        "label": "Mathématiques",
        "icon": "fa-calculator",
        "fiches": [
          {
            "title": "Thalès et les agrandissements-réductions",
            "tag": "Géométrie",
            "content": "<h4>Théorème de Thalès</h4>\n<p>Si deux droites parallèles coupent deux sécantes, alors les rapports des longueurs sont <strong>égaux</strong>.</p>\n<div class=\"key-point\">📌 Si (MN) // (BC) dans le triangle ABC, alors : <strong>AM/AB = AN/AC = MN/BC</strong></div>\n<h4>Application</h4>\n<p>On l'utilise pour calculer des <strong>longueurs inconnues</strong> dans des configurations avec des droites parallèles.</p>\n<h4>Réciproque</h4>\n<p>Si AM/AB = AN/AC et que les points sont dans le bon ordre, alors <strong>(MN) // (BC)</strong>.</p>"
          },
          {
            "title": "Fonctions et fonctions linéaires/affines",
            "tag": "Algèbre",
            "content": "<h4>Fonction</h4>\n<p>Une fonction associe à chaque nombre x un unique nombre, noté <strong>f(x)</strong>.</p>\n<h4>Fonction linéaire</h4>\n<p><strong>f(x) = ax</strong>. Sa courbe passe par l'origine. a = coefficient directeur.</p>\n<h4>Fonction affine</h4>\n<p><strong>f(x) = ax + b</strong>. Droite de pente a et d'ordonnée à l'origine b.</p>\n<ul>\n  <li>a > 0 : fonction croissante (droite monte)</li>\n  <li>a < 0 : fonction décroissante (droite descend)</li>\n  <li>a = 0 : fonction constante (droite horizontale)</li>\n</ul>\n<div class=\"key-point\">📌 <strong>a = (y₂ − y₁) / (x₂ − x₁)</strong> pour calculer le coefficient directeur entre deux points.</div>"
          },
          {
            "title": "Probabilités et statistiques",
            "tag": "Données",
            "content": "<h4>Probabilité</h4>\n<p>La probabilité d'un événement est un nombre entre <strong>0 et 1</strong>.</p>\n<ul>\n  <li>P = nombre de cas favorables / nombre de cas possibles</li>\n  <li>P(impossible) = 0, P(certain) = 1</li>\n  <li>P(contraire de A) = 1 − P(A)</li>\n</ul>\n<h4>Statistiques</h4>\n<ul>\n  <li><strong>Moyenne</strong> = somme des valeurs / effectif total</li>\n  <li><strong>Médiane</strong> = valeur qui partage la série en deux parties égales</li>\n  <li><strong>Étendue</strong> = max − min</li>\n</ul>\n<div class=\"key-point\">📌 La médiane n'est pas forcément la moyenne ! Elle dépend du <strong>rang</strong>, pas de la somme.</div>"
          }
        ],
        "quiz": [
          {
            "q": "Si f(x) = 3x − 2, que vaut f(4) ?",
            "options": [
              "10",
              "14",
              "6",
              "12"
            ],
            "correct": 0,
            "expl": "f(4) = 3×4 − 2 = 12 − 2 = <strong>10</strong>."
          },
          {
            "q": "Le coefficient directeur de f(x) = −2x + 5 est :",
            "options": [
              "5",
              "−2",
              "2",
              "−5"
            ],
            "correct": 1,
            "expl": "Dans f(x) = ax + b, a = <strong>−2</strong> est le coefficient directeur."
          },
          {
            "q": "Probabilité de tirer un 6 avec un dé équilibré ?",
            "options": [
              "1/2",
              "1/3",
              "1/6",
              "1/12"
            ],
            "correct": 2,
            "expl": "1 cas favorable sur 6 possibles → P = <strong>1/6</strong>."
          },
          {
            "q": "La médiane d'une série de 9 valeurs ordonnées est la :",
            "options": [
              "1ère valeur",
              "5ème valeur",
              "4ème valeur",
              "moyenne"
            ],
            "correct": 1,
            "expl": "Avec 9 valeurs, la médiane est la <strong>5ème valeur</strong> (rang (9+1)/2)."
          }
        ],
        "flashcards": [
          {
            "front": "Théorème de Thalès : quand l'utiliser ?",
            "back": "Quand on a <strong>deux droites sécantes coupées par des parallèles</strong>. Les rapports de longueurs sont égaux."
          },
          {
            "front": "Fonction affine : formule et graphe",
            "back": "<strong>f(x) = ax + b</strong>. Droite de pente a (côté incliné) et ordonnée à l'origine b (croise l'axe y en b)."
          },
          {
            "front": "Différence moyenne / médiane ?",
            "back": "<strong>Moyenne</strong> = somme / effectif. <strong>Médiane</strong> = valeur qui sépare la série ordonnée en deux moitiés égales."
          }
        ]
      },
      "francais": {
        "label": "Français",
        "icon": "fa-feather",
        "fiches": [
          {
            "title": "Méthodologie du Brevet — Français",
            "tag": "Brevet",
            "content": "<h4>L'épreuve</h4>\n<ul>\n  <li><strong>Partie 1</strong> (1h10) : Compréhension de texte + grammaire + réécriture</li>\n  <li><strong>Partie 2</strong> (1h30) : Dictée (20 min) + rédaction (1h10)</li>\n</ul>\n<h4>Conseils pour la rédaction</h4>\n<ul>\n  <li>Bien lire le sujet : narratif ou argumentatif ?</li>\n  <li><strong>Introduction</strong> : accroche + présentation du sujet</li>\n  <li><strong>Développement</strong> : 2-3 paragraphes structurés</li>\n  <li><strong>Conclusion</strong> : bilan + ouverture</li>\n  <li>Soigner l'orthographe (−4 points max)</li>\n</ul>\n<div class=\"key-point\">📌 Relire 2 fois : une fois pour le <strong>sens</strong>, une fois pour l'<strong>orthographe</strong>.</div>"
          }
        ],
        "quiz": [
          {
            "q": "Combien de parties comporte l'épreuve de français au Brevet ?",
            "options": [
              "1",
              "2",
              "3",
              "4"
            ],
            "correct": 1,
            "expl": "<strong>2 parties</strong> : 1) Compréhension + grammaire + réécriture, 2) Dictée + rédaction."
          }
        ],
        "flashcards": [
          {
            "front": "Structure de la rédaction au Brevet ?",
            "back": "<strong>Introduction</strong> (accroche + sujet) → <strong>Développement</strong> (2-3 § argumentés) → <strong>Conclusion</strong> (bilan + ouverture)."
          }
        ]
      },
      "histoire": {
        "label": "Histoire-Géo-EMC",
        "icon": "fa-landmark",
        "fiches": [
          {
            "title": "La Seconde Guerre mondiale (1939-1945)",
            "tag": "XXe siècle",
            "content": "<h4>Causes et contexte</h4>\n<ul>\n  <li>Montée des totalitarismes : nazisme (Allemagne), fascisme (Italie), stalinisme (URSS)</li>\n  <li><strong>1er septembre 1939</strong> : l'Allemagne envahit la Pologne → début de la guerre</li>\n</ul>\n<h4>La France dans la guerre</h4>\n<ul>\n  <li><strong>Juin 1940</strong> : armistice, France divisée. Régime de Vichy (Pétain) collabore</li>\n  <li><strong>18 juin 1940</strong> : appel du général de Gaulle (Résistance)</li>\n  <li><strong>6 juin 1944</strong> : Débarquement en Normandie (D-Day)</li>\n  <li><strong>8 mai 1945</strong> : capitulation de l'Allemagne</li>\n</ul>\n<h4>Le génocide</h4>\n<div class=\"key-point\">📌 La <strong>Shoah</strong> : extermination systématique de 6 millions de Juifs par les nazis. Camps d'extermination : Auschwitz, Treblinka…</div>\n<h4>Bilan</h4>\n<p>60 millions de morts. Création de l'<strong>ONU</strong> (1945) et début de la Guerre froide.</p>"
          },
          {
            "title": "La Ve République et la citoyenneté",
            "tag": "EMC",
            "content": "<h4>La Ve République (depuis 1958)</h4>\n<ul>\n  <li>Fondée par <strong>de Gaulle</strong>. Constitution du 4 octobre 1958</li>\n  <li><strong>Président</strong> élu au suffrage universel direct (depuis 1962) pour 5 ans</li>\n  <li>Séparation des pouvoirs : législatif (Parlement), exécutif (Président + gouvernement), judiciaire</li>\n</ul>\n<h4>Les valeurs républicaines</h4>\n<p>Devise : <strong>Liberté, Égalité, Fraternité</strong></p>\n<ul>\n  <li><strong>Laïcité</strong> : séparation de l'Église et de l'État (loi de 1905)</li>\n  <li>Symboles : drapeau tricolore, Marianne, hymne national (La Marseillaise)</li>\n</ul>\n<div class=\"key-point\">📌 Être citoyen, c'est avoir des <strong>droits</strong> (voter, liberté d'expression…) et des <strong>devoirs</strong> (respecter la loi, payer ses impôts…).</div>"
          }
        ],
        "quiz": [
          {
            "q": "Quand a lieu le débarquement en Normandie ?",
            "options": [
              "8 mai 1945",
              "6 juin 1944",
              "18 juin 1940",
              "1er sept. 1939"
            ],
            "correct": 1,
            "expl": "Le <strong>D-Day</strong> a lieu le <strong>6 juin 1944</strong>."
          },
          {
            "q": "Qui lance l'appel du 18 juin 1940 ?",
            "options": [
              "Pétain",
              "Churchill",
              "De Gaulle",
              "Roosevelt"
            ],
            "correct": 2,
            "expl": "Le général <strong>de Gaulle</strong> appelle à la résistance depuis Londres le 18 juin 1940."
          },
          {
            "q": "La loi de séparation de l'Église et de l'État date de :",
            "options": [
              "1789",
              "1848",
              "1905",
              "1958"
            ],
            "correct": 2,
            "expl": "La laïcité est inscrite dans la <strong>loi de 1905</strong>."
          },
          {
            "q": "La devise de la République française :",
            "options": [
              "Paix, Amour, Liberté",
              "Liberté, Égalité, Fraternité",
              "Union, Force, Justice",
              "Honneur, Patrie, Valeur"
            ],
            "correct": 1,
            "expl": "<strong>Liberté, Égalité, Fraternité</strong> — devise officielle."
          }
        ],
        "flashcards": [
          {
            "front": "Date du débarquement en Normandie ?",
            "back": "<strong>6 juin 1944</strong> (D-Day). Opération alliée pour libérer la France."
          },
          {
            "front": "Qu'est-ce que la Shoah ?",
            "back": "Le <strong>génocide de 6 millions de Juifs</strong> par le régime nazi pendant la Seconde Guerre mondiale."
          },
          {
            "front": "Les 3 pouvoirs de la Ve République ?",
            "back": "<strong>Législatif</strong> (Parlement), <strong>Exécutif</strong> (Président + gouvernement), <strong>Judiciaire</strong> (tribunaux)."
          }
        ]
      }
    }
  },
  "seconde": {
    "label": "Seconde",
    "subjects": {
      "maths": {
        "label": "Mathématiques",
        "icon": "fa-calculator",
        "fiches": [
          {
            "title": "Ensembles de nombres et intervalles",
            "tag": "Nombres",
            "content": "<h4>Les ensembles</h4>\n<ul>\n  <li><strong>ℕ</strong> : entiers naturels (0, 1, 2, 3…)</li>\n  <li><strong>ℤ</strong> : entiers relatifs (…, −2, −1, 0, 1, 2…)</li>\n  <li><strong>ℚ</strong> : rationnels (fractions a/b)</li>\n  <li><strong>ℝ</strong> : réels (tous les nombres sur la droite)</li>\n</ul>\n<h4>Intervalles</h4>\n<ul>\n  <li>[a ; b] : tous les x tels que a ≤ x ≤ b (fermé)</li>\n  <li>]a ; b[ : a < x < b (ouvert)</li>\n  <li>[a ; +∞[ : x ≥ a</li>\n</ul>\n<div class=\"key-point\">📌 <strong>ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ</strong> : chaque ensemble est inclus dans le suivant.</div>"
          },
          {
            "title": "Fonctions : généralités et variations",
            "tag": "Fonctions",
            "content": "<h4>Vocabulaire</h4>\n<ul>\n  <li><strong>Image</strong> de x par f : c'est f(x)</li>\n  <li><strong>Antécédent</strong> de y : c'est x tel que f(x) = y</li>\n  <li><strong>Ensemble de définition</strong> : valeurs de x pour lesquelles f(x) existe</li>\n</ul>\n<h4>Tableau de variations</h4>\n<p>Il résume les intervalles où la fonction est <strong>croissante ↗</strong> ou <strong>décroissante ↘</strong>.</p>\n<h4>Fonctions de référence</h4>\n<ul>\n  <li><strong>f(x) = x²</strong> : parabole, décroissante sur ]−∞; 0], croissante sur [0; +∞[</li>\n  <li><strong>f(x) = 1/x</strong> : hyperbole, décroissante sur ]−∞; 0[ et ]0; +∞[</li>\n  <li><strong>f(x) = √x</strong> : croissante sur [0; +∞[</li>\n</ul>"
          }
        ],
        "quiz": [
          {
            "q": "√2 appartient à quel ensemble mais pas aux rationnels ?",
            "options": [
              "ℕ",
              "ℤ",
              "ℚ",
              "ℝ"
            ],
            "correct": 3,
            "expl": "√2 est <strong>irrationnel</strong> (pas de fraction). Il appartient à <strong>ℝ</strong> mais pas à ℚ."
          },
          {
            "q": "x² est décroissante sur :",
            "options": [
              "[0 ; +∞[",
              "]−∞ ; 0]",
              "ℝ tout entier",
              "]0 ; +∞["
            ],
            "correct": 1,
            "expl": "La fonction carré est <strong>décroissante sur ]−∞ ; 0]</strong> et croissante sur [0 ; +∞[."
          },
          {
            "q": "L'antécédent de 9 par f(x) = x² est :",
            "options": [
              "3 et −3",
              "3 uniquement",
              "81",
              "9"
            ],
            "correct": 0,
            "expl": "x² = 9 donne x = 3 ou x = −3. Il y a <strong>deux antécédents</strong>."
          }
        ],
        "flashcards": [
          {
            "front": "ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ — que signifie cette inclusion ?",
            "back": "Chaque ensemble est <strong>contenu dans le suivant</strong>. Tout entier naturel est aussi un entier relatif, un rationnel, et un réel."
          },
          {
            "front": "Image vs antécédent ?",
            "back": "<strong>Image</strong> : f(x) = y, y est l'image de x. <strong>Antécédent</strong> : x est l'antécédent de y (on résout f(x) = y)."
          }
        ]
      },
      "physique": {
        "label": "Physique-Chimie",
        "icon": "fa-bolt",
        "fiches": [
          {
            "title": "L'atome et le tableau périodique",
            "tag": "Constitution de la matière",
            "content": "<h4>Structure de l'atome</h4>\n<ul>\n  <li><strong>Noyau</strong> : protons (charge +) et neutrons (neutre)</li>\n  <li><strong>Électrons</strong> : en mouvement autour du noyau (charge −)</li>\n  <li>L'atome est <strong>électriquement neutre</strong> : nombre de protons = nombre d'électrons</li>\n</ul>\n<h4>Notation</h4>\n<p>ᴬ_Z X → Z = numéro atomique (protons), A = nombre de masse (protons + neutrons)</p>\n<h4>Le tableau périodique</h4>\n<ul>\n  <li>Classé par <strong>Z croissant</strong></li>\n  <li>Même <strong>colonne</strong> = même nombre d'électrons de valence = propriétés chimiques similaires</li>\n  <li>Même <strong>ligne</strong> (période) = même nombre de couches électroniques</li>\n</ul>\n<div class=\"key-point\">📌 Les gaz nobles (colonne 18) ont leur couche externe <strong>complète</strong> → très stables.</div>"
          }
        ],
        "quiz": [
          {
            "q": "Un atome est électriquement neutre car :",
            "options": [
              "Il n'a pas de charge",
              "Protons = électrons",
              "Neutrons annulent les charges",
              "Il est très petit"
            ],
            "correct": 1,
            "expl": "Le nombre de <strong>protons (+) = nombre d'électrons (−)</strong>, donc la charge totale est nulle."
          },
          {
            "q": "Que représente Z dans ᴬ_Z X ?",
            "options": [
              "Le nombre de neutrons",
              "Le nombre de masse",
              "Le numéro atomique",
              "L'énergie"
            ],
            "correct": 2,
            "expl": "Z est le <strong>numéro atomique</strong> = nombre de protons du noyau."
          }
        ],
        "flashcards": [
          {
            "front": "Composition d'un atome ?",
            "back": "<strong>Noyau</strong> (protons + neutrons) + <strong>électrons</strong> autour. Neutre car nb protons = nb électrons."
          },
          {
            "front": "Que signifie « même colonne » dans le tableau périodique ?",
            "back": "Même nombre d'<strong>électrons de valence</strong> → propriétés chimiques <strong>similaires</strong> (ex : colonne 18 = gaz nobles)."
          }
        ]
      },
      "svt": {
        "label": "SVT",
        "icon": "fa-dna",
        "fiches": [
          {
            "title": "ADN et expression génétique",
            "tag": "Génétique",
            "content": "<h4>L'ADN</h4>\n<ul>\n  <li>Molécule en <strong>double hélice</strong> présente dans le noyau des cellules</li>\n  <li>Constituée de 4 <strong>bases azotées</strong> : A (adénine), T (thymine), C (cytosine), G (guanine)</li>\n  <li>Complémentarité : <strong>A-T</strong> et <strong>C-G</strong></li>\n</ul>\n<h4>Gène et allèle</h4>\n<ul>\n  <li><strong>Gène</strong> : portion d'ADN qui code pour un caractère</li>\n  <li><strong>Allèle</strong> : version d'un gène (ex : allèle « yeux bleus » / « yeux marrons »)</li>\n</ul>\n<h4>De l'ADN à la protéine</h4>\n<p>ADN → <strong>ARN messager</strong> (transcription) → <strong>protéine</strong> (traduction). C'est l'<strong>expression des gènes</strong>.</p>\n<div class=\"key-point\">📌 <strong>Mutation</strong> : modification de la séquence d'ADN. Elle peut être silencieuse, bénéfique ou néfaste.</div>"
          }
        ],
        "quiz": [
          {
            "q": "Les bases complémentaires dans l'ADN :",
            "options": [
              "A-C et T-G",
              "A-T et C-G",
              "A-G et C-T",
              "Aucune règle"
            ],
            "correct": 1,
            "expl": "<strong>A s'apparie avec T</strong> et <strong>C s'apparie avec G</strong>."
          },
          {
            "q": "Un allèle est :",
            "options": [
              "Un chromosome",
              "Une version d'un gène",
              "Un type de cellule",
              "Une protéine"
            ],
            "correct": 1,
            "expl": "Un allèle est une <strong>version particulière d'un gène</strong> (ex : allèle dominant/récessif)."
          }
        ],
        "flashcards": [
          {
            "front": "Complémentarité des bases de l'ADN ?",
            "back": "<strong>A-T</strong> (adénine-thymine) et <strong>C-G</strong> (cytosine-guanine)."
          },
          {
            "front": "Gène vs allèle ?",
            "back": "<strong>Gène</strong> = portion d'ADN codant un caractère. <strong>Allèle</strong> = version d'un gène (il peut y en avoir plusieurs)."
          }
        ]
      }
    }
  },
  "premiere": {
    "label": "Première",
    "subjects": {
      "methodo": {
        "label": "Méthodologie",
        "icon": "fa-pen-fancy",
        "fiches": [
          {
            "title": "Le commentaire de texte",
            "tag": "Épreuve écrite",
            "content": "<h4>Objectif</h4>\n<p>Analyser un texte littéraire de manière <strong>structurée</strong> en montrant comment la forme sert le sens.</p>\n<h4>Structure</h4>\n<ul>\n  <li><strong>Introduction</strong> : présentation de l'auteur, de l'œuvre, du passage, problématique, annonce du plan</li>\n  <li><strong>Développement</strong> : 2 ou 3 axes avec sous-parties (citation + procédé + interprétation)</li>\n  <li><strong>Conclusion</strong> : bilan des axes + ouverture</li>\n</ul>\n<h4>Méthode d'analyse</h4>\n<ul>\n  <li>1. Lire le texte plusieurs fois, repérer le <strong>thème</strong>, le <strong>ton</strong>, le <strong>registre</strong></li>\n  <li>2. Relever les <strong>procédés</strong> : figures de style, champs lexicaux, temps verbaux, énonciation…</li>\n  <li>3. Formuler une <strong>problématique</strong> (question à laquelle le commentaire répond)</li>\n  <li>4. Organiser en <strong>axes</strong> progressifs (du plus évident au plus subtil)</li>\n</ul>\n<div class=\"key-point\">📌 Chaque argument = <strong>citation + procédé + interprétation</strong>. Ne jamais citer sans analyser.</div>"
          },
          {
            "title": "La dissertation sur œuvre",
            "tag": "Épreuve écrite",
            "content": "<h4>Objectif</h4>\n<p>Répondre à une question littéraire en s'appuyant sur l'<strong>œuvre étudiée</strong> et sur sa <strong>culture personnelle</strong>.</p>\n<h4>Plan dialectique (le plus courant)</h4>\n<ul>\n  <li><strong>Thèse</strong> : on défend l'idée proposée dans le sujet</li>\n  <li><strong>Antithèse</strong> : on nuance, on oppose des arguments contraires</li>\n  <li><strong>Synthèse</strong> : on dépasse l'opposition, on propose une réponse nuancée</li>\n</ul>\n<h4>Les autres plans</h4>\n<ul>\n  <li><strong>Plan thématique</strong> : pour les sujets « dans quelle mesure… », « comment… »</li>\n  <li><strong>Plan analytique</strong> : constat → causes → conséquences/solutions</li>\n</ul>\n<div class=\"key-point\">📌 Chaque paragraphe = <strong>argument + exemple précis tiré de l'œuvre</strong> (avec citation si possible).</div>"
          },
          {
            "title": "L'explication linéaire (oral)",
            "tag": "Épreuve orale",
            "content": "<h4>Déroulement de l'oral (20 min)</h4>\n<ul>\n  <li><strong>1re partie</strong> (12 min) : explication linéaire d'un texte du descriptif + question de grammaire</li>\n  <li><strong>2e partie</strong> (8 min) : entretien sur une œuvre choisie par le candidat</li>\n</ul>\n<h4>Méthode de l'explication linéaire</h4>\n<ul>\n  <li><strong>Introduction</strong> : auteur, œuvre, mouvement, situation du passage, problématique, découpage en mouvements</li>\n  <li><strong>Développement</strong> : suivre le texte <strong>ligne par ligne</strong> en identifiant les procédés et leur effet</li>\n  <li><strong>Conclusion</strong> : réponse à la problématique + ouverture</li>\n</ul>\n<h4>Question de grammaire</h4>\n<p>Porte sur une phrase du texte : nature/fonction, proposition subordonnée, négation, interrogation…</p>\n<div class=\"key-point\">📌 Préparer <strong>au moins 2 minutes de lecture expressive</strong> avant de commencer l'analyse.</div>"
          },
          {
            "title": "La contraction de texte et l'essai (voie techno)",
            "tag": "Épreuve écrite",
            "content": "<h4>Contraction de texte</h4>\n<ul>\n  <li>Résumer un texte d'environ 1000 mots en <strong>environ 200 mots</strong> (±10%)</li>\n  <li>Respecter l'ordre du texte et reformuler avec ses propres mots</li>\n  <li>Pas de citations, pas de commentaires personnels</li>\n</ul>\n<h4>Essai</h4>\n<ul>\n  <li>Répondre à une question en lien avec le thème du texte contracté</li>\n  <li>Développer une <strong>réflexion personnelle argumentée</strong></li>\n  <li>S'appuyer sur l'œuvre étudiée en classe et sa culture générale</li>\n</ul>\n<div class=\"key-point\">📌 Bien compter les mots de la contraction et indiquer le total à la fin.</div>"
          }
        ],
        "quiz": [
          {
            "q": "Quelle est la structure type d'un commentaire de texte ?",
            "options": [
              "Intro + 1 partie + conclusion",
              "Intro + 2 ou 3 axes + conclusion",
              "Thèse + antithèse + synthèse",
              "Résumé + analyse + avis"
            ],
            "correct": 1,
            "expl": "Le commentaire s'organise en <strong>introduction + 2 ou 3 axes de lecture + conclusion</strong>."
          },
          {
            "q": "Quel plan utilise thèse / antithèse / synthèse ?",
            "options": [
              "Plan analytique",
              "Plan thématique",
              "Plan dialectique",
              "Plan chronologique"
            ],
            "correct": 2,
            "expl": "Le <strong>plan dialectique</strong> oppose thèse et antithèse avant d'aboutir à une synthèse."
          },
          {
            "q": "Que fait-on lors de la 1re partie de l'oral du bac ?",
            "options": [
              "Un résumé de l'œuvre",
              "Une explication linéaire + grammaire",
              "Une dissertation orale",
              "Un exposé libre"
            ],
            "correct": 1,
            "expl": "La 1re partie comprend l'<strong>explication linéaire</strong> d'un texte + une question de <strong>grammaire</strong>."
          },
          {
            "q": "Dans un commentaire, chaque argument doit comporter :",
            "options": [
              "Uniquement une citation",
              "Citation + procédé + interprétation",
              "Seulement un avis personnel",
              "Un résumé du passage"
            ],
            "correct": 1,
            "expl": "La méthode : <strong>citation + identification du procédé + interprétation</strong> de son effet."
          },
          {
            "q": "La contraction de texte doit respecter :",
            "options": [
              "Un format libre",
              "Environ 200 mots (±10%)",
              "Exactement 100 mots",
              "La moitié du texte original"
            ],
            "correct": 1,
            "expl": "La contraction réduit un texte d'environ 1000 mots à <strong>environ 200 mots</strong>, avec une tolérance de ±10%."
          }
        ],
        "flashcards": [
          {
            "front": "Les 3 parties du commentaire de texte ?",
            "back": "<strong>Introduction</strong> (auteur, œuvre, problématique, plan) → <strong>Développement</strong> (2-3 axes avec citations analysées) → <strong>Conclusion</strong> (bilan + ouverture)."
          },
          {
            "front": "Formule d'un argument dans un commentaire ?",
            "back": "<strong>Citation + procédé + interprétation</strong>. Jamais de citation sans analyse."
          },
          {
            "front": "Que comprend l'oral du bac de français ?",
            "back": "<strong>1re partie</strong> (12 min) : explication linéaire + grammaire. <strong>2e partie</strong> (8 min) : entretien sur une œuvre choisie."
          },
          {
            "front": "Plan dialectique : structure ?",
            "back": "<strong>Thèse</strong> (on soutient l'idée) → <strong>Antithèse</strong> (on nuance) → <strong>Synthèse</strong> (on dépasse l'opposition)."
          }
        ]
      },
      "mouvements": {
        "label": "Mouvements littéraires",
        "icon": "fa-book",
        "fiches": [
          {
            "title": "L'Humanisme (XVIe siècle)",
            "tag": "Renaissance",
            "content": "<h4>Contexte</h4>\n<p>Redécouverte de l'Antiquité, invention de l'imprimerie, grandes découvertes. L'homme est au <strong>centre de la réflexion</strong>.</p>\n<h4>Principes</h4>\n<ul>\n  <li>Confiance en l'<strong>homme</strong> et en la <strong>raison</strong></li>\n  <li>Importance de l'<strong>éducation</strong> et du <strong>savoir</strong></li>\n  <li>Tolérance, ouverture d'esprit</li>\n</ul>\n<h4>Auteurs clés</h4>\n<ul>\n  <li><strong>Rabelais</strong> : <em>Gargantua</em> (critique de l'éducation scolastique)</li>\n  <li><strong>Montaigne</strong> : <em>Essais</em> (réflexion sur soi et sur le monde)</li>\n  <li><strong>Érasme</strong> : <em>Éloge de la folie</em></li>\n</ul>\n<div class=\"key-point\">📌 Citation de Rabelais : « <strong>Science sans conscience n'est que ruine de l'âme</strong> ».</div>"
          },
          {
            "title": "Le Classicisme (XVIIe siècle)",
            "tag": "Grand Siècle",
            "content": "<h4>Contexte</h4>\n<p>Règne de <strong>Louis XIV</strong>. Recherche de l'ordre, de la mesure et de la perfection.</p>\n<h4>Principes</h4>\n<ul>\n  <li>Respect des <strong>règles</strong> (les 3 unités au théâtre : lieu, temps, action)</li>\n  <li>Idéal de <strong>vraisemblance</strong> et de <strong>bienséance</strong></li>\n  <li>Imitation des <strong>Anciens</strong> (modèles grecs et romains)</li>\n  <li>La langue doit être <strong>claire, précise, élégante</strong></li>\n</ul>\n<h4>Auteurs clés</h4>\n<ul>\n  <li><strong>Molière</strong> : comédies (<em>Le Misanthrope</em>, <em>Tartuffe</em>)</li>\n  <li><strong>Racine</strong> : tragédies (<em>Phèdre</em>, <em>Andromaque</em>)</li>\n  <li><strong>La Fontaine</strong> : <em>Fables</em></li>\n  <li><strong>La Bruyère</strong> : <em>Les Caractères</em></li>\n</ul>\n<div class=\"key-point\">📌 Les <strong>3 unités</strong> du théâtre classique : une seule action, en un seul lieu, en une seule journée.</div>"
          },
          {
            "title": "Les Lumières (XVIIIe siècle)",
            "tag": "Siècle des Lumières",
            "content": "<h4>Contexte</h4>\n<p>Mouvement intellectuel européen. Combat contre l'<strong>obscurantisme</strong> par la <strong>raison</strong> et le <strong>savoir</strong>.</p>\n<h4>Principes</h4>\n<ul>\n  <li>Confiance en la <strong>raison</strong> et la <strong>science</strong></li>\n  <li>Lutte contre les <strong>préjugés</strong>, l'<strong>intolérance</strong>, le <strong>despotisme</strong></li>\n  <li>Défense des <strong>libertés</strong> individuelles</li>\n  <li>L'<em>Encyclopédie</em> de Diderot et d'Alembert : diffuser le savoir</li>\n</ul>\n<h4>Auteurs clés</h4>\n<ul>\n  <li><strong>Voltaire</strong> : <em>Candide</em>, contes philosophiques, ironie</li>\n  <li><strong>Montesquieu</strong> : <em>Lettres persanes</em>, <em>De l'esprit des lois</em></li>\n  <li><strong>Rousseau</strong> : <em>Du contrat social</em>, <em>Émile</em></li>\n  <li><strong>Diderot</strong> : <em>Encyclopédie</em>, <em>Jacques le Fataliste</em></li>\n</ul>\n<div class=\"key-point\">📌 Les Lumières ont préparé la <strong>Révolution française</strong> (1789) par leurs idées de liberté et d'égalité.</div>"
          },
          {
            "title": "Le Romantisme (XIXe siècle)",
            "tag": "XIXe siècle",
            "content": "<h4>Contexte</h4>\n<p>Réaction contre le rationalisme des Lumières et le classicisme. Expression du <strong>moi</strong> et des <strong>sentiments</strong>.</p>\n<h4>Principes</h4>\n<ul>\n  <li>Primauté du <strong>sentiment</strong> et de l'<strong>émotion</strong></li>\n  <li>Exaltation du <strong>moi</strong>, du <strong>mal du siècle</strong> (mélancolie, spleen)</li>\n  <li><strong>Nature</strong> comme reflet des états d'âme</li>\n  <li>Goût pour l'<strong>exotisme</strong>, le <strong>Moyen Âge</strong>, le <strong>fantastique</strong></li>\n  <li>Liberté dans la forme (rejet des règles classiques)</li>\n</ul>\n<h4>Auteurs clés</h4>\n<ul>\n  <li><strong>Victor Hugo</strong> : <em>Les Contemplations</em>, <em>Hernani</em></li>\n  <li><strong>Lamartine</strong> : <em>Méditations poétiques</em></li>\n  <li><strong>Musset</strong> : <em>Les Nuits</em>, <em>Lorenzaccio</em></li>\n  <li><strong>Chateaubriand</strong> : <em>René</em></li>\n</ul>\n<div class=\"key-point\">📌 Hugo : « <strong>Le romantisme n'est que le libéralisme en littérature</strong> » (préface de <em>Hernani</em>).</div>"
          },
          {
            "title": "Le Réalisme et le Naturalisme (XIXe siècle)",
            "tag": "XIXe siècle",
            "content": "<h4>Le Réalisme (1850-1890)</h4>\n<ul>\n  <li>Peindre la <strong>réalité telle qu'elle est</strong>, sans l'embellir</li>\n  <li>Sujets du <strong>quotidien</strong>, description précise de la société</li>\n  <li>Auteurs : <strong>Balzac</strong> (<em>Le Père Goriot</em>), <strong>Flaubert</strong> (<em>Madame Bovary</em>), <strong>Stendhal</strong> (<em>Le Rouge et le Noir</em>)</li>\n</ul>\n<h4>Le Naturalisme (1870-1900)</h4>\n<ul>\n  <li>Prolongement du réalisme avec une approche <strong>scientifique</strong></li>\n  <li>L'écrivain = un « <strong>expérimentateur</strong> » qui étudie l'influence du milieu et de l'hérédité</li>\n  <li>Auteur phare : <strong>Zola</strong> (<em>Les Rougon-Macquart</em>, <em>Germinal</em>, <em>L'Assommoir</em>)</li>\n</ul>\n<div class=\"key-point\">📌 Zola : « Le roman expérimental » applique la méthode scientifique à la littérature.</div>"
          }
        ],
        "quiz": [
          {
            "q": "Quel mouvement prône « science sans conscience n'est que ruine de l'âme » ?",
            "options": [
              "Le Classicisme",
              "Les Lumières",
              "L'Humanisme",
              "Le Romantisme"
            ],
            "correct": 2,
            "expl": "Citation de <strong>Rabelais</strong>, auteur majeur de l'<strong>Humanisme</strong> (XVIe siècle)."
          },
          {
            "q": "Les 3 unités du théâtre classique sont :",
            "options": [
              "Lieu, temps, action",
              "Raison, mesure, clarté",
              "Thèse, antithèse, synthèse",
              "Amour, mort, honneur"
            ],
            "correct": 0,
            "expl": "Le théâtre classique impose <strong>unité de lieu, de temps (24h) et d'action</strong>."
          },
          {
            "q": "Quel mouvement réagit contre le rationalisme en exaltant les sentiments ?",
            "options": [
              "Le Classicisme",
              "Le Naturalisme",
              "Le Romantisme",
              "Les Lumières"
            ],
            "correct": 2,
            "expl": "Le <strong>Romantisme</strong> valorise l'émotion, le moi, la nature et rejette les règles classiques."
          },
          {
            "q": "L'Encyclopédie est l'œuvre emblématique de :",
            "options": [
              "L'Humanisme",
              "Le Romantisme",
              "Le Réalisme",
              "Les Lumières"
            ],
            "correct": 3,
            "expl": "L'<strong>Encyclopédie</strong> de Diderot et d'Alembert incarne l'esprit des <strong>Lumières</strong>."
          },
          {
            "q": "Zola est le chef de file du :",
            "options": [
              "Romantisme",
              "Réalisme",
              "Naturalisme",
              "Symbolisme"
            ],
            "correct": 2,
            "expl": "Zola théorise le <strong>Naturalisme</strong> dans « Le roman expérimental » — approche scientifique de la littérature."
          },
          {
            "q": "Qui a écrit Phèdre ?",
            "options": [
              "Molière",
              "Corneille",
              "Racine",
              "La Fontaine"
            ],
            "correct": 2,
            "expl": "<strong>Racine</strong>, auteur classique, a écrit la tragédie <em>Phèdre</em> (1677)."
          },
          {
            "q": "Le « mal du siècle » est associé à :",
            "options": [
              "L'Humanisme",
              "Le Classicisme",
              "Les Lumières",
              "Le Romantisme"
            ],
            "correct": 3,
            "expl": "Le <strong>mal du siècle</strong> (mélancolie, spleen, ennui) est un thème central du <strong>Romantisme</strong>."
          },
          {
            "q": "Madame Bovary est une œuvre du :",
            "options": [
              "Romantisme",
              "Réalisme",
              "Naturalisme",
              "Classicisme"
            ],
            "correct": 1,
            "expl": "<strong>Flaubert</strong> est un auteur <strong>réaliste</strong>. <em>Madame Bovary</em> dépeint la société de province sans idéalisation."
          }
        ],
        "flashcards": [
          {
            "front": "Quels sont les grands principes de l'Humanisme ?",
            "back": "Confiance en l'<strong>homme</strong> et la <strong>raison</strong>, importance de l'<strong>éducation</strong>, <strong>tolérance</strong>. Auteurs : Rabelais, Montaigne, Érasme."
          },
          {
            "front": "Les 3 unités du théâtre classique ?",
            "back": "<strong>Unité de lieu</strong> (un seul lieu), <strong>de temps</strong> (24h max), <strong>d'action</strong> (une seule intrigue principale)."
          },
          {
            "front": "Différence Réalisme / Naturalisme ?",
            "back": "<strong>Réalisme</strong> : peindre la réalité telle qu'elle est. <strong>Naturalisme</strong> : idem + approche scientifique (hérédité, milieu). Zola = Naturalisme."
          },
          {
            "front": "Principaux auteurs des Lumières ?",
            "back": "<strong>Voltaire</strong> (ironie), <strong>Montesquieu</strong> (lois), <strong>Rousseau</strong> (contrat social), <strong>Diderot</strong> (Encyclopédie)."
          },
          {
            "front": "Victor Hugo et le Romantisme ?",
            "back": "Hugo : chef de file du Romantisme. <em>Hernani</em> = bataille entre classiques et romantiques. <em>Les Contemplations</em> = poésie lyrique."
          }
        ]
      },
      "genres": {
        "label": "Genres littéraires",
        "icon": "fa-masks-theater",
        "fiches": [
          {
            "title": "La poésie du XIXe au XXIe siècle",
            "tag": "Poésie",
            "content": "<h4>Objet d'étude</h4>\n<p>Comment la poésie permet-elle de <strong>transfigurer le réel</strong> ou d'exprimer une vision du monde ?</p>\n<h4>Formes poétiques</h4>\n<ul>\n  <li><strong>Sonnet</strong> : 2 quatrains + 2 tercets (14 vers), forme fixe</li>\n  <li><strong>Ode</strong> : poème lyrique célébrant un sujet noble</li>\n  <li><strong>Vers libre</strong> : pas de contrainte métrique régulière</li>\n  <li><strong>Poème en prose</strong> : sans versification (Baudelaire, <em>Le Spleen de Paris</em>)</li>\n</ul>\n<h4>Versification</h4>\n<ul>\n  <li><strong>Alexandrin</strong> = 12 syllabes, <strong>décasyllabe</strong> = 10, <strong>octosyllabe</strong> = 8</li>\n  <li><strong>Rimes</strong> : plates (AABB), croisées (ABAB), embrassées (ABBA)</li>\n  <li><strong>Enjambement</strong> : la phrase déborde du vers</li>\n  <li><strong>Césure</strong> : pause à l'hémistiche de l'alexandrin (6//6)</li>\n</ul>\n<div class=\"key-point\">📌 En poésie, la <strong>forme est signifiante</strong> : le rythme, les sons et la disposition contribuent au sens.</div>"
          },
          {
            "title": "Le théâtre du XVIIe au XXIe siècle",
            "tag": "Théâtre",
            "content": "<h4>Objet d'étude</h4>\n<p>Étudier le texte théâtral et sa <strong>représentation</strong> : le théâtre se lit ET se joue.</p>\n<h4>Les genres dramatiques</h4>\n<ul>\n  <li><strong>Tragédie</strong> : personnages nobles, destin fatal, <em>catharsis</em> (Racine, Corneille)</li>\n  <li><strong>Comédie</strong> : personnages ordinaires, défauts moqués, dénouement heureux (Molière)</li>\n  <li><strong>Drame romantique</strong> : mélange des registres, rejet des unités (Hugo)</li>\n  <li><strong>Théâtre de l'absurde</strong> : XXe s., crise du sens (Ionesco, Beckett)</li>\n</ul>\n<h4>Vocabulaire théâtral</h4>\n<ul>\n  <li><strong>Didascalie</strong> : indication scénique de l'auteur</li>\n  <li><strong>Monologue</strong> : un personnage parle seul</li>\n  <li><strong>Tirade</strong> : longue réplique</li>\n  <li><strong>Aparté</strong> : parole adressée au public, non entendue par les autres personnages</li>\n  <li><strong>Quiproquo</strong> : malentendu comique</li>\n</ul>\n<div class=\"key-point\">📌 <strong>Double énonciation</strong> au théâtre : le personnage parle à un autre personnage ET au spectateur.</div>"
          },
          {
            "title": "Le roman et le récit du XVIIIe au XXIe siècle",
            "tag": "Roman",
            "content": "<h4>Objet d'étude</h4>\n<p>Comment le roman représente-t-il le monde et l'individu ? Quels choix narratifs et esthétiques ?</p>\n<h4>La narration</h4>\n<ul>\n  <li><strong>Point de vue interne</strong> : on voit à travers un personnage</li>\n  <li><strong>Point de vue externe</strong> : regard neutre, caméra</li>\n  <li><strong>Point de vue omniscient</strong> : le narrateur sait tout</li>\n  <li><strong>Narrateur</strong> : homodiégétique (= personnage) ou hétérodiégétique (= extérieur)</li>\n</ul>\n<h4>Le personnage de roman</h4>\n<ul>\n  <li><strong>Héros</strong> : valeurs exemplaires (roman classique)</li>\n  <li><strong>Anti-héros</strong> : personnage ordinaire, défaillant (roman moderne)</li>\n  <li>Description physique + psychologique = <strong>portrait</strong></li>\n</ul>\n<div class=\"key-point\">📌 L'<strong>incipit</strong> (début) et l'<strong>excipit</strong> (fin) du roman sont des passages stratégiques à bien analyser.</div>"
          },
          {
            "title": "La littérature d'idées du XVIe au XVIIIe siècle",
            "tag": "Argumentation",
            "content": "<h4>Objet d'étude</h4>\n<p>Comment les auteurs cherchent-ils à <strong>convaincre, persuader ou délibérer</strong> ?</p>\n<h4>Les stratégies argumentatives</h4>\n<ul>\n  <li><strong>Convaincre</strong> : faire appel à la raison (arguments logiques)</li>\n  <li><strong>Persuader</strong> : faire appel aux émotions (pathos)</li>\n  <li><strong>Délibérer</strong> : peser le pour et le contre</li>\n</ul>\n<h4>Les genres de l'argumentation</h4>\n<ul>\n  <li><strong>Essai</strong> : réflexion personnelle (Montaigne)</li>\n  <li><strong>Conte philosophique</strong> : récit fictif porteur d'une morale (Voltaire, <em>Candide</em>)</li>\n  <li><strong>Fable</strong> : court récit allégorique (La Fontaine)</li>\n  <li><strong>Discours / lettre ouverte</strong> : argumentation directe</li>\n  <li><strong>Utopie / dystopie</strong> : société idéale ou cauchemardesque</li>\n</ul>\n<h4>Argumentation directe vs indirecte</h4>\n<ul>\n  <li><strong>Directe</strong> : l'auteur expose ses idées explicitement (essai, discours)</li>\n  <li><strong>Indirecte</strong> : l'auteur passe par la fiction (conte, fable, roman)</li>\n</ul>\n<div class=\"key-point\">📌 L'<strong>ironie</strong> (dire le contraire de ce qu'on pense) est une arme redoutable des Lumières (Voltaire).</div>"
          }
        ],
        "quiz": [
          {
            "q": "Un sonnet est composé de :",
            "options": [
              "3 quatrains",
              "2 quatrains + 2 tercets",
              "4 tercets",
              "14 strophes"
            ],
            "correct": 1,
            "expl": "Le sonnet = <strong>2 quatrains + 2 tercets</strong> = 14 vers au total."
          },
          {
            "q": "Qu'est-ce que la double énonciation au théâtre ?",
            "options": [
              "Deux personnages parlent en même temps",
              "Le personnage parle à un autre ET au public",
              "L'auteur intervient dans la pièce",
              "Le narrateur commente l'action"
            ],
            "correct": 1,
            "expl": "La <strong>double énonciation</strong> : chaque réplique s'adresse à la fois à un personnage et au spectateur."
          },
          {
            "q": "Le point de vue omniscient signifie que :",
            "options": [
              "Le narrateur ne sait rien",
              "Le narrateur est un personnage",
              "Le narrateur sait tout",
              "Le lecteur devine tout"
            ],
            "correct": 2,
            "expl": "Le narrateur <strong>omniscient</strong> connaît tout : pensées, passé, futur de tous les personnages."
          },
          {
            "q": "Le conte philosophique est une forme d'argumentation :",
            "options": [
              "Directe",
              "Indirecte",
              "Scientifique",
              "Neutre"
            ],
            "correct": 1,
            "expl": "Le conte philosophique = <strong>argumentation indirecte</strong> : la fiction véhicule une critique ou une morale (ex : <em>Candide</em>)."
          },
          {
            "q": "Un alexandrin compte :",
            "options": [
              "8 syllabes",
              "10 syllabes",
              "12 syllabes",
              "14 syllabes"
            ],
            "correct": 2,
            "expl": "L'<strong>alexandrin</strong> = <strong>12 syllabes</strong> avec une césure à l'hémistiche (6//6)."
          },
          {
            "q": "Une didascalie est :",
            "options": [
              "Une réplique longue",
              "Un mot inventé par le poète",
              "Une indication scénique de l'auteur",
              "Un type de figure de style"
            ],
            "correct": 2,
            "expl": "Les <strong>didascalies</strong> sont les indications de mise en scène (décor, ton, gestes…)."
          },
          {
            "q": "Le théâtre de l'absurde se développe au :",
            "options": [
              "XVIIe siècle",
              "XVIIIe siècle",
              "XIXe siècle",
              "XXe siècle"
            ],
            "correct": 3,
            "expl": "Le théâtre de l'<strong>absurde</strong> naît au <strong>XXe siècle</strong> (Ionesco, Beckett) — crise du sens après les guerres."
          }
        ],
        "flashcards": [
          {
            "front": "Structure du sonnet ?",
            "back": "<strong>2 quatrains</strong> (4 vers) + <strong>2 tercets</strong> (3 vers) = 14 vers. Forme fixe."
          },
          {
            "front": "Argumentation directe vs indirecte ?",
            "back": "<strong>Directe</strong> : l'auteur expose ses idées (essai, discours). <strong>Indirecte</strong> : passe par la fiction (fable, conte, roman)."
          },
          {
            "front": "Les 3 types de points de vue narratifs ?",
            "back": "<strong>Interne</strong> (un personnage), <strong>externe</strong> (caméra), <strong>omniscient</strong> (le narrateur sait tout)."
          },
          {
            "front": "Convaincre vs persuader ?",
            "back": "<strong>Convaincre</strong> = raison, arguments logiques. <strong>Persuader</strong> = émotions, sentiments (pathos)."
          },
          {
            "front": "Qu'est-ce qu'un incipit ?",
            "back": "Le <strong>début d'un roman</strong>. Passage stratégique qui installe le cadre, les personnages et l'atmosphère."
          }
        ]
      },
      "langue": {
        "label": "Langue & Figures",
        "icon": "fa-spell-check",
        "fiches": [
          {
            "title": "Les figures de style essentielles",
            "tag": "Stylistique",
            "content": "<h4>Figures d'analogie (rapprochement)</h4>\n<ul>\n  <li><strong>Comparaison</strong> : « tel », « comme », « pareil à ». « Ses yeux <em>comme</em> des étoiles »</li>\n  <li><strong>Métaphore</strong> : comparaison sans outil. « Ses yeux, <em>deux étoiles</em> »</li>\n  <li><strong>Personnification</strong> : qualités humaines à un non-humain. « La mer <em>gémit</em> »</li>\n  <li><strong>Allégorie</strong> : représentation concrète d'une abstraction. « La Mort, vêtue de noir »</li>\n</ul>\n<h4>Figures d'amplification / atténuation</h4>\n<ul>\n  <li><strong>Hyperbole</strong> : exagération. « Un bruit à réveiller les morts »</li>\n  <li><strong>Litote</strong> : dire moins pour suggérer plus. « Va, je ne te hais point » (= je t'aime)</li>\n  <li><strong>Euphémisme</strong> : adoucir. « Il nous a quittés » (= il est mort)</li>\n  <li><strong>Gradation</strong> : enchaînement croissant ou décroissant. « Je vins, je vis, je vainquis »</li>\n</ul>\n<h4>Figures d'opposition</h4>\n<ul>\n  <li><strong>Antithèse</strong> : opposition de deux termes. « Grand et petit, riche et pauvre »</li>\n  <li><strong>Oxymore</strong> : alliance de termes contradictoires. « Cette <em>obscure clarté</em> »</li>\n  <li><strong>Paradoxe</strong> : idée contraire à la logique commune</li>\n</ul>\n<h4>Figures de construction</h4>\n<ul>\n  <li><strong>Anaphore</strong> : répétition en début de phrase. « Moi président… Moi président… »</li>\n  <li><strong>Chiasme</strong> : structure en miroir (AB/BA). « Il faut manger pour vivre et non vivre pour manger »</li>\n  <li><strong>Parallélisme</strong> : même construction syntaxique répétée</li>\n</ul>\n<div class=\"key-point\">📌 Toujours nommer la figure, la citer, puis expliquer son <strong>effet</strong> sur le lecteur.</div>"
          },
          {
            "title": "Grammaire pour l'oral : les propositions",
            "tag": "Grammaire",
            "content": "<h4>La phrase complexe</h4>\n<p>Une phrase complexe contient <strong>plusieurs propositions</strong> (= plusieurs verbes conjugués).</p>\n<h4>Types de propositions</h4>\n<ul>\n  <li><strong>Proposition indépendante</strong> : se suffit à elle-même</li>\n  <li><strong>Proposition principale</strong> : commande une subordonnée</li>\n  <li><strong>Proposition subordonnée</strong> : dépend de la principale</li>\n</ul>\n<h4>Les subordonnées</h4>\n<ul>\n  <li><strong>Relative</strong> : introduite par un pronom relatif (qui, que, dont, où…). Complète un nom</li>\n  <li><strong>Conjonctive complétive</strong> : introduite par « que ». Complète un verbe</li>\n  <li><strong>Circonstancielle</strong> : de temps, de cause, de conséquence, de but, de concession…</li>\n</ul>\n<div class=\"key-point\">📌 À l'oral du bac, on peut vous demander d'analyser la <strong>nature et la fonction</strong> d'une proposition entière.</div>"
          },
          {
            "title": "Registres littéraires",
            "tag": "Analyse",
            "content": "<h4>Principaux registres</h4>\n<ul>\n  <li><strong>Lyrique</strong> : expression des sentiments personnels (amour, nostalgie, joie)</li>\n  <li><strong>Tragique</strong> : fatalité, mort inévitable, impuissance</li>\n  <li><strong>Comique</strong> : mots (jeux), gestes, situations, caractères</li>\n  <li><strong>Pathétique</strong> : susciter la pitié, la compassion</li>\n  <li><strong>Épique</strong> : exploits héroïques, combat, grandeur</li>\n  <li><strong>Satirique</strong> : critiquer en se moquant</li>\n  <li><strong>Polémique</strong> : attaquer violemment un adversaire</li>\n  <li><strong>Didactique</strong> : enseigner, transmettre un savoir</li>\n</ul>\n<div class=\"key-point\">📌 Ne pas confondre <strong>registre</strong> (= tonalité, effet sur le lecteur) et <strong>genre</strong> (= type d'œuvre : roman, poésie…).</div>"
          }
        ],
        "quiz": [
          {
            "q": "« Cette obscure clarté » est un(e) :",
            "options": [
              "Métaphore",
              "Antithèse",
              "Oxymore",
              "Comparaison"
            ],
            "correct": 2,
            "expl": "<strong>Oxymore</strong> : alliance de deux termes contradictoires (« obscure » + « clarté »)."
          },
          {
            "q": "« Va, je ne te hais point » (Chimène dans Le Cid) est un(e) :",
            "options": [
              "Hyperbole",
              "Litote",
              "Euphémisme",
              "Métaphore"
            ],
            "correct": 1,
            "expl": "<strong>Litote</strong> : dire moins pour suggérer plus. Chimène exprime en réalité son amour."
          },
          {
            "q": "Une proposition subordonnée relative est introduite par :",
            "options": [
              "Que (conjonction)",
              "Un pronom relatif (qui, que, dont, où)",
              "Une préposition",
              "Un adverbe"
            ],
            "correct": 1,
            "expl": "La relative est introduite par un <strong>pronom relatif</strong> : qui, que, dont, où, lequel…"
          },
          {
            "q": "Le registre qui exprime les sentiments personnels est le registre :",
            "options": [
              "Tragique",
              "Épique",
              "Lyrique",
              "Satirique"
            ],
            "correct": 2,
            "expl": "Le registre <strong>lyrique</strong> exprime les sentiments intimes du poète (amour, mélancolie…)."
          },
          {
            "q": "« Il faut manger pour vivre et non vivre pour manger » est un(e) :",
            "options": [
              "Anaphore",
              "Chiasme",
              "Oxymore",
              "Gradation"
            ],
            "correct": 1,
            "expl": "<strong>Chiasme</strong> : structure en miroir AB/BA (manger/vivre → vivre/manger)."
          },
          {
            "q": "Quel registre cherche à susciter la pitié ?",
            "options": [
              "Comique",
              "Pathétique",
              "Satirique",
              "Épique"
            ],
            "correct": 1,
            "expl": "Le registre <strong>pathétique</strong> vise à émouvoir et à susciter la compassion du lecteur."
          },
          {
            "q": "« La Liberté guidant le peuple » est un exemple de :",
            "options": [
              "Métaphore",
              "Personnification",
              "Allégorie",
              "Comparaison"
            ],
            "correct": 2,
            "expl": "La Liberté est représentée comme une femme : c'est une <strong>allégorie</strong> (représentation concrète d'une abstraction)."
          }
        ],
        "flashcards": [
          {
            "front": "Comparaison vs Métaphore ?",
            "back": "<strong>Comparaison</strong> = avec outil (comme, tel). <strong>Métaphore</strong> = sans outil. Les deux rapprochent deux éléments."
          },
          {
            "front": "Oxymore : définition et exemple ?",
            "back": "Alliance de <strong>deux termes contradictoires</strong>. Ex : « cette obscure clarté », « un silence assourdissant »."
          },
          {
            "front": "Chiasme : définition ?",
            "back": "Structure en <strong>miroir AB/BA</strong>. Ex : « Il faut manger pour vivre et non vivre pour manger »."
          },
          {
            "front": "Les 3 types de subordonnées ?",
            "back": "<strong>Relative</strong> (pronom relatif), <strong>Complétive</strong> (que + verbe), <strong>Circonstancielle</strong> (temps, cause, but…)."
          },
          {
            "front": "Registre lyrique vs pathétique ?",
            "back": "<strong>Lyrique</strong> = expression des sentiments du « je ». <strong>Pathétique</strong> = susciter pitié et compassion chez le lecteur."
          }
        ]
      },
      "secondDegre": {
        "label": "Second degré",
        "icon": "fa-superscript",
        "fiches": [
          {
            "title": "Trinôme du second degré",
            "tag": "Algèbre",
            "content": "<h4>Forme générale</h4>\n<p>Un trinôme du second degré est de la forme <strong>f(x) = ax² + bx + c</strong> avec a ≠ 0.</p>\n<h4>Discriminant</h4>\n<div class=\"key-point\">📌 <strong>Δ = b² − 4ac</strong></div>\n<ul>\n  <li><strong>Δ > 0</strong> : 2 racines réelles distinctes x₁ = (−b − √Δ) / 2a et x₂ = (−b + √Δ) / 2a</li>\n  <li><strong>Δ = 0</strong> : 1 racine double x₀ = −b / 2a</li>\n  <li><strong>Δ < 0</strong> : pas de racine réelle</li>\n</ul>\n<h4>Forme canonique</h4>\n<p><strong>f(x) = a(x − α)² + β</strong> avec α = −b/(2a) et β = f(α)</p>\n<p>Le sommet de la parabole est le point <strong>S(α ; β)</strong>.</p>\n<h4>Signe du trinôme</h4>\n<ul>\n  <li>Si Δ > 0 : f(x) est du signe de a <strong>à l'extérieur</strong> des racines, du signe opposé entre les racines</li>\n  <li>Si Δ ≤ 0 : f(x) est toujours du <strong>signe de a</strong></li>\n</ul>"
          },
          {
            "title": "Factorisation et équations du second degré",
            "tag": "Algèbre",
            "content": "<h4>Factorisation</h4>\n<ul>\n  <li>Si Δ > 0 : <strong>f(x) = a(x − x₁)(x − x₂)</strong></li>\n  <li>Si Δ = 0 : <strong>f(x) = a(x − x₀)²</strong></li>\n  <li>Si Δ < 0 : pas de factorisation dans ℝ</li>\n</ul>\n<h4>Résoudre ax² + bx + c = 0</h4>\n<p>Calculer Δ puis appliquer les formules. Les solutions sont les <strong>racines</strong> du trinôme.</p>\n<h4>Résoudre ax² + bx + c > 0 (ou < 0)</h4>\n<p>Utiliser le <strong>tableau de signes</strong> du trinôme.</p>\n<div class=\"key-point\">📌 <strong>Somme des racines</strong> : x₁ + x₂ = −b/a. <strong>Produit</strong> : x₁ × x₂ = c/a.</div>"
          }
        ],
        "quiz": [
          {
            "q": "Quel est le discriminant de x² − 5x + 6 ?",
            "options": [
              "1",
              "−1",
              "25",
              "49"
            ],
            "correct": 0,
            "expl": "Δ = (−5)² − 4(1)(6) = 25 − 24 = <strong>1</strong>."
          },
          {
            "q": "Si Δ < 0, le trinôme a :",
            "options": [
              "2 racines réelles",
              "1 racine double",
              "Aucune racine réelle",
              "Des racines infinies"
            ],
            "correct": 2,
            "expl": "Si Δ < 0, l'équation n'a <strong>aucune solution réelle</strong>."
          },
          {
            "q": "Les racines de x² − 5x + 6 = 0 sont :",
            "options": [
              "2 et 3",
              "−2 et −3",
              "1 et 6",
              "−1 et −6"
            ],
            "correct": 0,
            "expl": "Δ = 1, x₁ = (5−1)/2 = <strong>2</strong>, x₂ = (5+1)/2 = <strong>3</strong>."
          },
          {
            "q": "La forme canonique fait apparaître :",
            "options": [
              "Les racines",
              "Le sommet de la parabole",
              "L'axe des abscisses",
              "Le discriminant"
            ],
            "correct": 1,
            "expl": "f(x) = a(x − α)² + β met en évidence le <strong>sommet S(α ; β)</strong>."
          },
          {
            "q": "Si a > 0 et Δ > 0, le trinôme est négatif :",
            "options": [
              "Partout",
              "Nulle part",
              "Entre les racines",
              "À l'extérieur des racines"
            ],
            "correct": 2,
            "expl": "Si a > 0, le trinôme est négatif <strong>entre les racines</strong> x₁ et x₂."
          },
          {
            "q": "Somme des racines de 2x² − 7x + 3 = 0 ?",
            "options": [
              "7/2",
              "3/2",
              "−7/2",
              "7"
            ],
            "correct": 0,
            "expl": "Somme = −b/a = −(−7)/2 = <strong>7/2</strong>."
          }
        ],
        "flashcards": [
          {
            "front": "Formule du discriminant ?",
            "back": "<strong>Δ = b² − 4ac</strong>. Si Δ > 0 : 2 racines. Δ = 0 : 1 racine double. Δ < 0 : aucune racine réelle."
          },
          {
            "front": "Formules des racines ?",
            "back": "x₁ = <strong>(−b − √Δ) / 2a</strong> et x₂ = <strong>(−b + √Δ) / 2a</strong>."
          },
          {
            "front": "Sommet de la parabole ?",
            "back": "S(α ; β) avec <strong>α = −b/(2a)</strong> et <strong>β = f(α)</strong>. C'est le minimum (a > 0) ou maximum (a < 0)."
          },
          {
            "front": "Signe du trinôme quand Δ > 0 et a > 0 ?",
            "back": "<strong>Positif</strong> à l'extérieur des racines, <strong>négatif</strong> entre les racines."
          }
        ]
      },
      "derivation": {
        "label": "Dérivation",
        "icon": "fa-chart-line",
        "fiches": [
          {
            "title": "Nombre dérivé et fonction dérivée",
            "tag": "Analyse",
            "content": "<h4>Nombre dérivé</h4>\n<p>Le <strong>nombre dérivé</strong> de f en a, noté f'(a), est le coefficient directeur de la <strong>tangente</strong> à la courbe en a.</p>\n<div class=\"key-point\">📌 f'(a) = lim (h→0) [f(a+h) − f(a)] / h</div>\n<h4>Équation de la tangente</h4>\n<p><strong>y = f'(a)(x − a) + f(a)</strong></p>\n<h4>Dérivées de référence</h4>\n<ul>\n  <li>f(x) = k → f'(x) = <strong>0</strong></li>\n  <li>f(x) = x → f'(x) = <strong>1</strong></li>\n  <li>f(x) = x² → f'(x) = <strong>2x</strong></li>\n  <li>f(x) = xⁿ → f'(x) = <strong>nxⁿ⁻¹</strong></li>\n  <li>f(x) = 1/x → f'(x) = <strong>−1/x²</strong></li>\n  <li>f(x) = √x → f'(x) = <strong>1/(2√x)</strong></li>\n</ul>"
          },
          {
            "title": "Opérations sur les dérivées",
            "tag": "Analyse",
            "content": "<h4>Règles de dérivation</h4>\n<ul>\n  <li><strong>(u + v)' = u' + v'</strong></li>\n  <li><strong>(ku)' = ku'</strong> (k constante)</li>\n  <li><strong>(uv)' = u'v + uv'</strong> (produit)</li>\n  <li><strong>(u/v)' = (u'v − uv') / v²</strong> (quotient)</li>\n</ul>\n<h4>Variations d'une fonction</h4>\n<ul>\n  <li>f'(x) > 0 ⇒ f est <strong>croissante</strong></li>\n  <li>f'(x) < 0 ⇒ f est <strong>décroissante</strong></li>\n  <li>f'(x) = 0 et changement de signe ⇒ <strong>extremum</strong></li>\n</ul>\n<div class=\"key-point\">📌 Méthode : calculer f'(x), étudier son signe, en déduire le <strong>tableau de variations</strong>.</div>"
          }
        ],
        "quiz": [
          {
            "q": "La dérivée de f(x) = 3x² + 2x − 1 est :",
            "options": [
              "6x + 2",
              "3x + 2",
              "6x² + 2",
              "3x² + 2x"
            ],
            "correct": 0,
            "expl": "f'(x) = 2×3x + 2 = <strong>6x + 2</strong>."
          },
          {
            "q": "Si f'(x) > 0 sur un intervalle, f est :",
            "options": [
              "Décroissante",
              "Constante",
              "Croissante",
              "Nulle"
            ],
            "correct": 2,
            "expl": "Dérivée positive ⇒ fonction <strong>croissante</strong>."
          },
          {
            "q": "L'équation de la tangente en a s'écrit :",
            "options": [
              "y = f(a)x + f'(a)",
              "y = f'(a)(x−a) + f(a)",
              "y = f(a)(x−a) + f'(a)",
              "y = ax + b"
            ],
            "correct": 1,
            "expl": "Tangente : <strong>y = f'(a)(x − a) + f(a)</strong>."
          },
          {
            "q": "La dérivée de f(x) = 1/x est :",
            "options": [
              "1/x²",
              "−1/x²",
              "−1/x",
              "x²"
            ],
            "correct": 1,
            "expl": "f'(x) = <strong>−1/x²</strong> (attention au signe négatif)."
          },
          {
            "q": "(uv)' = ?",
            "options": [
              "u'v'",
              "u'v + uv'",
              "u'v − uv'",
              "u'/v'"
            ],
            "correct": 1,
            "expl": "Formule du produit : <strong>(uv)' = u'v + uv'</strong>."
          },
          {
            "q": "La dérivée de f(x) = x³ est :",
            "options": [
              "3x",
              "3x²",
              "x²",
              "2x³"
            ],
            "correct": 1,
            "expl": "f(x) = xⁿ → f'(x) = nxⁿ⁻¹ → f'(x) = <strong>3x²</strong>."
          }
        ],
        "flashcards": [
          {
            "front": "Dérivée de xⁿ ?",
            "back": "<strong>nxⁿ⁻¹</strong>. Ex : (x³)' = 3x², (x⁵)' = 5x⁴."
          },
          {
            "front": "Formule de la tangente en a ?",
            "back": "<strong>y = f'(a)(x − a) + f(a)</strong>"
          },
          {
            "front": "Formule du produit de dérivées ?",
            "back": "<strong>(uv)' = u'v + uv'</strong>"
          },
          {
            "front": "Comment trouver les variations d'une fonction ?",
            "back": "1. Calculer f'(x). 2. Trouver où f'(x) = 0. 3. Étudier le signe de f'. 4. <strong>f' > 0 → croissante, f' < 0 → décroissante</strong>."
          }
        ]
      },
      "suites": {
        "label": "Suites",
        "icon": "fa-list-ol",
        "fiches": [
          {
            "title": "Suites arithmétiques",
            "tag": "Suites",
            "content": "<h4>Définition</h4>\n<p>Une suite (uₙ) est <strong>arithmétique</strong> de raison r si : <strong>uₙ₊₁ = uₙ + r</strong></p>\n<h4>Terme général</h4>\n<div class=\"key-point\">📌 <strong>uₙ = u₀ + n × r</strong> (ou uₙ = u₁ + (n−1) × r)</div>\n<h4>Somme des termes</h4>\n<p>Somme des n+1 premiers termes (de u₀ à uₙ) :</p>\n<p><strong>S = (n+1) × (u₀ + uₙ) / 2</strong></p>\n<p>Formule générale : S = nombre de termes × (premier + dernier) / 2</p>\n<h4>Variations</h4>\n<ul>\n  <li>r > 0 : suite <strong>croissante</strong></li>\n  <li>r < 0 : suite <strong>décroissante</strong></li>\n  <li>r = 0 : suite <strong>constante</strong></li>\n</ul>"
          },
          {
            "title": "Suites géométriques",
            "tag": "Suites",
            "content": "<h4>Définition</h4>\n<p>Une suite (uₙ) est <strong>géométrique</strong> de raison q si : <strong>uₙ₊₁ = q × uₙ</strong></p>\n<h4>Terme général</h4>\n<div class=\"key-point\">📌 <strong>uₙ = u₀ × qⁿ</strong></div>\n<h4>Somme des termes</h4>\n<p>Si q ≠ 1 : <strong>S = u₀ × (1 − qⁿ⁺¹) / (1 − q)</strong></p>\n<p>Astuce : S = premier terme × (1 − qⁿᵒᵐᵇʳᵉ ᵈᵉ ᵗᵉʳᵐᵉˢ) / (1 − q)</p>\n<h4>Variations (si u₀ > 0)</h4>\n<ul>\n  <li>q > 1 : suite <strong>croissante</strong></li>\n  <li>0 < q < 1 : suite <strong>décroissante</strong> (converge vers 0)</li>\n  <li>q = 1 : suite <strong>constante</strong></li>\n  <li>q < 0 : suite <strong>alternée</strong></li>\n</ul>"
          }
        ],
        "quiz": [
          {
            "q": "Si uₙ₊₁ = uₙ + 5, de quel type est la suite ?",
            "options": [
              "Géométrique",
              "Arithmétique",
              "Ni l'un ni l'autre",
              "Constante"
            ],
            "correct": 1,
            "expl": "uₙ₊₁ = uₙ + r avec r = 5 : c'est une suite <strong>arithmétique</strong>."
          },
          {
            "q": "u₀ = 3 et r = 4. Que vaut u₁₀ ?",
            "options": [
              "40",
              "43",
              "34",
              "30"
            ],
            "correct": 1,
            "expl": "uₙ = u₀ + nr = 3 + 10×4 = <strong>43</strong>."
          },
          {
            "q": "u₀ = 2, q = 3. Que vaut u₃ ?",
            "options": [
              "54",
              "18",
              "6",
              "162"
            ],
            "correct": 0,
            "expl": "uₙ = u₀ × qⁿ = 2 × 3³ = 2 × 27 = <strong>54</strong>."
          },
          {
            "q": "Somme des 5 premiers entiers (1+2+3+4+5) ?",
            "options": [
              "10",
              "15",
              "20",
              "25"
            ],
            "correct": 1,
            "expl": "S = 5 × (1+5) / 2 = 5 × 3 = <strong>15</strong>."
          },
          {
            "q": "Une suite géométrique de raison 0 < q < 1 est :",
            "options": [
              "Croissante",
              "Constante",
              "Décroissante",
              "Alternée"
            ],
            "correct": 2,
            "expl": "Si 0 < q < 1 et u₀ > 0, chaque terme est plus petit : suite <strong>décroissante</strong> vers 0."
          },
          {
            "q": "Si uₙ₊₁ = 2uₙ, la suite est :",
            "options": [
              "Arithmétique de raison 2",
              "Géométrique de raison 2",
              "Constante",
              "Alternée"
            ],
            "correct": 1,
            "expl": "uₙ₊₁ = q × uₙ avec q = 2 : suite <strong>géométrique de raison 2</strong>."
          }
        ],
        "flashcards": [
          {
            "front": "Terme général d'une suite arithmétique ?",
            "back": "<strong>uₙ = u₀ + n × r</strong>. On ajoute r à chaque étape."
          },
          {
            "front": "Terme général d'une suite géométrique ?",
            "back": "<strong>uₙ = u₀ × qⁿ</strong>. On multiplie par q à chaque étape."
          },
          {
            "front": "Somme d'une suite arithmétique ?",
            "back": "<strong>S = nombre de termes × (premier + dernier) / 2</strong>"
          },
          {
            "front": "Somme d'une suite géométrique ?",
            "back": "<strong>S = u₀ × (1 − qⁿ⁺¹) / (1 − q)</strong> (si q ≠ 1)"
          }
        ]
      },
      "probas": {
        "label": "Probabilités",
        "icon": "fa-dice",
        "fiches": [
          {
            "title": "Probabilités conditionnelles",
            "tag": "Probabilités",
            "content": "<h4>Définition</h4>\n<p>P(B|A) = probabilité de B <strong>sachant que</strong> A est réalisé.</p>\n<div class=\"key-point\">📌 <strong>P(B|A) = P(A∩B) / P(A)</strong> (avec P(A) ≠ 0)</div>\n<h4>Arbre pondéré</h4>\n<ul>\n  <li>Sur chaque branche, on note la probabilité</li>\n  <li>P(A∩B) = on <strong>multiplie</strong> les probabilités le long d'un chemin</li>\n  <li>P(B) = on <strong>additionne</strong> les chemins menant à B</li>\n</ul>\n<h4>Formule des probabilités totales</h4>\n<p>Si A₁, A₂… forment une partition de Ω :</p>\n<p><strong>P(B) = P(B|A₁)P(A₁) + P(B|A₂)P(A₂) + …</strong></p>"
          },
          {
            "title": "Indépendance de deux événements",
            "tag": "Probabilités",
            "content": "<h4>Définition</h4>\n<p>A et B sont <strong>indépendants</strong> si et seulement si :</p>\n<div class=\"key-point\">📌 <strong>P(A∩B) = P(A) × P(B)</strong></div>\n<p>Autrement dit : P(B|A) = P(B) — savoir que A est réalisé ne change pas la probabilité de B.</p>\n<h4>Attention</h4>\n<ul>\n  <li>Indépendance ≠ incompatibilité</li>\n  <li>Si A et B sont incompatibles : P(A∩B) = 0</li>\n  <li>Si A et B sont indépendants : P(A∩B) = P(A) × P(B)</li>\n</ul>"
          },
          {
            "title": "Variables aléatoires",
            "tag": "Probabilités",
            "content": "<h4>Définition</h4>\n<p>Une <strong>variable aléatoire</strong> X associe un nombre réel à chaque issue d'une expérience.</p>\n<h4>Loi de probabilité</h4>\n<p>Tableau donnant chaque valeur xᵢ et sa probabilité P(X = xᵢ).</p>\n<h4>Espérance</h4>\n<div class=\"key-point\">📌 <strong>E(X) = Σ xᵢ × P(X = xᵢ)</strong></div>\n<p>L'espérance est la <strong>valeur moyenne</strong> attendue sur un grand nombre de répétitions.</p>\n<h4>Variance et écart-type</h4>\n<ul>\n  <li><strong>V(X) = E(X²) − [E(X)]²</strong></li>\n  <li><strong>σ(X) = √V(X)</strong> (écart-type = mesure de la dispersion)</li>\n</ul>"
          }
        ],
        "quiz": [
          {
            "q": "P(B|A) se lit :",
            "options": [
              "Probabilité de A et B",
              "Probabilité de B sachant A",
              "Probabilité de A sachant B",
              "Probabilité de A ou B"
            ],
            "correct": 1,
            "expl": "P(B|A) = <strong>probabilité de B sachant A</strong>."
          },
          {
            "q": "P(A∩B) dans un arbre pondéré s'obtient en :",
            "options": [
              "Additionnant les branches",
              "Multipliant le long du chemin",
              "Divisant les branches",
              "Soustrayant"
            ],
            "correct": 1,
            "expl": "On <strong>multiplie</strong> les probabilités le long d'un même chemin."
          },
          {
            "q": "A et B sont indépendants si :",
            "options": [
              "P(A∩B) = 0",
              "P(A∩B) = P(A) + P(B)",
              "P(A∩B) = P(A) × P(B)",
              "P(A) = P(B)"
            ],
            "correct": 2,
            "expl": "<strong>P(A∩B) = P(A) × P(B)</strong> : définition de l'indépendance."
          },
          {
            "q": "L'espérance E(X) représente :",
            "options": [
              "La valeur maximale",
              "La valeur la plus fréquente",
              "La valeur moyenne attendue",
              "La variance"
            ],
            "correct": 2,
            "expl": "E(X) est la <strong>valeur moyenne</strong> qu'on attend sur un grand nombre de répétitions."
          },
          {
            "q": "La formule des probabilités totales permet de calculer :",
            "options": [
              "P(A|B)",
              "P(A∩B)",
              "P(B)",
              "P(A)×P(B)"
            ],
            "correct": 2,
            "expl": "On calcule <strong>P(B)</strong> en sommant sur tous les chemins menant à B."
          },
          {
            "q": "P(A∩B) = 0 signifie que A et B sont :",
            "options": [
              "Indépendants",
              "Incompatibles",
              "Certains",
              "Égaux"
            ],
            "correct": 1,
            "expl": "Si P(A∩B) = 0, A et B ne peuvent pas se réaliser ensemble : ils sont <strong>incompatibles</strong>."
          }
        ],
        "flashcards": [
          {
            "front": "Formule de P(B|A) ?",
            "back": "<strong>P(B|A) = P(A∩B) / P(A)</strong>"
          },
          {
            "front": "A et B indépendants : condition ?",
            "back": "<strong>P(A∩B) = P(A) × P(B)</strong>. Savoir que A est réalisé ne change pas P(B)."
          },
          {
            "front": "Espérance E(X) ?",
            "back": "<strong>E(X) = Σ xᵢ × P(X = xᵢ)</strong>. C'est la moyenne pondérée des valeurs."
          },
          {
            "front": "Formule des probabilités totales ?",
            "back": "<strong>P(B) = Σ P(B|Aᵢ) × P(Aᵢ)</strong> pour une partition A₁, A₂…"
          }
        ]
      },
      "trigo": {
        "label": "Trigonométrie",
        "icon": "fa-compass-drafting",
        "fiches": [
          {
            "title": "Cercle trigonométrique et radians",
            "tag": "Trigonométrie",
            "content": "<h4>Le cercle trigonométrique</h4>\n<p>Cercle de centre O et de rayon 1. Un point M sur le cercle correspond à un angle orienté.</p>\n<h4>Conversion degrés ↔ radians</h4>\n<div class=\"key-point\">📌 <strong>180° = π rad</strong>. Donc 1° = π/180 rad.</div>\n<ul>\n  <li>90° = <strong>π/2</strong></li>\n  <li>60° = <strong>π/3</strong></li>\n  <li>45° = <strong>π/4</strong></li>\n  <li>30° = <strong>π/6</strong></li>\n  <li>360° = <strong>2π</strong></li>\n</ul>\n<h4>Cosinus et sinus</h4>\n<p>Pour un angle θ, le point M a pour coordonnées <strong>(cos θ ; sin θ)</strong>.</p>\n<ul>\n  <li>cos θ = abscisse de M (projection sur l'axe horizontal)</li>\n  <li>sin θ = ordonnée de M (projection sur l'axe vertical)</li>\n  <li><strong>cos²θ + sin²θ = 1</strong></li>\n</ul>"
          },
          {
            "title": "Valeurs remarquables et formules",
            "tag": "Trigonométrie",
            "content": "<h4>Valeurs remarquables</h4>\n<table style=\"width:100%;text-align:center;color:var(--muted);font-size:.85rem;border-collapse:collapse\">\n  <tr style=\"border-bottom:1px solid var(--border)\"><th>θ</th><th>0</th><th>π/6</th><th>π/4</th><th>π/3</th><th>π/2</th></tr>\n  <tr style=\"border-bottom:1px solid var(--border)\"><td>cos θ</td><td>1</td><td>√3/2</td><td>√2/2</td><td>1/2</td><td>0</td></tr>\n  <tr><td>sin θ</td><td>0</td><td>1/2</td><td>√2/2</td><td>√3/2</td><td>1</td></tr>\n</table>\n<h4>Formules utiles</h4>\n<ul>\n  <li><strong>cos(−θ) = cos θ</strong> (cosinus est pair)</li>\n  <li><strong>sin(−θ) = −sin θ</strong> (sinus est impair)</li>\n  <li><strong>cos(π − θ) = −cos θ</strong></li>\n  <li><strong>sin(π − θ) = sin θ</strong></li>\n  <li><strong>cos(π + θ) = −cos θ</strong></li>\n  <li><strong>sin(π + θ) = −sin θ</strong></li>\n</ul>\n<div class=\"key-point\">📌 Retenir : cos²θ + sin²θ = <strong>1</strong> (identité fondamentale).</div>"
          }
        ],
        "quiz": [
          {
            "q": "Combien vaut π/3 en degrés ?",
            "options": [
              "30°",
              "45°",
              "60°",
              "90°"
            ],
            "correct": 2,
            "expl": "π/3 = <strong>60°</strong> (180°/3)."
          },
          {
            "q": "cos(π/4) = ?",
            "options": [
              "1/2",
              "√2/2",
              "√3/2",
              "1"
            ],
            "correct": 1,
            "expl": "cos(45°) = cos(π/4) = <strong>√2/2</strong>."
          },
          {
            "q": "sin(−θ) = ?",
            "options": [
              "sin θ",
              "−sin θ",
              "cos θ",
              "−cos θ"
            ],
            "correct": 1,
            "expl": "Le sinus est <strong>impair</strong> : sin(−θ) = <strong>−sin θ</strong>."
          },
          {
            "q": "cos²θ + sin²θ = ?",
            "options": [
              "0",
              "1",
              "2",
              "θ"
            ],
            "correct": 1,
            "expl": "Identité fondamentale de la trigonométrie : cos²θ + sin²θ = <strong>1</strong>."
          },
          {
            "q": "sin(π/2) = ?",
            "options": [
              "0",
              "1/2",
              "√2/2",
              "1"
            ],
            "correct": 3,
            "expl": "sin(90°) = sin(π/2) = <strong>1</strong>."
          },
          {
            "q": "cos(π) = ?",
            "options": [
              "1",
              "0",
              "−1",
              "−1/2"
            ],
            "correct": 2,
            "expl": "cos(180°) = cos(π) = <strong>−1</strong>."
          }
        ],
        "flashcards": [
          {
            "front": "Conversion : 180° = ?",
            "back": "<strong>180° = π radians</strong>. Donc 90° = π/2, 60° = π/3, 45° = π/4, 30° = π/6."
          },
          {
            "front": "cos²θ + sin²θ = ?",
            "back": "<strong>1</strong>. C'est l'identité fondamentale de la trigonométrie."
          },
          {
            "front": "Valeurs de cos(π/3) et sin(π/3) ?",
            "back": "cos(π/3) = <strong>1/2</strong>, sin(π/3) = <strong>√3/2</strong>."
          },
          {
            "front": "Parité de cos et sin ?",
            "back": "<strong>cos</strong> est pair : cos(−θ) = cos θ. <strong>sin</strong> est impair : sin(−θ) = −sin θ."
          }
        ]
      },
      "expo": {
        "label": "Fonction exponentielle",
        "icon": "fa-arrow-trend-up",
        "fiches": [
          {
            "title": "La fonction exponentielle",
            "tag": "Analyse",
            "content": "<h4>Définition</h4>\n<p>La fonction <strong>exponentielle</strong> est l'unique fonction f dérivable sur ℝ telle que f' = f et f(0) = 1.</p>\n<p>On la note <strong>exp(x) = eˣ</strong> avec e ≈ 2,718.</p>\n<h4>Propriétés algébriques</h4>\n<div class=\"key-point\">📌 L'exponentielle transforme les <strong>sommes en produits</strong> :</div>\n<ul>\n  <li><strong>eᵃ⁺ᵇ = eᵃ × eᵇ</strong></li>\n  <li><strong>eᵃ⁻ᵇ = eᵃ / eᵇ</strong></li>\n  <li><strong>(eᵃ)ⁿ = eⁿᵃ</strong></li>\n  <li><strong>e⁰ = 1</strong></li>\n  <li><strong>e⁻ᵃ = 1/eᵃ</strong></li>\n</ul>\n<h4>Propriétés de la fonction</h4>\n<ul>\n  <li><strong>eˣ > 0</strong> pour tout x (jamais nulle !)</li>\n  <li>(eˣ)' = <strong>eˣ</strong> (elle est sa propre dérivée)</li>\n  <li>Strictement <strong>croissante</strong> sur ℝ</li>\n  <li>lim (x→+∞) eˣ = <strong>+∞</strong></li>\n  <li>lim (x→−∞) eˣ = <strong>0</strong></li>\n</ul>\n<h4>Équations avec exp</h4>\n<ul>\n  <li>eˣ = eᵃ ⟺ <strong>x = a</strong></li>\n  <li>eˣ > eᵃ ⟺ <strong>x > a</strong> (car exp est croissante)</li>\n</ul>"
          }
        ],
        "quiz": [
          {
            "q": "e⁰ = ?",
            "options": [
              "0",
              "1",
              "e",
              "−1"
            ],
            "correct": 1,
            "expl": "<strong>e⁰ = 1</strong> (propriété fondamentale)."
          },
          {
            "q": "La dérivée de eˣ est :",
            "options": [
              "xeˣ⁻¹",
              "1/eˣ",
              "eˣ",
              "xe"
            ],
            "correct": 2,
            "expl": "L'exponentielle est sa propre dérivée : <strong>(eˣ)' = eˣ</strong>."
          },
          {
            "q": "eˣ est toujours :",
            "options": [
              "Négatif",
              "Nul",
              "Positif",
              "Pair"
            ],
            "correct": 2,
            "expl": "<strong>eˣ > 0</strong> pour tout réel x. L'exponentielle ne s'annule jamais."
          },
          {
            "q": "e² × e³ = ?",
            "options": [
              "e⁶",
              "e⁵",
              "e²³",
              "2e⁵"
            ],
            "correct": 1,
            "expl": "eᵃ × eᵇ = eᵃ⁺ᵇ = e²⁺³ = <strong>e⁵</strong>."
          },
          {
            "q": "Si eˣ = e⁷, alors x = ?",
            "options": [
              "7",
              "e⁷",
              "ln 7",
              "1/7"
            ],
            "correct": 0,
            "expl": "exp est injective : eˣ = eᵃ ⟺ <strong>x = a</strong>. Donc x = 7."
          },
          {
            "q": "lim (x→−∞) eˣ = ?",
            "options": [
              "+∞",
              "1",
              "0",
              "−∞"
            ],
            "correct": 2,
            "expl": "Quand x tend vers −∞, eˣ tend vers <strong>0</strong> (par valeurs positives)."
          }
        ],
        "flashcards": [
          {
            "front": "Propriété fondamentale de exp ?",
            "back": "Unique fonction telle que <strong>f' = f</strong> et <strong>f(0) = 1</strong>."
          },
          {
            "front": "eᵃ × eᵇ = ?",
            "back": "<strong>eᵃ⁺ᵇ</strong>. L'exponentielle transforme les sommes en produits."
          },
          {
            "front": "eˣ est-elle toujours positive ?",
            "back": "<strong>Oui</strong>. eˣ > 0 pour tout x ∈ ℝ. Elle ne s'annule jamais."
          },
          {
            "front": "Limites de eˣ ?",
            "back": "lim (x→+∞) eˣ = <strong>+∞</strong>. lim (x→−∞) eˣ = <strong>0</strong>."
          }
        ]
      },
      "geometrie": {
        "label": "Géométrie repérée",
        "icon": "fa-vector-square",
        "fiches": [
          {
            "title": "Produit scalaire",
            "tag": "Géométrie",
            "content": "<h4>Définition</h4>\n<p>Le produit scalaire de deux vecteurs u⃗ et v⃗ est un <strong>nombre réel</strong>.</p>\n<h4>Les formules</h4>\n<ul>\n  <li><strong>u⃗ · v⃗ = ‖u⃗‖ × ‖v⃗‖ × cos(u⃗, v⃗)</strong></li>\n  <li>Avec coordonnées : <strong>u⃗ · v⃗ = xx' + yy'</strong> (si u⃗(x;y) et v⃗(x';y'))</li>\n  <li><strong>u⃗ · v⃗ = ½(‖u⃗+v⃗‖² − ‖u⃗‖² − ‖v⃗‖²)</strong></li>\n</ul>\n<h4>Propriétés</h4>\n<ul>\n  <li>u⃗ · v⃗ = 0 ⟺ u⃗ ⊥ v⃗ (ou l'un est nul)</li>\n  <li>u⃗ · u⃗ = ‖u⃗‖² (norme au carré)</li>\n</ul>\n<div class=\"key-point\">📌 Le produit scalaire sert à prouver la <strong>perpendicularité</strong> : si u⃗ · v⃗ = 0 alors u⃗ ⊥ v⃗.</div>"
          },
          {
            "title": "Équation de droite et de cercle",
            "tag": "Géométrie",
            "content": "<h4>Équation de droite</h4>\n<ul>\n  <li>Forme cartésienne : <strong>ax + by + c = 0</strong></li>\n  <li>Forme réduite : <strong>y = mx + p</strong> (m = pente, p = ordonnée à l'origine)</li>\n  <li>Vecteur directeur de ax + by + c = 0 : <strong>u⃗(−b ; a)</strong></li>\n  <li>Vecteur normal : <strong>n⃗(a ; b)</strong></li>\n</ul>\n<h4>Équation de cercle</h4>\n<p>Cercle de centre Ω(a ; b) et de rayon r :</p>\n<div class=\"key-point\">📌 <strong>(x − a)² + (y − b)² = r²</strong></div>\n<h4>Distance entre deux points</h4>\n<p>A(xₐ ; yₐ) et B(x_b ; y_b) : <strong>AB = √[(x_b−xₐ)² + (y_b−yₐ)²]</strong></p>"
          }
        ],
        "quiz": [
          {
            "q": "Si u⃗(3;4) et v⃗(−4;3), alors u⃗ · v⃗ = ?",
            "options": [
              "0",
              "24",
              "−24",
              "7"
            ],
            "correct": 0,
            "expl": "u⃗ · v⃗ = 3×(−4) + 4×3 = −12 + 12 = <strong>0</strong>. Les vecteurs sont perpendiculaires."
          },
          {
            "q": "u⃗ · v⃗ = 0 signifie que :",
            "options": [
              "u et v sont colinéaires",
              "u et v sont perpendiculaires",
              "u est nul",
              "v est nul"
            ],
            "correct": 1,
            "expl": "Produit scalaire nul ⟺ vecteurs <strong>perpendiculaires</strong> (ou l'un est le vecteur nul)."
          },
          {
            "q": "L'équation d'un cercle de centre (2;3) et rayon 5 est :",
            "options": [
              "(x−2)²+(y−3)²=25",
              "(x+2)²+(y+3)²=25",
              "(x−2)²+(y−3)²=5",
              "x²+y²=25"
            ],
            "correct": 0,
            "expl": "<strong>(x − 2)² + (y − 3)² = 25</strong> (r² = 5² = 25)."
          },
          {
            "q": "Le vecteur normal de 3x − 2y + 1 = 0 est :",
            "options": [
              "(−2 ; 3)",
              "(2 ; 3)",
              "(3 ; −2)",
              "(−3 ; 2)"
            ],
            "correct": 2,
            "expl": "Pour ax + by + c = 0, le vecteur normal est <strong>n⃗(a ; b) = (3 ; −2)</strong>."
          },
          {
            "q": "Distance entre A(1;2) et B(4;6) ?",
            "options": [
              "5",
              "7",
              "25",
              "√7"
            ],
            "correct": 0,
            "expl": "AB = √[(4−1)² + (6−2)²] = √[9+16] = √25 = <strong>5</strong>."
          }
        ],
        "flashcards": [
          {
            "front": "Formule du produit scalaire avec coordonnées ?",
            "back": "u⃗(x;y) et v⃗(x';y') : <strong>u⃗ · v⃗ = xx' + yy'</strong>"
          },
          {
            "front": "u⃗ · v⃗ = 0 signifie ?",
            "back": "Les vecteurs sont <strong>perpendiculaires</strong> (orthogonaux)."
          },
          {
            "front": "Équation du cercle ?",
            "back": "Centre (a;b), rayon r : <strong>(x−a)² + (y−b)² = r²</strong>"
          },
          {
            "front": "Formule de la distance AB ?",
            "back": "<strong>AB = √[(x_b−xₐ)² + (y_b−yₐ)²]</strong>"
          }
        ]
      }
    }
  },
  "bac_francais": {
    "label": "Bac Français",
    "subjects": {
      "poesie": {
        "label": "Poésie — Rimbaud",
        "icon": "fa-feather-pointed",
        "fiches": [
          {
            "title": "Les Cahiers de Douai — Vue d'ensemble",
            "tag": "Œuvre intégrale",
            "content": "<p><strong>Recueil de 22 poèmes</strong> écrits par Rimbaud à 16 ans en 1870, lors de ses fugues. Confiés à son ami Demeny à Douai. Témoignage d'un adolescent révolté qui s'invente comme poète en rupture totale avec la norme bourgeoise et académique.</p>\n<h4 style=\"margin:16px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:.8px;color:var(--accent2)\">Personnages / voix poétiques</h4>\n<div class=\"bf-perso-grid\">\n<div class=\"bf-perso-card\"><strong>Le \"je\" lyrique</strong><span>Adolescent vagabond, révolté, sensuel. Se construit contre les normes, revendique sa liberté absolue.</span></div>\n<div class=\"bf-perso-card\"><strong>La nature</strong><span>Refuge, muse et miroir de la liberté poétique. Complice du poète errant.</span></div>\n<div class=\"bf-perso-card\"><strong>La société / la guerre</strong><span>Décrite avec ironie ou horreur (Le Dormeur du val). Objet de la révolte rimbaldienne.</span></div>\n</div>\n<h4 style=\"margin:16px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:.8px;color:var(--accent2)\">Thèmes</h4>\n<div class=\"bf-theme-tags\"><span>Émancipation</span><span>Liberté</span><span>Révolte</span><span>Corps & sensualité</span><span>Guerre & violence</span><span>Création poétique</span></div>\n<h4 style=\"margin:16px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:.8px;color:var(--accent2)\">Citations clés</h4>\n<div class=\"bf-citation\">\"Je m'en allais, les poings dans mes poches crevées\" <em>— Émancipation, liberté du vagabond</em></div>\n<div class=\"bf-citation teal\">\"Il a deux trous rouges au côté droit\" <em>— Ironie tragique du Dormeur du val</em></div>\n<div class=\"bf-citation coral\">\"Belle hideusement d'un ulcère à l'anus\" <em>— Subversion esthétique, Vénus anadyomène</em></div>"
          },
          {
            "title": "Ma Bohême (EL 1)",
            "tag": "Explication linéaire",
            "content": "<p class=\"bf-badge bf-purple\">Explication linéaire 1 — Poésie</p>\n<p><em>Sonnet en alexandrins.</em> Le poète célèbre sa liberté de vagabond et invente son identité de poète en rupture. L'errance devient une posture créatrice.</p>\n<div class=\"bf-steps\">\n<div class=\"bf-step\"><span class=\"bf-num\">1</span><span>Quatrain 1 — Portrait du poète vagabond : errance, pauvreté volontairement revendiquée</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">2</span><span>Quatrain 2 — La nature comme espace de liberté et d'inspiration infinie</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">3</span><span>Tercet 1 — Le poète à l'écoute du monde : sensations, éveil lyrique</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">4</span><span>Tercet 2 — La création poétique naît de l'errance elle-même</span></div>\n</div>\n<div class=\"bf-citation\">\"Je m'en allais, les poings dans mes poches crevées\" <em>— Incipit énergique, rupture immédiate</em></div>\n<div class=\"bf-citation teal\">\"Petit-Poucet rêveur, j'égrenais des rimes\" <em>— La marche engendre le poème</em></div>\n<div class=\"bf-citation coral\">\"Comme des lyres, je tirais les élastiques / De mes souliers blessés\" <em>— Métaphore créatrice</em></div>"
          },
          {
            "title": "Le Dormeur du val (EL 2)",
            "tag": "Explication linéaire",
            "content": "<p class=\"bf-badge bf-purple\">Explication linéaire 2 — Poésie</p>\n<p><em>Sonnet · guerre franco-prussienne, oct. 1870.</em> Ironie tragique : la beauté du paysage contraste avec la violence révélée au dernier vers seulement.</p>\n<div class=\"bf-steps\">\n<div class=\"bf-step\"><span class=\"bf-num\">1</span><span>Quatrain 1 — Tableau pastoral idyllique : nature lumineuse et accueillante</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">2</span><span>Quatrain 2 — Portrait du soldat : il semble dormir, la nature le berce</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">3</span><span>Tercet 1 — Signes d'inquiétude : froid, pâleur, immobilité suspecte</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">4</span><span>Tercet 2 — Chute : \"deux trous rouges\" — révélation brutale de la mort</span></div>\n</div>\n<div class=\"bf-citation\">\"C'est un trou de verdure où chante une rivière\" <em>— Euphémisme inaugural</em></div>\n<div class=\"bf-citation teal\">\"Tranquille. Il a deux trous rouges au côté droit.\" <em>— Chute, rupture brutale</em></div>\n<div class=\"bf-citation coral\">\"La nature, berce-le chaudement : il a froid\" <em>— Prosopopée, impuissance face à la mort</em></div>"
          },
          {
            "title": "Vénus anadyomène (EL 3)",
            "tag": "Explication linéaire",
            "content": "<p class=\"bf-badge bf-purple\">Explication linéaire 3 — Poésie</p>\n<p><em>Sonnet · détournement mythologique.</em> Rimbaud s'affranchit des canons esthétiques. Le laid devient matière poétique.</p>\n<div class=\"bf-steps\">\n<div class=\"bf-step\"><span class=\"bf-num\">1</span><span>Quatrain 1 — Sortie du bain : corps féminin qui émerge, comparaisons dégradantes</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">2</span><span>Quatrain 2 — Portrait physique satirique et cru, accumulation de défauts</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">3</span><span>Tercet 1 — Corps vu de dos, continuation grotesque</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">4</span><span>Tercet 2 — Chute : \"Belle hideusement d'un ulcère à l'anus\"</span></div>\n</div>\n<div class=\"bf-citation\">\"Comme d'un cercueil vert en fer-blanc, une tête\" <em>— La baignoire = cercueil, anti-naissance</em></div>\n<div class=\"bf-citation teal\">\"Belle hideusement d'un ulcère à l'anus\" <em>— Oxymore final, subversion totale</em></div>"
          },
          {
            "title": "L'Huître — Ponge (EL 4 associé)",
            "tag": "Texte associé",
            "content": "<p class=\"bf-badge bf-purple\">Texte associé EL4 — Le Parti pris des choses, 1942</p>\n<p>Ponge décrit l'huître avec précision quasi-scientifique et une langue inventive. Poème en prose. Émancipation créatrice par le regard neuf posé sur l'objet le plus banal.</p>\n<div class=\"bf-steps\">\n<div class=\"bf-step\"><span class=\"bf-num\">1</span><span>L'extérieur : dureté, opacité, résistance au monde</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">2</span><span>L'ouverture : violence, effort — accès difficile à l'intérieur</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">3</span><span>L'intérieur : monde nacré, vivant — beauté cachée révélée</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">4</span><span>La perle : rareté — la beauté est aléatoire, comme le poème</span></div>\n</div>\n<div class=\"bf-citation\">\"formule, tenant à la fois du nacre et du plomb\" <em>— Oxymore, alliance du beau et du lourd</em></div>\n<div class=\"bf-citation teal\">\"Parfois très rare une formule perle à leur gosier de nacre\" <em>— La perle = métaphore du poème</em></div>"
          }
        ],
        "quiz": [
          {
            "q": "En quelle année Rimbaud écrit-il les poèmes des Cahiers de Douai ?",
            "options": [
              "1868",
              "1870",
              "1873",
              "1880"
            ],
            "correct": 1,
            "expl": "Rimbaud écrit ces 22 poèmes en 1870, à l'âge de 16 ans, lors de ses fugues."
          },
          {
            "q": "Quel est le parcours associé aux Cahiers de Douai ?",
            "options": [
              "Personnages en marge",
              "Défendre la liberté",
              "Émancipations créatrices",
              "Les jeux du cœur"
            ],
            "correct": 2,
            "expl": "Le parcours est \"Émancipations créatrices\" : Rimbaud s'invente poète en rupture totale avec les normes."
          },
          {
            "q": "Quel est le procédé dominant du Dormeur du val ?",
            "options": [
              "La métaphore",
              "L'ironie tragique",
              "L'hyperbole",
              "L'anaphore"
            ],
            "correct": 1,
            "expl": "L'ironie tragique : tout le poème suggère le sommeil, et la chute révèle brutalement la mort."
          },
          {
            "q": "Quel mythe Rimbaud détourne-t-il dans Vénus anadyomène ?",
            "options": [
              "Méduse",
              "Aphrodite naissant des eaux",
              "Diane chasseresse",
              "Pénélope"
            ],
            "correct": 1,
            "expl": "Rimbaud détourne le mythe de Vénus (Aphrodite) naissant des eaux pour subvertir les canons esthétiques."
          }
        ],
        "flashcards": [
          {
            "front": "\"Je m'en allais, les poings dans mes poches crevées\"",
            "back": "Ma Bohême — Rimbaud · Incipit de liberté et de révolte, posture du poète vagabond"
          },
          {
            "front": "\"Il a deux trous rouges au côté droit.\"",
            "back": "Le Dormeur du val — Rimbaud · Chute ironie tragique, révélation de la mort, anti-guerre"
          },
          {
            "front": "\"Belle hideusement d'un ulcère à l'anus\"",
            "back": "Vénus anadyomène — Rimbaud · Oxymore subversif, émancipation par la laideur"
          },
          {
            "front": "Parcours des Cahiers de Douai",
            "back": "Émancipations créatrices"
          },
          {
            "front": "Nombre de poèmes dans les Cahiers de Douai",
            "back": "22 poèmes écrits en 1870"
          }
        ]
      },
      "roman": {
        "label": "Roman — Prévost",
        "icon": "fa-book",
        "fiches": [
          {
            "title": "Manon Lescaut — Vue d'ensemble",
            "tag": "Œuvre intégrale",
            "content": "<p><strong>Roman-mémoires de l'abbé Prévost (1731)</strong>. Des Grieux raconte sa passion dévastatrice pour Manon Lescaut. Personnages en marge de la société et de la morale. L'amour est vécu comme une fatalité incontrôlable.</p>\n<div class=\"bf-perso-grid\">\n<div class=\"bf-perso-card\"><strong>Des Grieux</strong><span>Narrateur. Jeune noble ruiné par sa passion. Voix subjective qui justifie tout.</span></div>\n<div class=\"bf-perso-card\"><strong>Manon</strong><span>Énigme du roman. Belle, ambivalente, oscille entre amour sincère et pragmatisme de survie.</span></div>\n<div class=\"bf-perso-card\"><strong>Tiberge</strong><span>Ami vertueux. Voix de la raison et de la religion. Repoussoir moral.</span></div>\n</div>\n<div class=\"bf-theme-tags\"><span>Passion fatale</span><span>Personnage en marge</span><span>Fatalité amoureuse</span><span>Déchéance sociale</span><span>Narration subjective</span></div>\n<div class=\"bf-citation\">\"Je me trouvai enflammé tout d'un coup jusqu'au transport\" <em>— Coup de foudre, fatalité de la passion</em></div>\n<div class=\"bf-citation teal\">\"Je l'aimais trop pour ne vouloir pas lui rendre service\" <em>— Rationalisation de la passion, aveuglement</em></div>"
          },
          {
            "title": "La rencontre à Amiens (EL 5)",
            "tag": "Explication linéaire",
            "content": "<p class=\"bf-badge bf-teal\">Explication linéaire 5 — Roman</p>\n<p>Scène fondatrice : coup de foudre de Des Grieux pour Manon à Amiens. Manon est déjà \"en marge\" (conduite au couvent de force).</p>\n<div class=\"bf-steps\">\n<div class=\"bf-step\"><span class=\"bf-num\">1</span><span>Arrivée de la charrette — Des Grieux spectateur, mise en scène de la première vue</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">2</span><span>Premier regard sur Manon — portrait sensoriel, coup de foudre immédiat</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">3</span><span>Conversation — Manon révèle son intelligence et son désir de liberté</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">4</span><span>Résolution de Des Grieux — décision de la faire fuir, abandon de sa vie d'avant</span></div>\n</div>\n<div class=\"bf-citation\">\"Je me trouvai enflammé tout d'un coup jusqu'au transport\" <em>— Fatalité de la passion</em></div>\n<div class=\"bf-citation teal\">\"Quoiqu'elle fût encore moins âgée que moi, elle recevait mes politesses sans paraître embarrassée\" <em>— Portrait de Manon, liberté naturelle</em></div>"
          },
          {
            "title": "L'évasion de Saint-Lazare (EL 6)",
            "tag": "Explication linéaire",
            "content": "<p class=\"bf-badge bf-teal\">Explication linéaire 6 — Roman</p>\n<p>Des Grieux va jusqu'au meurtre pour s'évader. La passion le fait franchir les limites de la morale.</p>\n<div class=\"bf-steps\">\n<div class=\"bf-step\"><span class=\"bf-num\">1</span><span>Préparation — complicité avec Lescaut, manipulation du supérieur</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">2</span><span>L'action — violence et mort du portier, transgression morale définitive</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">3</span><span>La fuite — exaltation, sentiment de liberté retrouvée</span></div>\n</div>\n<div class=\"bf-citation\">\"Je lui passai mon épée au travers du corps\" <em>— Transgression morale, Des Grieux devient criminel</em></div>\n<div class=\"bf-citation teal\">\"Je me retrouvai libre et heureux\" <em>— Paradoxe, liberté criminelle comme bonheur</em></div>"
          },
          {
            "title": "La mort de Manon (EL 7)",
            "tag": "Explication linéaire",
            "content": "<p class=\"bf-badge bf-teal\">Explication linéaire 7 — Roman</p>\n<p>Dénouement. Manon meurt dans le désert américain. Scène pathétique : pour la première fois, les amants sont vraiment réunis, hors de la société. Manon devient mythe.</p>\n<div class=\"bf-steps\">\n<div class=\"bf-step\"><span class=\"bf-num\">1</span><span>L'agonie de Manon — Des Grieux assiste impuissant</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">2</span><span>La mort — Manon meurt en aimant Des Grieux. Pathétisme maximal.</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">3</span><span>Le deuil — enterrement dans le désert, Manon mythifiée</span></div>\n</div>\n<div class=\"bf-citation\">\"Elle expira entre mes bras\" <em>— Mort de Manon, concision déchirante</em></div>\n<div class=\"bf-citation teal\">\"Elle était si belle, même en mourant\" <em>— Mythification, la beauté perdure</em></div>"
          },
          {
            "title": "L'Étranger — Camus (EL 8 associé)",
            "tag": "Texte associé",
            "content": "<p class=\"bf-badge bf-teal\">Texte associé EL8 — L'Étranger, 1942</p>\n<p>Meursault assiste à l'enterrement de sa mère avec une indifférence apparente qui le rend étranger aux normes sociales.</p>\n<div class=\"bf-citation\">\"Aujourd'hui, maman est morte. Ou peut-être hier, je ne sais pas.\" <em>— Incipit célèbre, indifférence apparente, marginalité</em></div>\n<div class=\"bf-citation teal\">\"Cela ne voulait rien dire.\" <em>— Absurde, refus des valeurs sociales conventionnelles</em></div>"
          }
        ],
        "quiz": [
          {
            "q": "Qui est le narrateur de Manon Lescaut ?",
            "options": [
              "Manon",
              "L'abbé Prévost",
              "Des Grieux",
              "Tiberge"
            ],
            "correct": 2,
            "expl": "Des Grieux est le narrateur : il raconte l'histoire de sa passion en rétrospective, ce qui crée une narration subjective."
          },
          {
            "q": "Quel est le parcours associé à Manon Lescaut ?",
            "options": [
              "Émancipations créatrices",
              "Personnages en marge, du roman au mythe",
              "Les jeux du cœur",
              "Défendre la liberté"
            ],
            "correct": 1,
            "expl": "Le parcours est \"Personnages en marge, du roman au mythe\" : Manon et Des Grieux transgressent les normes sociales et morales."
          },
          {
            "q": "Où meurt Manon dans le roman ?",
            "options": [
              "À Paris",
              "À Bordeaux",
              "Dans le désert de Louisiane",
              "En prison"
            ],
            "correct": 2,
            "expl": "Manon meurt dans le désert américain (Louisiane), lieu symbolique de leur amour épuré hors de la société."
          },
          {
            "q": "Quel personnage représente la voix de la raison et de la religion ?",
            "options": [
              "Lescaut",
              "Des Grieux",
              "M. de G. M.",
              "Tiberge"
            ],
            "correct": 3,
            "expl": "Tiberge est l'ami vertueux de Des Grieux, voix de la raison et de la religion, repoussoir moral."
          }
        ],
        "flashcards": [
          {
            "front": "\"Je me trouvai enflammé tout d'un coup jusqu'au transport\"",
            "back": "Manon Lescaut — Prévost · Coup de foudre à Amiens, fatalité de la passion"
          },
          {
            "front": "\"Elle expira entre mes bras\"",
            "back": "Manon Lescaut — Prévost · Mort de Manon dans le désert de Louisiane, scène pathétique"
          },
          {
            "front": "Parcours de Manon Lescaut",
            "back": "Personnages en marge, du roman au mythe"
          },
          {
            "front": "Qui raconte Manon Lescaut ?",
            "back": "Le chevalier Des Grieux — narration rétrospective et subjective"
          },
          {
            "front": "\"Aujourd'hui, maman est morte. Ou peut-être hier, je ne sais pas.\"",
            "back": "L'Étranger — Camus · Incipit célèbre, indifférence apparente, marginalité de Meursault"
          }
        ]
      },
      "theatre": {
        "label": "Théâtre — Musset",
        "icon": "fa-masks-theater",
        "fiches": [
          {
            "title": "On ne badine pas avec l'amour — Vue d'ensemble",
            "tag": "Œuvre intégrale",
            "content": "<p><strong>Pièce romantique en 3 actes (1834)</strong>. Perdican et Camille se retrouvent au château après des années de séparation. Leur amour se heurte aux jeux du cœur et de la parole. Le dénouement est tragique : Rosette meurt en entendant l'aveu de Camille.</p>\n<div class=\"bf-perso-grid\">\n<div class=\"bf-perso-card\"><strong>Perdican</strong><span>Jeune noble brillant. Use de la rhétorique. Sincère mais orgueilleux.</span></div>\n<div class=\"bf-perso-card\"><strong>Camille</strong><span>Revenue du couvent. Se protège derrière la froideur. Son aveu arrive trop tard.</span></div>\n<div class=\"bf-perso-card\"><strong>Rosette</strong><span>Sœur de lait de Camille. Innocente. Victime des jeux des nobles.</span></div>\n</div>\n<div class=\"bf-theme-tags\"><span>Jeux du cœur</span><span>Jeux de la parole</span><span>Amour et masque</span><span>Tragédie romantique</span><span>Aveu tardif</span></div>\n<div class=\"bf-citation\">\"On ne badine pas avec l'amour\" <em>— Titre-morale, la légèreté a des conséquences tragiques</em></div>\n<div class=\"bf-citation teal\">\"Je t'aimais, et je ne voulais pas le dire\" <em>— Aveu trop tard, la parole libérée détruit</em></div>"
          },
          {
            "title": "Les retrouvailles (EL 9)",
            "tag": "Explication linéaire",
            "content": "<p class=\"bf-badge bf-coral\">Explication linéaire 9 — Théâtre · Acte I, scène 2</p>\n<p>Première rencontre. Froideur apparente de Camille, déception de Perdican. La parole masque les sentiments.</p>\n<div class=\"bf-steps\">\n<div class=\"bf-step\"><span class=\"bf-num\">1</span><span>Accueil protocolaire — politesse froide, distance imposée par Camille</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">2</span><span>Perdican cherche la complicité ancienne — références nostalgiques</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">3</span><span>Rejet de Camille — la parole comme rempart</span></div>\n</div>\n<div class=\"bf-citation\">\"Tu es belle comme le jour.\" <em>— Compliment sincère, mais Camille ne répond pas à l'émotion</em></div>\n<div class=\"bf-citation teal\">\"C'est vrai, je ne suis plus la même.\" <em>— Masque, le couvent l'a armée contre l'amour</em></div>"
          },
          {
            "title": "La diatribe de Perdican (EL 10)",
            "tag": "Explication linéaire",
            "content": "<p class=\"bf-badge bf-coral\">Explication linéaire 10 — Théâtre · Acte II, scène 5</p>\n<p>Grand monologue romantique de Perdican. Éloquence, sincérité, orgueil blessé. La rhétorique sert-elle l'amour ou l'ego ?</p>\n<div class=\"bf-steps\">\n<div class=\"bf-step\"><span class=\"bf-num\">1</span><span>Attaque — Perdican accuse Camille de mensonge et de fausse sagesse</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">2</span><span>Éloge de l'amour et de la jeunesse — lyrisme romantique intense</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">3</span><span>Défi lancé à Camille — l'aimer ou n'avoir rien valu</span></div>\n</div>\n<div class=\"bf-citation\">\"Il y a quelque chose dans ce monde qui mérite qu'on pleure, c'est l'amour\" <em>— Lyrisme romantique de Perdican</em></div>\n<div class=\"bf-citation teal\">\"Tous les hommes sont menteurs, inconstants, faux…\" <em>— Jeux de la parole, retournement des leçons du couvent</em></div>"
          },
          {
            "title": "Le dénouement (EL 11)",
            "tag": "Explication linéaire",
            "content": "<p class=\"bf-badge bf-coral\">Explication linéaire 11 — Théâtre · Acte III, scènes 7-8</p>\n<p>Climax tragique : Camille avoue son amour, Rosette entend tout et meurt. La parole sincère arrive trop tard.</p>\n<div class=\"bf-steps\">\n<div class=\"bf-step\"><span class=\"bf-num\">1</span><span>L'aveu de Camille — elle cède, dit enfin son amour. Trop tard.</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">2</span><span>Mort de Rosette — prix des jeux du cœur</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">3</span><span>Séparation finale — anti-comédie romantique</span></div>\n</div>\n<div class=\"bf-citation\">\"Je t'aimais, et je ne voulais pas le dire — entends-tu, orgueilleux ?\" <em>— Aveu tardif, la sincérité détruit</em></div>\n<div class=\"bf-citation teal\">\"[Elle est morte.]\" (didascalie) <em>— Tragédie, le deuil clôt les jeux</em></div>"
          },
          {
            "title": "La scène du balcon — Cyrano (EL 12 associé)",
            "tag": "Texte associé",
            "content": "<p class=\"bf-badge bf-coral\">Texte associé EL12 — Cyrano de Bergerac, Rostand (1897)</p>\n<p>Cyrano, caché dans l'ombre, parle à Roxane à la place de Christian. La parole devient le visage.</p>\n<div class=\"bf-citation\">\"C'est mon âme, moi, que j'offre à vos pieds\" <em>— Cyrano dit la vérité sous le masque du mensonge</em></div>\n<div class=\"bf-citation teal\">\"La nuit, qui efface le factice, / Laisse voir ce qui est vrai\" <em>— L'obscurité révèle davantage que la lumière</em></div>"
          }
        ],
        "quiz": [
          {
            "q": "En quelle année Musset écrit-il On ne badine pas avec l'amour ?",
            "options": [
              "1830",
              "1833",
              "1834",
              "1840"
            ],
            "correct": 2,
            "expl": "La pièce est écrite et publiée en 1834, en plein romantisme."
          },
          {
            "q": "Qui est la victime innocente du dénouement ?",
            "options": [
              "Camille",
              "Perdican",
              "Rosette",
              "Dame Pluche"
            ],
            "correct": 2,
            "expl": "Rosette, sœur de lait de Camille, meurt en entendant l'aveu d'amour de Camille à Perdican."
          },
          {
            "q": "Quel est le parcours associé à cette pièce ?",
            "options": [
              "Émancipations créatrices",
              "Personnages en marge",
              "Les jeux du cœur et de la parole",
              "Défendre la liberté"
            ],
            "correct": 2,
            "expl": "Le parcours est \"Les jeux du cœur et de la parole\" : la pièce explore comment la parole masque et révèle les sentiments."
          },
          {
            "q": "Qui est l'auteur de Cyrano de Bergerac (texte associé) ?",
            "options": [
              "Victor Hugo",
              "Alfred de Musset",
              "Edmond Rostand",
              "Molière"
            ],
            "correct": 2,
            "expl": "Edmond Rostand écrit Cyrano de Bergerac en 1897."
          }
        ],
        "flashcards": [
          {
            "front": "\"On ne badine pas avec l'amour\"",
            "back": "Musset — Titre et morale : la légèreté amoureuse a des conséquences tragiques"
          },
          {
            "front": "\"Il y a quelque chose dans ce monde qui mérite qu'on pleure, c'est l'amour\"",
            "back": "On ne badine pas avec l'amour, Acte II — Diatribe de Perdican, lyrisme romantique"
          },
          {
            "front": "\"Je t'aimais, et je ne voulais pas le dire\"",
            "back": "On ne badine pas avec l'amour, Acte III — Aveu tardif de Camille, trop tard pour Rosette"
          },
          {
            "front": "Parcours de la pièce de Musset",
            "back": "Les jeux du cœur et de la parole"
          },
          {
            "front": "\"C'est mon âme, moi, que j'offre à vos pieds\"",
            "back": "Cyrano de Bergerac — Rostand · Scène du balcon, la parole remplace le visage"
          }
        ]
      },
      "idees": {
        "label": "Litt. d'idées — La Boétie",
        "icon": "fa-scroll",
        "fiches": [
          {
            "title": "Discours de la servitude volontaire — Vue d'ensemble",
            "tag": "Œuvre intégrale",
            "content": "<p><strong>Essai philosophique et politique (vers 1549)</strong> rédigé par La Boétie. Texte fondateur sur la liberté et la tyrannie. Question centrale : pourquoi les peuples acceptent-ils d'obéir à un tyran alors qu'ils sont plus nombreux ?</p>\n<div class=\"bf-steps\">\n<div class=\"bf-step\"><span class=\"bf-num\">1</span><span>La question centrale — le mystère de l'obéissance volontaire</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">2</span><span>La nature humaine — l'homme est naturellement libre, la servitude est contre-nature</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">3</span><span>Les causes — habitude, coutume, éducation corrompue, divertissement</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">4</span><span>Les mécanismes — réseau de complices, \"dons\" du tyran</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">5</span><span>L'amitié vraie comme antidote à la tyrannie</span></div>\n</div>\n<div class=\"bf-theme-tags\"><span>Liberté naturelle</span><span>Tyrannie</span><span>Servitude consentie</span><span>Résistance passive</span><span>Amitié vraie</span></div>\n<div class=\"bf-citation\">\"Soyez résolus de ne servir plus, et vous voilà libres\" <em>— La servitude ne tient qu'au consentement</em></div>\n<div class=\"bf-citation teal\">\"Les théâtres, les jeux, les spectacles — c'est l'appât de la servitude\" <em>— Le divertissement comme outil d'aliénation</em></div>"
          },
          {
            "title": "Le vice qu'on ne peut nommer (EL 13)",
            "tag": "Explication linéaire",
            "content": "<p class=\"bf-badge bf-amber\">Explication linéaire 13 — Litt. d'idées</p>\n<p>La Boétie analyse la nature profonde du tyran. Réquisitoire par le portrait moral dégradant.</p>\n<div class=\"bf-steps\">\n<div class=\"bf-step\"><span class=\"bf-num\">1</span><span>Portrait physique et moral du tyran — dégénérescence, lâcheté, dépravation</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">2</span><span>Le \"vice qu'on ne peut nommer\" — prétérition, insinuation de la corruption totale</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">3</span><span>Conclusion rhétorique — mépris affiché, le tyran ne mérite aucun respect</span></div>\n</div>\n<div class=\"bf-citation\">\"ce vice qu'on ne peut nommer\" <em>— Prétérition, nommer en disant qu'on ne peut pas nommer</em></div>\n<div class=\"bf-citation teal\">\"lâche, mou et efféminé\" <em>— Accumulation dégradante, portrait du tyran par ses vices</em></div>"
          },
          {
            "title": "Le secret de la tyrannie (EL 15)",
            "tag": "Explication linéaire",
            "content": "<p class=\"bf-badge bf-amber\">Explication linéaire 15 — Litt. d'idées</p>\n<p>La Boétie révèle le mécanisme de maintien de la tyrannie : un réseau de complices. Les tyrannisés participent à leur propre oppression.</p>\n<div class=\"bf-steps\">\n<div class=\"bf-step\"><span class=\"bf-num\">1</span><span>Le réseau de complices — le tyran crée des chaînes de faveurs</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">2</span><span>La chaîne de la tyrannie — chacun opprime le suivant</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">3</span><span>Conclusion — le peuple est l'instrument de sa propre servitude</span></div>\n</div>\n<div class=\"bf-citation\">\"Six ont six cents qui profitent sous eux, et font de leurs six cents ce que les six font au tyran\" <em>— Structure fractale du pouvoir</em></div>\n<div class=\"bf-citation teal\">\"Voilà le secret de toute la tyrannie\" <em>— Révélation rhétorique, posture de dénonciateur</em></div>"
          },
          {
            "title": "Le Loup et le Chien — La Fontaine (EL 16 associé)",
            "tag": "Texte associé",
            "content": "<p class=\"bf-badge bf-amber\">Texte associé EL16 — Fables, Livre I, fable 5 (1668)</p>\n<p>Un loup famélique refuse la vie confortable du chien quand il voit son collier. La liberté vaut mieux que le confort de la servitude.</p>\n<div class=\"bf-steps\">\n<div class=\"bf-step\"><span class=\"bf-num\">1</span><span>Rencontre — contraste entre loup maigre et chien gras</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">2</span><span>Proposition du chien — servir en échange de nourriture</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">3</span><span>La révélation du collier — le loup comprend le prix de la servitude</span></div>\n<div class=\"bf-step\"><span class=\"bf-num\">4</span><span>Refus du loup — il choisit la faim libre plutôt que la chaîne</span></div>\n</div>\n<div class=\"bf-citation\">\"Chemin faisant, il vit le col du Chien pelé\" <em>— Le collier révèle la servitude dissimulée</em></div>\n<div class=\"bf-citation teal\">\"Je ne voudrais pas même à ce prix un trésor\" <em>— Éloge de la liberté face aux richesses enchaînées</em></div>\n<div class=\"bf-citation coral\">\"Et le Loup s'enfuit, et court encore\" <em>— Chute dynamique, la fuite = la liberté en acte</em></div>"
          }
        ],
        "quiz": [
          {
            "q": "Vers quelle date La Boétie rédige-t-il le Discours de la servitude volontaire ?",
            "options": [
              "vers 1520",
              "vers 1549",
              "vers 1580",
              "en 1601"
            ],
            "correct": 1,
            "expl": "La Boétie rédige ce texte vers 1549, à environ 16-18 ans. Il sera publié posthumément."
          },
          {
            "q": "Selon La Boétie, quelle est la première cause de la servitude volontaire ?",
            "options": [
              "La peur",
              "La coutume",
              "L'argent",
              "L'ignorance"
            ],
            "correct": 1,
            "expl": "\"La première raison de la servitude volontaire, c'est la coutume\" — l'habitude éteint le désir de liberté."
          },
          {
            "q": "Quel est le parcours associé à l'œuvre de La Boétie ?",
            "options": [
              "Émancipations créatrices",
              "Les jeux du cœur",
              "Personnages en marge",
              "Défendre et entretenir la liberté"
            ],
            "correct": 3,
            "expl": "Le parcours est \"Défendre et entretenir la liberté\" — toute l'œuvre plaide pour la liberté contre la tyrannie."
          },
          {
            "q": "Que symbolise le collier dans Le Loup et le Chien de La Fontaine ?",
            "options": [
              "La richesse",
              "La servitude",
              "La force",
              "L'amitié"
            ],
            "correct": 1,
            "expl": "Le collier est le signe extérieur de la domination et de la servitude consentie du chien."
          }
        ],
        "flashcards": [
          {
            "front": "\"Soyez résolus de ne servir plus, et vous voilà libres\"",
            "back": "Discours de la servitude volontaire — La Boétie · La servitude ne tient qu'au consentement"
          },
          {
            "front": "\"Six ont six cents qui profitent sous eux\"",
            "back": "Discours de la servitude volontaire — La Boétie · Structure fractale du pouvoir, pyramide de la tyrannie"
          },
          {
            "front": "Parcours du Discours de la servitude volontaire",
            "back": "Défendre et entretenir la liberté"
          },
          {
            "front": "\"Et le Loup s'enfuit, et court encore\"",
            "back": "Le Loup et le Chien — La Fontaine · Chute dynamique, la fuite comme liberté en acte"
          },
          {
            "front": "\"ce vice qu'on ne peut nommer\"",
            "back": "Discours de la servitude volontaire — La Boétie · Prétérition, figure de rhétorique de l'insinuation"
          }
        ]
      }
    }
  }
};

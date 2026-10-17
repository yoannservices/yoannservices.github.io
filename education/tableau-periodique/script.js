/* ── Tableau Périodique Interactif – script.js ── */

const ELEMENTS = [
  {z:1,symbol:"H",name:"Hydrogène",mass:1.008,cat:"nonmetal",phase:"gas",group:1,period:1,col:1,eneg:2.20,config:"1s¹",desc:"Élément le plus léger et le plus abondant de l'univers. Composant principal de l'eau (H₂O)."},
  {z:2,symbol:"He",name:"Hélium",mass:4.003,cat:"noble-gas",phase:"gas",group:18,period:1,col:18,eneg:null,config:"1s²",desc:"Gaz noble incolore, très léger. Utilisé pour gonfler les ballons et dans la plongée."},
  {z:3,symbol:"Li",name:"Lithium",mass:6.941,cat:"alkali-metal",phase:"solid",group:1,period:2,col:1,eneg:0.98,config:"[He] 2s¹",desc:"Métal alcalin le plus léger. Utilisé dans les batteries rechargeables."},
  {z:4,symbol:"Be",name:"Béryllium",mass:9.012,cat:"alkaline-earth",phase:"solid",group:2,period:2,col:2,eneg:1.57,config:"[He] 2s²",desc:"Métal léger et rigide. Utilisé dans les alliages aérospatiaux."},
  {z:5,symbol:"B",name:"Bore",mass:10.81,cat:"metalloid",phase:"solid",group:13,period:2,col:13,eneg:2.04,config:"[He] 2s² 2p¹",desc:"Métalloïde dur utilisé dans le verre borosilicaté (Pyrex)."},
  {z:6,symbol:"C",name:"Carbone",mass:12.011,cat:"nonmetal",phase:"solid",group:14,period:2,col:14,eneg:2.55,config:"[He] 2s² 2p²",desc:"Base de la chimie organique et de la vie. Existe sous forme de diamant et graphite."},
  {z:7,symbol:"N",name:"Azote",mass:14.007,cat:"nonmetal",phase:"gas",group:15,period:2,col:15,eneg:3.04,config:"[He] 2s² 2p³",desc:"Compose 78% de l'atmosphère terrestre. Essentiel pour les protéines et l'ADN."},
  {z:8,symbol:"O",name:"Oxygène",mass:15.999,cat:"nonmetal",phase:"gas",group:16,period:2,col:16,eneg:3.44,config:"[He] 2s² 2p⁴",desc:"Essentiel à la respiration et à la combustion. Compose 21% de l'atmosphère."},
  {z:9,symbol:"F",name:"Fluor",mass:18.998,cat:"halogen",phase:"gas",group:17,period:2,col:17,eneg:3.98,config:"[He] 2s² 2p⁵",desc:"L'élément le plus électronégatif. Utilisé dans le dentifrice et le téflon."},
  {z:10,symbol:"Ne",name:"Néon",mass:20.180,cat:"noble-gas",phase:"gas",group:18,period:2,col:18,eneg:null,config:"[He] 2s² 2p⁶",desc:"Gaz noble qui produit une lumière rouge-orange dans les tubes lumineux."},
  {z:11,symbol:"Na",name:"Sodium",mass:22.990,cat:"alkali-metal",phase:"solid",group:1,period:3,col:1,eneg:0.93,config:"[Ne] 3s¹",desc:"Métal alcalin très réactif. Composant du sel de table (NaCl)."},
  {z:12,symbol:"Mg",name:"Magnésium",mass:24.305,cat:"alkaline-earth",phase:"solid",group:2,period:3,col:2,eneg:1.31,config:"[Ne] 3s²",desc:"Métal léger, brûle avec une flamme blanche intense. Essentiel aux enzymes."},
  {z:13,symbol:"Al",name:"Aluminium",mass:26.982,cat:"post-transition",phase:"solid",group:13,period:3,col:13,eneg:1.61,config:"[Ne] 3s² 3p¹",desc:"Métal léger et résistant à la corrosion. Le plus abondant de la croûte terrestre."},
  {z:14,symbol:"Si",name:"Silicium",mass:28.086,cat:"metalloid",phase:"solid",group:14,period:3,col:14,eneg:1.90,config:"[Ne] 3s² 3p²",desc:"Métalloïde semi-conducteur. Base de l'industrie électronique."},
  {z:15,symbol:"P",name:"Phosphore",mass:30.974,cat:"nonmetal",phase:"solid",group:15,period:3,col:15,eneg:2.19,config:"[Ne] 3s² 3p³",desc:"Essentiel à l'ADN et aux os. Existe en plusieurs formes allotropiques."},
  {z:16,symbol:"S",name:"Soufre",mass:32.065,cat:"nonmetal",phase:"solid",group:16,period:3,col:16,eneg:2.58,config:"[Ne] 3s² 3p⁴",desc:"Élément jaune à l'odeur caractéristique. Utilisé dans les engrais et l'acide sulfurique."},
  {z:17,symbol:"Cl",name:"Chlore",mass:35.453,cat:"halogen",phase:"gas",group:17,period:3,col:17,eneg:3.16,config:"[Ne] 3s² 3p⁵",desc:"Halogène verdâtre utilisé pour désinfecter l'eau et fabriquer le PVC."},
  {z:18,symbol:"Ar",name:"Argon",mass:39.948,cat:"noble-gas",phase:"gas",group:18,period:3,col:18,eneg:null,config:"[Ne] 3s² 3p⁶",desc:"Troisième gaz le plus abondant dans l'atmosphère. Utilisé dans les ampoules."},
  {z:19,symbol:"K",name:"Potassium",mass:39.098,cat:"alkali-metal",phase:"solid",group:1,period:4,col:1,eneg:0.82,config:"[Ar] 4s¹",desc:"Métal alcalin mou. Essentiel au fonctionnement des cellules nerveuses."},
  {z:20,symbol:"Ca",name:"Calcium",mass:40.078,cat:"alkaline-earth",phase:"solid",group:2,period:4,col:2,eneg:1.00,config:"[Ar] 4s²",desc:"Composant principal des os et des dents. Le 5ème élément le plus abondant."},
  {z:21,symbol:"Sc",name:"Scandium",mass:44.956,cat:"transition-metal",phase:"solid",group:3,period:4,col:3,eneg:1.36,config:"[Ar] 3d¹ 4s²",desc:"Métal de transition léger utilisé dans les alliages aluminium-scandium."},
  {z:22,symbol:"Ti",name:"Titane",mass:47.867,cat:"transition-metal",phase:"solid",group:4,period:4,col:4,eneg:1.54,config:"[Ar] 3d² 4s²",desc:"Métal léger, solide et résistant à la corrosion. Implants médicaux et aéronautique."},
  {z:23,symbol:"V",name:"Vanadium",mass:50.942,cat:"transition-metal",phase:"solid",group:5,period:4,col:5,eneg:1.63,config:"[Ar] 3d³ 4s²",desc:"Métal de transition utilisé pour renforcer l'acier."},
  {z:24,symbol:"Cr",name:"Chrome",mass:51.996,cat:"transition-metal",phase:"solid",group:6,period:4,col:6,eneg:1.66,config:"[Ar] 3d⁵ 4s¹",desc:"Métal brillant utilisé pour le chromage et l'acier inoxydable."},
  {z:25,symbol:"Mn",name:"Manganèse",mass:54.938,cat:"transition-metal",phase:"solid",group:7,period:4,col:7,eneg:1.55,config:"[Ar] 3d⁵ 4s²",desc:"Utilisé dans la production d'acier et les piles alcalines."},
  {z:26,symbol:"Fe",name:"Fer",mass:55.845,cat:"transition-metal",phase:"solid",group:8,period:4,col:8,eneg:1.83,config:"[Ar] 3d⁶ 4s²",desc:"Métal le plus utilisé au monde. Composant principal de l'acier et de l'hémoglobine."},
  {z:27,symbol:"Co",name:"Cobalt",mass:58.933,cat:"transition-metal",phase:"solid",group:9,period:4,col:9,eneg:1.88,config:"[Ar] 3d⁷ 4s²",desc:"Métal bleuté utilisé dans les aimants, batteries et pigments."},
  {z:28,symbol:"Ni",name:"Nickel",mass:58.693,cat:"transition-metal",phase:"solid",group:10,period:4,col:10,eneg:1.91,config:"[Ar] 3d⁸ 4s²",desc:"Métal résistant à la corrosion. Utilisé dans les pièces de monnaie."},
  {z:29,symbol:"Cu",name:"Cuivre",mass:63.546,cat:"transition-metal",phase:"solid",group:11,period:4,col:11,eneg:1.90,config:"[Ar] 3d¹⁰ 4s¹",desc:"Excellent conducteur électrique. Utilisé depuis l'Antiquité pour les outils et fils."},
  {z:30,symbol:"Zn",name:"Zinc",mass:65.38,cat:"transition-metal",phase:"solid",group:12,period:4,col:12,eneg:1.65,config:"[Ar] 3d¹⁰ 4s²",desc:"Métal utilisé pour galvaniser l'acier. Oligo-élément essentiel."},
  {z:31,symbol:"Ga",name:"Gallium",mass:69.723,cat:"post-transition",phase:"solid",group:13,period:4,col:13,eneg:1.81,config:"[Ar] 3d¹⁰ 4s² 4p¹",desc:"Métal qui fond dans la main (29,76°C). Utilisé dans les LED et semi-conducteurs."},
  {z:32,symbol:"Ge",name:"Germanium",mass:72.64,cat:"metalloid",phase:"solid",group:14,period:4,col:14,eneg:2.01,config:"[Ar] 3d¹⁰ 4s² 4p²",desc:"Semi-conducteur utilisé dans l'optique infrarouge et les transistors."},
  {z:33,symbol:"As",name:"Arsenic",mass:74.922,cat:"metalloid",phase:"solid",group:15,period:4,col:15,eneg:2.18,config:"[Ar] 3d¹⁰ 4s² 4p³",desc:"Métalloïde toxique historiquement connu comme poison. Utilisé dans les semi-conducteurs."},
  {z:34,symbol:"Se",name:"Sélénium",mass:78.96,cat:"nonmetal",phase:"solid",group:16,period:4,col:16,eneg:2.55,config:"[Ar] 3d¹⁰ 4s² 4p⁴",desc:"Oligo-élément essentiel. Utilisé dans les cellules photoélectriques."},
  {z:35,symbol:"Br",name:"Brome",mass:79.904,cat:"halogen",phase:"liquid",group:17,period:4,col:17,eneg:2.96,config:"[Ar] 3d¹⁰ 4s² 4p⁵",desc:"Seul non-métal liquide à température ambiante. Odeur forte et irritante."},
  {z:36,symbol:"Kr",name:"Krypton",mass:83.798,cat:"noble-gas",phase:"gas",group:18,period:4,col:18,eneg:3.00,config:"[Ar] 3d¹⁰ 4s² 4p⁶",desc:"Gaz noble utilisé dans certains lasers et éclairages photographiques."},
  {z:37,symbol:"Rb",name:"Rubidium",mass:85.468,cat:"alkali-metal",phase:"solid",group:1,period:5,col:1,eneg:0.82,config:"[Kr] 5s¹",desc:"Métal alcalin très réactif. Utilisé dans les horloges atomiques."},
  {z:38,symbol:"Sr",name:"Strontium",mass:87.62,cat:"alkaline-earth",phase:"solid",group:2,period:5,col:2,eneg:0.95,config:"[Kr] 5s²",desc:"Métal alcalino-terreux. Produit une flamme rouge en feux d'artifice."},
  {z:39,symbol:"Y",name:"Yttrium",mass:88.906,cat:"transition-metal",phase:"solid",group:3,period:5,col:3,eneg:1.22,config:"[Kr] 4d¹ 5s²",desc:"Utilisé dans les LED, supraconducteurs et lasers YAG."},
  {z:40,symbol:"Zr",name:"Zirconium",mass:91.224,cat:"transition-metal",phase:"solid",group:4,period:5,col:4,eneg:1.33,config:"[Kr] 4d² 5s²",desc:"Métal résistant à la corrosion utilisé dans les réacteurs nucléaires."},
  {z:41,symbol:"Nb",name:"Niobium",mass:92.906,cat:"transition-metal",phase:"solid",group:5,period:5,col:5,eneg:1.6,config:"[Kr] 4d⁴ 5s¹",desc:"Métal supraconducteur utilisé dans les alliages pour fusées et pipelines."},
  {z:42,symbol:"Mo",name:"Molybdène",mass:95.96,cat:"transition-metal",phase:"solid",group:6,period:5,col:6,eneg:2.16,config:"[Kr] 4d⁵ 5s¹",desc:"Métal à très haut point de fusion. Utilisé dans les aciers spéciaux."},
  {z:43,symbol:"Tc",name:"Technétium",mass:98,cat:"transition-metal",phase:"solid",group:7,period:5,col:7,eneg:1.9,config:"[Kr] 4d⁵ 5s²",desc:"Premier élément produit artificiellement. Radioactif. Utilisé en imagerie médicale."},
  {z:44,symbol:"Ru",name:"Ruthénium",mass:101.07,cat:"transition-metal",phase:"solid",group:8,period:5,col:8,eneg:2.2,config:"[Kr] 4d⁷ 5s¹",desc:"Métal du groupe du platine. Catalyseur et composant d'alliages durs."},
  {z:45,symbol:"Rh",name:"Rhodium",mass:102.906,cat:"transition-metal",phase:"solid",group:9,period:5,col:9,eneg:2.28,config:"[Kr] 4d⁸ 5s¹",desc:"Métal précieux très réfléchissant. Utilisé dans les pots catalytiques."},
  {z:46,symbol:"Pd",name:"Palladium",mass:106.42,cat:"transition-metal",phase:"solid",group:10,period:5,col:10,eneg:2.20,config:"[Kr] 4d¹⁰",desc:"Métal précieux du groupe du platine. Pots catalytiques et bijouterie."},
  {z:47,symbol:"Ag",name:"Argent",mass:107.868,cat:"transition-metal",phase:"solid",group:11,period:5,col:11,eneg:1.93,config:"[Kr] 4d¹⁰ 5s¹",desc:"Meilleur conducteur électrique et thermique. Bijouterie et photographie."},
  {z:48,symbol:"Cd",name:"Cadmium",mass:112.411,cat:"transition-metal",phase:"solid",group:12,period:5,col:12,eneg:1.69,config:"[Kr] 4d¹⁰ 5s²",desc:"Métal toxique utilisé dans les batteries Ni-Cd et les pigments."},
  {z:49,symbol:"In",name:"Indium",mass:114.818,cat:"post-transition",phase:"solid",group:13,period:5,col:13,eneg:1.78,config:"[Kr] 4d¹⁰ 5s² 5p¹",desc:"Métal mou utilisé dans les écrans tactiles (ITO) et les soudures."},
  {z:50,symbol:"Sn",name:"Étain",mass:118.710,cat:"post-transition",phase:"solid",group:14,period:5,col:14,eneg:1.96,config:"[Kr] 4d¹⁰ 5s² 5p²",desc:"Métal connu depuis l'Antiquité (bronze). Utilisé pour l'étamage et les soudures."},
  {z:51,symbol:"Sb",name:"Antimoine",mass:121.760,cat:"metalloid",phase:"solid",group:15,period:5,col:15,eneg:2.05,config:"[Kr] 4d¹⁰ 5s² 5p³",desc:"Métalloïde utilisé dans les alliages de plomb et les retardateurs de flamme."},
  {z:52,symbol:"Te",name:"Tellure",mass:127.60,cat:"metalloid",phase:"solid",group:16,period:5,col:16,eneg:2.1,config:"[Kr] 4d¹⁰ 5s² 5p⁴",desc:"Métalloïde semi-conducteur utilisé dans les panneaux solaires."},
  {z:53,symbol:"I",name:"Iode",mass:126.904,cat:"halogen",phase:"solid",group:17,period:5,col:17,eneg:2.66,config:"[Kr] 4d¹⁰ 5s² 5p⁵",desc:"Halogène violet essentiel à la thyroïde. Utilisé comme désinfectant."},
  {z:54,symbol:"Xe",name:"Xénon",mass:131.293,cat:"noble-gas",phase:"gas",group:18,period:5,col:18,eneg:2.60,config:"[Kr] 4d¹⁰ 5s² 5p⁶",desc:"Gaz noble qui peut former des composés. Phares au xénon et anesthésie."},
  {z:55,symbol:"Cs",name:"Césium",mass:132.905,cat:"alkali-metal",phase:"solid",group:1,period:6,col:1,eneg:0.79,config:"[Xe] 6s¹",desc:"Métal alcalin le plus réactif. Base de la définition de la seconde atomique."},
  {z:56,symbol:"Ba",name:"Baryum",mass:137.327,cat:"alkaline-earth",phase:"solid",group:2,period:6,col:2,eneg:0.89,config:"[Xe] 6s²",desc:"Métal alcalino-terreux. Flamme verte en feux d'artifice. Radio au baryum."},
  {z:57,symbol:"La",name:"Lanthane",mass:138.905,cat:"lanthanide",phase:"solid",group:3,period:6,col:3,eneg:1.10,config:"[Xe] 5d¹ 6s²",desc:"Premier des lanthanides. Utilisé dans les verres optiques et catalyseurs."},
  {z:58,symbol:"Ce",name:"Cérium",mass:140.116,cat:"lanthanide",phase:"solid",group:3,period:6,col:4,eneg:1.12,config:"[Xe] 4f¹ 5d¹ 6s²",desc:"Lanthanide le plus abondant. Utilisé dans les pierres à briquet."},
  {z:59,symbol:"Pr",name:"Praséodyme",mass:140.908,cat:"lanthanide",phase:"solid",group:3,period:6,col:5,eneg:1.13,config:"[Xe] 4f³ 6s²",desc:"Terre rare utilisée dans les aimants et le verre teinté vert."},
  {z:60,symbol:"Nd",name:"Néodyme",mass:144.242,cat:"lanthanide",phase:"solid",group:3,period:6,col:6,eneg:1.14,config:"[Xe] 4f⁴ 6s²",desc:"Utilisé dans les aimants les plus puissants (NdFeB) et lasers."},
  {z:61,symbol:"Pm",name:"Prométhium",mass:145,cat:"lanthanide",phase:"solid",group:3,period:6,col:7,eneg:1.13,config:"[Xe] 4f⁵ 6s²",desc:"Seule terre rare radioactive sans isotope stable. Peintures luminescentes."},
  {z:62,symbol:"Sm",name:"Samarium",mass:150.36,cat:"lanthanide",phase:"solid",group:3,period:6,col:8,eneg:1.17,config:"[Xe] 4f⁶ 6s²",desc:"Utilisé dans les aimants samarium-cobalt et le traitement du cancer."},
  {z:63,symbol:"Eu",name:"Europium",mass:151.964,cat:"lanthanide",phase:"solid",group:3,period:6,col:9,eneg:1.2,config:"[Xe] 4f⁷ 6s²",desc:"Terre rare qui donne la couleur rouge aux écrans TV et aux billets euro."},
  {z:64,symbol:"Gd",name:"Gadolinium",mass:157.25,cat:"lanthanide",phase:"solid",group:3,period:6,col:10,eneg:1.20,config:"[Xe] 4f⁷ 5d¹ 6s²",desc:"Utilisé comme agent de contraste en IRM et dans les réacteurs nucléaires."},
  {z:65,symbol:"Tb",name:"Terbium",mass:158.925,cat:"lanthanide",phase:"solid",group:3,period:6,col:11,eneg:1.1,config:"[Xe] 4f⁹ 6s²",desc:"Terre rare utilisée dans les phosphores verts des écrans."},
  {z:66,symbol:"Dy",name:"Dysprosium",mass:162.500,cat:"lanthanide",phase:"solid",group:3,period:6,col:12,eneg:1.22,config:"[Xe] 4f¹⁰ 6s²",desc:"Utilisé dans les aimants haute performance et les barres de contrôle nucléaire."},
  {z:67,symbol:"Ho",name:"Holmium",mass:164.930,cat:"lanthanide",phase:"solid",group:3,period:6,col:13,eneg:1.23,config:"[Xe] 4f¹¹ 6s²",desc:"Possède le moment magnétique le plus élevé. Lasers médicaux."},
  {z:68,symbol:"Er",name:"Erbium",mass:167.259,cat:"lanthanide",phase:"solid",group:3,period:6,col:14,eneg:1.24,config:"[Xe] 4f¹² 6s²",desc:"Utilisé dans les fibres optiques comme amplificateur et lasers dermatologiques."},
  {z:69,symbol:"Tm",name:"Thulium",mass:168.934,cat:"lanthanide",phase:"solid",group:3,period:6,col:15,eneg:1.25,config:"[Xe] 4f¹³ 6s²",desc:"Terre rare la plus rare naturellement. Lasers et radiographie portable."},
  {z:70,symbol:"Yb",name:"Ytterbium",mass:173.054,cat:"lanthanide",phase:"solid",group:3,period:6,col:16,eneg:1.1,config:"[Xe] 4f¹⁴ 6s²",desc:"Utilisé dans les horloges atomiques de nouvelle génération et les lasers."},
  {z:71,symbol:"Lu",name:"Lutécium",mass:174.967,cat:"lanthanide",phase:"solid",group:3,period:6,col:17,eneg:1.27,config:"[Xe] 4f¹⁴ 5d¹ 6s²",desc:"Dernier des lanthanides. Nommé d'après Lutèce (ancien nom de Paris)."},
  {z:72,symbol:"Hf",name:"Hafnium",mass:178.49,cat:"transition-metal",phase:"solid",group:4,period:6,col:4,eneg:1.3,config:"[Xe] 4f¹⁴ 5d² 6s²",desc:"Métal résistant à la chaleur. Barres de contrôle nucléaire et processeurs."},
  {z:73,symbol:"Ta",name:"Tantale",mass:180.948,cat:"transition-metal",phase:"solid",group:5,period:6,col:5,eneg:1.5,config:"[Xe] 4f¹⁴ 5d³ 6s²",desc:"Métal très résistant à la corrosion. Condensateurs et implants chirurgicaux."},
  {z:74,symbol:"W",name:"Tungstène",mass:183.84,cat:"transition-metal",phase:"solid",group:6,period:6,col:6,eneg:2.36,config:"[Xe] 4f¹⁴ 5d⁴ 6s²",desc:"Point de fusion le plus élevé de tous les métaux (3422°C). Filaments d'ampoules."},
  {z:75,symbol:"Re",name:"Rhénium",mass:186.207,cat:"transition-metal",phase:"solid",group:7,period:6,col:7,eneg:1.9,config:"[Xe] 4f¹⁴ 5d⁵ 6s²",desc:"Métal très dense et rare. Utilisé dans les moteurs à réaction."},
  {z:76,symbol:"Os",name:"Osmium",mass:190.23,cat:"transition-metal",phase:"solid",group:8,period:6,col:8,eneg:2.2,config:"[Xe] 4f¹⁴ 5d⁶ 6s²",desc:"Élément naturel le plus dense. Utilisé dans les alliages ultra-durs."},
  {z:77,symbol:"Ir",name:"Iridium",mass:192.217,cat:"transition-metal",phase:"solid",group:9,period:6,col:9,eneg:2.20,config:"[Xe] 4f¹⁴ 5d⁷ 6s²",desc:"Métal le plus résistant à la corrosion. Marqueur de l'extinction des dinosaures."},
  {z:78,symbol:"Pt",name:"Platine",mass:195.084,cat:"transition-metal",phase:"solid",group:10,period:6,col:10,eneg:2.28,config:"[Xe] 4f¹⁴ 5d⁹ 6s¹",desc:"Métal précieux dense. Pots catalytiques, bijouterie et chimiothérapie."},
  {z:79,symbol:"Au",name:"Or",mass:196.967,cat:"transition-metal",phase:"solid",group:11,period:6,col:11,eneg:2.54,config:"[Xe] 4f¹⁴ 5d¹⁰ 6s¹",desc:"Métal précieux inoxydable. Symbole de richesse, électronique et médecine."},
  {z:80,symbol:"Hg",name:"Mercure",mass:200.59,cat:"transition-metal",phase:"liquid",group:12,period:6,col:12,eneg:2.00,config:"[Xe] 4f¹⁴ 5d¹⁰ 6s²",desc:"Seul métal liquide à température ambiante. Thermomètres et amalgames."},
  {z:81,symbol:"Tl",name:"Thallium",mass:204.383,cat:"post-transition",phase:"solid",group:13,period:6,col:13,eneg:1.62,config:"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹",desc:"Métal mou et très toxique. Utilisé en imagerie cardiaque."},
  {z:82,symbol:"Pb",name:"Plomb",mass:207.2,cat:"post-transition",phase:"solid",group:14,period:6,col:14,eneg:2.33,config:"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²",desc:"Métal dense et toxique connu depuis l'Antiquité. Batteries et protection radiation."},
  {z:83,symbol:"Bi",name:"Bismuth",mass:208.980,cat:"post-transition",phase:"solid",group:15,period:6,col:15,eneg:2.02,config:"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³",desc:"Jolis cristaux iridescents. Considéré comme le plus lourd élément quasi-stable."},
  {z:84,symbol:"Po",name:"Polonium",mass:209,cat:"post-transition",phase:"solid",group:16,period:6,col:16,eneg:2.0,config:"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴",desc:"Très radioactif et toxique. Découvert par Marie Curie, nommé d'après la Pologne."},
  {z:85,symbol:"At",name:"Astate",mass:210,cat:"halogen",phase:"solid",group:17,period:6,col:17,eneg:2.2,config:"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵",desc:"Halogène le plus rare sur Terre. Radioactif. Recherche en radiothérapie."},
  {z:86,symbol:"Rn",name:"Radon",mass:222,cat:"noble-gas",phase:"gas",group:18,period:6,col:18,eneg:null,config:"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶",desc:"Gaz noble radioactif. Présent naturellement dans les sols, risque pour la santé."},
  {z:87,symbol:"Fr",name:"Francium",mass:223,cat:"alkali-metal",phase:"solid",group:1,period:7,col:1,eneg:0.7,config:"[Rn] 7s¹",desc:"Métal alcalin le plus lourd et le plus instable. Découvert par Marguerite Perey."},
  {z:88,symbol:"Ra",name:"Radium",mass:226,cat:"alkaline-earth",phase:"solid",group:2,period:7,col:2,eneg:0.9,config:"[Rn] 7s²",desc:"Radioactif et luminescent. Découvert par les Curie. Utilisé autrefois en médecine."},
  {z:89,symbol:"Ac",name:"Actinium",mass:227,cat:"actinide",phase:"solid",group:3,period:7,col:3,eneg:1.1,config:"[Rn] 6d¹ 7s²",desc:"Premier des actinides. Radioactif. Recherche en immunothérapie ciblée."},
  {z:90,symbol:"Th",name:"Thorium",mass:232.038,cat:"actinide",phase:"solid",group:3,period:7,col:4,eneg:1.3,config:"[Rn] 6d² 7s²",desc:"Actinide naturel. Candidat comme combustible nucléaire alternatif à l'uranium."},
  {z:91,symbol:"Pa",name:"Protactinium",mass:231.036,cat:"actinide",phase:"solid",group:3,period:7,col:5,eneg:1.5,config:"[Rn] 5f² 6d¹ 7s²",desc:"Actinide radioactif rare et dangereux. Peu d'applications pratiques."},
  {z:92,symbol:"U",name:"Uranium",mass:238.029,cat:"actinide",phase:"solid",group:3,period:7,col:6,eneg:1.38,config:"[Rn] 5f³ 6d¹ 7s²",desc:"Combustible des centrales et armes nucléaires. Très dense (19,1 g/cm³)."},
  {z:93,symbol:"Np",name:"Neptunium",mass:237,cat:"actinide",phase:"solid",group:3,period:7,col:7,eneg:1.36,config:"[Rn] 5f⁴ 6d¹ 7s²",desc:"Premier élément transuranien produit synthétiquement. Sous-produit nucléaire."},
  {z:94,symbol:"Pu",name:"Plutonium",mass:244,cat:"actinide",phase:"solid",group:3,period:7,col:8,eneg:1.28,config:"[Rn] 5f⁶ 7s²",desc:"Combustible des réacteurs et armes nucléaires. Très radioactif et toxique."},
  {z:95,symbol:"Am",name:"Américium",mass:243,cat:"actinide",phase:"solid",group:3,period:7,col:9,eneg:1.3,config:"[Rn] 5f⁷ 7s²",desc:"Utilisé dans les détecteurs de fumée domestiques."},
  {z:96,symbol:"Cm",name:"Curium",mass:247,cat:"actinide",phase:"solid",group:3,period:7,col:10,eneg:1.3,config:"[Rn] 5f⁷ 6d¹ 7s²",desc:"Nommé en l'honneur de Marie et Pierre Curie. Sondes spatiales."},
  {z:97,symbol:"Bk",name:"Berkélium",mass:247,cat:"actinide",phase:"solid",group:3,period:7,col:11,eneg:1.3,config:"[Rn] 5f⁹ 7s²",desc:"Actinide synthétique nommé d'après Berkeley, Californie."},
  {z:98,symbol:"Cf",name:"Californium",mass:251,cat:"actinide",phase:"solid",group:3,period:7,col:12,eneg:1.3,config:"[Rn] 5f¹⁰ 7s²",desc:"Neutron puissant. Utilisé pour détecter les métaux et en radiothérapie."},
  {z:99,symbol:"Es",name:"Einsteinium",mass:252,cat:"actinide",phase:"solid",group:3,period:7,col:13,eneg:1.3,config:"[Rn] 5f¹¹ 7s²",desc:"Nommé en l'honneur d'Einstein. Découvert dans les débris d'un test nucléaire."},
  {z:100,symbol:"Fm",name:"Fermium",mass:257,cat:"actinide",phase:"solid",group:3,period:7,col:14,eneg:1.3,config:"[Rn] 5f¹² 7s²",desc:"Nommé d'après Enrico Fermi. Produit par bombardement neutronique."},
  {z:101,symbol:"Md",name:"Mendélévium",mass:258,cat:"actinide",phase:"solid",group:3,period:7,col:15,eneg:1.3,config:"[Rn] 5f¹³ 7s²",desc:"Nommé en l'honneur de Mendeleïev, créateur du tableau périodique."},
  {z:102,symbol:"No",name:"Nobélium",mass:259,cat:"actinide",phase:"solid",group:3,period:7,col:16,eneg:1.3,config:"[Rn] 5f¹⁴ 7s²",desc:"Nommé d'après Alfred Nobel. Très instable, demi-vie de quelques minutes."},
  {z:103,symbol:"Lr",name:"Lawrencium",mass:266,cat:"actinide",phase:"solid",group:3,period:7,col:17,eneg:1.3,config:"[Rn] 5f¹⁴ 7s² 7p¹",desc:"Dernier des actinides. Nommé d'après Ernest Lawrence."},
  {z:104,symbol:"Rf",name:"Rutherfordium",mass:267,cat:"transition-metal",phase:"solid",group:4,period:7,col:4,eneg:null,config:"[Rn] 5f¹⁴ 6d² 7s²",desc:"Élément superloud nommé d'après Ernest Rutherford."},
  {z:105,symbol:"Db",name:"Dubnium",mass:268,cat:"transition-metal",phase:"solid",group:5,period:7,col:5,eneg:null,config:"[Rn] 5f¹⁴ 6d³ 7s²",desc:"Nommé d'après Dubna, Russie. Demi-vie de quelques secondes."},
  {z:106,symbol:"Sg",name:"Seaborgium",mass:269,cat:"transition-metal",phase:"solid",group:6,period:7,col:6,eneg:null,config:"[Rn] 5f¹⁴ 6d⁴ 7s²",desc:"Nommé d'après Glenn Seaborg, prix Nobel de chimie."},
  {z:107,symbol:"Bh",name:"Bohrium",mass:270,cat:"transition-metal",phase:"solid",group:7,period:7,col:7,eneg:null,config:"[Rn] 5f¹⁴ 6d⁵ 7s²",desc:"Nommé d'après Niels Bohr. Extrêmement instable."},
  {z:108,symbol:"Hs",name:"Hassium",mass:277,cat:"transition-metal",phase:"solid",group:8,period:7,col:8,eneg:null,config:"[Rn] 5f¹⁴ 6d⁶ 7s²",desc:"Nommé d'après le land de Hesse en Allemagne."},
  {z:109,symbol:"Mt",name:"Meitnérium",mass:278,cat:"transition-metal",phase:"solid",group:9,period:7,col:9,eneg:null,config:"[Rn] 5f¹⁴ 6d⁷ 7s²",desc:"Nommé en l'honneur de Lise Meitner, pionnière de la fission nucléaire."},
  {z:110,symbol:"Ds",name:"Darmstadtium",mass:281,cat:"transition-metal",phase:"solid",group:10,period:7,col:10,eneg:null,config:"[Rn] 5f¹⁴ 6d⁸ 7s²",desc:"Nommé d'après Darmstadt, Allemagne. Synthétisé en 1994."},
  {z:111,symbol:"Rg",name:"Roentgenium",mass:282,cat:"transition-metal",phase:"solid",group:11,period:7,col:11,eneg:null,config:"[Rn] 5f¹⁴ 6d⁹ 7s²",desc:"Nommé d'après Wilhelm Röntgen, découvreur des rayons X."},
  {z:112,symbol:"Cn",name:"Copernicium",mass:285,cat:"transition-metal",phase:"solid",group:12,period:7,col:12,eneg:null,config:"[Rn] 5f¹⁴ 6d¹⁰ 7s²",desc:"Nommé d'après Nicolas Copernic. Possiblement liquide comme le mercure."},
  {z:113,symbol:"Nh",name:"Nihonium",mass:286,cat:"post-transition",phase:"solid",group:13,period:7,col:13,eneg:null,config:"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹",desc:"Nihon signifie Japon. Premier élément découvert en Asie."},
  {z:114,symbol:"Fl",name:"Flérovium",mass:289,cat:"post-transition",phase:"solid",group:14,period:7,col:14,eneg:null,config:"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²",desc:"Nommé d'après le laboratoire Flerov. Proche de l'îlot de stabilité."},
  {z:115,symbol:"Mc",name:"Moscovium",mass:290,cat:"post-transition",phase:"solid",group:15,period:7,col:15,eneg:null,config:"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³",desc:"Nommé d'après la région de Moscou. Synthétisé en 2003."},
  {z:116,symbol:"Lv",name:"Livermorium",mass:293,cat:"post-transition",phase:"solid",group:16,period:7,col:16,eneg:null,config:"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴",desc:"Nommé d'après le Laboratoire Lawrence Livermore."},
  {z:117,symbol:"Ts",name:"Tennesse",mass:294,cat:"halogen",phase:"solid",group:17,period:7,col:17,eneg:null,config:"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵",desc:"Nommé d'après le Tennessee. Dernier halogène découvert."},
  {z:118,symbol:"Og",name:"Oganesson",mass:294,cat:"noble-gas",phase:"solid",group:18,period:7,col:18,eneg:null,config:"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶",desc:"Nommé d'après Yuri Oganessian. L'élément le plus lourd jamais synthétisé."},
];

const CAT_COLORS = {
  'nonmetal': {color:'var(--cat-nonmetal)', label:'Non-métaux'},
  'noble-gas': {color:'var(--cat-noble-gas)', label:'Gaz nobles'},
  'alkali-metal': {color:'var(--cat-alkali-metal)', label:'Métaux alcalins'},
  'alkaline-earth': {color:'var(--cat-alkaline-earth)', label:'Alcalino-terreux'},
  'metalloid': {color:'var(--cat-metalloid)', label:'Métalloïdes'},
  'halogen': {color:'var(--cat-halogen)', label:'Halogènes'},
  'transition-metal': {color:'var(--cat-transition-metal)', label:'Métaux de transition'},
  'post-transition': {color:'var(--cat-post-transition)', label:'Métaux pauvres'},
  'lanthanide': {color:'var(--cat-lanthanide)', label:'Lanthanides'},
  'actinide': {color:'var(--cat-actinide)', label:'Actinides'},
};

const PHASE_COLORS = { gas:'#22d3ee', liquid:'#3b82f6', solid:'#f97316' };

const $ = s => document.querySelector(s);
let colorMode = 'category';
let atomAnimId = null;

function getShellDistribution(z) {
  const caps = [2, 8, 18, 32, 32, 18, 8];
  const shells = [];
  let left = z;
  for (const cap of caps) {
    if (left <= 0) break;
    const n = Math.min(left, cap);
    shells.push(n);
    left -= n;
  }
  return shells;
}

function stopAtomRender() {
  if (atomAnimId) {
    cancelAnimationFrame(atomAnimId);
    atomAnimId = null;
  }
}

function renderAtom(el) {
  const canvas = $('#atom-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  stopAtomRender();

  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const shells = getShellDistribution(el.z);
  const baseR = 26;
  const stepR = 20;
  const t0 = performance.now();

  function loop(t) {
    const dt = (t - t0) / 1000;
    ctx.clearRect(0, 0, w, h);

    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
    glow.addColorStop(0, 'rgba(34,211,238,.35)');
    glow.addColorStop(1, 'rgba(34,211,238,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 34, 0, Math.PI * 2);
    ctx.fill();

    // Nucleus
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,.8)';
    ctx.font = '700 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(el.symbol, cx, cy + 4);

    shells.forEach((count, idx) => {
      const r = baseR + idx * stepR;
      ctx.strokeStyle = 'rgba(129,140,248,.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + dt * (0.6 + idx * 0.16) * (idx % 2 ? -1 : 1);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        ctx.fillStyle = idx % 2 ? '#a855f7' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    atomAnimId = requestAnimationFrame(loop);
  }

  atomAnimId = requestAnimationFrame(loop);
}

// ── Grid Layout ──
// Standard table: 18 columns, 7 periods + 2 rows for lanthanides/actinides
function getGridPosition(el) {
  // Lanthanides (57-71) go in row 9
  if (el.z >= 57 && el.z <= 71) return { row: 9, col: el.z - 57 + 4 };
  // Actinides (89-103) go in row 10
  if (el.z >= 89 && el.z <= 103) return { row: 10, col: el.z - 89 + 4 };
  return { row: el.period, col: el.col };
}

function getColor(el) {
  if (colorMode === 'category') return CAT_COLORS[el.cat]?.color || 'var(--cat-unknown)';
  if (colorMode === 'phase') return PHASE_COLORS[el.phase] || '#475569';
  if (colorMode === 'electronegativity') {
    if (!el.eneg) return '#333';
    const t = Math.min(el.eneg / 4, 1);
    const r = Math.round(255 * t);
    const b = Math.round(255 * (1 - t));
    return `rgb(${r}, 60, ${b})`;
  }
}

function buildTable() {
  const table = $('#periodic-table');
  table.innerHTML = '';

  ELEMENTS.forEach(el => {
    const pos = getGridPosition(el);
    const div = document.createElement('div');
    div.className = 'element';
    div.dataset.z = el.z;
    div.dataset.cat = el.cat;
    div.style.gridRow = pos.row;
    div.style.gridColumn = pos.col;
    div.style.borderColor = getColor(el);
    div.style.borderWidth = '2px';
    div.innerHTML = `
      <span class="el-number">${el.z}</span>
      <span class="el-symbol" style="color:${getColor(el)}">${el.symbol}</span>
      <span class="el-name">${el.name}</span>
      <span class="el-mass">${el.mass}</span>
    `;
    div.addEventListener('click', () => showDetail(el));
    table.appendChild(div);
  });

  // Placeholder labels in main table for La-Lu and Ac-Lr
  const laLabel = document.createElement('div');
  laLabel.className = 'element';
  laLabel.style.gridRow = 6; laLabel.style.gridColumn = 3;
  laLabel.style.borderColor = 'var(--cat-lanthanide)'; laLabel.style.borderWidth = '2px';
  laLabel.style.fontSize = '.6rem'; laLabel.style.cursor = 'default';
  laLabel.innerHTML = '<span style="color:var(--cat-lanthanide);font-size:.7rem">57-71</span>';
  table.appendChild(laLabel);

  const acLabel = document.createElement('div');
  acLabel.className = 'element';
  acLabel.style.gridRow = 7; acLabel.style.gridColumn = 3;
  acLabel.style.borderColor = 'var(--cat-actinide)'; acLabel.style.borderWidth = '2px';
  acLabel.style.fontSize = '.6rem'; acLabel.style.cursor = 'default';
  acLabel.innerHTML = '<span style="color:var(--cat-actinide);font-size:.7rem">89-103</span>';
  table.appendChild(acLabel);

  // Row labels
  const lantLabel = document.createElement('div');
  lantLabel.className = 'lanthanide-label';
  lantLabel.style.gridRow = 9; lantLabel.style.gridColumn = '1 / 4';
  lantLabel.textContent = 'Lanthanides →';
  table.appendChild(lantLabel);

  const actLabel = document.createElement('div');
  actLabel.className = 'actinide-label';
  actLabel.style.gridRow = 10; actLabel.style.gridColumn = '1 / 4';
  actLabel.textContent = 'Actinides →';
  table.appendChild(actLabel);
}

function buildLegend() {
  const legend = $('#legend');
  legend.innerHTML = '';
  if (colorMode === 'category') {
    Object.entries(CAT_COLORS).forEach(([key, {color, label}]) => {
      legend.innerHTML += `<div class="legend-item" data-cat="${key}"><span class="legend-dot" style="background:${color}"></span>${label}</div>`;
    });
  } else if (colorMode === 'phase') {
    Object.entries(PHASE_COLORS).forEach(([key, color]) => {
      const labels = {gas:'Gaz',liquid:'Liquide',solid:'Solide'};
      legend.innerHTML += `<div class="legend-item"><span class="legend-dot" style="background:${color}"></span>${labels[key]}</div>`;
    });
  } else {
    legend.innerHTML = '<div class="legend-item">Faible ← Électronégativité → Élevée</div>';
  }
}

/* ── Block detection from element data ── */
function getBlock(el) {
  if (el.cat === 'lanthanide' || el.cat === 'actinide') return 'f';
  if (el.group >= 3 && el.group <= 12) return 'd';
  if (el.group === 1 || el.group === 2) return 's';
  return 'p'; // groups 13-18 (+ H/He treated as p for visual purposes)
}

/* ── Atomic radius data (pm, van der Waals or covalent where available) ── */
const ATOMIC_RADIUS = {
  1:53,2:31,3:167,4:112,5:87,6:67,7:56,8:48,9:42,10:38,
  11:190,12:145,13:118,14:111,15:98,16:88,17:79,18:71,
  19:243,20:194,21:184,22:176,23:171,24:166,25:161,26:156,27:152,28:149,29:145,30:142,
  31:136,32:125,33:114,34:103,35:94,36:88,
  37:265,38:219,39:212,40:206,41:198,42:190,43:183,44:178,45:173,46:169,47:165,48:161,
  49:156,50:145,51:133,52:123,53:115,54:108,
  55:298,56:253,57:195,58:185,59:185,60:185,61:185,62:185,63:185,64:180,65:175,66:175,67:175,68:175,69:175,70:175,71:175,
  72:208,73:200,74:193,75:188,76:185,77:180,78:177,79:174,80:171,
  81:156,82:154,83:143,84:135,85:127,86:120
};

function showDetail(el) {
  const overlay = $('#detail-overlay');
  $('#detail-symbol').textContent = el.symbol;
  $('#detail-symbol').style.color = getColor(el);
  $('#detail-name').textContent = el.name;
  $('#detail-number').textContent = `Z = ${el.z} · ${CAT_COLORS[el.cat]?.label || 'Inconnu'}`;
  const ar = ATOMIC_RADIUS[el.z];
  const blockName = { s: 'Bloc s', p: 'Bloc p', d: 'Bloc d', f: 'Bloc f' }[getBlock(el)];
  $('#detail-grid').innerHTML = `
    <div class="detail-item"><div class="label">Masse atomique</div><div class="value">${el.mass} u</div></div>
    <div class="detail-item"><div class="label">État physique</div><div class="value">${{gas:'Gaz',liquid:'Liquide',solid:'Solide'}[el.phase]}</div></div>
    <div class="detail-item"><div class="label">Électronégativité</div><div class="value">${el.eneg ?? '—'}</div></div>
    <div class="detail-item"><div class="label">Configuration</div><div class="value" style="font-size:.75rem">${el.config}</div></div>
    <div class="detail-item"><div class="label">Groupe</div><div class="value">${el.group}</div></div>
    <div class="detail-item"><div class="label">Période</div><div class="value">${el.period}</div></div>
    <div class="detail-item"><div class="label">Bloc</div><div class="value">${blockName}</div></div>
    <div class="detail-item"><div class="label">Rayon atomique</div><div class="value">${ar ? ar + ' pm' : '—'}</div></div>
  `;
  $('#detail-desc').textContent = el.desc;
  renderAtom(el);
  overlay.classList.add('active');
}

$('#detail-close').addEventListener('click', () => { stopAtomRender(); $('#detail-overlay').classList.remove('active'); });
$('#detail-overlay').addEventListener('click', e => { if (e.target === $('#detail-overlay')) { stopAtomRender(); $('#detail-overlay').classList.remove('active'); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { stopAtomRender(); $('#detail-overlay').classList.remove('active'); } });

// ── Search & Filter ──
$('#search').addEventListener('input', applyFilters);
$('#filter-category').addEventListener('change', applyFilters);
document.getElementById('filter-block').addEventListener('change', applyFilters);
document.getElementById('filter-period').addEventListener('change', applyFilters);
$('#color-mode').addEventListener('change', e => {
  colorMode = e.target.value;
  buildTable(); buildLegend(); applyFilters();
});

function applyFilters() {
  const q = $('#search').value.toLowerCase().trim();
  const cat = $('#filter-category').value;
  const block = document.getElementById('filter-block').value;
  const period = document.getElementById('filter-period').value;
  document.querySelectorAll('.element[data-z]').forEach(div => {
    const el = ELEMENTS.find(e => e.z === +div.dataset.z);
    if (!el) return;
    const matchSearch = !q || el.name.toLowerCase().includes(q) || el.symbol.toLowerCase().includes(q) || String(el.z).includes(q);
    const matchCat = !cat || el.cat === cat;
    const matchBlock = !block || getBlock(el) === block;
    const matchPeriod = !period || String(el.period) === period;
    div.classList.toggle('dimmed', !(matchSearch && matchCat && matchBlock && matchPeriod));
  });
}

// Legend click filter
document.addEventListener('click', e => {
  const item = e.target.closest('.legend-item[data-cat]');
  if (item) {
    const cat = item.dataset.cat;
    const sel = $('#filter-category');
    sel.value = sel.value === cat ? '' : cat;
    applyFilters();
  }
});

// ── Init ──
buildTable();
buildLegend();

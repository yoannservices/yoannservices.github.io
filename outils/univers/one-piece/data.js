const detailedCharacters = [
  {
    slug: "luffy",
    name: "Monkey D. Luffy",
    alias: "Chapeau de paille",
    wikiTitle: "Monkey D. Luffy",
    crew: "Equipage du Chapeau de paille",
    role: "Capitaine",
    origin: "Village de Fuchsia",
    devilFruit: "Hito Hito no Mi, modele Nika",
    haki: ["Haki de l'Observation", "Haki de l'Armement", "Haki des Rois"],
    characteristics: [
      "Leadership naturel et instinctif",
      "Volonte extreme",
      "Combattant creatif et imprevisible",
      "Loyaute absolue envers son equipage"
    ],
    bountyHistory: [
      { label: "East Blue", amount: 30000000 },
      { label: "Alabasta", amount: 100000000 },
      { label: "Enies Lobby", amount: 300000000 },
      { label: "Marineford", amount: 400000000 },
      { label: "Dressrosa", amount: 500000000 },
      { label: "Whole Cake Island", amount: 1500000000 },
      { label: "Wano", amount: 3000000000 }
    ]
  },
  {
    slug: "zoro",
    name: "Roronoa Zoro",
    alias: "Chasseur de Pirates",
    wikiTitle: "Roronoa Zoro",
    crew: "Equipage du Chapeau de paille",
    role: "Bretteur / Bras droit",
    origin: "Shimotsuki",
    devilFruit: "Aucun",
    haki: ["Haki de l'Observation", "Haki de l'Armement", "Haki des Rois"],
    characteristics: [
      "Maitre du Santoryu",
      "Sens de l'honneur tres fort",
      "Resistance physique exceptionnelle",
      "Discipline de combat tres stricte"
    ],
    bountyHistory: [
      { label: "Debut Grand Line", amount: 60000000 },
      { label: "Enies Lobby", amount: 120000000 },
      { label: "Dressrosa", amount: 320000000 },
      { label: "Wano", amount: 1111000000 }
    ]
  },
  {
    slug: "nami",
    name: "Nami",
    alias: "La Chatte Voleuse",
    wikiTitle: "Nami",
    crew: "Equipage du Chapeau de paille",
    role: "Navigatrice",
    origin: "Village de Cocoyashi",
    devilFruit: "Aucun",
    haki: ["Observation tactique"],
    characteristics: [
      "Genie de la navigation",
      "Excellente lecture meteo",
      "Intelligence strategique",
      "Gestionnaire financiere de l'equipage"
    ],
    bountyHistory: [
      { label: "Enies Lobby", amount: 16000000 },
      { label: "Dressrosa", amount: 66000000 },
      { label: "Wano", amount: 366000000 }
    ]
  },
  {
    slug: "usopp",
    name: "Usopp",
    alias: "God Usopp",
    wikiTitle: "Usopp",
    crew: "Equipage du Chapeau de paille",
    role: "Sniper",
    origin: "Village de Syrup",
    devilFruit: "Aucun",
    haki: ["Haki de l'Observation"],
    characteristics: [
      "Tireur de precision",
      "Inventeur de gadgets",
      "Progression mentale remarquable",
      "Creativite au combat"
    ],
    bountyHistory: [
      { label: "Sogeking", amount: 30000000 },
      { label: "Dressrosa", amount: 200000000 },
      { label: "Wano", amount: 500000000 }
    ]
  },
  {
    slug: "sanji",
    name: "Vinsmoke Sanji",
    alias: "Jambe Noire",
    wikiTitle: "Sanji",
    crew: "Equipage du Chapeau de paille",
    role: "Cuisinier",
    origin: "North Blue",
    devilFruit: "Aucun",
    haki: ["Haki de l'Observation", "Haki de l'Armement"],
    characteristics: [
      "Maitre du combat a la jambe",
      "Cuisinier d'elite",
      "Grande vitesse et mobilite",
      "Code d'honneur strict"
    ],
    bountyHistory: [
      { label: "Enies Lobby", amount: 77000000 },
      { label: "Dressrosa (Only Alive)", amount: 177000000 },
      { label: "Whole Cake Island", amount: 330000000 },
      { label: "Wano", amount: 1032000000 }
    ]
  },
  {
    slug: "chopper",
    name: "Tony Tony Chopper",
    alias: "Le Raton-Laveur (mal nomme)",
    wikiTitle: "Tony Tony Chopper",
    crew: "Equipage du Chapeau de paille",
    role: "Medecin",
    origin: "Ile de Drum",
    devilFruit: "Hito Hito no Mi",
    haki: ["Aucun confirme"],
    characteristics: [
      "Medecin brillant",
      "Rumble Ball et transformations multiples",
      "Empathie tres forte",
      "Support essentiel en combat"
    ],
    bountyHistory: [
      { label: "Enies Lobby", amount: 50 },
      { label: "Dressrosa", amount: 100 },
      { label: "Wano", amount: 1000 }
    ]
  },
  {
    slug: "robin",
    name: "Nico Robin",
    alias: "Enfant du Demon",
    wikiTitle: "Nico Robin",
    crew: "Equipage du Chapeau de paille",
    role: "Archeologue",
    origin: "Ohara",
    devilFruit: "Hana Hana no Mi",
    haki: ["Haki de l'Armement (utilisation avancee)"],
    characteristics: [
      "Lecture des Ponéglyphes",
      "Grande connaissance historique",
      "Calme et sang-froid",
      "Combat technique"
    ],
    bountyHistory: [
      { label: "Enfant d'Ohara", amount: 79000000 },
      { label: "Enies Lobby", amount: 80000000 },
      { label: "Dressrosa", amount: 130000000 },
      { label: "Wano", amount: 930000000 }
    ]
  },
  {
    slug: "franky",
    name: "Franky",
    alias: "Cyborg",
    wikiTitle: "Franky",
    crew: "Equipage du Chapeau de paille",
    role: "Charpentier naval",
    origin: "Water Seven",
    devilFruit: "Aucun",
    haki: ["Aucun confirme"],
    characteristics: [
      "Ingenieur d'exception",
      "Corps cyborg tres resistant",
      "Armes integrees",
      "Constructeur du Thousand Sunny"
    ],
    bountyHistory: [
      { label: "Enies Lobby", amount: 44000000 },
      { label: "Dressrosa", amount: 94000000 },
      { label: "Wano", amount: 394000000 }
    ]
  },
  {
    slug: "brook",
    name: "Brook",
    alias: "Soul King",
    wikiTitle: "Brook",
    crew: "Equipage du Chapeau de paille",
    role: "Musicien",
    origin: "West Blue",
    devilFruit: "Yomi Yomi no Mi",
    haki: ["Aucun confirme"],
    characteristics: [
      "Escrime rapide",
      "Techniques d'ame et de glace",
      "Reconnaissance et infiltration",
      "Charisme musical"
    ],
    bountyHistory: [
      { label: "Pre-ellipse", amount: 33000000 },
      { label: "Dressrosa", amount: 83000000 },
      { label: "Wano", amount: 383000000 }
    ]
  },
  {
    slug: "jinbe",
    name: "Jinbe",
    alias: "Chevalier des Mers",
    wikiTitle: "Jinbe",
    crew: "Equipage du Chapeau de paille",
    role: "Timonier",
    origin: "Ile des Hommes-Poissons",
    devilFruit: "Aucun",
    haki: ["Haki de l'Observation", "Haki de l'Armement"],
    characteristics: [
      "Maitre du Karaté des Hommes-Poissons",
      "Strategie et diplomatie",
      "Tres grande endurance",
      "Combattant marin d'elite"
    ],
    bountyHistory: [
      { label: "Ancienne prime", amount: 76000000 },
      { label: "Shichibukai dissous", amount: 250000000 },
      { label: "Post-Marineford", amount: 438000000 },
      { label: "Wano", amount: 1100000000 }
    ]
  },
  {
    slug: "ace",
    name: "Portgas D. Ace",
    alias: "Poing Ardent",
    wikiTitle: "Portgas D. Ace",
    crew: "Equipage de Barbe Blanche (2e division)",
    role: "Commandant",
    origin: "South Blue",
    devilFruit: "Mera Mera no Mi",
    haki: ["Haki des Rois", "Haki de l'Armement", "Haki de l'Observation"],
    characteristics: [
      "Tres haut potentiel offensif",
      "Loyaute a Barbe Blanche",
      "Sens de l'honneur hereditaire",
      "Combattant de front"
    ],
    bountyHistory: [
      { label: "Prime connue", amount: 550000000 }
    ]
  },
  {
    slug: "sabo",
    name: "Sabo",
    alias: "Empereur des Flammes",
    wikiTitle: "Sabo",
    crew: "Armee Revolutionnaire",
    role: "Chef d'etat-major",
    origin: "Goa",
    devilFruit: "Mera Mera no Mi",
    haki: ["Haki de l'Armement", "Haki de l'Observation"],
    characteristics: [
      "Combattant au Ryusoken",
      "Strategie revolutionnaire",
      "Influence politique croissante",
      "Figure symbolique mondiale"
    ],
    bountyHistory: [
      { label: "Apres Reverie", amount: 602000000 }
    ]
  },
  {
    slug: "law",
    name: "Trafalgar D. Water Law",
    alias: "Chirurgien de la Mort",
    wikiTitle: "Trafalgar D. Water Law",
    crew: "Equipage du Heart",
    role: "Capitaine",
    origin: "Flevance",
    devilFruit: "Ope Ope no Mi",
    haki: ["Haki de l'Observation", "Haki de l'Armement", "Haki des Rois"],
    characteristics: [
      "Capacites chirurgicales uniques",
      "Esprit analytique",
      "Combattant tactique",
      "Allie strategique de Luffy"
    ],
    bountyHistory: [
      { label: "Sabaody", amount: 200000000 },
      { label: "Shichibukai", amount: 440000000 },
      { label: "Dressrosa", amount: 500000000 },
      { label: "Wano", amount: 3000000000 }
    ]
  },
  {
    slug: "kid",
    name: "Eustass Kid",
    alias: "Captain Kid",
    wikiTitle: "Eustass Kid",
    crew: "Equipage de Kid",
    role: "Capitaine",
    origin: "South Blue",
    devilFruit: "Jiki Jiki no Mi",
    haki: ["Haki de l'Observation", "Haki de l'Armement", "Haki des Rois"],
    characteristics: [
      "Style de combat brutal",
      "Controle magnetique",
      "Ambition d'empereur",
      "Temerite extreme"
    ],
    bountyHistory: [
      { label: "Sabaody", amount: 315000000 },
      { label: "Post-ellipse", amount: 470000000 },
      { label: "Wano", amount: 3000000000 }
    ]
  },
  {
    slug: "shanks",
    name: "Shanks",
    alias: "Le Roux",
    wikiTitle: "Shanks",
    crew: "Equipage du Roux",
    role: "Empereur",
    origin: "West Blue",
    devilFruit: "Aucun",
    haki: ["Haki des Rois avance", "Haki de l'Observation", "Haki de l'Armement"],
    characteristics: [
      "Presence intimidante majeure",
      "Influence geopolitique massive",
      "Excellent bretteur",
      "Autorite reconnue mondialement"
    ],
    bountyHistory: [
      { label: "Prime connue", amount: 4048900000 }
    ]
  },
  {
    slug: "blackbeard",
    name: "Marshall D. Teach",
    alias: "Barbe Noire",
    wikiTitle: "Marshall D. Teach",
    crew: "Equipage de Barbe Noire",
    role: "Empereur",
    origin: "Grand Line",
    devilFruit: "Yami Yami no Mi + Gura Gura no Mi",
    haki: ["Haki de l'Observation", "Haki de l'Armement"],
    characteristics: [
      "Double pouvoir de fruit du demon",
      "Ambition sans limite",
      "Strategie opportuniste",
      "Menace majeure pour le monde"
    ],
    bountyHistory: [
      { label: "Debut post-Marineford", amount: 2247600000 },
      { label: "Prime actuelle", amount: 3996000000 }
    ]
  }
];

const detailBySlug = Object.fromEntries(detailedCharacters.map((character) => [character.slug, character]));

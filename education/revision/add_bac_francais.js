const fs = require('fs');

// Read current data.js
let src = fs.readFileSync('education/revision/data.js', 'utf8');

// Extract the JSON portion
src = src.replace(/^const PROGRAMME\s*=\s*/, '').replace(/;\s*$/, '');
const PROGRAMME = JSON.parse(src);

// Add bac_francais level
PROGRAMME['bac_francais'] = {
  label: 'Bac Français',
  subjects: {
    poesie: {
      label: 'Poésie — Rimbaud',
      icon: 'fa-feather-pointed',
      fiches: [
        {
          title: 'Les Cahiers de Douai — Vue d\'ensemble',
          tag: 'Œuvre intégrale',
          content: `<p><strong>Recueil de 22 poèmes</strong> écrits par Rimbaud à 16 ans en 1870, lors de ses fugues. Confiés à son ami Demeny à Douai. Témoignage d'un adolescent révolté qui s'invente comme poète en rupture totale avec la norme bourgeoise et académique.</p>
<h4 style="margin:16px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:.8px;color:var(--accent2)">Personnages / voix poétiques</h4>
<div class="bf-perso-grid">
<div class="bf-perso-card"><strong>Le "je" lyrique</strong><span>Adolescent vagabond, révolté, sensuel. Se construit contre les normes, revendique sa liberté absolue.</span></div>
<div class="bf-perso-card"><strong>La nature</strong><span>Refuge, muse et miroir de la liberté poétique. Complice du poète errant.</span></div>
<div class="bf-perso-card"><strong>La société / la guerre</strong><span>Décrite avec ironie ou horreur (Le Dormeur du val). Objet de la révolte rimbaldienne.</span></div>
</div>
<h4 style="margin:16px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:.8px;color:var(--accent2)">Thèmes</h4>
<div class="bf-theme-tags"><span>Émancipation</span><span>Liberté</span><span>Révolte</span><span>Corps & sensualité</span><span>Guerre & violence</span><span>Création poétique</span></div>
<h4 style="margin:16px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:.8px;color:var(--accent2)">Citations clés</h4>
<div class="bf-citation">"Je m'en allais, les poings dans mes poches crevées" <em>— Émancipation, liberté du vagabond</em></div>
<div class="bf-citation teal">"Il a deux trous rouges au côté droit" <em>— Ironie tragique du Dormeur du val</em></div>
<div class="bf-citation coral">"Belle hideusement d'un ulcère à l'anus" <em>— Subversion esthétique, Vénus anadyomène</em></div>`
        },
        {
          title: 'Ma Bohême (EL 1)',
          tag: 'Explication linéaire',
          content: `<p class="bf-badge bf-purple">Explication linéaire 1 — Poésie</p>
<p><em>Sonnet en alexandrins.</em> Le poète célèbre sa liberté de vagabond et invente son identité de poète en rupture. L'errance devient une posture créatrice.</p>
<div class="bf-steps">
<div class="bf-step"><span class="bf-num">1</span><span>Quatrain 1 — Portrait du poète vagabond : errance, pauvreté volontairement revendiquée</span></div>
<div class="bf-step"><span class="bf-num">2</span><span>Quatrain 2 — La nature comme espace de liberté et d'inspiration infinie</span></div>
<div class="bf-step"><span class="bf-num">3</span><span>Tercet 1 — Le poète à l'écoute du monde : sensations, éveil lyrique</span></div>
<div class="bf-step"><span class="bf-num">4</span><span>Tercet 2 — La création poétique naît de l'errance elle-même</span></div>
</div>
<div class="bf-citation">"Je m'en allais, les poings dans mes poches crevées" <em>— Incipit énergique, rupture immédiate</em></div>
<div class="bf-citation teal">"Petit-Poucet rêveur, j'égrenais des rimes" <em>— La marche engendre le poème</em></div>
<div class="bf-citation coral">"Comme des lyres, je tirais les élastiques / De mes souliers blessés" <em>— Métaphore créatrice</em></div>`
        },
        {
          title: 'Le Dormeur du val (EL 2)',
          tag: 'Explication linéaire',
          content: `<p class="bf-badge bf-purple">Explication linéaire 2 — Poésie</p>
<p><em>Sonnet · guerre franco-prussienne, oct. 1870.</em> Ironie tragique : la beauté du paysage contraste avec la violence révélée au dernier vers seulement.</p>
<div class="bf-steps">
<div class="bf-step"><span class="bf-num">1</span><span>Quatrain 1 — Tableau pastoral idyllique : nature lumineuse et accueillante</span></div>
<div class="bf-step"><span class="bf-num">2</span><span>Quatrain 2 — Portrait du soldat : il semble dormir, la nature le berce</span></div>
<div class="bf-step"><span class="bf-num">3</span><span>Tercet 1 — Signes d'inquiétude : froid, pâleur, immobilité suspecte</span></div>
<div class="bf-step"><span class="bf-num">4</span><span>Tercet 2 — Chute : "deux trous rouges" — révélation brutale de la mort</span></div>
</div>
<div class="bf-citation">"C'est un trou de verdure où chante une rivière" <em>— Euphémisme inaugural</em></div>
<div class="bf-citation teal">"Tranquille. Il a deux trous rouges au côté droit." <em>— Chute, rupture brutale</em></div>
<div class="bf-citation coral">"La nature, berce-le chaudement : il a froid" <em>— Prosopopée, impuissance face à la mort</em></div>`
        },
        {
          title: 'Vénus anadyomène (EL 3)',
          tag: 'Explication linéaire',
          content: `<p class="bf-badge bf-purple">Explication linéaire 3 — Poésie</p>
<p><em>Sonnet · détournement mythologique.</em> Rimbaud s'affranchit des canons esthétiques. Le laid devient matière poétique.</p>
<div class="bf-steps">
<div class="bf-step"><span class="bf-num">1</span><span>Quatrain 1 — Sortie du bain : corps féminin qui émerge, comparaisons dégradantes</span></div>
<div class="bf-step"><span class="bf-num">2</span><span>Quatrain 2 — Portrait physique satirique et cru, accumulation de défauts</span></div>
<div class="bf-step"><span class="bf-num">3</span><span>Tercet 1 — Corps vu de dos, continuation grotesque</span></div>
<div class="bf-step"><span class="bf-num">4</span><span>Tercet 2 — Chute : "Belle hideusement d'un ulcère à l'anus"</span></div>
</div>
<div class="bf-citation">"Comme d'un cercueil vert en fer-blanc, une tête" <em>— La baignoire = cercueil, anti-naissance</em></div>
<div class="bf-citation teal">"Belle hideusement d'un ulcère à l'anus" <em>— Oxymore final, subversion totale</em></div>`
        },
        {
          title: "L'Huître — Ponge (EL 4 associé)",
          tag: 'Texte associé',
          content: `<p class="bf-badge bf-purple">Texte associé EL4 — Le Parti pris des choses, 1942</p>
<p>Ponge décrit l'huître avec précision quasi-scientifique et une langue inventive. Poème en prose. Émancipation créatrice par le regard neuf posé sur l'objet le plus banal.</p>
<div class="bf-steps">
<div class="bf-step"><span class="bf-num">1</span><span>L'extérieur : dureté, opacité, résistance au monde</span></div>
<div class="bf-step"><span class="bf-num">2</span><span>L'ouverture : violence, effort — accès difficile à l'intérieur</span></div>
<div class="bf-step"><span class="bf-num">3</span><span>L'intérieur : monde nacré, vivant — beauté cachée révélée</span></div>
<div class="bf-step"><span class="bf-num">4</span><span>La perle : rareté — la beauté est aléatoire, comme le poème</span></div>
</div>
<div class="bf-citation">"formule, tenant à la fois du nacre et du plomb" <em>— Oxymore, alliance du beau et du lourd</em></div>
<div class="bf-citation teal">"Parfois très rare une formule perle à leur gosier de nacre" <em>— La perle = métaphore du poème</em></div>`
        }
      ],
      quiz: [
        { q: "En quelle année Rimbaud écrit-il les poèmes des Cahiers de Douai ?", options: ["1868","1870","1873","1880"], correct: 1, expl: "Rimbaud écrit ces 22 poèmes en 1870, à l'âge de 16 ans, lors de ses fugues." },
        { q: "Quel est le parcours associé aux Cahiers de Douai ?", options: ["Personnages en marge","Défendre la liberté","Émancipations créatrices","Les jeux du cœur"], correct: 2, expl: "Le parcours est \"Émancipations créatrices\" : Rimbaud s'invente poète en rupture totale avec les normes." },
        { q: "Quel est le procédé dominant du Dormeur du val ?", options: ["La métaphore","L'ironie tragique","L'hyperbole","L'anaphore"], correct: 1, expl: "L'ironie tragique : tout le poème suggère le sommeil, et la chute révèle brutalement la mort." },
        { q: "Quel mythe Rimbaud détourne-t-il dans Vénus anadyomène ?", options: ["Méduse","Aphrodite naissant des eaux","Diane chasseresse","Pénélope"], correct: 1, expl: "Rimbaud détourne le mythe de Vénus (Aphrodite) naissant des eaux pour subvertir les canons esthétiques." }
      ],
      flashcards: [
        { front: "\"Je m'en allais, les poings dans mes poches crevées\"", back: "Ma Bohême — Rimbaud · Incipit de liberté et de révolte, posture du poète vagabond" },
        { front: "\"Il a deux trous rouges au côté droit.\"", back: "Le Dormeur du val — Rimbaud · Chute ironie tragique, révélation de la mort, anti-guerre" },
        { front: "\"Belle hideusement d'un ulcère à l'anus\"", back: "Vénus anadyomène — Rimbaud · Oxymore subversif, émancipation par la laideur" },
        { front: "Parcours des Cahiers de Douai", back: "Émancipations créatrices" },
        { front: "Nombre de poèmes dans les Cahiers de Douai", back: "22 poèmes écrits en 1870" }
      ]
    },
    roman: {
      label: 'Roman — Prévost',
      icon: 'fa-book',
      fiches: [
        {
          title: 'Manon Lescaut — Vue d\'ensemble',
          tag: 'Œuvre intégrale',
          content: `<p><strong>Roman-mémoires de l'abbé Prévost (1731)</strong>. Des Grieux raconte sa passion dévastatrice pour Manon Lescaut. Personnages en marge de la société et de la morale. L'amour est vécu comme une fatalité incontrôlable.</p>
<div class="bf-perso-grid">
<div class="bf-perso-card"><strong>Des Grieux</strong><span>Narrateur. Jeune noble ruiné par sa passion. Voix subjective qui justifie tout.</span></div>
<div class="bf-perso-card"><strong>Manon</strong><span>Énigme du roman. Belle, ambivalente, oscille entre amour sincère et pragmatisme de survie.</span></div>
<div class="bf-perso-card"><strong>Tiberge</strong><span>Ami vertueux. Voix de la raison et de la religion. Repoussoir moral.</span></div>
</div>
<div class="bf-theme-tags"><span>Passion fatale</span><span>Personnage en marge</span><span>Fatalité amoureuse</span><span>Déchéance sociale</span><span>Narration subjective</span></div>
<div class="bf-citation">"Je me trouvai enflammé tout d'un coup jusqu'au transport" <em>— Coup de foudre, fatalité de la passion</em></div>
<div class="bf-citation teal">"Je l'aimais trop pour ne vouloir pas lui rendre service" <em>— Rationalisation de la passion, aveuglement</em></div>`
        },
        {
          title: 'La rencontre à Amiens (EL 5)',
          tag: 'Explication linéaire',
          content: `<p class="bf-badge bf-teal">Explication linéaire 5 — Roman</p>
<p>Scène fondatrice : coup de foudre de Des Grieux pour Manon à Amiens. Manon est déjà "en marge" (conduite au couvent de force).</p>
<div class="bf-steps">
<div class="bf-step"><span class="bf-num">1</span><span>Arrivée de la charrette — Des Grieux spectateur, mise en scène de la première vue</span></div>
<div class="bf-step"><span class="bf-num">2</span><span>Premier regard sur Manon — portrait sensoriel, coup de foudre immédiat</span></div>
<div class="bf-step"><span class="bf-num">3</span><span>Conversation — Manon révèle son intelligence et son désir de liberté</span></div>
<div class="bf-step"><span class="bf-num">4</span><span>Résolution de Des Grieux — décision de la faire fuir, abandon de sa vie d'avant</span></div>
</div>
<div class="bf-citation">"Je me trouvai enflammé tout d'un coup jusqu'au transport" <em>— Fatalité de la passion</em></div>
<div class="bf-citation teal">"Quoiqu'elle fût encore moins âgée que moi, elle recevait mes politesses sans paraître embarrassée" <em>— Portrait de Manon, liberté naturelle</em></div>`
        },
        {
          title: "L'évasion de Saint-Lazare (EL 6)",
          tag: 'Explication linéaire',
          content: `<p class="bf-badge bf-teal">Explication linéaire 6 — Roman</p>
<p>Des Grieux va jusqu'au meurtre pour s'évader. La passion le fait franchir les limites de la morale.</p>
<div class="bf-steps">
<div class="bf-step"><span class="bf-num">1</span><span>Préparation — complicité avec Lescaut, manipulation du supérieur</span></div>
<div class="bf-step"><span class="bf-num">2</span><span>L'action — violence et mort du portier, transgression morale définitive</span></div>
<div class="bf-step"><span class="bf-num">3</span><span>La fuite — exaltation, sentiment de liberté retrouvée</span></div>
</div>
<div class="bf-citation">"Je lui passai mon épée au travers du corps" <em>— Transgression morale, Des Grieux devient criminel</em></div>
<div class="bf-citation teal">"Je me retrouvai libre et heureux" <em>— Paradoxe, liberté criminelle comme bonheur</em></div>`
        },
        {
          title: 'La mort de Manon (EL 7)',
          tag: 'Explication linéaire',
          content: `<p class="bf-badge bf-teal">Explication linéaire 7 — Roman</p>
<p>Dénouement. Manon meurt dans le désert américain. Scène pathétique : pour la première fois, les amants sont vraiment réunis, hors de la société. Manon devient mythe.</p>
<div class="bf-steps">
<div class="bf-step"><span class="bf-num">1</span><span>L'agonie de Manon — Des Grieux assiste impuissant</span></div>
<div class="bf-step"><span class="bf-num">2</span><span>La mort — Manon meurt en aimant Des Grieux. Pathétisme maximal.</span></div>
<div class="bf-step"><span class="bf-num">3</span><span>Le deuil — enterrement dans le désert, Manon mythifiée</span></div>
</div>
<div class="bf-citation">"Elle expira entre mes bras" <em>— Mort de Manon, concision déchirante</em></div>
<div class="bf-citation teal">"Elle était si belle, même en mourant" <em>— Mythification, la beauté perdure</em></div>`
        },
        {
          title: "L'Étranger — Camus (EL 8 associé)",
          tag: 'Texte associé',
          content: `<p class="bf-badge bf-teal">Texte associé EL8 — L'Étranger, 1942</p>
<p>Meursault assiste à l'enterrement de sa mère avec une indifférence apparente qui le rend étranger aux normes sociales.</p>
<div class="bf-citation">"Aujourd'hui, maman est morte. Ou peut-être hier, je ne sais pas." <em>— Incipit célèbre, indifférence apparente, marginalité</em></div>
<div class="bf-citation teal">"Cela ne voulait rien dire." <em>— Absurde, refus des valeurs sociales conventionnelles</em></div>`
        }
      ],
      quiz: [
        { q: "Qui est le narrateur de Manon Lescaut ?", options: ["Manon","L'abbé Prévost","Des Grieux","Tiberge"], correct: 2, expl: "Des Grieux est le narrateur : il raconte l'histoire de sa passion en rétrospective, ce qui crée une narration subjective." },
        { q: "Quel est le parcours associé à Manon Lescaut ?", options: ["Émancipations créatrices","Personnages en marge, du roman au mythe","Les jeux du cœur","Défendre la liberté"], correct: 1, expl: "Le parcours est \"Personnages en marge, du roman au mythe\" : Manon et Des Grieux transgressent les normes sociales et morales." },
        { q: "Où meurt Manon dans le roman ?", options: ["À Paris","À Bordeaux","Dans le désert de Louisiane","En prison"], correct: 2, expl: "Manon meurt dans le désert américain (Louisiane), lieu symbolique de leur amour épuré hors de la société." },
        { q: "Quel personnage représente la voix de la raison et de la religion ?", options: ["Lescaut","Des Grieux","M. de G. M.","Tiberge"], correct: 3, expl: "Tiberge est l'ami vertueux de Des Grieux, voix de la raison et de la religion, repoussoir moral." }
      ],
      flashcards: [
        { front: "\"Je me trouvai enflammé tout d'un coup jusqu'au transport\"", back: "Manon Lescaut — Prévost · Coup de foudre à Amiens, fatalité de la passion" },
        { front: "\"Elle expira entre mes bras\"", back: "Manon Lescaut — Prévost · Mort de Manon dans le désert de Louisiane, scène pathétique" },
        { front: "Parcours de Manon Lescaut", back: "Personnages en marge, du roman au mythe" },
        { front: "Qui raconte Manon Lescaut ?", back: "Le chevalier Des Grieux — narration rétrospective et subjective" },
        { front: "\"Aujourd'hui, maman est morte. Ou peut-être hier, je ne sais pas.\"", back: "L'Étranger — Camus · Incipit célèbre, indifférence apparente, marginalité de Meursault" }
      ]
    },
    theatre: {
      label: 'Théâtre — Musset',
      icon: 'fa-masks-theater',
      fiches: [
        {
          title: "On ne badine pas avec l'amour — Vue d'ensemble",
          tag: 'Œuvre intégrale',
          content: `<p><strong>Pièce romantique en 3 actes (1834)</strong>. Perdican et Camille se retrouvent au château après des années de séparation. Leur amour se heurte aux jeux du cœur et de la parole. Le dénouement est tragique : Rosette meurt en entendant l'aveu de Camille.</p>
<div class="bf-perso-grid">
<div class="bf-perso-card"><strong>Perdican</strong><span>Jeune noble brillant. Use de la rhétorique. Sincère mais orgueilleux.</span></div>
<div class="bf-perso-card"><strong>Camille</strong><span>Revenue du couvent. Se protège derrière la froideur. Son aveu arrive trop tard.</span></div>
<div class="bf-perso-card"><strong>Rosette</strong><span>Sœur de lait de Camille. Innocente. Victime des jeux des nobles.</span></div>
</div>
<div class="bf-theme-tags"><span>Jeux du cœur</span><span>Jeux de la parole</span><span>Amour et masque</span><span>Tragédie romantique</span><span>Aveu tardif</span></div>
<div class="bf-citation">"On ne badine pas avec l'amour" <em>— Titre-morale, la légèreté a des conséquences tragiques</em></div>
<div class="bf-citation teal">"Je t'aimais, et je ne voulais pas le dire" <em>— Aveu trop tard, la parole libérée détruit</em></div>`
        },
        {
          title: 'Les retrouvailles (EL 9)',
          tag: 'Explication linéaire',
          content: `<p class="bf-badge bf-coral">Explication linéaire 9 — Théâtre · Acte I, scène 2</p>
<p>Première rencontre. Froideur apparente de Camille, déception de Perdican. La parole masque les sentiments.</p>
<div class="bf-steps">
<div class="bf-step"><span class="bf-num">1</span><span>Accueil protocolaire — politesse froide, distance imposée par Camille</span></div>
<div class="bf-step"><span class="bf-num">2</span><span>Perdican cherche la complicité ancienne — références nostalgiques</span></div>
<div class="bf-step"><span class="bf-num">3</span><span>Rejet de Camille — la parole comme rempart</span></div>
</div>
<div class="bf-citation">"Tu es belle comme le jour." <em>— Compliment sincère, mais Camille ne répond pas à l'émotion</em></div>
<div class="bf-citation teal">"C'est vrai, je ne suis plus la même." <em>— Masque, le couvent l'a armée contre l'amour</em></div>`
        },
        {
          title: 'La diatribe de Perdican (EL 10)',
          tag: 'Explication linéaire',
          content: `<p class="bf-badge bf-coral">Explication linéaire 10 — Théâtre · Acte II, scène 5</p>
<p>Grand monologue romantique de Perdican. Éloquence, sincérité, orgueil blessé. La rhétorique sert-elle l'amour ou l'ego ?</p>
<div class="bf-steps">
<div class="bf-step"><span class="bf-num">1</span><span>Attaque — Perdican accuse Camille de mensonge et de fausse sagesse</span></div>
<div class="bf-step"><span class="bf-num">2</span><span>Éloge de l'amour et de la jeunesse — lyrisme romantique intense</span></div>
<div class="bf-step"><span class="bf-num">3</span><span>Défi lancé à Camille — l'aimer ou n'avoir rien valu</span></div>
</div>
<div class="bf-citation">"Il y a quelque chose dans ce monde qui mérite qu'on pleure, c'est l'amour" <em>— Lyrisme romantique de Perdican</em></div>
<div class="bf-citation teal">"Tous les hommes sont menteurs, inconstants, faux…" <em>— Jeux de la parole, retournement des leçons du couvent</em></div>`
        },
        {
          title: 'Le dénouement (EL 11)',
          tag: 'Explication linéaire',
          content: `<p class="bf-badge bf-coral">Explication linéaire 11 — Théâtre · Acte III, scènes 7-8</p>
<p>Climax tragique : Camille avoue son amour, Rosette entend tout et meurt. La parole sincère arrive trop tard.</p>
<div class="bf-steps">
<div class="bf-step"><span class="bf-num">1</span><span>L'aveu de Camille — elle cède, dit enfin son amour. Trop tard.</span></div>
<div class="bf-step"><span class="bf-num">2</span><span>Mort de Rosette — prix des jeux du cœur</span></div>
<div class="bf-step"><span class="bf-num">3</span><span>Séparation finale — anti-comédie romantique</span></div>
</div>
<div class="bf-citation">"Je t'aimais, et je ne voulais pas le dire — entends-tu, orgueilleux ?" <em>— Aveu tardif, la sincérité détruit</em></div>
<div class="bf-citation teal">"[Elle est morte.]" (didascalie) <em>— Tragédie, le deuil clôt les jeux</em></div>`
        },
        {
          title: 'La scène du balcon — Cyrano (EL 12 associé)',
          tag: 'Texte associé',
          content: `<p class="bf-badge bf-coral">Texte associé EL12 — Cyrano de Bergerac, Rostand (1897)</p>
<p>Cyrano, caché dans l'ombre, parle à Roxane à la place de Christian. La parole devient le visage.</p>
<div class="bf-citation">"C'est mon âme, moi, que j'offre à vos pieds" <em>— Cyrano dit la vérité sous le masque du mensonge</em></div>
<div class="bf-citation teal">"La nuit, qui efface le factice, / Laisse voir ce qui est vrai" <em>— L'obscurité révèle davantage que la lumière</em></div>`
        }
      ],
      quiz: [
        { q: "En quelle année Musset écrit-il On ne badine pas avec l'amour ?", options: ["1830","1833","1834","1840"], correct: 2, expl: "La pièce est écrite et publiée en 1834, en plein romantisme." },
        { q: "Qui est la victime innocente du dénouement ?", options: ["Camille","Perdican","Rosette","Dame Pluche"], correct: 2, expl: "Rosette, sœur de lait de Camille, meurt en entendant l'aveu d'amour de Camille à Perdican." },
        { q: "Quel est le parcours associé à cette pièce ?", options: ["Émancipations créatrices","Personnages en marge","Les jeux du cœur et de la parole","Défendre la liberté"], correct: 2, expl: "Le parcours est \"Les jeux du cœur et de la parole\" : la pièce explore comment la parole masque et révèle les sentiments." },
        { q: "Qui est l'auteur de Cyrano de Bergerac (texte associé) ?", options: ["Victor Hugo","Alfred de Musset","Edmond Rostand","Molière"], correct: 2, expl: "Edmond Rostand écrit Cyrano de Bergerac en 1897." }
      ],
      flashcards: [
        { front: "\"On ne badine pas avec l'amour\"", back: "Musset — Titre et morale : la légèreté amoureuse a des conséquences tragiques" },
        { front: "\"Il y a quelque chose dans ce monde qui mérite qu'on pleure, c'est l'amour\"", back: "On ne badine pas avec l'amour, Acte II — Diatribe de Perdican, lyrisme romantique" },
        { front: "\"Je t'aimais, et je ne voulais pas le dire\"", back: "On ne badine pas avec l'amour, Acte III — Aveu tardif de Camille, trop tard pour Rosette" },
        { front: "Parcours de la pièce de Musset", back: "Les jeux du cœur et de la parole" },
        { front: "\"C'est mon âme, moi, que j'offre à vos pieds\"", back: "Cyrano de Bergerac — Rostand · Scène du balcon, la parole remplace le visage" }
      ]
    },
    idees: {
      label: "Litt. d'idées — La Boétie",
      icon: 'fa-scroll',
      fiches: [
        {
          title: 'Discours de la servitude volontaire — Vue d\'ensemble',
          tag: 'Œuvre intégrale',
          content: `<p><strong>Essai philosophique et politique (vers 1549)</strong> rédigé par La Boétie. Texte fondateur sur la liberté et la tyrannie. Question centrale : pourquoi les peuples acceptent-ils d'obéir à un tyran alors qu'ils sont plus nombreux ?</p>
<div class="bf-steps">
<div class="bf-step"><span class="bf-num">1</span><span>La question centrale — le mystère de l'obéissance volontaire</span></div>
<div class="bf-step"><span class="bf-num">2</span><span>La nature humaine — l'homme est naturellement libre, la servitude est contre-nature</span></div>
<div class="bf-step"><span class="bf-num">3</span><span>Les causes — habitude, coutume, éducation corrompue, divertissement</span></div>
<div class="bf-step"><span class="bf-num">4</span><span>Les mécanismes — réseau de complices, "dons" du tyran</span></div>
<div class="bf-step"><span class="bf-num">5</span><span>L'amitié vraie comme antidote à la tyrannie</span></div>
</div>
<div class="bf-theme-tags"><span>Liberté naturelle</span><span>Tyrannie</span><span>Servitude consentie</span><span>Résistance passive</span><span>Amitié vraie</span></div>
<div class="bf-citation">"Soyez résolus de ne servir plus, et vous voilà libres" <em>— La servitude ne tient qu'au consentement</em></div>
<div class="bf-citation teal">"Les théâtres, les jeux, les spectacles — c'est l'appât de la servitude" <em>— Le divertissement comme outil d'aliénation</em></div>`
        },
        {
          title: "Le vice qu'on ne peut nommer (EL 13)",
          tag: 'Explication linéaire',
          content: `<p class="bf-badge bf-amber">Explication linéaire 13 — Litt. d'idées</p>
<p>La Boétie analyse la nature profonde du tyran. Réquisitoire par le portrait moral dégradant.</p>
<div class="bf-steps">
<div class="bf-step"><span class="bf-num">1</span><span>Portrait physique et moral du tyran — dégénérescence, lâcheté, dépravation</span></div>
<div class="bf-step"><span class="bf-num">2</span><span>Le "vice qu'on ne peut nommer" — prétérition, insinuation de la corruption totale</span></div>
<div class="bf-step"><span class="bf-num">3</span><span>Conclusion rhétorique — mépris affiché, le tyran ne mérite aucun respect</span></div>
</div>
<div class="bf-citation">"ce vice qu'on ne peut nommer" <em>— Prétérition, nommer en disant qu'on ne peut pas nommer</em></div>
<div class="bf-citation teal">"lâche, mou et efféminé" <em>— Accumulation dégradante, portrait du tyran par ses vices</em></div>`
        },
        {
          title: 'Le secret de la tyrannie (EL 15)',
          tag: 'Explication linéaire',
          content: `<p class="bf-badge bf-amber">Explication linéaire 15 — Litt. d'idées</p>
<p>La Boétie révèle le mécanisme de maintien de la tyrannie : un réseau de complices. Les tyrannisés participent à leur propre oppression.</p>
<div class="bf-steps">
<div class="bf-step"><span class="bf-num">1</span><span>Le réseau de complices — le tyran crée des chaînes de faveurs</span></div>
<div class="bf-step"><span class="bf-num">2</span><span>La chaîne de la tyrannie — chacun opprime le suivant</span></div>
<div class="bf-step"><span class="bf-num">3</span><span>Conclusion — le peuple est l'instrument de sa propre servitude</span></div>
</div>
<div class="bf-citation">"Six ont six cents qui profitent sous eux, et font de leurs six cents ce que les six font au tyran" <em>— Structure fractale du pouvoir</em></div>
<div class="bf-citation teal">"Voilà le secret de toute la tyrannie" <em>— Révélation rhétorique, posture de dénonciateur</em></div>`
        },
        {
          title: 'Le Loup et le Chien — La Fontaine (EL 16 associé)',
          tag: 'Texte associé',
          content: `<p class="bf-badge bf-amber">Texte associé EL16 — Fables, Livre I, fable 5 (1668)</p>
<p>Un loup famélique refuse la vie confortable du chien quand il voit son collier. La liberté vaut mieux que le confort de la servitude.</p>
<div class="bf-steps">
<div class="bf-step"><span class="bf-num">1</span><span>Rencontre — contraste entre loup maigre et chien gras</span></div>
<div class="bf-step"><span class="bf-num">2</span><span>Proposition du chien — servir en échange de nourriture</span></div>
<div class="bf-step"><span class="bf-num">3</span><span>La révélation du collier — le loup comprend le prix de la servitude</span></div>
<div class="bf-step"><span class="bf-num">4</span><span>Refus du loup — il choisit la faim libre plutôt que la chaîne</span></div>
</div>
<div class="bf-citation">"Chemin faisant, il vit le col du Chien pelé" <em>— Le collier révèle la servitude dissimulée</em></div>
<div class="bf-citation teal">"Je ne voudrais pas même à ce prix un trésor" <em>— Éloge de la liberté face aux richesses enchaînées</em></div>
<div class="bf-citation coral">"Et le Loup s'enfuit, et court encore" <em>— Chute dynamique, la fuite = la liberté en acte</em></div>`
        }
      ],
      quiz: [
        { q: "Vers quelle date La Boétie rédige-t-il le Discours de la servitude volontaire ?", options: ["vers 1520","vers 1549","vers 1580","en 1601"], correct: 1, expl: "La Boétie rédige ce texte vers 1549, à environ 16-18 ans. Il sera publié posthumément." },
        { q: "Selon La Boétie, quelle est la première cause de la servitude volontaire ?", options: ["La peur","La coutume","L'argent","L'ignorance"], correct: 1, expl: "\"La première raison de la servitude volontaire, c'est la coutume\" — l'habitude éteint le désir de liberté." },
        { q: "Quel est le parcours associé à l'œuvre de La Boétie ?", options: ["Émancipations créatrices","Les jeux du cœur","Personnages en marge","Défendre et entretenir la liberté"], correct: 3, expl: "Le parcours est \"Défendre et entretenir la liberté\" — toute l'œuvre plaide pour la liberté contre la tyrannie." },
        { q: "Que symbolise le collier dans Le Loup et le Chien de La Fontaine ?", options: ["La richesse","La servitude","La force","L'amitié"], correct: 1, expl: "Le collier est le signe extérieur de la domination et de la servitude consentie du chien." }
      ],
      flashcards: [
        { front: "\"Soyez résolus de ne servir plus, et vous voilà libres\"", back: "Discours de la servitude volontaire — La Boétie · La servitude ne tient qu'au consentement" },
        { front: "\"Six ont six cents qui profitent sous eux\"", back: "Discours de la servitude volontaire — La Boétie · Structure fractale du pouvoir, pyramide de la tyrannie" },
        { front: "Parcours du Discours de la servitude volontaire", back: "Défendre et entretenir la liberté" },
        { front: "\"Et le Loup s'enfuit, et court encore\"", back: "Le Loup et le Chien — La Fontaine · Chute dynamique, la fuite comme liberté en acte" },
        { front: "\"ce vice qu'on ne peut nommer\"", back: "Discours de la servitude volontaire — La Boétie · Prétérition, figure de rhétorique de l'insinuation" }
      ]
    }
  }
};

const out = 'const PROGRAMME = ' + JSON.stringify(PROGRAMME, null, 2) + ';\n';
fs.writeFileSync('education/revision/data.js', out, 'utf8');
console.log('Done! bac_francais added to revision/data.js');

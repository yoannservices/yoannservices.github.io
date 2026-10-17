// ============================================================
//  DONNÉES : Marques & Modèles
// ============================================================

const phoneData = {
  "Apple": {
    icon: "🍎",
    models: [
      "iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16 Plus", "iPhone 16",
      "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15",
      "iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14 Plus", "iPhone 14",
      "iPhone 13 Pro Max", "iPhone 13 Pro", "iPhone 13", "iPhone 13 mini",
      "iPhone 12 Pro Max", "iPhone 12 Pro", "iPhone 12", "iPhone 12 mini",
      "iPhone 11 Pro Max", "iPhone 11 Pro", "iPhone 11",
      "iPhone XS Max", "iPhone XS", "iPhone XR", "iPhone X",
      "iPhone 8 Plus", "iPhone 8", "iPhone 7 Plus", "iPhone 7",
      "iPhone 6s Plus", "iPhone 6s", "iPhone 6 Plus", "iPhone 6",
      "iPhone SE (3ème gén.)", "iPhone SE (2ème gén.)", "iPhone SE (1ère gén.)",
      "iPhone 5s", "iPhone 5c", "iPhone 5"
    ]
  },
  "Samsung": {
    icon: "🌀",
    models: [
      "Galaxy S25 Ultra", "Galaxy S25+", "Galaxy S25",
      "Galaxy S24 Ultra", "Galaxy S24+", "Galaxy S24", "Galaxy S24 FE",
      "Galaxy S23 Ultra", "Galaxy S23+", "Galaxy S23", "Galaxy S23 FE",
      "Galaxy S22 Ultra", "Galaxy S22+", "Galaxy S22", "Galaxy S22 5G",
      "Galaxy S21 Ultra", "Galaxy S21+", "Galaxy S21", "Galaxy S21 FE",
      "Galaxy S20 Ultra", "Galaxy S20+", "Galaxy S20",
      "Galaxy S10", "Galaxy S10+", "Galaxy S10e", "Galaxy S10 5G",
      "Galaxy A56", "Galaxy A55", "Galaxy A54", "Galaxy A53", "Galaxy A52",
      "Galaxy A51", "Galaxy A50", "Galaxy A40", "Galaxy A30", "Galaxy A20",
      "Galaxy A15", "Galaxy A14", "Galaxy A13", "Galaxy A12",
      "Galaxy M56", "Galaxy M55", "Galaxy M54", "Galaxy M53", "Galaxy M52",
      "Galaxy Z Fold 6", "Galaxy Z Fold 5", "Galaxy Z Fold 4", "Galaxy Z Fold 3",
      "Galaxy Z Flip 6", "Galaxy Z Flip 5", "Galaxy Z Flip 4", "Galaxy Z Flip 3"
    ]
  },
  "Xiaomi": {
    icon: "◉",
    models: [
      "Xiaomi 15 Ultra", "Xiaomi 15 Pro", "Xiaomi 15",
      "Xiaomi 14 Ultra", "Xiaomi 14 Pro", "Xiaomi 14",
      "Xiaomi 13 Ultra", "Xiaomi 13 Pro", "Xiaomi 13",
      "Xiaomi 12T Pro", "Xiaomi 12T", "Xiaomi 12 Pro", "Xiaomi 12",
      "Xiaomi 11T Pro", "Xiaomi 11T", "Xiaomi 11 Ultra", "Xiaomi 11",
      "Redmi Note 14 Pro+", "Redmi Note 14 Pro", "Redmi Note 14",
      "Redmi Note 13 Pro+", "Redmi Note 13 Pro", "Redmi Note 13",
      "Redmi Note 12 Pro+", "Redmi Note 12 Pro", "Redmi Note 12", "Redmi Note 12S",
      "Redmi Note 11 Pro+", "Redmi Note 11 Pro", "Redmi Note 11",
      "Redmi Note 10 Pro", "Redmi Note 10", "Redmi Note 9 Pro", "Redmi Note 9",
      "POCO X7 Pro", "POCO X6 Pro", "POCO X5 Pro", "POCO F5", "POCO F4", "POCO F3"
    ]
  },
  "Huawei": {
    icon: "🌸",
    models: [
      "Pura 70 Ultra", "Pura 70 Pro+", "Pura 70 Pro", "Pura 70",
      "P60 Pro", "P60 Pro+", "P60",
      "P50 Pro", "P50 Pro+", "P50",
      "P40 Pro", "P40 Pro+", "P40",
      "Mate 60 Pro+", "Mate 60 Pro", "Mate 60",
      "Mate 50 Pro", "Mate 50", "Mate 50e",
      "Mate 40 Pro", "Mate 40 Pro+", "Mate 40",
      "Nova 12 Ultra", "Nova 12 Pro", "Nova 12",
      "Nova 11 Pro", "Nova 11", "Nova 10 Pro", "Nova 10"
    ]
  },
  "OnePlus": {
    icon: "1+",
    models: [
      "OnePlus 13", "OnePlus 13 Pro",
      "OnePlus 12", "OnePlus 12 Pro",
      "OnePlus 11", "OnePlus 11 Pro", "OnePlus 11T",
      "OnePlus 10 Pro", "OnePlus 10T",
      "OnePlus 9 Pro", "OnePlus 9", "OnePlus 9T",
      "OnePlus 8 Pro", "OnePlus 8", "OnePlus 8T",
      "OnePlus 7 Pro", "OnePlus 7T",
      "OnePlus Nord 4", "OnePlus Nord 3", "OnePlus Nord 3 Pro",
      "OnePlus Nord CE 3 Lite", "OnePlus Nord CE 3", "OnePlus Nord CE 2 Lite"
    ]
  },
  "Google": {
    icon: "G",
    models: [
      "Pixel 9 Pro XL", "Pixel 9 Pro Fold", "Pixel 9 Pro", "Pixel 9 Pro Compact", "Pixel 9",
      "Pixel 8a", "Pixel 8 Pro", "Pixel 8",
      "Pixel 7a", "Pixel 7 Pro", "Pixel 7",
      "Pixel 6a", "Pixel 6 Pro", "Pixel 6", "Pixel 6e",
      "Pixel 5a", "Pixel 5", "Pixel 4a", "Pixel 4a 5G", "Pixel 4"
    ]
  },
  "Sony": {
    icon: "S",
    models: [
      "Xperia 1 VI", "Xperia 1 VI Pro", "Xperia 1 V",
      "Xperia 5 VI", "Xperia 5 V", "Xperia 5 IV",
      "Xperia 10 VI", "Xperia 10 V", "Xperia 10 IV",
      "Xperia 1 IV", "Xperia 1 III", "Xperia 1 II",
      "Xperia 5 III", "Xperia 5 II",
      "Xperia 10 III", "Xperia 10 II"
    ]
  },
  "Motorola": {
    icon: "M",
    models: [
      "Edge 50 Ultra", "Edge 50 Pro", "Edge 50",
      "Edge 40 Ultra", "Edge 40 Pro", "Edge 40 Neo", "Edge 40",
      "Edge 30 Ultra", "Edge 30 Pro", "Edge 30 Neo", "Edge 30",
      "Edge 20 Pro", "Edge 20", "Edge 20 Fusion",
      "Moto G85", "Moto G84", "Moto G83", "Moto G54", "Moto G53", "Moto G52",
      "Moto G31", "Moto G30", "Moto G100",
      "Razr 50 Ultra", "Razr 50", "Razr 40 Ultra", "Razr 40"
    ]
  },
  "Oppo": {
    icon: "O",
    models: [
      "Find X8 Pro", "Find X8 Pro", "Find X7 Pro", "Find X6 Pro", "Find X6",
      "Find X5 Pro", "Find X5", "Find X3 Pro", "Find X3",
      "Reno 12 Pro", "Reno 12", "Reno 11 Pro", "Reno 11", "Reno 10 Pro",
      "Reno 10", "Reno 9 Pro", "Reno 9", "Reno 8 Pro", "Reno 8",
      "Reno 7 Pro", "Reno 7", "Reno 5 Pro", "Reno 5",
      "A3 Pro", "A3", "A2", "A98", "A78", "A58"
    ]
  },
  "Nokia": {
    icon: "N",
    models: [
      "XR21", "XR20", "XR24",
      "X30 5G", "X30", "X20", "X10",
      "G60 5G", "G50 5G", "G40 5G",
      "G42 5G", "G41 5G", "G40 5G", "G30", "G20", "G10",
      "G22", "G21", "G20", "G19", "G11",
      "C32", "C31", "C30", "C20", "C10",
      "5.4", "5.3", "5.2", "5.1", "4.2", "3.2"
    ]
  },
  "Realme": {
    icon: "✨",
    models: [
      "Realme 14 Pro+", "Realme 14 Pro", "Realme 14",
      "Realme 13 Pro+", "Realme 13 Pro", "Realme 13",
      "Realme 12 Pro+", "Realme 12 Pro", "Realme 12",
      "Realme 11 Pro", "Realme 11",
      "Realme GT 7 Pro", "Realme GT 7",
      "Realme GT 6 Pro", "Realme GT 6", "Realme GT 5 Pro", "Realme GT 5",
      "Realme Narzo 70 Pro", "Realme Narzo 70", "Realme Narzo 60 Pro", "Realme Narzo 60"
    ]
  },
  "Vivo": {
    icon: "V",
    models: [
      "Vivo X100 Ultra", "Vivo X100 Pro", "Vivo X100",
      "Vivo X90 Pro+", "Vivo X90 Pro", "Vivo X90",
      "Vivo X80 Pro", "Vivo X80",
      "Vivo Y200 Pro", "Vivo Y200", "Vivo Y100 Pro", "Vivo Y100",
      "Vivo Y99 Pro", "Vivo Y99", "Vivo Y78", "Vivo Y77",
      "Vivo V40 Pro", "Vivo V40", "Vivo V30 Pro", "Vivo V30", "Vivo V29 Pro", "Vivo V29"
    ]
  },
  "TCL": {
    icon: "T",
    models: [
      "TCL 50 Pro", "TCL 50",
      "TCL 40 Pro", "TCL 40 SE",
      "TCL 30 Pro", "TCL 30 SE",
      "TCL 20 Pro 5G", "TCL 20 5G", "TCL 20E"
    ]
  },
  "Nothing": {
    icon: "⚫",
    models: [
      "Nothing Phone 2a", "Nothing Phone 2",
      "Nothing Phone 1"
    ]
  }
};

// ============================================================
//  DONNÉES : Sites de vente de pièces détachées
//  Scores sur 5 — baseRating = note générale
//  brandScores = spécialisation par marque (influe sur le classement)
// ============================================================

const sites = [
  {
    id: "ifixit",
    name: "iFixit",
    url: "https://fr.ifixit.com",
    baseRating: 4.8,
    reviews: "15 400+",
    description: "La référence mondiale de la réparation DIY. Pièces de qualité certifiée, livrées avec des guides de réparation étape par étape et photos.",
    priceRange: "€€€",
    priceClass: "pricey",
    shippingInfo: "3–7 jours",
    freeShipping: "Gratuit dès 35 €",
    returns: "30 jours",
    badges: ["Guides inclus", "Pièces certifiées", "Outils disponibles", "SAV réactif"],
    type: "Spécialiste réparation",
    warning: null,
    brandScores: {
      Apple: 5.0, Samsung: 4.8, Google: 5.0,
      Motorola: 4.6, Xiaomi: 4.4, OnePlus: 4.3,
      Sony: 4.3, Huawei: 4.0, Oppo: 3.9, Nokia: 4.1,
      Realme: 4.2, Vivo: 4.2, TCL: 3.8, Nothing: 3.7
    }
  },
  {
    id: "spareka",
    name: "Spareka",
    url: "https://www.spareka.fr",
    baseRating: 4.5,
    reviews: "8 900+",
    description: "Site français spécialisé en pièces détachées. Vidéos tutoriels intégrées pour guider la réparation, service client francophone.",
    priceRange: "€€",
    priceClass: "mid",
    shippingInfo: "2–5 jours",
    freeShipping: "Gratuit dès 30 €",
    returns: "30 jours",
    badges: ["Site français", "Vidéos tutoriels", "Prix compétitifs", "Service client FR"],
    type: "Spécialiste français",
    warning: null,
    brandScores: {
      Apple: 4.6, Samsung: 4.8, Xiaomi: 4.5,
      Huawei: 4.3, OnePlus: 4.2, Motorola: 4.4,
      Google: 4.2, Sony: 4.0, Oppo: 4.1, Nokia: 4.2,
      Realme: 4.3, Vivo: 4.2, TCL: 4.0, Nothing: 3.8
    }
  },
  {
    id: "gsm55",
    name: "GSM55",
    url: "https://www.gsm55.fr",
    baseRating: 4.2,
    reviews: "5 200+",
    description: "Grossiste français en pièces détachées pour smartphones ouvert aux particuliers. Grand stock et prix attractifs sur les grandes marques.",
    priceRange: "€€",
    priceClass: "mid",
    shippingInfo: "2–4 jours",
    freeShipping: "Gratuit dès 50 €",
    returns: "14 jours",
    badges: ["Site français", "Grand stock", "Prix grossiste", "Particuliers OK"],
    type: "Grossiste (particuliers)",
    warning: null,
    brandScores: {
      Apple: 4.3, Samsung: 4.5, Xiaomi: 4.3,
      Huawei: 4.2, OnePlus: 4.0, Motorola: 4.1,
      Google: 3.9, Sony: 3.8, Oppo: 3.9, Nokia: 4.0,
      Realme: 4.1, Vivo: 4.0, TCL: 3.9, Nothing: 3.6
    }
  },
  {
    id: "pieces-telephone",
    name: "Pièces-Téléphone.fr",
    url: "https://www.pieces-telephone.fr",
    baseRating: 4.1,
    reviews: "3 800+",
    description: "Spécialiste français des pièces détachées toutes marques. Bon référencement des modèles récents et pièces de remplacement compatibles.",
    priceRange: "€€",
    priceClass: "mid",
    shippingInfo: "3–5 jours",
    freeShipping: "Gratuit dès 40 €",
    returns: "14 jours",
    badges: ["Site français", "Pièces compatibles", "Modèles récents"],
    type: "Spécialiste téléphone",
    warning: null,
    brandScores: {
      Apple: 4.3, Samsung: 4.4, Xiaomi: 4.1,
      Huawei: 4.0, OnePlus: 3.9, Motorola: 3.8,
      Google: 3.7, Sony: 3.7, Oppo: 3.8, Nokia: 3.9,
      Realme: 4.0, Vivo: 3.9, TCL: 3.8, Nothing: 3.5
    }
  },
  {
    id: "amazon",
    name: "Amazon France",
    url: "https://www.amazon.fr",
    baseRating: 3.9,
    reviews: "Millions",
    description: "Marketplace généraliste avec une vaste sélection de pièces provenant de nombreux vendeurs tiers. Livraison très rapide via Prime.",
    priceRange: "€€",
    priceClass: "mid",
    shippingInfo: "1–3 jours",
    freeShipping: "Prime ou dès 25 €",
    returns: "30 jours",
    badges: ["Livraison rapide", "Large choix", "Amazon Prime"],
    type: "Marketplace généraliste",
    warning: "Qualité variable selon le vendeur — vérifiez bien les avis et le vendeur.",
    brandScores: {
      Apple: 4.0, Samsung: 3.9, Xiaomi: 3.7,
      Huawei: 3.6, OnePlus: 3.7, Motorola: 3.8,
      Google: 3.6, Sony: 3.6, Oppo: 3.5, Nokia: 3.7,
      Realme: 3.8, Vivo: 3.7, TCL: 3.5, Nothing: 3.3
    }
  },
  {
    id: "mobilefun",
    name: "MobileFun",
    url: "https://www.mobilefun.fr",
    baseRating: 3.8,
    reviews: "4 600+",
    description: "Spécialiste des accessoires mobiles avec une section pièces détachées. Bonne couverture des modèles populaires, expédition depuis l'Europe.",
    priceRange: "€€",
    priceClass: "mid",
    shippingInfo: "3–6 jours",
    freeShipping: "Gratuit dès 25 €",
    returns: "30 jours",
    badges: ["Accessoires & pièces", "Modèles phares", "Livraison Europe"],
    type: "Accessoires & pièces",
    warning: null,
    brandScores: {
      Apple: 4.0, Samsung: 3.9, Xiaomi: 3.7,
      Huawei: 3.6, OnePlus: 3.8, Motorola: 3.7,
      Google: 3.6, Sony: 3.7, Oppo: 3.5, Nokia: 3.5,
      Realme: 3.7, Vivo: 3.6, TCL: 3.4, Nothing: 3.2
    }
  },
  {
    id: "cdiscount",
    name: "Cdiscount",
    url: "https://www.cdiscount.com",
    baseRating: 3.5,
    reviews: "Millions",
    description: "Marketplace française avec vendeurs tiers proposant des pièces à prix très variables. Vérifiez attentivement les fiches produits.",
    priceRange: "€€",
    priceClass: "mid",
    shippingInfo: "2–5 jours",
    freeShipping: "C+ ou dès 25 €",
    returns: "30 jours",
    badges: ["Marketplace française", "Prix variés"],
    type: "Marketplace",
    warning: "Lisez les avis vendeur avant d'acheter — qualité hétérogène.",
    brandScores: {
      Apple: 3.6, Samsung: 3.6, Xiaomi: 3.4,
      Huawei: 3.3, OnePlus: 3.3, Motorola: 3.4,
      Google: 3.2, Sony: 3.2, Oppo: 3.2, Nokia: 3.4,
      Realme: 3.3, Vivo: 3.2, TCL: 3.1, Nothing: 3.0
    }
  },
  {
    id: "ebay",
    name: "eBay France",
    url: "https://www.ebay.fr",
    baseRating: 3.3,
    reviews: "Millions",
    description: "Marketplace neuf et occasion. Pièces parfois introuvables ailleurs à des prix très bas, mais vigilance indispensable sur l'état du produit.",
    priceRange: "€",
    priceClass: "cheap",
    shippingInfo: "Variable",
    freeShipping: "Selon vendeur",
    returns: "Selon vendeur",
    badges: ["Neuf & occasion", "Prix bas", "Pièces rares"],
    type: "Marketplace neuf/occasion",
    warning: "Vérifiez si la pièce est neuve ou d'occasion — lisez l'annonce avec attention.",
    brandScores: {
      Apple: 3.5, Samsung: 3.4, Xiaomi: 3.2,
      Huawei: 3.3, OnePlus: 3.1, Motorola: 3.2,
      Google: 3.0, Sony: 3.1, Oppo: 3.0, Nokia: 3.2,
      Realme: 3.1, Vivo: 3.1, TCL: 3.0, Nothing: 2.9
    }
  },
  {
    id: "aliexpress",
    name: "AliExpress",
    url: "https://fr.aliexpress.com",
    baseRating: 3.0,
    reviews: "Millions",
    description: "Plateforme chinoise avec les prix les plus bas du marché. Stock énorme, mais qualité très variable et délais de livraison longs depuis la Chine.",
    priceRange: "€",
    priceClass: "cheap",
    shippingInfo: "15–30 jours",
    freeShipping: "Souvent gratuit",
    returns: "Protection acheteur",
    badges: ["Prix très bas", "Large stock", "Pièces génériques"],
    type: "Import Chine",
    warning: "Qualité imprévisible et livraison longue (15–30 jours). Prévoyez à l'avance.",
    brandScores: {
      Apple: 3.0, Samsung: 3.0, Xiaomi: 3.2,
      Huawei: 3.1, OnePlus: 3.0, Motorola: 3.0,
      Google: 2.8, Sony: 2.8, Oppo: 3.2, Nokia: 2.9,
      Realme: 3.1, Vivo: 3.2, TCL: 2.9, Nothing: 2.8
    }
  }
];

// ============================================================
//  FONCTIONS UTILITAIRES
// ============================================================

/** Calcule le score de pertinence : 35% note générale + 65% spécialisation marque */
function getScore(site, brand) {
  const brandScore = (site.brandScores[brand] !== undefined)
    ? site.brandScores[brand]
    : site.baseRating;
  const raw = site.baseRating * 0.35 + brandScore * 0.65;
  return Math.round(raw * 10) / 10;
}

/** Affiche des étoiles pleines / demi / vides */
function renderStars(score) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (score >= i)           html += '<span class="star full">★</span>';
    else if (score >= i - 0.5) html += '<span class="star half">★</span>';
    else                       html += '<span class="star empty">☆</span>';
  }
  return html;
}

/** Retourne la classe CSS du badge de score */
function scoreClass(score) {
  if (score >= 4.5) return 'excellent';
  if (score >= 3.8) return 'good';
  return 'ok';
}

/** Retourne médaille + label selon le rang */
function rankDisplay(rank) {
  if (rank === 1) return { medal: '🥇', label: '#1' };
  if (rank === 2) return { medal: '🥈', label: '#2' };
  if (rank === 3) return { medal: '🥉', label: '#3' };
  return { medal: '', label: `#${rank}` };
}

// ============================================================
//  RENDU DES RÉSULTATS
// ============================================================

function renderResults(brand, model) {
  // Calculer les scores et trier du meilleur au moins bon
  const scored = sites
    .map(site => ({ ...site, score: getScore(site, brand) }))
    .sort((a, b) => b.score - a.score);

  // Mettre à jour l'en-tête
  document.getElementById('results-title').textContent =
    `Pièces détachées pour le ${model}`;
  document.getElementById('results-sub').textContent =
    `${scored.length} sites classés par pertinence pour la marque ${brand}`;

  // Générer les cartes
  const listEl = document.getElementById('sites-list');
  listEl.innerHTML = scored.map((site, i) => {
    const rank = i + 1;
    const { medal, label } = rankDisplay(rank);
    const rankClass = rank <= 3 ? `rank-${rank}` : '';

    return `
      <div class="site-card ${rankClass}">
        <div class="site-card-inner">

          <div class="site-rank-bar">
            ${medal ? `<span class="rank-medal">${medal}</span>` : ''}
            <span class="rank-number">${label}</span>
          </div>

          <div class="site-content">
            <div class="site-header">
              <div class="site-name-row">
                <span class="site-name">${site.name}</span>
                <span class="site-type">${site.type}</span>
              </div>
              <div class="score-badge ${scoreClass(site.score)}">
                ★ ${site.score.toFixed(1)}<span class="score-sub">&thinsp;/5</span>
              </div>
            </div>

            <div class="site-stars">
              ${renderStars(site.score)}
              <span class="reviews-count">(${site.reviews} avis)</span>
            </div>

            <p class="site-desc">${site.description}</p>

            <div class="site-meta">
              <div class="meta-item">
                <span class="meta-icon">📦</span>
                <span>Livraison : <strong>${site.shippingInfo}</strong> — ${site.freeShipping}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">🔄</span>
                <span>Retours : <strong>${site.returns}</strong></span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">💰</span>
                <span>Prix : <span class="price-label ${site.priceClass}">${site.priceRange}</span></span>
              </div>
            </div>

            <div class="site-badges">
              ${site.badges.map(b => `<span class="badge">${b}</span>`).join('')}
            </div>

            ${site.warning ? `
              <div class="site-warning">
                ⚠️ ${site.warning}
              </div>
            ` : ''}

            <div class="site-footer">
              <a href="${site.url}" target="_blank" rel="noopener noreferrer" class="visit-btn">
                Visiter le site →
              </a>
            </div>
          </div>

        </div>
      </div>
    `;
  }).join('');

  // Afficher les résultats, masquer l'état vide
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('results').style.display = 'block';

  // Scroll doux vers les résultats
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================================
//  INITIALISATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const brandSelect = document.getElementById('brand-select');
  const modelSelect = document.getElementById('model-select');
  const searchBtn   = document.getElementById('search-btn');
  const resetBtn    = document.getElementById('reset-btn');

  // Peupler les marques
  Object.keys(phoneData).forEach(brand => {
    const opt = document.createElement('option');
    opt.value = brand;
    opt.textContent = `${phoneData[brand].icon}  ${brand}`;
    brandSelect.appendChild(opt);
  });

  // Changement de marque → peupler les modèles
  brandSelect.addEventListener('change', () => {
    const brand = brandSelect.value;
    modelSelect.innerHTML = '<option value="">— Choisir un modèle —</option>';

    if (brand && phoneData[brand]) {
      phoneData[brand].models.forEach(model => {
        const opt = document.createElement('option');
        opt.value = model;
        opt.textContent = model;
        modelSelect.appendChild(opt);
      });
      modelSelect.disabled = false;
    } else {
      modelSelect.disabled = true;
      modelSelect.innerHTML = '<option value="">— Sélectionner d\'abord une marque —</option>';
    }

    modelSelect.value = '';
    searchBtn.disabled = true;
  });

  // Changement de modèle → activer le bouton
  modelSelect.addEventListener('change', () => {
    searchBtn.disabled = !modelSelect.value;
  });

  // Lancer la recherche
  searchBtn.addEventListener('click', () => {
    const brand = brandSelect.value;
    const model = modelSelect.value;
    if (brand && model) renderResults(brand, model);
  });

  // Retour à l'état initial
  resetBtn.addEventListener('click', () => {
    document.getElementById('results').style.display = 'none';
    document.getElementById('empty-state').style.display = 'block';
    brandSelect.value = '';
    modelSelect.innerHTML = '<option value="">— Sélectionner d\'abord une marque —</option>';
    modelSelect.disabled = true;
    searchBtn.disabled = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

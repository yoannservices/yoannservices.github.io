/* Les niveaux. Repère : x vers la droite, z vers l'avant (cap yaw : l'avant pointe vers (sin yaw, cos yaw)), mètres.
   route : points que suivent les chevrons, du départ jusqu'à l'entrée de la place (lissés ensuite).
   spot  : rectangle de la place, `len` le long du cap `yaw`. stars : [temps pour 3 étoiles, temps pour 2 étoiles] en secondes.
   `after` (facultatif) : id du niveau précédent du même lieu ; le niveau commence alors là où l'autre s'est terminé (même voiture). */
export const LEVELS = [
  {
    id: 'ville-1', place: 'ville', chapter: 'Ville', name: 'Centre-ville', car: 'compact',
    blurb: 'Gare-toi en bataille entre deux voitures, rue des Halles.',
    start: { x: 1.6, z: 40 },
    route: [[1.6, 40], [1.6, 19], [1.9, 13.5], [3.2, 9.8], [4.8, 7.2], [7.0, 6.1], [8.0, 6.0]],
    spot: { x: 8.0, z: 6.0, yaw: Math.PI / 2, len: 5.2, wid: 3.1 },
    stars: [20, 30],
  },
  {
    id: 'ville-2', place: 'ville', chapter: 'Ville', name: 'Rue Pasteur', car: 'sedan',
    blurb: 'Un créneau le long du trottoir, entre deux voitures, avec la circulation en face.',
    start: { x: 1.6, z: 40 },
    route: [[1.6, 40], [1.6, 22], [1.7, 12], [2.0, 4.0]],
    spot: { x: 4.4, z: 10, yaw: Math.PI, len: 5.9, wid: 2.4 },
    stars: [24, 36],
  },
  {
    id: 'ville-3', place: 'ville', chapter: 'Ville', name: 'Le supermarché', car: 'wagon',
    blurb: 'Une place étroite entre deux gros SUV, parmi les caddies, les piétons et les voitures qui cherchent une place.',
    start: { x: 35.5, z: 26 },
    route: [[35.5, 26], [35.5, 4], [34, 0.8], [28, 0.6], [20, 0.5], [14, 0.4], [10.6, -0.2], [8.6, -1.0], [7.8, -2.2], [7.8, -4.0], [7.8, -7.1]],
    spot: { x: 7.8, z: -7.1, yaw: Math.PI, len: 5.0, wid: 2.6 },
    stars: [28, 42],
  },
  {
    id: 'ville-4', place: 'ville', chapter: 'Ville', name: 'Parking souterrain', car: 'hatchback',
    blurb: 'Plafond bas, piliers et voitures partout : une place serrée par un pilier.',
    start: { x: -26, z: 9.2 },
    route: [[-26, 9.2], [-12, 8.6], [4, 8.2], [9, 8.0], [11.0, 8.2], [11.9, 8.9], [12.2, 10.0], [12.4, 13.0]],
    spot: { x: 13.0, z: 13.5, yaw: 0, len: 5.0, wid: 2.6 },
    stars: [32, 48],
  },
  {
    id: 'ville-5', place: 'ville', chapter: 'Ville', name: 'La cour du vieux quartier', car: 'hatchback',
    blurb: 'Une ruelle pavée, un porche à peine plus large que la voiture, une cour aux places serrées.',
    start: { x: -1.3, z: 40 },
    route: [[-1.3, 40], [-1.3, 7], [-1.3, 3.7], [-0.2, 1.0], [2.8, 0], [9, 0], [15, 0], [17.5, -1.0], [18.5, -3.5], [18.5, -6.2]],
    spot: { x: 18.5, z: -7.5, yaw: Math.PI, len: 5.0, wid: 2.6 },
    stars: [36, 54],
  },
  {
    id: 'campagne-1', place: 'campagne', chapter: 'Campagne', name: 'La ferme', car: 'pickup',
    blurb: 'Range le pick-up dans la cour, entre deux véhicules, face à la clôture.',
    start: { x: -2, z: 46 },
    route: [[-2, 46], [1, 34], [6, 22], [10.5, 12], [12, 2], [12, -4]],
    spot: { x: 12, z: -9, yaw: Math.PI, len: 6.8, wid: 3.4 },
    stars: [20, 30],
  },
  {
    id: 'campagne-2', place: 'campagne', chapter: 'Campagne', name: 'La place du village', car: 'hatchback',
    blurb: 'Jour de marché : étals, terrasses, piétons et une voiture qui tourne autour de la fontaine.',
    start: { x: 46, z: 0 },
    route: [[46, 0], [26, 0], [19, 0.3], [15.2, 1.8], [12.6, 4.4], [11.4, 8.5], [11.2, 12], [11.2, 15.0]],
    spot: { x: 11.2, z: 19.5, yaw: 0, len: 5.0, wid: 2.6 },
    stars: [24, 36],
  },
  {
    id: 'campagne-3', place: 'campagne', chapter: 'Campagne', name: 'Le hangar à tracteurs', car: 'pickup',
    blurb: 'Entre dans le hangar, contourne le tracteur : la place est au fond, serrée par des caisses.',
    start: { x: 0, z: 40 },
    route: [[0, 40], [0, 22], [0, 2], [0.4, -6], [1.2, -10], [3.8, -13], [6.0, -15.5], [6.4, -18], [6.4, -20.5]],
    spot: { x: 6.4, z: -21.5, yaw: Math.PI, len: 6.2, wid: 3.3 },
    stars: [28, 42],
  },
  {
    id: 'campagne-4', place: 'campagne', chapter: 'Campagne', name: 'Le chemin creux', car: 'wagon',
    blurb: 'Un chemin de 4,7 m entre deux murs de pierre, et une niche à peine plus large que la voiture.',
    start: { x: -3, z: 46 },
    route: [[-3, 46], [-3, 40], [0, 28], [0, 12], [0, 6.5], [0, 1.0]],
    spot: { x: 5.15, z: 4.55, yaw: Math.PI / 2, len: 5.0, wid: 2.6 },
    stars: [32, 48],
  },
  {
    id: 'campagne-5', place: 'campagne', chapter: 'Campagne', name: 'Le vide-grenier', car: 'minivan',
    blurb: 'Un pré plein de voitures garées en épi, de visiteurs et d’étals : trouve la dernière place.',
    start: { x: -30, z: 70 },
    route: [[-30, 70], [-30, 34], [-30, 16], [-28, 11.5], [-20, 10.5], [-6, 10.5], [4, 9.8], [8, 7], [10.2, 3.2]],
    spot: { x: 10.2, z: 3.2, yaw: Math.PI - 0.7, len: 5.2, wid: 2.9 },
    stars: [36, 54],
  },
  {
    id: 'foret-1', place: 'foret', chapter: 'Forêt', name: 'La clairière', car: 'offroad',
    blurb: 'Suis le chemin de terre entre les arbres et gare le 4x4 entre les deux troncs.',
    start: { x: -8, z: 44 },
    route: [[-8, 44], [-8, 28], [0, 18], [5.5, 8], [6, -1]],
    spot: { x: 6, z: -10, yaw: Math.PI, len: 6.0, wid: 3.0 },
    stars: [20, 30],
  },
  {
    id: 'foret-2', place: 'foret', chapter: 'Forêt', name: 'Le camping', car: 'suv',
    blurb: 'Fais le tour du feu de camp et glisse-toi sur un emplacement entre une caravane et un pin.',
    start: { x: 0, z: 56 },
    route: [[0, 56], [0, 34], [0, 22], [2.2, 16.9], [7.9, 14.7], [12.9, 10.4], [15.7, 5.4], [16.9, 2.0], [19.6, 0.4], [22.5, 0.0]],
    spot: { x: 25.4, z: 0, yaw: Math.PI / 2, len: 5.6, wid: 3.0 },
    stars: [24, 36],
  },
  {
    id: 'foret-3', place: 'foret', chapter: 'Forêt', name: 'La scierie', car: 'pickup',
    blurb: 'Une cour de scierie : le pick-up doit entrer dans un couloir de 3,4 m entre deux piles de grumes.',
    start: { x: -4, z: 46 },
    route: [[-4, 46], [-6, 36], [-6, 24], [-5, 14], [-1, 6], [4, 0], [8, -3], [8, -6]],
    spot: { x: 8, z: -9, yaw: Math.PI, len: 6.4, wid: 3.2 },
    stars: [28, 42],
  },
  {
    id: 'foret-4', place: 'foret', chapter: 'Forêt', name: 'Le chalet', car: 'wagon',
    blurb: 'Contre la façade du chalet, entre un tas de bois et un pick-up : une place de poche.',
    start: { x: 16, z: 52 },
    route: [[16, 52], [16, 44], [12, 30], [6, 20], [1, 10], [-4, 2], [-5.6, -2], [-6, -5.5]],
    spot: { x: -6, z: -7.0, yaw: Math.PI, len: 4.8, wid: 2.7 },
    stars: [32, 48],
  },
  {
    id: 'foret-5', place: 'foret', chapter: 'Forêt', name: 'Le pont de bois', car: 'suv',
    blurb: 'Traverse le pont à voie unique, croise les randonneurs, puis gare le SUV entre une voiture et un rocher.',
    start: { x: 0, z: 50 },
    route: [[0, 50], [0, 30], [0, 8], [0, 3.4], [0, -3.4], [0.4, -8], [2.8, -12], [6.0, -14.2], [7.3, -15.6]],
    spot: { x: 7.4, z: -18.5, yaw: Math.PI, len: 5.8, wid: 3.0 },
    stars: [36, 54],
  },
  {
    id: 'montagne-1', place: 'montagne', chapter: 'Montagne', name: 'Le belvédère', car: 'suv',
    blurb: 'Au bord du précipice : gare le SUV face au garde-corps, entre deux véhicules.',
    start: { x: 16, z: 36 },
    route: [[16, 36], [16, 30], [8, 22], [2, 14], [0, 4], [0, -7], [1.5, -10.5], [5, -12], [10, -12], [13, -12]],
    spot: { x: 15.6, z: -12, yaw: Math.PI / 2, len: 6.6, wid: 3.2 },
    stars: [20, 30],
  },
  {
    id: 'montagne-2', place: 'montagne', chapter: 'Montagne', name: 'La station de ski', car: 'suv',
    blurb: 'Parking enneigé : skieurs, voitures qui cherchent une place et congères entre les rangées.',
    start: { x: 24, z: 50 },
    route: [[24, 50], [24, 24], [22.5, 14], [17, 9.4], [11.5, 8.9], [8.8, 8.0]],
    spot: { x: 6.75, z: 4, yaw: Math.PI, len: 5.0, wid: 2.7 },
    stars: [24, 36],
  },
  {
    id: 'montagne-3', place: 'montagne', chapter: 'Montagne', name: 'L’aire du col', car: 'wagon',
    blurb: 'Un créneau entre deux camping-cars, le long du garde-corps, avec la circulation du col.',
    start: { x: 1.6, z: 40 },
    route: [[1.6, 40], [1.6, 22], [4, 14], [8.4, 10.5], [10.4, 6.5], [10.4, -3], [10.4, -6.5]],
    spot: { x: 13.2, z: -2.0, yaw: Math.PI, len: 6.4, wid: 2.6 },
    stars: [28, 42],
  },
  {
    id: 'montagne-4', place: 'montagne', chapter: 'Montagne', name: 'Le village alpin', car: 'compact',
    blurb: 'Une ruelle enneigée entre des chalets, et une niche à peine plus large que la voiture.',
    start: { x: 0.3, z: 44 },
    route: [[0.3, 44], [0.3, 16], [-0.9, 7], [-1.4, 2], [-1.4, -3.0]],
    spot: { x: 5.9, z: 0, yaw: Math.PI / 2, len: 5.0, wid: 2.3 },
    stars: [32, 48],
  },
  {
    id: 'montagne-5', place: 'montagne', chapter: 'Montagne', name: 'Le garage du téléphérique', car: 'suv',
    blurb: 'Creusé dans la roche : plafond bas, piliers, skieurs, et la place la plus serrée du jeu.',
    start: { x: -17.5, z: 1.4 },
    route: [[-17.5, 1.4], [-8, 1.4], [2, 1.2], [6.5, 1.0], [8.6, 1.8], [9.6, 3.2], [10.0, 5.5]],
    spot: { x: 10.4, z: 5.75, yaw: 0, len: 5.0, wid: 2.6 },
    stars: [36, 54],
  },
];

export const levelById = (id) => LEVELS.find((l) => l.id === id);
export const starsFor = (level, time) => (time <= level.stars[0] ? 3 : time <= level.stars[1] ? 2 : 1);

/* Position et cap de départ : celui du niveau, ou l'arrivée du niveau précédent du même lieu (`after`). */
export function startOf(level) {
  const prev = level.after && levelById(level.after);
  if (prev) return { x: prev.spot.x, z: prev.spot.z, yaw: prev.spot.yaw, car: prev.car };
  const [a, b] = level.route;
  return { x: level.start.x, z: level.start.z, yaw: Math.atan2(b[0] - a[0], b[1] - a[1]), car: level.car };
}

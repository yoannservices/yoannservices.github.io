/**
 * ReactorDrawing : dessin SVG complet de l'arc réacteur (cercle de 200x200, centre en 100,100).
 * À placer dans un <svg viewBox="0 0 200 200">. Chaque demi-sphère n'en affiche que la moitié grâce à son viewBox.
 * Props :
 * - id : suffixe unique pour les identifiants SVG (gradients, filtres). Sans lui, les deux portes
 *   se partageraient les mêmes définitions et l'une écraserait l'autre.
 */

type ReactorDrawingProps = {
  id: string;
};

const ReactorDrawing = ({ id }: ReactorDrawingProps) => (
  <>
    <defs>
      <radialGradient id={`core-${id}`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="45%" stopColor="#d9fbff" />
        <stop offset="100%" stopColor="#4fd8ff" />
      </radialGradient>
      <radialGradient id={`halo-${id}`} cx="50%" cy="50%" r="50%">
        <stop offset="70%" stopColor="#00d9ff" stopOpacity="0" />
        <stop offset="100%" stopColor="#00d9ff" stopOpacity="0.45" />
      </radialGradient>
      <linearGradient id={`metal-${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#5a6a78" />
        <stop offset="50%" stopColor="#1c2630" />
        <stop offset="100%" stopColor="#47535f" />
      </linearGradient>
      <filter id={`glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Halo lumineux autour du réacteur */}
    <circle cx="100" cy="100" r="99" fill={`url(#halo-${id})`} />

    {/* Boîtier extérieur en métal */}
    <circle cx="100" cy="100" r="94" fill={`url(#metal-${id})`} stroke="#8fa3b3" strokeWidth="1.5" />
    <circle cx="100" cy="100" r="86" fill="#0d141b" stroke="#2c3a47" strokeWidth="1" />

    {/* Petites encoches sur le boîtier (24) */}
    {Array.from({ length: 24 }).map((_, i) => (
      <rect key={i} x="98.5" y="7" width="3" height="6" fill="#8fa3b3" transform={`rotate(${i * 15} 100 100)`} />
    ))}

    {/* Anneau lumineux extérieur */}
    <circle cx="100" cy="100" r="80" fill="none" stroke="#7df3ff" strokeWidth="3" filter={`url(#glow-${id})`} />

    {/* Fond sombre derrière les bobines */}
    <circle cx="100" cy="100" r="74" fill="#07202b" stroke="#1d6f86" strokeWidth="1" />

    {/* 10 bobines en forme de trapèze (elles tournent lentement) */}
    <g className="reactor-coils" style={{ transformOrigin: '100px 100px' }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <path
          key={i}
          d="M 89 30 L 111 30 L 106 56 L 94 56 Z"
          fill="#bff7ff"
          stroke="#00d9ff"
          strokeWidth="1"
          filter={`url(#glow-${id})`}
          transform={`rotate(${i * 36} 100 100)`}
        />
      ))}
    </g>

    {/* Anneau intérieur */}
    <circle cx="100" cy="100" r="46" fill="#05141c" stroke="#7df3ff" strokeWidth="2.5" filter={`url(#glow-${id})`} />
    <circle cx="100" cy="100" r="38" fill="none" stroke="#00d9ff" strokeWidth="1" opacity="0.7" />

    {/* Noyau central blanc-bleu */}
    <circle className="reactor-core" cx="100" cy="100" r="30" fill={`url(#core-${id})`} filter={`url(#glow-${id})`} />
  </>
);

export default ReactorDrawing;

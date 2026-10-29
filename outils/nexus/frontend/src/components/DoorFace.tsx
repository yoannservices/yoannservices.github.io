import ReactorDrawing from './ReactorDrawing';
import { useI18n } from '../i18n/LangueProvider';

/**
 * DoorFace : la face d'une porte de l'écran d'accueil (titre NEXUS en haut, cœur d'Iron Man en dessous).
 * Les deux portes affichent le MÊME décor, large comme l'écran : chaque porte n'en montre que sa moitié,
 * donc le titre et le cœur se coupent en deux naturellement quand les portes s'ouvrent.
 * Props :
 * - id : "l" ou "r", transmis au dessin du réacteur pour que ses identifiants SVG soient uniques.
 * - decorative : vrai pour la copie de droite, cachée aux lecteurs d'écran (le titre n'est lu qu'une fois).
 */

type DoorFaceProps = {
  id: string;
  decorative?: boolean;
};

const DoorFace = ({ id, decorative = false }: DoorFaceProps) => {
  const { t } = useI18n();

  return (
    <div className="door-face" aria-hidden={decorative || undefined}>
      <div className="text-center pt-[6vh]">
        <h1 className="door-title neon-text">NEXUS</h1>
        <p className="text-sm sm:text-lg font-light text-blue-300 tracking-[0.5em] mt-3">{t.interface.portes.sousTitre}</p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <svg className="door-reactor" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <ReactorDrawing id={id} />
        </svg>
      </div>

      <p className="door-hint text-center pb-[6vh] text-cyan-300 tracking-[0.35em] text-sm">
        {t.interface.portes.indice}
      </p>
    </div>
  );
};

export default DoorFace;

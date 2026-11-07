// Vrais modèles .glb du trafic et des piétons (voir assets/models/CREDITS.md), prêts à instancier.
import { InstancedMesh } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { bakeParts } from '../../../../assets/glb.js';

export const CAR_FILES = ['car-compact', 'car-coupe', 'car-hatchback', 'car-minivan', 'car-offroad', 'car-pickup', 'car-sedan', 'car-sport', 'car-suv', 'car-wagon', 'veh-taxi', 'veh-police_sedan', 'veh-postvan'].map((f) => 'npc/' + f);
export const PERSON_FILE = 'proportional_low_poly_man__free_download', PERSON_SCALE = 1.75 / 5.75;   // modèle de 5,75 unités de haut -> 1,75 m

export async function loadKit(file, scale = 1) {
  const url = new URL(`../../assets/models/${file}.glb`, location.href).href;
  const g = await window.GameLoader.trackPromise('Modèle 3D ' + file + '.glb', new GLTFLoader().loadAsync(url));
  return bakeParts(g.scene, scale);
}

/* Un InstancedMesh par pièce du kit, `n` places chacun ; renvoie { meshes, set(i, matrix) }. */
export function instanceKit(scene, kit, n, castShadow = true) {
  const meshes = kit.parts.map((p) => {
    const m = new InstancedMesh(p.geo, p.mat, n);
    m.frustumCulled = false; m.castShadow = castShadow; m.count = 0; scene.add(m);
    return m;
  });
  return { meshes, set(i, mat) { for (const m of meshes) m.setMatrixAt(i, mat); }, tint(i, color) { for (const m of meshes) m.setColorAt(i, color); }, commit(count) { for (const m of meshes) { m.count = count; m.instanceMatrix.needsUpdate = true; } } };
}

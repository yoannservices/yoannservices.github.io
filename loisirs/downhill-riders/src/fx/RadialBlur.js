/* Léger flou radial en vitesse : passe plein écran (8 échantillons vers le centre), activée seulement quand la vitesse le justifie. */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const RadialShader = {
  uniforms: { tDiffuse: { value: null }, strength: { value: 0 }, aspect: { value: 1 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float strength; uniform float aspect; varying vec2 vUv;
    void main(){
      vec2 d = vUv - vec2(0.5, 0.45); float r = length(d * vec2(aspect, 1.0));
      float k = strength * smoothstep(0.18, 0.85, r);
      vec4 c = texture2D(tDiffuse, vUv) * 0.2;
      for (int i = 1; i <= 4; i++) { float s = float(i) / 4.0 * k; c += texture2D(tDiffuse, vUv - d * s) * 0.2; }
      gl_FragColor = c;
    }`,
};

export class Fx {
  constructor(renderer, scene, camera) {
    this.renderer = renderer; this.scene = scene; this.camera = camera; this.enabled = true; this.strength = 0;
    this.composer = new EffectComposer(renderer); this.composer.addPass(new RenderPass(scene, camera));
    this.pass = new ShaderPass(RadialShader); this.composer.addPass(this.pass); this.composer.addPass(new OutputPass());
  }
  resize(w, h) { this.composer.setSize(w, h); this.pass.uniforms.aspect.value = w / h; }
  /* speed01 : 0..1 */
  render(speed01) {
    this.strength += ((this.enabled ? Math.max(0, speed01 - 0.45) * 0.09 : 0) - this.strength) * 0.1;
    if (this.strength < 0.004) { this.renderer.render(this.scene, this.camera); return; }
    this.pass.uniforms.strength.value = this.strength; this.composer.render();
  }
}

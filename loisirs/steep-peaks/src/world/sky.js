import * as THREE from 'three';
import { lerp, sstep, clamp } from '../core/config.js';

const col = (h) => new THREE.Color(h);
const NIGHT_TOP = col(0x03050f), NIGHT_HOR = col(0x0d1428), DAY_TOP = col(0x3b78d8), DAY_HOR = col(0xb4d2f0);
const DUSK = col(0xff8a4a), GRAY = col(0x9aa3b0), SUN_WARM = col(0xffb070), SUN_WHITE = col(0xfff4e4), MOON = col(0x6f86c8);

function cloudTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const g = c.getContext('2d');
  for (let i = 0; i < 16; i++) {
    const x = 40 + Math.random() * 176, y = 50 + Math.random() * 40, r = 20 + Math.random() * 34;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 128);
  }
  return new THREE.CanvasTexture(c);
}

export class Sky {
  constructor(scene) {
    this.hour = 9.5; this.timeScale = 1 / 30;
    this.sun = new THREE.Vector3(0, 1, 0);
    this.dayF = 1;
    this.uni = {
      uSun: { value: this.sun }, uTop: { value: new THREE.Color() }, uHor: { value: new THREE.Color() },
      uNight: { value: 0 }, uCloud: { value: 0 },
    };
    this.dome = new THREE.Mesh(
      new THREE.SphereGeometry(4500, 24, 14),
      new THREE.ShaderMaterial({
        uniforms: this.uni, side: THREE.BackSide, depthWrite: false, fog: false,
        vertexShader: 'varying vec3 vDir; void main(){ vDir=normalize(position); gl_Position=(projectionMatrix*modelViewMatrix*vec4(position,1.)).xyww; }',
        fragmentShader: `varying vec3 vDir; uniform vec3 uSun,uTop,uHor; uniform float uNight,uCloud;
          void main(){
            vec3 d=normalize(vDir); float h=max(d.y,0.);
            vec3 c=mix(uHor,uTop,pow(h,0.45));
            float s=max(dot(d,normalize(uSun)),0.), cl=1.-uCloud;
            c+=vec3(1.,.8,.55)*pow(s,14.)*0.3*(1.-uNight)*cl;
            c+=vec3(1.,.96,.88)*smoothstep(0.9992,0.9997,s)*2.*cl;
            float m=max(dot(d,-normalize(uSun)),0.);
            c+=vec3(.85,.9,1.)*smoothstep(0.9994,0.9998,m)*uNight*cl;
            vec3 p=floor(d*230.); float r=fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);
            c+=vec3(step(0.9972,r))*uNight*cl*smoothstep(0.02,0.25,d.y);
            gl_FragColor=vec4(c,1.);
            #include <colorspace_fragment>
          }`,
      }),
    );
    this.dome.frustumCulled = false; this.dome.renderOrder = -10;
    scene.add(this.dome);
    this.sunLight = new THREE.DirectionalLight(0xffffff, 2);
    this.hemi = new THREE.HemisphereLight(0xaac8ff, 0xdfe8f5, 0.8);
    scene.add(this.sunLight, this.sunLight.target, this.hemi);
    scene.fog = new THREE.Fog(0xb4d2f0, 200, 780);
    this.scene = scene;
    const tex = cloudTexture();
    this.clouds = [];
    for (let i = 0; i < 30; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, opacity: 0.8 }));
      const a = Math.random() * 6.283, r = 500 + Math.random() * 2600;
      s.position.set(Math.cos(a) * r, 380 + Math.random() * 260, Math.sin(a) * r);
      s.scale.set(500 + Math.random() * 600, 160 + Math.random() * 120, 1);
      scene.add(s); this.clouds.push(s);
    }
  }

  get label() {
    const h = Math.floor(this.hour), m = Math.floor((this.hour % 1) * 60);
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }

  update(dt, cam, w) {
    this.hour = (this.hour + dt * this.timeScale) % 24;
    const a = ((this.hour - 6) / 24) * Math.PI * 2;
    this.sun.set(Math.cos(a) * 0.55, Math.sin(a), Math.cos(a) * 0.45).normalize();
    const e = this.sun.y, dayF = (this.dayF = sstep(-0.1, 0.22, e));
    const dusk = clamp(1 - Math.abs(e - 0.02) / 0.28, 0, 1) * (1 - w.dim * 0.7);
    const top = NIGHT_TOP.clone().lerp(DAY_TOP, dayF), hor = NIGHT_HOR.clone().lerp(DAY_HOR, dayF).lerp(DUSK, dusk * 0.75);
    const gray = GRAY.clone().multiplyScalar(0.12 + 0.88 * dayF);
    top.lerp(gray, w.dim * 0.85); hor.lerp(gray, w.dim * 0.9);
    this.uni.uTop.value.copy(top); this.uni.uHor.value.copy(hor);
    this.uni.uNight.value = 1 - dayF; this.uni.uCloud.value = w.dim;
    this.dome.position.copy(cam.position);
    // brouillard = couleur de l'horizon
    this.scene.fog.color.copy(hor); this.scene.fog.near = w.fogNear; this.scene.fog.far = w.fogFar;
    // lumières
    const moon = e < -0.05;
    const dir = moon ? this.sun.clone().negate() : this.sun;
    this.sunLight.position.copy(cam.position).addScaledVector(dir, 500);
    this.sunLight.target.position.copy(cam.position);
    this.sunLight.color.copy(moon ? MOON : SUN_WARM.clone().lerp(SUN_WHITE, sstep(0.05, 0.5, e)));
    this.sunLight.intensity = (moon ? 1.1 * (1 - dayF) : 0.3 + 3.3 * dayF) * (1 - 0.5 * w.dim);
    this.hemi.color.copy(top.clone().lerp(new THREE.Color(1, 1, 1), 0.5)); this.hemi.groundColor.copy(hor).multiplyScalar(0.8 + 0.2 * dayF);
    this.hemi.intensity = 0.5 + 1.8 * dayF + 0.4 * w.dim;
    // nuages : dérive avec le vent, recyclage autour de la caméra
    const cc = new THREE.Color(1, 1, 1).lerp(DUSK, dusk * 0.5).multiplyScalar(0.25 + 0.75 * dayF).lerp(gray, w.dim * 0.7);
    for (const c of this.clouds) {
      c.position.x += w.wind * 2.5 * dt;
      const dx = c.position.x - cam.position.x, dz = c.position.z - cam.position.z;
      if (dx > 3200) c.position.x -= 6400; else if (dx < -3200) c.position.x += 6400;
      if (dz > 3200) c.position.z -= 6400; else if (dz < -3200) c.position.z += 6400;
      c.material.color.copy(cc); c.material.opacity = 0.55 + 0.4 * w.dim;
    }
  }
}

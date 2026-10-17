'use strict';
/* Effets : post-traitement façon caméra FPV (grand-angle, aberration, neige analogique ou
   macro-blocs numériques), particules (fumée, poussière) et son des moteurs. */

// ═══════════ Post-traitement ═══════════
const Post = (() => {
  let rt, quadScene, quadCam, mat;
  function init(renderer) {
    const opts = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
    rt = renderer.capabilities.isWebGL2 && THREE.WebGLMultisampleRenderTarget
      ? new THREE.WebGLMultisampleRenderTarget(4, 4, opts) : new THREE.WebGLRenderTarget(4, 4, opts);
    if (rt.samples !== undefined) rt.samples = 4;
    mat = new THREE.ShaderMaterial({
      uniforms: {
        tD: { value: rt.texture }, res: { value: new THREE.Vector2(1, 1) }, t: { value: 0 }, k: { value: 0.3 }, aspect: { value: 1 },
        analog: { value: 1 }, stat: { value: 0 }, tear: { value: 0 }, ca: { value: 0.012 }, vig: { value: 0.5 }, block: { value: 0 }, mono: { value: 0 },
        flash: { value: 0 },
      },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
      fragmentShader: `
        uniform sampler2D tD; uniform vec2 res; uniform float t, k, aspect, analog, stat, tear, ca, vig, block, mono, flash;
        varying vec2 vUv;
        float h1(vec2 p){ return min(fract(sin(dot(mod(p, 1024.), vec2(127.1, 311.7))) * 43758.5453), .9999); }
        vec2 dist(vec2 uv, float kk){
          vec2 p = uv * 2. - 1.; vec2 pa = vec2(p.x * aspect, p.y);
          float r2 = dot(pa, pa), m2 = aspect * aspect + 1.;
          return p * ((1. + kk * r2) / (1. + kk * m2)) * .5 + .5;
        }
        void main(){
          vec2 uv = vUv;
          // déchirures horizontales (signal faible)
          float line = floor(uv.y * 220.);
          float fr = floor(t * 30.);
          uv.x += (h1(vec2(line, fr)) - .5) * .05 * tear * step(.6, h1(vec2(line * .37, fr)));
          uv.y += tear * .02 * sin(t * 3.) * step(.85, h1(vec2(fr, 3.)));
          // macro-blocs (numérique)
          if (block > .003) { float b = mix(320., 18., block); vec2 bs = vec2(b * aspect, b); vec2 q = floor(uv * bs) / bs; float lag = step(.5, h1(q + fr)); uv = mix(uv, q + .5 / bs, lag * step(.15, block)); }
          vec2 duv = dist(uv, k);
          vec3 col;
          col.r = texture2D(tD, dist(uv, k * (1. + ca * 4.)) + vec2(ca * .06 * analog, 0.)).r;
          col.g = texture2D(tD, duv).g;
          col.b = texture2D(tD, dist(uv, k * (1. - ca * 4.)) - vec2(ca * .06 * analog, 0.)).b;
          if (analog > .5) {
            // flou horizontal et bavure de chroma du PAL/NTSC
            vec2 o = vec2(1.6 / res.x, 0.);
            vec3 bl = (texture2D(tD, duv + o).rgb + texture2D(tD, duv - o).rgb + texture2D(tD, duv + o * 2.5).rgb) / 3.;
            col = mix(col, bl, .45);
            float l = dot(col, vec3(.299, .587, .114));
            col = mix(vec3(l), col, 1.18);
            col = (col - .5) * 1.08 + .5;
            col += (h1(vUv * res + fract(t) * 97.) - .5) * .07;
            col *= .95 + .05 * sin(vUv.y * res.y * 1.57);
          } else {
            col = (col - .5) * 1.04 + .5;
          }
          // neige
          if (stat > .003) {
            float s = h1(floor(vUv * res / 1.5) + fract(t * 7.) * 131.);
            col = mix(col, vec3(s), stat * .92);
            float band = step(1. - stat * .35, h1(vec2(line * .11, floor(t * 24.))));
            col = mix(col, vec3(.95), band * .7);
          }
          if (mono > .003) col = mix(col, vec3(dot(col, vec3(.3, .59, .11))), mono);
          if (any(lessThan(duv, vec2(0.))) || any(greaterThan(duv, vec2(1.)))) col = vec3(0.);
          vec2 vc = (vUv - .5) * vec2(aspect, 1.);
          col *= 1. - vig * smoothstep(.45, 1.3, length(vc) * 1.1);
          col = mix(col, vec3(1., .96, .9), flash);
          gl_FragColor = vec4(clamp(col, 0., 1.), 1.);
        }`,
      depthTest: false, depthWrite: false,
    });
    quadScene = new THREE.Scene();
    quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat); q.frustumCulled = false;
    quadScene.add(q);
  }
  function resize(w, h) { rt.setSize(w, h); mat.uniforms.res.value.set(w, h); mat.uniforms.aspect.value = w / h; }
  function render(renderer, scene, camera, p) {
    const u = mat.uniforms;
    for (const k in p) if (u[k]) u[k].value = p[k];
    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(quadScene, quadCam);
  }
  // Position écran d'un point source après distorsion (inverse de dist(), par Newton)
  function distortScreen(x, y, k, aspect) {
    if (!k) return [x, y];
    const m2 = aspect * aspect + 1;
    const rs = Math.hypot(x * aspect, y);
    if (rs < 1e-6) return [x, y];
    let r = rs;
    for (let i = 0; i < 8; i++) {
      const f = r * (1 + k * r * r) / (1 + k * m2) - rs;
      const d = (1 + 3 * k * r * r) / (1 + k * m2);
      r -= f / d;
    }
    return [x * r / rs, y * r / rs];
  }
  return { init, resize, render, distortScreen, get uniforms() { return mat.uniforms; } };
})();

// ═══════════ Particules ═══════════
const Particles = (() => {
  const N = 1400;
  const pos = new Float32Array(N * 3), size = new Float32Array(N), alpha = new Float32Array(N), color = new Float32Array(N * 3);
  const vel = new Float32Array(N * 3), age = new Float32Array(N).fill(1e9), life = new Float32Array(N).fill(1), s0 = new Float32Array(N), s1 = new Float32Array(N), a0 = new Float32Array(N);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aCol', new THREE.BufferAttribute(color, 3));
  const mat = new THREE.ShaderMaterial({
    uniforms: { scale: { value: 500 } },
    vertexShader: `attribute float aSize; attribute float aAlpha; attribute vec3 aCol; uniform float scale; varying float vA; varying vec3 vC;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_PointSize = aSize * scale / max(.1, -mv.z); gl_Position = projectionMatrix * mv; vA = aAlpha; vC = aCol; }`,
    fragmentShader: `varying float vA; varying vec3 vC;
      void main(){ vec2 c = gl_PointCoord - .5; float d = length(c); if (d > .5 || vA < .003) discard;
        float a = vA * smoothstep(.5, .05, d); gl_FragColor = vec4(vC * (.85 + .15 * (1. - d * 2.)), a); }`,
    transparent: true, depthWrite: false,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  World.scene.add(points);
  let head = 0;
  function emit(p, vx, vy, vz, sz0, sz1, lf, r, g, b, a) {
    const i = head; head = (head + 1) % N;
    pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
    vel[i * 3] = vx; vel[i * 3 + 1] = vy; vel[i * 3 + 2] = vz;
    age[i] = 0; life[i] = lf; s0[i] = sz0; s1[i] = sz1; a0[i] = a;
    color[i * 3] = r; color[i * 3 + 1] = g; color[i * 3 + 2] = b;
    geo.attributes.aCol.needsUpdate = true;
  }
  function update(dt, wind) {
    const damp = Math.exp(-dt * 1.4);
    for (let i = 0; i < N; i++) {
      if (age[i] >= life[i]) { alpha[i] = 0; continue; }
      age[i] += dt;
      const t = age[i] / life[i];
      const j = i * 3;
      vel[j] = vel[j] * damp + wind.x * (1 - damp); vel[j + 1] = vel[j + 1] * damp + 0.25 * dt; vel[j + 2] = vel[j + 2] * damp + wind.z * (1 - damp);
      pos[j] += vel[j] * dt; pos[j + 1] += vel[j + 1] * dt; pos[j + 2] += vel[j + 2] * dt;
      size[i] = s0[i] + (s1[i] - s0[i]) * Math.sqrt(t);
      alpha[i] = a0[i] * (1 - t) * Math.min(1, t * 10);
    }
    geo.attributes.position.needsUpdate = true; geo.attributes.aSize.needsUpdate = true; geo.attributes.aAlpha.needsUpdate = true;
  }
  function setScale(viewH, vfovDeg) { mat.uniforms.scale.value = viewH * 0.5 / Math.tan(vfovDeg * Math.PI / 360); }
  return { emit, update, setScale };
})();

// ═══════════ Son ═══════════
const Sound = (() => {
  let ctx = null, master, filt, oscs = [], gains = [], noiseGain, noiseFilt, hiss, hissGain, ok = false;
  function start() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 2000; filt.Q.value = 0.8; filt.connect(master);
    for (let i = 0; i < 4; i++) {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 100;
      const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = 200;
      const g = ctx.createGain(); g.gain.value = 0;
      const g2 = ctx.createGain(); g2.gain.value = 0.5;
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(filt);
      o.start(); o2.start();
      oscs.push([o, o2]); gains.push(g);
    }
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    noiseFilt = ctx.createBiquadFilter(); noiseFilt.type = 'bandpass'; noiseFilt.frequency.value = 700; noiseFilt.Q.value = 0.5;
    noiseGain = ctx.createGain(); noiseGain.gain.value = 0;
    src.connect(noiseFilt); noiseFilt.connect(noiseGain); noiseGain.connect(master);
    // souffle du récepteur vidéo (neige)
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000;
    hissGain = ctx.createGain(); hissGain.gain.value = 0;
    src.connect(hp); hp.connect(hissGain); hissGain.connect(master);
    src.start();
    ok = true;
  }
  const mixSign = [[1, -1, 1], [-1, -1, -1], [1, 1, -1], [-1, 1, 1]];
  function update(st, P, vol, speed, stat, fpv) {
    if (!ok) return;
    const now = ctx.currentTime, T = 0.04;
    master.gain.setTargetAtTime(vol, now, 0.05);
    const m = st.motor;
    const base = P.tone[0] + (P.tone[1] - P.tone[0]) * Math.sqrt(Math.max(0, m));
    const e = st.sp.clone().sub(st.w);
    for (let i = 0; i < 4; i++) {
      const s = mixSign[i];
      const mix = Math.max(-1, Math.min(1, (e.x * s[0] + e.z * s[1] + e.y * s[2] * 0.6) * 0.08));
      const f = base * (1 + 0.07 * mix + (i - 1.5) * 0.004) * (1 + st.propwash * 0.04 * Math.sin(now * 90 + i));
      oscs[i][0].frequency.setTargetAtTime(f, now, T);
      oscs[i][1].frequency.setTargetAtTime(f * 2.01, now, T);
      const g = m < 0.01 ? 0 : (0.02 + 0.07 * m) * (fpv ? 0.8 : 1);
      gains[i].gain.setTargetAtTime(g, now, T);
    }
    filt.frequency.setTargetAtTime(900 + 5200 * m, now, T);
    noiseFilt.frequency.setTargetAtTime(400 + speed * 25, now, 0.1);
    noiseGain.gain.setTargetAtTime(Math.min(0.35, speed * speed / 2500) + st.propwash * 0.18 + m * 0.04, now, 0.08);
    hissGain.gain.setTargetAtTime(stat * 0.12, now, 0.05);
  }
  function impact(power) {
    if (!ok) return;
    const now = ctx.currentTime;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 600 + power * 300;
    const g = ctx.createGain(); g.gain.value = Math.min(1, 0.15 + power * 0.08);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(now);
  }
  function mute() { if (ok) master.gain.setTargetAtTime(0, ctx.currentTime, 0.05); }
  return { start, update, impact, mute };
})();


const STEP = 1 / 120; // pas physique fixe
const IDLE = { throttle: 0, brake: 0.4, steer: 0, handbrake: false };
const BEST_KEY = 'driftzone.best';
const loadBest = () => { try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; } };
const saveBest = (v) => { try { localStorage.setItem(BEST_KEY, String(v)); } catch { /* stockage indisponible */ } };

function startGame() {
  const hud = new Hud();
  const input = new Input();
  const stage = new Stage(document.getElementById('game'), MAP_SIZE);
  const { obstacles: defs, decals } = buildMap();
  const obstacles = [...arenaWalls([MAP_SIZE, MAP_SIZE]), ...defs].map(createObstacle);
  const world = new World(obstacles, { x0: 0, y0: 0, x1: MAP_SIZE, y1: MAP_SIZE });
  stage.addDecals(decals);
  stage.addObstacles(obstacles);

  const car = new Car();
  const carMesh = new CarMesh(car);
  stage.scene.add(carMesh.group);
  const rig = new CameraRig(stage.camera);
  const skids = new Skids(stage.scene);
  const smoke = new Smoke(stage.scene);
  const sound = new Sound();
  const score = new Score(SCORE, (m) => { hud.popup(m); sound.cue(m.kind); });
  stage.onResize = (w, h) => smoke.setViewport(h * stage.renderer.getPixelRatio(), VIEW.camera.fov);
  stage.onResize(innerWidth, innerHeight);

  const debug = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 90, 0xffffff);
  debug.visible = false;
  stage.scene.add(debug);

  let best = loadBest();
  let timeLeft, started, finished, paused = false, acc = 0, last = performance.now();

  function reset() {
    paused = false;
    car.reset(START.x, START.y, START.angle);
    world.reset();
    score.reset();
    skids.clear();
    timeLeft = SCORE.timeLimit;
    started = false;
    finished = false;
    rig.snap(car);
    hud.showStart(best);
  }

  function finish() {
    finished = true;
    score.bank();
    const isBest = score.banked > best;
    if (isBest) { best = Math.round(score.banked); saveBest(best); }
    hud.showEnd(score.banked, best, isBest);
  }

  function onEvent(e) {
    score.onEvent(e);
    if (e.type === 'near') sound.cue('near');
    if (e.type === 'impact') {
      sound.impact(e.speed, e.obstacle.comboBreak !== false);
      rig.shake(Math.min(e.speed / 500, 1.5));
      smoke.burst(e.x, e.y, Math.min(Math.round(e.speed / 40), 14));
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;

    let inp = input.read();
    if (inp.any) sound.start();
    if (inp.toggleMute) sound.toggleMute();
    if (inp.pause && started && !finished) {
      paused = !paused;
      sound.setPaused(paused);
      if (paused) hud.showPause(); else hud.hideOverlay();
    }
    if (paused) { if (inp.restart) { paused = false; sound.setPaused(false); reset(); } stage.render(); return; }
    if (inp.restart) reset();
    else if (!started && !finished && inp.any) { started = true; hud.hideOverlay(); }
    if (inp.toggleDebug) debug.visible = !debug.visible;
    if (finished) inp = IDLE;

    acc += dt;
    while (acc >= STEP) {
      car.update(STEP, inp);
      world.step(car, STEP).forEach(onEvent);
      if (started && !finished) {
        score.update(STEP, car);
        timeLeft -= STEP;
        if (timeLeft <= 0) { timeLeft = 0; finish(); }
      }
      acc -= STEP;
    }

    carMesh.update(car);
    stage.syncObstacles();
    skids.update(car);
    smoke.emit(skids.wheels.map((w) => ({ x: w.x, y: w.y })), skids.intensity, dt);
    smoke.update(dt);
    rig.update(car, dt);
    if (debug.visible) {
      debug.position.set(car.x, 20, car.y);
      debug.setDirection(new THREE.Vector3(car.vx, 0, car.vy).normalize());
      debug.setLength(Math.max(30, car.speed * 0.15), 12, 8);
    }
    sound.update(car, inp.throttle, skids.intensity);
    hud.update({ score, car, timeLeft });
    stage.render();
  }

  document.addEventListener('visibilitychange', () => { if (document.hidden && started && !finished && !paused) { paused = true; sound.setPaused(true); hud.showPause(); } });

  reset();
  requestAnimationFrame(frame);
  return { car, score, world, stage, rig, reset };
}

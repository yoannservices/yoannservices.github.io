
/** Caméra de poursuite en perspective : retard, anticipation, hauteur selon la vitesse, secousses. */
class CameraRig {
  constructor(camera, cfg = VIEW.camera) {
    this.camera = camera;
    this.cfg = cfg;
    this.shakeT = 0;
    this.shakeI = 0;
  }

  snap(car) {
    this.px = car.x;
    this.py = car.y;
    this.h = this.cfg.heightMin;
    this.apply();
  }

  update(car, dt) {
    const c = this.cfg;
    const k = 1 - Math.exp(-c.follow * dt);
    this.px += (car.x + car.vx * c.lookAhead - this.px) * k;
    this.py += (car.y + car.vy * c.lookAhead - this.py) * k;
    const target = c.heightMin + (c.heightMax - c.heightMin) * Math.min(car.speed / c.zoomSpeed, 1);
    this.h += (target - this.h) * (1 - Math.exp(-c.zoomLerp * dt));
    this.shakeT = Math.max(0, this.shakeT - dt);
    this.apply();
  }

  apply() {
    const c = this.cfg;
    const s = this.shakeT > 0 ? (this.shakeT / c.shakeDuration) * this.shakeI * c.shakeIntensity : 0;
    const ox = (Math.random() - 0.5) * s, oy = (Math.random() - 0.5) * s;
    this.camera.position.set(this.px + ox, this.h + oy, this.py + this.h * this.cfg.back);
    this.camera.lookAt(this.px + ox, 0, this.py);
  }

  /** intensity 0..1+ ; sur impact. */
  shake(intensity = 1) {
    this.shakeT = this.cfg.shakeDuration;
    this.shakeI = intensity;
  }
}

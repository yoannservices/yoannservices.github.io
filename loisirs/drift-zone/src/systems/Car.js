
const approach = (v, target, step) =>
  v < target ? Math.min(v + step, target) : Math.max(v - step, target);

/**
 * Voiture : vecteur vitesse (vx, vy) indépendant de l'orientation (angle).
 * Pas de dépendance Phaser : pas de rendu ici, juste l'état et update(dt, input).
 * input = { throttle 0..1, brake 0..1, steer -1..1, handbrake bool }
 */
class Car {
  constructor(config = DEFAULT_CAR) {
    this.cfg = config;
    this.reset(0, 0, 0);
  }

  reset(x, y, angle = 0) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.vx = 0;
    this.vy = 0;
    this.steer = 0;
    this.yawRate = 0;
    // valeurs dérivées, lues par caméra / score / audio / HUD
    this.speed = 0;
    this.forwardSpeed = 0;
    this.lateralSpeed = 0;
    this.driftAngle = 0; // rad, signé : angle entre orientation et vitesse
    this.drifting = false;
    this.handbrake = false;
  }

  update(dt, input) {
    const c = this.cfg;
    let cos = Math.cos(this.angle);
    let sin = Math.sin(this.angle);

    // Vitesse décomposée dans le repère de la voiture (avant, droite)
    let vF = this.vx * cos + this.vy * sin;
    let vL = -this.vx * sin + this.vy * cos;
    const speed = Math.hypot(vF, vL);
    const speedRatio = Math.min(speed / c.maxSpeed, 1);

    // Braquage progressif
    const target = input.steer;
    const rate = target === 0 || Math.sign(target) !== Math.sign(this.steer) && this.steer !== 0
      ? c.steerRelease : c.steerAttack;
    this.steer = approach(this.steer, target, rate * dt);

    // Longitudinal : gaz, frein, marche arrière, frein à main
    if (input.throttle > 0) vF += c.accel * input.throttle * Math.max(0, 1 - vF / c.maxSpeed) * dt;
    if (input.brake > 0) {
      if (vF > 5) vF = Math.max(0, vF - c.brake * input.brake * dt);
      else vF = Math.max(-c.maxReverse, vF - c.reverseAccel * input.brake * dt);
    }
    if (input.handbrake) vF = approach(vF, 0, c.handbrakeDrag * dt);
    vF -= vF * c.drag * dt;
    vF = approach(vF, 0, c.rolling * dt);

    // Adhérence latérale : friction constante plafonnée, qui baisse avec la vitesse
    let grip = c.grip * (1 - c.gripSpeedLoss * speedRatio);
    if (input.handbrake) grip *= c.handbrakeGrip;
    if (input.throttle > 0) grip *= 1 - c.throttleGripLoss * input.throttle * speedRatio;
    if (Math.abs(vL) > c.slideThreshold) grip *= c.slideGrip;
    const vLBefore = vL;
    vL = approach(vL, 0, grip * dt);
    // une part de la vitesse latérale absorbée est redirigée vers l'avant : la dérive conserve l'élan
    vF += (vF >= 0 ? 1 : -1) * Math.abs(vLBefore - vL) * c.driftSpeedKeep;

    // Rotation : cible de lacet lissée. Marche arrière => braquage inversé.
    const dir = vF < -30 ? -1 : 1;
    const ramp = Math.min(speed / c.yawRampSpeed, 1);
    let yawTarget = this.steer * c.steerRate * (1 - c.steerSpeedLoss * speedRatio) * ramp * dir;
    if (input.handbrake) yawTarget *= c.handbrakeYawBoost;
    this.yawRate += (yawTarget - this.yawRate) * Math.min(1, c.yawResponse * dt);

    // Retour en repère monde avec l'ANCIEN angle (la vitesse ne tourne pas avec la voiture)
    this.vx = vF * cos - vL * sin;
    this.vy = vF * sin + vL * cos;
    this.angle += this.yawRate * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Valeurs dérivées avec le NOUVEL angle
    cos = Math.cos(this.angle);
    sin = Math.sin(this.angle);
    this.forwardSpeed = this.vx * cos + this.vy * sin;
    this.lateralSpeed = -this.vx * sin + this.vy * cos;
    this.speed = Math.hypot(this.vx, this.vy);
    this.driftAngle = Math.atan2(this.lateralSpeed, Math.abs(this.forwardSpeed));
    this.drifting = this.speed > c.minDriftSpeed && Math.abs(this.driftAngle) > c.minDriftAngle;
    this.handbrake = !!input.handbrake;
  }
}

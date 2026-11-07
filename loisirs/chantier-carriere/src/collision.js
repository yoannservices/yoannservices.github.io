export function boxCollider(x, z, halfWidth, halfLength, yaw = 0) {
  return { kind: 'box', x, z, halfWidth, halfLength, cos: Math.cos(yaw), sin: Math.sin(yaw), radius: Math.hypot(halfWidth, halfLength), active: true };
}

export function circleCollider(x, z, radius) {
  return { kind: 'circle', x, z, radius, active: true };
}

export function vehicleBox(x, z, yaw, halfLength, halfWidth) {
  return { x, z, yaw, halfLength, halfWidth, forwardX: Math.sin(yaw), forwardZ: Math.cos(yaw) };
}

export function collideVehicle(vehicle, obstacle) {
  const dx = vehicle.x - obstacle.x;
  const dz = vehicle.z - obstacle.z;
  const reach = Math.hypot(vehicle.halfLength, vehicle.halfWidth) + obstacle.radius;
  if (dx * dx + dz * dz > reach * reach) return null;

  const forward = [vehicle.forwardX, vehicle.forwardZ];
  const side = [vehicle.forwardZ, -vehicle.forwardX];
  if (obstacle.kind === 'circle') {
    const lateral = dx * side[0] + dz * side[1];
    const longitudinal = dx * forward[0] + dz * forward[1];
    const closestSide = Math.max(-vehicle.halfWidth, Math.min(vehicle.halfWidth, -lateral));
    const closestFront = Math.max(-vehicle.halfLength, Math.min(vehicle.halfLength, -longitudinal));
    const offsetSide = -lateral - closestSide;
    const offsetFront = -longitudinal - closestFront;
    const distance = Math.hypot(offsetSide, offsetFront);
    if (distance >= obstacle.radius) return null;
    if (distance > 1e-6) {
      const worldX = side[0] * offsetSide + forward[0] * offsetFront;
      const worldZ = side[1] * offsetSide + forward[1] * offsetFront;
      return { nx: -worldX / distance, nz: -worldZ / distance, depth: obstacle.radius - distance };
    }
    const centerDistance = Math.hypot(dx, dz) || 1;
    return { nx: dx / centerDistance, nz: dz / centerDistance, depth: obstacle.radius + 0.05 };
  }

  const obstacleX = [obstacle.cos, obstacle.sin];
  const obstacleZ = [-obstacle.sin, obstacle.cos];
  let shallowest = Infinity;
  let normal = null;
  for (const axis of [forward, side, obstacleX, obstacleZ]) {
    const vehicleRadius = vehicle.halfLength * Math.abs(axis[0] * forward[0] + axis[1] * forward[1])
      + vehicle.halfWidth * Math.abs(axis[0] * side[0] + axis[1] * side[1]);
    const obstacleRadius = obstacle.halfWidth * Math.abs(axis[0] * obstacleX[0] + axis[1] * obstacleX[1])
      + obstacle.halfLength * Math.abs(axis[0] * obstacleZ[0] + axis[1] * obstacleZ[1]);
    const separation = dx * axis[0] + dz * axis[1];
    const overlap = vehicleRadius + obstacleRadius - Math.abs(separation);
    if (overlap <= 0) return null;
    if (overlap < shallowest) {
      shallowest = overlap;
      normal = separation >= 0 ? axis : [-axis[0], -axis[1]];
    }
  }
  return { nx: normal[0], nz: normal[1], depth: shallowest };
}

export function deepestContact(vehicle, obstacles) {
  let deepest = null;
  for (const obstacle of obstacles) {
    if (!obstacle.active) continue;
    const contact = collideVehicle(vehicle, obstacle);
    if (contact && (!deepest || contact.depth > deepest.depth)) deepest = contact;
  }
  return deepest;
}

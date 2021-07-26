export function create(coords) {
  const { x = 0, y = 0, z = 0 } = coords || {};

  return { x, y, z };
}

export function clone(position) {
  return create({ x: position.x, y: position.y, z: position.z });
}

export function isZero(pos) {
  return pos.x === 0 && pos.y === 0 && pos.z === 0;
}

export function add(pos1, pos2) {
  return create({
    x: pos1.x + (pos2.x || 0),
    y: pos1.y + (pos2.y || 0),
    z: pos1.z + (pos2.z || 0),
  });
}

export function multiply(pos1, delta) {
  return create({
    x: pos1.x * delta,
    y: pos1.y * delta,
    z: pos1.z * delta,
  });
}

export function collides(actor, target, actorRadius) {
  return (
    actor.x <= target.x + actorRadius &&
    actor.x >= target.x - actorRadius &&
    actor.z <= target.z + actorRadius &&
    actor.z >= target.z - actorRadius
  );
}

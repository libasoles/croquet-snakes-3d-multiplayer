export class Position {
  constructor(options) {
    const { x = 0, y = 0, z = 0, constraint = 10 } = options || {};

    this.x = x;
    this.y = y;
    this.z = z;
  }

  static clone(position) {
    return new Position({ x: position.x, y: position.y, z: position.z });
  }

  static isZero(pos) {
    return pos.x === 0 && pos.y === 0 && pos.z === 0;
  }

  static add(pos1, pos2) {
    return new Position({
      x: pos1.x + (pos2.x || 0),
      y: pos1.y + (pos2.y || 0),
      z: pos1.z + (pos2.z || 0),
    });
  }

  static multiply(pos1, delta) {
    return new Position({
      x: pos1.x * delta,
      y: pos1.y * delta,
      z: pos1.z * delta,
    });
  }

  static collides(actor, target, actorRadius) {
    return (
      actor.x <= target.x + actorRadius &&
      actor.x >= target.x - actorRadius &&
      actor.z <= target.z + actorRadius &&
      actor.z >= target.z - actorRadius
    );
  }
}

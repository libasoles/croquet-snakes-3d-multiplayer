export class Position {
  constructor(options) {
    const { x = 0, y = 0, z = 0, constraint = 10 } = options || {};

    this.x = x;
    this.y = y;
    this.z = z;
  }

  static clone(position) {
    return new Position({ x: position.x, z: position.z });
  }

  static getRandom(maxX, maxZ, options = {}) {
    const min = 0;

    const position = new Position({
      x: Math.floor(Math.random() * (maxX - min)) + min,
      z: Math.floor(Math.random() * (maxZ - min)) + min,
    });

    const tryAgain =
      options.except &&
      position.x === options.except.x &&
      position.z === options.except.z;

    if (tryAgain) {
      return Position.getRandom(maxX, maxZ, options);
    }

    return position;
  }

  static isZero(pos) {
    return pos.x === 0 && pos.y === 0 && pos.z === 0;
  }

  static add(pos1, pos2) {
    return new Position({
      x: pos1.x + pos2.x,
      y: pos1.y + pos2.y,
      z: pos1.z + pos2.z,
    });
  }
}

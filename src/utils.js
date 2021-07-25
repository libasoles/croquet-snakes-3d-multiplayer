export function isSelf(id, anotherId) {
  return id === anotherId;
}

export function createBox({ position, color, size }) {
  const Q = Croquet.Constants;

  const box = document.createElement("a-box");
  box.setAttribute("color", color);
  box.setAttribute("position", position);
  box.setAttribute("scale", {
    x: size || Q.unit,
    y: size || Q.unit,
    z: size || Q.unit,
  });

  return box;
}

export function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function isSelf(id, anotherId) {
  return id === anotherId;
}

export function createBox({ position, color, size, ...rest }) {
  const box = document.createElement("a-box");
  box.setAttribute("color", color);
  box.setAttribute("position", position);
  box.setAttribute("scale", {
    x: size,
    y: size,
    z: size,
  });

  for (const [key, value] of Object.entries(rest)) {
    box[key] = value;
  }

  return box;
}

export function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

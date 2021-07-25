export function isSelf(viewId, anotherViewId) {
  return viewId === anotherViewId;
}

export function createBox({ position, color }) {
  const Q = Croquet.Constants;

  const box = document.createElement("a-box");
  box.setAttribute("color", color);
  box.setAttribute("position", position);
  box.setAttribute("scale", {
    x: Q.size,
    y: Q.size,
    z: Q.size,
  });

  return box;
}

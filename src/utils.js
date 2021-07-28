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

export function debugWidget() {
  const app = Croquet.App;

  app.sessionURL = window.location.href;
  if (!document.getElementById("widgets")) {
    const widgetDiv = document.createElement("div");
    widgetDiv.id = "widgets";
    document.body.appendChild(widgetDiv);

    const statsDiv = document.createElement("div");
    statsDiv.id = "stats";
    widgetDiv.appendChild(statsDiv);
  }

  app.stats = "stats";
  app.messages = true;
}

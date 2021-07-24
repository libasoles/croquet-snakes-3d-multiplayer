const Q = Croquet.Constants;

Q.keyMap = {
  68: "RIGHT",
  83: "DOWN",
  65: "LEFT",
  87: "UP",
};

Q.controlKeys = Object.keys(Q.keyMap).map((key) => Number(key));
Q.arrow = {
  UP: "UP",
  DOWN: "DOWN",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
};

Q.idleKeyboard = {
  UP: false,
  DOWN: false,
  LEFT: false,
  RIGHT: false,
};

export default class Keyboard extends Croquet.Model {
  init() {}
}

export class KeyboardView extends Croquet.View {
  constructor(model) {
    super(model);
    this.model = model;

    this.bindControlls();

    this.resetKeyboardState();
  }

  bindControlls() {
    window.onkeydown = this.onKeyDown.bind(this);
    window.onkeyup = this.onKeyUp.bind(this);
  }

  onKeyDown({ keyCode }) {
    const isControlKey = Q.controlKeys.includes(keyCode);
    if (!isControlKey) return;

    const keyName = Q.keyMap[keyCode];

    const isAlreadyPressed = this.activeKeys[keyName];
    if (isAlreadyPressed) return;

    this.activeKeys[keyName] = true;

    this.broadcast();
  }

  onKeyUp({ keyCode }) {
    this.activeKeys[Q.keyMap[keyCode]] = false;

    this.broadcast();
  }

  broadcast() {
    this.publish("keyboard", "arrow-changed", {
      keys: this.activeKeys,
      viewId: this.viewId,
    });
  }

  resetKeyboardState() {
    this.activeKeys = { ...Q.idleKeyboard };
  }
}

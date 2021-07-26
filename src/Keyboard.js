const Q = Croquet.Constants;

Q.keyMap = {
  68: "RIGHT",
  83: "DOWN",
  65: "LEFT",
  87: "UP",
  32: "SPACE",
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

export class KeyboardView extends Croquet.View {
  constructor(scene, { modelId }) {
    super(scene);
    this.scene = scene;
    this.modelId = modelId;

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

    if (!this.scene.isActive) {
      this.publish(this.scene.id, "start-pressed");

      return;
    }

    const keyName = Q.keyMap[keyCode];

    const isAlreadyPressed = this.activeKeys[keyName];
    if (isAlreadyPressed) return;

    this.activeKeys[keyName] = true;

    this.publishArrowChanged();
  }

  onKeyUp({ keyCode }) {
    this.activeKeys[Q.keyMap[keyCode]] = false;

    this.publishArrowChanged();
  }

  publishArrowChanged() {
    this.publish(this.modelId, "arrow-changed", {
      keys: this.activeKeys,
      viewId: this.viewId,
      modelId: this.modelId,
    });
  }

  resetKeyboardState() {
    this.activeKeys = { ...Q.idleKeyboard };
  }
}

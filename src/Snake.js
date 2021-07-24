export default class Snake extends Croquet.Model {
  init() {
    /*
    geometry="primitive: box; height: 0.6; width: 0.6; depth: 0.6"
    */
  }
}

const key = {
  RIGHT: 68,
  DOWN: 83,
  LEFT: 65,
  UP: 87,
};

const actions = {
  up: (position, delta) => ({ ...position, z: position.z - delta }),
  down: (position, delta) => ({ ...position, z: position.z + delta }),
  left: (position, delta) => ({ ...position, x: position.x - delta }),
  right: (position, delta) => ({ ...position, x: position.x + delta }),
  idle: () => {},
};

export class SnakeView extends Croquet.View {
  constructor(model) {
    super(model);
    this.model = model;

    this.delta = 0.1;

    this.lastKey = null;
    this.scene = document.querySelector("a-scene");

    this.createSnake();
    this.bindControlls();
  }

  createSnake() {
    this.camera = document.createElement("a-camera");
    this.camera.setAttribute("position", { x: 0, y: 3, z: 0 });

    this.snake = document.createElement("a-box");
    this.snake.setAttribute("color", "orange");
    this.snake.setAttribute("position", { x: 0, y: -3, z: -5 });

    this.camera.appendChild(this.snake);
    this.scene.appendChild(this.camera);
  }

  bindControlls() {
    window.onkeydown = this.onKeyDown.bind(this);
    window.onkeyup = this.onKeyUp.bind(this);
  }

  onKeyDown({ keyCode }) {
    this.action = actions.idle;

    if (!Object.values(key).includes(keyCode)) return;

    switch (keyCode) {
      case key.RIGHT:
        this.action = actions.right;
        break;
      case key.DOWN:
        this.action = actions.down;
        break;
      case key.LEFT:
        this.action = actions.left;
        break;
      case key.UP:
        this.action = actions.up;
        break;
    }

    if (keyCode !== this.lastKey) {
      this.animate();

      this.lastKey = keyCode;
    }
  }

  animate() {
    clearInterval(this.animation);

    const position = this.snake.getAttribute("position");
    this.animation = setInterval(() => {
      this.snake.setAttribute("position", this.action(position, this.delta));
    }, 1);
  }

  onKeyUp() {
    clearInterval(this.animation);
  }
}

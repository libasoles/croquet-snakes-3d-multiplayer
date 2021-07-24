import { Position } from "./Position";

const Q = Croquet.Constants;
Q.speed = 0.25;
Q.size = 0.5;

export default class Snake extends Croquet.Model {
  init({ scene }) {
    this.scene = scene;
    this.cameraPosition = new Position({ x: 0, y: 6, z: 32 });
    this.position = new Position({ x: 0, y: 1, z: 25 });

    this.direction = new Position();

    this.onTick();

    this.subscribe("keyboard", "arrow-changed", this.handleDirectionChange);
  }

  handleDirectionChange(event) {
    const { keys, modelId } = event;

    if (this.id !== modelId) return;

    const direction = new Position();

    if (keys[Q.arrow.UP]) {
      direction.z -= Q.speed;
    } else if (keys[Q.arrow.DOWN]) {
      direction.z += Q.speed;
    } else if (keys[Q.arrow.LEFT]) {
      direction.x -= Q.speed;
    } else if (keys[Q.arrow.RIGHT]) {
      direction.x += Q.speed;
    }

    this.direction = direction;
  }

  onTick() {
    if (!Position.isZero(this.direction)) {
      this.move(this.direction);
    }
    this.future(1000 / 60).onTick();
  }

  move(direction) {
    const nextPosition = Position.add(this.position, direction);

    if (!this.scene.isWithinBoundaries(nextPosition)) return;

    this.position = nextPosition;
    this.cameraPosition = Position.add(
      this.cameraPosition,
      Position.multiply(direction, 0.8)
    );

    this.publish("keyboard", "position-changed", {
      modelId: this.id,
      position: this.position,
      cameraPosition: this.cameraPosition,
    });
  }
}

export class SnakeView extends Croquet.View {
  constructor(model, props = {}) {
    super(model);
    this.model = model;

    const { isSelf = false } = props;

    this.scene = document.querySelector("a-scene");
    this.isSelf = isSelf;

    this.createSnake(isSelf);

    this.subscribe("keyboard", "position-changed", this.handlePositionChanged);
  }

  createSnake(withCamera) {
    this.snake = document.createElement("a-box");
    this.snake.setAttribute("color", "orange");
    this.snake.setAttribute("position", this.model.position);
    this.snake.setAttribute("scale", { x: Q.size, y: Q.size, z: Q.size });

    this.scene.appendChild(this.snake);

    if (withCamera) {
      this.camera = document.createElement("a-camera");
      this.camera.setAttribute("position", this.model.cameraPosition);
      this.camera.setAttribute("wasd-controls-enabled", false);
      this.camera.setAttribute("look-controls-enabled", false);
      this.camera.setAttribute("active", withCamera);

      this.scene.appendChild(this.camera);
    }
  }

  handlePositionChanged({ modelId, position, cameraPosition: camera }) {
    if (modelId !== this.model.id) return;

    this.snake.object3D.position.set(position.x, position.y, position.z);

    if (this.isSelf)
      this.camera.object3D.position.set(camera.x, camera.y, camera.z);
  }

  detach() {
    this.snake.remove();

    if (this.isSelf) this.camera.remove();
  }
}

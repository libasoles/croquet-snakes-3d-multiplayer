import { Position } from "./Position";

const Q = Croquet.Constants;
Q.speed = 0.2;

export default class Snake extends Croquet.Model {
  init({ scene }) {
    this.scene = scene;
    this.cameraPosition = new Position({ x: 0, y: 8, z: 32 });
    this.position = new Position({
      x: 0,
      y: -this.cameraPosition.y + 2,
      z: -9,
    });

    this.direction = new Position();

    this.onTick();

    this.subscribe("keyboard", "arrow-changed", this.handleDirectionChange);
  }

  handleDirectionChange(event) {
    const { keys, viewId, modelId } = event;

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
    this.cameraPosition = Position.add(this.cameraPosition, direction);

    this.publish("keyboard", "position-changed", {
      modelId: this.id,
      position: this.position,
      cameraPosition: this.cameraPosition,
    });
  }
}

export class SnakeView extends Croquet.View {
  constructor(model) {
    super(model);
    this.model = model;

    this.scene = document.querySelector("a-scene");

    this.createSnake();

    this.subscribe("keyboard", "position-changed", this.handlePositionChanged);
  }

  createSnake() {
    this.snake = document.createElement("a-box");
    this.snake.setAttribute("color", "orange");
    this.snake.setAttribute("position", this.model.position);

    this.camera = document.createElement("a-camera");
    this.camera.setAttribute("position", this.model.cameraPosition);
    this.camera.setAttribute("wasd-controls-enabled", false);

    this.camera.appendChild(this.snake);
    this.scene.appendChild(this.camera);
  }

  handlePositionChanged({ modelId, position, cameraPosition: camera }) {
    if (modelId !== this.model.id) return;

    this.snake.object3D.position.set(position.x, position.y, position.z);

    this.camera.object3D.position.set(camera.x, camera.y, camera.z);
  }

  detach() {
    this.snake.remove();
    this.camera.remove();
  }
}

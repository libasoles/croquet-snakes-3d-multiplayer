import { Position } from "./Position";

const Q = Croquet.Constants;
Q.speed = 0.25;
Q.unit = 0.5;

export default class Snake extends Croquet.Model {
  init({ scene }) {
    this.scene = scene;

    this.position = this.randomStartPosition();
    this.cameraPosition = new Position({
      ...this.position,
      y: 6,
      z: 32,
    });

    this.direction = new Position();
    this.size = Q.unit;

    this.onTick();

    this.subscribe("keyboard", "arrow-changed", this.directionChanged);
  }

  randomStartPosition() {
    const posibleX =
      Math.floor(Math.random() * Q.sceneBoundaries.RIGHT) +
      Q.sceneBoundaries.LEFT;

    const position = { x: posibleX, y: 1, z: 25 };

    const wouldCollide = this.scene.collides(this.stunt(position));
    if (wouldCollide) return this.randomStartPosition();

    return position;
  }

  directionChanged(event) {
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

      if (this.eats(this.scene.apple)) {
        this.publish("apple", "eaten", { appleId: this.scene.apple.id });
      }
    }
    this.future(1000 / 60).onTick();
  }

  move(direction) {
    const nextPosition = Position.add(this.position, direction);

    if (!this.scene.encloses(nextPosition)) return;
    if (this.scene.collides(this.stunt(nextPosition))) return;

    this.position = nextPosition;
    this.cameraPosition = Position.add(
      this.cameraPosition,
      Position.multiply(direction, 0.8)
    );

    this.publish("snake", "position-changed", {
      modelId: this.id,
      position: this.position,
      cameraPosition: this.cameraPosition,
    });
  }

  stunt(nextPosition) {
    return {
      id: this.id,
      position: { ...nextPosition },
      size: this.size,
      collides: this.collides,
    };
  }

  collides(actor) {
    if (this.id === actor.id) return false;

    return Position.collides(this.position, actor.position, actor.size);
  }

  eats(apple) {
    return Position.collides(this.position, apple.position, apple.size);
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

    this.subscribe("snake", "position-changed", this.updatePosition);
  }

  createSnake(withCamera) {
    const { size, position, cameraPosition } = this.model;

    this.snake = document.createElement("a-box");
    this.snake.setAttribute("color", "orange");
    this.snake.setAttribute("position", position);
    this.snake.setAttribute("scale", {
      x: size,
      y: size,
      z: size,
    });

    this.scene.appendChild(this.snake);

    if (withCamera) {
      this.camera = document.createElement("a-camera");
      this.camera.setAttribute("position", cameraPosition);
      this.camera.setAttribute("wasd-controls-enabled", false);
      this.camera.setAttribute("look-controls-enabled", false);
      this.camera.setAttribute("active", withCamera);

      this.scene.appendChild(this.camera);
    }
  }

  updatePosition({ modelId, position, cameraPosition: camera }) {
    if (modelId !== this.model.id) return;

    this.snake.object3D.position.set(position.x, position.y, position.z);

    if (this.isSelf)
      this.camera.object3D.position.set(camera.x, camera.y, camera.z);
  }

  detach() {
    super.detach();

    this.snake.remove();

    if (this.isSelf) this.camera.remove();
  }
}

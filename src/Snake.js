import { Position } from "./Position";
import { createBox } from "./utils";

const Q = Croquet.Constants;
Q.speed = 0.25;
Q.unit = 0.5;

export default class Snake extends Croquet.Model {
  init({ scene }) {
    this.scene = scene;

    this.size = Q.unit;
    this.position = this.randomStartPosition();
    this.cameraPosition = new Position({
      ...this.position,
      y: 6,
      z: 32,
    });

    this.direction = new Position();

    this.color = "orange";

    this.tail = [];

    this.onTick();

    this.subscribe("keyboard", "arrow-changed", this.directionChanged);
  }

  randomStartPosition() {
    const posibleX =
      Math.floor(Math.random() * (Q.sceneBoundaries.RIGHT / 3)) +
      Q.sceneBoundaries.LEFT / 3;

    const position = { x: posibleX, y: this.size, z: 25 };

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
      const currentPosition = this.position;
      this.move(this.direction);

      if (this.eats(this.scene.apple)) {
        this.publish("apple", "eaten", { appleId: this.scene.apple.id });

        this.tail.push(currentPosition);
        this.publish("snake", "append-tail", {
          modelId: this.id,
          position: currentPosition,
        });
      }
    }
    this.future(1000 / 60).onTick();
  }

  move(direction) {
    const currentPosition = this.position;
    const nextPosition = Position.add(currentPosition, direction);

    if (!this.scene.encloses(nextPosition)) return;
    if (this.scene.collides(this.stunt(nextPosition))) return;

    this.cameraPosition = Position.add(
      this.cameraPosition,
      Position.multiply(direction, 0.8)
    );

    this.position = nextPosition;

    this.tail.unshift(currentPosition);
    this.tail.pop();

    this.publish("snake", "position-changed", {
      modelId: this.id,
      position: nextPosition,
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

    this.scene = document.querySelector("a-scene");

    const { isSelf = false } = props;
    this.isSelf = isSelf;
    this.create(isSelf);

    this.tail = [];

    this.subscribe("snake", "position-changed", this.updatePosition);
    this.subscribe("snake", "append-tail", this.appendTail);
  }

  create(withCamera) {
    const { size, position, cameraPosition } = this.model;

    const snake = createBox({
      position,
      size,
      color: this.model.color,
    });

    this.scene.appendChild(snake);
    this.snake = snake;

    if (withCamera) {
      const camera = document.createElement("a-camera");
      camera.setAttribute("position", cameraPosition);
      camera.setAttribute("wasd-controls-enabled", false);
      camera.setAttribute("look-controls-enabled", false);
      camera.setAttribute("active", withCamera);

      this.scene.appendChild(camera);
      this.camera = camera;
    }
  }

  updatePosition({ modelId, position, cameraPosition: camera }) {
    if (modelId !== this.model.id) return;

    this.snake.object3D.position.set(position.x, position.y, position.z);

    if (this.isSelf)
      this.camera.object3D.position.set(camera.x, camera.y, camera.z);

    this.model.tail.forEach((pos, i) => {
      this.tail[i].updatePosition(pos);
    });
  }

  appendTail({ modelId, position }) {
    if (modelId !== this.model.id) return;

    this.tail.push(
      new SnakeTailFragmentView(this.model, position, this.model.size)
    );
  }

  detach() {
    super.detach();

    this.scene.removeChild(this.snake);

    this.tail.forEach((fragment) => {
      fragment.detach();
    });

    if (this.isSelf) this.scene.removeChild(this.camera);
  }
}

class SnakeTailFragmentView extends Croquet.View {
  constructor(model, position, size) {
    super(model);
    this.model = model;

    this.create(position, size);
  }

  create(position, size) {
    const scene = document.querySelector("a-scene");

    const tail = createBox({
      position,
      size,
      color: this.model.color,
    });

    scene.appendChild(tail);
    this.fragment = tail;
  }

  updatePosition(position) {
    this.fragment.object3D.position.set(position.x, position.y, position.z);
  }

  detach() {
    super.detach();

    this.scene.removeChild(this.fragment);
  }
}

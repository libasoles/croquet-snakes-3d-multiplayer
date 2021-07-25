import { Position } from "./Position";
import { createBox, isSelf, randomFrom } from "./utils";

const Q = Croquet.Constants;
Q.tick = 1000 / 30;
Q.speed = 0.5;
Q.unit = 1;

export default class Snake extends Croquet.Model {
  init({ scene, color }) {
    this.scene = scene;

    this.size = Q.unit;
    this.position = this.randomStartPosition();
    this.cameraPosition = new Position({
      ...this.position,
      y: 6,
      z: 32,
    });

    this.direction = new Position();

    this.color = color;

    this.tail = [];

    this.onTick();

    this.subscribe("keyboard", "arrow-changed", this.directionChanged);
  }

  randomStartPosition() {
    const posibleX =
      Math.floor(Math.random() * (Q.sceneBoundaries.RIGHT / 3)) +
      Q.sceneBoundaries.LEFT / 3;

    const position = { x: posibleX, y: this.size / 2, z: 25 };

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
        this.publishAppleEaten(currentPosition);
      }
    }
    this.future(Q.tick).onTick();
  }

  move(direction) {
    const currentPosition = this.position;
    const nextPosition = Position.add(currentPosition, direction);

    if (
      !this.scene.encloses(nextPosition) ||
      this.scene.collides(this.stunt(nextPosition))
    ) {
      this.publish("snake", "collision", {
        modelId: this.id,
      });

      return;
    }

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

  collides(snake) {
    if (isSelf(this.id, snake.id)) return false;

    const collidesHead = Position.collides(
      this.position,
      snake.position,
      snake.size
    );

    const collidesTail = snake.tail.some((fragment) =>
      Position.collides(this.position, fragment, snake.size)
    );

    return collidesHead || collidesTail;
  }

  eats(apple) {
    if (!apple) return false;

    return Position.collides(this.position, apple.position, apple.size);
  }

  publishAppleEaten(currentPosition) {
    this.publish("apple", "eaten", {
      modelId: this.id,
      appleId: this.scene.apple.id,
    });

    this.tail.push(currentPosition);
    this.publish("snake", "append-tail", {
      modelId: this.id,
      position: currentPosition,
    });
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
    this.subscribe("apple", "eaten", this.celebrate);
    this.subscribe("snake", "append-tail", this.appendTail);
    this.subscribe("snake", "collision", this.grumble);
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
      if (this.tail[i]) this.tail[i].updatePosition(pos);
    });
  }

  celebrate({ modelId }) {
    if (!isSelf(modelId, this.model.id)) return;

    this.publish("toast", "display", {
      viewId: this.viewId,
      message: randomFrom(Q.messages.eat),
    });
  }

  grumble({ modelId }) {
    if (!isSelf(modelId, this.model.id)) return;

    this.publish("toast", "display", {
      viewId: this.viewId,
      message: Q.messages.collision,
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

    this.position = position;
    this.size = size;

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

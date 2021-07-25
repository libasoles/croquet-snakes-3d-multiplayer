import { Position } from "./Position";
import { createBox } from "./utils";

const Q = Croquet.Constants;

export default class Apple extends Croquet.Model {
  init() {
    this.size = Q.unit;
    this.position = this.initialPosition();

    this.color = "red";

    this.publish("apple", "created", {
      position: this.position,
    });
  }

  initialPosition() {
    return this.now() <= 1
      ? new Position({
          x: 0,
          y: this.size,
          z: 10,
        })
      : this.randomStartPosition();
  }

  randomStartPosition() {
    const x =
      Math.floor(Math.random() * Q.sceneBoundaries.RIGHT) +
      Q.sceneBoundaries.LEFT;
    const z =
      Math.floor(Math.random() * Q.sceneBoundaries.BACKWARD) +
      Q.sceneBoundaries.FORWARD;

    return new Position({ x, y: this.size, z });
  }
}

export class AppleView extends Croquet.View {
  constructor(model) {
    super(model);
    this.model = model;

    this.scene = document.querySelector("a-scene");

    this.create();
  }

  create() {
    const { size, position } = this.model;

    const apple = createBox({
      position,
      size,
      color: this.model.color,
    });

    this.scene.appendChild(apple);
    this.apple = apple;
  }

  detach() {
    super.detach();

    this.scene.removeChild(this.apple);
  }
}

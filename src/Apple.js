import * as Position from "./Position";
import { createBox } from "./utils";
import Q from "./constants";

export default class Apple extends Croquet.Model {
  init() {
    this.size = Q.unit * 2;
    this.position = this.initialPosition();

    this.color = "red";

    this.publish("apple", "created", {
      appleId: this.id,
      position: this.position,
    });
  }

  initialPosition() {
    return this.now() <= 1
      ? Position.create({
          x: 0,
          y: this.size / 2,
          z: 10,
        })
      : this.randomStartPosition();
  }

  randomStartPosition() {
    const x = Math.floor(
      this.random() * Q.sceneBoundaries.RIGHT +
        this.random() * Q.sceneBoundaries.LEFT
    );
    const z = Math.floor(
      this.random() * Q.sceneBoundaries.BACKWARD +
        this.random() * Q.sceneBoundaries.FORWARD
    );

    return Position.create({ x, y: this.size / 2, z });
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

    if (this.apple) this.scene.removeChild(this.apple);
  }
}

import { Position } from "./Position";

const Q = Croquet.Constants;

export default class Apple extends Croquet.Model {
  init() {
    this.size = Q.unit;
    this.position = this.initialPosition();

    this.publish("apple", "created", {
      position: this.position,
    });
  }

  initialPosition() {
    return this.now() <= 1
      ? new Position({
          x: 0,
          y: 1,
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

    return new Position({ x, y: 1, z });
  }
}

export class AppleView extends Croquet.View {
  constructor(model) {
    super(model);
    this.model = model;

    this.scene = document.querySelector("a-scene");

    this.create();

    this.subscribe("apple", "eaten", this.detach);
  }

  create() {
    const { size, position } = this.model;

    this.apple = document.createElement("a-box");
    this.apple.setAttribute("color", "red");
    this.apple.setAttribute("position", position);
    this.apple.setAttribute("scale", {
      x: size,
      y: size,
      z: size,
    });

    this.scene.appendChild(this.apple);
  }

  detach() {
    super.detach();

    this.scene.removeChild(this.apple);
  }
}

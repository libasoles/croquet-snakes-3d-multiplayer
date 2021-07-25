import { Position } from "./Position";

const Q = Croquet.Constants;

export default class Apple extends Croquet.Model {
  init() {
    this.size = Q.unit;
    this.position = new Position({
      x: 0,
      y: 1,
      z: 10,
    });

    this.publish("apple", "created", {
      position: this.position,
    });
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
    this.apple.remove();
  }
}

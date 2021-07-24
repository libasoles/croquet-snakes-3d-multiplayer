import Snake, { SnakeView } from "./Snake";

const Q = Croquet.Constants;
Q.sceneBoundaries = {
  FORWARD: -12,
  BACKWARD: 8,
  LEFT: -10,
  RIGHT: 8,
};

export default class Scene extends Croquet.Model {
  init() {
    this.userData = {};
    this.subscribe(this.sessionId, "view-join", this.addUser);
    this.subscribe(this.sessionId, "view-exit", this.deleteUser);
  }

  addUser(viewId) {
    this.userData[viewId] = Snake.create({ scene: this });
    this.publish(this.sessionId, "user-added", { viewId });
  }

  deleteUser(viewId) {
    const time = this.now() - this.userData[viewId].start;
    delete this.userData[viewId];
    this.publish(this.sessionId, "user-deleted", { viewId, time });
  }

  isWithinBoundaries(position) {
    return (
      position.x <= Q.sceneBoundaries.RIGHT &&
      position.x >= Q.sceneBoundaries.LEFT &&
      position.z <= Q.sceneBoundaries.BACKWARD &&
      position.z >= Q.sceneBoundaries.FORWARD
    );
  }
}

export class SceneView extends Croquet.View {
  constructor(model) {
    super(model);
    this.model = model;

    this.subscribe(this.sessionId, "user-added", this.userAdded);

    document.querySelector("a-scene").addEventListener("mousedown", (e) => {
      this.userAdded(this.viewId);
    });
  }

  userAdded(viewId) {
    new SnakeView(this.model.userData[this.viewId]);
  }
}

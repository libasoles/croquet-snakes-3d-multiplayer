import { KeyboardView } from "./Keyboard";
import Snake, { SnakeView } from "./Snake";

const Q = Croquet.Constants;
Q.sceneBoundaries = {
  FORWARD: -22,
  BACKWARD: 28,
  LEFT: -17,
  RIGHT: 14,
};

export default class Scene extends Croquet.Model {
  init() {
    this.userData = {};
    this.subscribe(this.sessionId, "view-join", this.addUser);
    this.subscribe(this.sessionId, "view-exit", this.deleteUser);
  }

  addUser(viewId) {
    this.userData[viewId] = Snake.create({ scene: this });
    this.publish("scene", "user-added", { viewId });
  }

  deleteUser(viewId) {
    const time = this.now() - this.userData[viewId].start;
    delete this.userData[viewId];
    this.publish("scene", "user-deleted", { viewId, time });
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

    this.snakes = {};

    for (const viewId of Object.keys(model.userData))
      this.userAdded({ viewId, modelId: model.userData[viewId].id });

    this.subscribe("scene", "user-added", this.userAdded);
    this.subscribe("scene", "user-deleted", this.userDeleted);
  }

  userAdded({ viewId, modelId }) {
    if (viewId === this.viewId) {
      this.keyboard = new KeyboardView(this.model, { modelId });
      this.snakes[viewId] = new SnakeView(this.model.userData[viewId], {
        isSelf: true,
      });
    } else {
      this.snakes[viewId] = new SnakeView(this.model.userData[viewId]);
    }
  }

  userDeleted({ viewId }) {
    if (this.snakes[viewId]) this.snakes[viewId].detach();
    delete this.snakes[viewId];
  }

  detach() {
    Object.values(this.snakes).forEach((snake) => {
      snake.detach();
    });
  }
}

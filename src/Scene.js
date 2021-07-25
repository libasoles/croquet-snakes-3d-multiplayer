import Apple, { AppleView } from "./Apple";
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
    this.snakes = {};

    this.future(1).addApple();

    this.subscribe(this.sessionId, "view-join", this.addUser);
    this.subscribe(this.sessionId, "view-exit", this.deleteUser);
  }

  addApple() {
    this.apple = Apple.create();
  }

  addUser(viewId) {
    this.snakes[viewId] = Snake.create({ scene: this });
    this.publish("scene", "user-added", { viewId });
  }

  deleteUser(viewId) {
    const time = this.now() - this.snakes[viewId].start;
    delete this.snakes[viewId];
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

  collides(snake) {
    return Object.values(this.snakes).some((aSnake) => snake.collides(aSnake));
  }
}

export class SceneView extends Croquet.View {
  constructor(model) {
    super(model);
    this.model = model;

    this.snakes = {};

    this.init();

    this.subscribe("scene", "user-added", this.userAdded);
    this.subscribe("scene", "user-deleted", this.userDeleted);

    this.subscribe("apple", "created", this.appleAdded);
  }

  init() {
    for (const viewId of Object.keys(this.model.snakes))
      this.userAdded({ viewId, modelId: this.model.snakes[viewId].id });

    this.appleAdded();
  }

  appleAdded() {
    this.apple = new AppleView(this.model.apple);
  }

  userAdded({ viewId, modelId }) {
    if (viewId === this.viewId) {
      this.keyboard = new KeyboardView(this.model, { modelId });
      this.snakes[viewId] = new SnakeView(this.model.snakes[viewId], {
        isSelf: true,
      });
    } else {
      this.snakes[viewId] = new SnakeView(this.model.snakes[viewId]);
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

    if (this.apple) this.apple.detach();
  }
}

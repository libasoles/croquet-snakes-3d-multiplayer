import Apple, { AppleView } from "./Apple";
import { KeyboardView } from "./Keyboard";
import Snake, { SnakeView } from "./Snake";
import { isSelf, randomFrom } from "./utils";

const Q = Croquet.Constants;
Q.sceneBoundaries = {
  FORWARD: -22,
  BACKWARD: 28,
  LEFT: -20,
  RIGHT: 25,
};

Q.colors = [
  "#ff9fe5",
  "#75485e",
  "#7192be",
  "#70ee9c",
  "#d4aa7d",
  "#ef6f6c",
  "#edae49",
  "#087ca7",
  "#3c5a14",
  "#5b8c5a",
  "orange",
];

Q.messages = {
  go: "Go!",
  eat: [
    "Yum!",
    "Delicious!",
    "That was a nice one!",
    "Lovely bite",
    "Ñam!",
    "I'd like some more!",
    "Tasty!",
    "Feels goood",
    "Mhhh, get some more!",
    "Oh, do I like this",
    "❤️ I love apples ❤️",
  ],
  collision: "Ouch!",
};

export default class Scene extends Croquet.Model {
  init() {
    this.snakes = {};
    this.isActive = false;

    this.future(1).addApple();

    this.subscribe(this.sessionId, "view-join", this.addUser);
    this.subscribe(this.sessionId, "view-exit", this.deleteUser);

    this.subscribe(this.id, "start", this.start);
    this.subscribe(this.id, "stop", this.stop);

    this.subscribe("apple", "eaten", this.appleEaten);
  }

  start() {
    this.isActive = true;
  }

  stop() {
    this.isActive = false;
  }

  appleEaten() {
    if (this.apple) this.apple.destroy();

    this.apple = null;

    this.future(100).addApple();
  }

  addApple() {
    this.apple = Apple.create();
  }

  addUser(viewId) {
    const color = Q.colors[Math.floor(this.random() * Q.colors.length)];

    this.snakes[viewId] = Snake.create({
      scene: this,
      color,
    });
    this.publish("scene", "user-added", { viewId });
  }

  deleteUser(viewId) {
    const time = this.now() - this.snakes[viewId].start;
    delete this.snakes[viewId];
    this.publish("scene", "user-deleted", { viewId, time });
  }

  encloses(position) {
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

    startButton.onclick = () => this.start();
  }

  init() {
    for (const viewId of Object.keys(this.model.snakes))
      this.userAdded({ viewId, modelId: this.model.snakes[viewId].id });

    this.appleAdded();
  }

  start() {
    intro.style.display = "none";
    this.publish("toast", "display", {
      viewId: this.viewId,
      message: Q.messages.go,
    });

    this.publish(this.model.id, "start");
  }

  appleAdded() {
    if (this.apple) this.apple.detach();

    this.apple = new AppleView(this.model.apple);
  }

  userAdded({ viewId, modelId }) {
    if (isSelf(viewId, this.viewId)) {
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
    super.detach();

    Object.values(this.snakes).forEach((snake) => {
      snake.detach();
    });

    if (this.apple) this.apple.detach();

    this.publish(this.model.id, "stop");
  }
}

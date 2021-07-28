import Apple, { AppleView } from "./Apple";
import { GesturesView } from "./Gestures";
import { KeyboardView } from "./Keyboard";
import Snake, { SnakeView } from "./Snake";
import { isSelf } from "./utils";
import Q from "./constants";

export default class Scene extends Croquet.Model {
  init() {
    this.snakes = {};
    this.apples = {};
    this.isActive = false;

    this.subscribeToEvents();

    this.future(1).generateApple();
  }

  subscribeToEvents() {
    this.subscribe(this.sessionId, "view-join", this.addUser);
    this.subscribe(this.sessionId, "view-exit", this.deleteUser);

    this.subscribe(this.id, "game-start", this.start);
    this.subscribe(this.id, "game-stop", this.stop);

    this.subscribe("apple", "eaten", this.appleEaten);
  }

  numberOfApples() {
    return Object.keys(this.apples).length;
  }

  generateApple() {
    if (this.numberOfApples() <= 1) this.addApple();
    this.future(Q.appleDropTime).generateApple();
  }

  addApple() {
    const apple = Apple.create();
    this.apples[apple.id] = apple;
  }

  start() {
    this.isActive = true;
  }

  stop() {
    this.isActive = false;
  }

  appleEaten({ appleId }) {
    if (!this.apples[appleId]) return;

    this.apples[appleId].destroy();

    delete this.apples[appleId];

    if (this.numberOfApples() === 0) this.future(100).addApple();
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

  findSomeFoodFor(snake) {
    return Object.values(this.apples).find((anApple) => snake.eats(anApple));
  }
}

export class SceneView extends Croquet.View {
  constructor(model) {
    super(model);
    this.model = model;

    this.snakes = {};
    this.apples = {};

    this.hydrate();

    this.subscribeToEvents();

    startButton.onclick = () => this.start();
  }

  hydrate() {
    for (const viewId of Object.keys(this.model.snakes))
      this.userAdded({ viewId, modelId: this.model.snakes[viewId].id });

    for (const appleId of Object.keys(this.model.apples))
      this.appleAdded({ appleId });
  }

  subscribeToEvents() {
    this.subscribe("scene", "user-added", this.userAdded);
    this.subscribe("scene", "user-deleted", this.userDeleted);

    this.subscribe("apple", "created", this.appleAdded);
    this.subscribe("apple", "eaten", this.appleEated);

    this.subscribe(this.model.id, "start-pressed", this.start);
  }

  start() {
    intro.style.display = "none";

    this.publish("toast", "display", {
      viewId: this.viewId,
      message: Q.messages.go,
    });

    this.publish(this.model.id, "game-start");
  }

  userAdded({ viewId, modelId }) {
    if (isSelf(viewId, this.viewId)) {
      this.keyboard = new KeyboardView(this.model, { modelId });
      this.mobileGestures = new GesturesView(this.model, { modelId });

      this.snakes[viewId] = new SnakeView(this.model.snakes[viewId], {
        isSelf: true,
      });
    } else {
      this.snakes[viewId] = new SnakeView(this.model.snakes[viewId]);
    }
  }

  userDeleted({ viewId }) {
    if (this.snakes[viewId]) {
      this.snakes[viewId].detach();
      delete this.snakes[viewId];
    }
  }

  appleAdded({ appleId }) {
    this.apples[appleId] = new AppleView(this.model.apples[appleId]);
  }

  appleEated({ appleId }) {
    if (this.apples[appleId]) {
      this.apples[appleId].detach();
      delete this.apples[appleId];
    }
  }

  detach() {
    super.detach();

    Object.values(this.snakes).forEach((snake) => {
      snake.detach();
    });

    Object.values(this.apples).forEach((apple) => {
      apple.detach();
    });

    this.publish(this.model.id, "game-stop");

    this.keyboard.detach();
    this.mobileGestures.detach();
  }
}

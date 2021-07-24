import Snake, { SnakeView } from "./Snake";

export default class Scene extends Croquet.Model {
  init() {
    this.userData = {};
    this.subscribe(this.sessionId, "view-join", this.addUser);
    this.subscribe(this.sessionId, "view-exit", this.deleteUser);
  }

  addUser(viewId) {
    this.userData[viewId] = Snake.create();
    this.publish(this.sessionId, "user-added", { viewId });
  }

  deleteUser(viewId) {
    const time = this.now() - this.userData[viewId].start;
    delete this.userData[viewId];
    this.publish(this.sessionId, "user-deleted", { viewId, time });
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

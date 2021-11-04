import Apple from "./Apple";
import Scene, { SceneView } from "./Scene";
import Snake from "./Snake";
import Toast, { ToastView } from "./Toast";

class Game extends Croquet.Model {
  init() {
    this.scene = Scene.create();
    this.toast = Toast.create();
  }
}

class GameView extends Croquet.View {
  constructor(model) {
    super(model);
    this.model = model;

    this.views = [new SceneView(model.scene), new ToastView(model.toast)];
  }

  detach() {
    super.detach();

    this.views.forEach((view) => view.detach());
  }
}

Game.register("Game");
Scene.register("Scene");
Snake.register("Snake");
Apple.register("Apple");
Toast.register("Toast");

Croquet.Session.join({
  apiKey: '1d5yaq96ii9K5L7zHGa6lxgaMpbO7Au1oinsteyx5',
  appId: "io.croquet.gperez.snakes3D",
  name: Croquet.App.autoSession(),
  password: Croquet.App.autoPassword(),
  model: Game,
  view: GameView,
});

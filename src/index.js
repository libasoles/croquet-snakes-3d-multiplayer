import Scene, { SceneView } from "./Scene";
import Snake from "./Snake";

class Game extends Croquet.Model {
  init() {
    this.scene = Scene.create();
  }
}

class GameView extends Croquet.View {
  constructor(model) {
    super(model);
    this.model = model;

    this.views = [new SceneView(model.scene)];
  }

  detach() {
    super.detach();

    this.views.forEach((view) => view.detach());
  }
}

Game.register("Game");
Scene.register("Scene");
Snake.register("Snake");

Croquet.Session.join({
  appId: "io.croquet.gperez.snakes3D",
  name: Croquet.App.autoSession(),
  password: Croquet.App.autoPassword(),
  model: Game,
  view: GameView,
});

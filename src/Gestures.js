export class GesturesView extends Croquet.View {
  constructor(scene, { modelId }) {
    super(scene);
    this.scene = scene;
    this.modelId = modelId;

    this.lastPosition = null;

    this.bindControlls();
  }

  bindControlls() {
    window.ontouchstart = this.onTouchStart.bind(this);
    window.ontouchmove = this.onTouchMove.bind(this);
    window.ontouchend = this.onTouchEnd.bind(this);
  }

  onTouchStart(e) {
    this.lastPosition = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }

  onTouchMove(e) {
    const position = e.changedTouches[0];

    if (this.lastPosition.y > position.clientY + 5) {
      this.publishDirectionChanged({ UP: true });
    } else if (this.lastPosition.y < position.clientY - 5) {
      this.publishDirectionChanged({ DOWN: true });
    } else if (this.lastPosition.x > position.clientX + 5) {
      this.publishDirectionChanged({ LEFT: true });
    } else if (this.lastPosition.x < position.clientX - 5) {
      this.publishDirectionChanged({ RIGHT: true });
    }

    this.lastPosition = {
      x: position.clientX,
      y: position.clientY,
    };
  }

  onTouchEnd() {
    this.publishDirectionChanged();
  }

  publishDirectionChanged(direction) {
    this.publish(this.modelId, "control-direction-changed", {
      directions: {
        UP: false,
        DOWN: false,
        LEFT: false,
        RIGHT: false,
        ...direction,
      },
      viewId: this.viewId,
      modelId: this.modelId,
    });
  }
}

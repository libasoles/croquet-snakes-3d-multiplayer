import { isSelf } from "./utils";

export default class Toast extends Croquet.Model {
  init() {
    this.subscribe("toast", "broadcast", this.updateStatus);
  }

  updateStatus(status) {
    this.publish("toast", "display", status);
  }
}

export class ToastView extends Croquet.View {
  constructor(model) {
    super(model);
    this.model = model;

    this.subscribe("toast", "display", this.displayStatus);
  }

  displayStatus({ viewId, message }) {
    if (!isSelf(viewId, this.viewId)) return;

    if (this.duplicates(message)) return;

    const toast = this.create(message);

    messages.appendChild(toast);

    setTimeout(() => {
      this.close(toast);
    }, 2000);
  }

  duplicates(message) {
    return Array.from(messages.childNodes).some(
      (child) => child.textContent === message
    );
  }

  create(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    return toast;
  }

  close(toast) {
    if (messages.contains(toast)) messages.removeChild(toast);
  }
}

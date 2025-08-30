export type ControlType = "KEYS" | "DUMMY" | "AI";

export class Controls {
  public forward: boolean = false;
  public left: boolean = false;
  public right: boolean = false;
  public reverse: boolean = false;

  constructor(type: ControlType) {
    switch (type) {
      case "KEYS":
        this.#addKeyboardListeners();
        break;
      case "DUMMY":
        this.forward = true;
        break;
      // AI is default case
      default:
        break;
    }
  }

  // Private method to listen to keyboard input
  #addKeyboardListeners(): void {
    document.addEventListener("keydown", this.#onKeyDown);
    document.addEventListener("keyup", this.#onKeyUp);
  }

  // Arrow function ensures `this` binding
  #onKeyDown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case "ArrowLeft":
        this.left = true;
        break;
      case "ArrowRight":
        this.right = true;
        break;
      case "ArrowUp":
        this.forward = true;
        break;
      case "ArrowDown":
        this.reverse = true;
        break;
    }
  };

  #onKeyUp = (event: KeyboardEvent): void => {
    switch (event.key) {
      case "ArrowLeft":
        this.left = false;
        break;
      case "ArrowRight":
        this.right = false;
        break;
      case "ArrowUp":
        this.forward = false;
        break;
      case "ArrowDown":
        this.reverse = false;
        break;
    }
  };
}

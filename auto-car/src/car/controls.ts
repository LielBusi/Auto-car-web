export enum ControlType {
  KEYS = "KEYS",
  DUMMY = "DUMMY",
  AI = "AI",
}

export class Controls {
  public forward: number;
  public left: number;
  public right: number;
  public reverse: number;

  public constructor(type: ControlType) {
    switch (type) {
      case "KEYS":
        this.addKeyboardListeners();
        break;
      case "DUMMY":
        this.forward = 10;
        break;
      // AI is default case
      default:
        break;
    }
  }

  // Private method to listen to keyboard input
  private addKeyboardListeners(): void {
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.#onKeyUp);
  }

  // Arrow function ensures `this` binding
  private onKeyDown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case "ArrowLeft":
        this.left = 10;
        break;
      case "ArrowRight":
        this.right = 10;
        break;
      case "ArrowUp":
        this.forward = 10;
        break;
      case "ArrowDown":
        this.reverse = 10;
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

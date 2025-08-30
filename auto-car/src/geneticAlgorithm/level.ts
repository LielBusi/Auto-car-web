export default class Level {
  public inputs: number[];
  public outputs: number[];
  public biases: number[];
  public weights: number[][];

  constructor(inputCount: number, outputCount: number) {
    this.inputs = new Array(inputCount).fill(0);
    this.outputs = new Array(outputCount).fill(0);
    this.biases = new Array(outputCount).fill(0);

    this.weights = Array.from({ length: inputCount }, () =>
      new Array(outputCount).fill(0)
    );

    Level.randomize(this);
  }

  private static randomize(level: Level): void {
    for (let i = 0; i < level.inputs.length; i++) {
      for (let j = 0; j < level.outputs.length; j++) {
        level.weights[i][j] = Math.random() * 2 - 1;
      }
    }

    for (let i = 0; i < level.biases.length; i++) {
      level.biases[i] = Math.random() * 2 - 1;
    }
  }

  static feedForward(givenInputs: number[], level: Level): number[] {
    for (let i = 0; i < level.inputs.length; i++) {
      level.inputs[i] = givenInputs[i];
    }

    for (let i = 0; i < level.outputs.length; i++) {
      let sum = 0;
      for (let j = 0; j < level.inputs.length; j++) {
        sum += level.inputs[j] * level.weights[j][i];
      }

      level.outputs[i] = sum > level.biases[i] ? 1 : 0;
    }

    return level.outputs;
  }
}

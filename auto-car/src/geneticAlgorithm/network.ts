import Level from "./level";
import { lerp } from "../world/logic/math/utils";

export default class NeuralNetwork {
  public levels: Level[];

  // Initialize simple neural network using amount of neurons in each layer.
  public constructor(neuronCounts: number[]) {
    this.levels = [];
    for (let i = 0; i < neuronCounts.length - 1; i++) {
      this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]));
    }
  }

  public static feedForward(
    givenInputs: number[],
    network: NeuralNetwork
  ): number[] {
    let outputs = Level.feedForward(givenInputs, network.levels[0]);
    for (let i = 1; i < network.levels.length; i++) {
      outputs = Level.feedForward(outputs, network.levels[i]);
    }
    return outputs;
  }

  /* Create mutation on existing network for genetic algorithm.
     Amount should be a value between 0 and 1.
     0 means no change from existing network, while 1 means full change.
     It creates soft mutation that keeps all values between 0 and 1. */
  public static mutate(network: NeuralNetwork, amount: number = 1): void {
    for (const level of network.levels) {
      for (let i = 0; i < level.biases.length; i++) {
        level.biases[i] = lerp(level.biases[i], Math.random() * 2 - 1, amount);
      }

      for (let i = 0; i < level.weights.length; i++) {
        for (let j = 0; j < level.weights[i].length; j++) {
          level.weights[i][j] = lerp(
            level.weights[i][j],
            Math.random() * 2 - 1,
            amount
          );
        }
      }
    }
  }
}

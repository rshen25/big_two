import Phaser from "phaser";
import BigTwo from "./scenes/bigTwo.js";

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
    mode: Phaser.Scale.FIT,
    width: 1280,
    height: 780,
    scene: [
        BigTwo
    ]
};

const game = new Phaser.Game(config);

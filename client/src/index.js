import Phaser from "phaser";
import BigTwo from "./scenes/bigTwo.js";

const config = {
  type: Phaser.AUTO,
    parent: "phaser-example",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight,
    },
    scene: [
        BigTwo
    ]
};

const game = new Phaser.Game(config);


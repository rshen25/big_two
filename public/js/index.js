import Phaser from "phaser";
import BigTwo from "./scenes/bigTwo.js";

let config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    scene: [
        BigTwo
    ]
};

const game = new Phaser.Game(config);

import Phaser from "phaser";
import BigTwo from "./scenes/bigTwo.js";

const config = {
    type: Phaser.AUTO,
    backgroundColor:'#278f42',
    scale: {
        parent: "big-two",
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600,
    },
    scene: [
        BigTwo
    ]
};

const game = new Phaser.Game(config);


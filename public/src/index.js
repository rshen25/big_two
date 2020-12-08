import Phaser from "phaser";
import BigTwo from "./scenes/bigTwo.js";
import Lobby from "./scenes/lobby.js";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#278f42',
    plugins: {
        scene: [{
            key: 'rexUI',
            plugin: RexUIPlugin,
            mapping: 'rexUI'
        }]
    },
    scale: {
        parent: "big-two",
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600,
    },
    scene: [
        Lobby,
        BigTwo
    ]
};

const game = new Phaser.Game(config);
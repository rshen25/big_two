/**
 * A basic button object with input ability, extends Phaser's text object
 */

export default class Button extends Phaser.GameObjects.Text {
    constructor(scene, x, y, text, style) {
        super(scene, x, y, text, style);
        this.setInteractive();
        scene.add.existing(this);
        this.on('pointerdown', this.onClick, this);
    }

    onClick() {

    }
}
/**
 * A basic button object with input ability, extends Phaser's text object
 */

export default class Button extends Phaser.GameObjects.Container {
    constructor(scene, x, y, texture, up, down, over, text, style) {
        super(scene, x, y);

        // Add the button sprite
        this.sprite = scene.add.sprite(0, 0, texture);
        this.spriteUp = up;
        this.spriteDown = down;
        this.spriteOver = over;
        this.add(this.sprite);

        // Add the text
        this.text = scene.add.text(0, 0, text);
        this.text.setOrigin(0.5);
        if (style.fontSize) this.text.setFontSize(style.fontSize);
        if (style.fontFamily) this.text.setFontFamily(style.fontFamily)
        if (style.color) this.text.setColor(style.color);
        this.add(this.text);

        this.setSize(this.sprite.width, this.sprite.height);
        this.setInteractive();
        scene.add.existing(this);
        this.on(Phaser.Input.Events.POINTER_DOWN, this.onClick, this);
        this.on(Phaser.Input.Events.POINTER_OVER, this.onHover, this);
        this.on(Phaser.Input.Events.POINTER_OUT, this.onOut, this);
    }

    onClick() {
        this.sprite.setFrame(this.spriteDown);
    }

    onHover() {
        this.sprite.setFrame(this.spriteOver);
    }

    onOut() {
        this.sprite.setFrame(this.spriteUp);
    }
}
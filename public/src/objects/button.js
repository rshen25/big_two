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
        this.on(Phaser.Input.Events.POINTER_UP, this.onOut, this);
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

    /**
    * Enables the button
    */
    enable() {
        this.sprite.clearTint();
        this.setInteractive();
    }

    /**
     * Disables the button from being pressed
     */
    disable() {
        // Set colour to grey
        this.sprite.setTint('0xa1a1a1');

        console.log('Tint applied');

        // Disable interactivity
        this.disableInteractive();
    }

    /**
     * Sets the visibility of the button
     * @param {boolean} bool : True to set the button invisible, false to be visible
     */
    setVisibility(bool) {
        if (bool) {
            this.setAll('visible', true);
        }
        else {
            this.setAll('visible', false);
        }
    }

    /**
     * Sets the scale for the button sprite itself
     * @param {number} xScale : The amount we want to scale the width
     * @param {number} yScale : The amount we want to scale the height
     */
    setButtonScale(xScale, yScale) {
        this.sprite.setScale(xScale, yScale);
    }

    /**
     * Sets the font size of the text inside the button
     * @param {integer} size : The font size
     */
    setFontSize(size) {
        this.text.setFontSize(size);
    }

    /**
     * Sets the text string inside the button
     * @param {string} text : The text we want to set to
     */
    setText(text) {
        this.text.setText(text);
    }
}
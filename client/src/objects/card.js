/**
 * A Card Object to represent a playing card for the client
 */

export default class Card{
    constructor(value, suit, suitValue, key, sprite, scene) {
        this.value = value;
        this.suit = suit;
        this.suitValue = suitValue;
        this.key = key;
        this.sprite = sprite;
        this.scene = scene;
    }

    render (x, y)  {
        this.card = this.scene.add.image(x, y, this.key, this.sprite)
            .setScale(0.7, 0.7)
            .setInteractive();
        this.scene.input.setDraggable(this.card);
        return this.card;
    }

}
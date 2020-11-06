/**
 * A Card Object to represent a playing card
 */

export default class Card {
    constructor(value, suit, sprite, scene) {
        this.value = value;
        this.suit = suit;
        this.sprite = sprite;
        this.scene = scene;

    }

    render (x, y, key, sprite)  {
        this.card = this.scene.add.image(x, y, key, sprite).setScale(0.75, 0.75).setInteractive();
        this.scene.input.setDraggable(this.card);
        return this.card;
    }

}
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

    render(x, y) {
        let card = this.scene.add.image(x, y, this.key, this.sprite)
            .setScale(0.45, 0.45)
            .setInteractive();

        return card;
    }

}
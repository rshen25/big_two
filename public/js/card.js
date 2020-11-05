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
}
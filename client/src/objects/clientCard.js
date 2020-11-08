/**
 * A Card Object to represent a playing card for the client
 */

import Card from '../../../src/objects/card.js';

export default class ClientCard extends Card {
    constructor(value, suit, suitValue, key, sprite, scene) {
        super(value, suit, suitValue);
        this.key = key;
        this.sprite = sprite;
        this.scene = scene;
    }

    render (x, y)  {
        this.card = this.scene.add.image(x, y, this.key, this.sprite)
            .setScale(0.75, 0.75)
            .setInteractive();
        this.scene.input.setDraggable(this.card);
        return this.card;
    }

}
/**
 * A button which checks if the player's current selected cards can be played,
 * if so, sends the data to the server to be played.
 */

import Button from '../objects/button.js';

export default class PlayButton extends Button {
    constructor(scene, x, y, texture, up, down, over, style) {
        super(scene, x, y, texture, up, down, over, 'PLAY', style);
    }

    onClick() {
        super();
        this.emit('playCards');
    }
}
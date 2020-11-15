/**
 * A button which checks if the player's current selected cards can be played,
 * if so, sends the data to the server to be played.
 */

import Button from '../objects/button.js';

export default class PlayButton extends Button {
    constructor(scene, x, y, style) {
        super(scene, x, y, 'PLAY', style);
    }

    onClick() {
        this.emit('playCards');
    }
}
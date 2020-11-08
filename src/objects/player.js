/**
 * A Player object that represents a single player in the game
 */

import Hand from './hand.js';

export default class Player {

    constructor(id) {
        this.isRoomOwner = false;
        this.id = id;
        this.hand = new Hand();
    }

    playCard() {

    }

    playCards() {

    }
}
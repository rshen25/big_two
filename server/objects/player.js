/**
 * A Player object that represents a single player in the game
 */

//import Hand from './hand.js';

module.exports = class Player {
    Hand = require('./hand.js');

    constructor(id, number) {
        this.isRoomOwner = false;
        this.id = id;
        this.hand = new Hand();
        this.playerNumber = number;
    }

    playCard() {

    }

    playCards() {

    }
}
/**
 * A Player object that represents a single player in the game
 */

let Hand = require('./hand.js');

module.exports = class Player {
    constructor(id, number) {
        this.isRoomOwner = false;
        this.id = id;
        this.hand = new Hand();
        this.playerNumber = number;
    }

    /**
     * Removes the given card from the hand if found
     * @param {Card} card : The card to be removed
     * @returns {boolean} : True if the card is found in the hand and removed
     */
    playCard(card) {
        return this.hand.removeCard(card);
    }

    /**
     * Removes the set of cards from the had if found
     * @param {Array} cards : An array of card objects to be removed
     * @returns {boolean} : True if all the cards provided are found and removed
     */
    playCards(cards) {
        return this.hand.findAndRemoveCards(cards);
    }

    /**
     * Returns the player's hand
     * @returns {Hand} : The player's hand
     */
    getHand() {
        return this.hand;
    }

    /**
     * Adds a card to the player's hand
     * @param {Card} card : Card object to add to the hand
     */
    addCardToHand(card) {
        this.hand.addCard(card);
    }
}
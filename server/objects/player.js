/**
 * A Player object that represents a single player in the game
 */

let Hand = require('./hand.js');

module.exports = class Player {
    constructor(id, username) {
        this.id = id;
        this.username = username;
        this.hand = new Hand();
        this.playerNumber = -1;
        this.score = [0, 0, 0, 0];
        this.gameRoom = '';
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

    /**
     * Gets the score of the player
     * @returns {Array} : An array representing the player's placement
     */
    getScore() {
        return this.score;
    }

    /**
     * Updates the score of the player given their placement
     * @param {integer} place : The position where the player finished we want to update
     *                          (1, 2, 3, 4)
     */
    updateScore(place) {
        if (place >= 1 && place <= 4) {
            this.score[place - 1]++;
        }
    }

    setGameRoom(room) {
        this.gameRoom = room;
    }

    setPlayerNumber(number) {
        this.playerNumber = number;
    }
}
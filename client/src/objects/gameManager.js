/**
 * Game Manager singleton that manages the game logic and assets
 */

export default class GameManager {
    static instance = null;

    players = {};

    constructor() {
        if (!this.instance) {
            this.instance = this;
            //this.deck = new Deck();
        }
        return this.instance;
    }

    /**
     * Adds a player to the game
     * @param {any} id - The player id
     */
    connectPlayer(id) {
        console.log('A user connected.');

        players[id] = {
            playerId: id
        };
    }

    /**
     * Removes a player from the game
     * @param {any} id - The player id
     */
    disconnectPlayer(id) {
        console.log('User disconnected.');

        // Remove the player from the players object
        delete players[id];
    }

    /**
     * Deals the cards to all the players in the game
     */
    deal() {

    }

    /**
     * Randomizes the cards within the deck
     */
    shuffle() {

    }

    /**
     * Resets the deck of cards by taking all the cards from the players
     */
    resetDeck() {

    }
}
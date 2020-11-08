/**
 * Game Manager singleton that manages the game logic and assets
 */

import Card from './card.js';

export default class GameManager {
    static instance = null;

    players = {};

    constructor(scene) {
        if (!this.instance) {
            this.instance = this;
            //this.deck = new Deck();
        }
        this.scene = scene;
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
        for (let i = 0; i < 5; i++) {
            let playerCard = new Card(this.scene);
            playerCard.render(475 + (i * 30), 500, 'playingCards', 'cardHearts2.png');
            playerCard.render(475 + (i * 30), 125, 'playingCards', 'cardJoker.png'); 
        }
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
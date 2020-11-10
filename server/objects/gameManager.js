/**
 * Game Manager singleton that manages the game logic and assets
 */
'use strict'
/*import Deck from './deck.js';
import Player from './player.js';*/

let Player = require('./player.js');
let Deck = require('./deck.js');

module.exports = class GameManager {

    static instance = null;

    players = {};

    suitRanking = {
        'Spades': 0,
        'Clubs': 1,
        'Diamonds': 2,
        'Hearts' : 3,
    }

    constructor() {
        if (!this.instance) {
            this.instance = this;
            //this.deck = new Deck();
        }
        this.deck = new Deck(this.suitRanking);
        return this.instance;
    }

    /**
     * Adds a player to the game
     * @param {any} id - The player id
     */
    connectPlayer(id) {
        players[id] = new Player(id, Object.keys(players).length + 1);

        console.log(`A user connected. Number of Players: ${players.length}`);
    }

    /**
     * Removes a player from the game
     * @param {any} id - The player id
     */
    disconnectPlayer(id) {
        console.log('User disconnected.');

        // Remove the player from the players object
        // delete players[id];
    }

    /**
     * Deals the cards to all the players in the game
     */
    dealCards() {
        let playersInRoom = [];
        for (player in players) {
            playersInRoom.push(player);
        }
        this.deck.dealCards(playersInRoom);

        return players;
    }

    /**
     * Randomizes the cards within the deck
     */
    shuffle() {
        this.deck.shuffle();
    }

    /**
     * Resets the deck of cards by taking all the cards from the players
     */
    resetDeck() {
    }
}
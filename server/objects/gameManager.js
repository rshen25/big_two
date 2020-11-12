/**
 * Game Manager singleton that manages the game logic and assets
 */
'use strict'

let Player = require('./player.js');
let Deck = require('./deck.js');

module.exports = class GameManager {

    static instance = null;

    players = {};
    numberOfPlayers = 0;

    suitRanking = {
        'Spades': 0,
        'Clubs': 1,
        'Diamonds': 2,
        'Hearts' : 3,
    }

    constructor() {
        if (!this.instance) {
            this.instance = this;
            this.deck = new Deck(this.suitRanking);
        }
        this.deck = new Deck(this.suitRanking);
        this.previouslyPlayed = null;
        return this.instance;
    }

    /**
     * Adds a player to the game
     * @param {any} id - The player id
     */
    connectPlayer(id) {
        this.numberOfPlayers += 1;
        this.players[id] = new Player(id, this.numberOfPlayers);

        console.log(`A user connected. Number of Players: ${this.numberOfPlayers}`);
    }

    /**
     * Removes a player from the game
     * @param {any} id - The player id
     */
    disconnectPlayer(id) {
        console.log('User disconnected.');

        // Remove the player from the players object
        delete this.players.id;

        this.numberOfPlayers -= 1;
    }

    /**
     * Deals the cards to all the players in the game
     */
    dealCards() {
        this.resetDeck();
        let playersInRoom = [];
        for (const property in this.players) {
            playersInRoom.push(this.players[property]);
        }
        this.deck.deal(playersInRoom);

        return this.players;
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
        this.deck.reset();
    }
}
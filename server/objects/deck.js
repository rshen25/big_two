/**
 * A Deck object to hold the playing cards
 */

// import Card from './card.js';
Card = require('./card.js');

module.exports = class Deck {
    deck = [];

    constructor(suitRankings) {
        this.suitRankings = suitRankings;
        this.initializeDeck();
        this.shuffle();
    }

    /**
     * Creates a new Card object and adds it to the deck
     */
    initializeDeck() {
        console.log('Initializing deck');
        let suits = Object.keys(this.suitRankings);
        for (let i = 0; i < suits.length; i++) {
            let suit = suits[i];
            for (let j = 3; j <= 15; j++) {
                if j == 15 {
                    this.deck.push(new Card(17, suit, i));
                }
                else {
                    this.deck.push(new Card(j, suit, i));
                }
            }
        }
        console.log('Deck Initialized');
    }

    /**
     * Randomizes the deck by swapping elements within the deck
     */
    shuffle() {
        console.log('Shuffling deck');
        let j, tmp;
        for (let i = this.deck.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            tmp = this.deck[i];
            this.deck[i] = this.deck[j];
            this.deck[j] = tmp;
        }
        console.log('Deck shuffled');
    }

    /**
     * Deals out the entire deck of cards to each player in the game.
     * @param {Player} players - An array of all the players in the game.
     */
    deal(players) {
        let player = 0;
        while (this.deck.length > 0) {
            players[player].hand.addCard(this.deck.pop());
            player = (player + 1) % players.length;
        }
    }

    /**
     * Resets the deck to its initial state and shuffled
     * */
    reset() {
        this.deck = [];
        this.initializeDeck();
        this.shuffle();
    }
}
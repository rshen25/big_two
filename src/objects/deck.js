/**
 * A Deck object to hold the playing cards
 */

import Card from './card.js';

export default class Deck {
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
        let suits = Object.keys();
        for (let i = 0; i < suitRankings.length; i++) {
            let suit = suits[i];
            for (let j = 1; j <= 13; j++) {
                this.deck.push(new Card(j, suit, i));
            }
        }
    }

    /**
     * Randomizes the deck by swapping elements within the deck
     */
    shuffle() {
        let j, tmp;
        for (let i = this.deck.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            tmp = this.deck[i];
            this.deck[i] = a[j];
            this.deck[j] = tmp;
        }
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
}
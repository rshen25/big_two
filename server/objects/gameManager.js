/**
 * Game Manager singleton that manages the game logic and assets
 */
let Player = require('./player.js');
let Deck = require('./deck.js');

module.exports = class GameManager {

    static instance = null;

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
        this.previouslyPlayed = [];
        this.numberOfPlayers = 0;
        this.players = {};
        this.currentTurn = -1;
        return this.instance;
        this.turnOrder = [];
    }

    /**
     * Adds a player to the game
     * @param {string} id - The player id
     */
    connectPlayer(id) {
        this.numberOfPlayers++;
        this.players[id] = new Player(id, this.numberOfPlayers);

        console.log(`A user connected. Number of Players: ${this.numberOfPlayers}`);
    }

    /**
     * Removes a player from the game
     * @param {string} id - The player id
     */
    disconnectPlayer(id) {
        console.log('User disconnected.');

        // Remove the player from the players object
        delete this.players.id;

        this.numberOfPlayers--;
    }

    /**
     * Generates the turn order for each player by going clock-wise from the player
     * that has the three of spades in their hand
     */
    generatePlayerOrder() {
        // Find the player who has the three of spades
        let firstPlayer = 0;
        for (const id in this.players) {
            let card = this.players[id].hand.getCard(0);
            if (card.value == 3 && card.suitRanking == 0) {
                firstPlayer = this.players[id].playerNumber;
                this.turnOrder.push(firstPlayer);
                break;
            }
        }

        // Generate the remainder of the players
        for (let i = 1; i < 4; i++) {
            if (firstPlayer + 1 % 4 == 0) {
                firstPlayer = 1;
            }
            this.turnOrder.push(++firstPlayer);
        }
        console.log(`Turn order: ${this.turnOrder}`);
    }

    /**
     * Attempts to plays the cards of the player
     * @param {Array} cards - An array of card objects the player intends to play
     * @param {string} id - The string id of the player
     * @returns {boolean} - True if the cards were played
     */
    playCards(cards, id) {
        // Call the Game Manager to see if the play is valid
        if (this.checkIfValidPlayHand(cards)) {
            return this.players[id].playCards(cards);
        }
        else {
            return false;
        }
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

    /**
     * Checks to see whether the cards a player intends to play is a pair or not
     * @param {Array} cardsToPlay - An array of card objects the player intends to play
     * @returns {boolean} - True if it is a pair, false otherwise
     */
    isPair(cardsToPlay) {
        if (cardsToPlay.length != 2) {
            return false;
        }
        if (cardsToPlay.length == 2) {
            if (cardsToPlay[0].value != cardsToPlay[1].value) {
                return false;
            }
        }
        return true;
    }

    /**
     * Checks to see whether the cards a player intends to play is a three of a kind or not
     * @param {Array} cardsToPlay - An array of card objects the player intends to play
     * @returns {boolean} - True if its a triple, false otherwise
     */
    isTriple(cardsToPlay) {
        let numCards = cardsToPlay.length;
        if (numCards != 3) {
            return false;
        }
        for (let i = 0; i < numCards - 1; i++) {
            if (cardsToPlay[i].value != cardsToPlay[i + 1].value) {
                return false;
            }
        }
        return true;
    }

    /**
     * Checks to see whether the cards a player intends to play is a straight or not
     * @param {Array} cardsToPlay - An array of card objects the player intends to play
     * @returns {boolean} - True if it is a straight, false otherwise
     */
    isStraight(cardsToPlay) {
        for (let i = 0; i < cardsToPlay.length - 1; i++) {
            if (cardsToPlay[i + 1].value != cardsToPlay[i + 1].value + 1) {
                return false;
            }
        }
        return true;
    }

    /**
     * Checks to see if the cards a player intends to play is a four of a kind or not
     * @param {Array} cardsToPlay - An array of card objects the player intends to play
     * @returns {boolean} - True if the cards to be played are four of a kind, false otherwise
     */
    isQuads(cardsToPlay) {
        if (cardsToPlay.length != 4) {
            return false;
        }
        else {
            for (let i = 0; i < cardsToPlay.length - 1; i++) {
                if (cardsToPlay[i].value != cardsToPlay[i + 1].value) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Checks to see if the hand is a 'Bomb' - a set of at least three or more
     * pairs in sequential order
     * @param {Array} cardsToPlay - An array of card objects the player intends to play
     * @returns {boolean} - True if the cards to be played is a bomb, false otherwise
     */
    isBomb(cardsToPlay) {
        let num = cardsToPlay.length;
        if (num % 2 != 0 || num < 6) {
            return false;
        }
        else {
            for (let i = 0; i < num; i += 2) {
                // Check if its a pair
                if (cardsToPlay[i] != cardsToPlay[i + 1]) {
                    return false;
                }
                // Check if the sequence is increasing
                if (i + 2 < num - 1) {
                    if (cardsToPlay[i] != cardsToPlay[i + 2] - 1) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /**
     * Checks if the current cards selected to be played is a valid play
     * @param {Array} cardsToPlay - An array of card objects the player intends to play
     * @returns {boolean} - True if valid, false otherwise
     */
    checkIfValidPlayHand(selectedCards) {
        let numCards = selectedCards.length;
        // If nothing was played last or everyone has passed
        if (this.lastPlayed.length == 0) {
            return true;
        }
        // Same amount of cards are being played this round from the last
        if (numCards == this.lastPlayed.length) {
            if (numCards == 1) {
                if (selectedCards[0].compareTo(lastPlayed[0])) {
                    return true;
                }
            }
            if (this.isPair(selectedCards) || this.isTriple(selectedCards) ||
                this.isQuads(selectedCards)) {
                if (selectedCards[1].compareTo(lastPlayed[1])) {
                    return true;
                }
            }
            if (this.isStraight(selectedCards) || this.isBomb(selectedCards)) {
                if (selectedCards[numCards - 1].compareTo(this.lastPlayed[numCards - 1])) {
                    return true;
                }
            }
        }
        else {
            // If a single two was played and the current play is to play a 'Bomb'
            if (this.lastPlayed[0] == 2 &&
                (this.isQuads(selectedCards) || this.isBomb(selectedCards))) {
                return true;
            }
            // If there were pair twos played and the current play is a 'Bomb'
            if (this.isPair(this.lastPlayed) && selectedCards[0] == 2 &&
                this.isBomb(selectedCards) && numCards >= 8) {
                return true;
            }
            // If there were triple twos played and the current play is a 'Bomb'
            if (this.isTriple(this.lastPlayed) && selectedCards[0] == 2 &&
                this.isBomb(selectedCards) && numCards >= 10) {
                return true;
            }

            if (this.isBomb(this.lastPlayed) &&
                this.lastPlayed.length == 6 &&
                this.isQuads(selectedCards)) {
                return true;
            }
        }
        return false;
    }
}
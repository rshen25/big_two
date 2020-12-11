/**
 * Game Manager singleton that manages the game logic and assets
 */
let Player = require('./player.js');
let Deck = require('./deck.js');

module.exports = class GameManager {

    suitRanking = {
        'Spades': 0,
        'Clubs': 1,
        'Diamonds': 2,
        'Hearts' : 3,
    }

    constructor() {
        this.deck = new Deck(this.suitRanking);
        this.numberOfPlayers = 0;           // The number of players in the game
        this.players = {};                  // Players object to hold the players

        this.lastPlayedTurn = 0;      // The turn where the last play was made
        this.lastPlayed = [];         // The cards that were played last
        this.currentTurn = -1;              // The current player's id
        this.turnOrder = [];                // The order which players take their turns
        this.playerTurn = 0;
        this.turnNumber = 0;                // The number of turns that have elapsed
        this.placed = [];                   // The place each player finished
        return this.instance;
    }

    /**
     * Adds a player to the game
     * @param {string} id : The player id
     */
    connectPlayer(id) {
        this.numberOfPlayers++;
        this.players[id] = new Player(id, this.numberOfPlayers);

        console.log(`A user connected. Number of Players: ${this.numberOfPlayers}`);
    }

    /**
     * Removes a player from the game
     * @param {string} id : The player id
     */
    disconnectPlayer(id) {
        console.log('User disconnected.');

        // Remove the player from the players object
        delete this.players[id];

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
            let card = this.players[id].getHand().getCard(0);
            if (card.value == 3 && card.suitValue == 0) {
                firstPlayer = this.players[id].playerNumber;
                this.turnOrder.push(id);
                console.log(`Player ${id} - ${firstPlayer} goes first`);
                break;
            }
        }

        // Generate the remainder of the players
        for (let i = 1; i < 4; i++) {
            firstPlayer++;
            if (firstPlayer % 5 == 0) {
                firstPlayer = 1;
            }
            this.turnOrder.push(this.getPlayerID(firstPlayer % 5));
        }

        this.currentTurn = this.turnOrder[this.playerTurn];
        console.log(`Turn order: ${this.turnOrder}`);
    }

    /**
     * Searches among all the players in the game for their ID given their player number
     * @param {integer} playerNumber : The player's number to look for (1 - 4)
     * @returns {string} : The player id string, or null if not found
     */
    getPlayerID(playerNumber) {
        for (const id in this.players) {
            if (this.players[id].playerNumber == playerNumber) {
                return id;
            }
        }
        return null;
    }

    /**
     * Attempts to plays the cards of the player
     * @param {Array} cards : An array of card objects the player intends to play
     * @param {string} id : The string id of the player
     * @returns {boolean} : True if the cards were played
     */
    playCards(cards, id) {
        // Call the Game Manager to see if the play is valid
        if (this.checkIfValidPlayHand(cards)) {
            if (this.players[id].playCards(cards)) {
                this.setPreviouslyPlayed(cards, this.turnNumber);
                this.incrementTurnCount();
                this.incrementPlayerTurn();
                this.currentTurn = this.getCurrentPlayerTurn();
                return true;
            }
        }
        else {
            return false;
        }
    }

    /**
     *  Increments the turn to the next player when a player passes
     *  @returns {integer} : The player number of the new current turn's player 
     */
    playPass() {
        this.incrementTurnCount();
        this.incrementPlayerTurn();
        this.currentTurn = this.getCurrentPlayerTurn();
        console.log(`Turn Number length: ${this.turnOrder.length}`);
        console.log(`Last Played Turn Number: ${this.lastPlayedTurn}`);

        console.log(`Last Played Turn: ${this.lastPlayedTurn % this.turnOrder.length} , ID: ${this.turnOrder[this.lastPlayedTurn % this.turnOrder.length]}`);
        console.log(`Current ID's Turn: ${this.currentTurn}`);
        // If every other player passes their turn and it goes back to the last player
        // to play their cards, we reset last played so the player make a new play
        if (this.turnOrder[this.playerTurn] == this.currentTurn) {
            this.lastPlayed = [];
            console.log(`Everyone passed: ${this.currentTurn}`);
        }

        return this.currentTurn;
    }

    /**
     * Deals the cards to all the players in the game
     */
    dealCards() {
        this.resetDeck();
        let playersInRoom = [];
        for (const id in this.players) {
            playersInRoom.push(this.players[id]);
        }
        this.deck.deal(playersInRoom);

        // Sort their hands by value after their hands have been dealt
        for (const id in this.players) {
            this.players[id].getHand().sortByValue();
        }

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
     * Resets the game to it initial state in preparation for a new game
     */
    resetGame() {
        this.resetDeck();
        this.previouslyPlayedTurn = 0;
        this.previouslyPlayed = [];
        this.currentTurn = 0;             
        this.turnOrder = [];               
        this.turnNumber = 0;
        this.playerTurn = 0;
    }

    /**
     * Gets the current player's turn id
     * @returns {string} : The player id of the current turn's player
     */
    getCurrentPlayerTurn() {
        console.log(`Current Turn Pos: ${this.playerTurn}`);
        return this.turnOrder[this.playerTurn];
    }

    /**
     * Increments the number of turns
     */
    incrementTurnCount() {
        this.turnNumber++;
    }

    /**
    * Increments the player turn tracker
    */
    incrementPlayerTurn() {
        this.playerTurn++;
        this.playerTurn = this.playerTurn % this.turnOrder.length;
    }

    decrementPlayerTurn() {
        this.playerTurn--;
        if (this.playerTurn < 0) {
            this.playerTurn = this.turnOrder.length - 1;
        }
        this.playerTurn = this.playerTurn % this.turnOrder.length;
    }

    /****************************************************************************/
    // Game Logic
    /***************************************************************************/

    /**
     * Checks to see whether the cards a player intends to play is a pair or not
     * @param {Array} cardsToPlay : An array of card objects the player intends to play
     * @returns {boolean} : True if it is a pair, false otherwise
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
     * @param {Array} cardsToPlay : An array of card objects the player intends to play
     * @returns {boolean} : True if its a triple, false otherwise
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
     * @param {Array} cardsToPlay : An array of card objects the player intends to play
     * @returns {boolean} : True if it is a straight, false otherwise
     */
    isStraight(cardsToPlay) {
        for (let i = 0; i < cardsToPlay.length - 1; i++) {
            if (cardsToPlay[i].value != cardsToPlay[i + 1].value - 1) {
                return false;
            }
        }
        return true;
    }

    /**
     * Checks to see if the cards a player intends to play is a four of a kind or not
     * @param {Array} cardsToPlay : An array of card objects the player intends to play
     * @returns {boolean} : True if the cards to be played are four of a kind, false otherwise
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
     * @param {Array} cardsToPlay : An array of card objects the player intends to play
     * @returns {boolean} : True if the cards to be played is a bomb, false otherwise
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
     * @param {Array} cardsToPlay : An array of card objects the player intends to play
     * @returns {boolean} : True if valid, false otherwise
     */
    checkIfValidPlayHand(selectedCards) {
        if (this.turnNumber == 0 &&
            selectedCards[0].value != 3 &&
            selectedCards[0].suitValue != 0) {
            console.log(selectedCards[0]);
            console.log('Must include 3 of Spades');
            return false;
        }

        let numCards = selectedCards.length;
        // If nothing was played last or everyone has passed
        if (!this.lastPlayed || this.lastPlayed.length == 0) {
            console.log('New Play');
            if (numCards == 1 || this.isPair(selectedCards) || this.isTriple(selectedCards) ||
                this.isQuads(selectedCards) || this.isStraight(selectedCards) ||
                this.isBomb(selectedCards)) {
                console.log('Returned True on new play');
                return true;
            }
        }
        // Same amount of cards are being played this round from the last
        if (this.lastPlayed && numCards == this.lastPlayed.length) {
            if (numCards == 1) {
                if (this.compareCards(selectedCards[0], this.lastPlayed[0])) {
                    return true;
                }
            }
            if (this.isPair(selectedCards) || this.isTriple(selectedCards) ||
                this.isQuads(selectedCards)) {
                if (this.compareCards(selectedCards[1], this.lastPlayed[1])) {
                    return true;
                }
            }
            if (this.isStraight(selectedCards) || this.isBomb(selectedCards)) {
                if (this.compareCards(selectedCards[numCards - 1],
                    this.lastPlayed[numCards - 1])) {
                    return true;
                }
            }
        }
        else {
            // If a single two was played and the current play is to play a 'Bomb'
            if (this.lastPlayed[0].value == 17 &&
                (this.isQuads(selectedCards) || this.isBomb(selectedCards))) {
                return true;
            }
            // If there were pair twos played and the current play is a 'Bomb'
            if (this.isPair(this.lastPlayed) && selectedCards[0] == 17 &&
                this.isBomb(selectedCards) && numCards >= 8) {
                return true;
            }
            // If there were triple twos played and the current play is a 'Bomb'
            if (this.isTriple(this.lastPlayed) && selectedCards[0] == 17 &&
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

    /**
     * Compares the current card with another card and sees which one is higher, returns true
     * if the current card is higher, false otherwise
     * @param {Card} a : The first card we want to compare
     * @param {Card} b : The second card object to compare against
     * @returns {boolean} : Returns true if card is higher than other card, false otherwise
     */
    compareCards(a, b) {
        if (a.value < b.value) {
            return false;
        }
        if (a.value == b.value && a.suitValue < b.suitValue) {
            return false;
        }
        return true;
    }

    /**
     * Sets the previously played cards by a player and the turn number to be the set 
     * of cards and number given
     * @param {Array} cards : An array of cards representing the last play
     * @param {integer} turnNumber : The turn number of which the play was made
     */
    setPreviouslyPlayed(cards, turnNumber) {
        this.lastPlayed = cards;
        this.lastPlayedTurn = turnNumber;
    }

    /**
     * Checks if the player has finished the game by emptying their hand
     * @param {string} id : The id of the player who we are checking
     * @returns {boolean} : True if the player has finished, false otherwise
     */
    checkIfWon(id) {
        if (this.players[id].getHand().isEmpty()) {
            return true;
        }
        return false;
    }

    /**
     * Updates the scores and the score of the player and removes them from the turn order
     * @param {string} id : The id of the player who finished
     * @returns {integer} : the place the player finished at
     */
    playerWon(id) {
        this.placed.push(id);
        let place = this.placed.length;
        this.players[id].updateScore(place);
        this.removeFromTurnOrder(id);
        this.decrementPlayerTurn();
        return place;
    }

    /**
     * Removes the player from the turn order list
     * @param {string} id : The id of the player to remove
     */
    removeFromTurnOrder(id) {
        for (let i = 0; i < this.turnOrder.length; i++) {
            if (this.turnOrder[i] == id) {
                this.turnOrder.splice(i, 1);
            }
        }
        console.log(this.turnOrder);
    }

    /**
     * Retrieves the score from the given player
     * @param {string} id : The id of the player we want the score of
     */
    getPlayerScore(id) {
        return this.players[id].getScore();
    }

    /**
     * Gets the scores of every player in the game
     * @returns {Object} : The scores of each player in the game
     */
    getScores() {
        let scores = {};
        for (const id in this.players) {
            scores[id] = this.getPlayerScore(id);
        }
        return scores;
    }

    /**
     * Searches for and returns the player based on their id
     * @param {string} id : The id of the player we want to find
     * @returns {Player} : If found, will return the player, returns undefined otherwise
     */
    findPlayerById(id) {
        return this.players[id];
    }
}
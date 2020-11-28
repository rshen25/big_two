/**
 * A class used to help determine the ranking of each cards played and to see if a play
 * is valid
 * */

export default class Rules {

    constructor(lastPlayed) {
        this.lastPlayed = lastPlayed;
        this.lastPlayedTurn = 0;
        this.turnNumber = 0;
    }

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
            if (cardsToPlay[i].value != cardsToPlay[i + 1].value + 1) {
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
            for (let i = 0; i < num; i = i + 2) {
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
        if (numCards == this.lastPlayed.length) {
            console.log('old play');
            if (numCards == 1) {
                if (selectedCards[0].compareTo(this.lastPlayed[0])) {
                    return true;
                }
            }
            if (this.isPair(selectedCards) || this.isTriple(selectedCards) ||
                this.isQuads(selectedCards)) {
                if (selectedCards[1].compareTo(this.lastPlayed[1])) {
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
            if (this.lastPlayed[0] == 17 &&
                (this.isQuads(selectedCards) || this.isBomb(selectedCards))) {
                return true;
            } 
            // If there were pair twos played and the current play is a 'Bomb'
            if (this.isPair(this.lastPlayed) && selectedCards[0] == 17 &&
                this.isBomb(selectedCards) && numCards >= 8) {
                return true;
            }
            // If there were triple twos played and the current play is a 'Bomb'
            if (this.isTriple(this.lastPlayed) && selectedCards[0].value == 17 &&
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
     * Increases the turn count by 1 
     */
    incrementTurn() {
        this.turnNumber++;
    }

    /**
     * Sets the turn number to be the given turn number
     * @param {integer} number : The turn number to set to
     */
    setTurnNumber(number) {
        this.turnNumber = number;
    }

    /**
     * Sets the last played cards
     * @param {Array} lastPlayed : An array of cards which were played last
     */
    setLastPlayed(lastPlayed) {
        this.lastPlayed = lastPlayed;
        this.lastPlayedTurn = this.turnNumber;
    }
}
/**
 * A class used to help determine the ranking of each cards played and to see if a play
 * is valid
 * */

export default class Rules {

    comboRanking = {
        'Chop3Pairs': 10,  
        'ChopQuad': 20,
        'Chop4PairsHigher': 30,
    }

    constructor() {
    }

    /**
     * Checks to see whether the cards a player intends to play is a straight or not
     * @param {Array} cardsToPlay - An array of card objects the player intends to play
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
     * Checks to see if the cards to be played are a combo, and returns information about the
     * combination in an object
     * @param {Array} cardsToPlay - An array of card objects the player intends to play
     * @returns {Object} - An object containing the 'type' of combo, the 'length', and 'value'
     */
    isCombo(cardsToPlay) {

        // Check if its a straight
        if (this.isStraight(cardsToPlay)) {

        }

        // Check if its a four of a kind
        if (this.isQuads(cardsToPlay)) {

        }

        // Check if its a bomb
        if (this.isBomb(cardsToPlay)) {

        }

        return {};
    }
}
/**
 * A Card Object to represent a playing card
 */

module.exports = class Card {
    constructor(value, suit, suitValue) {
        this.value = value;
        this.suit = suit;
        this.suitValue = suitValue;
    }
}
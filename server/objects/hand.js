/**
 * A Hand object is a container to hold the playing cards and to restrict them within
 * a specified zone. Each player should have one hand total.
 */

module.exports = class Hand {
    constructor() {
        this.hand = [];
    }

    /**
     * Adds a card to the last position of the hand.
     * @param {Card} card - A card object
     */
    addCard(card) {
        this.hand.push(card);
    }

    /**
     * Removes a single card from the hand.
     * @param {integer} index - The position of the card within the hand.
     */
    removeCard(index) {
        this.hand.splice(index, 1);
    }

    /**
     * Removes multiple cards from the hand.
     * @param {Int16Array} indexes - An array of positions of cards to remove.
     */
    removeCards(indexes) {
        for (let i = indexes.length - 1; i >= 0; i--) {
            this.removeCard(indexes[i]);
        }
    }

    sortValue() {

    }

    sortSuit() {

    }

    playCard() {

    }
}
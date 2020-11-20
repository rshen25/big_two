/**
 * A Hand object is a container to hold the playing cards and to restrict them within
 * a specified zone. Each player should have one hand total.
 */

module.exports = class Hand {
    constructor() {
        this.hand = [];
    }

    /**
     * Gets the card in the hand at the given index, if it exists
     * @param {integer} index
     * @returns {Card} The card object at the given index
     */
    getCard(index) {
        if (index >= 0 && index < this.hand.length) {
            return this.hand[index];
        }
        return null;
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
     * @param {Card} card - The card to remove from the hand
     * @returns {boolean} - True if the card was found in the hand and removed
     */
    removeCard(card) {
        let index = this.findCard(card);
        if (index == -1) {
            return false;
        }
        this.hand.splice(index, 1);
        return true;
    }

    /**
     * Removes multiple cards from the hand.
     * @param {IntArray} indexes - An array of positions of cards to remove.
     */
    removeCards(indexes) {
        for (let i = indexes.length - 1; i >= 0; i--) {
            this.removeCard(indexes[i]);
        }
    }

    /**
     * Searches the hand to see if the given card is in the hand
     * @param {Card} card - The card to search for
     * @returns {integer} - Index of the card in hand if it exists, -1 otherwise
     */
    findCard(card) {
        let i = this.hand.length;
        let index = this.hand.length / 2;
        while (i > 0) {
            if (this.hand[index].value == card.value) {
                return index;
            }
            else {
                if (card.value < this.hand[index].value) {
                    index = index / 2;
                }
                else {
                    index += (index / 2);
                }
            }
            i = i / 2;
        }
        return -1;
    }

    /**
     * Searches the hand for each card given and removes them from the hand if found
     * @param {Array} cards - An array of card objects to find and remove
     * @returns {boolean} - True if all the cards were found and removed, false otherwise
     */
    findAndRemoveCards(cards) {
        let cardsFound = [];

        // Find all indexes of the cards
        for (let i = 0; i < cards.length; i++) {
            let index = this.findCard(cards[i]);
            if (index == -1) {
                continue;
            }
            else {
                cardsFound.push[index];
            }
        }
        if (cardsFound.length != cards.length) {
            return false;
        }

        // Remove them from the hand
        this.removeCards(cardsFound);

        return true;
    }

    /**
     * Partition function, used in the quicksort
     * @param {integer} lowerIndex - The starting index of the array
     * @param {integer} pivotIndex - The index of the pivot
     * @returns {integer} - The index where the pivot is placed after the sorting
     */
    partition(lowerIndex, pivotIndex) {
        l = lowerIndex - 1;

        for (let i = lowerIndex; i < pivotIndex; i++) {
            if (this.hand[i].value <= this.hand[pivotIndex].value) {
                l++;
                [this.hand[l], this.hand[i]] = [this.hand[i], this.hand[l]];
            }
        }
        [this.hand[l + 1], this.hand[pivotIndex]] = [this.hand[pivotIndex], this.hand[l + 1]]
        return l + 1;
    }

    /**
     * Helper function used to sort the hand in ascending order by value
     * @param {integer} first - The starting index to start sorting from
     * @param {integer} last - The index to stop sorting
     */
    sortValueHelper(first, last) {
        if (first < last) {
            pivot = partition(first, last - 1);
            this.sortValueHelper(first, pivot - 1);
            this.sortValueHelper(pivot + 1, last);
        }
    }

    /**     
     * Sorts the hand in ascending order based on their card value and suit
     * Uses quicksort for sorting the values
     */
    sortByValue() {
        // Sort by value
        sortValueHelper(0, this.hand.length);

        // Then sort by suit
        prevValue = this.hand[0];
        for (let i = 0; i < this.hand.length - 1; i++) {
            if (this.hand[i].suitValue > this.hand[i + 1].suitvalue &&
                this.hand[i].value == this.hand[i + 1].value) {
                [this.hand[i], this.hand[i + 1]] = [this.hand[i + 1], this.hand[i]];
            }
        }
    }

    /**
     * Sorts the hand in ascending order, but grouped by suit
     */
    sortBySuit() {

    }
}
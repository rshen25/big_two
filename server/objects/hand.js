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
     * @param {IntArray} indexes - An array of positions of cards to remove.
     */
    removeCards(indexes) {
        for (let i = indexes.length - 1; i >= 0; i--) {
            this.removeCard(indexes[i]);
        }
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
/**
 * A Hand object for the client is a container to hold the playing cards and to restrict them within
 * a specified zone. Each player should have one hand total.
 */

export default class Hand {
    constructor(x, y, width, height) {
        this.hand = [];
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     * Draws a rectangle to visualize where the hand is in the game scene
     * @param {any} scene - The current game scene
     */
    renderOutline(scene) {
        let handOutline = scene.add.graphics();
        handOutline.lineStyle(4, 0xffffff);
        handOutline.strokeRect(this.x - this.width / 2,
            this.y - this.height / 2, this.width, this.height);
    }

    /**
     * Adds a card to the hand
     * @param {any} card - A Card object
     */
    add(card) {
        this.hand.push(card);
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
     * */
    sort() {
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
     * Goes through each card in the hand checking to see if it has been selected
     * @returns {Array} - An array of cards the user has selected to be played
     */
    getSelectedCards() {
        let selectedCards = [];
        for (let i = 0; i < this.hand.length; i++) {
            if (this.hand[i].isSelected) {
                selectedCards.push(this.hand[i]);
            }
        }
        return selectedCards;
    }
}
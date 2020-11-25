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
        this.playerNumber = -1;
    }

    /**
     * Draws a rectangle to visualize where the hand is in the game scene
     * @param {Scene} scene - The current game scene
     */
    renderOutline(scene) {
        let handOutline = scene.add.graphics();
        handOutline.lineStyle(4, 0xffffff);
        handOutline.strokeRect(this.x - this.width / 2,
            this.y - this.height / 2, this.width, this.height);
    }

    /**
    * Gets the card in the hand at the given index, if it exists
    * @param {integer} index - The position of the card in the hand
    * @returns {Card} The card object at the given index
    */
    getCard(index) {
        if (index >= 0 && index < this.hand.length) {
            return this.hand[index];
        }
        return null;
    }

    /**
     * Adds a card to the hand
     * @param {Card} card - A Card object
     */
    add(card) {
        this.hand.push(card);
    }

    /**
     * Removes a single card from the hand.
     * @param {Card} card - The card to remove from the hand
     * @returns {boolean} - True if the card was found in the hand and removed
     */
    removeCard(index) {
        if (!this.hand) {
            return false;
        }
        if (index < this.hand.length && index >= 0) {
            this.hand.splice(index, 1);
            return true;
        }
        return false;
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
        let index = Math.floor(this.hand.length / 2);
        while (i > 0) {
            if (this.hand[index].value == card.value) {
                while (this.hand[index].value == card.value) {
                    if (card.suitValue < this.hand[index].suitValue) {
                        index--;
                        continue;
                    }
                    if (card.suitValue > this.hand[index].suitValue) {
                        index++;
                        continue;
                    }
                    if (this.hand[index].suitValue == card.suitValue) {
                        console.log(`Found ${card.value}`);
                        return index;
                    }
                }
                return -1;
            }
            else {
                if (card.value < this.hand[index].value) {
                    index = Math.floor(index / 2);
                }
                else {
                    index += Math.floor((this.hand.length - index) / 2);
                }
            }
            i = Math.floor(i / 2);
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
                cardsFound.push(index);
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

    /**
     * Enables the interactivity of each card in the hand
     */
    enableHand() {
        for (let i = 0; i < this.hand.length; i++) {
            this.hand[i].setInteractive();
        }
    }

    /**
     * Disables the interactivity of each card in the hand
     */
    disableHand() {
        for (let i = 0; i < this.hand.length; i++) {
            this.hand[i].disableInteractive();
        }
    }

    /**
     * Checks to see if the hand does not currently hold any cards
     * @returns {boolean} - True if the hand is currently empty, false otherwise
     */
    isEmpty() {
        if (this.hand.length == 0) {
            return true;
        }
        return false;
    }


    /**
     * Pops the last card in the hand
     */
    pop() {
        return this.hand.pop();
    }
}
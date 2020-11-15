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
/*
 * The play area of the cards, when cards are played they are moved to the play area and this holds the cards
 * that were last played. Adding cards to the play area will show them in the given scene.
 */

export default class PlayArea {
    constructor(scene, x, y, width, height) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.lastPlayed = [];
    }

    /**
     * Adds cards to the play area, and sets the last played to be the cards added
     * @param {Array} cards : The set of cards to add to the play area
     */
    addCards(cards) {
        this.deleteLastPlayed();
        let numCards = cards.length;
        let startX = this.x - (this.width / 2);
        for (let i = 0; i < numCards; i++) {
            cards[i].setX(startX + (20 * i));
            cards[i].setY(this.y);
            this.lastPlayed.push(cards[i]);
        }
        return true;
    }

    /**
     * Deletes the last played cards
     */
    deleteLastPlayed() {
        if (this.lastPlayed || this.lastPlayed.length != 0) {
            for (let i = 0; i < this.lastPlayed.length; i++) {
                this.lastPlayed[i].destroy(this.scene);
            }
        }
    }

    /**
     * Gets the last cards played
     * @returns {Array} - Array of Card objects which were played last
     */
    getLastPlayed() {
        return this.lastPlayed;
    }

    /**
     * Sets the origin position of the play area, the position is anchored in the middle
     * @param {integer} x - The x position of the play area
     * @param {integer} y - The y position of the play area
     */
    setPos(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Sets the scene for the play area
     * @param {Scene} scene - The scene for the which the play area belongs to
     */
    setScene(scene) {
        this.scene = scene;
    }

    /**
     * Sets the width of the play area
     * @param {integer} width - The desired width of the play area
     */
    setWidth(width) {
        this.width = width;
    }

    /**
     * Sets the height of the play area
     * @param {integer} height - The desired height of the play area
     */
    setHeight(height) {
        this.height = height;
    }
}
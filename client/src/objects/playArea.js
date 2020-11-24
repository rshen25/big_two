/*
 *
 */

import Card from './card.js';

export default class PlayArea {
    constructor(scene, x, y, width, height) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.lastPlayed = [];
    }

    addCards(cards) {
        let numCards = cards.length;
        for (let i = 0; i < numCards; i++) {
            this.lastPlayed.push(cards[i]);
        }
        return true;
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
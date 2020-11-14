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

/*    renderHand(scene, x, y) {
        let hand = scene.add.zone(700, 375, 900, 250).setRectangleDropZone(900, 250);
        hand.setData({ cards: 0 });
        return hand;
    }*/

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
}
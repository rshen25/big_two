/**
 * A Hand object for the client is a container to hold the playing cards and to restrict them within
 * a specified zone. Each player should have one hand total.
 */

export default class Hand {
    constructor() {
        this.hand = [];
        this.zone = null;
    }

    renderHand(scene, x, y) {
        let hand = scene.add.zone(700, 375, 900, 250).setRectangleDropZone(900, 250);
        hand.setData({ cards: 0 });
        return hand;
    }

    renderOutline(hand) {
        let handOutline = this.scene.add.graphics();
        handOutline.lineStyle(4, 0xffffff);
        handOutline.strokeRect(hand.x - hand.input.hitArea.width / 2,
            hand.y - hand.input.hitArea.height / 2,
            hand.input.hitArea.width,
            hand.input.hitArea.height
        )
    }

    /**
     * Adds a card to the hand
     * @param {any} card - A Card object
     */
    add(card) {
        this.hand.push(card);
    }
}
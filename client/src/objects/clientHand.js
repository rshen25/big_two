/**
 * A Hand object for the client is a container to hold the playing cards and to restrict them within
 * a specified zone. Each player should have one hand total.
 */

import Hand from '../../../src/objects/hand.js';

export default class ClientHand extends Hand {
    constructor(scene, x, y) {
        super();
        this.scene = scene;
        this.x = x;
        this.y = y;
    }

    renderHand() {
        let hand = this.scene.add.zone(700, 375, 900, 250).setRectangleDropZone(900, 250);
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
}
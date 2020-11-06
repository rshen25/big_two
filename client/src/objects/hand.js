/**
 * A Hand object is a container to hold the playing cards and to restrict them within
 * a specified zone. Each player should have one hand total.
 */

export default class Hand {
    constructor(scene) {
        this.scene = scene;
    }

    renderHand() {
        let hand = this.scene.add.zone(700, 375, 900, 250).setRectangleDropZone(900, 250);
        dropZone.setData({ cards: 0 });
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
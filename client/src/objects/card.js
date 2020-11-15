/**
 * A Card Object to represent a playing card for the client
 */

export default class Card extends Phaser.GameObjects.Image{
    constructor(scene, x, y, texture, frame, value, suit, suitValue) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        this.setInteractive();
        this.setScale(0.45, 0.45);
        this.value = value;
        this.suit = suit;
        this.suitValue = suitValue;
        this.isSelected = false;

        this.on('pointerdown', this.onClick,this); 
    }

    onClick() {
        if (this.isSelected) {
            // Show that the card is no longer selected by moving it back into its
            // original position
            this.setY(this.y + 50);

            this.isSelected = false;
        }
        else {
            // Elevate the card to show that it is selected
            this.setY(this.y - 50);

            this.isSelected = true;
        }
    }
}
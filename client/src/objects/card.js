/**
 * A Card Object to represent a playing card for the client
 */

export default class Card extends Phaser.GameObjects.Image{
    constructor(scene, x, y, texture, frame, value, suit, suitValue) {
        super(scene, x, y, texture, frame);
        this.value = value;
        this.suit = suit;
        this.suitValue = suitValue;
        this.isSelected = false;

        scene.add.existing(this);
        this.setInteractive();
        this.setScale(0.45, 0.45);
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

    /**
     * Compares the current card with another card and sees which one is higher, returns true
     * if the current card is higher, false otherwise
     * @param {Card} otherCard - The other card object to compare against
     * @returns {boolean} - Returns true if card is higher than other card, false otherwise
     */
    compareTo(otherCard) {
        if (this.value < otherCard.value) {
            return false;
        }
        if (this.value == otherCard.value && this.suitValue < otherCard.suitValue) {
            return false;
        }
        return true;
    }

    stringify() {
        let data = {
            value: this.value,
            suit: this.suit,
            suitValue: this.suitValue
        };

        return data;
    }
}
/**
 * The main scene used for the game of Big Two
 */
import Card from '../objects/card.js';
import Hand from '../objects/hand.js';

export default class BigTwo extends Phaser.Scene {
    constructor() {
        super({
            key: 'BigTwo'
        });
    }

    preload() {
        // Pre-load in the playing cards into the client
        this.load.atlasXML('playingCards', 'src/assets/sprites/playingCards.png', 'src/assets/sprites/playingCards.xml');
    }

    create() {

        // Create a deal cards button to start dealing cards to the players
        this.dealText = this.add.text(75, 350, ['DEAL CARDS'])
            .setFontSize(18).setFontFamily('Trebuchet MS')
            .setColor('#00ffff').setInteractive();

        this.dealText.on('pointerdown', this.dealCards);

        // Test cards
        let playingCardTexture = this.textures.get('playingCards');

        let frames = playingCardTexture.getFrameNames();

        this.card1 = this.add.image(200, 200, 'playingCards', frames[5])
            .setScale(0.75, 0.75).setInteractive();
        this.card2 = this.add.image(200, 400, 'playingCards', frames[10])
            .setScale(0.75, 0.75).setInteractive();
        this.input.setDraggable(this.card1);
        this.input.setDraggable(this.card2);

        this.input.on('drag', this.onDragCard);

        this.hand = new Hand(this);
        this.handZone = this.hand.renderHand();
        this.outline = this.hand.renderOutline(this.handZone);
    }

    update() {

    }

    dealCards() {
        console.log("Cards Dealt");
        let playingCardTexture = this.scene.textures.get('playingCards');

        let frames = playingCardTexture.getFrameNames();
        for (let i = 0; i < 5; i++) {
            let playerCard = new Card(11, 'Clubs', frames[6], this.scene);
            playerCard.render(475 + (i * 50), 400, 'playingCards', frames[6]);
        }
    }

    onDragCard(pointer, gameObject, dragX, dragY) {
        gameObject.x = dragX;
        gameObject.y = dragY;
    }

}
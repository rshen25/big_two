/**
 * The main scene used for the game of Big Two
 */

export default class BigTwo extends Phaser.Scene {
    constructor() {
        super({
            key: 'BigTwo'
        });
    }

    preload() {
        // Pre-load in the playing cards into the client
        this.load.atlasXML('playingCards', 'assets/sprites/playingCards.png', 'assets/sprites/playingCards.xml');
    }

    create() {
        // Create a deal cards button to start dealing cards to the players
        this.dealText = this.add.text(75, 350, ['DEAL CARDS'])
            .setFontSize(18).setFontFamily('Trebuchet MS')
            .setColor('#00ffff').setInteractive();

        this.dealText.on('pointerdown', dealCards);

        // Test cards
        let playingCardTexture = this.texture.get('playingCards');
        let frames = playingCardTexture.getFrameNames();

        this.add.image(200, 200, 'playingCards', frames[5]);
        this.add.image(200, 400, 'playingCards', frames[10]);

    }

    update() {

    }

    dealCards() {
        console.log("Cards Dealt");
    }
}
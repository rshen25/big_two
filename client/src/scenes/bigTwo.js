/**
 * The main scene used for the game of Big Two
 */
import io from 'socket.io-client';
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
        this.load.atlasXML('playingCards',
            'src/assets/sprites/playingCards.png',
            'src/assets/sprites/playingCards.xml');

        // Pre-load the card backs into the client
        this.load.atlasXML('cardBacks',
            'src/assets/sprites/playingCardBacks.png',
            'src/assets/sprites/playingCardBacks.xml')
    }

    create() {
        this.isPlayerA = false;
        this.opponentCards = [];

        this.hand = new Hand(this);
        this.handZone = this.hand.renderHand();
        this.outline = this.hand.renderOutline(this.handZone);

        // Temporary Server code
        this.socket = io("http://localhost:3000");

        this.socket.on('connect', function () {
            console.log('Connected!');
        });

        this.socket.on('isPlayerA', function () {
            this.isPlayerA = true;
        })

        let self = this;

        // Create a deal cards button to start dealing cards to the players
        this.dealText = this.add.text(75, 350, ['DEAL CARDS'])
            .setFontSize(18).setFontFamily('Trebuchet MS')
            .setColor('#00ffff').setInteractive();

        //this.dealText.on('pointerdown', this.dealCards);
        this.dealText.on('pointerdown', function () {
            self.socket.emit('dealCards');
        });

        // Test cards
        let playingCardTexture = this.textures.get('playingCards');

        let frames = playingCardTexture.getFrameNames();

        this.card1 = this.add.image(200, 200, 'playingCards', frames[5])
            .setScale(0.75, 0.75).setInteractive();
        this.card2 = this.add.image(200, 400, 'playingCards', frames[10])
            .setScale(0.75, 0.75).setInteractive();
        this.input.setDraggable(this.card1);
        this.input.setDraggable(this.card2);

        // TODO: Needs Refactoring
        this.input.on('drag', this.onDragCard);

        this.input.on('dragstart', function (pointer, gameObject) {
            gameObject.setTint(0xff69b4);
            this.scene.children.bringToTop(gameObject);
        })

        this.input.on('dragend', function (pointer, gameObject, dropped) {
            gameObject.setTint();
            if (!dropped) {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        })

        this.input.on('drop', function (pointer, gameObject, handZone) {
            handZone.data.values.cards++;
            gameObject.x = (handZone.x - 350) + (handZone.data.values.cards * 50);
            gameObject.y = handZone.y;
            gameObject.disableInteractive();
        })

    }

    update() {

    }

    dealCards(socket) {
        socket.emit('dealCards');
        console.log("Client: Cards Dealt");
        /*
        let playingCardTexture = this.scene.textures.get('playingCards');

        let frames = playingCardTexture.getFrameNames();
        for (let i = 0; i < 5; i++) {
            let playerCard = new Card(11, 'Clubs', 1, 'playingCards', frames[6], this.scene);
            playerCard.render(475 + (i * 50), 400);
        }
        */
    }

    onDragCard(pointer, gameObject, dragX, dragY) {
        gameObject.x = dragX;
        gameObject.y = dragY;
    }

    onConnect() {
        console.log('Connected!');
    }
}
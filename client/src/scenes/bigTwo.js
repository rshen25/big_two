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
        this.isHost = false;
        this.opponentCards = [];
        this.otherPlayers = 0;
        this.hand = new Hand();
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
        let self = this;

        // Create player hand
        this.hand.zone = this.createHand(this, window.innerWidth / 2, window.innerHeight - 100,
            window.innerWidth - 600, 200);

        // Create zones for other player hands
        // west player
        let westHand = this.createHand(this, 100, window.innerHeight / 2,
            200, window.innerHeight - 200);

        // north player
        let northHand = this.createHand(this, window.innerWidth / 2, 100,
            window.innerWidth - 600, 200);

        // east player
        let eastHand = this.createHand(this, window.innerWidth - 100, window.innerHeight / 2,
            200, window.innerHeight - 200);

        // Temporary Server code
        this.socket = io("http://localhost:3000");

        this.socket.on('connect', this.onConnect);

        this.socket.on('otherPlayerJoined', function (id) {
            this.otherPlayers += 1;
            console.log(`User ${id} joined.`);
        });

        this.socket.on('otherPlayerDisconnect', function (id) {
            this.otherPlayers -= 1;
            console.log(`User ${id} left.`);
        });

        /**
         * Get the player's hand from the server and add the cards to the hand and 
         * draw them onto the scene 
         */
        this.socket.on('handDealt', function (data) {
            console.log(self.hand);
            console.log(data);
            let spriteName;
            for (let i = 0; i < data.length; i++) {
                switch (data[i].value) {
                    case 1:
                        spriteName = `card${data[i].suit}A.png`;
                        break;
                    case 11:
                        spriteName = `card${data[i].suit}J.png`;
                        break;
                    case 12:
                        spriteName = `card${data[i].suit}Q.png`;
                        break;
                    case 13:
                        spriteName = `card${data[i].suit}K.png`;
                        break;
                    default:
                        spriteName = `card${data[i].suit}${data[i].value}.png`;
                        break;
                }
                let card = new Card(data[i].value, data[i].suit, data[i].suitValue,
                    'playingCards', spriteName, self);
                card.render((self.hand.zone.x - 350) + (self.hand.zone.data.values.cards * 20),
                    self.hand.zone.y);
                self.hand.zone.data.values.cards++;
                self.hand.add(card);
            }
        });

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
            gameObject.x = (handZone.x - 350) + (handZone.data.values.cards * 25);
            gameObject.y = handZone.y;
            gameObject.disableInteractive();
        })

        console.log(this.hand);
    }

    update() {

    }

    dealCards(socket) {
        socket.emit('dealCards');
        console.log("Client: Cards Dealt");
    }

    onDragCard(pointer, gameObject, dragX, dragY) {
        gameObject.x = dragX;
        gameObject.y = dragY;
        console.log(this.hand);
    }

    onConnect() {
        console.log('Connected!');
    }

    createHand(scene, x, y, width, height) {
        let zone = scene.add.zone(x,
            y,
            width,
            height).setRectangleDropZone(width, height);
        zone.setData({ cards: 0 });
        scene.add.graphics()
            .lineStyle(4, 0xffffff)
            .strokeRect(zone.x - zone.input.hitArea.width / 2,
                zone.y - zone.input.hitArea.height / 2,
                zone.input.hitArea.width,
                zone.input.hitArea.height
            );

        return zone;
    }
}
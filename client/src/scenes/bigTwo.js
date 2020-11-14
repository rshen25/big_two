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
        this.playerNumber = -1;
        this.otherPlayers = 0;
    }

    preload() {
        // Pre-load in the playing cards into the client
        this.load.atlasXML('playingCards',
            'src/assets/sprites/playingCards.png',
            'src/assets/sprites/playingCards.xml');

        // Pre-load the card backs into the client
        this.load.atlasXML('cardBacks',
            'src/assets/sprites/playingCardBacks.png',
            'src/assets/sprites/playingCardBacks.xml');
    }

    create() {
        let self = this;
        let width = this.scale.width;
        let height = this.scale.height;

        // Create the hands
        this.hand = new Hand(width / 2, height - 50, width * 0.75, 100);
        this.westHand = new Hand(50, height / 2, 100, height * 0.6);
        this.northHand = new Hand(width / 2, 50, width * 0.75, 100);
        this.eastHand = new Hand(width - 50, height / 2, 100, height * 0.6);

        // Draw player hand
        this.hand.renderOutline(this);

        // Create zones for other player hands
        // west player
        this.westHand.renderOutline(this);

        // north player
        this.northHand.renderOutline(this);

        // east player
        this.eastHand.renderOutline(this);

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

        this.socket.on('playerNumber', function (playerNumber) {
            this.playerNumber = playerNumber;
        });

        /**
         * Get the player's hand from the server and add the cards to the hand and 
         * draw them onto the scene 
         */
        this.socket.on('handDealt', function (data) {
            console.log(self.hand);
            console.log(data);
            let spriteName;
            let startX = self.hand.x - (self.hand.width / 2);
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
                card.render(
                    (startX) + (i * (self.hand.width / data.length)),
                    self.hand.y);
                self.hand.add(card);
            }
        });

        /**
         * Get the other player's hand sizes and draw the cards onto the scene
         */
        this.socket.on('handSizes', function (handSizes) {
            handSizes.splice(self.playerNumber, 1);
            console.log(handSizes);
            let key = 'cardBacks';
            let spriteName = 'cardBack_red1.png';
            if (handSizes.length >= 1) {
                // Add and draw west player hand
                let start = self.westHand.y - (self.westHand.height / 2);
                for (let i = 0; i < handSizes[0]; i++) {
                    let card = new Card(-1, -1, -1, key, spriteName, self)
                    card.render(self.westHand.x,
                        start + ((self.westHand.height / handSizes[0]) * i));
                    self.westHand.add(card);
                }
            }

            if (handSizes.length >= 2) {
                // Add and draw north player hand
                let start = self.northHand.x - (self.northHand.width / 2);
                for (let i = 0; i < handSizes[1]; i++) {
                    let card = new Card(-1, -1, -1, key, spriteName, self);
                    card.render(start + ((self.northHand.width / handSizes[1]) * i),
                        self.northHand.y)
                    self.northHand.add(card);
                }
            }
            if (handSizes.length >= 3) {
                // Add and draw east player hand
                let start = self.eastHand.y - (self.eastHand.height / 2);
                for (let i = 0; i < handSizes[2]; i++) {
                    let card = new Card(null, null, null, key, spriteName, self)
                    self.eastHand.add(card);
                    card.render(self.eastHand.x,
                        start + ((self.eastHand.height / handSizes[2]) * i));
                }
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

        // TODO: Needs Refactoring
        this.input.on('drag', this.onDragCard);

        this.input.on('dragstart', function (pointer, gameObject) {
            gameObject.setTint(0xff69b4);
            this.scene.children.bringToTop(gameObject);
        });

        this.input.on('dragend', function (pointer, gameObject, dropped) {
            gameObject.setTint();
            if (!dropped) {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        });

        this.input.on('drop', function (pointer, gameObject, handZone) {
            handZone.data.values.cards++;
            gameObject.x = (handZone.x - 350) + (handZone.data.values.cards * 25);
            gameObject.y = handZone.y;
            gameObject.disableInteractive();
        });
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
}
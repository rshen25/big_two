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
        this.cardsToBePlayed = [];
        this.lastPlayed = [];
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

        /*
         * Create zones for other player hands
         */
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
         * Create events for the scene to listen to
         */
        this.events.on('playCards', this.playCards, this);

        /**
         * Get the player's hand from the server and add the cards to the hand and 
         * draw them onto the scene 
         */
        this.socket.on('handDealt', function (data) {
            console.log(self.hand);
            console.log(data);
            let spriteName;
            let startX = self.hand.x - (self.hand.width / 2) + 30;
            for (let i = 0; i < data.length; i++) {
                switch (data[i].value) {
                    case 11:
                        spriteName = `card${data[i].suit}J.png`;
                        break;
                    case 12:
                        spriteName = `card${data[i].suit}Q.png`;
                        break;
                    case 13:
                        spriteName = `card${data[i].suit}K.png`;
                        break;
                    case 14:
                        spriteName = `card${data[i].suit}A.png`;
                        break;
                    case 15:
                        spriteName = `card${data[i].suit}2.png`;
                        break;
                    default:
                        spriteName = `card${data[i].suit}${data[i].value}.png`;
                        break;
                }

                let card = new Card(self,
                    (startX) + (i * (self.hand.width / (data.length + 1))),
                    self.hand.y,
                    'playingCards',
                    spriteName,
                    data[i].value,
                    data[i].suit,
                    data[i].suitValue);
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
                let start = self.westHand.y - (self.westHand.height / 2) + 30;
                for (let i = 0; i < handSizes[0]; i++) {
                    let card = new Card(self,
                        self.westHand.x,
                        start + ((self.westHand.height / (handSizes[0] + 1)) * i),
                        key,
                        spriteName,
                        -1, -1, -1)
                        .setAngle(-90);
                    card.disableInteractive();
                    self.westHand.add(card);
                }
            }

            if (handSizes.length >= 2) {
                // Add and draw north player hand
                let start = self.northHand.x - (self.northHand.width / 2) + 30;
                for (let i = 0; i < handSizes[1]; i++) {
                    let card = new Card(self,
                        start + ((self.northHand.width / (handSizes[1] + 1)) * i),
                        self.northHand.y,
                        key,
                        spriteName,
                        -1, -1, -1)
                        .setAngle(180);
                    card.disableInteractive();
                    self.northHand.add(card);
                }
            }
            if (handSizes.length >= 3) {
                // Add and draw east player hand
                let start = self.eastHand.y - (self.eastHand.height / 2) + 30;
                for (let i = 0; i < handSizes[2]; i++) {
                    let card = new Card(self,
                        self.eastHand.x,
                        start + ((self.eastHand.height / (handSizes[2] + 1)) * i),
                        key,
                        spriteName,
                        -1, -1, -1)
                        .setAngle(90);
                    card.disableInteractive();
                    self.eastHand.add(card);
                }
            }
        });

        // Create a deal cards button to start dealing cards to the players
        this.dealText = this.add.text(width / 2, height / 2, ['DEAL CARDS'])
            .setFontSize(18).setFontFamily('Trebuchet MS')
            .setColor('#00ffff').setInteractive();

        this.dealText.on('pointerdown', function () {
            self.socket.emit('dealCards');
        });

        // Create the play cards button
        this.playBtn = this.add.text(width - 70, height - 100, ['PLAY'])
            .setFontSize(18).setFontFamily('Trebuchet MS')
            .setColor('#00ffff').setInteractive();

        // Create the pass turn button
        this.passBtn = this.add.text(width - 70, height - 50, ['PASS'])
            .setFontSize(18).setFontFamily('Trebuchet MS')
            .setColor('#00ffff').setInteractive();

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

    /**
     * Attempts to play the cards the player has selected, if valid a request will be 
     * sent to the server for further validation before it will actually be played
     */
    playCards() {
        // Get selected cards
        let selectedCards = this.hand.getSelectedCards();

        // TODO: Check if the cards can be played
         // If it can be played, send it to the server for further processing
        if (this.checkIfValidPlayHand(selectedCards)) {
            this.socket.emit('playedCards', selectedCards);
        }
        // Else, display message - Invalid Play
        else {
            console.log('Invalid Play');
        }
    }

    /**
     * Checks if the current cards selected to be played is a valid play
     * @returns {boolean} - True if valid, false otherwise
     */
    checkIfValidPlayHand(selectedCards) {
        let numCards = selectedCards.length;
        // If nothing was played last or everyone has passed
        if (this.lastPlayed.length == 0) {
            return true;
        }
        if (numCards == this.lastPlayed.length) {
            // Check if the play is a higher value than the last played
        }

        // Check if it's quad or a bomb
        return true;
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
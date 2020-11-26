/**
 * The main scene used for the game of Big Two
 */
import io from 'socket.io-client';
import Card from '../objects/card.js';
import Hand from '../objects/hand.js';
import Rules from '../objects/gameRules.js';
import PlayArea from '../objects/playArea.js';

export default class BigTwo extends Phaser.Scene {
    constructor() {
        super({
            key: 'BigTwo'
        });
        this.isHost = false;
        this.playerNumber = -1;
        this.otherPlayers = 0;
        this.cardsToBePlayed = [];
        this.westHand = null;
        this.northHand = null;
        this.eastHand = null;
        this.hands = [];
        this.gameRules = new Rules();
        this.turn = false;
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
        console.log(this.constructor.name);
        let self = this;
        let width = this.scale.width;
        let height = this.scale.height;

        // Create play area
        this.playArea = new PlayArea(this, width / 2, height / 2,
            width / 2 - 100, height / 2 - 100);

        // Create the hands
        this.hand = new Hand(width / 2, height - 50, width * 0.75, 100);
        this.westHand = new Hand(50, height / 2, 100, height * 0.6);
        this.northHand = new Hand(width / 2, 50, width * 0.75, 100);
        this.eastHand = new Hand(width - 50, height / 2, 100, height * 0.6);

        this.hands.push(this.westHand);
        this.hands.push(this.northHand);
        this.hands.push(this.eastHand);

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

        // Create a deal cards button to start dealing cards to the players
        this.dealText = this.add.text(width / 2, height / 2, ['DEAL CARDS'])
            .setFontSize(18).setFontFamily('Trebuchet MS')
            .setColor('#00ffff');

        this.dealText.on('pointerdown', function () {
            self.socket.emit('dealCards');
        });

        /**
         * Create the play cards button
         */
        this.playBtn = this.add.text(width - 70, height - 100, ['PLAY'])
            .setFontSize(18).setFontFamily('Trebuchet MS');

        this.playBtn.on('pointerdown', this.playCards, this);


        /**
         * Create the pass turn button
         */
        this.passBtn = this.add.text(width - 70, height - 50, ['PASS'])
            .setFontSize(18).setFontFamily('Trebuchet MS');

        this.passBtn.on('pointerdown', this.passTurn, this);

        this.togglePlayPassButtons();

        /**
         * Server listener code
         */
        this.socket = io("http://localhost:3000");

        this.socket.on('connect', this.onConnect);

        this.socket.on('playerNumber', function (playerNumber) {
            self.playerNumber = playerNumber;
            if (self.playerNumber == 1) {
                self.dealText.setInteractive();
            }
        });

        this.socket.on('otherPlayerJoined', function (id) {
            this.otherPlayers += 1;
            console.log(`User ${id} joined.`);
        });

        this.socket.on('otherPlayerDisconnect', function (id) {
            this.otherPlayers -= 1;
            console.log(`User ${id} left.`);
        });

        this.socket.on('otherPlayedCards', (cards, id, playerNumber) => {
            this.otherPlayedCards(cards, id, playerNumber);
        });

        this.socket.on('playedCards', (response) => {
            this.validPlay(response);
        });

        this.socket.on('playerNumber', function (playerNumber) {
            self.playerNumber = playerNumber;
            let pNumber = playerNumber;
            let players = [];
            for (let i = 1; i < 4; i++) {
                pNumber++;
                if (pNumber % 5 == 0) {
                    pNumber = 1;
                }
                players.push(pNumber);
            }

            self.westHand.playerNumber = players[0];
            self.northHand.playerNumber = players[1];
            self.eastHand.playerNumber = players[2];
        });

        this.socket.on('nextTurn', (id, lastPlayed) => { this.checkIfTurn(id, lastPlayed); });

        // Get the player's hand from the server and add the cards to the hand and 
        // draw them onto the scene 
        this.socket.on('handDealt', function (data) {
            console.log(self.hand);
            console.log(data);
            let spriteName;
            let startX = self.hand.x - (self.hand.width / 2) + 30;
            for (let i = 0; i < data.length; i++) {
                spriteName = self.getSpriteNameOfCard(data[i].value, data[i].suit);

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

        // Get the other player's hand sizes and draw the cards onto the scene
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
    }

    update() {

    }

    /**
     * Sends a message to the server to make it deal the deck of cards to all players in
     * the current game
     * @param {Socket} socket - The socket information of this client
     */
    dealCards(socket) {
        socket.emit('startGame');
        console.log("Client: Cards Dealt");
    }

    /**
     * Attempts to play the cards the player has selected, if valid a request will be 
     * sent to the server for further validation before it will actually be played
     */
    playCards() {
        // Get selected cards
        let selectedCards = this.hand.getSelectedCards();

         // If it can be played, send it to the server for further processing
        if (this.gameRules.checkIfValidPlayHand(selectedCards)) {
            // Prepare the card data to be sent to server
            let cards = [];

            for (let i = 0; i < selectedCards.length; i++) {
                cards.push(selectedCards[i].stringify());
            }

            this.socket.emit('playedCards', cards, this.socket.id, this.playerNumber,
                (response) => {
                    this.validPlay(response);
                });
            console.log('emited played cards to server');
            // Disable the hand
            this.hand.disableHand();
        }
        // else, display message - Invalid Play
        else {
            console.log('Invalid Play');
        }
    }

    /**
     * Remove the cards from the hand
     * @param {Array} cards
     */
    removeCards(cards) {
        if (cards.length != 0) {
            this.hand.findAndRemoveCards(cards);
            this.hand.enableHand();
        } 
    }

    /**
     * Passes the turn of the player and sends a message to the server of the passed turn
     */
    passTurn() {
        this.turn = false;
        this.socket.emit('passTurn', this.socket.id, this.playerNumber);
    }

    /**
     * Toggles the play and pass buttons to on or off depending if it is the client's turn
     */
    togglePlayPassButtons() {
        if (this.turn) {
            this.playBtn.setInteractive();
            this.playBtn.setColor('#00ffff');
            this.passBtn.setInteractive();
            this.passBtn.setColor('#00ffff');
        }
        else {
            this.playBtn.disableInteractive();
            this.playBtn.setColor('#7d7d7d');
            this.passBtn.disableInteractive();
            this.passBtn.setColor('#7d7d7d');
        }
    }

    onConnect() {
        console.log('Connected!');
    }

    /**
     * Checks if the current turn is the clients
     * @param {integer} playerNumber - The current turn's player number
     * @param {Array} lastPlayed - The cards that were last played by a player
     */
    checkIfTurn(id, lastPlayed) {
        console.log(`Received: ${id}, ${lastPlayed}`);
        if (lastPlayed) {
            this.gameRules.setLastPlayed(lastPlayed);
        }
        this.gameRules.incrementTurn();

        // TODO: check for passing

        if (id == this.socket.id) {
            this.turn = true;
            // Enable the play and pass buttons
            this.togglePlayPassButtons();
            console.log('It is your turn!');
        }
    }

    /**
     * Removes the cards from the client's last play from its hand
     * @param {Array} cards - Array of cards the client has played
     */
    validPlay(cards) {
        let cardsToMove = this.hand.getSelectedCards();
        console.log(cards);
        if (cards === undefined || cards.length == 0) {
            this.hand.enableHand();
        }
        else {
            this.gameRules.setLastPlayed(cards);
            this.gameRules.incrementTurn();
            console.log('valid play called');
            this.removeCards(cards);
            console.log('cards found and removed');

            // Add the cards to the play area
            this.playArea.addCards(cardsToMove);
            console.log(this.playArea.getLastPlayed());
            console.log(this.hand.getHand());

            this.turn = false;
            this.togglePlayPassButtons();
        }
    }

    /**
     * Finds the hand of the given player number
     * @param {integer} playerNumber - The player number we are looking for
     * @returns {Hand} - The hand of the corresponding player number
     */
    getHand(playerNumber) {
        for (let i = 0; i < this.hands.length; i++) {
            if (this.hands[i].playerNumber == playerNumber) {
                return this.hands[i];
            }
        }
        return null;
    }

    /**
     * When another player plays cards, it will remove the cards from their hand.
     * @param {Array} cards - An array of cards the player has played
     * @param {string} id - The socket id of the player who played the card
     * @param {integer} playerNumber - The player number of the other player
     */
    otherPlayedCards(cards, id, playerNumber) {
        if (playerNumber == this.playerNumber) {
            return;
        }
        // Find the hand with the corresponding player number
        let hand = this.getHand(playerNumber);
        if (!hand) {
            console.log(`Player ${playerNumber} not found`);
            return;
        }

        if (hand.isEmpty()) {
            console.log('Error: Hand is empty');
            return;
        }

        // Remove the cards from their hand
        let count = cards.length;
        for (let i = 0; i < count; i++) {
            hand.pop().destroy();
        }

        // Display the cards in the middle of the board
        if (cards) {
            let cardsToShow = [];
            // Create the new cards
            for (let i = 0; i < cards.length; i++) {
                let spriteName = this.getSpriteNameOfCard(cards[i].value, cards[i].suit);
                cardsToShow.push(new Card(this, 0, 0, 'playingCards',
                    spriteName,
                    cards[i].value,
                    cards[i].suit,
                    cards[i].suitValue).disableInteractive());
            }
            this.playArea.addCards(cardsToShow);
        }

        console.log(`${id} played ${cards}`);
        console.log(`Success, cards removed from ${playerNumber}'s hand`);
    }

    /**
     * Determines the name of the card sprite used to show the card in the scene 
     * @param {integer} value : The value of the card based on the game rules
     * @param {string} suit : The suit of the card
     * @returns {string} : The name of the sprite or image file
     */
    getSpriteNameOfCard(value, suit) {
        let spriteName;
        switch (value) {
            case 11:
                spriteName = `card${suit}J.png`;
                break;
            case 12:
                spriteName = `card${suit}Q.png`;
                break;
            case 13:
                spriteName = `card${suit}K.png`;
                break;
            case 14:
                spriteName = `card${suit}A.png`;
                break;
            case 17:
                spriteName = `card${suit}2.png`;
                break;
            default:
                spriteName = `card${suit}${value}.png`;
                break;
        }
        return spriteName;
    }
}